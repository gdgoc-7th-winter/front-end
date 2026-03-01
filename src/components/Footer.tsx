import { Link } from "react-router-dom";
import type { ReactNode } from "react";

function IconButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-black/10 bg-[#f3f6f9] text-[#94a3b8] transition hover:text-[#64748b]"
    >
      {children}
    </button>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 bg-[#f1f5f9] px-6 pb-12 pt-12 md:px-14">
      <div className="mx-auto flex w-full max-w-[1328px] flex-col justify-between gap-10 lg:flex-row">
        <div className="max-w-[320px]">
          <h2 className="text-[32px] font-extrabold tracking-[-0.02em] text-[#0f1724]">HUFS.DEV</h2>
          <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
            한국외국어대학교 학생들을 위한 개발자 커뮤니티입니다. 함께 성장하고 소통하는 공간을 만들어갑니다.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <IconButton label="github">
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.61-3.37-1.18-3.37-1.18-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.52 1.03 1.52 1.03.88 1.52 2.31 1.08 2.88.82.09-.64.34-1.08.62-1.33-2.22-.26-4.56-1.11-4.56-4.95 0-1.1.39-2 1.03-2.71-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.03A9.5 9.5 0 0112 6.8a9.5 9.5 0 012.5.34c1.9-1.3 2.74-1.03 2.74-1.03.55 1.4.2 2.45.1 2.7.64.72 1.03 1.62 1.03 2.72 0 3.85-2.34 4.69-4.57 4.95.36.31.67.92.67 1.86v2.76c0 .27.18.58.69.48A10 10 0 0012 2z" />
              </svg>
            </IconButton>
            <IconButton label="instagram">
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17" cy="7" r="1" fill="currentColor" />
              </svg>
            </IconButton>
            <IconButton label="mail">
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4.5 7l7.5 6L19.5 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </IconButton>
          </div>

          <p className="mt-6 text-[13px] text-[#94a3b8]">© 2025 HUFS.DEV. All rights reserved.</p>
        </div>

        <div className="grid grid-cols-3 gap-x-10 gap-y-6 text-sm text-[#94a3b8]">
          <div className="grid content-start gap-3">
            <p className="text-[15px] text-[#0f1724]">커뮤니티</p>
            <span>공지사항</span>
            <Link to="/free-info">자유게시판</Link>
            <span>정보공유</span>
            <span>질문/답변</span>
          </div>

          <div className="grid content-start gap-3">
            <p className="text-[15px] text-[#0f1724]">프로젝트</p>
            <span>팀원 모집</span>
            <span>사이드 프로젝트</span>
            <span>스터디 모집</span>
          </div>

          <div className="grid content-start gap-3">
            <p className="text-[15px] text-[#0f1724]">고객지원</p>
            <span>서비스 소개</span>
            <span>이용약관</span>
            <span>개인정보 처리방침</span>
            <span>문의하기</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
