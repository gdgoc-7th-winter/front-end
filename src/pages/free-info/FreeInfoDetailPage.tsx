import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Ellipsis, Eye, MessageCircle, PencilLine, ThumbsUp, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createPostComment,
  deletePost,
  deletePostComment,
  flattenPostComments,
  getDisplayAuthorName,
  getPostComments,
  getPostDetail,
  increasePostView,
  likePost,
  likePostComment,
  scrapPost,
  unlikePost,
  unlikePostComment,
  unscrapPost,
} from "../../api/posts";
import type { CurrentUserResponse } from "../../api/profile";
import { UserTierIcon } from "../../components/UserTierIcon";
import { useOptionalCurrentUser } from "../../hooks/useOptionalCurrentUser";

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

type ComparableAuthorProfile = {
  nickname?: string;
  profileImageUrl?: string;
  departmentName?: string;
  trackName?: string;
};

function normalizeComparableValue(value?: string | number | null) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalizedValue = String(value).trim().toLowerCase();
  return normalizedValue || undefined;
}

function normalizeAuthorProfile(author?: {
  nickname?: string;
  profileImageUrl?: string | null;
  departmentName?: string | null;
  representativeTrackName?: string | null;
}) {
  return {
    nickname: normalizeComparableValue(author?.nickname),
    profileImageUrl: normalizeComparableValue(author?.profileImageUrl),
    departmentName: normalizeComparableValue(author?.departmentName),
    trackName: normalizeComparableValue(author?.representativeTrackName),
  } satisfies ComparableAuthorProfile;
}

function normalizeCurrentUserProfile(profile?: CurrentUserResponse | null) {
  return {
    nickname: normalizeComparableValue(profile?.nickname),
    profileImageUrl: normalizeComparableValue(profile?.profileImgUrl || profile?.profileImage || profile?.profilePicture),
    departmentName: normalizeComparableValue(profile?.departmentName),
    trackName: normalizeComparableValue(profile?.tracks?.[0]),
  } satisfies ComparableAuthorProfile;
}

function isSubsetProfileMatch(source: ComparableAuthorProfile, target: ComparableAuthorProfile) {
  const comparableEntries = Object.entries(source).filter(([, value]) => value !== undefined);

  if (!comparableEntries.length) {
    return false;
  }

  return comparableEntries.every(([key, value]) => target[key as keyof ComparableAuthorProfile] === value);
}

function isSameAuthorProfile(authorProfile: ComparableAuthorProfile, currentUserProfile: ComparableAuthorProfile) {
  return isSubsetProfileMatch(authorProfile, currentUserProfile) || isSubsetProfileMatch(currentUserProfile, authorProfile);
}

