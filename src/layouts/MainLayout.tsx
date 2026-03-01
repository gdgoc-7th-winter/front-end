import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#fefeff]">
      <Header />
      <main className="mx-auto mt-6 w-full max-w-[1024px] px-4 pb-20 md:mt-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
