
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpenCheck,
  ChevronRight,
  CircleUserRound,
  Code2,
  FilePenLine,
  LayoutGrid,
  LogOut,
  Megaphone,
  Medal,
  MessageSquareMore ,
  Newspaper,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { clearAuthCookies } from "../api/http";
import { getCurrentUser, isProfileSetupRequiredError, ProfileRequestError } from "../api/profile";
import type { CurrentUserResponse } from "../api/profile";

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

const dummyUser: CurrentUserResponse = {
  nickname: "dummy",
  profilePicture: "/default_profile.png",
  isDummyProfile: true,
};

const profileMenuItems: Array<{
  label: string;
  icon: typeof CircleUserRound;
  to?: string;
}> = [
  { label: "프로필", icon: CircleUserRound, to: "/profile-setup" },
  { label: "나의 업적", icon: Medal },
  { label: "작성한 게시글", icon: FilePenLine, to: "/profile-setup/posts" },
  { label: "지원 현황", icon: LayoutGrid, to: "/profile-setup/apply" },
  { label: "계정 설정", icon: Settings, to: "/profile-setup/setting-account" },
];

export function Header() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showMobileDock, setShowMobileDock] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

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

  const currentUserQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        const response = await getCurrentUser();
        return response.data;
      } catch (error) {
        if (isProfileSetupRequiredError(error)) {
          return dummyUser;
        }

        if (error instanceof ProfileRequestError && (error.status === 401 || error.status === 403)) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const user = currentUserQuery.data ?? null;
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: async () => {
      clearAuthCookies();
      setIsProfileMenuOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      navigate("/login", { replace: true });
    },
  });

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isProfileMenuOpen]);

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

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              className="grid size-9 place-items-center rounded-full text-[#0f172a] transition hover:bg-[#f8fafc] md:size-10"
              type="button"
              aria-label="검색"
            >
              <Search className="size-4.5 md:size-5" strokeWidth={2.2} />
            </button>

            <button
              className="grid size-9 place-items-center rounded-full text-[#0f172a] transition hover:bg-[#f8fafc] md:size-10"
              type="button"
              aria-label="알림"
            >
              <Bell className="size-4.5 md:size-5" strokeWidth={2.1} />
            </button>

            <button
              className="grid size-9 place-items-center rounded-full text-[#0f172a] transition hover:bg-[#f8fafc] md:size-10"
              type="button"
              aria-label="메시지"
            >
              <MessageSquareMore  className="size-4.5 md:size-5" strokeWidth={2.1} />
            </button>

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="grid size-10 place-items-center rounded-full transition hover:bg-[#f8fafc]"
                  type="button"
                  onClick={() => setIsProfileMenuOpen((previous) => !previous)}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  aria-label="프로필 메뉴"
                >
                  <img
                    className="size-8 rounded-full border border-black/10 object-cover"
                    src={user.profilePicture || "/default_profile.png"}
                    alt="프로필 이미지"
                  />
                </button>

                {isProfileMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[236px] rounded-[24px] border border-[#e7edf5] bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.14)]">
                    <button
                      className="flex w-full items-center justify-between rounded-[18px] px-2 py-1.5 text-left transition hover:bg-[#f8fbff]"
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate("/profile-setup");
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          className="size-10 rounded-full border border-[#e2e8f0] object-cover"
                          src={user.profilePicture || "/default_profile.png"}
                          alt="프로필 이미지"
                        />
                        <div>
                          <p className="text-[13px] font-semibold leading-5 text-[#0f172a]">{user.nickname || "회원"}</p>
                          <p className="mt-0.5 text-[11px] leading-4 text-[#94a3b8]">
                            {user.department || (user.isDummyProfile ? "프로필 설정이 필요합니다." : "계정 정보")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-[#0f172a]" />
                    </button>

                    <div className="mt-3 grid gap-1">
                      {profileMenuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.label}
                            className="flex w-full items-center gap-3 rounded-[18px] px-2 py-2.5 text-left text-[13px] text-[#52637b] transition hover:bg-[#f8fbff]"
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (item.to) {
                                navigate(item.to);
                              }
                            }}
                          >
                            <Icon className="size-4.5 text-[#607089]" strokeWidth={1.9} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}

                      <button
                        className="mt-1 flex w-full items-center gap-3 rounded-[18px] px-2 py-2.5 text-left text-[13px] text-[#52637b] transition hover:bg-[#f8fbff] disabled:opacity-60"
                        type="button"
                        disabled={logoutMutation.isPending}
                        onClick={() => {
                          logoutMutation.mutate();
                        }}
                      >
                        <LogOut className="size-4.5 text-[#607089]" strokeWidth={1.9} />
                        <span>{logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : currentUserQuery.isPending ? (
              <div className="size-10 rounded-full bg-[#f8fafc]" />
            ) : (
              <Link
                className="grid size-10 place-items-center rounded-full transition hover:bg-[#f8fafc]"
                to="/login"
                aria-label="로그인"
              >
                <CircleUserRound className="size-5 text-[#0f172a]" strokeWidth={2} />
              </Link>
            )}
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
