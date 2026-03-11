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
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  X,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

const initialTags = ["취업후기", "비전공자", "네카라쿠배"];
const maxTags = 20;
const initialMarkdown = `
`;

function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|~~.*?~~|`.*?`|\*.*?\*|\[.*?\]\(.*?\))/g).filter(Boolean);

  return parts.map((part, index) => {
    if (/^\*\*.*\*\*$/.test(part)) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (/^~~.*~~$/.test(part)) {
      return <del key={index}>{part.slice(2, -2)}</del>;
    }

    if (/^`.*`$/.test(part)) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }

    if (/^\*.*\*$/.test(part)) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-primary-active)] underline underline-offset-2"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i += 1;

      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }

      blocks.push(
        <pre key={`code-${i}`} className="overflow-x-auto rounded-2xl bg-[#0f172a] p-5 text-[13px] leading-6 text-[#def1fc]">
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );

      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-[22px] font-bold leading-8 tracking-[-0.03em] text-slate-900">
          {parseInline(line.slice(3))}
        </h2>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-[28px] font-bold leading-9 tracking-[-0.03em] text-slate-900">
          {parseInline(line.slice(2))}
        </h1>,
      );
      i += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];

      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i += 1;
      }

      blocks.push(
        <blockquote key={`quote-${i}`} className="border-l-[3px] border-slate-300 pl-4 text-slate-500">
          {quoteLines.map((quoteLine, index) => (
            <p key={index}>{parseInline(quoteLine)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (/^- /.test(line)) {
      const items: string[] = [];

      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i += 1;
      }

      blocks.push(
        <ul key={`ul-${i}`} className="list-disc space-y-2 pl-6">
          {items.map((item, index) => (
            <li key={index}>{parseInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];

      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i += 1;
      }

      blocks.push(
        <ol key={`ol-${i}`} className="list-decimal space-y-2 pl-6">
          {items.map((item, index) => (
            <li key={index}>{parseInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("# ") &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("> ") &&
      !lines[i].startsWith("```") &&
      !/^- /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i += 1;
    }

    blocks.push(
      <p key={`p-${i}`} className="text-[15px] leading-7 text-slate-600">
        {parseInline(paragraphLines.join(" "))}
      </p>,
    );
  }

  return blocks;
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="grid size-8 place-items-center rounded text-slate-500 transition-colors hover:bg-[#f7faff] hover:text-slate-900"
    >
      {children}
    </button>
  );
}

export function FreeInfoWritePage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const addTag = () => {
    const nextTag = tagInput.trim();

    if (!nextTag || tags.includes(nextTag) || tags.length >= maxTags) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, nextTag]);
    setTagInput("");
  };

  const wrapSelection = (prefix: string, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.slice(start, end);
    const nextValue = `${markdown.slice(0, start)}${prefix}${selected}${suffix}${markdown.slice(end)}`;

    setMarkdown(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  };

  const prefixLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = markdown.lastIndexOf("\n", start - 1) + 1;
    const nextValue = `${markdown.slice(0, lineStart)}${prefix}${markdown.slice(lineStart)}`;

    setMarkdown(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const position = start + prefix.length;
      textarea.setSelectionRange(position, position);
    });
  };

  const insertBlock = (template: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${markdown.slice(0, start)}${template}${markdown.slice(end)}`;

    setMarkdown(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + template.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <section className="grid gap-6 pt-4 md:gap-8 md:pt-10">
      <div className="grid gap-6">
        <div className="inline-flex w-fit items-center gap-2 rounded bg-[#f7faff] px-4 py-2 text-sm font-medium text-[#475569]">
          <span>자유/정보 게시판</span>
          <span className="text-xs text-[#94a3b8]">⌄</span>
        </div>

        <label className="block border-b border-[rgba(0,0,0,0.08)] pb-6">
          <span className="sr-only">제목</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력해주세요..."
            className="w-full border-0 bg-transparent p-0 text-[28px] font-medium tracking-[-0.03em] text-[#0f172a] outline-none placeholder:text-[#94a3b8] md:text-[32px]"
          />
        </label>
      </div>

      <div className="grid gap-6">
        <div className="border-y border-[rgba(0,0,0,0.08)] py-[13px]">
          <div className="flex flex-wrap items-center gap-1 md:gap-2">
            <div className="flex items-center gap-1 border-r border-[rgba(0,0,0,0.08)] pr-4">
              <ToolbarButton title="굵게" onClick={() => wrapSelection("**")}>
                <Bold className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="기울임" onClick={() => wrapSelection("*")}>
                <Italic className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="취소선" onClick={() => wrapSelection("~~")}>
                <Strikethrough className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="본문" onClick={() => prefixLine("")}>
                <Pilcrow className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
            </div>

            <div className="flex items-center gap-1 border-r border-[rgba(0,0,0,0.08)] pr-4">
              <ToolbarButton title="제목 1" onClick={() => prefixLine("# ")}>
                <Heading1 className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="제목 2" onClick={() => prefixLine("## ")}>
                <Heading2 className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
            </div>

            <div className="flex items-center gap-1 border-r border-[rgba(0,0,0,0.08)] pr-4">
              <ToolbarButton title="글머리" onClick={() => prefixLine("- ")}>
                <List className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="번호 목록" onClick={() => prefixLine("1. ")}>
                <ListOrdered className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="코드 블록" onClick={() => insertBlock("\n```\n코드를 입력하세요\n```\n")}>
                <Code2 className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="인용문" onClick={() => prefixLine("> ")}>
                <Quote className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
            </div>

            <div className="flex items-center gap-1">
              <ToolbarButton title="링크" onClick={() => insertBlock("[링크 텍스트](https://example.com)")}>
                <Link2 className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="이미지" onClick={() => insertBlock("![이미지 설명](https://example.com/image.png)")}>
                <ImagePlus className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="실행 취소" onClick={() => document.execCommand("undo")}>
                <Undo2 className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
              <ToolbarButton title="다시 실행" onClick={() => document.execCommand("redo")}>
                <Redo2 className="size-[18px]" strokeWidth={1.8} />
              </ToolbarButton>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-h-[520px]">
            
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              placeholder="여기에 여러분의 이야기를 들려주세요..."
              className="min-h-[487px] w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-7 text-slate-700 outline-none placeholder:text-[#94a3b8]"
            />
          </div>

          <aside className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">미리보기</h2>
              <span className="text-xs text-slate-400">Markdown Rendered</span>
            </div>
            <div className="grid min-h-[440px] gap-4 rounded-xl bg-white p-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]">
              {renderMarkdown(markdown)}
            </div>
          </aside>
        </div>
      </div>

      <div className="grid gap-4">
        <p className="text-sm font-medium text-[#94a3b8]">
          최대 {maxTags}개 ({tags.length} / {maxTags})
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-base font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
            >
              {tag}
              <X className="size-3.5" strokeWidth={2} />
            </button>
          ))}

          <input
            type="text"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTag();
              }
            }}
            placeholder="태그를 추가하세요 (엔터로 구분)"
            className="min-w-[220px] flex-1 border-0 bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-[#94a3b8]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Link
          to="/free-info"
          className="rounded-lg bg-[#f7faff] px-9 py-3 text-base font-semibold text-[#94a3b8] transition-colors hover:bg-[#edf5fe]"
        >
          취소
        </Link>
        <button
          type="button"
          className="rounded-lg bg-[var(--color-primary-main)] px-9 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]"
        >
          등록
        </button>
      </div>
    </section>
  );
}
