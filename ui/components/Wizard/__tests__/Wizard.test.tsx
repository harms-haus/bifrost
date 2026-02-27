import { describe, expect, vi } from "vitest";
import test from "vitest-gwt";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Wizard } from "../Wizard";

type WizardContext = {
  onCompleteCallback: ReturnType<typeof vi.fn>;
};

describe("Wizard Component", () => {
  function wizard_is_created_with_steps(this: WizardContext) {
    this.onCompleteCallback = vi.fn();

    const steps = [
      { title: "Step 1", content: <div>Content 1</div> },
      { title: "Step 2", content: <div>Content 2</div> },
      { title: "Step 3", content: <div>Content 3</div> },
      { title: "Step 4", content: <div>Content 4</div> },
    ];

    const stepColors = ["red", "blue", "green", "white"];

    render(
      <Wizard
        steps={steps}
        stepColors={stepColors}
        onComplete={this.onCompleteCallback}
        buttonLabels={{ back: "Back", next: "Next", done: "Done" }}
      />
    );
  }

  function wizard_renders_step_indicators(this: WizardContext) {
    // Step indicators with numbers should be visible
    const step1 = screen.getByText("1");
    const step2 = screen.getByText("2");
    const step3 = screen.getByText("3");
    const step4 = screen.getByText("4");

    expect(step1).toBeDefined();
    expect(step2).toBeDefined();
    expect(step3).toBeDefined();
    expect(step4).toBeDefined();
  }

  function wizard_renders_navigation_buttons(this: WizardContext) {
    // Back and Next buttons should be visible
    const backButton = screen.getByRole("button", { name: "Back" });
    const nextButton = screen.getByRole("button", { name: "Next" });

    expect(backButton).toBeDefined();
    expect(nextButton).toBeDefined();
  }

  function wizard_shows_first_step_by_default(this: WizardContext) {
    // First step content should be visible
    const firstStepContent = screen.getByText("Content 1");
    expect(firstStepContent).toBeDefined();
  }

  test("renders wizard with step indicators and navigation", {
    given: {
      wizard_is_created_with_steps,
    },
    when: {},
    then: {
      wizard_renders_step_indicators,
      wizard_renders_navigation_buttons,
      wizard_shows_first_step_by_default,
    },
  });

  type NavigationContext = {
    onCompleteCallback: ReturnType<typeof vi.fn>;
  };

  function wizard_is_created(this: NavigationContext) {
    this.onCompleteCallback = vi.fn();

    const steps = [
      { title: "Step 1", content: <div>Content 1</div> },
      { title: "Step 2", content: <div>Content 2</div> },
      { title: "Step 3", content: <div>Content 3</div> },
    ];

    const stepColors = ["red", "blue", "green"];

    render(
      <Wizard
        steps={steps}
        stepColors={stepColors}
        onComplete={this.onCompleteCallback}
        buttonLabels={{ back: "Back", next: "Next", done: "Finish" }}
      />
    );
  }

  function user_clicks_next_button(this: NavigationContext) {
    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton);
  }

  function wizard_shows_second_step(this: NavigationContext) {
    // Second step content should be visible
    waitFor(() => {
      const secondStepContent = screen.getByText("Content 2");
      expect(secondStepContent).toBeDefined();
    });
  }

  test("navigates to next step when Next button is clicked", {
    given: {
      wizard_is_created,
    },
    when: {
      user_clicks_next_button,
    },
    then: {
      wizard_shows_second_step,
    },
  });

  type BackNavigationContext = {
    onCompleteCallback: ReturnType<typeof vi.fn>;
  };

  function wizard_is_on_second_step(this: BackNavigationContext) {
    this.onCompleteCallback = vi.fn();

    const steps = [
      { title: "Step 1", content: <div>Content 1</div> },
      { title: "Step 2", content: <div>Content 2</div> },
      { title: "Step 3", content: <div>Content 3</div> },
    ];

    const stepColors = ["red", "blue", "green"];

    render(
      <Wizard
        steps={steps}
        stepColors={stepColors}
        onComplete={this.onCompleteCallback}
        buttonLabels={{ back: "Back", next: "Next", done: "Finish" }}
      />
    );

    // Navigate to step 2
    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton);
  }

  function user_clicks_back_button(this: BackNavigationContext) {
    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);
  }

  function wizard_shows_first_step_again(this: BackNavigationContext) {
    waitFor(() => {
      const firstStepContent = screen.getByText("Content 1");
      expect(firstStepContent).toBeDefined();
    });
  }

  test("navigates back to previous step when Back button is clicked", {
    given: {
      wizard_is_on_second_step,
    },
    when: {
      user_clicks_back_button,
    },
    then: {
      wizard_shows_first_step_again,
    },
  });

  type CompletionContext = {
    onCompleteCallback: ReturnType<typeof vi.fn>;
  };

  function wizard_is_on_last_step(this: CompletionContext) {
    this.onCompleteCallback = vi.fn();

    const steps = [
      { title: "Step 1", content: <div>Content 1</div> },
      { title: "Step 2", content: <div>Content 2</div> },
      { title: "Step 3", content: <div>Content 3</div> },
    ];

    const stepColors = ["red", "blue", "green"];

    render(
      <Wizard
        steps={steps}
        stepColors={stepColors}
        onComplete={this.onCompleteCallback}
        buttonLabels={{ back: "Back", next: "Next", done: "Finish" }}
      />
    );

    // Navigate to step 2
    const nextButton1 = screen.getByRole("button", { name: "Next" });
    fireEvent.click(nextButton1);

    // Navigate to step 3 (last step)
    waitFor(() => {
      const nextButton2 = screen.getByRole("button", { name: "Next" });
      fireEvent.click(nextButton2);
    });
  }

  function done_button_is_visible(this: CompletionContext) {
    // Done button should be visible on last step
    const doneButton = screen.getByRole("button", { name: "Finish" });
    expect(doneButton).toBeDefined();
  }

  function user_clicks_done_button(this: CompletionContext) {
    const doneButton = screen.getByRole("button", { name: "Finish" });
    fireEvent.click(doneButton);
  }

  function completion_callback_is_called(this: CompletionContext) {
    waitFor(() => {
      expect(this.onCompleteCallback).toHaveBeenCalledTimes(1);
    });
  }

  test("calls onComplete callback when Done button is clicked on last step", {
    given: {
      wizard_is_on_last_step,
    },
    when: {
      done_button_is_visible,
      user_clicks_done_button,
    },
    then: {
      completion_callback_is_called,
    },
  });
});
