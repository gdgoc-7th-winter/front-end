import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { BookOpenCheck, Code2, Megaphone, Newspaper, Search, UsersRound } from "lucide-react";

const desktopNavItems = [
  { label: "자유/정보", to: "/free-info" },
  { label: "코딩 테스트", to: "/free-info" },
  { label: "팀원 모집", to: "/free-info" },
  { label: "강의/수업", to: "/lecture" },
  { label: "동아리/행사/홍보", to: "/lecture" },
];

const mobileDockItems = [
  { label: "자유/정보", to: "/free-info", icon: Newspaper },
  { label: "코테", to: "/free-info", icon: Code2 },
  { label: "팀원 모집", to: "/free-info", icon: UsersRound },
  { label: "강의/수업", to: "/lecture", icon: BookOpenCheck },
  { label: "동아리/홍보", to: "/lecture", icon: Megaphone },
];

export function Header() {
  const [showMobileDock, setShowMobileDock] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const scrollingUp = currentY < lastScrollY.current;
      const nearTop = currentY < 24;

      setIsAtTop(nearTop);
      setShowMobileDock(scrollingUp || nearTop);
      lastScrollY.current = currentY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dockVisibilityClass = useMemo(() => {
    return showMobileDock ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0";
  }, [showMobileDock]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b border-black/5 bg-[#fefeff]/95 px-4 backdrop-blur ${
          isAtTop ? "" : "shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
        }`}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1024px] items-center justify-between">
          <div className="flex items-center gap-1">
            <NavLink className="rounded-lg px-2 py-2 text-sm font-semibold tracking-[0.03em] text-black sm:px-3" to="/">
              HUFS.DEV
            </NavLink>

            <nav className="hidden items-center md:flex" aria-label="main navigation">
              {desktopNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-[rgba(135,188,245,0.18)] text-[var(--color-primary-active)]"
                        : "text-black hover:bg-slate-50"
                    }`
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className="grid size-9 place-items-center rounded-xl border border-black/10 text-slate-900 md:size-8 md:rounded-none md:border-0"
              type="button"
              aria-label="검색"
            >
              <Search className="size-4.5 md:size-5" strokeWidth={2} />
            </button>
            <Link className="rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-50" to="/login">
              로그인
            </Link>
          </div>
        </div>
      </header>

      <nav
        aria-label="mobile dock navigation"
        className={`fixed inset-x-0 bottom-[max(12px,env(safe-area-inset-bottom))] z-50 px-4 md:hidden ${dockVisibilityClass} pointer-events-auto transition-all duration-200`}
      >
        <div className="mx-auto flex h-[68px] max-w-[420px] items-center justify-between rounded-full border border-black/10 bg-white/95 px-3 shadow-[0_8px_24px_rgba(15,23,42,0.16)] backdrop-blur">
          {mobileDockItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                className={({ isActive }) =>
                  `flex min-w-[58px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-colors ${
                    isActive ? "text-[var(--color-primary-active)]" : "text-slate-500"
                  }`
                }
                to={item.to}
              >
                <Icon className="size-4.5" strokeWidth={1.9} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
