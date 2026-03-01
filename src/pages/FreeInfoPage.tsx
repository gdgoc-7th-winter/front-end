import { Link } from "react-router-dom";
import { UserTierIcon } from "../components/UserTierIcon";
type PostItem = {
  id: number;
  author: string;
  dept: string;
  badge: "루비" | "다이아";
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  likes: string;
  comments: string;
  views: string;
  scraps: string;
};

const posts: PostItem[] = [
  {
    id: 1,
    author: "한국외대 지킴이",
    dept: "영어통번역학과",
    badge: "루비",
    title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
    excerpt:
      "안녕하세요! 오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 상세하게 공유해보려고 합니다. 우선 가장 중요했던 건 기초 CS 지식과...",
    tags: ["취업후기", "비전공자", "네카라쿠배"],
    date: "26.02.24",
    likes: "128",
    comments: "42",
    views: "1.2k",
    scraps: "812",
  },
  {
    id: 2,
    author: "코딩테스트 만점 받고 싶어요",
    dept: "컴퓨터공학과",
    badge: "다이아",
    title: "프로그래머스 Lv.3 '네트워크' 문제 효율적인 풀이법",
    excerpt:
      "DFS와 BFS 중 어떤 것을 선택해야 할지 고민되는 문제였습니다. 제가 작성한 코드와 시간 복잡도 분석 내용을 공유합니다.",
    tags: ["코테", "프로그래머스", "DFS", "BFS"],
    date: "26.02.24",
    likes: "128",
    comments: "42",
    views: "1.2k",
    scraps: "812",
  },
  {
    id: 3,
    author: "한국외대 지킴이",
    dept: "영어통번역학과",
    badge: "루비",
    title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
    excerpt:
      "안녕하세요! 오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 상세하게 공유해보려고 합니다. 우선 가장 중요했던 건 기초 CS 지식과...",
    tags: ["취업후기", "비전공자", "네카라쿠배"],
    date: "26.02.24",
    likes: "128",
    comments: "42",
    views: "1.2k",
    scraps: "812",
  },
  {
    id: 4,
    author: "코딩테스트 만점 받고 싶어요",
    dept: "컴퓨터공학과",
    badge: "다이아",
    title: "프로그래머스 Lv.3 '네트워크' 문제 효율적인 풀이법",
    excerpt:
      "DFS와 BFS 중 어떤 것을 선택해야 할지 고민되는 문제였습니다. 제가 작성한 코드와 시간 복잡도 분석 내용을 공유합니다.",
    tags: ["코테", "프로그래머스", "DFS", "BFS"],
    date: "26.02.24",
    likes: "128",
    comments: "42",
    views: "1.2k",
    scraps: "812",
  },
];

function Badge({ badge }: { badge: "루비" | "다이아" }) {
  const isRuby = badge === "루비";

  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[8px] leading-none ${
        isRuby ? "border border-[#ff0867] bg-[#fbdfea] text-[#ff0867]" : "border border-[#08b6fc] bg-[#edf8fc] text-[#08b6fc]"
      }`}
    >
      {badge}
    </span>
  );
}

export function FreeInfoPage() {
  return (
    <section className="grid gap-12">
      <h1 className="text-4xl font-bold tracking-[-0.02em] text-black md:text-[44px]">자유/정보 게시판</h1>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="inline-flex items-center gap-2 rounded-lg bg-[#fff3f3] px-3 py-2 text-xs font-semibold text-[#e15851]">
          <span>📢</span>
          <span>공지사항</span>
        </div>
        <div className="flex-1 rounded-lg bg-[#fff3f3] px-3 py-2 text-xs text-slate-600">
          부적절한 콘텐츠 업로드 및 언행은 즉시 조치될 수 있으니 깨끗한 커뮤니티를 위해 주의해주세요!
        </div>
      </div>

      <div>
        {posts.map((post) => (
          <article key={post.id} className={`grid gap-4 py-12 `}>
            <div className="flex items-center gap-3">
              <div
                className={`size-10 rounded-lg border border-slate-200 ${
                  post.badge === "다이아"
                    ? "bg-[linear-gradient(140deg,#9dc9ea,#4da3d9)]"
                    : "bg-[linear-gradient(140deg,#88c2a7,#f9c6aa)]"
                }`}
              />
              <div className="grid gap-0.5">
                <p className="text-[13px] font-bold leading-5 text-slate-900">{post.author}<UserTierIcon tier={post.badge} className="ml-1 inline-block h-[13px] w-3 align-[-2px]" /></p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span>{post.dept}</span>
                  <Badge badge={post.badge} />
                  {post.badge === "루비" ? (
                    <span className="rounded border border-black bg-[#f4f4f4] px-1.5 py-0.5 text-[8px] leading-none text-slate-600">
                      알고리즘 마스터
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <Link to={`/free-info/${post.id}`} className="text-2xl font-bold leading-tight tracking-[-0.02em] text-slate-900 hover:text-blue-700 md:text-[28px]">
              {post.title}
            </Link>
            <p className="text-sm leading-7 text-slate-600">{post.excerpt}</p>

            <div className="flex flex-wrap gap-2.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs text-[#87bcf5] shadow-[0_2px_8px_rgba(135,188,245,0.2)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-1 text-[11px] text-slate-400 md:flex-row md:items-center md:gap-4">
              <span>{post.date} · 자유/정보 게시판</span>
              <div className="flex gap-3">
                <span>♡ {post.likes}</span>
                <span>◌ {post.comments}</span>
                <span>◔ {post.views}</span>
                <span>▯ {post.scraps}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