export function FreeInfoDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserQuery = useOptionalCurrentUser();
  const { postId } = useParams();
  const numericPostId = Number(postId);
  const isAuthenticated = Boolean(currentUserQuery.data);
  const canRequestPostDetail = Number.isInteger(numericPostId) && numericPostId > 0 && isAuthenticated;
  const [commentInput, setCommentInput] = useState("");
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [commentLikeState, setCommentLikeState] = useState<{
    postId: number | null;
    values: Record<number, { liked: boolean; count: number }>;
  }>({
    postId: null,
    values: {},
  });
  const [postReactionOverride, setPostReactionOverride] = useState<{
    postId: number | null;
    liked?: boolean;
    likeCount?: number;
    scrapped?: boolean;
    scrapCount?: number;
  } | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const viewTrackedPostIdRef = useRef<number | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const postDetailQuery = useQuery({
    queryKey: ["post-detail", numericPostId],
    queryFn: async () => {
      const response = await getPostDetail(numericPostId);
      return response.data;
    },
    enabled: canRequestPostDetail,
    staleTime: 1000 * 60,
  });

  const commentsQuery = useQuery({
    queryKey: ["post-comments", numericPostId],
    queryFn: async () => {
      const response = await getPostComments(numericPostId);
      return flattenPostComments(response.data.comments);
    },
    enabled: canRequestPostDetail,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (currentUserQuery.isLoading || currentUserQuery.isError) {
      return;
    }

    if (currentUserQuery.data === null) {
      navigate("/login", { replace: true });
    }
  }, [currentUserQuery.data, currentUserQuery.isError, currentUserQuery.isLoading, navigate]);

  useEffect(() => {
    if (!canRequestPostDetail) {
      return;
    }

    if (viewTrackedPostIdRef.current === numericPostId) {
      return;
    }

    viewTrackedPostIdRef.current = numericPostId;
    void increasePostView(numericPostId).catch(() => undefined);
  }, [canRequestPostDetail, numericPostId]);

  useEffect(() => {
    if (!isActionMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionMenuRef.current?.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isActionMenuOpen]);

  const invalidatePostQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["post-detail", numericPostId] }),
      queryClient.invalidateQueries({ queryKey: ["post-comments", numericPostId] }),
      queryClient.invalidateQueries({ queryKey: ["board-posts", "free-info"] }),
    ]);
  };

  const createCommentMutation = useMutation({
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: number }) =>
      createPostComment(numericPostId, {
        content,
        parentCommentId,
      }),
    onSuccess: async (_, variables) => {
      if (variables.parentCommentId) {
        setReplyInputs((previous) => ({
          ...previous,
          [variables.parentCommentId!]: "",
        }));
        setActiveReplyCommentId(null);
      } else {
        setCommentInput("");
      }

      setSubmitError(null);
      await invalidatePostQueries();
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "댓글 작성에 실패했습니다.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deletePostComment(numericPostId, commentId),
    onSuccess: async () => {
      setSubmitError(null);
      await invalidatePostQueries();
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.");
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(numericPostId),
    onSuccess: async () => {
      setIsActionMenuOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["board-posts", "free-info"] });
      navigate("/free-info", { replace: true });
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.");
    },
  });

  const toggleCommentLikeMutation = useMutation({
    mutationFn: async ({ commentId, liked }: { commentId: number; liked: boolean }) => {
      const response = liked ? await unlikePostComment(numericPostId, commentId) : await likePostComment(numericPostId, commentId);
      return {
        commentId,
        ...response.data,
      };
    },
    onSuccess: ({ commentId, liked, count }) => {
      setCommentLikeState((previous) => ({
        postId: numericPostId,
        values: {
          ...(previous.postId === numericPostId ? previous.values : {}),
          [commentId]: { liked, count },
        },
      }));
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "댓글 좋아요 처리에 실패했습니다.");
    },
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
      const basePost = queryClient.getQueryData<NonNullable<typeof postDetailQuery.data>>(["post-detail", numericPostId]) ?? postDetailQuery.data;
      const activeReactionOverride = postReactionOverride?.postId === numericPostId ? postReactionOverride : null;
      const previousLiked = activeReactionOverride?.liked ?? basePost?.viewer?.liked ?? basePost?.liked ?? basePost?.isLiked ?? false;
      const previousCount = activeReactionOverride?.likeCount ?? basePost?.likeCount ?? 0;
      const nextCount = Math.max(0, previousCount + (nextLiked === previousLiked ? 0 : nextLiked ? 1 : -1));

      setPostReactionOverride((previous) => ({
        ...(previous?.postId === numericPostId ? previous : {}),
        postId: numericPostId,
        liked: nextLiked,
        likeCount: nextCount,
      }));
      setSubmitError(null);
      await invalidatePostQueries();
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "게시글 추천 처리에 실패했습니다.");
    },
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
      const basePost = queryClient.getQueryData<NonNullable<typeof postDetailQuery.data>>(["post-detail", numericPostId]) ?? postDetailQuery.data;
      const activeReactionOverride = postReactionOverride?.postId === numericPostId ? postReactionOverride : null;
      const previousScrapped =
        activeReactionOverride?.scrapped ?? basePost?.viewer?.scrapped ?? basePost?.scrapped ?? basePost?.isScrapped ?? false;
      const previousCount = activeReactionOverride?.scrapCount ?? basePost?.scrapCount ?? 0;
      const nextCount = Math.max(0, previousCount + (nextScrapped === previousScrapped ? 0 : nextScrapped ? 1 : -1));

      setPostReactionOverride((previous) => ({
        ...(previous?.postId === numericPostId ? previous : {}),
        postId: numericPostId,
        scrapped: nextScrapped,
        scrapCount: nextCount,
      }));
      setSubmitError(null);
      await invalidatePostQueries();
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "게시글 스크랩 처리에 실패했습니다.");
    },
  });

  const post = postDetailQuery.data;
  const commentLikeOverrides = commentLikeState.postId === numericPostId ? commentLikeState.values : {};
  const activePostReactionOverride = postReactionOverride?.postId === numericPostId ? postReactionOverride : null;
  const comments = commentsQuery.data ?? [];
  const imageUrl =
    post?.thumbnailUrl ||
    post?.attachments.find((attachment) => attachment.contentType.startsWith("image/"))?.fileUrl ||
    null;
  const authorName = getDisplayAuthorName(post?.author?.nickname, post?.authorNickname);
  const authorProfileImageUrl = post?.author?.profileImageUrl || "/default_profile.png";
  const authorDepartmentText =
    [post?.author?.departmentName, post?.author?.representativeTrackName].filter(Boolean).join(" · ") || "프로필 정보 없음";
  const authorTierBadgeImageUrl = post?.author?.tierBadgeImageUrl || null;
  const comparableAuthorProfile = normalizeAuthorProfile(post?.author);
  const comparableCurrentUserProfile = normalizeCurrentUserProfile(currentUserQuery.data);
  const canManagePost = Boolean(post?.viewer?.isAuthor) || isSameAuthorProfile(comparableAuthorProfile, comparableCurrentUserProfile);
  const isPostLiked = activePostReactionOverride?.liked ?? post?.viewer?.liked ?? post?.liked ?? post?.isLiked ?? false;
  const isPostScrapped = activePostReactionOverride?.scrapped ?? post?.viewer?.scrapped ?? post?.scrapped ?? post?.isScrapped ?? false;
  const postLikeCount = activePostReactionOverride?.likeCount ?? post?.likeCount ?? 0;
  const postScrapCount = activePostReactionOverride?.scrapCount ?? post?.scrapCount ?? 0;

  const handleCommentSubmit = async ({ content, parentCommentId }: { content: string; parentCommentId?: number }) => {
    const trimmedComment = content.trim();

    if (!trimmedComment) {
      setSubmitError(parentCommentId ? "답글 내용을 입력해주세요." : "댓글 내용을 입력해주세요.");
      return;
    }

    if (!currentUserQuery.data) {
      navigate("/login");
      return;
    }

    await createCommentMutation.mutateAsync({
      content: trimmedComment,
      parentCommentId,
    });
  };

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
              <p className="text-xs leading-4 text-[#90a1b9]">{formatPostDate(post.createdAt)} · 자유/정보 게시판</p>
              <h1 className="mt-4 text-[28px] font-extrabold leading-[1.32] tracking-[-0.03em] text-[#0f172b]">
                {post.title}
              </h1>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img alt="" className="size-10 rounded-full object-cover" src={authorProfileImageUrl} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-[13px] font-bold leading-5 text-[#0f172a]">{authorName}</p>
                      {authorTierBadgeImageUrl ? (
                        <img alt="" className="h-[13px] w-3 object-contain" src={authorTierBadgeImageUrl} />
                      ) : (
                        <UserTierIcon tier="루비" className="h-[13px] w-3" />
                      )}
                    </div>
                    <p className="text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">{authorDepartmentText}</p>
                  </div>
                </div>

                {canManagePost ? (
                  <div className="relative" ref={actionMenuRef}>
                    <button
                      aria-expanded={isActionMenuOpen}
                      aria-haspopup="menu"
                      className="grid size-10 place-items-center rounded-[12px] bg-white text-[#94a3b8] shadow-[0_2px_4px_rgba(135,188,245,0.15)] transition-colors hover:text-[#64748b]"
                      type="button"
                      onClick={() => setIsActionMenuOpen((previous) => !previous)}
                    >
                      <Ellipsis size={16} strokeWidth={2.4} />
                    </button>

                    {isActionMenuOpen ? (
                      <div className="absolute right-0 top-12 z-10 w-[220px] rounded-[28px] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                        <button
                          className="flex w-full items-center gap-4 rounded-[20px] px-5 py-5 text-left text-[15px] font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]"
                          type="button"
                          onClick={() => {
                            setIsActionMenuOpen(false);
                            navigate(`/free-info/${numericPostId}/modyfy`);
                          }}
                        >
                          <PencilLine size={22} strokeWidth={2.2} />
                          <span>수정하기</span>
                        </button>
                        <button
                          className="mt-2 flex w-full items-center gap-4 rounded-[20px] px-5 py-5 text-left text-[15px] font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={deletePostMutation.isPending}
                          type="button"
                          onClick={async () => {
                            await deletePostMutation.mutateAsync();
                          }}
                        >
                          <Trash2 size={22} strokeWidth={2.2} />
                          <span>{deletePostMutation.isPending ? "삭제 중..." : "삭제하기"}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
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
                  className={`inline-flex items-center gap-2 rounded-[8px] px-6 py-3 text-sm font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isPostLiked
                      ? "bg-[var(--color-primary-main)] text-white"
                      : "border border-[#dbe7f5] bg-white text-[#475569]"
                  }`}
                  disabled={togglePostLikeMutation.isPending}
                  type="button"
                  onClick={async () => {
                    if (!currentUserQuery.data) {
                      navigate("/login");
                      return;
                    }

                    await togglePostLikeMutation.mutateAsync(isPostLiked);
                  }}
                >
                  <ThumbsUp className={isPostLiked ? "fill-current" : undefined} size={14} strokeWidth={2.1} />
                  <span>추천 {postLikeCount}</span>
                </button>
                <button
                  className={`inline-flex items-center gap-2 rounded-[8px] px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isPostScrapped
                      ? "bg-[#eff6ff] text-[var(--color-primary-main)]"
                      : "text-[#475569]"
                  }`}
                  disabled={togglePostScrapMutation.isPending}
                  type="button"
                  onClick={async () => {
                    if (!currentUserQuery.data) {
                      navigate("/login");
                      return;
                    }

                    await togglePostScrapMutation.mutateAsync(isPostScrapped);
                  }}
                >
                  <Bookmark className={isPostScrapped ? "fill-current" : undefined} size={14} strokeWidth={2} />
                  <span>{isPostScrapped ? "스크랩됨" : "스크랩"}</span>
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
                  {formatCount(postScrapCount)}
                </span>
                <Link className="inline-flex items-center gap-1 text-[#94a3b8] hover:text-[#64748b]" to="/free-info">
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
                value={commentInput}
                onChange={(event) => setCommentInput(event.target.value.slice(0, 1000))}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[#c1cad8]">{commentInput.length} / 1000</span>
                <button
                  className="rounded-[8px] bg-[var(--color-primary-main)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={createCommentMutation.isPending}
                  type="button"
                  onClick={() => handleCommentSubmit({ content: commentInput })}
                >
                  {createCommentMutation.isPending ? "등록 중..." : "등록"}
                </button>
              </div>
            </div>
            {submitError ? <p className="mt-2 text-xs text-red-600">{submitError}</p> : null}

            <div className="mt-8 grid gap-8">
              {commentsQuery.isLoading ? <p className="text-sm text-[#94a3b8]">댓글을 불러오는 중입니다...</p> : null}
              {commentsQuery.isError ? (
                <p className="text-sm text-red-600">
                  {commentsQuery.error instanceof Error ? commentsQuery.error.message : "댓글을 불러오지 못했습니다."}
                </p>
              ) : null}
              {comments.map((comment) => (
                <div key={comment.commentId} className={comment.parentCommentId ? "ml-4 md:ml-[56px]" : ""}>
                  {(() => {
                    const isDeletedComment = comment.isDeleted;
                    const canDeleteComment = !isDeletedComment && Boolean(comment.viewer?.isAuthor);

                    return (
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <img alt="" className="size-10 rounded-full object-cover" src={comment.profilePicture || "/default_profile.png"} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1">
                          <p className="text-[13px] font-bold leading-5 text-[#0f172a]">
                            {getDisplayAuthorName(comment.authorNickname, comment.userNickname)}
                          </p>
                          {comment.userId === post.authorId ? (
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

                    <p className={`text-[13px] leading-[1.75] ${isDeletedComment ? "italic text-[#94a3b8]" : "text-[#475569]"}`}>
                      {isDeletedComment ? "삭제된 댓글입니다." : comment.content}
                    </p>

                    {!isDeletedComment ? (
                      <div className="flex items-center gap-4 text-xs">
                        {(() => {
                          const override = commentLikeOverrides[comment.commentId];
                          const isCommentLiked = override?.liked ?? comment.viewer?.liked ?? comment.liked ?? false;
                          const commentLikeCount = override?.count ?? comment.likeCount ?? 0;
                          const isTogglingCurrentComment =
                            toggleCommentLikeMutation.isPending && toggleCommentLikeMutation.variables?.commentId === comment.commentId;

                          return (
                            <button
                              className={`inline-flex items-center gap-1 font-bold transition-colors ${
                                isCommentLiked ? "text-[var(--color-primary-main)]" : "text-[#94a3b8]"
                              }`}
                              disabled={isTogglingCurrentComment}
                              type="button"
                              onClick={async () => {
                                if (!currentUserQuery.data) {
                                  navigate("/login");
                                  return;
                                }

                                await toggleCommentLikeMutation.mutateAsync({ commentId: comment.commentId, liked: isCommentLiked });
                              }}
                            >
                              <ThumbsUp className={isCommentLiked ? "fill-current" : undefined} size={12} strokeWidth={2} />
                              <span>좋아요 {commentLikeCount}</span>
                            </button>
                          );
                        })()}
                        <button
                          className={`font-bold transition-colors ${
                            activeReplyCommentId === comment.commentId ? "text-[var(--color-primary-main)]" : "text-[#94a3b8]"
                          }`}
                          type="button"
                          onClick={() => {
                            setSubmitError(null);
                            setActiveReplyCommentId((previous) => (previous === comment.commentId ? null : comment.commentId));
                          }}
                        >
                          {activeReplyCommentId === comment.commentId ? "답글 닫기" : "답글 쓰기"}
                        </button>
                        {canDeleteComment ? (
                          <button
                            className="font-bold text-[#94a3b8]"
                            disabled={deleteCommentMutation.isPending}
                            type="button"
                            onClick={async () => {
                              if (!currentUserQuery.data) {
                                navigate("/login");
                                return;
                              }

                              await deleteCommentMutation.mutateAsync(comment.commentId);
                            }}
                          >
                            삭제
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    {!isDeletedComment && activeReplyCommentId === comment.commentId ? (
                      <div className="rounded-[12px] bg-[#f8fbff] px-4 py-4">
                        <textarea
                          className="h-24 w-full resize-none bg-transparent text-sm text-[#475569] outline-none placeholder:text-[#c1cad8]"
                          placeholder="답글을 남겨주세요 :)"
                          value={replyInputs[comment.commentId] ?? ""}
                          onChange={(event) =>
                            setReplyInputs((previous) => ({
                              ...previous,
                              [comment.commentId]: event.target.value.slice(0, 1000),
                            }))
                          }
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-[#c1cad8]">{(replyInputs[comment.commentId] ?? "").length} / 1000</span>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-[8px] px-3 py-2 text-sm font-semibold text-[#94a3b8]"
                              type="button"
                              onClick={() => {
                                setActiveReplyCommentId(null);
                                setSubmitError(null);
                              }}
                            >
                              취소
                            </button>
                            <button
                              className="rounded-[8px] bg-[var(--color-primary-main)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={createCommentMutation.isPending}
                              type="button"
                              onClick={() =>
                                handleCommentSubmit({
                                  content: replyInputs[comment.commentId] ?? "",
                                  parentCommentId: comment.commentId,
                                })
                              }
                            >
                              {createCommentMutation.isPending ? "등록 중..." : "답글 등록"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}

