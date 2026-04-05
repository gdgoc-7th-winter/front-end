
import type {
  ChangePasswordRequest,
  EmailVerificationRequest,
  LoginRequest,
  SignUpRequest,
  VerifyEmailCodeRequest,
} from "../types/auth";
import { buildApiUrl, getWithCookies, postWithCookies } from "./http";

export type SocialAuthProvider = "google" | "kakao" | "naver" | "github";

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

async function refreshPasswordChangeContext() {
  await getWithCookies<unknown>("/api/v1/me/profile");
}

export async function changePassword(payload: ChangePasswordRequest) {
  await refreshPasswordChangeContext();
  return requestAuth<string, ChangePasswordRequest>("/api/v1/users/change-password", payload);
}

export function sendEmailVerification(payload: EmailVerificationRequest) {
  return requestAuth<string, EmailVerificationRequest>("/api/v1/auth/email-verification", payload);
}

export function verifyEmailCode(payload: VerifyEmailCodeRequest) {
  return requestAuth<string, VerifyEmailCodeRequest>("/api/v1/auth/verify-code", payload);
}

function redirectToAuthPage(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign(buildApiUrl(path));
}

export function startSocialLogin(provider: SocialAuthProvider) {
  redirectToAuthPage(`/api/v1/oauth2/login/${provider}`);
}

export function connectSocialLogin(provider: SocialAuthProvider) {
  redirectToAuthPage(`/api/v1/oauth2/connect/${provider}`);
}
