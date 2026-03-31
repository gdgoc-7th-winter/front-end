import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Eye, Ellipsis, MessageCircle, PencilLine, Star, ThumbsUp, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createPostComment,
  deletePostComment,
  deletePromotion,
  flattenPostComments,
  getPostComments,
  getPromotionDetail,
  increasePostView,
  likePost,
  likePostComment,
  scrapPost,
  unlikePost,
  unlikePostComment,
  unscrapPost,
  type PromotionCategory,
} from "../../api/posts";
import { UserTierIcon } from "../../components/UserTierIcon";
import { useOptionalCurrentUser } from "../../hooks/useOptionalCurrentUser";

const CATEGORY_LABELS: Record<PromotionCategory, string> = {
  CLUB: "동아리",
  EVENT: "행사",
  PROJECT: "프로젝트",
  CONTEST: "대회",
  ETC: "기타",
};

function formatCount(value?: number | null) {
  const normalizedValue = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return normalizedValue >= 1000
    ? `${(normalizedValue / 1000).toFixed(normalizedValue >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`
    : normalizedValue.toLocaleString("ko-KR");
}

function formatPostDate(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" }).format(parsedDate).replace(/\.\s/g, ".").replace(/\.$/, "");
}

function formatCommentDate(value: string) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(parsedDate);
}

function toSafeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function toSafeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
  }

  return [];
}

type NormalizedPromotionDetail = {
  category: PromotionCategory;
  postId: number;
  title: string;
  content: string;
  createdAt: string;
  authorId?: number;
  authorNickname: string;
  author?: {
    nickname: string;
    profileImageUrl: string;
    departmentName: string;
    representativeTrackName: string;
    tierBadgeImageUrl: string;
  };
  likeCount: number;
  commentCount: number;
  scrapCount: number;
  viewCount: number;
  liked: boolean;
  scrapped: boolean;
  isAuthor: boolean;
  tagNames: string[];
};

function normalizePromotionDetail(value: unknown): NormalizedPromotionDetail | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const detail = value as Record<string, unknown>;
  const nestedPost = detail["post"];
  const post = nestedPost && typeof nestedPost === "object" ? (nestedPost as Record<string, unknown>) : detail;
  const authorValue = post["author"];
  const author = authorValue && typeof authorValue === "object" ? (authorValue as Record<string, unknown>) : null;
  const viewerValue = post["viewer"] ?? detail["viewer"];
  const viewer = viewerValue && typeof viewerValue === "object" ? (viewerValue as Record<string, unknown>) : null;
  const category = detail["category"];

  if (!Object.prototype.hasOwnProperty.call(post, "postId")) {
    return null;
  }

  return {
    category: category === "CLUB" || category === "EVENT" || category === "PROJECT" || category === "CONTEST" ? category : "ETC",
    postId: toSafeNumber(post["postId"], 0),
    title: toSafeString(post["title"], "제목 없음"),
    content: toSafeString(post["content"]),
    createdAt: toSafeString(post["createdAt"]),
    authorId: typeof post["authorId"] === "number" ? post["authorId"] : typeof author?.["authorId"] === "number" ? (author["authorId"] as number) : undefined,
    authorNickname: toSafeString(post["authorNickname"]) || toSafeString(author?.["nickname"], "익명"),
    author: author
      ? {
          nickname: toSafeString(author["nickname"], "익명"),
          profileImageUrl: toSafeString(author["profileImageUrl"]) || "/default_profile.png",
          departmentName: toSafeString(author["departmentName"]),
          representativeTrackName: toSafeString(author["representativeTrackName"]),
          tierBadgeImageUrl: toSafeString(author["tierBadgeImageUrl"]),
        }
      : undefined,
    likeCount: toSafeNumber(post["likeCount"]),
    commentCount: toSafeNumber(post["commentCount"]),
    scrapCount: toSafeNumber(post["scrapCount"]),
    viewCount: toSafeNumber(post["viewCount"]),
    liked: Boolean(viewer?.["liked"] ?? post["liked"] ?? post["isLiked"]),
    scrapped: Boolean(viewer?.["scrapped"] ?? post["scrapped"] ?? post["isScrapped"]),
    isAuthor: Boolean(viewer?.["isAuthor"]),
    tagNames: normalizeTags(post["tagNames"] ?? post["tags"] ?? detail["tagNames"] ?? detail["tags"]),
  };
}

