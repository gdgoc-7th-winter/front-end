import type { CommonResponse } from "./auth";

export type ProfileTrack = "BACKEND" | "FRONTEND" | "AI" | "DESIGN";

export type ProfileTechStack =
  | "JAVA"
  | "SPRING_BOOT"
  | "REACT"
  | "PYTHON"
  | "DJANGO"
  | "MYSQL"
  | "AWS"
  | "DOCKER";

export interface ProfileSetupRequest {
  nickname: string;
  studentId: string;
  departmentId: number;
  profilePicture: string;
  trackNames: ProfileTrack[];
  techStackNames: ProfileTechStack[];
  introduction: string;
}

export type ProfileSetupResponse = CommonResponse<string>;
