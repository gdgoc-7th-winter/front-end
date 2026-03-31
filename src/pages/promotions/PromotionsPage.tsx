import { useQuery } from "@tanstack/react-query";
import { Bookmark, Eye, MessageCircle, PencilLine, Star, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WITHDRAWN_USER_LABEL, getPromotions, type PromotionCategory, type PromotionPostSummary } from "../../api/posts";
import { UserTierIcon } from "../../components/UserTierIcon";
import { useOptionalCurrentUser } from "../../hooks/useOptionalCurrentUser";

const PROMOTION_CATEGORY_OPTIONS: Array<{ label: string; value: PromotionCategory | "ALL" }> = [
  { label: "전체", value: "ALL" },
  { label: "동아리", value: "CLUB" },
  { label: "행사", value: "EVENT" },
  { label: "프로젝트", value: "PROJECT" },
  { label: "대회", value: "CONTEST" },
  { label: "기타", value: "ETC" },
];

const PROMOTION_SORT_OPTIONS = [
  { label: "최신순", value: "latest" },
  { label: "조회수순", value: "views" },
  { label: "좋아요순", value: "likes" },
] as const;

type PromotionSortOption = (typeof PROMOTION_SORT_OPTIONS)[number]["value"];
type PromotionListItem = {
  postId: number;
  category: PromotionCategory;
  title: string;
  excerpt: string;
  thumbnailUrl: string;
  tags: string[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  scrapCount: number;
  author: {
    nickname: string;
    profileImageUrl: string;
    departmentName: string;
    representativeTrackName: string;
    tierBadgeImageUrl: string;
  };
};

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

function normalizeTags(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function getPromotionTagSource(post: Record<string, unknown>) {
  if (Array.isArray(post["tagNames"])) {
    return post["tagNames"] as string[];
  }

  if (Array.isArray(post["tags"])) {
    return post["tags"] as string[];
  }

  if (typeof post["tags"] === "string") {
    return post["tags"];
  }

  return undefined;
}

function normalizePromotionPosts(value: unknown): PromotionPostSummary[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is PromotionPostSummary => Boolean(item) && typeof item === "object");
  }
  return [];
}

function toSafeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function toSafeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isPromotionCategory(value: unknown): value is PromotionCategory {
  return value === "CLUB" || value === "EVENT" || value === "PROJECT" || value === "CONTEST" || value === "ETC";
}

function normalizePromotionListItem(value: unknown): PromotionListItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const postValue = item["post"];

  if (!postValue || typeof postValue !== "object") {
    return null;
  }

  const post = postValue as Record<string, unknown>;
  const authorValue = post["author"];
  const author = authorValue && typeof authorValue === "object" ? (authorValue as Record<string, unknown>) : null;
  const normalizedCategory = isPromotionCategory(item["category"]) ? item["category"] : "ETC";
  const normalizedPostId = toSafeNumber(post["postId"], -1);

  if (normalizedPostId < 0) {
    return null;
  }

  return {
    postId: normalizedPostId,
    category: normalizedCategory,
    title: toSafeString(post["title"], "제목 없음"),
    excerpt: toSafeString(post["excerpt"]),
    thumbnailUrl: toSafeString(post["thumbnailUrl"]),
    tags: normalizeTags(getPromotionTagSource(post)),
    createdAt: toSafeString(post["createdAt"]),
    likeCount: toSafeNumber(post["likeCount"]),
    commentCount: toSafeNumber(post["commentCount"]),
    viewCount: toSafeNumber(post["viewCount"]),
    scrapCount: toSafeNumber(post["scrapCount"]),
    author: {
      nickname: toSafeString(author?.["nickname"], WITHDRAWN_USER_LABEL),
      profileImageUrl: toSafeString(author?.["profileImageUrl"]) || "/default_profile.png",
      departmentName: toSafeString(author?.["departmentName"]),
      representativeTrackName: toSafeString(author?.["representativeTrackName"]),
      tierBadgeImageUrl: toSafeString(author?.["tierBadgeImageUrl"]),
    },
  };
}

function getPromotionCategoryLabel(category: PromotionCategory) {
  return PROMOTION_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? "기타";
}

function getPromotionSortQuery(sort: PromotionSortOption) {
  if (sort === "views") {
    return ["viewCount,DESC"];
  }

  if (sort === "likes") {
    return ["likeCount,DESC"];
  }

  return ["createdAt,DESC"];
}

