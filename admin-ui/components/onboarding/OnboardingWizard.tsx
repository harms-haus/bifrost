import { useState } from "react";
import { StepIndicator } from "./StepIndicator";

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEPS = ["Welcome", "Create Account", "Create Realm", "Save Token", "Complete"];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState("");
  const [realmName, setRealmName] = useState("");
  const [realmId, setRealmId] = useState<string | null>(null);
  const [pat, setPat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [realmNameError, setRealmNameError] = useState<string | null>(null);

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

  const validateRealmName = (): boolean => {
    if (!realmName.trim()) {
      setRealmNameError("Realm name is required");
      return false;
    }
    if (realmName.length < 2) {
      setRealmNameError("Realm name must be at least 2 characters");
      return false;
    }
    setRealmNameError(null);
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validateUsername()) {
      return;
    }
    setCurrentStep(2);
  };

  const handleCreateRealm = async () => {
    if (!validateRealmName()) {
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
        body: JSON.stringify({
          username: username.trim(),
          realm_name: realmName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create account and realm");
      }

      const data = await response.json();
      setPat(data.pat);
      setRealmId(data.realm_id);
      setCurrentStep(3);
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
      handleCreateRealm();
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
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
            <div className="bg-slate-800 p-4 text-left space-y-3">
              <p className="text-slate-300 text-sm">You will:</p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>1. Create an admin account</li>
                <li>2. Create your first realm</li>
                <li>3. Save your Personal Access Token</li>
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
                  className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--page-color)] focus:border-transparent"
                  placeholder="Enter your username"
                />
                {usernameError && (
                  <p className="mt-1 text-sm text-red-400">{usernameError}</p>
                )}
              </div>
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Realm Step */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Create Your Realm</h1>
              <p className="mt-2 text-slate-400">
                A realm is a workspace for your projects. You'll be the owner.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="realmName"
                  className="block text-sm font-medium text-slate-300"
                >
                  Realm Name
                </label>
                <input
                  id="realmName"
                  type="text"
                  value={realmName}
                  onChange={(e) => {
                    setRealmName(e.target.value);
                    setRealmNameError(null);
                  }}
                  className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--page-color)] focus:border-transparent"
                  placeholder="e.g., My Team, Production, Acme Corp"
                />
                {realmNameError && (
                  <p className="mt-1 text-sm text-red-400">{realmNameError}</p>
                )}
              </div>
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Token Step */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Save Your Token</h1>
              <p className="mt-2 text-slate-400">
                This is your Personal Access Token. Save it now - you won't be able to see it again.
              </p>
            </div>
            <div className="bg-amber-900/30 border border-amber-500 p-4">
              <p className="text-amber-300 text-sm font-medium mb-2">
                Save this token securely:
              </p>
              <div className="bg-slate-800 p-3">
                <code className="text-green-400 text-sm font-mono break-all">{pat}</code>
              </div>
              <button
                onClick={handleCopyPat}
                className="mt-3 px-4 py-2 text-sm font-medium text-white bg-[var(--page-color)] hover:opacity-90"
              >
                Copy Token
              </button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {currentStep === 4 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500 flex items-center justify-center">
                <span className="text-white text-3xl">✓</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">You're All Set!</h1>
              <p className="mt-2 text-slate-400">
                Your admin account and realm "{realmName}" have been created. You can now sign in with your token.
              </p>
              {realmId && (
                <p className="mt-2 text-slate-500 text-sm font-mono">
                  Realm ID: {realmId}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--page-color)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={currentStep === 0 ? handleGetStarted : handleContinue}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--page-color)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--page-color)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 0
              ? "Get Started"
              : currentStep === 4
                ? "Finish"
                : isSubmitting
                  ? "Processing..."
                  : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
