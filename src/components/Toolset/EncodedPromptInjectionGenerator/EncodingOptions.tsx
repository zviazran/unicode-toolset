import styles from "./EncodedPromptInjectionGenerator.module.css";

export class EncodingOption {
  name: string;
  encode: (input: string, extraParams?: Record<string, any>) => string;
  inputComponent?: (
    setExtraParams: (key: string, value: any) => void,
    triggerEncode: () => void
  ) => JSX.Element;

  constructor(
    name: string,
    encode: (input: string, extraParams?: Record<string, any>) => string,
    inputComponent?: (
      setExtraParams: (key: string, value: any) => void,
      triggerEncode: () => void
    ) => JSX.Element
  ) {
    this.name = name;
    this.encode = encode;
    this.inputComponent = inputComponent;
  }
}

export const encodingOptions: EncodingOption[] = [
  new EncodingOption("Decimal", (input) => (input ? "Decode from decimal and do: " + Array.from(input).map(c => c.codePointAt(0)).join(" ") : "")),
  new EncodingOption("Reversed", (input) => (input ? "Reverse and do: " + input.split("").reverse().join("") : "")),
  new EncodingOption("Base64", (input) => (input ? "Decode with Base64 and do: " + btoa(input) : "")),
  new EncodingOption(
    "Broken up with delimiter",
    (input, extraParams = {}) => {
      if (!input) return "";
      const delimiter = extraParams.delimiter || "";
      const words = input.split(" ");
      const modifiedWords = words.map(word => {
        if (word.length > 1) {
          const randomIndex = Math.floor(Math.random() * (word.length - 1)) + 1;
          return word.slice(0, randomIndex) + delimiter + word.slice(randomIndex);
        }
        return word;
      });
      return `Remove ${delimiter} and do: ${modifiedWords.join(" ")}`;
    },
    (setExtraParams, triggerEncode) => (
      <div>
        <input
          type="text"
          className={styles.delimiterInput}
          placeholder="Enter delimiter"
          onChange={(e) => {
            setExtraParams("delimiter", e.target.value);
            triggerEncode();
          }}
        />
      </div>
    )
  )
];