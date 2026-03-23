import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
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

type LectureWriteFormValues = {
  board: "lecture";
  campus: "SEOUL" | "GLOBAL";
  department: string;
  title: string;
  tagInput: string;
};

const BOARD_OPTIONS = [{ label: "강의/수업 게시판", value: "lecture" }] as const;
const CAMPUS_OPTIONS = [
  { label: "서울 캠퍼스", value: "SEOUL" },
  { label: "글로벌 캠퍼스", value: "GLOBAL" },
] as const;
const DEPARTMENT_OPTIONS = ["융복합소프트웨어", "컴퓨터공학과", "정보통신공학과", "영어통번역학과"] as const;
const DEFAULT_TAGS = ["취업후기", "비전공자", "네카라쿠배"];
const MAX_TAG_COUNT = 20;

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

export function LectureWritePage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<LectureWriteFormValues>({
    defaultValues: {
      board: "lecture",
      campus: "SEOUL",
      department: "융복합소프트웨어",
      title: "",
      tagInput: "",
    },
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] w-full text-base leading-8 text-[#475569] outline-none [&_h1]:text-[28px] [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:text-[22px] [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-[#dbeafe] [&_blockquote]:pl-4 [&_blockquote]:text-[#64748b] [&_code]:rounded [&_code]:bg-[#f8fafc] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.95em] [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-[#94a3b8] [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        "data-placeholder": "여기에 여러분의 이야기를 들려주세요...",
      },
    },
  });

  const watchedTitle = useWatch({ control, name: "title" }) ?? "";
  const titleLength = watchedTitle.trim().length;
  const canAddMoreTags = tags.length < MAX_TAG_COUNT;

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
        onClick: () => editor?.chain().focus().setHardBreak().run(),
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
    [editor],
  );

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      content: editor?.getHTML() ?? "",
      tags,
    };

    console.log("lecture write payload", payload);
    navigate("/lecture");
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

            <label className="relative">
              <span className="sr-only">캠퍼스</span>
              <select
                className="h-11 min-w-[160px] appearance-none rounded-[4px] bg-[#f7faff] px-4 pr-10 text-sm font-medium text-[#475569] outline-none"
                {...register("campus")}
              >
                {CAMPUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#64748b]">▾</span>
            </label>

            <label className="relative">
              <span className="sr-only">학과</span>
              <select
                className="h-11 min-w-[180px] appearance-none rounded-[4px] bg-[#f7faff] px-4 pr-10 text-sm font-medium text-[#475569] outline-none"
                {...register("department")}
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
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
            <span>{errors.title?.message ?? "읽기 쉬운 제목으로 핵심 내용을 먼저 적어주세요."}</span>
            <span>{titleLength}자</span>
          </div>
        </div>

        <div className="border-y border-black/8 py-[13px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {toolbarButtons.slice(0, 4).map((button) => (
              <ToolbarButton
                key={button.key}
                active={button.active}
                disabled={!editor}
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
                disabled={!editor}
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
                disabled={!editor}
                label={button.label}
                onClick={button.onClick}
              >
                {button.icon}
              </ToolbarButton>
            ))}
          </div>
        </div>

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
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag(event.currentTarget.value);
                }
              }}
              onBlur={(event) => addTag(event.currentTarget.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            className="rounded-[8px] bg-[#f7faff] px-9 py-3 text-base font-semibold text-[#94a3b8]"
            to="/lecture"
          >
            취소
          </Link>
          <button
            className="rounded-[8px] bg-[var(--color-primary-main)] px-9 py-3 text-base font-semibold text-[#f7faff] transition-colors hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]"
            type="submit"
          >
            등록
          </button>
        </div>
      </form>
    </section>
  );
}
