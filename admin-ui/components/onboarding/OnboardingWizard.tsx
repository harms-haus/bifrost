import { useState } from "react";
import { StepIndicator } from "./StepIndicator";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEPS = ["Welcome", "Create Account", "Save Token", "Complete"];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState("");
  const [pat, setPat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const handleGetStarted = () => {
    setCurrentStep(1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const validateUsername = (): boolean => {
    if (!username.trim()) {
      setUsernameError("Username is required");
      return false;
    }
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }
    setUsernameError(null);
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validateUsername()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/ui/onboarding/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create account");
      }

      const data = await response.json();
      setPat(data.pat);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPat = async () => {
    if (pat) {
      await navigator.clipboard.writeText(pat);
    }
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      handleCreateAccount();
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Welcome Step */}
        {currentStep === 0 && (
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome to Bifrost</h1>
              <p className="mt-4 text-slate-400">
                Let's set up your admin account and create your first realm.
                This quick wizard will guide you through the initial setup.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-left space-y-3">
              <h2 className="text-lg font-semibold text-white">What we'll do:</h2>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">1.</span>
                  Create your admin account
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">2.</span>
                  Generate your access token
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">3.</span>
                  Get started with Bifrost
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Create Account Step */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Create Admin Account</h1>
              <p className="mt-2 text-slate-400">
                Choose a username for your admin account
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-300"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError(null);
                  }}
                  className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username"
                />
                {usernameError && (
                  <p className="mt-1 text-sm text-red-400">{usernameError}</p>
                )}
              </div>
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500 rounded-md">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Token Step */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Save Your Token</h1>
              <p className="mt-2 text-slate-400">
                This is your Personal Access Token. Save it now - you won't be able to see it again.
              </p>
            </div>
            <div className="bg-amber-900/30 border border-amber-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-amber-300">Important!</h3>
                  <p className="mt-1 text-sm text-amber-200">
                    Copy this token and store it securely. You'll need it to sign in.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm text-green-400 font-mono break-all">
                  {pat}
                </code>
                <button
                  onClick={handleCopyPat}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Copy token"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {currentStep === 3 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
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
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">You're All Set!</h1>
              <p className="mt-2 text-slate-400">
                Your admin account has been created. You can now sign in with your token.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={
              currentStep === 0
                ? handleGetStarted
                : handleContinue
            }
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : currentStep === 0 ? (
              "Get Started"
            ) : currentStep === 3 ? (
              "Go to Login"
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
