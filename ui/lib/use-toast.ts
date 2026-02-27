import { useCallback } from "react";
import { Toast } from "@base-ui/react/toast";

type ToastOptions = {
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
};

const toastManagerInstance = Toast.createToastManager();

const useToast = () => {
  const toastManager = Toast.useToastManager();

  return useCallback(
    (options: ToastOptions) => {
      toastManager.add({
        title: options.title,
        description: options.description,
        type: options.type ?? "info",
      });
    },
    [toastManager],
  );
};

export { toastManagerInstance, useToast };
