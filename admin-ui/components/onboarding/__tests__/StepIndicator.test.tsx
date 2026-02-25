import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "../StepIndicator";

describe("StepIndicator", () => {
  const steps = ["Welcome", "Create Account", "Create Realm", "Complete"];

  it("renders all step labels", () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    expect(screen.getByText("Welcome")).toBeDefined();
    expect(screen.getByText("Create Account")).toBeDefined();
    expect(screen.getByText("Create Realm")).toBeDefined();
    expect(screen.getByText("Complete")).toBeDefined();
  });

  it("marks current step as active", () => {
    render(<StepIndicator steps={steps} currentStep={1} />);
    // Step 1 (Create Account) should be active
    const stepButtons = screen.getAllByRole("listitem");
    expect(stepButtons[1].getAttribute("aria-current")).toBe("step");
  });

  it("marks completed steps", () => {
    render(<StepIndicator steps={steps} currentStep={2} />);
    // Steps 0 and 1 should be completed
    const stepButtons = screen.getAllByRole("listitem");
    expect(stepButtons[0].className).toContain("completed");
    expect(stepButtons[1].className).toContain("completed");
  });

  it("marks future steps as inactive", () => {
    render(<StepIndicator steps={steps} currentStep={1} />);
    // Steps 2 and 3 should not be completed or active
    const stepButtons = screen.getAllByRole("listitem");
    expect(stepButtons[2].className).not.toContain("completed");
    expect(stepButtons[3].className).not.toContain("completed");
  });

  it("shows step numbers", () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
  });
});
