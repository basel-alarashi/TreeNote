export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  displayName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
