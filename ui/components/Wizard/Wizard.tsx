import * as React from "react";
import { Tabs } from "@base-ui/react/tabs";
import "./Wizard.css";

export interface WizardStep {
  title: string;
  content: React.ReactNode;
}

export interface WizardProps {
  steps: WizardStep[];
  stepColors: string[];
  onComplete: () => void;
  buttonLabels?: {
    back?: string;
    next?: string;
    done?: string;
  };
}

export const Wizard: React.FC<WizardProps> = ({
  steps,
  stepColors,
  onComplete,
  buttonLabels = { back: "Back", next: "Next", done: "Done" },
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDone = () => {
    onComplete();
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="wizard-container">
      <Tabs.Root value={currentStep.toString()}>
        <Tabs.List className="wizard-steps-list">
          {steps.map((step, index) => (
            <Tabs.Tab
              key={index}
              value={index.toString()}
              disabled={index > currentStep}
              className="wizard-step-indicator"
              style={
                ({
                  "--step-color": stepColors[index] || "var(--color-blue)",
                } as any)
              }
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-title">{step.title}</div>
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className="wizard-step-indicator" />
        </Tabs.List>

        <Tabs.Panel value={currentStep.toString()} className="wizard-content-panel">
          {steps[currentStep].content}
        </Tabs.Panel>
      </Tabs.Root>

      <div className="wizard-navigation">
        <button
          onClick={handleBack}
          disabled={isFirstStep}
          className="wizard-button wizard-button-back"
        >
          {buttonLabels.back}
        </button>

        {isLastStep ? (
          <button
            onClick={handleDone}
            className="wizard-button wizard-button-done"
          >
            {buttonLabels.done}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={false}
            className="wizard-button wizard-button-next"
          >
            {buttonLabels.next}
          </button>
        )}
      </div>
    </div>
  );
};
