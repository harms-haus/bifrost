import { useRealm } from "../../lib/realm";

export function RealmSelector() {
  const { currentRealm, setCurrentRealm, availableRealms, isLoading } = useRealm();
  const selectedRealm =
    currentRealm && availableRealms.includes(currentRealm)
      ? currentRealm
      : availableRealms[0] ?? "";

  if (isLoading) {
    return (
      <div
        className="text-xs uppercase tracking-wider px-3 py-2"
        style={{ color: "var(--color-border)" }}
      >
        Loading realms...
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        id="realm-select"
        aria-label="Realm"
        value={selectedRealm}
        onChange={(e) => {
          const value = e.target.value || null;
          if (value) {
            setCurrentRealm(value);
          }
        }}
        className="px-3 py-2 pr-8 text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "2px solid var(--color-border)",
          color: "var(--color-text)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        {availableRealms.length === 0 ? (
          <option value="" disabled>
            No realms available
          </option>
        ) : (
          availableRealms.map((realm) => (
            <option key={realm} value={realm}>
              {realm}
            </option>
          ))
        )}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs"
        style={{ color: "var(--color-border)" }}
      >
        v
      </span>
    </div>
  );
}