export function PromotionsPage() {
  const navigate = useNavigate();
  const currentUserQuery = useOptionalCurrentUser();
  const [activeCategory, setActiveCategory] = useState<PromotionCategory | "ALL">("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeSort, setActiveSort] = useState<PromotionSortOption>("latest");

  const promotionsQuery = useQuery({
    queryKey: ["promotions", activeCategory, activeSort],
    queryFn: async () => {
      const response = await getPromotions({
        category: activeCategory === "ALL" ? undefined : activeCategory,
        page: 0,
        size: 20,
        sort: getPromotionSortQuery(activeSort),
      });

      return response.data;
    },
    staleTime: 1000 * 60,
  });

  const posts = useMemo(() => {
    const serverPosts = normalizePromotionPosts(promotionsQuery.data?.posts)
      .map((post) => normalizePromotionListItem(post))
      .filter((post): post is PromotionListItem => post !== null);
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return serverPosts;
    }

    return serverPosts.filter((post) => {
      const searchableValues = [post.title, post.excerpt, post.author.nickname, ...post.tags];

      return searchableValues.some((value) => value.toLowerCase().includes(normalizedKeyword));
    });
  }, [keyword, promotionsQuery.data?.posts]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
  };

  return (
    <section className="grid gap-8 md:gap-12">
      <div className="grid gap-12">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-black md:text-[44px]">동아리/행사/홍보 게시판</h1>

        <div className="grid gap-5">
          <div className="border-b border-[#dee2e6]">
            <div className="flex flex-wrap items-center gap-1">
              {PROMOTION_CATEGORY_OPTIONS.map((category) => {
                const isActive = activeCategory === category.value;

                return (
                  <button
                    key={category.value}
                    className={`relative px-3 py-[10px] text-base tracking-[-0.03em] ${
                      isActive ? "font-semibold text-[#1b1c1d]" : "font-medium text-[#adb5bd]"
                    }`}
                    type="button"
                    onClick={() => setActiveCategory(category.value)}
                  >
                    {category.label}
                    {isActive ? <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-[#1b1c1d]" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <form className="flex flex-col gap-4 md:flex-row md:items-center" onSubmit={handleSearchSubmit}>
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
              {PROMOTION_SORT_OPTIONS.map((option) => {
                const isActive = activeSort === option.value;

                return (
                  <button
                    key={option.value}
                    className={`inline-flex items-center gap-1 rounded-[4px] px-1.5 py-1 text-sm tracking-[-0.03em] ${
                      isActive ? "font-semibold text-[#1b1c1d]" : "font-semibold text-[#adb5bd]"
                    }`}
                    type="button"
                    onClick={() => setActiveSort(option.value)}
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
                onClick={() => navigate(currentUserQuery.data ? "/promotions/write" : "/login")}
              >
                <PencilLine size={14} strokeWidth={2.2} />
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

      <div className="grid gap-8">
        {promotionsQuery.isLoading ? (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center text-sm text-slate-400">
            게시글 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {promotionsQuery.isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
            {promotionsQuery.error instanceof Error ? promotionsQuery.error.message : "게시글 목록을 불러오지 못했습니다."}
          </div>
        ) : null}

        {!promotionsQuery.isLoading && !promotionsQuery.isError && !posts.length ? (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center text-sm text-slate-400">
            아직 등록된 게시글이 없습니다.
          </div>
        ) : null}

        {!promotionsQuery.isLoading && !promotionsQuery.isError
          ? posts.map((post) => {
              return (
                <article key={post.postId} className="grid gap-4 py-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#475569]">
                    <span className="inline-flex items-center gap-2">
                      <Star size={12} className="fill-current text-[#475569]" />
                      {getPromotionCategoryLabel(post.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      alt=""
                      src={post.author.profileImageUrl}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div className="grid gap-1">
                      <div className="flex items-center gap-1">
                        <p className="text-[13px] font-bold leading-5 text-[#0f172a]">{post.author.nickname}</p>
                        {post.author.tierBadgeImageUrl ? (
                          <img alt="" className="h-[13px] w-3 object-contain" src={post.author.tierBadgeImageUrl} />
                        ) : (
                          <UserTierIcon tier="루비" className="h-[13px] w-3" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">
                        <span>
                          {[post.author.departmentName, post.author.representativeTrackName].filter(Boolean).join(" · ") ||
                            "동아리/행사/홍보 게시판"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="grid flex-1 gap-4">
                      <Link
                        to={`/promotions/${post.postId}`}
                        className="text-xl font-bold leading-tight tracking-[-0.02em] text-[#0f172a] transition-colors hover:text-[var(--color-primary-hover)] md:text-[28px]"
                      >
                        {post.title}
                      </Link>

                      {post.excerpt ? <p className="text-[13px] leading-[1.75] text-[#475569]">{post.excerpt}</p> : null}

                      {post.tags.length ? (
                        <div className="flex flex-wrap gap-3">
                          {post.tags.map((tag) => (
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
                        <span>{formatPostDate(post.createdAt)} · 동아리/행사/홍보 게시판</span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          <span className="inline-flex items-center gap-1 text-[#94a3b8]">
                            <ThumbsUp size={12} strokeWidth={1.8} />
                            {formatCount(post.likeCount)}
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

                    {post.thumbnailUrl ? (
                      <div className="overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-[#111827] md:ml-8 md:w-[196px]">
                        <img alt={`${post.title} 썸네일`} className="h-[92px] w-full object-cover" src={post.thumbnailUrl} />
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </section>
  );
}
