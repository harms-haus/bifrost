import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "../useToast";

describe("useToast", () => {
  it("starts with empty toasts", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it("adds a toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast("Test message", "success");
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].message).toBe("Test message");
    expect(result.current.toasts[0].variant).toBe("success");
  });

  it("adds multiple toasts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast("First", "info");
      result.current.toast("Second", "error");
    });

    expect(result.current.toasts.length).toBe(2);
    expect(result.current.toasts[0].message).toBe("First");
    expect(result.current.toasts[1].message).toBe("Second");
  });

  it("removes toast by id", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast("Test", "info");
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts.length).toBe(0);
  });

  it("clear all toasts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast("First", "info");
      result.current.toast("Second", "error");
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.toasts.length).toBe(0);
  });
});
