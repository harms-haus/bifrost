// Realm status
export type RealmStatus = "active" | "suspended";

// Realm list entry
export interface RealmListEntry {
  realm_id: string;
  name: string;
  status: RealmStatus;
  created_at: string;
}

// Realm member
export interface RealmMember {
  account_id: string;
  username: string;
  role: string;
}

// Realm detail
export interface RealmDetail extends RealmListEntry {
  members: RealmMember[];
}

// Create realm request
export interface CreateRealmRequest {
  name: string;
}

// Assign role request
export interface AssignRoleRequest {
  account_id: string;
  realm_id: string;
  role: string;
}

// Revoke role request
export interface RevokeRoleRequest {
  account_id: string;
  realm_id: string;
}
