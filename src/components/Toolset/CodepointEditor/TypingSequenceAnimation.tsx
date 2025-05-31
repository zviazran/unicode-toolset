import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import styles from "./TypingSequenceAnimation.module.css";
import { Icon } from "@iconify/react";

export type TypingController = {
  cancel: () => void;
  isCancelled: () => boolean;
};

function TypingSequenceController(
  texts: string[],
  setText: (t: string) => void,
  runId: number,
  currentRunIdRef: React.MutableRefObject<number>,
  options?: {
    pauseBetweenItems?: number;
    onComplete?: () => void;
    speed?: number;
  }
): TypingController {
  let cancelled = false;

  const controller: TypingController = {
    cancel: () => {
      cancelled = true;
      options?.onComplete?.();
    },
    isCancelled: () => cancelled,
  };

  function safeSetText(text: string) {
    if (runId === currentRunIdRef.current && !controller.isCancelled()) {
      setText(text);
    }
  }

  const pauseBetweenItems = options?.pauseBetweenItems ?? 600;
  const speed = options?.speed ?? 150;

  let index = 0;

  function runNext() {
    if (controller.isCancelled()) return;
    if (index >= texts.length) {
      options?.onComplete?.();
      return;
    }

    simulateOne(texts[index], () => {
      if (controller.isCancelled() || runId !== currentRunIdRef.current) return;
      index++;
      setTimeout(runNext, pauseBetweenItems);
    }, runId);
  }

  function simulateOne(text: string, onDone: () => void, runId: number) {
    const codePoints = Array.from(text);
    let i = 0;
    let currentText = "";

    safeSetText("");

    function typeNext() {
      if (controller.isCancelled() || runId !== currentRunIdRef.current) return;

      if (i >= codePoints.length) {
        onDone();
        return;
      }

      const char = codePoints[i];
      currentText += char;
      safeSetText(currentText);
      i++;

      const isBreak = char === " " || char === "\n" || char === "\u200B";
      const delay = isBreak ? speed * 1.5 : speed;

      setTimeout(() => {
        if (!controller.isCancelled() && runId === currentRunIdRef.current) {
          typeNext();
        }
      }, delay);
    }

    typeNext();
  }

  runNext();
  return controller;
}


export const TypingSequencePanel = forwardRef(function TypingSequencePanel(
  {
    setText,
    getCurrentText,
    playInitialDemo = false,
  }: {
    setText: (text: string) => void;
    getCurrentText: () => string;
    playInitialDemo?: boolean;
  },
  ref
) {
  const [typingText, setTypingText] = useState("");
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [isTyping, setIsTyping] = useState(false);
  const [controller, setController] = useState<TypingController | null>(null);
  const hasPlayedInitialDemo = useRef(false);
  const activeRunId = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    stopTyping: () => {
      if (controller && !controller.isCancelled()) {
        controller.cancel();
        setIsTyping(false);
      }
    },
  }));

  const initialAnimations = [
    "This text is 󠁩󠁮visible󠀠󠁢󠁹󠀠󠁵󠁳󠁩󠁮󠁧󠀠󠁴󠁡󠁧󠁳!",
    "Only this character ‮.kcatta edirrevo idib siht seod",
    "זה feature זה לא bug",
  ];
  const exampleAnimations = [
    "🚶🏽‍➡️\n🏃🏻‍♂️‍➡️\n🧑🏼‍🤝‍🧑🏽\n👩‍❤️‍💋‍👨\n👨‍👩‍👧‍👦",
    "😶‍🌫️\n😵‍💫\n🇺🇳\n🇺🇸\n🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    "\<div title=\"ل\"\>ع\<\/div\>",
    "Understand Normalization: Zoë Čech Åsōm vs Zoë Čech Åsōm, finance vs ﬁnance, ℌ①.AⅥ vs H1.AVI, /api/user/℅ vs /api/user/c/o",
    "Tab–space debates — never end ‒ it’s clear who is wrong.",
    "Ok, עשיתי totalCount = 42 ואז קראתי לeval()."
  ];

  useEffect(() => {
    if (!playInitialDemo || hasPlayedInitialDemo.current) return;

    hasPlayedInitialDemo.current = true;

    const random = initialAnimations[Math.floor(Math.random() * initialAnimations.length)];
    const initial = TypingSequenceController(
      [random],
      setText,
      0,
      activeRunId,
      {
        pauseBetweenItems: 500,
        onComplete: () => {
          if (activeRunId.current === 0) {
            setTimeout(() => {
              setText("");
            }, 2000);
            hasPlayedInitialDemo.current = true;
          }
        }
      }
    );
    setController(initial);
  }, [playInitialDemo]);


  const pauseTypingAnimation = () => {
    if (controller && !controller.isCancelled()) {
      controller.cancel();
      setIsTyping(false);
    }
  };

  const runTypingAnimation = (text: string, speed: number) => {
    controller?.cancel();
    hasPlayedInitialDemo.current = true;
    setText("");
    const runId = ++activeRunId.current;
    const newController = TypingSequenceController(
      [text],
      setText,
      runId,
      activeRunId,
      {
        pauseBetweenItems: 500,
        speed,
        onComplete: () => {
          if (activeRunId.current === runId) setIsTyping(false);
        },
      }
    );

    setController(newController);
    setIsTyping(true);
  };

  const toggleTyping = () => {
    if (isTyping) {
      pauseTypingAnimation();
    } else {
      const textToAnimate = typingText || getCurrentText();
      setTypingText(textToAnimate);
      runTypingAnimation(textToAnimate, typingSpeed);
    }
  };

  return (
    <div className={styles.typingPanel}>
      <label>
        <select className={styles.dropdown} value={typingText}
          onChange={(e) => {
            const value = e.target.value;
            setTypingText(value);
            if (value) {
              runTypingAnimation(value, typingSpeed);
            }
          }}>
          <option value="">-- Animate Current Text --</option>
          {[...initialAnimations, ...exampleAnimations].map((text, i) => (
            <option key={i} value={text}>
              {text.length > 26 ? text.slice(0, 23).replace(/\n/g, "") + "..." : text.replace(/\n/g, "")}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.speedControl}>
        <div className={styles.sliderRow}>
          <Icon icon="mdi:snail" width="19" />
          <input
            type="range"
            min={10}
            max={400}
            step={10}
            value={typingSpeed}
            onChange={(e) => setTypingSpeed(Number(e.target.value))}
            className={styles.slider}
            dir="rtl"
          />
          <Icon icon="mdi:flash" width="20" />
        </div>
      </label>

      <div className={styles.toggleButtonContainer}>
        <button
          className={styles.toggleButton}
          onClick={toggleTyping}
          disabled={!typingText && !getCurrentText()}
        >
          <Icon icon={isTyping ? "mdi:pause" : "mdi:play"} width="24" />
        </button>
      </div>
    </div>
  );
});
