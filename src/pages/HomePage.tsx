import { UserTierIcon } from "../components/UserTierIcon";

export function HomePage() {
  const ranking = [
    { rank: 1, name: "한국외대 지킴이", dept: "영어통번역학과", exp: "EXP 678915892", tier: "루비" as const },
    { rank: 2, name: "훕데 지박령", dept: "컴퓨터공학과", exp: "EXP 6247", tier: "루비" as const },
    { rank: 3, name: "한국외대 6학년", dept: "산업공학과", exp: "EXP 4522", tier: "다이아" as const },
    { rank: 4, name: "바이브코딩 물러가라", dept: "컴퓨터공학과", exp: "EXP 2222", tier: "에메랄드" as const },
  ];

  const popular = [
    "이제 더는 PPT 만들기 싫은 사람들을 위한 6가지 툴",
    "Anthropic 해커톤 우승자가 공유한 Claude Code 실전 팁 70가지",
    "검색 말고 리서치 잘하는 사람이 쓰는 도구 7가지",
    "프로그래머로서 이렇게 뒤처지는 날은 처음입니다",
    "Cursor와 실제로 마이그레이션 해보면서 느낀 체크포인트",
    "알고리즘 왜 또 OOO 교수님인가요... 진짜 체계적으로 다시",
  ];

  const latest = [
    {
      author: "한국외대 지킴이",
      dept: "영어통번역학과",
      tier: "루비" as const,
      title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
      excerpt: "안녕하세요! 오늘은 제가 6개월 동안 어떤 식으로 스케줄을 짜고 공부했는지 상세하게 공유해보려고 합니다.",
      tags: ["취업후기", "비전공자", "네카라쿠배"],
    },
    {
      author: "코딩테스트 만점 받고 싶어요",
      dept: "컴퓨터공학과",
      tier: "다이아" as const,
      title: "프로그래머스 Lv.3 '네트워크' 문제 효율적인 풀이법",
      excerpt: "DFS와 BFS 중 어떤 것을 선택해야 할지 고민되는 문제였습니다. 코드와 시간 복잡도 분석 내용을 공유합니다.",
      tags: ["코테", "프로그래머스", "DFS", "BFS"],
    },
  ];

  return (
    <section className="grid gap-14">
      <div className="grid gap-5 lg:grid-cols-[1fr_336px]">
        <article className="relative min-h-[355px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-900">
          <img
            alt="hero"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1600&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950/95" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-white">
            <p className="text-xs text-white/70">코딩 테스트 / 백준 / 실전 문제</p>
            <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.03em] md:text-[40px]">
              오늘의 코딩테스트 문제 : 백준 18939
            </h1>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-white/85">코딩 테스트 게시판</span>
              <span className="rounded-full bg-black/45 px-3 py-1">3 / 4</span>
            </div>
          </div>
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-white/80 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">주간 랭킹</h2>
            <span className="text-slate-400">‹ ›</span>
          </div>
          <div className="grid gap-3">
            {ranking.map((user) => (
              <div key={user.rank} className="grid grid-cols-[18px_48px_1fr] items-center gap-3">
                <span className="text-sm font-bold text-slate-900">{user.rank}</span>
                <div className="size-12 rounded-xl border border-slate-200 bg-[linear-gradient(140deg,#bcd2f4,#8da8d2)]" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {user.name}
                    <UserTierIcon tier={user.tier} className="ml-1 inline-block h-[13px] w-3 align-[-2px]" />
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {user.dept} · {user.exp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="h-[200px] overflow-hidden rounded-2xl border border-slate-200">
        <img
          alt="banner"
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80"
        />
      </div>

      <section>
        <h2 className="mb-7 text-[34px] font-bold tracking-[-0.03em] text-slate-900">실시간 인기글</h2>
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
          {popular.map((title, idx) => (
            <article key={title} className="grid grid-cols-[26px_1fr_84px] gap-3 max-[640px]:grid-cols-[26px_1fr]">
              <div>
                <p className="text-[28px] font-bold leading-none text-slate-800">{idx + 1}</p>
                <p className="mt-1 text-[10px] font-bold text-[#74a8ff]">NEW</p>
              </div>
              <div>
                <h3 className="text-[17px] font-semibold leading-7 text-slate-900">{title}</h3>
                <p className="mt-2 text-xs text-slate-500">자유/정보 게시판</p>
                <p className="mt-2 text-[11px] text-slate-400">프로덕트 밸리 · 26.02.24 · ♡ 128 · ◌ 42 · ◔ 1.2k</p>
              </div>
              <div className="hidden h-[84px] rounded-xl border border-slate-200 bg-[linear-gradient(140deg,#cfd9e8,#9aaecb)] max-[640px]:hidden lg:block" />
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-7 text-[34px] font-bold tracking-[-0.03em] text-slate-900">최신 게시글</h2>
        <div className="grid gap-6">
          {latest.map((post, idx) => (
            <article key={`${post.title}-${idx}`} className={`grid gap-4 pt-6 ${idx > 0 ? "border-t border-slate-200" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-[linear-gradient(140deg,#88c2a7,#f9c6aa)]" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {post.author}
                    <UserTierIcon tier={post.tier} className="ml-1 inline-block h-[13px] w-3 align-[-2px]" />
                  </p>
                  <p className="text-[11px] text-slate-400">{post.dept}</p>
                </div>
              </div>
              <h3 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-slate-900">{post.title}</h3>
              <p className="text-sm leading-7 text-slate-600">{post.excerpt}</p>
              <div className="flex flex-wrap gap-2.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-white px-3 py-1.5 text-xs text-[#87bcf5] shadow-[0_2px_8px_rgba(135,188,245,0.2)]">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">26.02.24 · 자유/정보 게시판 · ♡ 128 · ◌ 42 · ◔ 1.2k</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
