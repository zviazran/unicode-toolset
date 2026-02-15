import { useState } from "react";
import { Icon } from "@iconify/react";

interface CopyButtonProps {
  text: string;
  className?: string;
  iconClassName?: string;
  title?: string;
  copiedIcon?: string;
  copyIcon?: string;
  copiedClassName?: string;
  copyClassName?: string;
  resetDelay?: number;
  style?: React.CSSProperties;
}

export default function CopyButton({
  text,
  className = "",
  iconClassName = "",
  title = "Copy to clipboard",
  copiedIcon = "mdi:check",
  copyIcon = "mdi:content-copy",
  copiedClassName = "",
  copyClassName = "",
  resetDelay = 2000,
  style,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    });
  };

  return (
    <button onClick={handleCopy} className={className} title={title} style={style}>
      <Icon
        icon={copied ? copiedIcon : copyIcon}
        className={
          iconClassName +
          " " +
          (copied ? copiedClassName : copyClassName)
        }
      />
    </button>
  );
}
