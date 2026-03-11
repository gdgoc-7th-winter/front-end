import { Link } from "react-router-dom";
import { Bookmark, Eye, MessageCircle, PenLine, Search, ThumbsUp } from "lucide-react";
import { UserTierIcon } from "../components/UserTierIcon";

type BadgeTier = "루비" | "다이아";
type PostItem = {
  id: number;
  author: string;
  dept: string;
  part: string;
  badge: BadgeTier;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  likes: string;
  comments: string;
  views: string;
  scraps: string;
};

const boardTabs = ["전체", "인기글"] as const;
const sortTabs = ["최신순", "조회수순", "좋아요순"] as const;

const posts: PostItem[] = [
  {
    id: 1,
    author: "한국외대 지킴이",
    dept: "영어통번역학과",
    part: "백엔드",
    badge: "루비",
    title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
    excerpt:
      "안녕하세요! 오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 상세하게 공유해보려고 합니다. 우선 가장 중요했던 건 기초 CS 지식과...",
    tags: ["취업후기", "비전공자", "네카라쿠배"],
    date: "26.02.24",
    likes: "128",
    comments: "42",
    views: "1.2k",
    scraps: "812",
  },
  {
    id: 2,
    author: "코딩테스트 만점 받고 싶어요",
    dept: "컴퓨터공학과",
    part: "프론트엔드",
    badge: "다이아",
    title: "프로그래머스 Lv.3 '네트워크' 문제 효율적인 풀이법",
    excerpt:
      "DFS와 BFS 중 어떤 것을 선택해야 할지 고민되는 문제였습니다. 제가 작성한 코드와 시간 복잡도 분석 내용을 공유합니다.",
    tags: ["코테", "프로그래머스", "DFS", "BFS"],
    date: "26.02.24",
    likes: "128",
    comments: "42",
    views: "1.2k",
    scraps: "812",
  },
  {
    id: 3,
    author: "한국외대 지킴이",
    dept: "영어통번역학과",
    part: "백엔드",
    badge: "루비",
    title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
    excerpt:
      "안녕하세요! 오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 상세하게 공유해보려고 합니다. 우선 가장 중요했던 건 기초 CS 지식과...",
    tags: ["취업후기", "비전공자", "네카라쿠배"],
    date: "26.02.24",
    likes: "128",
    comments: "42",
    views: "1.2k",
    scraps: "812",
  },
  {
    id: 4,
    author: "코딩테스트 만점 받고 싶어요",
    dept: "컴퓨터공학과",
    part: "프론트엔드",
    badge: "다이아",
    title: "프로그래머스 Lv.3 '네트워크' 문제 효율적인 풀이법",
    excerpt:
      "DFS와 BFS 중 어떤 것을 선택해야 할지 고민되는 문제였습니다. 제가 작성한 코드와 시간 복잡도 분석 내용을 공유합니다.",
    tags: ["코테", "프로그래머스", "DFS", "BFS"],
    date: "26.02.24",
    likes: "128",
    comments: "42",
    views: "1.2k",
    scraps: "812",
  },
];

function PostMetaIcon({
  icon,
  value,
}: {
  icon: "like" | "comment" | "view" | "bookmark";
  value: string;
}) {
  const iconClassName = "h-[13px] w-[13px] text-slate-400";

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] leading-4 text-slate-400">
      {icon === "like" ? <ThumbsUp className={iconClassName} strokeWidth={1.8} /> : null}
      {icon === "comment" ? <MessageCircle className={iconClassName} strokeWidth={1.8} /> : null}
      {icon === "view" ? <Eye className={iconClassName} strokeWidth={1.8} /> : null}
      {icon === "bookmark" ? <Bookmark className={iconClassName} strokeWidth={1.8} /> : null}
      <span>{value}</span>
    </span>
  );
}

