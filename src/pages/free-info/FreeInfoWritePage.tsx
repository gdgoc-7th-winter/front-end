import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
  X,
} from "lucide-react";
import { createBoardPost, getPostDetail, updatePost, type UpdatePostAttachmentRequest } from "../../api/posts";
import { uploadPendingEditorImages, useEditorImageUpload, type PendingEditorImage } from "../../hooks/useEditorImageUpload";

const FREE_INFO_BOARD_CODE = "GENERAL";
const BOARD_OPTIONS = [{ label: "자유/정보 게시판", value: "free-info" }] as const;
const DEFAULT_TAGS = ["자유주제", "질문", "공유"];
const MAX_TAG_COUNT = 20;

type FreeInfoWriteFormValues = {
  board: "free-info";
  title: string;
  tagInput: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({ active = false, disabled = false, label, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      className={`grid h-8 w-8 place-items-center rounded-[4px] text-[#64748b] transition ${
        active ? "bg-[#eef6ff] text-[var(--color-primary-active)]" : "hover:bg-[#f8fafc]"
      } disabled:cursor-not-allowed disabled:opacity-40`}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function getThumbnailUrlFromContent(content: string) {
  if (typeof DOMParser === "undefined") {
    return "";
  }

  const document = new DOMParser().parseFromString(content, "text/html");
  const firstImage = document.querySelector("img");
  return firstImage?.getAttribute("src")?.trim() || "";
}

function toAttachmentRequest(
  attachment: {
    fileId?: number;
    fileUrl?: string;
    fileName: string;
    contentType: string;
    fileSize?: number;
    sortOrder?: number;
  },
  index: number,
): UpdatePostAttachmentRequest {
  return {
    fileId: attachment.fileId ? String(attachment.fileId) : undefined,
    fileUrl: attachment.fileUrl,
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    fileSize: attachment.fileSize ?? 0,
    sortOrder: attachment.sortOrder ?? index,
  };
}

export function FreeInfoWritePage() {
  const { postId } = useParams();
  const numericPostId = Number(postId);
  const isEditMode = Number.isInteger(numericPostId) && numericPostId > 0;
  const editPostDetailQuery = useQuery({
    queryKey: ["post-edit-detail", numericPostId],
    queryFn: async () => {
      const response = await getPostDetail(numericPostId);
      return response.data;
    },
    enabled: isEditMode,
    staleTime: 1000 * 60,
  });

  if (isEditMode) {
    if (editPostDetailQuery.isLoading) {
      return (
        <section className="grid gap-8 pt-2 md:gap-10">
          <div className="rounded-[24px] bg-white px-6 py-16 text-center text-sm text-[#94a3b8]">게시글 정보를 불러오는 중입니다...</div>
        </section>
      );
    }

    if (editPostDetailQuery.isError || !editPostDetailQuery.data) {
      return (
        <section className="grid gap-8 pt-2 md:gap-10">
          <div className="rounded-[24px] border border-red-100 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
            {editPostDetailQuery.error instanceof Error ? editPostDetailQuery.error.message : "게시글 정보를 불러오지 못했습니다."}
          </div>
        </section>
      );
    }
  }

  return (
    <FreeInfoPostEditor
      key={isEditMode ? `edit-${numericPostId}` : "create"}
      initialAttachments={editPostDetailQuery.data?.attachments ?? []}
      initialContent={editPostDetailQuery.data?.content ?? ""}
      initialTags={editPostDetailQuery.data?.tagNames ?? DEFAULT_TAGS}
      initialThumbnailUrl={editPostDetailQuery.data?.thumbnailUrl ?? undefined}
      initialTitle={editPostDetailQuery.data?.title ?? ""}
      mode={isEditMode ? "edit" : "create"}
      postId={isEditMode ? numericPostId : null}
    />
  );
}

type FreeInfoPostEditorProps = {
  mode: "create" | "edit";
  postId: number | null;
  initialTitle: string;
  initialContent: string;
  initialTags: string[];
  initialThumbnailUrl?: string;
  initialAttachments: Array<{
    fileUrl: string;
    fileName: string;
    contentType: string;
    fileSize?: number;
    sortOrder?: number;
  }>;
};

function FreeInfoPostEditor({
  mode,
  postId,
  initialTitle,
  initialContent,
  initialTags,
  initialThumbnailUrl,
  initialAttachments,
}: FreeInfoPostEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>(initialTags);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<UpdatePostAttachmentRequest[]>(
    initialAttachments.map(toAttachmentRequest),
  );
  const [pendingImages, setPendingImages] = useState<PendingEditorImage[]>([]);
  const [isFinalizingImages, setIsFinalizingImages] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FreeInfoWriteFormValues>({
    defaultValues: {
      board: "free-info",
      title: initialTitle,
      tagInput: "",
    },
  });

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] w-full text-base leading-8 text-[#475569] outline-none [&_h1]:text-[28px] [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:text-[22px] [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-[#dbeafe] [&_blockquote]:pl-4 [&_blockquote]:text-[#64748b] [&_code]:rounded [&_code]:bg-[#f8fafc] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.95em] [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-[16px] [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-[#94a3b8] [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        "data-placeholder": "여기에 여러분의 이야기를 들려주세요...",
      },
    },
  });
  const { imageInputRef, isUploadingImage, openImagePicker, handleImageUploadChange } = useEditorImageUpload({
    editor,
    onError: setSubmitError,
    referenceId: postId,
    onUploaded: (uploadedImage) => {
      setAttachmentFiles((currentAttachments) => [
        ...currentAttachments,
        toAttachmentRequest(
          {
            ...uploadedImage,
            fileUrl: uploadedImage.resolvedUrl,
          },
          currentAttachments.length,
        ),
      ]);
    },
    onPendingAdd: (pendingImage) => {
      setPendingImages((currentImages) => [...currentImages, pendingImage]);
    },
    onImagesChange: (imageSrcs) => {
      setPendingImages((currentImages) => currentImages.filter((image) => imageSrcs.includes(image.localSrc)));
      setAttachmentFiles((currentAttachments) =>
        currentAttachments.filter((attachment) => !attachment.fileUrl || imageSrcs.includes(attachment.fileUrl)),
      );
    },
  });

  const createPostMutation = useMutation({
    mutationFn: ({ title, content, nextTags }: { title: string; content: string; nextTags: string[] }) =>
      createBoardPost(FREE_INFO_BOARD_CODE, {
        title,
        content,
        tags: nextTags,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["board-posts", "free-info"] });
      navigate("/free-info");
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "게시글 등록에 실패했습니다.");
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ title, content, nextTags }: { title: string; content: string; nextTags: string[] }) => {
      if (!postId) {
        throw new Error("수정할 게시글 정보를 찾을 수 없습니다.");
      }

      return updatePost(postId, {
        title,
        content,
        thumbnailUrl: getThumbnailUrlFromContent(content) || initialThumbnailUrl,
        tagNames: nextTags,
        attachments: attachmentFiles.map((attachment, index) => ({
          ...attachment,
          sortOrder: attachment.sortOrder ?? index,
        })),
      });
    },
    onSuccess: async () => {
      if (!postId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["board-posts", "free-info"] }),
        queryClient.invalidateQueries({ queryKey: ["post-detail", postId] }),
        queryClient.invalidateQueries({ queryKey: ["post-edit-detail", postId] }),
      ]);
      navigate(`/free-info/${postId}`);
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "게시글 수정에 실패했습니다.");
    },
  });

  const watchedTitle = useWatch({ control, name: "title" }) ?? "";
  const titleLength = watchedTitle.trim().length;
  const canAddMoreTags = tags.length < MAX_TAG_COUNT;
  const isSubmitting = createPostMutation.isPending || updatePostMutation.isPending || isFinalizingImages;
  const isEditorBusy = isSubmitting || isUploadingImage;

  const addTag = (rawValue: string) => {
    const nextTag = rawValue.trim();

    if (!nextTag || tags.includes(nextTag) || !canAddMoreTags) {
      return;
    }

    setTags((currentTags) => [...currentTags, nextTag]);
    setValue("tagInput", "");
  };

  const toolbarButtons = useMemo(
    () => [
      {
        key: "bold",
        label: "굵게",
        active: editor?.isActive("bold"),
        onClick: () => editor?.chain().focus().toggleBold().run(),
        icon: <Bold size={16} strokeWidth={2} />,
      },
      {
        key: "italic",
        label: "기울임",
        active: editor?.isActive("italic"),
        onClick: () => editor?.chain().focus().toggleItalic().run(),
        icon: <Italic size={16} strokeWidth={2} />,
      },
      {
        key: "strike",
        label: "취소선",
        active: editor?.isActive("strike"),
        onClick: () => editor?.chain().focus().toggleStrike().run(),
        icon: <Strikethrough size={16} strokeWidth={2} />,
      },
      {
        key: "underline",
        label: "밑줄",
        onClick: () => editor?.chain().focus().toggleItalic().run(),
        icon: <UnderlineIcon size={16} strokeWidth={2} />,
      },
      {
        key: "heading1",
        label: "제목 1",
        active: editor?.isActive("heading", { level: 1 }),
        onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        icon: <Heading1 size={16} strokeWidth={2} />,
      },
      {
        key: "heading2",
        label: "제목 2",
        active: editor?.isActive("heading", { level: 2 }),
        onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        icon: <Heading2 size={16} strokeWidth={2} />,
      },
      {
        key: "bulletList",
        label: "글머리 목록",
        active: editor?.isActive("bulletList"),
        onClick: () => editor?.chain().focus().toggleBulletList().run(),
        icon: <List size={16} strokeWidth={2} />,
      },
      {
        key: "orderedList",
        label: "번호 목록",
        active: editor?.isActive("orderedList"),
        onClick: () => editor?.chain().focus().toggleOrderedList().run(),
        icon: <ListOrdered size={16} strokeWidth={2} />,
      },
      {
        key: "link",
        label: "링크",
        onClick: () => editor?.chain().focus().setMark("code").run(),
        icon: <Link2 size={16} strokeWidth={2} />,
      },
      {
        key: "image",
        label: "이미지",
        onClick: openImagePicker,
        icon: <ImagePlus size={16} strokeWidth={2} />,
      },
      {
        key: "codeBlock",
        label: "코드 블록",
        active: editor?.isActive("codeBlock"),
        onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
        icon: <Code2 size={16} strokeWidth={2} />,
      },
      {
        key: "blockquote",
        label: "인용",
        active: editor?.isActive("blockquote"),
        onClick: () => editor?.chain().focus().toggleBlockquote().run(),
        icon: <Quote size={16} strokeWidth={2} />,
      },
    ],
    [editor, openImagePicker],
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const content = editor?.getHTML()?.trim() ?? "";
    const plainText = editor?.getText().trim() ?? "";

    if (!plainText) {
      setSubmitError("본문을 입력해주세요.");
      return;
    }

    const payload = {
      title: values.title.trim(),
      content,
      nextTags: tags,
    };

    if (mode === "create" && pendingImages.length > 0) {
      setIsFinalizingImages(true);

      try {
        const createdPostResponse = await createBoardPost(FREE_INFO_BOARD_CODE, {
          title: payload.title,
          content: payload.content,
          tags: payload.nextTags,
        });
        const createdPostId = createdPostResponse.data.postId;
        const uploadedImages = await uploadPendingEditorImages(pendingImages, createdPostId);
        const finalContent = uploadedImages.reduce(
          (currentContent, image) => currentContent.replaceAll(image.localSrc, image.resolvedUrl),
          payload.content,
        );
        const nextAttachments = [
          ...attachmentFiles,
          ...uploadedImages.map((image, index) =>
            toAttachmentRequest(
              {
                fileId: image.fileId,
                fileUrl: image.resolvedUrl,
                fileName: image.fileName,
                contentType: image.contentType,
                fileSize: image.fileSize,
                sortOrder: attachmentFiles.length + index,
              },
              attachmentFiles.length + index,
            ),
          ),
        ];

        await updatePost(createdPostId, {
          title: payload.title,
          content: finalContent,
          thumbnailUrl: getThumbnailUrlFromContent(finalContent) || initialThumbnailUrl,
          tagNames: payload.nextTags,
          attachments: nextAttachments,
        });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["board-posts", "free-info"] }),
          queryClient.invalidateQueries({ queryKey: ["post-detail", createdPostId] }),
        ]);
        navigate(`/free-info/${createdPostId}`);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "게시글 이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        setIsFinalizingImages(false);
      }

      return;
    }

    if (mode === "edit") {
      await updatePostMutation.mutateAsync(payload);
      return;
    }

    await createPostMutation.mutateAsync(payload);
  });

  return (
    <section className="grid gap-8 pt-2 md:gap-10">
      <form className="grid gap-6 md:gap-8" onSubmit={onSubmit}>
        <div className="grid gap-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative">
              <span className="sr-only">게시판</span>
              <select
                className="h-11 min-w-[160px] appearance-none rounded-[4px] bg-[#f7faff] px-4 pr-10 text-sm font-medium text-[#475569] outline-none"
                {...register("board")}
              >
                {BOARD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#64748b]">▾</span>
            </label>
          </div>

          <div className="border-b border-[#e2e8f0] pb-4">
            <input
              className="w-full bg-transparent text-[30px] font-medium tracking-[-0.03em] text-[#0f172a] outline-none placeholder:text-[#94a3b8] md:text-[44px]"
              placeholder="제목을 입력해주세요..."
              {...register("title", {
                required: "제목을 입력해주세요.",
                validate: (value) => value.trim().length > 1 || "제목은 2자 이상 입력해주세요.",
              })}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-[#94a3b8]">
            <span>{errors.title?.message ?? submitError ?? ""}</span>
            <span>{titleLength}자</span>
          </div>

        </div>

        <div className="border-y border-black/8 py-[13px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {toolbarButtons.slice(0, 4).map((button) => (
              <ToolbarButton
                key={button.key}
                active={button.active}
                disabled={!editor || isEditorBusy}
                label={button.label}
                onClick={button.onClick}
              >
                {button.icon}
              </ToolbarButton>
            ))}

            <div className="h-6 w-px bg-black/8" />

            {toolbarButtons.slice(4, 6).map((button) => (
              <ToolbarButton
                key={button.key}
                active={button.active}
                disabled={!editor || isEditorBusy}
                label={button.label}
                onClick={button.onClick}
              >
                {button.icon}
              </ToolbarButton>
            ))}

            <div className="h-6 w-px bg-black/8" />

            {toolbarButtons.slice(6).map((button) => (
              <ToolbarButton
                key={button.key}
                active={button.active}
                disabled={!editor || isEditorBusy}
                label={button.label}
                onClick={button.onClick}
              >
                {button.icon}
              </ToolbarButton>
            ))}
          </div>
        </div>
        <input
          ref={imageInputRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleImageUploadChange}
        />

        <div className="min-h-[487px]">
          <EditorContent editor={editor} />
        </div>

        <div className="grid gap-4">
          <p className="text-sm font-medium text-[#94a3b8]">
            최대 20개 ({tags.length} / {MAX_TAG_COUNT})
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {tags.map((tag) => (
              <button
                key={tag}
                className="inline-flex items-center gap-2 rounded-[8px] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
                type="button"
                onClick={() => setTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag))}
              >
                <span>{tag}</span>
                <X size={12} strokeWidth={2.2} />
              </button>
            ))}

            <input
              className="min-w-[220px] flex-1 bg-transparent text-sm text-[#475569] outline-none placeholder:text-[#94a3b8]"
              placeholder="태그를 추가하세요 (엔터로 구분)"
              {...register("tagInput")}
              onBlur={(event) => addTag(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag(event.currentTarget.value);
                }
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            className="rounded-[8px] bg-[#f7faff] px-9 py-3 text-base font-semibold text-[#94a3b8]"
            to="/free-info"
          >
            취소
          </Link>
          <button
            className="rounded-[8px] bg-[var(--color-primary-main)] px-9 py-3 text-base font-semibold text-[#f7faff] transition-colors hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isEditorBusy}
            type="submit"
          >
            {isEditorBusy
              ? isUploadingImage
                ? "이미지 업로드 중..."
                : mode === "edit"
                  ? "수정 중..."
                  : "등록 중..."
              : mode === "edit"
                ? "수정"
                : "등록"}
          </button>
        </div>
      </form>
    </section>
  );
}
