import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import "./global.css";

const queryClient = new QueryClient();

const BoardComingSoonPage = lazy(() =>
  import("./pages/BoardComingSoonPage").then((module) => ({ default: module.BoardComingSoonPage })),
);
const FreeInfoDetailPage = lazy(() =>
  import("./pages/free-info/FreeInfoDetailPage").then((module) => ({ default: module.FreeInfoDetailPage })),
);
const FreeInfoPage = lazy(() => import("./pages/free-info/FreeInfoPage").then((module) => ({ default: module.FreeInfoPage })));
const FreeInfoWritePage = lazy(() =>
  import("./pages/free-info/FreeInfoWritePage").then((module) => ({ default: module.FreeInfoWritePage })),
);
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const LectureDetailPage = lazy(() =>
  import("./pages/lecture/LectureDetailPage").then((module) => ({ default: module.LectureDetailPage })),
);
const LecturePage = lazy(() => import("./pages/lecture/LecturePage").then((module) => ({ default: module.LecturePage })));
const LectureWritePage = lazy(() =>
  import("./pages/lecture/LectureWritePage").then((module) => ({ default: module.LectureWritePage })),
);
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const MyAccountSettingsPage = lazy(() =>
  import("./pages/MyAccountSettingsPage").then((module) => ({ default: module.MyAccountSettingsPage })),
);
const MyApplyPage = lazy(() => import("./pages/MyApplyPage").then((module) => ({ default: module.MyApplyPage })));
const MyPostsPage = lazy(() => import("./pages/MyPostsPage").then((module) => ({ default: module.MyPostsPage })));
const PromotionsDetailPage = lazy(() =>
  import("./pages/promotions/PromotionsDetailPage").then((module) => ({ default: module.PromotionsDetailPage })),
);
const PromotionsPage = lazy(() =>
  import("./pages/promotions/PromotionsPage").then((module) => ({ default: module.PromotionsPage })),
);
const PromotionsWritePage = lazy(() =>
  import("./pages/promotions/PromotionsWritePage").then((module) => ({ default: module.PromotionsWritePage })),
);
const ProfileSetupPage = lazy(() =>
  import("./pages/ProfileSetupPage").then((module) => ({ default: module.ProfileSetupPage })),
);
const SignupPage = lazy(() => import("./pages/SignupPage").then((module) => ({ default: module.SignupPage })));
const TeamRecruitApplyPage = lazy(() =>
  import("./pages/team-recruit/TeamRecruitApplyPage").then((module) => ({ default: module.TeamRecruitApplyPage })),
);
const TeamRecruitDetailPage = lazy(() =>
  import("./pages/team-recruit/TeamRecruitDetailPage").then((module) => ({ default: module.TeamRecruitDetailPage })),
);
const TeamRecruitMyPage = lazy(() =>
  import("./pages/team-recruit/TeamRecruitMyPage").then((module) => ({ default: module.TeamRecruitMyPage })),
);
const TeamRecruitPage = lazy(() =>
  import("./pages/team-recruit/TeamRecruitPage").then((module) => ({ default: module.TeamRecruitPage })),
);
const TeamRecruitWritePage = lazy(() =>
  import("./pages/team-recruit/TeamRecruitWritePage").then((module) => ({ default: module.TeamRecruitWritePage })),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center text-sm font-medium text-[#64748b]">
              페이지를 불러오는 중입니다...
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/profile-setup/posts" element={<MyPostsPage />} />
            <Route path="/profile-setup/apply" element={<MyApplyPage />} />
            <Route path="/profile-setup/setting-account" element={<MyAccountSettingsPage />} />

            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/free-info" element={<FreeInfoPage />} />
              <Route path="/coding-test" element={<BoardComingSoonPage boardName="코딩 테스트 게시판" />} />
              <Route path="/team-recruit" element={<TeamRecruitPage />} />
              <Route path="/team-recruit/write" element={<TeamRecruitWritePage />} />
              <Route path="/team-recruit/apply" element={<TeamRecruitApplyPage />} />
              <Route path="/team-recruit/my-page" element={<TeamRecruitMyPage />} />
              <Route path="/team-recruit/:postId" element={<TeamRecruitDetailPage />} />
              <Route path="/free-info/write" element={<FreeInfoWritePage />} />
              <Route path="/free-info/:postId/modyfy" element={<FreeInfoWritePage />} />
              <Route path="/free-info/:postId" element={<FreeInfoDetailPage />} />
              <Route path="/lecture" element={<LecturePage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/promotions/write" element={<PromotionsWritePage />} />
              <Route path="/promotions/:postId/modify" element={<PromotionsWritePage />} />
              <Route path="/promotions/:postId" element={<PromotionsDetailPage />} />
              <Route path="/lecture/write" element={<LectureWritePage />} />
              <Route path="/lecture/:postId/modify" element={<LectureWritePage />} />
              <Route path="/lecture/:postId" element={<LectureDetailPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
