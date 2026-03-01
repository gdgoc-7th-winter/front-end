import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-[#f7faff] px-4">
      <div className="w-full max-w-[360px]">
        <h1 className="mb-9 text-center text-3xl font-semibold text-[#0f172a]">HUFS.DEV</h1>

        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-3">
            <button className="h-10 rounded bg-[#2c2c2c] text-white" type="button" aria-label="GitHub 로그인">
              GH
            </button>
            <button className="h-10 rounded border border-[#ededed] bg-[#f5f5f5]" type="button" aria-label="Google 로그인">
              G
            </button>
            <button className="h-10 rounded bg-[#fee500] text-[#191919]" type="button" aria-label="Kakao 로그인">
              K
            </button>
            <button className="h-10 rounded bg-[#03c75a] text-white" type="button" aria-label="Naver 로그인">
              N
            </button>
          </div>

          <div className="flex items-center gap-4 text-[#94a3b8]">
            <div className="h-px flex-1 bg-[#d7deea]" />
            <span className="text-base">또는</span>
            <div className="h-px flex-1 bg-[#d7deea]" />
          </div>

          <div className="grid gap-[5px]">
            <input
              className="h-12 rounded-xl border border-[#94a3b8] bg-transparent px-4 text-base text-[#1e293b] outline-none placeholder:text-[#94a3b8]"
              placeholder="아이디"
              type="text"
            />

            <div className="flex h-12 items-center justify-between rounded-xl border border-[#94a3b8] px-4">
              <input
                className="w-full bg-transparent text-base text-[#1e293b] outline-none placeholder:text-[#94a3b8]"
                placeholder="비밀번호"
                type="password"
              />
              <button className="ml-2 text-[#475569]" type="button" aria-label="비밀번호 보기">
                👁
              </button>
            </div>

            <button className="h-12 rounded-xl bg-[#87bcf5] text-base font-medium text-[#f7faff]" type="button">
              로그인
            </button>
          </div>

          <div className="flex items-center justify-between text-base text-[#475569]">
            <label className="flex items-center gap-2">
              <input className="size-3.5 rounded border border-[#94a3b8]" type="checkbox" />
              로그인 유지
            </label>
            <button className="text-[#475569]" type="button">
              아이디/비밀번호 찾기
            </button>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-10 text-base text-[#475569]">
          <span>계정이 없으신가요?</span>
          <button className="underline" type="button">
            회원가입 하기
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 text-sm text-[#475569]">
          <button type="button">이용약관</button>
          <button className="font-semibold" type="button">
            개인정보처리방침
          </button>
          <button type="button">문의하기</button>
        </div>

        <div className="mt-8 text-center">
          <Link className="text-sm text-[#475569] underline-offset-2 hover:underline" to="/">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </section>
  );
}
