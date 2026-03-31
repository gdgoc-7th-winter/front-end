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
  List,
  ListOrdered,
  Quote,
  X,
} from "lucide-react";
import {
  createPromotion,
  getPromotionDetail,
  updatePromotion,
  type PromotionAttachmentRequest,
  type PromotionCategory,
} from "../../api/posts";
import { uploadPendingEditorImages, useEditorImageUpload, type PendingEditorImage } from "../../hooks/useEditorImageUpload";

const PROMOTION_CATEGORY_OPTIONS: Array<{ label: string; value: PromotionCategory }> = [
  { label: "동아리", value: "CLUB" },
  { label: "행사", value: "EVENT" },
  { label: "프로젝트", value: "PROJECT" },
  { label: "대회", value: "CONTEST" },
  { label: "기타", value: "ETC" },
];

const MAX_TAG_COUNT = 20;

type PromotionsWriteFormValues = {
  board: "promotions";
  category: PromotionCategory;
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

type PromotionEditorProps = {
  mode: "create" | "edit";
  postId: number | null;
  initialCategory: PromotionCategory;
  initialTitle: string;
  initialContent: string;
  initialTags: string[];
  initialThumbnailUrl?: string | null;
  initialAttachments: PromotionAttachmentRequest[];
};

type PromotionEditDetail = {
  category: PromotionCategory;
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  tagNames: string[];
  attachments: PromotionAttachmentRequest[];
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

function normalizePromotionEditDetail(value: unknown): PromotionEditDetail | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const detail = value as Record<string, unknown>;
  const nestedPost = detail["post"];
  const post = nestedPost && typeof nestedPost === "object" ? (nestedPost as Record<string, unknown>) : detail;
  const category = detail["category"];
  const attachmentsValue = post["attachments"];
  const tagNamesValue = post["tagNames"] ?? post["tags"] ?? detail["tagNames"] ?? detail["tags"];

  return {
    category: category === "EVENT" || category === "PROJECT" || category === "CONTEST" || category === "ETC" ? category : "CLUB",
    title: typeof post["title"] === "string" ? post["title"] : "",
    content: typeof post["content"] === "string" ? post["content"] : "",
    thumbnailUrl: typeof post["thumbnailUrl"] === "string" ? post["thumbnailUrl"] : undefined,
    tagNames: Array.isArray(tagNamesValue)
      ? tagNamesValue.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      : [],
    attachments: Array.isArray(attachmentsValue)
      ? attachmentsValue.flatMap((attachment, index) => {
          if (!attachment || typeof attachment !== "object") {
            return [];
          }

          const file = attachment as Record<string, unknown>;
          const fileUrl = typeof file["fileUrl"] === "string" ? file["fileUrl"] : "";
          const fileName = typeof file["fileName"] === "string" ? file["fileName"] : "";
          const contentType = typeof file["contentType"] === "string" ? file["contentType"] : "";

          if (!fileUrl || !fileName || !contentType) {
            return [];
          }

          return [
            {
              fileUrl,
              fileName,
              contentType,
              fileSize: typeof file["fileSize"] === "number" ? file["fileSize"] : 0,
              sortOrder: typeof file["sortOrder"] === "number" ? file["sortOrder"] : index,
            } satisfies PromotionAttachmentRequest,
          ];
        })
      : [],
  };
}

export function PromotionsWritePage() {
  const { postId } = useParams();
  const numericPostId = Number(postId);
  const isEditMode = Number.isInteger(numericPostId) && numericPostId > 0;
  const promotionDetailQuery = useQuery({
    queryKey: ["promotion-edit-detail", numericPostId],
    queryFn: async () => {
      const response = await getPromotionDetail(numericPostId);
      return response.data;
    },
    enabled: isEditMode,
    staleTime: 1000 * 60,
  });
  const initialPost = normalizePromotionEditDetail(promotionDetailQuery.data);

  if (isEditMode) {
    if (promotionDetailQuery.isLoading) {
      return (
        <section className="grid gap-8 pt-2 md:gap-10">
          <div className="rounded-[24px] bg-white px-6 py-16 text-center text-sm text-[#94a3b8]">게시글 정보를 불러오는 중입니다...</div>
        </section>
      );
    }

    if (promotionDetailQuery.isError || !promotionDetailQuery.data) {
      return (
        <section className="grid gap-8 pt-2 md:gap-10">
          <div className="rounded-[24px] border border-red-100 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
            {promotionDetailQuery.error instanceof Error ? promotionDetailQuery.error.message : "게시글 정보를 불러오지 못했습니다."}
          </div>
        </section>
      );
    }
  }

  return (
    <PromotionPostEditor
      key={isEditMode ? `edit-${numericPostId}` : "create"}
      initialAttachments={initialPost?.attachments ?? []}
      initialCategory={initialPost?.category ?? "CLUB"}
      initialContent={initialPost?.content ?? ""}
      initialTags={initialPost?.tagNames ?? []}
      initialThumbnailUrl={initialPost?.thumbnailUrl}
      initialTitle={initialPost?.title ?? ""}
      mode={isEditMode ? "edit" : "create"}
      postId={isEditMode ? numericPostId : null}
    />
  );
}

function PromotionPostEditor({
  mode,
  postId,
  initialCategory,
  initialTitle,
  initialContent,
  initialTags,
  initialThumbnailUrl,
  initialAttachments,
}: PromotionEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>(initialTags);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<PromotionAttachmentRequest[]>(initialAttachments);
  const [pendingImages, setPendingImages] = useState<PendingEditorImage[]>([]);
  const [isFinalizingImages, setIsFinalizingImages] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PromotionsWriteFormValues>({
    defaultValues: {
      board: "promotions",
      category: initialCategory,
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
          "min-h-[340px] w-full text-base leading-8 text-[#475569] outline-none [&_h1]:text-[28px] [&_h1]:font-bold [&_h2]:text-[22px] [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-[#dbeafe] [&_blockquote]:pl-4 [&_blockquote]:text-[#64748b] [&_code]:rounded [&_code]:bg-[#f8fafc] [&_code]:px-1.5 [&_code]:py-0.5 [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-[16px] [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-[#94a3b8] [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
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
        {
          fileUrl: uploadedImage.resolvedUrl,
          fileName: uploadedImage.fileName,
          contentType: uploadedImage.contentType,
          fileSize: uploadedImage.fileSize,
          sortOrder: currentAttachments.length,
        },
      ]);
    },
    onPendingAdd: (pendingImage) => {
      setPendingImages((currentImages) => [...currentImages, pendingImage]);
    },
    onImagesChange: (imageSrcs) => {
      setPendingImages((currentImages) => currentImages.filter((image) => imageSrcs.includes(image.localSrc)));
      setAttachmentFiles((currentAttachments) =>
        currentAttachments.filter((attachment) => imageSrcs.includes(attachment.fileUrl)),
      );
    },
  });

  const createPromotionMutation = useMutation({
    mutationFn: ({
      category,
      title,
      content,
      nextTags,
      attachments,
    }: {
      category: PromotionCategory;
      title: string;
      content: string;
      nextTags: string[];
      attachments: PromotionAttachmentRequest[];
    }) =>
      createPromotion({
        category,
        post: {
          title,
          content,
          thumbnailUrl: getThumbnailUrlFromContent(content),
          tagNames: nextTags,
          attachments,
        },
      }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      navigate(`/promotions/${response.data.postId}`);
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "홍보글 등록에 실패했습니다.");
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: ({
      category,
      title,
      content,
      nextTags,
      attachments,
    }: {
      category: PromotionCategory;
      title: string;
      content: string;
      nextTags: string[];
      attachments: PromotionAttachmentRequest[];
    }) => {
      if (!postId) {
        throw new Error("수정할 게시글 정보를 찾을 수 없습니다.");
      }

      return updatePromotion(postId, {
        category,
        post: {
          title,
          content,
          thumbnailUrl: getThumbnailUrlFromContent(content) || initialThumbnailUrl || "",
          tagNames: nextTags,
          attachments,
        },
      });
    },
    onSuccess: async () => {
      if (!postId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["promotions"] }),
        queryClient.invalidateQueries({ queryKey: ["promotion-detail", postId] }),
        queryClient.invalidateQueries({ queryKey: ["promotion-edit-detail", postId] }),
      ]);
      navigate(`/promotions/${postId}`);
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "홍보글 수정에 실패했습니다.");
    },
  });

  const watchedTitle = useWatch({ control, name: "title" }) ?? "";
  const canAddMoreTags = tags.length < MAX_TAG_COUNT;
  const isSubmitting = createPromotionMutation.isPending || updatePromotionMutation.isPending || isFinalizingImages;
  const isEditorBusy = isSubmitting || isUploadingImage;
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

  const addTag = (rawValue: string) => {
    const nextTag = rawValue.trim();

    if (!nextTag || tags.includes(nextTag) || !canAddMoreTags) {
      return;
    }

    setTags((currentTags) => [...currentTags, nextTag]);
    setValue("tagInput", "");
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const content = editor?.getHTML()?.trim() ?? "";
    const plainText = editor?.getText().trim() ?? "";

    if (!plainText) {
      setSubmitError("본문을 입력해주세요.");
      return;
    }

    const payload = {
      category: values.category,
      title: values.title.trim(),
      content,
      nextTags: tags,
      attachments: attachmentFiles,
    };

    if (mode === "create" && pendingImages.length > 0) {
      setIsFinalizingImages(true);

      try {
        const createdPostResponse = await createPromotion({
          category: payload.category,
          post: {
            title: payload.title,
            content: payload.content,
            thumbnailUrl: getThumbnailUrlFromContent(payload.content),
            tagNames: payload.nextTags,
            attachments: [],
          },
        });
        const createdPostId = createdPostResponse.data.postId;
        const uploadedImages = await uploadPendingEditorImages(pendingImages, createdPostId);
        const finalContent = uploadedImages.reduce(
          (currentContent, image) => currentContent.replaceAll(image.localSrc, image.resolvedUrl),
          payload.content,
        );
        const nextAttachments = [
          ...attachmentFiles,
          ...uploadedImages.map((image, index) => ({
            fileUrl: image.resolvedUrl,
            fileName: image.fileName,
            contentType: image.contentType,
            fileSize: image.fileSize,
            sortOrder: attachmentFiles.length + index,
          })),
        ];

        await updatePromotion(createdPostId, {
          category: payload.category,
          post: {
            title: payload.title,
            content: finalContent,
            thumbnailUrl: getThumbnailUrlFromContent(finalContent) || initialThumbnailUrl || "",
            tagNames: payload.nextTags,
            attachments: nextAttachments,
          },
        });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["promotions"] }),
          queryClient.invalidateQueries({ queryKey: ["promotion-detail", createdPostId] }),
        ]);
        navigate(`/promotions/${createdPostId}`);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "게시글 이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        setIsFinalizingImages(false);
      }

      return;
    }

    if (mode === "edit") {
      await updatePromotionMutation.mutateAsync(payload);
      return;
    }

    await createPromotionMutation.mutateAsync(payload);
  });

  return (
    <section className="grid gap-8 pt-2 md:gap-10">
      <form className="grid gap-6 md:gap-8" onSubmit={onSubmit}>
        <div className="flex w-fit items-center gap-2 rounded-[4px] bg-[#f7faff] px-4 py-2 text-sm font-medium text-[#475569]">
          <span>동아리/행사/홍보 게시판</span>
          <span className="text-xs">▾</span>
        </div>

        <div className="grid gap-4 md:grid-cols-[120px_minmax(0,220px)] md:items-center">
          <p className="text-sm font-medium text-[#475569]">
            카테고리 <span className="text-[#ea4335]">*</span>
          </p>
          <label className="relative">
            <select
              className="h-11 w-full appearance-none rounded-[4px] bg-[#f7faff] px-4 pr-10 text-sm font-medium text-[#475569] outline-none"
              {...register("category")}
            >
              {PROMOTION_CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
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
          <span>{watchedTitle.trim().length}자</span>
        </div>

        <div className="border-y border-black/8 py-[13px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {toolbarButtons.map((button) => (
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

        <div className="min-h-[340px]">
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
          <Link className="rounded-[8px] bg-[#f7faff] px-9 py-3 text-base font-semibold text-[#94a3b8]" to="/promotions">
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
