// BaseDialog.tsx
import * as Dialog from '@radix-ui/react-dialog';
import styles from './BaseDialog.module.css';
import { Icon } from '@iconify/react';

interface BaseDialogProps {
  title?: string;
  children: React.ReactNode;
  triggerIcon?: string;
  triggerTitle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  descriptionId?: string;
}


export default function BaseDialog({
  triggerIcon,
  triggerTitle,
  title,
  children,
  open,
  onOpenChange,
}: BaseDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {triggerIcon && triggerTitle && (
        <Dialog.Trigger asChild>
          <button className={styles.trigger} title={triggerTitle}>
            <Icon icon={triggerIcon} className={styles.icon} />
          </button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.modal} onOpenAutoFocus={(event) => event.preventDefault()}>
          <Dialog.Description className={styles.srOnly}>
            This is a description of the dialog's content.
          </Dialog.Description>
          {title ? (
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          ) : (
            <Dialog.Title/>
          )}
          {children}
          <Dialog.Close className={styles.close}>×</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
