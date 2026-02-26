import { useEffect, useState } from "react";
import { navigate } from "vike/client/router";
import { OnboardingWizard } from "../../components/onboarding";
import { Spinner } from "../../components/common";

interface OnboardingStatus {
  needs_onboarding: boolean;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const response = await fetch("/ui/check-onboarding");
        if (!response.ok) {
          throw new Error("Failed to check onboarding status");
        }
        const data: OnboardingStatus = await response.json();
        setNeedsOnboarding(data.needs_onboarding);

        if (!data.needs_onboarding) {
          navigate("/ui/login");
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    checkOnboarding();
  }, []);

  const handleComplete = () => {
    navigate("/ui/login?onboarded=true");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-red-400 text-6xl">!</div>
          <h1 className="text-2xl font-bold text-white">Error</h1>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--page-color)] hover:opacity-90"
>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!needsOnboarding) {
    return null; // Will redirect via navigate
  }

  return <OnboardingWizard onComplete={handleComplete} />;
}
