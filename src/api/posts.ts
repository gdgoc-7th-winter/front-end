
import { deleteWithCookies, getWithCookies, patchWithCookies, postWithCookies, putWithCookies } from "./http";

export type BoardPostOrder = "latest" | "views" | "scrap" | "likes";
export const WITHDRAWN_USER_LABEL = "탈퇴한 사용자";

export interface GetBoardPostsParams {
  code: string;
  keyword?: string;
  tags?: string[];
  order?: BoardPostOrder;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface BoardPostSummary {
  postId: number;
  title: string;
  thumbnailUrl?: string | null;
  author?: {
    authorId: number;
    nickname: string;
    profileImageUrl?: string | null;
    departmentName?: string | null;
    representativeTrackName?: string | null;
    tierBadgeImageUrl?: string | null;
    isWithdrawn?: boolean;
  };
  authorNickname?: string;
  likeCount?: number;
  viewCount: number;
  scrapCount: number;
  commentCount: number;
  tagNames: string[];
  createdAt: string;
}

export interface BoardPostsMeta {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedPostsResponse<TPost> {
  posts: TPost[];
  meta: BoardPostsMeta;
}

export interface CreateBoardPostRequest {
  title: string;
  content: string;
  tags: string[];
  department?: string;
}

export interface CreateBoardPostResponse {
  postId: number;
}

export interface CreateLecturePostRequest {
  title: string;
  content: string;
  thumbnailUrl?: string;
  department: string;
  campus: LectureCampus;
  tags: string[];
  attachments: UpdatePostAttachmentRequest[];
}

export interface UpdatePostAttachmentRequest {
  fileId?: string;
  fileUrl?: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  sortOrder: number;
}

export interface UpdateBoardPostRequest {
  title: string;
  content: string;
  thumbnailUrl?: string;
  department?: string;
  campus?: LectureCampus;
  tagNames: string[];
  attachments: UpdatePostAttachmentRequest[];
}

export interface PostAttachment {
  fileUrl: string;
  fileName: string;
  contentType: string;
  fileSize?: number;
  sortOrder?: number;
}

export interface PostViewer {
  liked?: boolean;
  scrapped?: boolean;
  isAuthor?: boolean;
}

export type CommentViewer = Pick<PostViewer, "liked" | "isAuthor">;

export interface PostDetail {
  postId: number;
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  department?: string;
  campus?: LectureCampus;
  author?: {
    authorId: number;
    nickname: string;
    profileImageUrl?: string | null;
    departmentName?: string | null;
    representativeTrackName?: string | null;
    tierBadgeImageUrl?: string | null;
    isWithdrawn?: boolean;
  };
  authorNickname: string;
  authorId?: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  scrapCount?: number;
  viewer?: PostViewer;
  liked?: boolean;
  isLiked?: boolean;
  scrapped?: boolean;
  isScrapped?: boolean;
  createdAt: string;
  updatedAt: string;
  tagNames: string[];
  attachments: PostAttachment[];
}

export interface PostComment {
  commentId: number;
  postId: number;
  userId?: number;
  userNickname?: string;
  authorNickname: string;
  parentCommentId?: number | null;
  depth?: number;
  content: string;
  isDeleted?: boolean;
  isBlocked?: boolean;
  createdAt: string;
  department?: string;
  track?: string;
  profilePicture?: string;
  viewer?: CommentViewer;
  isAuthor?: boolean;
  liked?: boolean;
  likeCount?: number;
  replies?: PostComment[];
  hasMoreReplies?: boolean;
}

export interface GetPostCommentsParams {
  cursor?: string;
  size?: number;
}

export interface CommentCursorResponse {
  comments: PostComment[];
  nextCursor?: string | null;
  hasNext: boolean;
}

export interface CreatePostCommentRequest {
  content: string;
  parentCommentId?: number;
}

export interface CreatePostCommentResponse {
  commentId: number;
}

export interface ToggleCommentLikeResponse {
  liked: boolean;
  count: number;
}

export interface TogglePostReactionResponse {
  liked?: boolean;
  isLiked?: boolean;
  scrapped?: boolean;
  isScrapped?: boolean;
  likeCount?: number;
  scrapCount?: number;
  count?: number;
}

export type LectureCampus = "SEOUL" | "GLOBAL";

export interface GetLecturePostsParams {
  keyword?: string;
  tags?: string[];
  campus?: LectureCampus;
  departments?: string[];
  order?: BoardPostOrder;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface LecturePostSummary {
  postId: number;
  title: string;
  thumbnailUrl?: string | null;
  author?: {
    authorId: number;
    nickname: string;
    profileImageUrl?: string | null;
    departmentName?: string | null;
    representativeTrackName?: string | null;
    tierBadgeImageUrl?: string | null;
    isWithdrawn?: boolean;
  };
  department?: string | null;
  campus?: LectureCampus;
  likeCount?: number;
  viewCount: number;
  scrapCount: number;
  commentCount: number;
  viewer?: PostViewer;
  tagNames: string[];
  createdAt: string;
}

export type PromotionCategory = "CLUB" | "EVENT" | "PROJECT" | "CONTEST" | "ETC";

export type PromotionViewer = PostViewer;

export interface PromotionPostSummary {
  category: PromotionCategory;
  post: {
    postId: number;
    title: string;
    thumbnailUrl?: string | null;
    excerpt?: string | null;
    author?: {
      authorId: number;
      nickname: string;
      profileImageUrl?: string | null;
      departmentName?: string | null;
      representativeTrackName?: string | null;
      tierBadgeImageUrl?: string | null;
      isWithdrawn?: boolean;
    };
    likeCount: number;
    viewCount: number;
    scrapCount: number;
    commentCount: number;
    tagNames?: string[];
    tags?: string[];
    createdAt: string;
    viewer?: PromotionViewer;
  };
}

export interface GetPromotionsParams {
  category?: PromotionCategory;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PromotionAttachmentRequest {
  fileUrl: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  sortOrder: number;
}

export interface CreatePromotionRequest {
  category: PromotionCategory;
  post: {
    title: string;
    content: string;
    thumbnailUrl: string;
    tagNames: string[];
    attachments: PromotionAttachmentRequest[];
  };
}

export interface PromotionDetail extends PostDetail {
  category: PromotionCategory;
  viewer?: PromotionViewer;
  tagNames: string[];
  tags?: string[];
}

function buildBoardPostsQuery(params: GetBoardPostsParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("code", String(params.code));
  searchParams.set("order", params.order ?? "latest");
  searchParams.set("page", String(params.page ?? 0));
  searchParams.set("size", String(params.size ?? 20));

  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }

