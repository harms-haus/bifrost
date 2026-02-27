import { Toast } from "@base-ui/react/toast";
import { toastManagerInstance } from "./use-toast";

const getColorForType = (type?: string): string => {
  switch (type) {
    case "success":
      return "#22c55e";
    case "error":
      return "#ef4444";
    case "warning":
      return "#f59e0b";
    case "info":
    default:
      return "#3b82f6";
  }
};

const ToastList = () => {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        borderLeft: `4px solid ${getColorForType(toast.type)}`,
      }}
    >
      <Toast.Content
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          overflow: "hidden",
        }}
      >
        <Toast.Title
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1a1a1a",
            margin: 0,
          }}
        />
        <Toast.Description
          style={{
            fontSize: "14px",
            color: "#666",
            margin: 0,
          }}
        />
      </Toast.Content>
      <Toast.Close
        style={{
          marginLeft: "12px",
          padding: "4px",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#999",
          fontSize: "16px",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Close"
      >
        ×
      </Toast.Close>
    </Toast.Root>
  ));
};

const ToastProvider = ({ children }: { children: React.ReactNode }) => (
  <Toast.Provider toastManager={toastManagerInstance} timeout={10000}>
    <Toast.Portal>
      <Toast.Viewport
        data-toast-viewport=""
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxWidth: "352px",
          zIndex: 1000,
        }}
      >
        <ToastList />
      </Toast.Viewport>
    </Toast.Portal>
    {children}
  </Toast.Provider>
);

export { ToastProvider };
