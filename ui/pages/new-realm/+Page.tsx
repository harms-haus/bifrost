import { useState } from "react";
import { navigate } from "vike/client/router";
import { Field } from "@base-ui/react/field";
import { api } from "@/lib/api";
import { useRealm } from "@/lib/realm";
import { useToast } from "@/lib/use-toast";
import { Wizard, type WizardStep } from "@/components/Wizard/Wizard";
import "./+Page.css";

export default function Page() {
  const toast = useToast();
  const { selectedRealm, setRealm } = useRealm();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Loading state
  const [isCreating, setIsCreating] = useState(false);

  // Wizard steps with colors: Step 1=Red, Step 2=Blue, Step 3=Green
  const steps: WizardStep[] = [
    {
      title: "Realm Info",
      content: (
        <div className="step-content">
          <div className="form-field">
            <Field.Root>
              <Field.Label className="field-label">Realm Name</Field.Label>
              <Field.Control
                placeholder="Enter realm name"
                className="field-input"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
              />
              <Field.Description className="field-description">
                Unique identifier for your realm
              </Field.Description>
            </Field.Root>
          </div>

          <div className="form-field">
            <Field.Root>
              <Field.Label className="field-label">Description</Field.Label>
              <Field.Control
                placeholder="Optional description"
                className="field-input field-textarea"
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
              />
              <Field.Description className="field-description">
                Optional description of your realm
              </Field.Description>
            </Field.Root>
          </div>
        </div>
      ),
    },
    {
      title: "Review and Create",
      content: (
        <div className="step-content">
          <div className="review-section">
            <h3 className="review-title">Review Realm Details</h3>
            <div className="review-item">
              <span className="review-label">Name:</span>
              <span className="review-value">{name || "(not set)"}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Description:</span>
              <span className="review-value">{description || "(none)"}</span>
            </div>
          </div>
          <div className="review-note">
            Click "Done" to create the realm. You'll be redirected to the realms list.
          </div>
        </div>
      ),
    },
    {
      title: "Complete",
      content: (
        <div className="step-content">
          <div className="complete-section">
            {isCreating ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p className="loading-text">Creating realm...</p>
              </div>
            ) : (
              <div className="success-state">
                <p className="success-message">Realm created successfully!</p>
                <p className="success-submessage">Redirecting to realms list...</p>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  // Step colors: Red for info, Blue for review, Green for complete
  const stepColors = [
    "var(--color-red)",
    "var(--color-blue)",
    "var(--color-green)",
  ];

  const handleComplete = async () => {
    setIsCreating(true);

    try {
      // Create the realm via API
      const realm = await api.createRealm({ name });

      // Show success toast
      toast({
        title: "Realm created successfully",
        description: `Realm "${name}" has been created`,
        type: "success",
      });

      // Set the new realm as current
      setRealm(realm.realm_id);

      // Redirect to realms list
      navigate("/realms");
    } catch (error) {
      // Show error toast
      toast({
        title: "Failed to create realm",
        description: error instanceof Error ? error.message : "An error occurred",
        type: "error",
      });

      setIsCreating(false);
    }
  };

  return (
    <div className="new-realm-container">
      <div className="new-realm-card">
        <div className="new-realm-header">
          <h1 className="new-realm-title">Create New Realm</h1>
          <p className="new-realm-subtitle">
            Enter realm details and create a new realm
          </p>
        </div>

        <Wizard
          steps={steps}
          stepColors={stepColors}
          onComplete={handleComplete}
          buttonLabels={{
            back: "Back",
            next: "Next",
            done: "Done",
          }}
        />
      </div>
    </div>
  );
}