  params.tags?.filter(Boolean).forEach((tag) => {
    searchParams.append("tags", tag);
  });

  (params.sort?.length ? params.sort : ["createdAt,DESC"]).forEach((sortValue) => {
    searchParams.append("sort", sortValue);
  });

  return searchParams.toString();
}

export function getBoardPosts(params: GetBoardPostsParams) {
  const queryString = buildBoardPostsQuery(params);

  return getWithCookies<PaginatedPostsResponse<BoardPostSummary>>(`/api/v1/boards/${params.code}/posts?${queryString}`);
}

export function createBoardPost(code: string, body: CreateBoardPostRequest) {
  return postWithCookies<CreateBoardPostResponse, CreateBoardPostRequest>(`/api/v1/boards/${code}/posts`, body);
}

export function createLecturePost(body: CreateLecturePostRequest) {
  return postWithCookies<CreateBoardPostResponse, CreateLecturePostRequest>("/api/v1/lectures", body);
}

export function updatePost(postId: number, body: UpdateBoardPostRequest) {
  return patchWithCookies<string, UpdateBoardPostRequest>(`/api/v1/posts/${postId}`, body);
}

export function deletePost(postId: number) {
  return deleteWithCookies<string>(`/api/v1/posts/${postId}`);
}

export function increasePostView(postId: number) {
  return postWithCookies<string, Record<string, never>>(`/api/v1/posts/${postId}/view`, {});
}

export function getPostDetail(postId: number) {
  return getWithCookies<PostDetail>(`/api/v1/posts/${postId}`);
}

export function likePost(postId: number) {
  return putWithCookies<TogglePostReactionResponse, Record<string, never>>(`/api/v1/posts/${postId}/like`, {});
}

export function unlikePost(postId: number) {
  return deleteWithCookies<TogglePostReactionResponse>(`/api/v1/posts/${postId}/like`);
}

export function scrapPost(postId: number) {
  return putWithCookies<TogglePostReactionResponse, Record<string, never>>(`/api/v1/posts/${postId}/scrap`, {});
}

export function unscrapPost(postId: number) {
  return deleteWithCookies<TogglePostReactionResponse>(`/api/v1/posts/${postId}/scrap`);
}

function buildPostCommentsQuery(params: GetPostCommentsParams = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set("size", String(params.size ?? 20));

  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }

