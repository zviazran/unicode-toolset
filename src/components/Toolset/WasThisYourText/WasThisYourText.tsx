import React, { useRef, useState } from "react";
import styles from "./WasThisYourText.module.css";


const swapUtf16Endianness = (input: string): string => {
  const output: string[] = [];

  for (const char of input) {
    const code = char.charCodeAt(0);
    const hi = (code & 0xff00) >> 8;
    const lo = code & 0x00ff;
    const swapped = (lo << 8) | hi;
    output.push(String.fromCharCode(swapped));
  }

  return output.join("");
};

const decodeDoubleUtf8Encoding = (input: string): string => {
  const byteValues = [...input].map(char => char.charCodeAt(0));
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(byteValues));
  } catch {
    return "";
  }
};

const utf8BytesAsUtf16 = (input: string): string => {
  const bytes = new TextEncoder().encode(input);
  const codeUnits = [];

  for (let i = 0; i < bytes.length - 1; i += 2) {
    codeUnits.push(bytes[i] | (bytes[i + 1] << 8)); // little-endian
  }

  return String.fromCharCode(...codeUnits);
};

const decodeDoubleUtf16Encoding = (input: string): string => {
  const byteArray = [];

  for (let i = 0; i < input.length; i++) {
    const codeUnit = input.charCodeAt(i);
    const lo = codeUnit & 0xff;
    const hi = (codeUnit >> 8) & 0xff;
    byteArray.push(lo, hi);
  }

  const codeUnits = [];
  for (let i = 0; i < byteArray.length - 1; i += 2) {
    codeUnits.push(byteArray[i] | (byteArray[i + 1] << 8));
  }

  return String.fromCharCode(...codeUnits);
};

const utf16BytesAsUtf8 = (input: string): string => {
  const bytes: number[] = [];

  for (const c of input) {
    const code = c.charCodeAt(0);
    bytes.push(code & 0xff, (code >> 8) & 0xff); // little-endian
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));
};

const latin1ToUtf8 = (input: string): string => {
  const bytes = Uint8Array.from([...input].map(c => c.charCodeAt(0)));
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
};


const decodingAttempts: { name: string; transform: (input: string) => string }[] = [
  { name: "UTF8 → double Utf8 encode", transform: decodeDoubleUtf8Encoding },
  { name: "UTF8 → decoded as UTF16", transform: utf8BytesAsUtf16 },

  { name: "UTF16 → endianness swap", transform: swapUtf16Endianness },
  { name: "UTF16 → double Utf16 encoding", transform: decodeDoubleUtf16Encoding },
  { name: "UTF16 → decoded as UTF8", transform: utf16BytesAsUtf8 },

  { name: "Latin-1 → UTF8 recovery", transform: latin1ToUtf8 },
];

const WasThisYourText: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("栀攀氀氀漀 眀漀爀氀搀℀");

  return (
    <div className={styles.wasThisYourText}>
      <h1>Was This Your Text?</h1>
      <div className={styles.description}>
        <p>Enter your corrupted text and maybye we can find how it happend. Is one of them your original?</p>
      </div>

      <textarea
          className={styles.textBox}
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

      <div className={styles.resultsTableContainer}>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Decoding Attempt</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
            {decodingAttempts
              .map(({ name, transform }) => {
                const output = transform(input);
                return { name, output };
              })
              .filter(({ output }) =>
                output && output !== input &&
                ((output.match(/[\uDC00-\uDFFF]/g)?.length ?? 0) <= output.length / 2)
              )
              .map(({ name, output }) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{output}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default WasThisYourText;
