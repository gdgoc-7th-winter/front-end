import { useQuery } from "@tanstack/react-query";
import { Bookmark, Eye, Ellipsis, MessageCircle, ThumbsUp } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getPostComments, getPostDetail } from "../api/posts";
import { UserTierIcon } from "../components/UserTierIcon";

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }

  return value.toLocaleString("ko-KR");
}

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

function formatCommentDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export function LectureDetailPage() {
  const { postId } = useParams();
  const numericPostId = Number(postId);
  const postDetailQuery = useQuery({
    queryKey: ["post-detail", numericPostId],
    queryFn: async () => {
      const response = await getPostDetail(numericPostId);
      return response.data;
    },
    enabled: Number.isInteger(numericPostId) && numericPostId > 0,
    staleTime: 1000 * 60,
  });
  const commentsQuery = useQuery({
    queryKey: ["post-comments", numericPostId],
    queryFn: async () => {
      const response = await getPostComments(numericPostId);
      return response.data.data;
    },
    enabled: Number.isInteger(numericPostId) && numericPostId > 0,
    staleTime: 1000 * 30,
  });

  const post = postDetailQuery.data;
  const comments = commentsQuery.data ?? [];
  const imageUrl =
    post?.thumbnailUrl ||
    post?.attachments.find((attachment) => attachment.contentType.startsWith("image/"))?.fileUrl ||
    null;

  return (
    <section className="flex w-full flex-col gap-6 pt-2">
      {postDetailQuery.isLoading ? (
        <div className="w-full rounded-[24px] border border-slate-100 bg-white px-6 py-16 text-center text-sm text-slate-400">
          게시글을 불러오는 중입니다...
        </div>
      ) : null}

      {postDetailQuery.isError ? (
        <div className="w-full rounded-[24px] border border-red-100 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
          {postDetailQuery.error instanceof Error ? postDetailQuery.error.message : "게시글을 불러오지 못했습니다."}
        </div>
      ) : null}

      {!postDetailQuery.isLoading && !postDetailQuery.isError && post ? (
        <>
          <article className="w-full overflow-hidden rounded-[32px] bg-white">
            <header className="border-b border-[#f8fafc] px-4 py-8 md:px-10 md:py-9">
              <p className="text-xs leading-4 text-[#90a1b9]">{formatPostDate(post.createdAt)} · 강의/수업 게시판</p>
              <h1 className="mt-4 text-[28px] font-extrabold leading-[1.32] tracking-[-0.03em] text-[#0f172b]">
                {post.title}
              </h1>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img alt="" className="size-10 rounded-full object-cover" src="/default_profile.png" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-[13px] font-bold leading-5 text-[#0f172a]">{post.authorNickname}</p>
                      <UserTierIcon tier="루비" className="h-[13px] w-3" />
                    </div>
                    <p className="text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">영어통번역학과 · 백엔드</p>
                  </div>
                </div>

                <button
                  className="grid size-10 place-items-center rounded-[12px] bg-white text-[#94a3b8] shadow-[0_2px_4px_rgba(135,188,245,0.15)]"
                  type="button"
                >
                  <Ellipsis size={16} strokeWidth={2.4} />
                </button>
              </div>
            </header>

            <div className="px-4 py-10 md:px-10 md:py-10">
              <div className="mx-auto">
                <div
                  className="prose prose-slate max-w-none text-[16px] leading-[1.82] text-[#1e293b] prose-headings:mt-10 prose-headings:mb-3 prose-headings:text-[19px] prose-headings:font-bold prose-headings:leading-7 prose-headings:text-[#0f172a] prose-p:my-0 prose-p:leading-[1.82] prose-pre:my-8 prose-pre:overflow-x-auto prose-pre:rounded-[16px] prose-pre:bg-[#0f172b] prose-pre:px-6 prose-pre:py-6 prose-pre:text-[#def1fc] prose-code:text-inherit prose-img:my-8 prose-img:w-full prose-img:rounded-[16px] prose-img:border prose-img:border-[#f1f5f9]"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {!post.content.trim() && imageUrl ? (
                  <div className="overflow-hidden rounded-[16px] border border-[#f1f5f9]">
                    <img alt={post.title} className="h-[220px] w-full object-cover md:h-[400px]" src={imageUrl} />
                  </div>
                ) : null}

                {post.tagNames.length ? (
                  <div className="mt-8 flex flex-wrap gap-4">
                    {post.tagNames.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[8px] bg-[#fefeff] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <footer className="flex flex-col gap-5 border-t border-[#f1f5f9] bg-[rgba(248,250,252,0.5)] px-4 py-8 md:flex-row md:items-center md:justify-between md:px-9">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[var(--color-primary-main)] px-6 py-3 text-sm font-extrabold text-white"
                  type="button"
                >
                  <ThumbsUp size={14} strokeWidth={2.1} />
                  <span>추천 {post.likeCount}</span>
                </button>
                <button className="inline-flex items-center gap-2 px-1 py-3 text-sm font-bold text-[#475569]" type="button">
                  <Bookmark size={14} strokeWidth={2} />
                  <span>스크랩</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#94a3b8]">
                <span className="inline-flex items-center gap-1">
                  <Eye size={14} strokeWidth={2} />
                  {formatCount(post.viewCount)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={14} strokeWidth={2} />
                  {formatCount(post.commentCount)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Bookmark size={14} strokeWidth={2} />
                  {formatCount(post.scrapCount ?? 0)}
                </span>
                <Link className="inline-flex items-center gap-1 text-[#94a3b8] hover:text-[#64748b]" to="/lecture">
                  <span>목록가기</span>
                </Link>
              </div>
            </footer>
          </article>

          <section className="w-full rounded-[24px] bg-white px-4 py-8 md:px-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#0f172a]">댓글 {post.commentCount}</h2>
              <div className="flex items-center gap-4 text-[11px] font-medium text-[#94a3b8]">
                <button type="button">최신순</button>
                <button type="button">추천순</button>
              </div>
            </div>

            <div className="mt-5 rounded-[12px] bg-[#f8fbff] px-4 py-4">
              <textarea
                className="h-24 w-full resize-none bg-transparent text-sm text-[#475569] outline-none placeholder:text-[#c1cad8]"
                placeholder="따뜻한 댓글을 남겨주세요 :)"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[#c1cad8]">0 / 1000</span>
                <button
                  className="rounded-[8px] bg-[var(--color-primary-main)] px-4 py-2 text-sm font-semibold text-white"
                  type="button"
                >
                  등록
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-8">
              {commentsQuery.isLoading ? <p className="text-sm text-[#94a3b8]">댓글을 불러오는 중입니다...</p> : null}
              {commentsQuery.isError ? (
                <p className="text-sm text-red-600">
                  {commentsQuery.error instanceof Error ? commentsQuery.error.message : "댓글을 불러오지 못했습니다."}
                </p>
              ) : null}
              {comments.map((comment) => (
                <div key={comment.commentId} className={comment.parentCommentId ? "ml-4 md:ml-[56px]" : ""}>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <img alt="" className="size-10 rounded-full object-cover" src={comment.profilePicture || "/default_profile.png"} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1">
                          <p className="text-[13px] font-bold leading-5 text-[#0f172a]">{comment.authorNickname}</p>
                          <UserTierIcon tier="루비" className="h-[13px] w-3" />
                          {comment.isAuthor ? (
                            <span className="rounded-[4px] px-1.5 py-0.5 text-[8px] font-bold tracking-[-0.04em] text-[var(--color-primary-main)]">
                              작성자
                            </span>
                          ) : null}
                          <span className="pl-2 text-[9px] text-[#94a3b8]">{formatCommentDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">
                          {[comment.department, comment.track].filter(Boolean).join(" · ") || "프로필 정보 없음"}
                        </p>
                      </div>
                    </div>

                    <p className="text-[13px] leading-[1.75] text-[#475569]">{comment.content}</p>

                    <div className="flex items-center gap-4 text-xs">
                      <button className="inline-flex items-center gap-1 font-bold text-[var(--color-primary-active)]" type="button">
                        <ThumbsUp size={12} strokeWidth={2} />
                        {comment.likeCount ?? 0}
                      </button>
                      <button className="font-bold text-[#94a3b8]" type="button">
                        답글 쓰기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