  return searchParams.toString();
}

export function getPostComments(postId: number, params: GetPostCommentsParams = {}) {
  const queryString = buildPostCommentsQuery(params);

  return getWithCookies<CommentCursorResponse>(`/api/v1/posts/${postId}/comments?${queryString}`);
}

export function getCommentReplies(postId: number, parentCommentId: number, params: GetPostCommentsParams = {}) {
  const queryString = buildPostCommentsQuery(params);

  return getWithCookies<CommentCursorResponse>(`/api/v1/posts/${postId}/comments/${parentCommentId}/comments?${queryString}`);
}

function getTrimmedDisplayValue(value?: string | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

export function getDisplayAuthorName(...candidates: Array<string | null | undefined>) {
  return candidates.map((candidate) => getTrimmedDisplayValue(candidate)).find(Boolean) ?? WITHDRAWN_USER_LABEL;
}

function normalizePostComment(comment: PostComment, parentCommentId?: number | null, depth = 0): PostComment {
  const normalizedReplies = (comment.replies ?? []).map((reply) =>
    normalizePostComment(reply, comment.commentId, (comment.depth ?? depth) + 1),
  );

  return {
    ...comment,
    userNickname: comment.userNickname,
    authorNickname: getDisplayAuthorName(comment.authorNickname, comment.userNickname),
    parentCommentId: comment.parentCommentId ?? parentCommentId ?? null,
    depth: comment.depth ?? depth,
    replies: normalizedReplies,
  };
}

export function flattenPostComments(comments: PostComment[]): PostComment[] {
  return comments.flatMap((comment) => {
    const normalizedComment = normalizePostComment(comment);

    return [normalizedComment, ...flattenPostComments(normalizedComment.replies ?? [])];
  });
}

export function createPostComment(postId: number, body: CreatePostCommentRequest) {
  return postWithCookies<CreatePostCommentResponse, CreatePostCommentRequest>(`/api/v1/posts/${postId}/comments`, body);
}

export function deletePostComment(postId: number, commentId: number) {
  return deleteWithCookies<string>(`/api/v1/posts/${postId}/comments/${commentId}`);
}

export function likePostComment(postId: number, commentId: number) {
  return putWithCookies<ToggleCommentLikeResponse, Record<string, never>>(
    `/api/v1/posts/${postId}/comments/${commentId}/like`,
    {},
  );
}

export function unlikePostComment(postId: number, commentId: number) {
  return deleteWithCookies<ToggleCommentLikeResponse>(`/api/v1/posts/${postId}/comments/${commentId}/like`);
}

function buildLecturePostsQuery(params: GetLecturePostsParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("order", params.order ?? "latest");
  searchParams.set("page", String(params.page ?? 0));
  searchParams.set("size", String(params.size ?? 20));

  if (params.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }

  if (params.campus) {
    searchParams.set("campus", params.campus);
  }

  params.tags?.filter(Boolean).forEach((tag) => {
    searchParams.append("tags", tag);
  });

  params.departments?.filter(Boolean).forEach((department) => {
    searchParams.append("departments", department);
  });

  (params.sort?.length ? params.sort : ["createdAt,DESC"]).forEach((sortValue) => {
    searchParams.append("sort", sortValue);
  });

  return searchParams.toString();
}

export function getLecturePosts(params: GetLecturePostsParams = {}) {
  const queryString = buildLecturePostsQuery(params);

  return getWithCookies<PaginatedPostsResponse<LecturePostSummary>>(`/api/v1/lectures?${queryString}`);
}

function buildPromotionsQuery(params: GetPromotionsParams = {}) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 0));
  searchParams.set("size", String(params.size ?? 20));

  if (params.category) {
    searchParams.set("category", params.category);
  }

  (params.sort?.length ? params.sort : ["createdAt,DESC"]).forEach((sortValue) => {
    searchParams.append("sort", sortValue);
  });

  return searchParams.toString();
}

export function getPromotions(params: GetPromotionsParams = {}) {
  const queryString = buildPromotionsQuery(params);

  return getWithCookies<PaginatedPostsResponse<PromotionPostSummary>>(`/api/v1/promotions?${queryString}`);
}

export function createPromotion(body: CreatePromotionRequest) {
  return postWithCookies<CreateBoardPostResponse, CreatePromotionRequest>("/api/v1/promotions", body);
}

export function getPromotionDetail(postId: number) {
  return getWithCookies<PromotionDetail>(`/api/v1/promotions/${postId}`);
}

export function updatePromotion(postId: number, body: CreatePromotionRequest) {
  return patchWithCookies<string, CreatePromotionRequest>(`/api/v1/promotions/${postId}`, body);
}

export function deletePromotion(postId: number) {
  return deleteWithCookies<string>(`/api/v1/promotions/${postId}`);
}
