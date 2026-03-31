import { useState } from "react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Code2, Heading1, Heading2, ImagePlus, Italic, List, ListOrdered, Quote, ToggleLeft } from "lucide-react";
import { TEAM_RECRUIT_DETAIL, TEAM_RECRUIT_CATEGORY_OPTIONS } from "../../mock/teamRecruit";

type TeamRecruitWriteFormValues = {
  board: "team-recruit";
  category: string;
  recruitStartDate: string;
  recruitEndDate: string;
  title: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({ active = false, label, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      className={`grid h-8 w-8 place-items-center rounded-[4px] text-[#64748b] transition ${
        active ? "bg-[#eef6ff] text-[var(--color-primary-active)]" : "hover:bg-[#f8fafc]"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TeamRecruitWritePage() {
  const navigate = useNavigate();
  const [isApplicationEnabled, setIsApplicationEnabled] = useState(true);
  const [tags, setTags] = useState<string[]>(TEAM_RECRUIT_DETAIL.tags);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TeamRecruitWriteFormValues>({
    defaultValues: {
      board: "team-recruit",
      category: TEAM_RECRUIT_DETAIL.category,
      recruitStartDate: TEAM_RECRUIT_DETAIL.recruitStartDate,
      recruitEndDate: TEAM_RECRUIT_DETAIL.recruitEndDate,
      title: TEAM_RECRUIT_DETAIL.title,
    },
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: TEAM_RECRUIT_DETAIL.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[340px] w-full text-base leading-8 text-[#475569] outline-none [&_h1]:text-[28px] [&_h1]:font-bold [&_h2]:text-[22px] [&_h2]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-[#dbeafe] [&_blockquote]:pl-4 [&_blockquote]:text-[#64748b] [&_code]:rounded [&_code]:bg-[#f8fafc] [&_code]:px-1.5 [&_code]:py-0.5 [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:text-[#94a3b8] [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        "data-placeholder": "여기에 여러분의 이야기를 들려주세요...",
      },
    },
  });

  const toolbarButtons = [
    { key: "bold", label: "굵게", active: editor?.isActive("bold"), onClick: () => editor?.chain().focus().toggleBold().run(), icon: <Bold size={16} strokeWidth={2} /> },
    { key: "italic", label: "기울임", active: editor?.isActive("italic"), onClick: () => editor?.chain().focus().toggleItalic().run(), icon: <Italic size={16} strokeWidth={2} /> },
    { key: "heading1", label: "제목 1", active: editor?.isActive("heading", { level: 1 }), onClick: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), icon: <Heading1 size={16} strokeWidth={2} /> },
    { key: "heading2", label: "제목 2", active: editor?.isActive("heading", { level: 2 }), onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), icon: <Heading2 size={16} strokeWidth={2} /> },
    { key: "bulletList", label: "글머리 목록", active: editor?.isActive("bulletList"), onClick: () => editor?.chain().focus().toggleBulletList().run(), icon: <List size={16} strokeWidth={2} /> },
    { key: "orderedList", label: "번호 목록", active: editor?.isActive("orderedList"), onClick: () => editor?.chain().focus().toggleOrderedList().run(), icon: <ListOrdered size={16} strokeWidth={2} /> },
    { key: "image", label: "이미지", onClick: () => editor?.chain().focus().setHardBreak().run(), icon: <ImagePlus size={16} strokeWidth={2} /> },
    { key: "codeBlock", label: "코드 블록", active: editor?.isActive("codeBlock"), onClick: () => editor?.chain().focus().toggleCodeBlock().run(), icon: <Code2 size={16} strokeWidth={2} /> },
    { key: "blockquote", label: "인용", active: editor?.isActive("blockquote"), onClick: () => editor?.chain().focus().toggleBlockquote().run(), icon: <Quote size={16} strokeWidth={2} /> },
  ];

  const watchedTitle = useWatch({ control, name: "title" }) ?? "";

  const onSubmit = handleSubmit(() => {
    navigate("/team-recruit/1");
  });

  return (
    <section className="grid gap-8 pt-2 md:gap-10">
      <form className="grid gap-6 md:gap-8" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-[120px_minmax(0,220px)] md:items-center">
          <p className="text-sm font-medium text-[#475569]">
            카테고리 <span className="text-[#ea4335]">*</span>
          </p>
          <label className="relative">
            <select className="h-11 w-full appearance-none rounded-[4px] bg-[#f7faff] px-4 pr-10 text-sm font-medium text-[#475569] outline-none" {...register("category")}>
              {TEAM_RECRUIT_CATEGORY_OPTIONS.filter((category) => category.value !== "ALL").map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#64748b]">▾</span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:items-center">
          <p className="text-sm font-medium text-[#475569]">
            모집 일정 <span className="text-[#ea4335]">*</span>
          </p>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <input className="h-11 rounded-[4px] bg-[#f7faff] px-4 text-sm text-[#475569] outline-none" type="date" {...register("recruitStartDate")} />
            <span className="text-sm text-[#475569]">~</span>
            <input className="h-11 rounded-[4px] bg-[#f7faff] px-4 text-sm text-[#475569] outline-none" type="date" {...register("recruitEndDate")} />
          </div>
        </div>

        <div className="border-b border-[#e2e8f0] pb-4">
          <input
            className="w-full bg-transparent text-[30px] font-medium tracking-[-0.03em] text-[#0f172a] outline-none placeholder:text-[#94a3b8] md:text-[44px]"
            placeholder="제목을 입력해주세요..."
            {...register("title", { required: "제목을 입력해주세요." })}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-[#94a3b8]">
          <span>{errors.title?.message ?? ""}</span>
          <span>{watchedTitle.trim().length}자</span>
        </div>

        <div className="border-y border-black/8 py-[13px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {toolbarButtons.map((button) => (
              <ToolbarButton key={button.key} active={button.active} label={button.label} onClick={button.onClick}>
                {button.icon}
              </ToolbarButton>
            ))}
          </div>
        </div>

        <div className="min-h-[300px]">
          <EditorContent editor={editor} />
        </div>

        <div className="grid gap-4">
          <p className="text-sm font-medium text-[#94a3b8]">태그</p>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <button
                key={tag}
                className="rounded-[8px] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
                type="button"
                onClick={() => setTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag))}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] bg-[#f7faff] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-[#1e293b]">지원폼 사용하기</p>
              <p className="mt-1 text-sm text-[#64748b]">지원폼을 활성화하면 모집 글과 연결된 지원서 폼을 함께 보여줄 수 있어요.</p>
            </div>
            <button
              aria-pressed={isApplicationEnabled}
              className={`rounded-full p-1 ${isApplicationEnabled ? "text-[var(--color-primary-main)]" : "text-[#cbd5e1]"}`}
              type="button"
              onClick={() => setIsApplicationEnabled((previous) => !previous)}
            >
              <ToggleLeft className={`h-10 w-10 ${isApplicationEnabled ? "" : "rotate-180"}`} strokeWidth={1.6} />
            </button>
          </div>

          {isApplicationEnabled ? (
            <div className="mt-6 grid gap-4">
              <div className="rounded-[8px] border border-[#87bcf5] bg-white p-8">
                <p className="text-[28px] font-bold tracking-[-0.02em] text-[#0f172a]">{TEAM_RECRUIT_DETAIL.applicationTitle}</p>
                <p className="mt-2 text-sm text-[#475569]">{TEAM_RECRUIT_DETAIL.applicationDescription}</p>
              </div>

              {TEAM_RECRUIT_DETAIL.questions.map((question) => (
                <div key={question.id} className="rounded-[8px] border border-[#87bcf5] bg-white p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-medium tracking-[-0.02em] text-[#1e293b]">
                        {question.required ? <span className="text-[#ea4335]">*</span> : null} {question.title}
                      </p>
                      {question.description ? <p className="mt-2 text-sm text-[#94a3b8]">{question.description}</p> : null}
                    </div>
                    <div className="rounded-[4px] bg-[#f7faff] px-4 py-2 text-sm font-medium text-[#475569]">
                      {question.type === "SHORT_TEXT" ? "단답형" : question.type === "LONG_TEXT" ? "장문형" : question.type === "RADIO" ? "객관식 질문" : "체크박스"}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-[#94a3b8]">
                    {question.type === "SHORT_TEXT" ? <div className="rounded-[8px] border border-[#dee2e6] px-4 py-3">제목 없음</div> : null}
                    {question.type === "LONG_TEXT" ? <div className="rounded-[8px] border border-[#dee2e6] px-4 py-4">설명</div> : null}
                    {question.options?.map((option) => (
                      <div key={option.id} className="flex items-center justify-between">
                        <span>{option.label}</span>
                        <span className="text-sm text-[#cbd5e1]">×</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-[#475569]">
                    <button className="text-[#94a3b8]" type="button">
                      삭제
                    </button>
                    <span>|</span>
                    <span>필수</span>
                  </div>
                </div>
              ))}

              <button className="rounded-[4px] border border-[#dee2e6] bg-white px-4 py-3 text-sm font-medium text-[#1e293b]" type="button">
                + 질문 추가하기
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link className="rounded-[8px] bg-[#f7faff] px-9 py-3 text-base font-semibold text-[#94a3b8]" to="/team-recruit">
            취소
          </Link>
          <button className="rounded-[8px] bg-[var(--color-primary-main)] px-9 py-3 text-base font-semibold text-[#f7faff]" type="submit">
            등록
          </button>
        </div>
      </form>
    </section>
  );
}
