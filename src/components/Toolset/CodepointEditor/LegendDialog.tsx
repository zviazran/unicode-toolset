import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import styles from './LegendDialog.module.css';
import stylesColors from './ProcessedTextDisplay.module.css';
import { Icon } from '@iconify/react';

export default function LegendDialog() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<button className={styles.trigger} title="Open guide">
					<Icon icon="mdi:help-circle-outline" className={styles.icon} />
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className={styles.overlay} />
				<Dialog.Content className={styles.modal}>
					<Dialog.Title className={styles.title}>Color Legend</Dialog.Title>
					<ul className={styles.legendList}>
						<li><span className={stylesColors.invisibleChar}></span> Invisible Character</li>
						<li><span className={stylesColors.wordBreakChar}></span> Word-Break Space</li>
						<li><span className={stylesColors.noBreakChar}></span> No-Break Space</li>
						<li><span className={stylesColors.aiIndicator}></span> AI indicators (fancy non-keyboard characters)</li>
					</ul>
					<Dialog.Close className={styles.close}>×</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
