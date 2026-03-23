import type { CommonResponse } from "../types/auth";
import type { ProfileSetupRequest, ProfileTechStack, ProfileTrack } from "../types/profile";
import { ApiRequestError, getWithCookies, patchWithCookies, postWithCookies } from "./http";

const CURRENT_USER_PATH = "/api/v1/me/profile";
const PROFILE_SETUP_PATH = "/api/v1/me/profile-setup";
const PROFILE_UPDATE_PATH = "/api/v1/me/profile";

const PROFILE_SETUP_REQUIRED_MESSAGE_PATTERNS = [/프로필/, /초기.*설정/, /profile/i, /setup/i];

export class ProfileRequestError extends ApiRequestError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = "ProfileRequestError";
  }
}

export interface CurrentUserResponse {
  email?: string;
  nickname: string;
  studentId?: string;
  departmentId?: number;
  department?: string;
  departmentName?: string;
  profileImage?: string;
  profilePicture?: string;
  track?: ProfileTrack;
  trackName?: string;
  primaryTrack?: string;
  primaryTrackName?: string;
  mainTrack?: string;
  mainTrackName?: string;
  tracks?: string[];
  trackNames?: ProfileTrack[];
  techStacks?: ProfileTechStack[];
  techStackNames?: ProfileTechStack[];
  introduction?: string;
  isDummyProfile?: boolean;
}

function createProfileError(message: string, status?: number) {
  return new ProfileRequestError(message, status);
}

function requestProfileGet<T>(path: string) {
  return getWithCookies<T>(path, {
    errorFactory: createProfileError,
  });
}

function requestProfilePost<T, B>(path: string, body: B) {
  return postWithCookies<T, B>(path, body, {
    errorFactory: createProfileError,
  });
}

function requestProfilePatch<T, B>(path: string, body: B) {
  return patchWithCookies<T, B>(path, body, {
    errorFactory: createProfileError,
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toProfileTrack(value: unknown): ProfileTrack | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim().toUpperCase();

  switch (normalizedValue) {
    case "BACKEND":
    case "백엔드":
      return "BACKEND";
    case "FRONTEND":
    case "프론트엔드":
      return "FRONTEND";
    case "AI":
      return "AI";
    case "DESIGN":
    case "디자인":
      return "DESIGN";
    default:
      return undefined;
  }
}

function toProfileTrackList(value: unknown): ProfileTrack[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedTracks = value
    .map((item) => toProfileTrack(item))
    .filter((item): item is ProfileTrack => item !== undefined);

  return Array.from(new Set(normalizedTracks));
}

function normalizeCurrentUserResponse(profile: CurrentUserResponse): CurrentUserResponse {
  const candidateTracks = [
    ...toProfileTrackList(profile.trackNames),
    ...toProfileTrackList(profile.tracks),
    toProfileTrack(profile.track),
    toProfileTrack(profile.trackName),
    toProfileTrack(profile.primaryTrack),
    toProfileTrack(profile.primaryTrackName),
    toProfileTrack(profile.mainTrack),
    toProfileTrack(profile.mainTrackName),
  ].filter((track): track is ProfileTrack => track !== undefined);

  const trackNames = Array.from(new Set(candidateTracks));

  return {
    ...profile,
    track: trackNames[0] ?? undefined,
    trackNames,
  };
}

export async function getCurrentUser() {
  const response = await requestProfileGet<CurrentUserResponse>(CURRENT_USER_PATH);
  const normalizedData = isObject(response.data) ? normalizeCurrentUserResponse(response.data as CurrentUserResponse) : response.data;

  console.log("[profile] current user response", {
    path: CURRENT_USER_PATH,
    raw: response.data,
    normalized: normalizedData,
  });

  return {
    ...response,
    data: normalizedData,
  };
}

export function submitProfileSetup(payload: ProfileSetupRequest) {
  return requestProfilePost<string, ProfileSetupRequest>(PROFILE_SETUP_PATH, payload);
}

export function updateMyProfile(payload: ProfileSetupRequest) {
  return requestProfilePatch<string, ProfileSetupRequest>(PROFILE_UPDATE_PATH, payload);
}

export function isProfileSetupRequiredError(error: unknown) {
  if (!(error instanceof ProfileRequestError) || error.status !== 403) {
    return false;
  }

  return PROFILE_SETUP_REQUIRED_MESSAGE_PATTERNS.some((pattern) => pattern.test(error.message));
}

export type CurrentUserResponseResult = CommonResponse<CurrentUserResponse>;
