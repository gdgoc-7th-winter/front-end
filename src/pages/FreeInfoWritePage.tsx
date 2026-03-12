import { X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { FreeInfoEditor } from "../components/editor/FreeInfoEditor";

const initialTags = ["취업후기", "비전공자", "네카라쿠배"];
const maxTags = 20;

export function FreeInfoWritePage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const nextTag = tagInput.trim();

    if (!nextTag || tags.includes(nextTag) || tags.length >= maxTags) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, nextTag]);
    setTagInput("");
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

      <FreeInfoEditor />

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
