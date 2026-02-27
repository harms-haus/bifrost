import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import styles from "./Dialog.css";

export interface DialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  themeColor?: string;
}

const DEFAULT_THEME_COLOR = "#7fc3ec";

const DialogComponent: React.FC<DialogProps> = ({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  themeColor = DEFAULT_THEME_COLOR,
}) => {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.Backdrop} />
        <Dialog.Viewport className={styles.Viewport}>
          <Dialog.Popup className={styles.Popup} style={{ borderColor: themeColor }}>
            <Dialog.Title className={styles.Title}>{title}</Dialog.Title>
            <Dialog.Description className={styles.Description}>
              {description}
            </Dialog.Description>
            <div className={styles.Actions}>
              <button
                className={styles.Button}
                onClick={onCancel}
                style={{ borderColor: themeColor }}
              >
                Cancel
              </button>
              <button
                className={styles.Button}
                onClick={onConfirm}
                style={{
                  borderColor: themeColor,
                  backgroundColor: themeColor,
                  color: "#ffffff",
                }}
              >
                Confirm
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { DialogComponent as Dialog };