export function FreeInfoPage() {
  return (
    <section className="grid gap-12 md:gap-12">
      <h1 className="text-[32px] font-bold leading-6 tracking-[-0.03em] text-black">자유/정보 게시판</h1>

      <div className="grid gap-6">
        <div className="border-b border-[#dee2e6]">
          <div className="flex items-center gap-4">
            {boardTabs.map((tab, index) => {
              const isActive = index === 0;

              return (
                <button
                  key={tab}
                  type="button"
                  className={`relative flex h-[45px] items-center justify-center px-3 text-base tracking-[-0.02em] ${
                    isActive ? "font-semibold text-[#1b1c1d]" : "font-medium text-[#adb5bd]"
                  }`}
                >
                  {tab}
                  {isActive ? <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-[#1b1c1d]" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex h-12 flex-1 items-center rounded border border-[#dee2e6] bg-[#fefeff] px-[13px]">
            <Search className="mr-3 h-4 w-4 text-slate-500" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="찾고 싶은 내용을 검색해보세요!"
              className="w-full border-0 bg-transparent text-[14.4px] font-semibold tracking-[-0.02em] text-slate-700 outline-none placeholder:text-[#ced4da]"
            />
          </label>
          <button
            type="button"
            className="h-12 min-w-28 rounded bg-[var(--color-primary-main)] px-8 text-sm font-semibold tracking-[-0.02em] text-[#f7faff] transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            검색
          </button>
        </div>

        <div className="flex flex-col gap-4 border-b border-[#dee2e6] pb-[13px] md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-1 text-sm">
            {sortTabs.map((tab, index) => {
              const isActive = index === 0;

              return (
                <button
                  key={tab}
                  type="button"
                  className={`inline-flex items-center gap-1 px-[6px] py-1 text-sm tracking-[-0.02em] ${
                    isActive ? "font-semibold text-[#1b1c1d]" : "font-semibold text-[#adb5bd]"
                  }`}
                >
                  <span className={`text-xs ${isActive ? "text-[#64748b]" : "text-[#cbd5e1]"}`}>•</span>
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="md:ml-auto">
            <Link
              to="/free-info/write"
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-[#0f172a] bg-[#1e293b] px-[13px] text-sm font-semibold tracking-[-0.02em] text-[#f7faff]"
            >
              <PenLine className="h-4 w-4" strokeWidth={1.8} />
              글쓰기
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#fff3f3] px-4 py-3 text-xs font-semibold text-[#e15851]">
            <span className="text-sm leading-none">📢</span>
            <span>공지사항</span>
          </div>
          <div className="flex-1 rounded-lg bg-[#fff3f3] px-4 py-3 text-xs font-semibold text-[#475569]">
            부적절한 콘텐츠 업로드 및 언행은 즉시 조치될 수 있으니 깨끗한 커뮤니티를 위해 주의해주세요!
          </div>
        </div>

        <div className="grid gap-0">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-transparent py-4">
              <div className="grid gap-6">
                <div className="flex items-center gap-3">
                  <img src="/default_profile.png" width={40} height={40} className="rounded-lg object-cover" />
                  <div className="grid gap-1">
                    <p className="text-[13px] font-bold leading-5 text-slate-900">
                      {post.author}
                      <UserTierIcon tier={post.badge} className="ml-1 inline-block h-[13px] w-3 align-[-2px]" />
                    </p>
                    <div className="flex flex-wrap items-center gap-1 text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">
                      <span>{post.dept}</span>
                      <span>•</span>
                      <span>{post.part}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Link
                      to={`/free-info/${post.id}`}
                      className="text-[24px] font-bold leading-8 tracking-[-0.03em] text-slate-900 transition-colors hover:text-[var(--color-primary-hover)] md:text-[27px]"
                    >
                      {post.title}
                    </Link>
                    <p className="text-[13px] leading-[1.75] text-[#475569]">{post.excerpt}</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-[11px] text-slate-400 md:flex-row md:items-center md:gap-4">
                  <span className="leading-4 text-[#90a1b9]">{post.date} · 자유/정보 게시판</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <PostMetaIcon icon="like" value={post.likes} />
                    <PostMetaIcon icon="comment" value={post.comments} />
                    <PostMetaIcon icon="view" value={post.views} />
                    <PostMetaIcon icon="bookmark" value={post.scraps} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
