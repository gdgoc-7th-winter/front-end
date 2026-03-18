import type { ProfileSetupRequest } from "../types/profile";
import { getWithCookies, postWithCookies } from "./http";

export const PROFILE_SETUP_REQUIRED_MESSAGE = "프로필 설정을 먼저 완료해주세요.";

export class ProfileRequestError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ProfileRequestError";
    this.status = status;
  }
}

export function isProfileSetupRequiredError(error: unknown) {
  if (!(error instanceof ProfileRequestError)) {
    return false;
  }

  const normalizedMessage = error.message.replace(/\s+/g, "");

  return (
    normalizedMessage.includes("프로필설정") ||
    normalizedMessage.includes("프로필을먼저완료") ||
    (error.status === 403 && normalizedMessage.includes("접근권한이없습니다"))
  );
}

interface RequestProfileOptions<B> {
  body?: B;
  method?: "GET" | "POST";
}

async function requestProfile<T, B>(path: string, options?: RequestProfileOptions<B>) {
  if (options?.method === "GET") {
    return getWithCookies<T>(path, {
      errorFactory: (message, status) => new ProfileRequestError(message, status),
    });
  }

  return postWithCookies<T, B>(path, options?.body as B, {
    errorFactory: (message, status) => new ProfileRequestError(message, status),
  });
}

export function submitProfileSetup(payload: ProfileSetupRequest) {
  return requestProfile<string, ProfileSetupRequest>("/api/users/profile-setup", {
    method: "POST",
    body: payload,
  });
}

export interface CurrentUserResponse {
  email?: string;
  nickname?: string;
  studentId?: string;
  department?: string;
  profilePicture?: string;
  track?: string;
  techStacks?: string[];
  interests?: string[];
  isDummyProfile?: boolean;
}

export function getCurrentUser() {
  return requestProfile<CurrentUserResponse, never>("/api/users/me", {
    method: "GET",
  });
}
