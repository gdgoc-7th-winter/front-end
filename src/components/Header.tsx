import { NavLink, Link } from "react-router-dom";

const navItems = [
  { label: "자유/정보", to: "/free-info" },
  { label: "코딩 테스트", to: "#" },
  { label: "팀원 모집", to: "#" },
  { label: "강의/수업", to: "/lecture" },
  { label: "동아리/행사/홍보", to: "#" },
];

export function Header() {
  return (
    <header className="w-full px-4 py-4">
      <div className="mx-auto flex h-[33px] w-full max-w-[1024px] items-center justify-between">
        <div className="flex items-center gap-1">
          <NavLink className="rounded-lg px-3 py-2 text-sm font-semibold tracking-[0.03em] text-black" to="/">
            HUFS.DEV
          </NavLink>

          <nav className="hidden items-center md:flex" aria-label="main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-blue-50 text-blue-700" : "text-black hover:bg-slate-50"}`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="grid size-6 place-items-center text-slate-900" type="button" aria-label="검색">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <Link to='/login'>로그인</Link>
          </div>
      </div>

      <nav className="mx-auto mt-3 flex w-full max-w-[1024px] gap-2 overflow-x-auto md:hidden" aria-label="mobile navigation">
        {navItems.map((item) => (
          <NavLink
            key={`${item.label}-mobile`}
            className={({ isActive }) =>
              `shrink-0 rounded-lg px-3 py-2 text-sm ${isActive ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-700"}`
            }
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
