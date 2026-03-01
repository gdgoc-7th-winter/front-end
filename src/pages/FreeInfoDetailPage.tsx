import { Link, useParams } from "react-router-dom";
import { UserTierIcon } from "../components/UserTierIcon";
const detailData = {
  title: "비전공자가 6개월 만에 네카라쿠배 합격한 후기 (공부법 위주)",
  date: "26.02.24",
};

const codeExample = `const handleAuthentication = async (user) => {
  try {
    const response = await api.login(user);
    if (response.status === 200) {
      saveToken(response.data.accessToken);
      return true;
    }
  } catch (error) {
    console.error('Auth Failed:', error);
  }
};`;

export function FreeInfoDetailPage() {
  const { postId } = useParams();

  return (
    <section className="grid justify-center">
      <article className="w-full max-w-[1024px] overflow-hidden rounded-[32px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.04)]">
        <header className="border-b border-slate-50 px-5 py-8 md:px-10 md:py-10">
          <p className="text-xs text-slate-400">{detailData.date} · 자유/정보 게시판</p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-[#0f172b] md:text-[40px]">
            {detailData.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[linear-gradient(140deg,#88c2a7,#f9c6aa)]" />
              <div>
                <p className="text-[13px] font-bold text-slate-900">한국외대 지킴이<UserTierIcon tier="루비" className="ml-1 inline-block h-[13px] w-3 align-[-2px]" /></p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span>영어통번역학과</span>
                  <span className="rounded border border-[#ff0867] bg-[#fbdfea] px-1.5 py-0.5 text-[8px] text-[#ff0867]">루비</span>
                  <span className="rounded border border-black bg-[#f4f4f4] px-1.5 py-0.5 text-[8px] text-slate-600">알고리즘 마스터</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-[0_2px_4px_rgba(135,188,245,0.15)]">
                팔로우
              </button>
              <button className="grid size-10 place-items-center rounded-xl bg-white text-slate-400 shadow-[0_2px_4px_rgba(135,188,245,0.15)]">
                ⋯
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-8 px-5 py-8 md:px-10 md:py-10">
          <p className="text-[17px] leading-[1.75] text-slate-800">
            안녕하세요! 비전공자로서 개발자의 꿈을 키운지 딱 6개월 만에 목표하던 기업 중 한 곳에 최종 합격하게 되어 그 과정을
            공유하고자 합니다. 저와 같은 고민을 하시는 분들께 조금이나마 도움이 되었으면 좋겠습니다.
          </p>

          <div>
            <h2 className="text-xl font-bold text-slate-900">1. 베이스 다지기 (1~2개월 차)</h2>
            <p className="mt-3 text-[17px] leading-[1.75] text-slate-800">
              처음에는 무엇부터 시작해야 할지 몰라 무작정 CS 기초와 JavaScript 기본 문법에 집중했습니다. 특히 클로저, 프로토타입
              같은 핵심 개념을 완벽히 이해할 때까지 반복 학습했습니다.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <img
              alt="developer workspace"
              className="h-[240px] w-full object-cover md:h-[400px]"
              src="https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1600&q=80"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">2. 프로젝트와 협업 (3~5개월 차)</h2>
            <p className="mt-3 text-[17px] leading-[1.75] text-slate-800">
              이론만으로는 한계가 있다고 느껴 팀 프로젝트를 시작했습니다. DevCampus에서 마음이 맞는 팀원들을 만나 3개월간
              매일 10시간씩 몰입했습니다. 기술적인 성장도 컸지만, Git을 통한 협업과 코드 리뷰의 중요성을 뼈저리게 느낀
              시기였습니다.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-[#0f172b] p-6">
            <div className="mb-4 flex gap-2 border-b border-white/10 pb-4">
              <span className="size-3 rounded-full bg-[#fb2c36]" />
              <span className="size-3 rounded-full bg-[#fe9a00]" />
              <span className="size-3 rounded-full bg-[#00bc7d]" />
            </div>
            <p className="mb-3 text-sm text-slate-400">// 핵심 로직 구현 샘플</p>
            <pre className="overflow-x-auto text-[13px] leading-5 text-[#def1fc]">
              <code>{codeExample}</code>
            </pre>
          </div>

          <p className="text-[17px] leading-[1.75] text-slate-800">
            포기하지 않고 끝까지 완주하는 것이 가장 중요합니다. 여러분도 하실 수 있습니다!
          </p>

          <div className="flex flex-wrap gap-3">
            {[
              "취업후기",
              "비전공자",
              "네카라쿠배",
            ].map((tag) => (
              <span key={tag} className="rounded-lg bg-white px-3 py-1.5 text-xs text-[#87bcf5] shadow-[0_2px_8px_rgba(135,188,245,0.2)]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <footer className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-3">
            <button className="rounded-2xl bg-[#87bcf5] px-6 py-3 text-sm font-bold text-white">👍 좋아요 128</button>
            <button className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600">스크랩</button>
          </div>
          <div className="flex gap-3 text-sm text-slate-400">
            <span>◔ 1.24k</span>
            <span>◌ 42</span>
            <span>▯ 812</span>
            <Link to="/free-info" className="text-slate-500 underline-offset-2 hover:underline">
              목록가기
            </Link>
          </div>
        </footer>
      </article>

      <section className="mt-8 w-full max-w-[1024px] rounded-3xl bg-white px-5 py-8 md:px-10">
        <h2 className="text-xl font-bold text-slate-900">댓글 42</h2>

        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <textarea
            className="h-24 w-full resize-none bg-transparent text-sm text-slate-700 outline-none"
            placeholder="따뜻한 댓글을 남겨주세요 :)"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">0 / 1000</span>
            <button className="rounded-xl bg-[#87bcf5] px-4 py-2 text-sm font-semibold text-white">등록</button>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[linear-gradient(140deg,#9dc9ea,#4da3d9)]" />
              <div>
                <p className="text-[13px] font-bold text-slate-900">코딩테스트 만점 받고 싶어요<UserTierIcon tier="다이아" className="ml-1 inline-block h-[13px] w-3 align-[-2px]" /> · 10분 전</p>
                <p className="text-[10px] text-slate-400">컴퓨터공학과 · 다이아</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              정말 정성스러운 후기 감사합니다! 저도 비전공자라 고민이 많았는데 갈피를 잡는 데 큰 도움이 됐어요.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="text-[#589bea]">👍 12</span>
              <button>답글 쓰기</button>
            </div>
          </div>

          <div className="ml-6 grid gap-3 md:ml-10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[linear-gradient(140deg,#88c2a7,#f9c6aa)]" />
              <div>
                <p className="text-[13px] font-bold text-slate-900">한국외대 지킴이<UserTierIcon tier="루비" className="ml-1 inline-block h-[13px] w-3 align-[-2px]" /> · 5분 전</p>
                <p className="text-[10px] text-slate-400">영어통번역학과 · 루비 · 작성자</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              민수님도 충분히 하실 수 있습니다! 궁금한 점 있으시면 언제든 물어봐주세요 :)
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="text-[#589bea]">👍 2</span>
              <button>답글 쓰기</button>
            </div>
          </div>
        </div>
      </section>

      <p className="mt-4 text-center text-xs text-slate-400">post id: {postId}</p>
    </section>
  );
}
