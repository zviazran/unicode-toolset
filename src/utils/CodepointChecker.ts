export const CodepointChecker = {
  isEmoji(codePoint: number): boolean {
    return (
      (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Emoticons
      (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) || // Misc Symbols and Pictographs
      (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Transport & Map
      (codePoint >= 0x2600 && codePoint <= 0x26FF)   || // Misc symbols
      (codePoint >= 0x2700 && codePoint <= 0x27BF)   || // Dingbats
      (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) || // Supplemental Symbols and Pictographs
      (codePoint >= 0x1FA70 && codePoint <= 0x1FAFF) || // Symbols and Pictographs Extended-A
      (codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF)    // Flags (regional indicator symbols)
    );
  }
};

export default CodepointChecker;
