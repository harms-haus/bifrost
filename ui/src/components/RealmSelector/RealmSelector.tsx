import { useRealm } from "../../lib/realm";

export function RealmSelector() {
  const { currentRealm, setCurrentRealm, availableRealms, isLoading } = useRealm();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading realms...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="realm-select" className="text-sm font-medium">
        Realm:
      </label>
      <select
        id="realm-select"
        value={currentRealm || ""}
        onChange={(e) => {
          const value = e.target.value || null;
          if (value) {
            setCurrentRealm(value);
          }
        }}
        className="border border-gray-300 bg-white px-2 py-1 text-sm rounded-none"
      >
        {availableRealms.map((realm) => (
          <option key={realm} value={realm}>
            {realm}
          </option>
        ))}
      </select>
    </div>
  );
}
