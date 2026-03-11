import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { FreeInfoDetailPage } from "./pages/FreeInfoDetailPage";
import { FreeInfoPage } from "./pages/FreeInfoPage";
import { HomePage } from "./pages/HomePage";
import { LecturePage } from "./pages/LecturePage";
import { LoginPage } from "./pages/LoginPage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { SignupPage } from "./pages/SignupPage";
import "./global.css";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />

        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/free-info" element={<FreeInfoPage />} />
          <Route path="/free-info/:postId" element={<FreeInfoDetailPage />} />
          <Route path="/lecture" element={<LecturePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </StrictMode>,
);
