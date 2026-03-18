export interface SignUpRequest {
  email: string;
  password: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface VerifyEmailCodeRequest {
  email: string;
  authCode: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CommonResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
