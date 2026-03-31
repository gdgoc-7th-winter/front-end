
import { useQuery } from "@tanstack/react-query";
import { Bookmark, ChevronDown, Eye, Megaphone, MessageCircle, PenSquare, Search, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { type BoardPostOrder, type LectureCampus, getLecturePosts } from "../../api/posts";
import { useOptionalCurrentUser } from "../../hooks/useOptionalCurrentUser";

const SORT_OPTIONS: Array<{ label: string; value: BoardPostOrder }> = [
  { label: "최신순", value: "latest" },
  { label: "조회수순", value: "views" },
  { label: "좋아요순", value: "likes" },
];
const BOARD_TABS = [
  { label: "전체", value: "all" },
  { label: "인기글", value: "popular" },
] as const;
const CAMPUS_OPTIONS: Array<{ label: string; value: LectureCampus | "ALL" }> = [
  { label: "전체 캠퍼스", value: "ALL" },
  { label: "서울 캠퍼스", value: "SEOUL" },
  { label: "글로벌 캠퍼스", value: "GLOBAL" },
];
const DEPARTMENT_OPTIONS = ["전체 학과", "컴퓨터공학부", "정보통신공학과", "영어통번역학과"] as const;

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

function getCampusLabel(value: LectureCampus | "ALL") {
  if (value === "SEOUL") {
    return "서울 캠퍼스";
  }

  if (value === "GLOBAL") {
    return "글로벌 캠퍼스";
  }

  return "전체 캠퍼스";
}

function getTrackLabel(value?: string | null) {
  if (!value) {
    return "";
  }

  const trackLabels: Record<string, string> = {
    FRONTEND: "프론트엔드",
    BACKEND: "백엔드",
    DESIGN: "디자인",
    PM: "기획",
    AI: "AI",
    DEVOPS: "데브옵스",
  };

  return trackLabels[value] ?? value;
}

function getProfileImageSrc(value?: string | null) {
  return value?.trim() ? value : "/default_profile.png";
}

export function LecturePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BoardTab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeOrder, setActiveOrder] = useState<BoardPostOrder>("latest");
  const [selectedCampus, setSelectedCampus] = useState<LectureCampus | "ALL">("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState<(typeof DEPARTMENT_OPTIONS)[number]>("전체 학과");
  const currentUserQuery = useOptionalCurrentUser();

  const effectiveOrder: BoardPostOrder = activeTab === "popular" ? "likes" : activeOrder;
  const lecturePostsQuery = useQuery({
    queryKey: ["lecture-posts", keyword, effectiveOrder, selectedCampus, selectedDepartment],
    queryFn: async () => {
      const response = await getLecturePosts({
        keyword,
        campus: selectedCampus === "ALL" ? undefined : selectedCampus,
        departments: selectedDepartment === "전체 학과" ? undefined : [selectedDepartment],
        order: effectiveOrder,
        page: 0,
        size: 20,
        sort: ["createdAt,DESC"],
      });

      return response.data;
    },
    staleTime: 1000 * 60,
  });

  const posts = lecturePostsQuery.data?.data ?? [];

  const onSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(searchInput.trim());
  };

  return (
    <section className="mx-auto grid w-full max-w-[1024px] gap-8 pb-12 pt-2 md:gap-10">
      <div className="grid gap-6 md:gap-8">
        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#111827]">강의/수업 게시판</h1>

        <div className="grid gap-5">
          <div className="border-b border-[#dee2e6]">
            <div className="flex items-center gap-1">
              {BOARD_TABS.map((tab) => {
                const isActive = activeTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    className={`relative h-[46px] w-24 px-3 text-base tracking-[-0.03em] ${
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
              <Search className="mr-3 h-4 w-4 shrink-0 text-[#1b1c1d]" strokeWidth={2} />
              <input
                className="w-full bg-transparent text-[14.4px] font-semibold tracking-[-0.03em] text-[#1b1c1d] outline-none placeholder:text-[#ced4da]"
                placeholder="과목명, 교수명, 학과, 태그로 검색해보세요!"
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
                onClick={() => navigate(currentUserQuery.data ? "/lecture/write" : "/login")}
              >
                <PenSquare size={14} strokeWidth={2.2} />
                <span>글쓰기</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="inline-flex items-center gap-2 rounded-lg bg-[#fff3f3] px-4 py-3 text-xs font-semibold text-[#e15851]">
          <Megaphone size={14} fill="currentColor" strokeWidth={1.5} />
          <span>공지사항</span>
        </div>
        <div className="flex-1 rounded-lg bg-[#fff3f3] px-4 py-3 text-xs font-semibold text-[#475569]">
          부적절한 콘텐츠 업로드 및 언행은 즉시 조치될 수 있으니 깨끗한 커뮤니티를 위해 주의해주세요!
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative">
          <select
            className="h-10 w-full appearance-none rounded-[4px] bg-[#f7faff] px-4 pr-10 text-sm font-medium text-[#475569] outline-none md:w-[200px]"
            value={selectedCampus}
            onChange={(event) => setSelectedCampus(event.target.value as LectureCampus | "ALL")}
          >
            {CAMPUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
        </div>

        <div className="relative">
          <select
            className="h-10 w-full appearance-none rounded-[4px] bg-[#f7faff] px-4 pr-10 text-sm font-medium text-[#475569] outline-none md:w-[200px]"
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value as (typeof DEPARTMENT_OPTIONS)[number])}
          >
            {DEPARTMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
        </div>
      </div>

      <div className="grid gap-6">
        {lecturePostsQuery.isLoading ? (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center text-sm text-slate-400">
            게시글 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {lecturePostsQuery.isError ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
            {lecturePostsQuery.error instanceof Error ? lecturePostsQuery.error.message : "게시글 목록을 불러오지 못했습니다."}
          </div>
        ) : null}

        {!lecturePostsQuery.isLoading && !lecturePostsQuery.isError && !posts.length ? (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center text-sm text-slate-400">
            아직 등록된 게시글이 없습니다.
          </div>
        ) : null}

        {!lecturePostsQuery.isLoading && !lecturePostsQuery.isError
          ? posts.map((post) => (
              <article key={post.postId} className="grid gap-5 border-b border-[#f1f5f9] py-4 last:border-b-0">
                <div className="text-xs font-medium text-[#475569]">
                  {getCampusLabel(post.campus ?? "ALL")}
                  {post.department ? ` > ${post.department}` : null}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    alt=""
                    src={getProfileImageSrc(post.author?.profileImageUrl)}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="grid gap-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-bold leading-5 text-[#0f172a]">
                        {post.author?.nickname ?? "익명"}
                      </p>
                      {post.author?.tierBadgeImageUrl ? (
                        <img
                          alt=""
                          src={post.author.tierBadgeImageUrl}
                          width={12}
                          height={13}
                          className="h-[13px] w-3 object-contain"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">
                      {post.author?.departmentName ? <span>{post.author.departmentName}</span> : null}
                      {post.author?.departmentName && post.author?.representativeTrackName ? <span>•</span> : null}
                      {post.author?.representativeTrackName ? <span>{getTrackLabel(post.author.representativeTrackName)}</span> : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="grid min-w-0 flex-1 gap-4">
                    <Link
                      to={`/lecture/${post.postId}`}
                      className="text-[22px] font-bold leading-[1.45] tracking-[-0.03em] text-[#0f172a] transition-colors hover:text-[var(--color-primary-hover)] md:text-[27px]"
                    >
                      {post.title}
                    </Link>

                    {post.tagNames.length ? (
                      <div className="flex flex-wrap gap-3">
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

                    <div className="flex flex-col gap-2 text-[11px] text-[#90a1b9] md:flex-row md:items-center md:gap-4">
                      <span>{formatPostDate(post.createdAt)} · 강의/수업 게시판</span>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
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

                  {post.thumbnailUrl ? (
                    <div className="overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-[#111827] md:ml-8 md:w-[200px]">
                      <img alt={`${post.title} 썸네일`} className="h-[120px] w-full object-cover" src={post.thumbnailUrl} />
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          : null}
      </div>
    </section>
  );
}
