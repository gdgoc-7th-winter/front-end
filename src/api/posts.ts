
import { getWithoutCookies, postWithCookies } from "./http";

export type BoardPostOrder = "latest" | "views" | "scrap" | "likes";

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
  authorNickname: string;
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

export interface BoardPostsResponse {
  data: BoardPostSummary[];
  meta: BoardPostsMeta;
}

export interface CreateBoardPostRequest {
  title: string;
  content: string;
  tags: string[];
}

export interface CreateBoardPostResponse {
  postId: number;
}

export interface PostAttachment {
  fileUrl: string;
  fileName: string;
  contentType: string;
  fileSize?: number;
  sortOrder?: number;
}

export interface PostDetail {
  postId: number;
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  authorNickname: string;
  authorId?: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  scrapCount?: number;
  createdAt: string;
  updatedAt: string;
  tagNames: string[];
  attachments: PostAttachment[];
}

export interface PostComment {
  commentId: number;
  postId: number;
  userId?: number;
  authorNickname: string;
  parentCommentId?: number | null;
  content: string;
  isDeleted?: boolean;
  isBlocked?: boolean;
  createdAt: string;
  department?: string;
  track?: string;
  profilePicture?: string;
  isAuthor?: boolean;
  likeCount?: number;
}

export interface PostCommentsResponse {
  data: PostComment[];
  meta?: BoardPostsMeta;
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
  authorNickname: string;
  likeCount?: number;
  viewCount: number;
  scrapCount: number;
  commentCount: number;
  tagNames: string[];
  createdAt: string;
}

export interface LecturePostsResponse {
  data: LecturePostSummary[];
  meta: BoardPostsMeta;
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

  return getWithoutCookies<BoardPostsResponse>(`/api/v1/boards/${params.code}/posts?${queryString}`);
}

export function createBoardPost(code: string, body: CreateBoardPostRequest) {
  return postWithCookies<CreateBoardPostResponse, CreateBoardPostRequest>(`/api/v1/boards/${code}/posts`, body);
}

export function getPostDetail(postId: number) {
  return getWithoutCookies<PostDetail>(`/api/v1/posts/${postId}`);
}

function buildPostCommentsQuery(page = 0, size = 20, sort: string[] = ["createdAt,ASC"]) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));
  searchParams.set("size", String(size));
  sort.forEach((sortValue) => {
    searchParams.append("sort", sortValue);
  });

  return searchParams.toString();
}

export function getPostComments(postId: number, page = 0, size = 20, sort?: string[]) {
  const queryString = buildPostCommentsQuery(page, size, sort);

  return getWithoutCookies<PostCommentsResponse>(`/api/v1/posts/${postId}/comments?${queryString}`);
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

  return getWithoutCookies<LecturePostsResponse>(`/api/v1/lectures?${queryString}`);
}
