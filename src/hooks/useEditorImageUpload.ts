import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { Editor } from "@tiptap/react";
import { uploadPostImage } from "../api/files";

export type UploadedEditorImage = {
  fileId: number;
  resolvedUrl: string;
  fileName: string;
  contentType: string;
  fileSize: number;
};

export type PendingEditorImage = {
  localSrc: string;
  file: File;
  fileName: string;
  contentType: string;
  fileSize: number;
};

type UseEditorImageUploadOptions = {
  editor: Editor | null;
  onError: (message: string | null) => void;
  referenceId?: number | null;
  onUploaded?: (image: UploadedEditorImage) => void;
  onPendingAdd?: (image: PendingEditorImage) => void;
  onImagesChange?: (imageSrcs: string[]) => void;
};

function extractEditorImageSources(editor: Editor | null) {
  if (!editor || typeof DOMParser === "undefined") {
    return [];
  }

  const document = new DOMParser().parseFromString(editor.getHTML(), "text/html");

  return Array.from(document.querySelectorAll("img"))
    .map((imageElement) => imageElement.getAttribute("src")?.trim() || "")
    .filter(Boolean);
}

export async function uploadPendingEditorImages(pendingImages: PendingEditorImage[], referenceId: number) {
  return Promise.all(
    pendingImages.map(async (pendingImage) => {
      const uploadedFile = await uploadPostImage(pendingImage.file, referenceId);

      return {
        localSrc: pendingImage.localSrc,
        fileId: uploadedFile.fileId,
        resolvedUrl: uploadedFile.resolvedUrl,
        fileName: pendingImage.fileName,
        contentType: pendingImage.contentType,
        fileSize: pendingImage.fileSize,
      };
    }),
  );
}

export function useEditorImageUpload({
  editor,
  onError,
  referenceId,
  onUploaded,
  onPendingAdd,
  onImagesChange,
}: UseEditorImageUploadOptions) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const onErrorRef = useRef(onError);
  const onUploadedRef = useRef(onUploaded);
  const onPendingAddRef = useRef(onPendingAdd);
  const onImagesChangeRef = useRef(onImagesChange);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onUploadedRef.current = onUploaded;
  }, [onUploaded]);

  useEffect(() => {
    onPendingAddRef.current = onPendingAdd;
  }, [onPendingAdd]);

  useEffect(() => {
    onImagesChangeRef.current = onImagesChange;
  }, [onImagesChange]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const notifyImageChange = () => {
      onImagesChangeRef.current?.(extractEditorImageSources(editor));
    };

    notifyImageChange();
    editor.on("update", notifyImageChange);

    return () => {
      editor.off("update", notifyImageChange);
    };
  }, [editor]);

  const openImagePicker = useCallback(() => {
    if (isUploadingImage) {
      return;
    }

    imageInputRef.current?.click();
  }, [isUploadingImage]);

  const handleImageUploadChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      onErrorRef.current("이미지 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    onErrorRef.current(null);
    setIsUploadingImage(true);

    try {
      if (referenceId && referenceId > 0) {
        const uploadedFile = await uploadPostImage(file, referenceId);
        editor
          ?.chain()
          .focus()
          .setImage({
            src: uploadedFile.resolvedUrl,
            alt: file.name,
          })
          .run();
        onUploadedRef.current?.({
          fileId: uploadedFile.fileId,
          resolvedUrl: uploadedFile.resolvedUrl,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        });
      } else {
        const localSrc = URL.createObjectURL(file);
        objectUrlsRef.current.push(localSrc);
        editor
          ?.chain()
          .focus()
          .setImage({
            src: localSrc,
            alt: file.name,
          })
          .run();
        onPendingAddRef.current?.({
          localSrc,
          file,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        });
      }
    } catch (error) {
      onErrorRef.current(error instanceof Error ? error.message : "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }, [editor, referenceId]);

  return {
    imageInputRef,
    isUploadingImage,
    openImagePicker,
    handleImageUploadChange,
  };
}
