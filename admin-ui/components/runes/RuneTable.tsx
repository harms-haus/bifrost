import type { RuneListItem } from "@/types";
import { Badge } from "@/components/common";

interface RuneTableProps {
  runes: RuneListItem[];
  onViewRune: (runeId: string) => void;
}

const statusVariants: Record<string, "default" | "success" | "warning" | "error" | "info" | "purple"> = {
  draft: "default",
  open: "info",
  claimed: "warning",
  fulfilled: "success",
  sealed: "default",
  shattered: "error",
};

const priorityLabels: Record<number, string> = {
  0: "None",
  1: "Urgent",
  2: "High",
  3: "Normal",
  4: "Low",
};

export function RuneTable({ runes, onViewRune }: RuneTableProps) {
  if (runes.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8">
        No runes found.
      </div>
    );
  }

  return (
    <table className="w-full" role="table">
      <thead>
        <tr className="border-b border-slate-700">
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            ID
          </th>
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            Title
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
            Priority
          </th>
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            Assignee
          </th>
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            Branch
          </th>
          <th
            className="text-left py-3 px-4 text-sm font-medium text-slate-400"
            role="columnheader"
          >
            Created
          </th>
        </tr>
      </thead>
      <tbody>
        {runes.map((rune) => (
          <tr
            key={rune.id}
            className="border-b border-slate-700/50 hover:bg-slate-800/50 cursor-pointer"
            onClick={() => onViewRune(rune.id)}
          >
            <td className="py-3 px-4">
              <span className="text-slate-400 font-mono text-sm">{rune.id}</span>
            </td>
            <td className="py-3 px-4">
              <span className="text-white font-medium">{rune.title}</span>
            </td>
            <td className="py-3 px-4">
              <Badge variant={statusVariants[rune.status] || "default"}>
                {rune.status}
              </Badge>
            </td>
            <td className="py-3 px-4 text-slate-300">
              {priorityLabels[rune.priority] || rune.priority}
            </td>
            <td className="py-3 px-4 text-slate-300">
              {rune.claimant || <span className="text-slate-500 italic">Unassigned</span>}
            </td>
            <td className="py-3 px-4">
              {rune.branch ? (
                <code className="text-xs bg-slate-700 px-2 py-0.5 text-slate-300">
                  {rune.branch}
                </code>
              ) : (
                <span className="text-slate-500 italic text-sm">No branch</span>
              )}
            </td>
            <td className="py-3 px-4 text-slate-400 text-sm">
              {new Date(rune.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
