import * as React from "react";
import { Field } from "@base-ui/react/field";
import { Wizard, WizardStep } from "@/components/Wizard/Wizard";
import { TopNav } from "@/components/TopNav/TopNav";
import { RealmSelector } from "@/components/RealmSelector/RealmSelector";
import { useRealm } from "@/lib/realm";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/use-toast";
import { api } from "@/lib/api";
import { navigate } from "vike/client/router";
import type { CreateRuneRequest, RuneStatus } from "@/types";
import "./+Page.css";

export const Page: React.FC = () => {
  const { selectedRealm, availableRealms, setRealm } = useRealm();
  const { isAuthenticated } = useAuth();
  const { show } = useToast();

  // Form state
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState(2);
  const [branch, setBranch] = React.useState("");
  const [status, setStatus] = React.useState<RuneStatus>("open");
  const [isCreating, setIsCreating] = React.useState(false);

  // Handle redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated]);

  // Sync realm with API
  React.useEffect(() => {
    if (selectedRealm) {
      api.setRealm(selectedRealm);
    }
  }, [selectedRealm]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      show({
        title: "Validation Error",
        description: "Title is required",
        type: "error",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create rune
      const runeData: CreateRuneRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority || 2,
        branch: branch.trim() || undefined,
      };

      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(runeData).filter(([_, value]) => value !== undefined)
      ) as CreateRuneRequest;

      const createdRune = await api.createRune(cleanData);

      // Auto-fulfill after creation (as specified in task)
      await api.fulfillRune(createdRune.id);

      // Show success toast
      show({
        title: "Rune Created",
        description: `Rune "${title}" has been created and fulfilled`,
        type: "success",
      });

      // Redirect to runes list
      navigate("/runes");
    } catch (error) {
      console.error("Failed to create rune:", error);
      show({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create rune",
        type: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Wizard steps
  const steps: WizardStep[] = [
    {
      title: "Basic Information",
      content: (
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-field">
            <Field.Root>
              <Field.Label>Title *</Field.Label>
              <Field.Control
                type="text"
                value={title}
                onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
                placeholder="Enter rune title"
                disabled={isCreating}
              />
              <Field.Description>
                A clear, concise title for your rune
              </Field.Description>
            </Field.Root>
          </div>
          <div className="form-field">
            <label htmlFor="description" className="field-label">Description</label>
            <textarea
              id="description"
              className="field-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter rune description (optional)"
              rows={4}
              disabled={isCreating}
            />
            <p className="field-description">Additional details about the rune</p>
          </div>
          <div className="form-field">
            <label htmlFor="priority" className="field-label">Priority</label>
            <select
              id="priority"
              className="field-input"
              value={priority}
              onChange={(e) => setPriority(Number((e.target as HTMLSelectElement).value))}
              disabled={isCreating}
            >
              <option value={1}>1 - Low</option>
              <option value={2}>2 - Medium</option>
              <option value={3}>3 - High</option>
              <option value={4}>4 - Critical</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      title: "Settings",
      content: (
        <div className="form-section">
          <h3 className="form-section-title">Settings</h3>
          <div className="form-field">
            <label htmlFor="status" className="field-label">Status</label>
            <select
              id="status"
              aria-label="Status"
              className="field-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as RuneStatus)}
              disabled={isCreating}
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="sealed">Sealed</option>
              <option value="shattered">Shattered</option>
            </select>
            <p className="field-description">Initial status for the rune</p>
          </div>
          <div className="form-field">
            <Field.Root>
              <Field.Label>Branch</Field.Label>
              <Field.Control
                type="text"
                value={branch}
                onChange={(e) => setBranch((e.target as HTMLInputElement).value)}
                placeholder="e.g., feature/my-new-feature"
                disabled={isCreating}
              />
              <Field.Description>
                Git branch associated with this rune (optional)
              </Field.Description>
            </Field.Root>
          </div>
          <div className="form-field">
            <div className="realm-info">
              <span className="realm-info-label">Realm:</span>
              <span className="realm-info-value">{selectedRealm || "None"}</span>
            </div>
            <div className="realm-selector-wrapper">
              <RealmSelector />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Review",
      content: (
        <div className="form-section">
          <h3 className="form-section-title">Review</h3>
          <div className="review-section">
            <div className="review-item">
              <span className="review-label">Title:</span>
              <span className="review-value">{title || "(empty)"}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Description:</span>
              <span className="review-value">{description || "(empty)"}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Priority:</span>
              <span className="review-value">{priority}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Status:</span>
              <span className="review-value">{status}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Branch:</span>
              <span className="review-value">{branch || "(not set)"}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Realm:</span>
              <span className="review-value">{selectedRealm || "None"}</span>
            </div>
          </div>
          <div className="review-note">
            <p>
              <strong>Note:</strong> The rune will be auto-fulfilled after creation.
            </p>
          </div>
        </div>
      ),
    },
  ];

  // AMBER theme color
  const stepColors = ["var(--color-amber)", "var(--color-amber)", "var(--color-amber)"];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="new-rune-page">
      <TopNav />
      <div className="new-rune-container">
        <div className="new-rune-header">
          <h1 className="new-rune-title">Create New Rune</h1>
          <p className="new-rune-subtitle">Follow the steps to create a new rune</p>
        </div>
        <Wizard
          steps={steps}
          stepColors={stepColors}
          onComplete={handleSubmit}
          buttonLabels={{ back: "Back", next: "Next", done: isCreating ? "Creating..." : "Create Rune" }}
        />
      </div>
    </div>
  );
};
