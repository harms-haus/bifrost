import { useState } from "react";
import { navigate } from "vike/client/router";
import { Field } from "@base-ui/react/field";
import { api } from "@/lib/api";
import { useRealm } from "@/lib/realm";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/use-toast";
import { Wizard, type WizardStep } from "@/components/Wizard/Wizard";
import "./+Page.css";

export function Page() {
  const toast = useToast();
  const { availableRealms } = useRealm();
  const { session } = useAuth();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [selectedRealms, setSelectedRealms] = useState<string[]>([]);

  // Loading state
  const [isCreating, setIsCreating] = useState(false);

  // Wizard steps: Step 1=Blue (Account Info), Step 2=Blue (Permissions), Step 3=Green (Review)
  const steps: WizardStep[] = [
    {
      title: "Account Info",
      content: (
        <div className="step-content">
          <div className="form-field">
            <Field.Root>
              <Field.Label className="field-label">Username</Field.Label>
              <Field.Control
                placeholder="Enter username"
                className="field-input"
                value={username}
                onChange={(e: any) => setUsername(e.target.value)}
              />
              <Field.Description className="field-description">
                Unique username for the account
              </Field.Description>
            </Field.Root>
          </div>

          <div className="form-field">
            <Field.Root>
              <Field.Label className="field-label">Password</Field.Label>
              <Field.Control
                placeholder="Enter password"
                className="field-input"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
              />
              <Field.Description className="field-description">
                Password for the account
              </Field.Description>
            </Field.Root>
          </div>

          <div className="form-field">
            <Field.Root>
              <Field.Label className="field-label">Email (Optional)</Field.Label>
              <Field.Control
                placeholder="Enter email"
                className="field-input"
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
              />
              <Field.Description className="field-description">
                Optional email address
              </Field.Description>
            </Field.Root>
          </div>
        </div>
      ),
    },
    {
      title: "Permissions",
      content: (
        <div className="step-content">
          <div className="form-field">
            <Field.Root>
              <Field.Label className="field-label">Roles</Field.Label>
              <div className="multi-select-container">
                {availableRealms.map((realm) => (
                  <div key={realm} className="role-realm-pair">
                    <span className="realm-name">{realm}</span>
                    <Field.Control
                      as="select"
                      className="field-input"
                      value={roles[realm] || ""}
                      onChange={(e: any) =>
                        setRoles({ ...roles, [realm]: e.target.value })
                      }
                    >
                      <option value="">No access</option>
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </Field.Control>
                  </div>
                ))}
              </div>
              <Field.Description className="field-description">
                Assign roles for each realm
              </Field.Description>
            </Field.Root>
          </div>
        </div>
      ),
    },
    {
      title: "Review",
      content: (
        <div className="step-content">
          <div className="review-section">
            <h3 className="review-title">Review Account Details</h3>
            <div className="review-item">
              <span className="review-label">Username:</span>
              <span className="review-value">{username || "(not set)"}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Email:</span>
              <span className="review-value">{email || "(none)"}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Roles:</span>
              <span className="review-value">
                {Object.keys(roles).length > 0
                  ? Object.entries(roles)
                      .filter(([_, role]) => role)
                      .map(([realm, role]) => `${realm}: ${role}`)
                      .join(", ")
                  : "(none)"}
              </span>
            </div>
          </div>
          <div className="review-note">
            Click "Done" to create the account. You'll be redirected to the
            accounts list.
          </div>
        </div>
      ),
    },
  ];

  // Step colors: Blue for account info, Blue for permissions, Green for review
  const stepColors = [
    "var(--color-blue)",
    "var(--color-blue)",
    "var(--color-green)",
  ];

  const handleComplete = async () => {
    // Validate inputs
    if (!username.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a username",
        type: "error",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a password",
        type: "error",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create the account via API
      const account = await api.createAccount({
        username: username.trim(),
        email: email.trim() || undefined,
      });

      // Show success toast
      toast({
        title: "Account created successfully",
        description: `Account "${username}" has been created`,
        type: "success",
      });

      // Redirect to accounts list
      navigate("/accounts");
    } catch (error) {
      // Show error toast
      toast({
        title: "Failed to create account",
        description: error instanceof Error ? error.message : "An error occurred",
        type: "error",
      });

      setIsCreating(false);
    }
  };

  return (
    <div className="new-account-container">
      <div className="new-account-card">
        <div className="new-account-header">
          <h1 className="new-account-title">Create New Account</h1>
          <p className="new-account-subtitle">
            Enter account details and create a new account
          </p>
        </div>

        <Wizard
          steps={steps}
          stepColors={stepColors}
          onComplete={handleComplete}
          buttonLabels={{
            back: "Back",
            next: "Next",
            done: isCreating ? "Creating..." : "Done",
          }}
        />
      </div>
    </div>
  );
}
