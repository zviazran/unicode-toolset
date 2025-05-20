export type TypingController = {
  cancel: () => void;
  isCancelled: () => boolean;
};

export function TypingSequenceController(
  texts: string[],
  setText: (t: string) => void,
  getCurrentText: () => string,
  options?: {
    pauseBeforeDelete?: number;
    pauseBetweenItems?: number;
    onComplete?: () => void;
  }
): TypingController {
  let cancelled = false;

  const controller: TypingController = {
    cancel: () => {
      cancelled = true;
    },
    isCancelled: () => cancelled,
  };

  const pauseBeforeDelete = options?.pauseBeforeDelete ?? 800;
  const pauseBetweenItems = options?.pauseBetweenItems ?? 600;

  let index = 0;

  function runNext() {
    if (controller.isCancelled()) return;
    if (index >= texts.length) {
      options?.onComplete?.();
      return;
    }

    simulateOne(texts[index], () => {
      if (controller.isCancelled()) return;
      index++;
      setTimeout(runNext, pauseBetweenItems);
    });
  }

  function simulateOne(text: string, onDone: () => void) {
    const codePoints = Array.from(text);
    let i = 0;
    let currentText = "";

    setText("");

    function typeNext() {
      if (controller.isCancelled()) return;

      if (i >= codePoints.length) {
        setTimeout(() => {
          if (!controller.isCancelled()) deleteNext();
        }, pauseBeforeDelete);
        return;
      }

      const char = codePoints[i];
      currentText += char;
      setText(currentText);
      i++;

      const isBreak = char === " " || char === "\n" || char === "\u200B";
      const delay = isBreak ? 200 : 150;

      setTimeout(typeNext, delay);
    }

    function deleteNext() {
      if (controller.isCancelled()) return;

      const current = Array.from(getCurrentText()); // Break into code points
      if (current.length === 0) {
        onDone();
        return;
      }

      current.pop();
      setText(current.join(""));

      const delay = 25 + Math.random() * 15;
      setTimeout(deleteNext, delay);
    }

    typeNext();
  }

  runNext();
  return controller;
}
