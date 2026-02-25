import type { AccountListEntry } from "@/types";

interface AccountTableProps {
  accounts: AccountListEntry[];
  onViewAccount: (accountId: string) => void;
  onSuspendAccount: (accountId: string, suspend: boolean) => void;
}

/**
 * AccountTable displays a table of accounts with their details.
 * Allows viewing account details and suspending/unsuspending accounts.
 */
export function AccountTable({
  accounts,
  onViewAccount,
  onSuspendAccount,
}: AccountTableProps) {
  if (accounts.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8">
        No accounts found.
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
            Username
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
            Realms
          </th>
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            PATs
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
        {accounts.map((account) => (
          <tr
            key={account.account_id}
            className="border-b border-slate-700/50 hover:bg-slate-800/50 cursor-pointer"
            onClick={() => onViewAccount(account.account_id)}
          >
            <td className="py-3 px-4">
              <span className="text-white font-medium">{account.username}</span>
            </td>
            <td className="py-3 px-4">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(account.status)}`}
              >
                {account.status}
              </span>
            </td>
            <td className="py-3 px-4 text-slate-300">
              {account.realms.length}
            </td>
            <td className="py-3 px-4 text-slate-300">
              {account.pat_count}
            </td>
            <td className="py-3 px-4 text-slate-400 text-sm">
              {new Date(account.created_at).toLocaleDateString()}
            </td>
            <td className="py-3 px-4">
              {account.status === "active" ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSuspendAccount(account.account_id, true);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                  aria-label={`Suspend ${account.username}`}
                >
                  Suspend
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSuspendAccount(account.account_id, false);
                  }}
                  className="text-green-400 hover:text-green-300 text-sm"
                  aria-label={`Unsuspend ${account.username}`}
                >
                  Unsuspend
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
