interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center" role="list">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const stepNumber = index + 1;

          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className={`relative flex items-center ${
                isCompleted
                  ? "completed"
                  : isCurrent
                    ? ""
                    : ""
              }`}
            >
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute -left-4 w-8 h-0.5 ${
                    isCompleted || isCurrent ? "bg-blue-500" : "bg-slate-600"
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step circle */}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  isCompleted
                    ? "bg-blue-500 text-white"
                    : isCurrent
                      ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900"
                      : "bg-slate-700 text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step label */}
              <span
                className={`ml-2 text-sm ${
                  isCompleted || isCurrent ? "text-white" : "text-slate-400"
                } hidden sm:block`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
