type TypingController = {
  cancel: () => void;
  isCancelled: () => boolean;
};

export function RunTypingSequence(
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
    let i = 0;
    let currentText = "";

    setText("");

    function typeNext() {
      if (controller.isCancelled()) return;

      if (i >= text.length) {
        setTimeout(() => {
          if (!controller.isCancelled()) deleteNext();
        }, pauseBeforeDelete);
        return;
      }

      const char = text[i];
      currentText += char;
      setText(currentText);
      i++;

      const isBreak = char === " " || char === "\n" || char === "\u200B";
      const delay = isBreak ? 300 : 200;

      setTimeout(typeNext, delay);
    }

    function deleteNext() {
      if (controller.isCancelled()) return;

      const current = getCurrentText();
      if (!current) {
        onDone();
        return;
      }

      setText(current.slice(0, -1));

      const delay = 25 + Math.random() * 15;
      setTimeout(deleteNext, delay);
    }

    typeNext();
  }

  runNext();
  return controller;
}
