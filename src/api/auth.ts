import type {
  EmailVerificationRequest,
  LoginRequest,
  SignUpRequest,
  VerifyEmailCodeRequest,
} from "../types/auth";
import { postWithCookies } from "./http";

async function requestAuth<T, B>(path: string, body: B) {
  return postWithCookies<T, B>(path, body);
}

export function signUp(payload: SignUpRequest) {
  return requestAuth<string, SignUpRequest>("/api/users/signup", payload);
}

export function login(payload: LoginRequest) {
  return requestAuth<string, LoginRequest>("/api/users/login", payload);
}

export function sendEmailVerification(payload: EmailVerificationRequest) {
  return requestAuth<string, EmailVerificationRequest>("/api/auth/email-verification", payload);
}

export function verifyEmailCode(payload: VerifyEmailCodeRequest) {
  return requestAuth<string, VerifyEmailCodeRequest>("/api/auth/verify-code", payload);
}
