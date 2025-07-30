declare module 'bidi-js' {
  export interface Bidi {
    getBidiCharType(char: string): number;
    getBidiCharTypeName(char: string): string;
  }

  export default function bidiFactory(): Bidi;
}
