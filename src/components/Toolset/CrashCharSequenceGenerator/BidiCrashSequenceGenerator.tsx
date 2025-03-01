import { bidiCharacters } from "../CodePointsConsts";

class BidiCrashSequenceGenerator {
  public crashSequences: Record<string, { left: number; right: number; break: number; circle: string; }> = {
    "⚫ LRM+RLM": { left: bidiCharacters.get("LRM")!, right: bidiCharacters.get("RLM")!, break: 0x200d, circle:"⚫" },
    "🟣 LRM+ALM": { left: bidiCharacters.get("LRM")!, right: bidiCharacters.get("ALM")!, break: 0x200d, circle:"🟣"  },
    "🔴 LRI+RLI": { left: bidiCharacters.get("LRI")!, right: bidiCharacters.get("RLI")!, break: bidiCharacters.get("PDI")!, circle:"🔴" },
    "🟠 LRO+RLO": { left: bidiCharacters.get("LRO")!, right: bidiCharacters.get("RLO")!, break: bidiCharacters.get("PDF")!, circle:"🟠" },
    "🟡 LRE+RLE": { left: bidiCharacters.get("LRE")!, right: bidiCharacters.get("RLE")!, break: bidiCharacters.get("PDF")!, circle:"🟡" },
  };

  // Generate crash sequence based on selected option and length
  generate(option: keyof typeof this.crashSequences, length: number, breakCount: number, styled: boolean): string {
    const sequence = this.crashSequences[option];
  
    const leftRightPair = String.fromCharCode(sequence.left) + String.fromCharCode(sequence.right);
    let str = "";
    if (styled)
      str += "<" + sequence.circle + ">";

    for (let i = 0; i < length/2; i += breakCount/2) {
      str += leftRightPair.repeat(Math.min(breakCount/2, length/2 - i)); 
      str += String.fromCharCode(sequence.break); 
    }
    str += String.fromCharCode(sequence.break);
    if (styled){
      if (length > 1000)
        str += "󠁈󠁩󠀠󠁚󠁶󠁩󠀠󠁁󠁺󠁲󠁡󠁮󠀠󠁩󠁳󠀠󠁯󠁰󠁥󠁮󠀠󠁦󠁯󠁲󠀠󠁷󠁯󠁲󠁫󠀡";
      str += "👈";
    }
    
    return str;
  }

  // Get available options
  getOptions(): string[] {
    return Object.keys(this.crashSequences);
  }
}

export default BidiCrashSequenceGenerator;
