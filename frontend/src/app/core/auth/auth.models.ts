export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResult {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
}
