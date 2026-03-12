import { type ReactNode } from "react";

export function ToolbarButton({
  onClick,
  title,
  children,
  isActive = false,
  disabled = false,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`grid size-8 place-items-center rounded transition-colors ${
        isActive
          ? "bg-[#e9f3ff] text-[var(--color-primary-active)]"
          : "text-slate-500 hover:bg-[#f7faff] hover:text-slate-900"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}