export function PromotionsDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserQuery = useOptionalCurrentUser();
  const { postId } = useParams();
  const numericPostId = Number(postId);
  const canLoad = Number.isInteger(numericPostId) && numericPostId > 0;
  const [commentInput, setCommentInput] = useState("");
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [commentLikeOverrides, setCommentLikeOverrides] = useState<Record<number, { liked: boolean; count: number }>>({});
  const [reactionOverride, setReactionOverride] = useState<{ liked?: boolean; likeCount?: number; scrapped?: boolean; scrapCount?: number } | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const viewTrackedPostIdRef = useRef<number | null>(null);

  const postDetailQuery = useQuery({
    queryKey: ["promotion-detail", numericPostId],
    queryFn: async () => (await getPromotionDetail(numericPostId)).data,
    enabled: canLoad,
    staleTime: 1000 * 60,
  });

  const commentsQuery = useQuery({
    queryKey: ["post-comments", numericPostId],
    queryFn: async () => flattenPostComments((await getPostComments(numericPostId)).data.data),
    enabled: canLoad,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!canLoad || viewTrackedPostIdRef.current === numericPostId) return;
    viewTrackedPostIdRef.current = numericPostId;
    void increasePostView(numericPostId).catch(() => undefined);
  }, [canLoad, numericPostId]);

  useEffect(() => {
    if (!isActionMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!actionMenuRef.current?.contains(event.target as Node)) setIsActionMenuOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsActionMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isActionMenuOpen]);

  const invalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["promotion-detail", numericPostId] }),
      queryClient.invalidateQueries({ queryKey: ["post-comments", numericPostId] }),
      queryClient.invalidateQueries({ queryKey: ["promotions"] }),
    ]);
  };

  const createCommentMutation = useMutation({
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: number }) =>
      createPostComment(numericPostId, { content, parentCommentId }),
    onSuccess: async (_, variables) => {
      if (variables.parentCommentId) {
        setReplyInputs((previous) => ({ ...previous, [variables.parentCommentId!]: "" }));
        setActiveReplyCommentId(null);
      } else {
        setCommentInput("");
      }
      setSubmitError(null);
      await invalidateQueries();
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "댓글 작성에 실패했습니다."),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deletePostComment(numericPostId, commentId),
    onSuccess: async () => {
      setSubmitError(null);
      await invalidateQueries();
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다."),
  });

  const deletePromotionMutation = useMutation({
    mutationFn: () => deletePromotion(numericPostId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["promotions"] });
      navigate("/promotions", { replace: true });
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "홍보글 삭제에 실패했습니다."),
  });

  const toggleCommentLikeMutation = useMutation({
    mutationFn: async ({ commentId, liked }: { commentId: number; liked: boolean }) => ({
      commentId,
      ...(liked ? await unlikePostComment(numericPostId, commentId) : await likePostComment(numericPostId, commentId)).data,
    }),
    onSuccess: ({ commentId, liked, count }) => {
      setCommentLikeOverrides((previous) => ({ ...previous, [commentId]: { liked, count } }));
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "댓글 좋아요 처리에 실패했습니다."),
  });

  const togglePostLikeMutation = useMutation({
    mutationFn: async (liked: boolean) => {
      if (liked) {
        await unlikePost(numericPostId);
        return false;
      }
      await likePost(numericPostId);
      return true;
    },
    onSuccess: async (nextLiked) => {
      const post = normalizePromotionDetail(postDetailQuery.data);
      const previousLiked = reactionOverride?.liked ?? post?.liked ?? false;
      const previousCount = reactionOverride?.likeCount ?? post?.likeCount ?? 0;
      setReactionOverride((previous) => ({
        ...previous,
        liked: nextLiked,
        likeCount: Math.max(0, previousCount + (nextLiked === previousLiked ? 0 : nextLiked ? 1 : -1)),
      }));
      await invalidateQueries();
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "게시글 추천 처리에 실패했습니다."),
  });

  const togglePostScrapMutation = useMutation({
    mutationFn: async (scrapped: boolean) => {
      if (scrapped) {
        await unscrapPost(numericPostId);
        return false;
      }
      await scrapPost(numericPostId);
      return true;
    },
    onSuccess: async (nextScrapped) => {
      const post = normalizePromotionDetail(postDetailQuery.data);
      const previousScrapped = reactionOverride?.scrapped ?? post?.scrapped ?? false;
      const previousCount = reactionOverride?.scrapCount ?? post?.scrapCount ?? 0;
      setReactionOverride((previous) => ({
        ...previous,
        scrapped: nextScrapped,
        scrapCount: Math.max(0, previousCount + (nextScrapped === previousScrapped ? 0 : nextScrapped ? 1 : -1)),
      }));
      await invalidateQueries();
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "게시글 스크랩 처리에 실패했습니다."),
  });

  const post = normalizePromotionDetail(postDetailQuery.data);
  const comments = commentsQuery.data ?? [];
  const tags = post?.tagNames ?? [];
  const isPostLiked = reactionOverride?.liked ?? post?.liked ?? false;
  const isPostScrapped = reactionOverride?.scrapped ?? post?.scrapped ?? false;
  const postLikeCount = reactionOverride?.likeCount ?? post?.likeCount ?? 0;
  const postScrapCount = reactionOverride?.scrapCount ?? post?.scrapCount ?? 0;
  const authorName = post?.author?.nickname || post?.authorNickname || "익명";
  const canManagePost = Boolean(post?.isAuthor) || currentUserQuery.data?.nickname === authorName;

  const handleCommentSubmit = async ({ content, parentCommentId }: { content: string; parentCommentId?: number }) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setSubmitError(parentCommentId ? "답글 내용을 입력해주세요." : "댓글 내용을 입력해주세요.");
      return;
    }
    if (!currentUserQuery.data) {
      navigate("/login");
      return;
    }
    await createCommentMutation.mutateAsync({ content: trimmedContent, parentCommentId });
  };

  return (
    <section className="flex w-full flex-col gap-6 pt-2">
      {postDetailQuery.isLoading ? <div className="w-full rounded-[24px] border border-slate-100 bg-white px-6 py-16 text-center text-sm text-slate-400">게시글을 불러오는 중입니다...</div> : null}
      {postDetailQuery.isError ? <div className="w-full rounded-[24px] border border-red-100 bg-red-50 px-6 py-16 text-center text-sm text-red-600">{postDetailQuery.error instanceof Error ? postDetailQuery.error.message : "게시글을 불러오지 못했습니다."}</div> : null}

      {!postDetailQuery.isLoading && !postDetailQuery.isError && post ? (
        <>
          <article className="w-full overflow-hidden rounded-[32px] bg-white">
            <header className="border-b border-[#f8fafc] px-4 py-8 md:px-10 md:py-9">
              <p className="text-xs leading-4 text-[#90a1b9]">{formatPostDate(post.createdAt)} · 동아리/행사/홍보 게시판</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-[#475569]">
                <span className="inline-flex items-center gap-2"><Star size={12} className="fill-current text-[#475569]" />{CATEGORY_LABELS[post.category]}</span>
              </div>
              <h1 className="mt-4 text-[28px] font-extrabold leading-[1.32] tracking-[-0.03em] text-[#0f172b]">{post.title}</h1>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img alt="" className="size-10 rounded-full object-cover" src={post.author?.profileImageUrl || "/default_profile.png"} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-[13px] font-bold leading-5 text-[#0f172a]">{authorName}</p>
                      {post.author?.tierBadgeImageUrl ? <img alt="" className="h-[13px] w-3 object-contain" src={post.author.tierBadgeImageUrl} /> : <UserTierIcon tier="루비" className="h-[13px] w-3" />}
                    </div>
                    <p className="text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">{[post.author?.departmentName, post.author?.representativeTrackName].filter(Boolean).join(" · ") || "프로필 정보 없음"}</p>
                  </div>
                </div>

                {canManagePost ? (
                  <div className="relative" ref={actionMenuRef}>
                    <button aria-expanded={isActionMenuOpen} aria-haspopup="menu" className="grid size-10 place-items-center rounded-[12px] bg-white text-[#94a3b8] shadow-[0_2px_4px_rgba(135,188,245,0.15)] transition-colors hover:text-[#64748b]" type="button" onClick={() => setIsActionMenuOpen((previous) => !previous)}>
                      <Ellipsis size={16} strokeWidth={2.4} />
                    </button>
                    {isActionMenuOpen ? (
                      <div className="absolute right-0 top-12 z-10 w-[220px] rounded-[28px] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                        <button className="flex w-full items-center gap-4 rounded-[20px] px-5 py-5 text-left text-[15px] font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]" type="button" onClick={() => navigate(`/promotions/${numericPostId}/modify`)}>
                          <PencilLine size={22} strokeWidth={2.2} />
                          <span>수정하기</span>
                        </button>
                        <button className="mt-2 flex w-full items-center gap-4 rounded-[20px] px-5 py-5 text-left text-[15px] font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50" disabled={deletePromotionMutation.isPending} type="button" onClick={async () => deletePromotionMutation.mutateAsync()}>
                          <Trash2 size={22} strokeWidth={2.2} />
                          <span>{deletePromotionMutation.isPending ? "삭제 중..." : "삭제하기"}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </header>

            <div className="px-4 py-10 md:px-10 md:py-10">
              <div className="prose prose-slate max-w-none text-[16px] leading-[1.82] text-[#1e293b] prose-headings:mt-10 prose-headings:mb-3 prose-headings:text-[19px] prose-headings:font-bold prose-headings:leading-7 prose-headings:text-[#0f172a] prose-p:my-0 prose-p:leading-[1.82] prose-pre:my-8 prose-pre:overflow-x-auto prose-pre:rounded-[16px] prose-pre:bg-[#0f172b] prose-pre:px-6 prose-pre:py-6 prose-pre:text-[#def1fc] prose-code:text-inherit prose-img:my-8 prose-img:w-full prose-img:rounded-[16px] prose-img:border prose-img:border-[#f1f5f9]" dangerouslySetInnerHTML={{ __html: post.content }} />
              {tags.length ? <div className="mt-8 flex flex-wrap gap-4">{tags.map((tag) => <span key={tag} className="rounded-[8px] bg-[#fefeff] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]">{tag}</span>)}</div> : null}
            </div>

            <footer className="flex flex-col gap-5 border-t border-[#f1f5f9] bg-[rgba(248,250,252,0.5)] px-4 py-8 md:flex-row md:items-center md:justify-between md:px-9">
              <div className="flex flex-wrap items-center gap-4">
                <button className={`inline-flex items-center gap-2 rounded-[8px] px-6 py-3 text-sm font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isPostLiked ? "bg-[var(--color-primary-main)] text-white" : "border border-[#dbe7f5] bg-white text-[#475569]"}`} disabled={togglePostLikeMutation.isPending} type="button" onClick={async () => { if (!currentUserQuery.data) return navigate("/login"); await togglePostLikeMutation.mutateAsync(isPostLiked); }}>
                  <ThumbsUp className={isPostLiked ? "fill-current" : undefined} size={14} strokeWidth={2.1} />
                  <span>추천 {postLikeCount}</span>
                </button>
                <button className={`inline-flex items-center gap-2 rounded-[8px] px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isPostScrapped ? "bg-[#eff6ff] text-[var(--color-primary-main)]" : "text-[#475569]"}`} disabled={togglePostScrapMutation.isPending} type="button" onClick={async () => { if (!currentUserQuery.data) return navigate("/login"); await togglePostScrapMutation.mutateAsync(isPostScrapped); }}>
                  <Bookmark className={isPostScrapped ? "fill-current" : undefined} size={14} strokeWidth={2} />
                  <span>{isPostScrapped ? "스크랩됨" : "스크랩"}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[#94a3b8]">
                <span className="inline-flex items-center gap-1"><Eye size={14} strokeWidth={2} />{formatCount(post.viewCount)}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle size={14} strokeWidth={2} />{formatCount(post.commentCount)}</span>
                <span className="inline-flex items-center gap-1"><Bookmark size={14} strokeWidth={2} />{formatCount(postScrapCount)}</span>
                <Link className="inline-flex items-center gap-1 text-[#94a3b8] hover:text-[#64748b]" to="/promotions"><span>목록가기</span></Link>
              </div>
            </footer>
          </article>

          <section className="w-full rounded-[24px] bg-white px-4 py-8 md:px-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#0f172a]">댓글 {post.commentCount}</h2>
              <div className="flex items-center gap-4 text-[11px] font-medium text-[#94a3b8]"><button type="button">최신순</button><button type="button">추천순</button></div>
            </div>

            <div className="mt-5 rounded-[12px] bg-[#f8fbff] px-4 py-4">
              <textarea className="h-24 w-full resize-none bg-transparent text-sm text-[#475569] outline-none placeholder:text-[#c1cad8]" placeholder="따뜻한 댓글은 작성자에게 큰 힘이 됩니다." value={commentInput} onChange={(event) => setCommentInput(event.target.value.slice(0, 1000))} />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[#c1cad8]">{commentInput.length} / 1000</span>
                <button className="rounded-[8px] bg-[var(--color-primary-main)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={createCommentMutation.isPending} type="button" onClick={() => handleCommentSubmit({ content: commentInput })}>
                  {createCommentMutation.isPending ? "등록 중..." : "등록"}
                </button>
              </div>
            </div>
            {submitError ? <p className="mt-2 text-xs text-red-600">{submitError}</p> : null}

            <div className="mt-8 grid gap-8">
              {commentsQuery.isLoading ? <p className="text-sm text-[#94a3b8]">댓글을 불러오는 중입니다...</p> : null}
              {commentsQuery.isError ? <p className="text-sm text-red-600">{commentsQuery.error instanceof Error ? commentsQuery.error.message : "댓글을 불러오지 못했습니다."}</p> : null}
              {comments.map((comment) => {
                const isDeletedComment = comment.isDeleted;
                const canDeleteComment = !isDeletedComment && Boolean(comment.viewer?.isAuthor);
                const commentLikeOverride = commentLikeOverrides[comment.commentId];
                const isCommentLiked = commentLikeOverride?.liked ?? comment.viewer?.liked ?? comment.liked ?? false;
                const commentLikeCount = commentLikeOverride?.count ?? comment.likeCount ?? 0;
                const isTogglingCurrentComment = toggleCommentLikeMutation.isPending && toggleCommentLikeMutation.variables?.commentId === comment.commentId;

                return (
                  <div key={comment.commentId} className={comment.parentCommentId ? "ml-4 md:ml-[56px]" : ""}>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3">
                        <img alt="" className="size-10 rounded-full object-cover" src={comment.profilePicture || "/default_profile.png"} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1">
                            <p className="text-[13px] font-bold leading-5 text-[#0f172a]">{comment.authorNickname || comment.userNickname || "익명"}</p>
                            {comment.userId === post.authorId ? <span className="rounded-[4px] px-1.5 py-0.5 text-[8px] font-bold tracking-[-0.04em] text-[var(--color-primary-main)]">작성자</span> : null}
                            <span className="pl-2 text-[9px] text-[#94a3b8]">{formatCommentDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">{[comment.department, comment.track].filter(Boolean).join(" · ") || "프로필 정보 없음"}</p>
                        </div>
                      </div>

                      <p className={`text-[13px] leading-[1.75] ${isDeletedComment ? "italic text-[#94a3b8]" : "text-[#475569]"}`}>{isDeletedComment ? "삭제된 댓글입니다." : comment.content}</p>

                      {!isDeletedComment ? (
                        <div className="flex items-center gap-4 text-xs">
                          <button className={`inline-flex items-center gap-1 font-bold transition-colors ${isCommentLiked ? "text-[var(--color-primary-main)]" : "text-[#94a3b8]"}`} disabled={isTogglingCurrentComment} type="button" onClick={async () => { if (!currentUserQuery.data) return navigate("/login"); await toggleCommentLikeMutation.mutateAsync({ commentId: comment.commentId, liked: isCommentLiked }); }}>
                            <ThumbsUp className={isCommentLiked ? "fill-current" : undefined} size={12} strokeWidth={2} />
                            <span>좋아요 {commentLikeCount}</span>
                          </button>
                          <button className={`font-bold transition-colors ${activeReplyCommentId === comment.commentId ? "text-[var(--color-primary-main)]" : "text-[#94a3b8]"}`} type="button" onClick={() => setActiveReplyCommentId((previous) => previous === comment.commentId ? null : comment.commentId)}>
                            {activeReplyCommentId === comment.commentId ? "답글 닫기" : "답글 쓰기"}
                          </button>
                          {canDeleteComment ? <button className="font-bold text-[#94a3b8]" disabled={deleteCommentMutation.isPending} type="button" onClick={async () => { if (!currentUserQuery.data) return navigate("/login"); await deleteCommentMutation.mutateAsync(comment.commentId); }}>삭제</button> : null}
                        </div>
                      ) : null}

                      {!isDeletedComment && activeReplyCommentId === comment.commentId ? (
                        <div className="rounded-[12px] bg-[#f8fbff] px-4 py-4">
                          <textarea className="h-24 w-full resize-none bg-transparent text-sm text-[#475569] outline-none placeholder:text-[#c1cad8]" placeholder="답글을 남겨주세요 :)" value={replyInputs[comment.commentId] ?? ""} onChange={(event) => setReplyInputs((previous) => ({ ...previous, [comment.commentId]: event.target.value.slice(0, 1000) }))} />
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-[#c1cad8]">{(replyInputs[comment.commentId] ?? "").length} / 1000</span>
                            <div className="flex items-center gap-2">
                              <button className="rounded-[8px] px-3 py-2 text-sm font-semibold text-[#94a3b8]" type="button" onClick={() => setActiveReplyCommentId(null)}>취소</button>
                              <button className="rounded-[8px] bg-[var(--color-primary-main)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={createCommentMutation.isPending} type="button" onClick={() => handleCommentSubmit({ content: replyInputs[comment.commentId] ?? "", parentCommentId: comment.commentId })}>
                                {createCommentMutation.isPending ? "등록 중..." : "답글 등록"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
