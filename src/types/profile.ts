import type { CommonResponse } from "./auth";

export type ProfileTrack = "BACKEND" | "FRONTEND" | "AI" | "DESIGN";

export type ProfileTechStack =
  | "JAVA"
  | "SPRING"
  | "JAVASCRIPT"
  | "TYPESCRIPT"
  | "REACT"
  | "NODE"
  | "PYTHON";

export type ProfileInterest = "STUDY" | "PROJECT" | "NETWORKING" | "CONTEST";

export interface ProfileSetupRequest {
  nickname: string;
  studentId: string;
  department: string;
  profilePicture: string;
  track: ProfileTrack;
  techStacks: ProfileTechStack[];
  interests: ProfileInterest[];
}

export type ProfileSetupResponse = CommonResponse<string>;
