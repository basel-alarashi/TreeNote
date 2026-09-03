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

export interface AuthResult {
  userId: string;
  email: string;
  accessToken: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
}
