// Rune status type
export type RuneStatus =
  | "draft"
  | "open"
  | "claimed"
  | "fulfilled"
  | "sealed"
  | "shattered";

// Rune list item (from /runes endpoint)
export interface RuneListItem {
  id: string;
  title: string;
  status: RuneStatus;
  priority: number;
  claimant?: string;
  parent_id?: string;
  branch?: string;
  created_at: string;
  updated_at: string;
}

// Dependency reference
export interface DependencyRef {
  target_id: string;
  relationship:
    | "blocked_by"
    | "blocks"
    | "relates_to"
    | "duplicates"
    | "parent_of"
    | "child_of";
}

// Note entry
export interface NoteEntry {
  text: string;
  created_at: string;
}

// Rune detail (from /rune?id= endpoint)
export interface RuneDetail extends RuneListItem {
  description?: string;
  dependencies: DependencyRef[];
  notes: NoteEntry[];
}

// Create rune request
export interface CreateRuneRequest {
  title: string;
  description?: string;
  priority?: number;
  parent_id?: string;
  branch?: string;
}

// Update rune request
export interface UpdateRuneRequest {
  id: string;
  title?: string;
  description?: string;
  priority?: number;
  branch?: string;
}

// Add dependency request
export interface AddDependencyRequest {
  source_id: string;
  target_id: string;
  relationship: DependencyRef["relationship"];
}

// Remove dependency request
export interface RemoveDependencyRequest {
  source_id: string;
  target_id: string;
  relationship: DependencyRef["relationship"];
}

// Add note request
export interface AddNoteRequest {
  id: string;
  text: string;
}

// Rune filters for list endpoint
export interface RuneFilters {
  status?: RuneStatus;
  priority?: number;
  assignee?: string;
  branch?: string;
  blocked?: boolean;
  is_saga?: boolean;
}
