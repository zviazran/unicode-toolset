import React, { useRef, useState } from "react";
import styles from "./IsThisYourString.module.css";

// Dummy transformation functions
const shiftBytes = (input: string, shift: number): string => {
  return Array.from(input)
    .map((char) => String.fromCharCode((char.charCodeAt(0) + shift) % 65536))
    .join("");
};

const shiftBits = (input: string, shift: number): string => {
  return Array.from(input)
    .map((char) => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(
        shift > 0 ? (code << shift) & 0xffff : code >> Math.abs(shift)
      );
    })
    .join("");
};

const decodingStrategies: { name: string; transform: (input: string) => string }[] = [
  { name: "UTF-16 → byte shift by 1", transform: (input) => shiftBytes(input, 1) },
  { name: "UTF-16 → byte shift by 2", transform: (input) => shiftBytes(input, 2) },
  { name: "UTF-8 → bit shift left 1", transform: (input) => shiftBits(input, 1) },
  { name: "UTF-8 → bit shift right 1", transform: (input) => shiftBits(input, -1) },
];

const IsThisYourString: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  return (
    <div className={styles.isThisYourString}>
      <h1>Is This Your String?</h1>
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
        {decodingStrategies.map(({ name, transform }) => (
          <div key={name} className={styles.resultRow}>
            <div className={styles.resultName}>{name}</div>
            <div className={styles.resultValue}>{transform(input)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IsThisYourString;
