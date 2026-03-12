import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { redo, undo } from "@tiptap/pm/history";
import {
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useState } from "react";

import { editorExtensions } from "./editorExtensions";
import { handleEditorKeyDown } from "./editorKeydown";
import { ToolbarButton } from "./ToolbarButton";

function toggleLink(editor: Editor) {
  if (editor.isActive("link")) {
    editor.chain().focus().unsetLink().run();
    return;
  }

  const href = window.prompt("링크 주소를 입력해주세요.", "https://");
  if (!href) return;

  editor.chain().focus().setLink({ href }).run();
}

function insertImage(editor: Editor) {
  const src = window.prompt("이미지 주소를 입력해주세요.", "https://");
  if (!src) return;

  const alt = window.prompt("이미지 설명을 입력해주세요.", "") ?? "";
  editor.chain().focus().setImage({ src, alt, title: alt || undefined }).run();
}

export function FreeInfoEditor() {
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const editor = useEditor({
    extensions: editorExtensions,
    content: "",
    editorProps: {
      attributes: {
        class: "min-h-[487px] text-[15px] leading-7 text-slate-700 outline-none",
      },
      handleKeyDown: handleEditorKeyDown,
    },
    onCreate: ({ editor: nextEditor }) => {
      setIsEditorEmpty(nextEditor.isEmpty);
    },
    onUpdate: ({ editor: nextEditor }) => {
      setIsEditorEmpty(nextEditor.isEmpty);
    },
    immediatelyRender: false,
  });

  const handleUndo = () => {
    if (!editor) return;
    undo(editor.view.state, editor.view.dispatch);
    editor.commands.focus();
  };

  const handleRedo = () => {
    if (!editor) return;
    redo(editor.view.state, editor.view.dispatch);
    editor.commands.focus();
  };

  return (
    <div className="grid gap-6">
      <div className="border-y border-[rgba(0,0,0,0.08)] py-[13px]">
        <div className="flex flex-wrap items-center gap-1 md:gap-2">
          <div className="flex items-center gap-1 border-r border-[rgba(0,0,0,0.08)] pr-4">
            <ToolbarButton title="본문" onClick={() => editor?.chain().focus().setParagraph().run()} isActive={editor?.isActive("paragraph")}>
              <Pilcrow className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="제목 1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor?.isActive("heading", { level: 1 })}>
              <Heading1 className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="제목 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor?.isActive("heading", { level: 2 })}>
              <Heading2 className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="제목 3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor?.isActive("heading", { level: 3 })}>
              <span className="text-[11px] font-semibold">H3</span>
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-1 border-r border-[rgba(0,0,0,0.08)] pr-4">
            <ToolbarButton title="굵게" onClick={() => editor?.chain().focus().toggleBold().run()} isActive={editor?.isActive("bold")}>
              <Bold className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="기울임" onClick={() => editor?.chain().focus().toggleItalic().run()} isActive={editor?.isActive("italic")}>
              <Italic className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="취소선" onClick={() => editor?.chain().focus().toggleStrike().run()} isActive={editor?.isActive("strike")}>
              <Strikethrough className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="인라인 코드" onClick={() => editor?.chain().focus().toggleCode().run()} isActive={editor?.isActive("code")}>
              <Code className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="링크" onClick={() => editor && toggleLink(editor)} isActive={editor?.isActive("link")} disabled={!editor}>
              <Link2 className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-1 border-r border-[rgba(0,0,0,0.08)] pr-4">
            <ToolbarButton title="글머리" onClick={() => editor?.chain().focus().toggleBulletList().run()} isActive={editor?.isActive("bulletList")}>
              <List className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="번호 목록" onClick={() => editor?.chain().focus().toggleOrderedList().run()} isActive={editor?.isActive("orderedList")}>
              <ListOrdered className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="인용문" onClick={() => editor?.chain().focus().toggleBlockquote().run()} isActive={editor?.isActive("blockquote")}>
              <Quote className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="코드 블록" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} isActive={editor?.isActive("codeBlock")}>
              <Code2 className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="구분선" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
              <Minus className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="줄바꿈" onClick={() => editor?.chain().focus().setHardBreak().run()}>
              <span className="text-[10px] font-semibold">BR</span>
            </ToolbarButton>
            <ToolbarButton title="이미지" onClick={() => editor && insertImage(editor)} disabled={!editor}>
              <ImagePlus className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-1">
            <ToolbarButton title="실행 취소" onClick={handleUndo} disabled={!editor}>
              <Undo2 className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
            <ToolbarButton title="다시 실행" onClick={handleRedo} disabled={!editor}>
              <Redo2 className="size-[18px]" strokeWidth={1.8} />
            </ToolbarButton>
          </div>
        </div>
      </div>

      <div className="relative min-h-[520px] rounded-2xl border border-slate-100 bg-white p-5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]">
        {isEditorEmpty ? (
          <button
            type="button"
            onClick={() => editor?.chain().focus().run()}
            className="pointer-events-auto absolute top-5 left-5 z-10 text-left text-[15px] leading-7 text-[#94a3b8]"
          >
            여기에 여러분의 이야기를 들려주세요...
          </button>
        ) : null}
        <div className="tiptap-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
