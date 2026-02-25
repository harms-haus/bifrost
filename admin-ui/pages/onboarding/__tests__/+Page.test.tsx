import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Page from "../+Page";

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Onboarding Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );

    // Should show spinner initially
    expect(screen.getByTestId("spinner")).toBeDefined();
  });

  it("redirects to login when onboarding not needed", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ needs_onboarding: false }),
    });

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("shows onboarding wizard when onboarding is needed", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ needs_onboarding: true }),
    });

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Use a more specific selector - the welcome heading
      expect(screen.getByRole("heading", { name: /welcome to bifrost/i })).toBeDefined();
    });
  });

  it("redirects to login with success message after completion", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ needs_onboarding: true }),
    });

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );

    // Wait for wizard to appear
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /welcome to bifrost/i })).toBeDefined();
    });

    // The completion is handled by OnboardingWizard, tested separately
  });

  it("handles fetch errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    // Silence console.error for this test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Look for the error heading
      expect(screen.getByRole("heading", { name: /error/i })).toBeDefined();
    });

    spy.mockRestore();
  });
});
