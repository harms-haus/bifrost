import { describe, expect } from "vitest";
import test from "vitest-gwt";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ToastProvider } from "./toast";
import { useToast } from "./use-toast";
type Context = {
  wrapper: ({ children }: { children: ReactNode }) => ReactNode;
  showToast: ReturnType<typeof useToast>;
};

describe("ToastProvider and useToast", () => {
  function toast_provider_is_rendered(this: Context) {
    this.wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
  }

  function useToast_hook_is_called(this: Context) {
    let capturedShow: ReturnType<typeof useToast> | null = null;

    function TestComponent() {
      capturedShow = useToast();
      return null;
    }
    render(<TestComponent />, { wrapper: this.wrapper });

    if (capturedShow === null) {
      throw new Error("useToast hook did not return a function");
    }

    this.showToast = capturedShow;
  }

  function hook_returns_show_function(this: Context) {
    expect(this.showToast).toBeDefined();
    expect(typeof this.showToast).toBe("function");
  }

  test("provides toast context to consuming components", {
    given: {
      toast_provider_is_rendered,
    },
    when: {
      useToast_hook_is_called,
    },
    then: {
      hook_returns_show_function,
    },
  });

  type ToastRenderContext = {
    rendered: ReturnType<typeof render>;
  };

  function empty_wrapper(this: ToastRenderContext) {
    function TestComponent() {
      return null;
    }
    this.rendered = render(<TestComponent />, { wrapper: this.wrapper });
  }

  function viewport_is_rendered(this: ToastRenderContext) {
    // Toast.Viewport should be rendered in the document
    const viewport = document.querySelector('[data-toast-viewport]');
    expect(viewport).toBeDefined();
  }

  test("renders Toast.Viewport for stacked toasts", {
    given: {
      toast_provider_is_rendered,
    },
    when: {
      empty_wrapper,
    },
    then: {
      viewport_is_rendered,
    },
  });

  type ShowToastContext = {
    wrapper: ({ children }: { children: ReactNode }) => ReactNode;
    showToastFn: ReturnType<typeof useToast>;
  };

  function setup_with_wrapper(this: ShowToastContext) {
    this.wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
  }

  function toast_is_shown(this: ShowToastContext) {
    let capturedShow: ReturnType<typeof useToast> | null = null;

    function TestComponent() {
      capturedShow = useToast();
      return null;
    }

    render(<TestComponent />, { wrapper: this.wrapper });

    if (capturedShow === null) {
      throw new Error("useToast hook did not return a function");
    }

    this.showToastFn = capturedShow;
    this.showToastFn({ title: "Test Toast", description: "Test description" });
  }

  function toast_is_visible_in_dom(this: ShowToastContext) {
    // Wait for toast to appear
    waitFor(() => {
      const toastTitle = screen.getByText("Test Toast");
      expect(toastTitle).toBeDefined();
    });
  }

  test("displays toast when show is called", {
    given: {
      setup_with_wrapper,
    },
    when: {
      toast_is_shown,
    },
    then: {
      toast_is_visible_in_dom,
    },
  });
});
