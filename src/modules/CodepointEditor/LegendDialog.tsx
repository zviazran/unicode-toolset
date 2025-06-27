// LegendDialog.tsx
import BaseDialog from '../../components/BaseDialog';
import styles from '../../components/BaseDialog.module.css';
import stylesColors from './ProcessedTextDisplay.module.css';

export default function LegendDialog() {
  return (
    <BaseDialog triggerIcon="mdi:help-circle-outline" triggerTitle="Open guide" title="Color Legend">
      <ul className={styles.legendList} >
        <li><span className={stylesColors.invisibleChar} /> Invisible Character</li>
        <li><span className={stylesColors.wordBreakChar} /> Word-Break Space</li>
        <li><span className={stylesColors.noBreakChar} /> No-Break Space</li>
        <li><span className={stylesColors.aiIndicator} /> AI indicators (fancy non-keyboard characters)</li>
        <li><span style={{ backgroundColor: 'hsl(35, 100%, 90%)', marginRight: 0 }} /><span style={{ backgroundColor: 'hsl(35, 100%, 60%)', marginRight: 0 }} /><span style={{ backgroundColor: 'hsl(35, 100%, 30%)' }} /> Mixed Scripts Highlight</li>
      </ul>
    </BaseDialog>
  );
}
