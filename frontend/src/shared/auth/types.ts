export type UserRole = "FREE" | "VIP" | "ZEUS";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  showAdultContent: boolean;
  hideAdultContentFromVisitors: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}
