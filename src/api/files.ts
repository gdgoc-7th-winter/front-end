
import { postWithCookies } from "./http";

type UploadType = "PROFILE_IMAGE" | "POST_IMAGE";

interface PresignedUrlRequest {
  uploadType: UploadType;
  contentType: string;
  referenceId?: number;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  objectKey: string;
  accessType: string;
  expiresIn: number;
}

interface CompleteUploadRequest {
  objectKey: string;
  uploadType: UploadType;
  size: number;
  contentType: string;
}

interface CompleteUploadResponse {
  fileId: number;
  objectKey: string;
  accessType: string;
  resolvedUrl: string;
}

const PROFILE_IMAGE_UPLOAD_TYPE: UploadType = "PROFILE_IMAGE";
const POST_IMAGE_UPLOAD_TYPE: UploadType = "POST_IMAGE";

async function requestPresignedUrl(body: PresignedUrlRequest) {
  return postWithCookies<PresignedUrlResponse, PresignedUrlRequest>("/api/v1/files/presigned-url", body);
}

async function completeUpload(body: CompleteUploadRequest) {
  return postWithCookies<CompleteUploadResponse, CompleteUploadRequest>("/api/v1/files/complete", body);
}

async function uploadFile(file: File, uploadType: UploadType, failureMessage: string, referenceId = 0) {
  const contentType = file.type || "application/octet-stream";
  const presignedUrlResponse = await requestPresignedUrl({
    uploadType,
    contentType,
    referenceId,
  });

  const uploadResponse = await fetch(presignedUrlResponse.data.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(failureMessage);
  }

  const completedUploadResponse = await completeUpload({
    objectKey: presignedUrlResponse.data.objectKey,
    uploadType,
    size: file.size,
    contentType,
  });

  return completedUploadResponse.data;
}

export function uploadProfileImage(file: File) {
  return uploadFile(file, PROFILE_IMAGE_UPLOAD_TYPE, "프로필 사진 업로드에 실패했습니다.");
}

export function uploadPostImage(file: File, referenceId?: number) {
  return uploadFile(file, POST_IMAGE_UPLOAD_TYPE, "게시글 이미지 업로드에 실패했습니다.", referenceId ?? 0);
}
