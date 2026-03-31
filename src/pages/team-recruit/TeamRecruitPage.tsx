import { Bookmark, Eye, MessageCircle, PencilLine, Search, Star, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOptionalCurrentUser } from "../../hooks/useOptionalCurrentUser";
import {
  TEAM_RECRUIT_CATEGORY_OPTIONS,
  TEAM_RECRUIT_POSTS,
  TEAM_RECRUIT_SORT_OPTIONS,
  getRecruitCategoryLabel,
  getRecruitStatusLabel,
  type TeamRecruitCategory,
} from "../../mock/teamRecruit";

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

function getDaysLeftLabel(endDate: string) {
  const today = new Date("2026-03-25T00:00:00+09:00");
  const target = new Date(`${endDate}T00:00:00+09:00`);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff <= 0) {
    return "마감";
  }

  return `D-${diff}`;
}

type SortOption = (typeof TEAM_RECRUIT_SORT_OPTIONS)[number]["value"];

export function TeamRecruitPage() {
  const navigate = useNavigate();
  const currentUserQuery = useOptionalCurrentUser();
  const [activeCategory, setActiveCategory] = useState<TeamRecruitCategory>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeSort, setActiveSort] = useState<SortOption>("latest");

  const filteredPosts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const nextPosts = TEAM_RECRUIT_POSTS.filter((post) => {
      const matchesCategory = activeCategory === "ALL" ? true : post.category === activeCategory;
      const matchesKeyword = normalizedKeyword
        ? [post.title, post.excerpt, post.author.name, ...post.tags].some((value) => value.toLowerCase().includes(normalizedKeyword))
        : true;

      return matchesCategory && matchesKeyword;
    });

    return [...nextPosts].sort((left, right) => {
      if (activeSort === "views") {
        return right.viewCount - left.viewCount;
      }

      if (activeSort === "likes") {
        return right.likeCount - left.likeCount;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [activeCategory, activeSort, keyword]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(searchInput);
  };

  return (
    <section className="grid gap-8 md:gap-12">
      <div className="grid gap-12">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-black md:text-[44px]">팀원 모집 게시판</h1>

        <div className="grid gap-5">
          <div className="border-b border-[#dee2e6]">
            <div className="flex flex-wrap items-center gap-1">
              {TEAM_RECRUIT_CATEGORY_OPTIONS.map((category) => {
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
              <Search className="mr-3 h-4 w-4 shrink-0 text-[#1b1c1d]" strokeWidth={2} />
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
              {TEAM_RECRUIT_SORT_OPTIONS.map((option) => {
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
                onClick={() => navigate(currentUserQuery.data ? "/team-recruit/write" : "/login")}
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
        {!filteredPosts.length ? (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center text-sm text-slate-400">
            조건에 맞는 모집 글이 없습니다.
          </div>
        ) : null}

        {filteredPosts.map((post) => (
          <article key={post.postId} className="grid gap-4 py-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#475569]">
              <span className="inline-flex items-center gap-2">
                <Star size={12} className="fill-current text-[#475569]" />
                {getRecruitCategoryLabel(post.category)}
              </span>
              <span>|</span>
              <span>
                {post.recruitStartDate.replaceAll("-", ".")} - {post.recruitEndDate.replaceAll("-", ".")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                alt=""
                src={post.author.profileImageUrl || "/default_profile.png"}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div className="grid gap-1">
                <p className="text-[13px] font-bold leading-5 text-[#0f172a]">{post.author.name}</p>
                <div className="flex items-center gap-1 text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">
                  <span>{`${post.author.department} · ${post.author.role}`}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="grid flex-1 gap-4">
                <span
                  className={`inline-flex w-fit items-center rounded-[4px] px-4 py-1.5 text-xs font-semibold ${
                    post.status === "OPEN" ? "bg-[#65c18b] text-[#f7faff]" : "bg-[#dee2e6] text-[#475569]"
                  }`}
                >
                  {post.status === "OPEN" ? getDaysLeftLabel(post.recruitEndDate) : getRecruitStatusLabel(post.status)}
                </span>

                <Link
                  to={`/team-recruit/${post.postId}`}
                  className="text-xl font-bold leading-tight tracking-[-0.02em] text-[#0f172a] transition-colors hover:text-[var(--color-primary-hover)] md:text-[28px]"
                >
                  {post.title}
                </Link>

                <p className="text-[13px] leading-[1.75] text-[#475569]">{post.excerpt}</p>

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

                <div className="flex flex-col gap-1 text-[11px] text-[#90a1b9] md:flex-row md:items-center md:gap-4">
                  <span>{formatPostDate(post.createdAt)} · 팀원 모집 게시판</span>
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

              <div className="flex h-[92px] w-full items-center justify-center rounded-[12px] border border-[#e5e7eb] bg-[#0f172a] px-6 text-sm font-semibold text-[#dbeafe] md:ml-8 md:w-[196px]">
                {post.thumbnailLabel || "썸네일"}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
