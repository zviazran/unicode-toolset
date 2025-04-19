import React, { useRef, useState } from "react";
import styles from "./IsThisYourString.module.css";

const offsetUtf8Bytes = (input: string, offset: number): string => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);

  const shiftedBytes = bytes.map(b => (b + offset) % 256);

  try {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    return decoder.decode(new Uint8Array(shiftedBytes));
  } catch {
    return "";
  }
};

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

const offsetUtf16Bytes = (input: string, offset: number): string => {
  const buf = new ArrayBuffer(input.length * 2);
  const view = new DataView(buf);

  // Write the string as UTF-16 (2 bytes per char)
  for (let i = 0; i < input.length; i++) {
    view.setUint16(i * 2, input.charCodeAt(i), true); // little endian
  }

  // Corrupt the individual bytes (not code units)
  for (let i = 0; i < buf.byteLength; i++) {
    const original = view.getUint8(i);
    view.setUint8(i, (original + offset) % 256);
  }

  // Read back as UTF-16
  const corruptedView = new Uint16Array(buf);
  return String.fromCharCode(...corruptedView);
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

const truncateUtf16To8bit = (input: string): string => {
  return Array.from(input)
    .map(c => String.fromCharCode(c.charCodeAt(0) & 0xff))
    .join('');
};

const latin1ToUtf8 = (input: string): string => {
  const bytes = Uint8Array.from([...input].map(c => c.charCodeAt(0)));
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
};


const decodingStrategies: { name: string; transform: (input: string) => string }[] = [
  { name: "UTF8 → byte shift left 1", transform: (input) => offsetUtf8Bytes(input, 1) },
  { name: "UTF8 → byte shift right 1", transform: (input) => offsetUtf8Bytes(input, -1) },
  { name: "UTF8 → double Utf8 encoding", transform: decodeDoubleUtf8Encoding },
  { name: "UTF8 → decoded as UTF16", transform: utf8BytesAsUtf16 },

  { name: "UTF16 → byte shift by 1", transform: (input) => offsetUtf16Bytes(input, 1) },
  { name: "UTF16 → endianness swap", transform: swapUtf16Endianness },
  { name: "UTF16 → double Utf16 encoding", transform: decodeDoubleUtf16Encoding },
  { name: "UTF16 → keep low byte only", transform: truncateUtf16To8bit },
  { name: "UTF16 → decoded as UTF8", transform: utf16BytesAsUtf8 },

  { name: "Latin-1 → UTF-8 recovery", transform: latin1ToUtf8 },
];

const IsThisYourString: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  return (
    <div className={styles.isThisYourString}>
      <h1>Was This Your Text?</h1>
      <div className={styles.description}>
        <p>Enter your corrupted text and maybe we can reverse the damage. Is one of them your original?</p>
      </div>

      <textarea
          className={styles.textBox}
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className={styles.results}>
          {decodingStrategies
            .map(({ name, transform }) => {
              const output = transform(input);
              return { name, output };
            })
            .filter(({ output }) => output && output !== input && ((output.match(/[\uDC00-\uDFFF]/g)?.length ?? 0) <= output.length / 2))
            .map(({ name, output }) => (
              <div key={name} className={styles.resultRow}>
                <div className={styles.resultName}>{name}</div>
                <div className={styles.resultValue}>{output}</div>
              </div>
            ))}
        </div>
    </div>
  );
};

export default IsThisYourString;
