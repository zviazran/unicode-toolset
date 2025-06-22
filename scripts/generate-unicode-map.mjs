import fs from 'fs';
import https from 'https';
import readline from 'readline';
import path from 'path';

const OUTPUT_PATH = './public/unicode-min.json';
const UNICODE_DATA_URL = 'https://www.unicode.org/Public/UNIDATA/UnicodeData.txt';
const SCRIPTS_URL = 'https://www.unicode.org/Public/UNIDATA/Scripts.txt';

// Download helper
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

// Short name generator
function shortName(name) {
  return name
    .replace(/[-_]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0]?.toUpperCase())
    .join('');
}

// Parse Scripts.txt into map
function parseScripts(lines) {
  const scriptMap = {};
  for (const line of lines) {
    const trimmed = line.split('#')[0].trim();
    if (!trimmed) continue;
    const [range, script] = trimmed.split(';').map(s => s.trim());
    let [start, end] = range.split('..');
    const from = parseInt(start, 16);
    const to = end ? parseInt(end, 16) : from;
    for (let cp = from; cp <= to; cp++) {
      scriptMap[cp] = script;
    }
  }
  return scriptMap;
}

// MAIN
const [unicodeLines, scriptsLines] = await Promise.all([
  fetchLines(UNICODE_DATA_URL),
  fetchLines(SCRIPTS_URL),
]);

const scriptMap = parseScripts(scriptsLines);
const data = {};

for (const line of unicodeLines) {
  const parts = line.split(';');
  if (parts.length < 3) continue;

  const code = parseInt(parts[0], 16);
  const hex = parts[0].toUpperCase();
  const name = parts[1];
  const category = parts[2];

  // Skip range markers only (e.g. <CJK Ideograph Extension A, First>)
  if (/^<.*,( First|Last)>$/.test(name)) continue;

  // Generate a short name
  const short = name.startsWith('<') ? name.replace(/[<>]/g, '') : shortName(name);

  data[hex] = {
    short,
    long: name,
    category,
    script: scriptMap[code] || 'Unknown',
  };
}


fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data));
console.log(`Saved ${Object.keys(data).length} codepoints to ${OUTPUT_PATH}`);
