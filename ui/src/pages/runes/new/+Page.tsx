"use client";

import { useState } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "../../../lib/auth";
import { useToast } from "../../../lib/toast";
import { api } from "../../../lib/api";
import type { CreateRuneRequest } from "../../../types/rune";

export { Page };

type FormData = {
  title: string;
  description: string;
  priority: number;
  status: "draft" | "open";
  branch: string;
};

const INITIAL_FORM: FormData = {
  title: "",
  description: "",
  priority: 2,
  status: "draft",
  branch: "",
};

const STEPS = [
  { id: 1, label: "Title", field: "title" as const },
  { id: 2, label: "Description", field: "description" as const },
  { id: 3, label: "Priority", field: "priority" as const },
  { id: 4, label: "Status", field: "status" as const },
  { id: 5, label: "Branch", field: "branch" as const },
];

function Page() {
  const { realms, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div
          className="px-8 py-4 text-lg font-bold uppercase tracking-wider"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (realms.length === 0) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
        <div
          className="p-8 text-center max-w-md"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight">
            No Realms Found
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-border)" }}>
            You need access to a realm to create runes.
          </p>
        </div>
      </div>
    );
  }

  const updateForm = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return form.title.trim().length >= 3;
      case 1:
        return true; // Description is optional
      case 2:
        return form.priority >= 1 && form.priority <= 4;
      case 3:
        return form.status === "draft" || form.status === "open";
      case 4:
        return true; // Branch is optional
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const request: CreateRuneRequest = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        realm_id: realms[0],
      };

      const rune = await api.createRune(request);
      showToast("Rune Created", `"${rune.title}" has been created`, "success");
      navigate(`/runes/${rune.id}`);
    } catch (error) {
      showToast("Error", "Failed to create rune", "error");
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const buttonStyle = (active: boolean, color: string = "var(--color-amber)") => ({
    backgroundColor: active ? color : "var(--color-bg)",
    border: "2px solid var(--color-border)",
    color: active ? "white" : "var(--color-text)",
    boxShadow: active ? "4px 4px 0px var(--color-border)" : "2px 2px 0px var(--color-border)",
  });

  return (
    <div className="min-h-[calc(100vh-56px)] p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/runes")}
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 transition-all duration-150 hover:translate-x-[-2px]"
          style={{ color: "var(--color-border)" }}
        >
          <span>&larr;</span>
          <span>Back to Runes</span>
        </button>
        <h1
          className="text-4xl font-bold tracking-tight uppercase"
          style={{ color: "var(--color-amber)" }}
        >
          New Rune
        </h1>
        <p
          className="text-sm uppercase tracking-widest mt-1"
          style={{ color: "var(--color-border)" }}
        >
          Create a new work item
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((s, idx) => (
          <div
            key={s.id}
            className="flex-1 h-2 transition-all duration-300"
            style={{
              backgroundColor: idx <= step ? "var(--color-amber)" : "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          />
        ))}
      </div>

      {/* Wizard Card */}
      <div
        className="max-w-2xl mx-auto p-8"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-soft)",
        }}
      >
        {/* Step Title */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-2xl font-bold uppercase tracking-tight"
            style={{ color: "var(--color-amber)" }}
          >
            {STEPS[step].label}
          </h2>
          <span
            className="text-xs font-bold uppercase tracking-wider px-2 py-1"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-border)",
            }}
          >
            Step {step + 1} of {STEPS.length}
          </span>
        </div>

        {/* Step Content */}
        <div className="mb-8 min-h-[200px]">
          {step === 0 && (
            <div>
              <label
                className="text-xs uppercase tracking-wider block mb-2 font-bold"
                style={{ color: "var(--color-border)" }}
              >
                What's the title of your rune?
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="Enter a descriptive title..."
                className="w-full px-4 py-3 text-lg outline-none transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderLeftWidth = "4px";
                  e.currentTarget.style.borderLeftColor = "var(--color-amber)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderLeftWidth = "2px";
                  e.currentTarget.style.borderLeftColor = "var(--color-border)";
                }}
                autoFocus
              />
              <p
                className="text-xs mt-2"
                style={{ color: "var(--color-border)" }}
              >
                {form.title.length}/100 characters (minimum 3)
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <label
                className="text-xs uppercase tracking-wider block mb-2 font-bold"
                style={{ color: "var(--color-border)" }}
              >
                Describe your rune (optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Add details about what this rune involves..."
                rows={6}
                className="w-full px-4 py-3 text-base outline-none resize-none transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderLeftWidth = "4px";
                  e.currentTarget.style.borderLeftColor = "var(--color-amber)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderLeftWidth = "2px";
                  e.currentTarget.style.borderLeftColor = "var(--color-border)";
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label
                className="text-xs uppercase tracking-wider block mb-4 font-bold"
                style={{ color: "var(--color-border)" }}
              >
                Select priority level
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: 4, label: "P1", desc: "Critical", color: "var(--color-red)" },
                  { value: 3, label: "P2", desc: "High", color: "var(--color-amber)" },
                  { value: 2, label: "P3", desc: "Medium", color: "var(--color-blue)" },
                  { value: 1, label: "P4", desc: "Low", color: "var(--color-border)" },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => updateForm("priority", p.value)}
                    className="p-4 text-center transition-all duration-150"
                    style={buttonStyle(form.priority === p.value, p.color)}
                    onMouseEnter={(e) => {
                      if (form.priority !== p.value) {
                        e.currentTarget.style.transform = "translate(-2px, -2px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (form.priority !== p.value) {
                        e.currentTarget.style.transform = "translate(0, 0)";
                        e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                      }
                    }}
                  >
                    <div className="text-2xl font-bold">{p.label}</div>
                    <div className="text-xs uppercase tracking-wider mt-1">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label
                className="text-xs uppercase tracking-wider block mb-4 font-bold"
                style={{ color: "var(--color-border)" }}
              >
                Initial status
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateForm("status", "draft")}
                  className="p-6 text-left transition-all duration-150"
                  style={buttonStyle(form.status === "draft", "var(--color-border)")}
                  onMouseEnter={(e) => {
                    if (form.status !== "draft") {
                      e.currentTarget.style.transform = "translate(-2px, -2px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (form.status !== "draft") {
                      e.currentTarget.style.transform = "translate(0, 0)";
                      e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                    }
                  }}
                >
                  <div className="text-xl font-bold uppercase">Draft</div>
                  <div className="text-xs mt-2 opacity-70">
                    Work in progress, not ready for review
                  </div>
                </button>
                <button
                  onClick={() => updateForm("status", "open")}
                  className="p-6 text-left transition-all duration-150"
                  style={buttonStyle(form.status === "open")}
                  onMouseEnter={(e) => {
                    if (form.status !== "open") {
                      e.currentTarget.style.transform = "translate(-2px, -2px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (form.status !== "open") {
                      e.currentTarget.style.transform = "translate(0, 0)";
                      e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                    }
                  }}
                >
                  <div className="text-xl font-bold uppercase">Open</div>
                  <div className="text-xs mt-2 opacity-70">
                    Ready to be picked up and worked on
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <label
                className="text-xs uppercase tracking-wider block mb-2 font-bold"
                style={{ color: "var(--color-border)" }}
              >
                Associate a Git branch (optional)
              </label>
              <input
                type="text"
                value={form.branch}
                onChange={(e) => updateForm("branch", e.target.value)}
                placeholder="e.g., feature/my-feature or fix/bug-name"
                className="w-full px-4 py-3 text-lg font-mono outline-none transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderLeftWidth = "4px";
                  e.currentTarget.style.borderLeftColor = "var(--color-amber)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderLeftWidth = "2px";
                  e.currentTarget.style.borderLeftColor = "var(--color-border)";
                }}
                autoFocus
              />
              <p
                className="text-xs mt-2"
                style={{ color: "var(--color-border)" }}
              >
                Branch helps track which code changes relate to this rune
              </p>
            </div>
          )}
        </div>

        {/* Summary Preview (last step) */}
        {step === 4 && (
          <div
            className="mb-6 p-4"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3
              className="text-xs uppercase tracking-wider font-bold mb-3"
              style={{ color: "var(--color-border)" }}
            >
              Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--color-border)" }}>Title:</span>
                <span className="font-medium">{form.title}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-border)" }}>Priority:</span>
                <span className="font-bold">P{5 - form.priority}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-border)" }}>Status:</span>
                <span className="font-bold uppercase">{form.status}</span>
              </div>
              {form.branch && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-border)" }}>Branch:</span>
                  <span className="font-mono">{form.branch}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "2px solid var(--color-border)",
              color: "var(--color-text)",
              boxShadow: step === 0 ? "none" : "4px 4px 0px var(--color-border)",
            }}
            onMouseEnter={(e) => {
              if (step > 0) {
                e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                e.currentTarget.style.transform = "translate(2px, 2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (step > 0) {
                e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                e.currentTarget.style.transform = "translate(0, 0)";
              }
            }}
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!canProceed() || isSubmitting}
            className="flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--color-amber)",
              border: "2px solid var(--color-border)",
              color: "white",
              boxShadow: canProceed() && !isSubmitting ? "4px 4px 0px var(--color-border)" : "none",
            }}
            onMouseEnter={(e) => {
              if (canProceed() && !isSubmitting) {
                e.currentTarget.style.boxShadow = "var(--shadow-soft-hover)";
                e.currentTarget.style.transform = "translate(2px, 2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (canProceed() && !isSubmitting) {
                e.currentTarget.style.boxShadow = "var(--shadow-soft)";
                e.currentTarget.style.transform = "translate(0, 0)";
              }
            }}
          >
            {isSubmitting
              ? "Creating..."
              : step === STEPS.length - 1
                ? "Create Rune"
                : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
