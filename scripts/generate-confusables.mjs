import fs from 'fs';
import https from 'https';
import readline from 'readline';
import path from 'path';
import zlib from 'zlib';

const CONFUSABLES_URL = 'https://www.unicode.org/Public/security/latest/confusables.txt';
const OUTPUT_JSON = './public/confusables.json';
const OUTPUT_GZIP = './public/confusables.json.gz';

function fetchLines(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`Failed: ${res.statusCode}`));
      const lines = [];
      const rl = readline.createInterface({ input: res });
      rl.on('line', (line) => lines.push(line));
      rl.on('close', () => resolve(lines));
    }).on('error', reject);
  });
}

function parseConfusables(lines) {
  const forwardMap = {};
  const reverseMap = {};

  for (const line of lines) {
    const trimmed = line.split('#')[0].trim();
    if (!trimmed) continue;

    const [srcSeq, targetSeq] = trimmed.split(';').map(s => s.trim());
    const srcChars = srcSeq.split(' ').map(cp => String.fromCodePoint(parseInt(cp, 16))).join('');
    let targetChars = targetSeq.split(' ').map(cp => String.fromCodePoint(parseInt(cp, 16))).join('');

    if (targetChars === 'rn') targetChars = 'm';

    // forward
    if (!forwardMap[srcChars]) forwardMap[srcChars] = [];
    forwardMap[srcChars].push(targetChars);

    // reverse
    if (!reverseMap[targetChars]) reverseMap[targetChars] = [];
    reverseMap[targetChars].push(srcChars);
  }

  // Now merge into one
  const combinedMap = {};

  for (const key in forwardMap) {
    if (!combinedMap[key]) combinedMap[key] = [];
    combinedMap[key].push(...forwardMap[key]);
  }

  for (const key in reverseMap) {
    if (key.length > 1) continue; // no mecanizem to handle multi-character targets

    if (!combinedMap[key]) combinedMap[key] = [];
    combinedMap[key].push(...reverseMap[key]);
  }

  // Deduplicate
  for (const key in combinedMap) {
    combinedMap[key] = [...new Set(combinedMap[key])];
  }

  return combinedMap;
}

async function main() {
  const confusablesLines = await fetchLines(CONFUSABLES_URL);
  const confusablesMap = parseConfusables(confusablesLines);

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });

  const jsonData = JSON.stringify(confusablesMap);

  fs.writeFileSync(OUTPUT_JSON, jsonData);
  console.log(`Saved flattened confusables map to ${OUTPUT_JSON}`);

  const gzipped = zlib.gzipSync(jsonData);
  fs.writeFileSync(OUTPUT_GZIP, gzipped);
  console.log(`Saved gzipped confusables map to ${OUTPUT_GZIP}`);
}

main().catch(console.error);
