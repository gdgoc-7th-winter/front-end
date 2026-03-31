import { Link } from "react-router-dom";

interface BoardComingSoonPageProps {
  boardName: string;
}

export function BoardComingSoonPage({ boardName }: BoardComingSoonPageProps) {
  return (
    <section className="grid gap-6 rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center md:px-10 md:py-20">
      <div className="mx-auto grid max-w-[520px] gap-4">
        <span className="mx-auto inline-flex rounded-full bg-[#eef6ff] px-4 py-1.5 text-xs font-semibold text-[#4f86c6]">
          Temporary Board Page
        </span>
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-900 md:text-[40px]">{boardName}</h1>
        <p className="text-base leading-7 text-slate-500">작업 중</p>
      </div>

      <div>
        <Link
          className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          to="/"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </section>
  );
}
