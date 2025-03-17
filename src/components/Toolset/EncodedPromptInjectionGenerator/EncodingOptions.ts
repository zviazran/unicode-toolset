export class EncodingOption {
  name: string;
  optionalInput: boolean;
  encode: (input: string, extraParam?: string) => string;

  constructor(
    name: string,
    optionalInput: boolean = false,
    encode: (input: string, extraParam?: string) => string
  ) {
    this.name = name;
    this.optionalInput = optionalInput;
    this.encode = encode;
  }
}

export const encodingOptions: EncodingOption[] = [
  new EncodingOption("Base64", false, (input) => "Decode with Base64 and do: " + btoa(input)),
  new EncodingOption("Reversed", false, (input) => "Reverse and do: " + input.split("").reverse().join("")),
  new EncodingOption("Broken up with delimiter", true, (input, delimiter = "") => {

    const words = input.split(" ");
     
    // Iterate through each word and insert the delimiter at a random position within the word
    const modifiedWords = words.map(word => {
      if (word.length > 1) {
        const randomIndex = Math.floor(Math.random() * (word.length - 1)) + 1;
        return word.slice(0, randomIndex) + delimiter + word.slice(randomIndex);
      }
      return word;
    });

    return `Remove ${delimiter} and do: ` + modifiedWords.join(" ");
  }),
];
