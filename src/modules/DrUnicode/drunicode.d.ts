// drunicode.d.ts
declare module 'drunicode' {

  export type Status = "valid" | "invalid";

  export class DrUnicode {
    public readonly STATUS: {
      VALID: Status;
      INVALID: Status;
    };

    constructor();

    analyze(
      str: string,
      invalidCallback?: (input: string, message: string) => void
    ): Status;
  }

  // Change to named export
  export { DrUnicode };
}
