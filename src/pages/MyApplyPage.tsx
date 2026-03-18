import { Eye, Heart, MessageCircle } from "lucide-react";
import { MyPageShell } from "../components/MyPageShell";

const appliedPosts = [
  {
    id: 1,
    status: { label: "모집중", tone: "green" as const },
    title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
    category: "팀원 모집",
    summary: "오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 상세하게 정리한 글입니다.",
    tags: ["취업후기", "비전공자", "네카라쿠배"],
    date: "26.02.24",
    likes: 128,
    comments: 42,
    views: "1.2k",
    scraps: 812,
    thumbnail: "/default_profile.png",
  },
  {
    id: 2,
    status: { label: "모집 마감", tone: "red" as const },
    title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
    category: "팀원 모집",
    summary: "오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 상세하게 정리한 글입니다.",
    tags: ["취업후기", "비전공자", "네카라쿠배"],
    date: "26.02.24",
    likes: 128,
    comments: 42,
    views: "1.2k",
    scraps: 812,
  },
];

function statusClassName(tone: "green" | "red") {
  return tone === "green" ? "bg-[#15c45a]" : "bg-[#f04438]";
}

export function MyApplyPage() {
  return (
    <MyPageShell activeSection="apply">
      <h1 className="text-[28px] font-bold tracking-[-0.02em] text-black md:text-[32px]">지원 현황</h1>

      <div className="mt-10 grid gap-14">
        {appliedPosts.map((post) => (
          <article key={post.id} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_168px] md:gap-6">
            <div>
              <div className="mt-3 flex items-center gap-3">
                <img className="size-8 rounded-full object-cover" src="/default_profile.png" alt="" />
                <div>
                  <div className="text-[13px] font-semibold text-[#111827]">한국외대 지킴이</div>
                  <div className="text-[10px] text-[#94a3b8]">영어통번역학과 • 백엔드</div>
                </div>
              </div>

              <h2 className="mt-4 text-[26px] font-semibold tracking-[-0.02em] text-[#111827]">{post.title}</h2>
              <p className="mt-3 text-[14px] leading-7 text-[#4b5563]">{post.summary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#f2f8ff] px-3 py-1 text-[11px] text-[#7fb0ef]">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-[12px] text-[#94a3b8]">
                <span>
                  {post.date} · {post.category} 게시판
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="size-3.5" />
                  {post.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="size-3.5" />
                  {post.comments}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" />
                  {post.views}
                </span>
                <span>{post.scraps}</span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 md:items-end">
              <span className={`rounded-lg px-4 py-1.5 text-[12px] font-semibold text-white ${statusClassName(post.status.tone)}`}>
                {post.status.label}
              </span>

              {post.thumbnail ? (
                <div className="hidden h-[104px] w-[144px] overflow-hidden rounded-xl bg-[#eff3f8] md:block">
                  <img className="h-full w-full object-cover" src={post.thumbnail} alt="" />
                </div>
              ) : null}

              <div className="flex gap-2 pt-2">
                <button className="rounded-lg bg-[#ebb72d] px-4 py-2 text-[13px] font-semibold text-white" type="button">
                  지원서 수정하기
                </button>
                <button className="rounded-lg bg-[#d16f68] px-4 py-2 text-[13px] font-semibold text-white" type="button">
                  지원 취소하기
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </MyPageShell>
  );
}
