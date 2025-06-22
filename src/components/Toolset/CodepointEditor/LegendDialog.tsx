// LegendDialog.tsx
import BaseDialog from './BaseDialog';
import styles from './BaseDialog.module.css';
import stylesColors from './ProcessedTextDisplay.module.css';

export default function LegendDialog() {
  return (
    <BaseDialog triggerIcon="mdi:help-circle-outline" triggerTitle="Open guide" title="Color Legend" descriptionId="legend-description">
      <ul className={styles.legendList}  id="legend-description" >
        <li><span className={stylesColors.invisibleChar}></span> Invisible Character</li>
        <li><span className={stylesColors.wordBreakChar}></span> Word-Break Space</li>
        <li><span className={stylesColors.noBreakChar}></span> No-Break Space</li>
        <li><span className={stylesColors.aiIndicator}></span> AI indicators (fancy non-keyboard characters)</li>
      </ul>
    </BaseDialog>
  );
}
