import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { FreeInfoDetailPage } from "./pages/FreeInfoDetailPage";
import { FreeInfoPage } from "./pages/FreeInfoPage";
import { FreeInfoWritePage } from "./pages/FreeInfoWritePage";
import { HomePage } from "./pages/HomePage";
import { LectureDetailPage } from "./pages/LectureDetailPage";
import { LecturePage } from "./pages/LecturePage";
import { LectureWritePage } from "./pages/LectureWritePage";
import { LoginPage } from "./pages/LoginPage";
import { MyAccountSettingsPage } from "./pages/MyAccountSettingsPage";
import { MyApplyPage } from "./pages/MyApplyPage";
import { MyPostsPage } from "./pages/MyPostsPage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { SignupPage } from "./pages/SignupPage";
import "./global.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
            <Route path="/free-info/write" element={<FreeInfoWritePage />} />
            <Route path="/free-info/:postId" element={<FreeInfoDetailPage />} />
            <Route path="/lecture" element={<LecturePage />} />
            <Route path="/lecture/write" element={<LectureWritePage />} />
            <Route path="/lecture/:postId" element={<LectureDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
