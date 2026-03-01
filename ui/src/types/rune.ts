export type RuneStatus = "draft" | "open" | "in_progress" | "fulfilled" | "sealed";

export interface RuneListItem {
  id: string;
  title: string;
  status: RuneStatus;
  priority: number;
  realm_id: string;
  created_at: string;
  updated_at: string;
}


export interface RuneDetail extends RuneListItem {
  description: string;
  saga_id?: string;
  assignee_id?: string;
  dependencies: string[];
  tags: string[];
}

export interface CreateRuneRequest {
  title: string;
  description?: string;
  realm_id: string;
  saga_id?: string;
  tags?: string[];
}
