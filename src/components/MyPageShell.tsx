import type { ReactNode } from "react";
import { CircleUserRound, LayoutGrid, PenSquare, Settings, Trophy } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

type MyPageSection = "profile" | "achievements" | "posts" | "apply" | "setting-account";

const sidebarItems: Array<{
  id: MyPageSection;
  label: string;
  icon: typeof CircleUserRound;
  to?: string;
}> = [
  { id: "profile", label: "프로필", icon: CircleUserRound, to: "/profile-setup" },
  { id: "achievements", label: "나의 업적", icon: Trophy },
  { id: "posts", label: "작성한 게시글", icon: PenSquare, to: "/profile-setup/posts" },
  { id: "apply", label: "지원 현황", icon: LayoutGrid, to: "/profile-setup/apply" },
  { id: "setting-account", label: "계정 설정", icon: Settings, to: "/profile-setup/setting-account" },
];

export function MyPageShell({
  activeSection,
  children,
}: {
  activeSection: MyPageSection;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fefeff]">
      <Header />

      <section className="mx-auto flex w-full max-w-[1024px] flex-col gap-8 px-4 py-8 md:gap-10 md:px-6 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-[42px]">
          <aside className="w-full shrink-0 rounded-xl border border-[#eef2f6] bg-white md:w-[178px] md:border-0 md:bg-transparent">
            <div className="grid md:gap-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeSection;

                return (
                  <NavLink
                    key={item.id}
                    className={`flex items-center gap-3 px-5 py-4 text-left text-sm font-semibold ${
                      isActive
                        ? "rounded-xl bg-[rgba(135,188,245,0.1)] text-[var(--color-primary-active)]"
                        : "text-[#475569]"
                    }`}
                    to={item.to!}
                  >
                    <Icon className="size-[18px]" strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </section>

      <Footer />
    </div>
  );
}
