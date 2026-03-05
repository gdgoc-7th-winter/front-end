import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#fefeff]">
      <Header />
      <main className="mx-auto mt-4 w-full max-w-[1024px] px-4 pb-28 md:mt-8 md:pb-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
