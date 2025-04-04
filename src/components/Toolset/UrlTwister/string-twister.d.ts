declare module "string-twister" {
    export class StringTwister {
      static Typo: {
        charSwap(str: string): string;
        missingChar(str: string): string;
        addedChar(str: string): string;
        repetitions(str: string): string;
        replacedChar(str: string): string;
      };
  
      static leetspeak(str: string, n?: number): string;
      static multiScriptHomoglyph(str: string): string;
      static mathSansSerifNormal(str: string): string;
      static removeEnglishVowels(str: string): string;
    }
  
    export class URLTwister {
      static generate(url: string, transformers: ((domain: string) => string)[]): string[];
      static addWordsToDomain(url: string): string;
      static hostAfterExampleURL(url: string, useIP?: boolean, useFragment?: boolean): string;
      static addRandomFillerToDomain(url: string): string;
    }
  }
  