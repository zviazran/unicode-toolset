import React from "react";
import styles from "./IconSlider.module.css";

export type IconSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  className?: string;
  dir?: string;
};

const IconSlider: React.FC<IconSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  leftIcon,
  rightIcon,
  className = "",
  dir = "ltr",
}) => (
  <div className={`${styles.sliderRow} ${className}`.trim()}>
    {leftIcon}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className={styles.slider}
      dir={dir}
    />
    {rightIcon}
  </div>
);

export default IconSlider;
