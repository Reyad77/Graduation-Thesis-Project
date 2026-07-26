import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/hooks/useAuth";

export default function Layout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Hide footer on landing page for logged-out users (Home has its own)
  const hideFooter = location.pathname === "/" && !isAuthenticated;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
