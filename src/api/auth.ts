
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
  return requestAuth<string, SignUpRequest>("/api/v1/users/signup", payload);
}

export function login(payload: LoginRequest) {
  return requestAuth<string, LoginRequest>("/api/v1/users/login", payload);
}

export function logout() {
  return requestAuth<string, Record<string, never>>("/api/v1/users/logout", {});
}

export function sendEmailVerification(payload: EmailVerificationRequest) {
  return requestAuth<string, EmailVerificationRequest>("/api/v1/auth/email-verification", payload);
}

export function verifyEmailCode(payload: VerifyEmailCodeRequest) {
  return requestAuth<string, VerifyEmailCodeRequest>("/api/v1/auth/verify-code", payload);
}
