"use client";

import { useState } from "react";
import { navigate } from "vike/client/router";
import { useAuth } from "../../../lib/auth";
import { useToast } from "../../../lib/toast";
import { api } from "../../../lib/api";

export { Page };

type FormData = {
  username: string;
};

const INITIAL_FORM: FormData = {
  username: "",
};

const STEPS = [
  { id: 1, label: "Username", field: "name" as const },
  { id: 2, label: "Review", field: "review" as const },
];

function Page() {
  const { isAuthenticated, isSysadmin, loading: authLoading } = useAuth();
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

  if (!isSysadmin) {
    navigate("/dashboard");
    return null;
  }

  const updateForm = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return form.username.trim().length >= 2;
      case 1:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const result = await api.createAdminAccount(form.username.trim());
      showToast("Account Created", `"${form.username}" has been created`, "success");
      navigate(`/accounts/${result.account_id}`);
    } catch (error) {
      showToast("Error", "Failed to create account. Username may already exist.", "error");
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

  return (
    <div className="min-h-[calc(100vh-56px)] p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/accounts")}
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 transition-all duration-150 hover:translate-x-[-2px]"
          style={{ color: "var(--color-border)" }}
        >
          <span>&larr;</span>
          <span>Back to Accounts</span>
        </button>
        <h1
          className="text-4xl font-bold tracking-tight uppercase"
          style={{ color: "var(--color-blue)" }}
        >
          New Account
        </h1>
        <p
          className="text-sm uppercase tracking-widest mt-1"
          style={{ color: "var(--color-border)" }}
        >
          Create a new user account
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((s, idx) => (
          <div
            key={s.id}
            className="flex-1 h-2 transition-all duration-300"
            style={{
              backgroundColor: idx <= step ? "var(--color-blue)" : "var(--color-surface)",
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
            style={{ color: "var(--color-blue)" }}
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
                Choose a username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => updateForm("username", e.target.value)}
                placeholder="e.g., alice, bob, developer-1"
                className="w-full px-4 py-3 text-lg outline-none transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderLeftWidth = "4px";
                  e.currentTarget.style.borderLeftColor = "var(--color-blue)";
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
                {form.username.length}/50 characters (minimum 2)
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--color-border)" }}
              >
                Review the account details before creating.
              </p>

              {/* Summary Card */}
              <div
                className="p-6"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "2px solid var(--color-border)",
                }}
              >
                <h3
                  className="text-xs uppercase tracking-wider font-bold mb-4"
                  style={{ color: "var(--color-border)" }}
                >
                  Account Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-dashed" style={{ borderColor: "var(--color-border)" }}>
                    <span style={{ color: "var(--color-border)" }}>Username</span>
                    <span className="font-bold text-lg">{form.username}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span style={{ color: "var(--color-border)" }}>Initial PAT</span>
                    <span className="text-sm" style={{ color: "var(--color-border)" }}>
                      Will be generated automatically
                    </span>
                  </div>
                </div>
              </div>

              <p
                className="text-xs mt-4"
                style={{ color: "var(--color-border)" }}
              >
                A Personal Access Token (PAT) will be generated for this account. 
                You can share it with the user to allow them to authenticate.
              </p>
            </div>
          )}
        </div>

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
              backgroundColor: "var(--color-blue)",
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
                ? "Create Account"
                : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
