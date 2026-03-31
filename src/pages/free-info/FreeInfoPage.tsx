
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Eye, MessageCircle, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBoardPosts, getDisplayAuthorName, type BoardPostOrder } from "../../api/posts";
import { UserTierIcon } from "../../components/UserTierIcon";
import { useOptionalCurrentUser } from "../../hooks/useOptionalCurrentUser";

const FREE_INFO_BOARD_CODE = 'GENERAL';
const SORT_OPTIONS: Array<{ label: string; value: BoardPostOrder }> = [
  { label: "최신순", value: "latest" },
  { label: "조회수순", value: "views" },
  { label: "좋아요순", value: "likes" },
];
const BOARD_TABS = [
  { label: "전체", value: "all" },
  { label: "인기글", value: "popular" },
] as const;

type BoardTab = (typeof BOARD_TABS)[number]["value"];

function formatPostDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(parsedDate)
    .replace(/\.\s/g, ".")
    .replace(/\.$/, "");
}

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }

  return value.toLocaleString("ko-KR");
}

export function FreeInfoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BoardTab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeOrder, setActiveOrder] = useState<BoardPostOrder>("latest");
  const currentUserQuery = useOptionalCurrentUser();

  const effectiveOrder: BoardPostOrder = activeTab === "popular" ? "likes" : activeOrder;
  const freeInfoPostsQuery = useQuery({
    queryKey: ["board-posts", "free-info", FREE_INFO_BOARD_CODE, keyword, effectiveOrder],
    queryFn: async () => {
      const response = await getBoardPosts({
        code: FREE_INFO_BOARD_CODE,
        keyword,
        order: effectiveOrder,
        page: 0,
        size: 20,
        sort: ["createdAt,DESC"],
      });

      return response.data;
    },
    staleTime: 1000 * 60,
  });

  const posts = freeInfoPostsQuery.data?.posts ?? [];

  const onSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
  };

  return (
    <section className="grid gap-8 md:gap-12">
      <div className="grid gap-12">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-black md:text-[44px]">자유/정보 게시판</h1>

        <div className="grid gap-5">
          <div className="border-b border-[#dee2e6]">
            <div className="flex items-center gap-1">
              {BOARD_TABS.map((tab) => {
                const isActive = activeTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    className={`relative px-3 py-[10px] text-base tracking-[-0.03em] ${
                      isActive ? "font-semibold text-[#1b1c1d]" : "font-medium text-[#adb5bd]"
                    }`}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.label}
                    {isActive ? <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-[#1b1c1d]" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <form className="flex flex-col gap-4 md:flex-row md:items-center" onSubmit={onSubmitSearch}>
            <div className="flex h-12 flex-1 items-center rounded-[4px] border border-[#dee2e6] bg-[#fefeff] px-[13px]">
              <svg className="mr-3 h-4 w-4 shrink-0 text-[#1b1c1d]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                className="w-full bg-transparent text-[14.4px] font-semibold tracking-[-0.03em] text-[#1b1c1d] outline-none placeholder:text-[#ced4da]"
                placeholder="찾고 싶은 내용을 검색해보세요!"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>

            <button
              className="h-12 min-w-28 rounded-[4px] border border-[#87bcf5] bg-[#87bcf5] px-6 text-sm font-semibold tracking-[-0.03em] text-[#f7faff]"
              type="submit"
            >
              검색
            </button>
          </form>

          <div className="flex flex-col gap-4 border-b border-[#dee2e6] pb-[13px] md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-2">
              {SORT_OPTIONS.map((option) => {
                const isActive = effectiveOrder === option.value;

                return (
                  <button
                    key={option.value}
                    className={`inline-flex items-center gap-1 rounded-[4px] px-1.5 py-1 text-sm tracking-[-0.03em] ${
                      isActive ? "font-semibold text-[#1b1c1d]" : "font-semibold text-[#adb5bd]"
                    }`}
                    type="button"
                    onClick={() => {
                      setActiveTab("all");
                      setActiveOrder(option.value);
                    }}
                  >
                    <span className="text-[10px]">•</span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="md:ml-auto">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-[#0f172a] bg-[#1e293b] px-[13px] text-sm font-semibold tracking-[-0.03em] text-[#f7faff]"
                type="button"
                onClick={() => navigate(currentUserQuery.data ? "/free-info/write" : "/login")}
              >
                <span className="text-base leading-none">✎</span>
                <span>글쓰기</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="inline-flex items-center gap-2 rounded-lg bg-[#fff3f3] px-4 py-3 text-xs font-semibold text-[#e15851]">
          <span>📢</span>
          <span>공지사항</span>
        </div>
        <div className="flex-1 rounded-lg bg-[#fff3f3] px-4 py-3 text-xs font-semibold text-[#475569]">
          부적절한 콘텐츠 업로드 및 언행은 즉시 조치될 수 있으니 깨끗한 커뮤니티를 위해 주의해주세요!
        </div>
      </div>

      <div className="grid gap-6">
        {freeInfoPostsQuery.isLoading ? (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center text-sm text-slate-400">
            게시글 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {freeInfoPostsQuery.isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
            {freeInfoPostsQuery.error instanceof Error
              ? freeInfoPostsQuery.error.message
              : "게시글 목록을 불러오지 못했습니다."}
          </div>
        ) : null}

        {!freeInfoPostsQuery.isLoading && !freeInfoPostsQuery.isError && !posts.length ? (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center text-sm text-slate-400">
            아직 등록된 게시글이 없습니다.
          </div>
        ) : null}

        {!freeInfoPostsQuery.isLoading && !freeInfoPostsQuery.isError
          ? posts.map((post) => (
              <article key={post.postId} className="grid gap-4 py-4">
                <div className="flex items-center gap-3">
                  <img
                    alt=""
                    src={post.author?.profileImageUrl || "/default_profile.png"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="grid gap-1">
                    <div className="flex items-center gap-1">
                      <p className="text-[13px] font-bold leading-5 text-[#0f172a]">{getDisplayAuthorName(post.author?.nickname, post.authorNickname)}</p>
                      {post.author?.tierBadgeImageUrl ? (
                        <img alt="" className="h-[13px] w-3 object-contain" src={post.author.tierBadgeImageUrl} />
                      ) : (
                        <UserTierIcon tier="루비" className="h-[13px] w-3" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">
                      <span>
                        {[post.author?.departmentName, post.author?.representativeTrackName].filter(Boolean).join(" · ") || "자유/정보 게시판"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <Link
                    to={`/free-info/${post.postId}`}
                    className="text-xl font-bold leading-tight tracking-[-0.02em] text-[#0f172a] transition-colors hover:text-[var(--color-primary-hover)] md:text-[28px]"
                  >
                    {post.title}
                  </Link>

                  {post.tagNames.length ? (
                    <div className="flex flex-wrap gap-4">
                      {post.tagNames.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-1 text-[11px] text-[#90a1b9] md:flex-row md:items-center md:gap-4">
                    <span>{formatPostDate(post.createdAt)} · 자유/정보 게시판</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <span className="inline-flex items-center gap-1 text-[#94a3b8]">
                        <ThumbsUp size={12} strokeWidth={1.8} />
                        {formatCount(post.likeCount ?? 0)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#94a3b8]">
                        <MessageCircle size={12} strokeWidth={1.8} />
                        {formatCount(post.commentCount)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#94a3b8]">
                        <Eye size={12} strokeWidth={1.8} />
                        {formatCount(post.viewCount)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#94a3b8]">
                        <Bookmark size={12} strokeWidth={1.8} />
                        {formatCount(post.scrapCount)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          : null}
      </div>
    </section>
  );
}
