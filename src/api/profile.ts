import type { CommonResponse } from "../types/auth";
import type { ProfileSetupRequest, ProfileTechStack, ProfileTrack } from "../types/profile";
import { ApiRequestError, deleteWithCookies, getWithCookies, patchWithCookies, postWithCookies } from "./http";

const CURRENT_USER_PATH = "/api/v1/me/profile";
const PROFILE_SETUP_PATH = "/api/v1/users/profile-setup";
const PROFILE_UPDATE_PATH = "/api/v1/me/profile";

export class ProfileRequestError extends ApiRequestError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = "ProfileRequestError";
  }
}

export type SocialAuthProvider = "google" | "kakao" | "naver" | "github";

export interface SocialAccount {
  provider: SocialAuthProvider;
  email?: string;
}

export interface CurrentUserResponse {
  email?: string;
  nickname: string;
  studentId?: string;
  college?: string;
  departmentId?: number;
  department?: string;
  departmentName?: string;
  profileImage?: string;
  profilePicture?: string;
  profileImgUrl?: string;
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
  userPoint?: number;
  levelBadgeName?: string;
  authority?: string;
  introduction?: string;
  socialAccounts?: SocialAccount[];
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

function requestProfileDelete<T>(path: string) {
  return deleteWithCookies<T>(path, {
    errorFactory: createProfileError,
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
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

function toProfileTechStack(value: unknown): ProfileTechStack | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim().toUpperCase();

  switch (normalizedValue) {
    case "JAVA":
    case "SPRING_BOOT":
    case "REACT":
    case "PYTHON":
    case "DJANGO":
    case "MYSQL":
    case "AWS":
    case "DOCKER":
      return normalizedValue;
    default:
      return undefined;
  }
}

function toProfileTechStackList(value: unknown): ProfileTechStack[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedTechStacks = value
    .map((item) => toProfileTechStack(item))
    .filter((item): item is ProfileTechStack => item !== undefined);

  return Array.from(new Set(normalizedTechStacks));
}

function toSocialAuthProvider(value: unknown): SocialAuthProvider | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  switch (value.trim().toLowerCase()) {
    case "google":
    case "kakao":
    case "naver":
    case "github":
      return value.trim().toLowerCase() as SocialAuthProvider;
    default:
      return undefined;
  }
}

function normalizeSocialAccounts(value: unknown): SocialAccount[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedAccounts = value
    .map((item): SocialAccount | null => {
      if (typeof item === "string") {
        const provider = toSocialAuthProvider(item);

        return provider ? { provider } : null;
      }

      if (!isObject(item)) {
        return null;
      }

      const provider = toSocialAuthProvider(item["provider"] ?? item["socialProvider"] ?? item["providerName"]);

      if (!provider) {
        return null;
      }

      return {
        provider,
        email: getTrimmedString(item["email"] ?? item["accountEmail"] ?? item["socialEmail"]),
      };
    })
    .filter((item): item is SocialAccount => item !== null);

  return Array.from(new Map(normalizedAccounts.map((account) => [account.provider, account])).values());
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
  const techStackNames = [
    ...toProfileTechStackList(profile.techStackNames),
    ...toProfileTechStackList(profile.techStacks),
  ];
  const normalizedDepartmentName = getTrimmedString(profile.department) ?? getTrimmedString(profile.departmentName);
  const normalizedProfileImage =
    getTrimmedString(profile.profileImage) ??
    getTrimmedString(profile.profilePicture) ??
    getTrimmedString(profile.profileImgUrl);
  const normalizedAuthority = getTrimmedString(profile.authority)?.toUpperCase();
  const socialAccounts = normalizeSocialAccounts(profile.socialAccounts);

  return {
    ...profile,
    studentId: getTrimmedString(profile.studentId),
    department: normalizedDepartmentName,
    departmentName: normalizedDepartmentName,
    profileImage: normalizedProfileImage,
    profilePicture: normalizedProfileImage,
    profileImgUrl: normalizedProfileImage,
    track: trackNames[0] ?? undefined,
    trackNames,
    techStacks: techStackNames,
    techStackNames,
    authority: normalizedAuthority,
    introduction: getTrimmedString(profile.introduction),
    socialAccounts,
    isDummyProfile: profile.isDummyProfile ?? normalizedAuthority === "DUMMY",
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

export function deleteMyProfile() {
  return requestProfileDelete<string>(PROFILE_UPDATE_PATH);
}

export type CurrentUserResponseResult = CommonResponse<CurrentUserResponse>;
