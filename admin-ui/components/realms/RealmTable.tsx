import type { RealmListEntry } from "@/types";

interface RealmTableProps {
  realms: RealmListEntry[];
  onViewRealm: (realmId: string) => void;
}

/**
 * RealmTable displays a table of realms with their details.
 * Allows viewing realm details.
 */
export function RealmTable({ realms, onViewRealm }: RealmTableProps) {
  if (!realms || realms.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8">
        No realms found.
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "suspended":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <table className="w-full" role="table">
      <thead>
        <tr className="border-b border-slate-700">
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            Name
          </th>
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            Status
          </th>
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            Created
          </th>
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {realms.map((realm) => (
          <tr
            key={realm.realm_id}
            className="border-b border-slate-700/50 hover:bg-slate-800/50 cursor-pointer"
            onClick={() => onViewRealm(realm.realm_id)}
          >
            <td className="py-3 px-4">
              <span className="text-white font-medium">{realm.name}</span>
            </td>
            <td className="py-3 px-4">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(realm.status)}`}
              >
                {realm.status}
              </span>
            </td>
            <td className="py-3 px-4 text-slate-400 text-sm">
              {new Date(realm.created_at).toLocaleDateString()}
            </td>
            <td className="py-3 px-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewRealm(realm.realm_id);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
                aria-label={`View ${realm.name}`}
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
