import { useMemo, useState } from "react";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { MyPageShell } from "../components/MyPageShell";

const postTabs = ["전체", "자유/정보", "코딩 테스트", "팀원 모집", "강의/수업", "동아리/행사/홍보"] as const;

const posts = [
  {
    id: 1,
    category: "강의/수업",
    author: "한국외대 지킴이",
    department: "영어통번역학과",
    role: "백엔드",
    title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
    summary: "안녕하세요! 오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 상세하게 공유해보려고 합니다.",
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
    category: "자유/정보",
    author: "한국외대 지킴이",
    department: "영어통번역학과",
    role: "백엔드",
    title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
    summary: "오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 정리했던 내용을 간단히 남겨봅니다.",
    tags: ["취업후기", "비전공자", "네카라쿠배"],
    date: "26.02.24",
    likes: 128,
    comments: 42,
    views: "1.2k",
    scraps: 812,
  },
];

export function MyPostsPage() {
  const [activeTab, setActiveTab] = useState<(typeof postTabs)[number]>("전체");

  const filteredPosts = useMemo(() => {
    if (activeTab === "전체") {
      return posts;
    }

    return posts.filter((post) => post.category === activeTab);
  }, [activeTab]);

  return (
    <MyPageShell activeSection="posts">
      <h1 className="text-[28px] font-bold tracking-[-0.02em] text-black md:text-[32px]">작성한 게시글</h1>

      <div className="mt-8">
        <div className="flex flex-wrap gap-6 border-b border-[#e5e7eb] text-[14px] text-[#b0b8c5]">
          {postTabs.map((tab) => (
            <button
              key={tab}
              className={`border-b-2 pb-3 transition ${
                activeTab === tab ? "border-black font-semibold text-[#111827]" : "border-transparent"
              }`}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-12">
          {filteredPosts.map((post) => (
            <article key={post.id} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_144px] md:gap-6">
              <div>
                <div className="text-[11px] text-[#94a3b8]">글로벌 캠퍼스 &gt; 컴퓨터공학부</div>
                <div className="mt-3 flex items-center gap-3">
                  <img className="size-8 rounded-full object-cover" src="/default_profile.png" alt="" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#111827]">{post.author}</div>
                    <div className="text-[10px] text-[#94a3b8]">
                      {post.department} • {post.role}
                    </div>
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

              {post.thumbnail ? (
                <div className="hidden overflow-hidden rounded-xl bg-[#eff3f8] md:block">
                  <img className="h-full w-full object-cover" src={post.thumbnail} alt="" />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </MyPageShell>
  );
}
