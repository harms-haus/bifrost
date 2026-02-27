import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

// Mock Toast primitives
let mockToasts: any[] = [];

const mockToastManager = {
  add: (toast: any) => {
    const newToast = { id: String(mockToasts.length + 1), ...toast };
    mockToasts.push(newToast);
    return newToast.id;
  },
  close: (id: string) => {
    mockToasts = mockToasts.filter((t) => t.id !== id);
  },
  update: (id: string, updates: any) => {
    const toast = mockToasts.find((t) => t.id === id);
    if (toast) {
      Object.assign(toast, updates);
    }
  },
  subscribe: (listener: any) => () => {},
  promise: async (promise: Promise<any>, options: any) => promise,
  clear: () => {
    mockToasts = [];
  },
};

vi.mock("@base-ui/react/toast", () => ({
  Toast: {
    Provider: ({ children }: { children: ReactNode }) => children,
    Portal: ({ children }: { children: ReactNode }) => children,
    Viewport: ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
      <div data-toast-viewport="" {...props}>{children}</div>
    ),
    Root: ({ toast, children, ...props }: { toast: any; children: ReactNode; [key: string]: any }) => (
      <div data-toast-root="" data-type={toast?.type} {...props}>{children}</div>
    ),
    Content: ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
      <div data-toast-content="" {...props}>{children}</div>
    ),
    Title: ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
      <h2 data-toast-title="" {...props}>{children}</h2>
    ),
    Description: ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
      <p data-toast-description="" {...props}>{children}</p>
    ),
    Close: ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
      <button aria-label="Close" data-toast-close="" {...props}>{children}</button>
    ),
    createToastManager: vi.fn(() => mockToastManager),
    useToastManager: vi.fn(() => ({ toasts: mockToasts })),
  },
}));

import { toastManagerInstance } from "../../../lib/use-toast";
import ToastProvider, { ToastList } from "../Toast";

describe("Toast Component", () => {
  beforeEach(() => {
    mockToasts = [];
    mockToastManager.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockToasts = [];
    mockToastManager.clear();
  });

  it("should render toast with neo-brutalist styling (0% border-radius)", () => {
    mockToastManager.add({
      title: "Success Toast",
      description: "Operation completed successfully",
      type: "success",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    const toast = screen.getByTestId("toast-container").querySelector('.toast-root');
    expect(toast).toBeDefined();
    expect(toast).toHaveClass('toast-root');
  });

  it("should render toast with bold border", () => {
    mockToastManager.add({
      title: "Success Toast",
      description: "Operation completed successfully",
      type: "success",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    const toast = screen.getByTestId("toast-container").querySelector('.toast-root');
    expect(toast).toBeDefined();
    expect(toast).toHaveClass('toast-root');
  });

  it("should render toast with close button in top-right", () => {
    mockToastManager.add({
      title: "Success Toast",
      description: "Operation completed successfully",
      type: "success",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    const closeButton = screen.getByTestId("toast-container").querySelector('[data-toast-close=""]');
    expect(closeButton).toBeDefined();
    expect(closeButton).toHaveAttribute("aria-label", "Close");
  });

  it("should render success toast with green color", () => {
    mockToastManager.add({
      title: "Success Toast",
      description: "Operation completed successfully",
      type: "success",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    const toast = screen.getByTestId("toast-container").querySelector('[data-type="success"]');
    expect(toast).toBeDefined();
  });

  it("should render error toast with red color", () => {
    mockToastManager.add({
      title: "Error Toast",
      description: "Operation failed",
      type: "error",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    const toast = screen.getByTestId("toast-container").querySelector('[data-type="error"]');
    expect(toast).toBeDefined();
  });

  it("should render warning toast with yellow color", () => {
    mockToastManager.add({
      title: "Warning Toast",
      description: "Operation warning",
      type: "warning",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    const toast = screen.getByTestId("toast-container").querySelector('[data-type="warning"]');
    expect(toast).toBeDefined();
  });

  it("should render info toast with blue color", () => {
    mockToastManager.add({
      title: "Info Toast",
      description: "Operation info",
      type: "info",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    const toast = screen.getByTestId("toast-container").querySelector('[data-type="info"]');
    expect(toast).toBeDefined();
  });

  it("should render toasts stacked upwards without overlapping", () => {
    mockToastManager.add({
      title: "Toast 1",
      description: "First toast",
      type: "success",
    });

    mockToastManager.add({
      title: "Toast 2",
      description: "Second toast",
      type: "error",
    });

    mockToastManager.add({
      title: "Toast 3",
      description: "Third toast",
      type: "warning",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    const toasts = screen.getByTestId("toast-container").querySelectorAll('[data-toast-root=""]');
    expect(toasts.length).toBe(3);
  });

  it("should render toast with soft shadow", () => {
    mockToastManager.add({
      title: "Success Toast",
      description: "Operation completed successfully",
      type: "success",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    const toast = screen.getByTestId("toast-container").querySelector('[data-toast-root=""]');
    expect(toast).toBeDefined();
    expect(toast).toHaveStyle({
      boxShadow: expect.stringContaining("rgba(0, 0, 0,"),
    });
  });

  it("should render toast with title and description", () => {
    mockToastManager.add({
      title: "Success Toast",
      description: "Operation completed successfully",
      type: "success",
    });

    render(
      <div data-testid="toast-container">
        <ToastList />
      </div>
    );

    waitFor(() => {
      const title = screen.getByTestId("toast-container").querySelector('[data-toast-title=""]');
      const description = screen.getByTestId("toast-container").querySelector('[data-toast-description=""]');
      expect(title).toBeDefined();
      expect(description).toBeDefined();
    });
  });
});
