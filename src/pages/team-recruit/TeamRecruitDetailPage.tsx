import { Bookmark, Eye, Ellipsis, MessageCircle, Share2, Star, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TEAM_RECRUIT_DETAIL, getRecruitCategoryLabel, type TeamRecruitComment } from "../../mock/teamRecruit";

function formatCount(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }

  return value.toLocaleString("ko-KR");
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date("2026-03-25T12:00:00+09:00");
  const diffMinutes = Math.max(1, Math.floor((now.getTime() - date.getTime()) / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  if (diffMinutes < 60 * 24) {
    return `${Math.floor(diffMinutes / 60)}시간 전`;
  }

  return `${Math.floor(diffMinutes / (60 * 24))}일 전`;
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

function getDaysLeftLabel(endDate: string) {
  const today = new Date("2026-03-25T00:00:00+09:00");
  const target = new Date(`${endDate}T00:00:00+09:00`);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff <= 0) {
    return "마감";
  }

  return `D-${diff}`;
}

function buildCommentTree(comments: TeamRecruitComment[]) {
  return comments.map((comment) => ({
    ...comment,
    replies: comments.filter((candidate) => candidate.parentCommentId === comment.commentId),
  }));
}

export function TeamRecruitDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const numericPostId = Number(postId);
  const post = TEAM_RECRUIT_DETAIL;
  const [commentInput, setCommentInput] = useState("");

  const commentTree = useMemo(
    () => buildCommentTree(post.comments).filter((comment) => comment.parentCommentId === null),
    [post.comments],
  );

  if (Number.isNaN(numericPostId) || numericPostId !== post.postId) {
    return (
      <section className="grid gap-8 pt-2 md:gap-10">
        <div className="rounded-[24px] border border-red-100 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
          존재하지 않는 모집 글입니다.
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col gap-6 pt-2">
      <article className="w-full overflow-hidden rounded-[32px] bg-white">
        <header className="border-b border-[#f8fafc] px-4 py-8 md:px-10 md:py-9">
          <p className="text-xs leading-4 text-[#90a1b9]">{formatPostDate(post.createdAt)} · 팀원 모집 게시판</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-[#475569]">
            <span className="inline-flex items-center gap-2">
              <Star size={12} className="fill-current text-[#475569]" />
              {getRecruitCategoryLabel(post.category)}
            </span>
            <span>|</span>
            <span>
              {post.recruitStartDate.replaceAll("-", ".")} - {post.recruitEndDate.replaceAll("-", ".")}
            </span>
          </div>

          <span className="mt-4 inline-flex rounded-[4px] bg-[#65c18b] px-4 py-1.5 text-xs font-semibold text-[#f7faff]">
            {getDaysLeftLabel(post.recruitEndDate)}
          </span>

          <h1 className="mt-4 text-[28px] font-extrabold leading-[1.32] tracking-[-0.03em] text-[#0f172b]">{post.title}</h1>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img alt="" className="size-10 rounded-full object-cover" src={post.author.profileImageUrl || "/default_profile.png"} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold leading-5 text-[#0f172a]">{post.author.name}</p>
                <p className="text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">{`${post.author.department} · ${post.author.role}`}</p>
              </div>
            </div>

            <button
              className="grid size-10 place-items-center rounded-[12px] bg-white text-[#94a3b8] shadow-[0_2px_4px_rgba(135,188,245,0.15)] transition-colors hover:text-[#64748b]"
              type="button"
            >
              <Ellipsis size={16} strokeWidth={2.4} />
            </button>
          </div>
        </header>

        <div className="px-4 py-10 md:px-10 md:py-10">
          <div
            className="prose prose-slate max-w-none text-[16px] leading-[1.82] text-[#1e293b] prose-headings:mt-10 prose-headings:mb-3 prose-headings:text-[19px] prose-headings:font-bold prose-headings:leading-7 prose-headings:text-[#0f172a] prose-p:my-0 prose-p:leading-[1.82]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-8 flex flex-wrap gap-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[8px] bg-[#fefeff] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-main)] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <footer className="flex flex-col gap-5 border-t border-[#f1f5f9] bg-[rgba(248,250,252,0.5)] px-4 py-8 md:flex-row md:items-center md:justify-between md:px-9">
          <div className="flex flex-wrap items-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-[8px] bg-[var(--color-primary-main)] px-6 py-3 text-sm font-extrabold text-white" type="button">
              <ThumbsUp className="fill-current" size={14} strokeWidth={2.1} />
              <span>추천 {post.likeCount}</span>
            </button>
            <button className="inline-flex items-center gap-2 rounded-[8px] border border-[#dbe7f5] bg-white px-4 py-3 text-sm font-bold text-[#475569]" type="button">
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
              {formatCount(post.scrapCount)}
            </span>
            <button className="inline-flex items-center gap-1 text-[#94a3b8] hover:text-[#64748b]" type="button">
              <Share2 size={14} strokeWidth={2} />
              <span>공유하기</span>
            </button>
          </div>
        </footer>
      </article>

      <div className="flex justify-center">
        <button
          className="rounded-[8px] bg-[#87bcf5] px-12 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          type="button"
          onClick={() => navigate("/team-recruit/apply")}
        >
          지원하기
        </button>
      </div>

      <section className="w-full rounded-[24px] bg-white px-4 py-8 md:px-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#0f172a]">
            댓글 <span className="text-[var(--color-primary-main)]">{post.commentCount}</span>
          </h2>
          <div className="flex items-center gap-4 text-[11px] font-medium text-[#94a3b8]">
            <button className="font-bold text-[#1d293d]" type="button">
              최신순
            </button>
            <button type="button">추천순</button>
          </div>
        </div>

        <div className="mt-5 rounded-[16px] bg-[#f7faff] px-5 py-5">
          <textarea
            className="h-24 w-full resize-none bg-transparent text-sm text-[#475569] outline-none placeholder:text-[#c1cad8]"
            placeholder="따뜻한 댓글은 작성자에게 큰 힘이 됩니다."
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value.slice(0, 1000))}
          />
          <div className="mt-3 flex items-center justify-end gap-3">
            <span className="text-xs text-[#94a3b8]">{commentInput.length} / 1000</span>
            <button className="rounded-[8px] bg-[var(--color-primary-main)] px-4 py-2 text-sm font-semibold text-white" type="button">
              등록
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8">
          {commentTree.map((comment) => (
            <div key={comment.commentId} className="grid gap-6">
              <CommentItem comment={comment} />
              {comment.replies.map((reply) => (
                <div key={reply.commentId} className="ml-4 md:ml-[56px]">
                  <CommentItem comment={reply} isAuthorReply />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function CommentItem({ comment, isAuthorReply = false }: { comment: TeamRecruitComment; isAuthorReply?: boolean }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <img alt="" className="size-10 rounded-full object-cover" src={comment.author.profileImageUrl || "/default_profile.png"} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1">
            <p className="text-[13px] font-bold leading-5 text-[#0f172a]">{comment.author.name}</p>
            {isAuthorReply ? (
              <span className="rounded-[4px] px-1.5 py-0.5 text-[8px] font-bold tracking-[-0.04em] text-[var(--color-primary-main)]">
                작성자
              </span>
            ) : null}
            <span className="pl-2 text-[9px] text-[#94a3b8]">{formatRelativeDate(comment.createdAt)}</span>
          </div>
          <p className="text-[10px] font-medium tracking-[0.048em] text-[#94a3b8]">{`${comment.author.department} · ${comment.author.role}`}</p>
        </div>
      </div>

      <p className="text-[13px] leading-[1.75] text-[#475569]">{comment.content}</p>

      <div className="flex items-center gap-4 text-xs">
        <button
          className={`inline-flex items-center gap-1 font-bold ${comment.liked ? "text-[var(--color-primary-main)]" : "text-[#94a3b8]"}`}
          type="button"
        >
          <ThumbsUp className={comment.liked ? "fill-current" : undefined} size={12} strokeWidth={2} />
          <span>{comment.likeCount}</span>
        </button>
        <button className="font-bold text-[#94a3b8]" type="button">
          답글 쓰기
        </button>
      </div>
    </div>
  );
}
