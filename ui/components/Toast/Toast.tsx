import { Toast as BaseUiToast } from "@base-ui/react/toast";
import type { ReactNode } from "react";
import "./Toast.css";
import type { ReactNode } from "react";

const getColorForType = (type?: string): string => {
  switch (type) {
    case "success":
      return "var(--color-success)";
    case "error":
      return "var(--color-danger)";
    case "warning":
      return "var(--color-warning)";
    case "info":
    default:
      return "var(--color-info)";
  }
};

const getBorderColorForType = (type?: string): string => {
  switch (type) {
    case "success":
      return "var(--color-green)";
    case "error":
      return "var(--color-red)";
    case "warning":
      return "var(--color-yellow)";
    case "info":
    default:
      return "var(--color-blue)";
  }
};

const ToastList = () => {
  const { toasts } = BaseUiToast.useToastManager();
  return (
    <>
      {toasts.map((toast) => (
        <BaseUiToast.Root
          key={toast.id}
          toast={toast}
          className="toast-root"
          style={
            {
              "--toast-type-color": getColorForType(toast.type),
              "--toast-border-color": getBorderColorForType(toast.type),
            } as React.CSSProperties
          }
        >
          <BaseUiToast.Content className="toast-content">
            <div className="toast-inner">
              <div className="toast-text">
                <BaseUiToast.Title className="toast-title" />
                <BaseUiToast.Description className="toast-description" />
              </div>
              <BaseUiToast.Close className="toast-close" aria-label="Close">
                ×
              </BaseUiToast.Close>
            </div>
          </BaseUiToast.Content>
        </BaseUiToast.Root>
      ))}
    </>
  );
};

type ToastProviderProps = {
  children: ReactNode;
};

const ToastProvider = ({ children }: ToastProviderProps) => {
  const { toastManagerInstance } = require("../../lib/use-toast");

  return (
    <BaseUiToast.Provider toastManager={toastManagerInstance} timeout={10000}>
      <BaseUiToast.Portal>
        <BaseUiToast.Viewport className="toast-viewport">
          <ToastList />
        </BaseUiToast.Viewport>
      </BaseUiToast.Portal>
      {children}
    </BaseUiToast.Provider>
  );
};

export default ToastProvider;
export { ToastList };
