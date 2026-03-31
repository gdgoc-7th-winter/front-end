
import { postWithCookies } from "./http";

type UploadType = "PROFILE_IMAGE";

const FILES_PRESIGNED_URL_PATH = "/api/v1/files/presigned-url";
const FILES_COMPLETE_PATH = "/api/v1/files/complete";

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

async function requestPresignedUrl(body: PresignedUrlRequest) {
  return postWithCookies<PresignedUrlResponse, PresignedUrlRequest>(FILES_PRESIGNED_URL_PATH, body);
}

async function completeUpload(body: CompleteUploadRequest) {
  return postWithCookies<CompleteUploadResponse, CompleteUploadRequest>(FILES_COMPLETE_PATH, body);
}

export async function uploadProfileImage(file: File) {
  const contentType = file.type || "application/octet-stream";
  const presignedUrlResponse = await requestPresignedUrl({
    uploadType: PROFILE_IMAGE_UPLOAD_TYPE,
    contentType,
    referenceId: 0,
  });

  const uploadResponse = await fetch(presignedUrlResponse.data.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("프로필 사진 업로드에 실패했습니다.");
  }

  const completedUploadResponse = await completeUpload({
    objectKey: presignedUrlResponse.data.objectKey,
    uploadType: PROFILE_IMAGE_UPLOAD_TYPE,
    size: file.size,
    contentType,
  });

  return completedUploadResponse.data;
}
