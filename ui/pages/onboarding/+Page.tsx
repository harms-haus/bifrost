import { useState } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "@/lib/auth";
import { Field } from "@base-ui/react/field";
import { useToast } from "@/lib/use-toast";
import { Wizard } from "@/components/Wizard/Wizard";
import { api } from "@/lib/api";
import type { CreateAdminResponse } from "@/types";
import "./+Page.css";

/**
 * Onboarding page for first-time setup.
 * Creates first admin account and realm using a 4-step wizard.
 * Uses neo-brutalist styling with 0% border-radius and bold borders.
 */
export function Page() {
  const { login } = useAuth();
  const toast = useToast();

  // Form state for each step
  const [username, setUsername] = useState("");
  const [realmName, setRealmName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate inputs
    if (!username.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a username",
        type: "error",
      });
      return;
    }

    if (!realmName.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a realm name",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create admin account and realm in one API call
      const response: CreateAdminResponse = await api.createAdmin({
        username: username.trim(),
        realm_name: realmName.trim(),
      });

      // Login with the generated PAT
      await login(response.pat);

      // Navigate to dashboard
      navigate("/dashboard");

      toast({
        title: "Welcome to Bifrost!",
        description: "Your account and realm have been created successfully.",
        type: "success",
      });
    } catch (err) {
      toast({
        title: "Onboarding failed",
        description: err instanceof Error ? err.message : "Failed to create admin account",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step colors for wizard (red, blue, green, white)
  const stepColors = [
    "var(--color-red)",
    "var(--color-blue)",
    "var(--color-green)",
    "var(--color-white)",
  ];

  // Define wizard steps
  const steps = [
    {
      title: "Create Admin Account",
      content: (
        <div className="wizard-step-content">
          <p className="wizard-step-description">
            Create your administrator account. This account will have full access to
            manage the system.
          </p>
          <Field.Root className="onboarding-field">
            <Field.Label className="onboarding-field-label">
              Username
            </Field.Label>
            <Field.Control
              className="onboarding-field-input"
              type="text"
              value={username}
              onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </Field.Root>
        </div>
      ),
    },
    {
      title: "Create Realm",
      content: (
        <div className="wizard-step-content">
          <p className="wizard-step-description">
            Create your first realm. A realm is a workspace for organizing your
            runes and managing access.
          </p>
          <Field.Root className="onboarding-field">
            <Field.Label className="onboarding-field-label">
              Realm Name
            </Field.Label>
            <Field.Control
              className="onboarding-field-input"
              type="text"
              value={realmName}
              onChange={(e) => setRealmName((e.target as HTMLInputElement).value)}
              placeholder="Enter realm name (e.g., my-project)"
              disabled={isLoading}
            />
          </Field.Root>
        </div>
      ),
    },
    {
      title: "Review Settings",
      content: (
        <div className="wizard-step-content">
          <p className="wizard-step-description">
            Review your settings before completing the onboarding process.
          </p>
          <div className="onboarding-review">
            <div className="onboarding-review-item">
              <span className="onboarding-review-label">Username:</span>
              <span className="onboarding-review-value">{username || "—"}</span>
            </div>
            <div className="onboarding-review-item">
              <span className="onboarding-review-label">Realm Name:</span>
              <span className="onboarding-review-value">{realmName || "—"}</span>
            </div>
          </div>
          <p className="onboarding-note">
            <strong>Note:</strong> After completing onboarding, you will be logged
            in automatically and redirected to the dashboard.
          </p>
        </div>
      ),
    },
    {
      title: "Complete",
      content: (
        <div className="wizard-step-content">
          <div className="onboarding-complete">
            <h2 className="onboarding-complete-title">
              Ready to Get Started!
            </h2>
            <p className="onboarding-complete-description">
              Click "Done" below to complete the setup and create your account and
              realm. You will receive a Personal Access Token (PAT) for
              authentication.
            </p>
          </div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="onboarding-loading">
            <div className="onboarding-loading-text">
              Creating account and realm...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1 className="onboarding-title">Welcome to Bifrost</h1>
          <p className="onboarding-subtitle">
            Let's set up your first account and realm
          </p>
        </div>

        <Wizard
          steps={steps}
          stepColors={stepColors}
          onComplete={handleSubmit}
          buttonLabels={{
            back: "Back",
            next: "Next",
            done: isLoading ? "Creating..." : "Done",
          }}
        />
      </div>
    </div>
  );
}
