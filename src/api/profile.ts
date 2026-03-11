import type { ProfileSetupRequest } from "../types/profile";
import { getWithCookies, postWithCookies } from "./http";

export class ProfileRequestError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ProfileRequestError";
    this.status = status;
  }
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
}

export function getCurrentUser() {
  return requestProfile<CurrentUserResponse, never>("/api/users/me", {
    method: "GET",
  });
}
