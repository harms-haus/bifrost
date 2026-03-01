"use client";

import { useEffect, useState } from "react";
import { navigate } from "@/lib/router";
import { useAuth } from "../../../lib/auth";
import { api } from "../../../lib/api";
import { useToast } from "../../../lib/toast";
import type { CreateRuneRequest, RuneListItem } from "../../../types/rune";

export { Page };

type FormData = {
  title: string;
  description: string;
  priority: number;
  status: "draft" | "open";
  branch: string;
};

const initialForm: FormData = {
  title: "",
  description: "",
  priority: 2,
  status: "draft",
  branch: "",
};

function Page() {
  const { realms, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const availableRealms = realms.filter((realmId) => realmId !== "_admin");

  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRunes, setExistingRunes] = useState<RuneListItem[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [selectedDependants, setSelectedDependants] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || availableRealms.length === 0) {
      return;
    }

    const loadRunes = async () => {
      try {
        const runes = await api.getRunes(availableRealms[0]);
        setExistingRunes(runes);
      } catch {
        setExistingRunes([]);
      }
    };

    void loadRunes();
  }, [authLoading, isAuthenticated, availableRealms]);

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

  if (availableRealms.length === 0) {
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
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight">No Realms Found</h2>
          <p className="text-sm" style={{ color: "var(--color-border)" }}>
            You need access to a realm to create runes.
          </p>
        </div>
      </div>
    );
  }

  const updateForm = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canSubmit =
    form.title.trim().length >= 3 &&
    form.priority >= 1 &&
    form.priority <= 4 &&
    (form.status === "draft" || form.status === "open");

  const toggleDependency = (runeId: string) => {
    setSelectedDependants((prev) => prev.filter((id) => id !== runeId));
    setSelectedDependencies((prev) =>
      prev.includes(runeId) ? prev.filter((id) => id !== runeId) : [...prev, runeId]
    );
  };

  const toggleDependant = (runeId: string) => {
    setSelectedDependencies((prev) => prev.filter((id) => id !== runeId));
    setSelectedDependants((prev) =>
      prev.includes(runeId) ? prev.filter((id) => id !== runeId) : [...prev, runeId]
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const request: CreateRuneRequest = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        branch: form.branch.trim(),
      };

      const rune = await api.createRune(request);

      const dependencyRequests = selectedDependencies.map((targetId) =>
        api.addDependency({
          rune_id: rune.id,
          target_id: targetId,
          relationship: "blocked_by",
        })
      );
      const dependantRequests = selectedDependants.map((targetId) =>
        api.addDependency({
          rune_id: rune.id,
          target_id: targetId,
          relationship: "blocks",
        })
      );

      const linkResults = await Promise.allSettled([...dependencyRequests, ...dependantRequests]);
      const failedLinkCount = linkResults.filter((result) => result.status === "rejected").length;

      showToast("Rune Created", `"${rune.title}" has been created`, "success");
      if (failedLinkCount > 0) {
        showToast(
          "Dependency Warning",
          `${failedLinkCount} dependency link${failedLinkCount > 1 ? "s" : ""} failed to save`,
          "warning"
        );
      }

      navigate(`/runes/${rune.id}`);
    } catch {
      showToast("Error", "Failed to create rune", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/runes")}
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all duration-150 hover:translate-x-[-2px]"
          style={{ color: "var(--color-border)" }}
        >
          <span>&larr;</span>
          <span>Back to Runes</span>
        </button>
      </div>

      <div
        className="max-w-6xl mx-auto p-6"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "2px solid var(--color-border)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-wider block mb-2 font-bold">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="Enter a descriptive title..."
                className="w-full px-4 py-3 text-lg outline-none"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider block mb-2 font-bold">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Add details about what this rune involves..."
                rows={6}
                className="w-full px-4 py-3 text-base outline-none resize-none"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider block mb-2 font-bold">Branch</label>
              <input
                type="text"
                value={form.branch}
                onChange={(e) => updateForm("branch", e.target.value)}
                placeholder="e.g., feature/my-feature"
                className="w-full px-4 py-3 text-base font-mono outline-none"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "2px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-wider block mb-3 font-bold">Priority</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 4, label: "P1" },
                  { value: 3, label: "P2" },
                  { value: 2, label: "P3" },
                  { value: 1, label: "P4" },
                ].map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => updateForm("priority", priority.value)}
                    className="px-3 py-2 text-sm font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor:
                        form.priority === priority.value ? "var(--color-amber)" : "var(--color-bg)",
                      border: "2px solid var(--color-border)",
                      color: form.priority === priority.value ? "white" : "var(--color-text)",
                    }}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider block mb-3 font-bold">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {["draft", "open"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateForm("status", status as FormData["status"])}
                    className="px-3 py-2 text-sm font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor:
                        form.status === status ? "var(--color-amber)" : "var(--color-bg)",
                      border: "2px solid var(--color-border)",
                      color: form.status === status ? "white" : "var(--color-text)",
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div
                className="p-4"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h3 className="text-xs uppercase tracking-wider font-bold mb-3">
                  Dependencies (this rune depends on)
                </h3>
                <div className="space-y-2 max-h-44 overflow-auto">
                  {existingRunes.map((rune) => (
                    <label key={`dep-${rune.id}`} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDependencies.includes(rune.id)}
                        onChange={() => toggleDependency(rune.id)}
                      />
                      <span className="font-mono text-xs" style={{ color: "var(--color-border)" }}>
                        {rune.id.slice(0, 8)}
                      </span>
                      <span className="truncate">{rune.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div
                className="p-4"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h3 className="text-xs uppercase tracking-wider font-bold mb-3">
                  Dependants (blocked by this rune)
                </h3>
                <div className="space-y-2 max-h-44 overflow-auto">
                  {existingRunes.map((rune) => (
                    <label key={`dependant-${rune.id}`} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedDependants.includes(rune.id)}
                        onChange={() => toggleDependant(rune.id)}
                      />
                      <span className="font-mono text-xs" style={{ color: "var(--color-border)" }}>
                        {rune.id.slice(0, 8)}
                      </span>
                      <span className="truncate">{rune.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/runes")}
            className="px-6 py-3 text-sm font-bold uppercase tracking-wider"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "2px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="px-6 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--color-amber)",
              border: "2px solid var(--color-border)",
              color: "white",
            }}
          >
            {isSubmitting ? "Creating..." : "Create Rune"}
          </button>
        </div>
      </div>
    </div>
  );
}
