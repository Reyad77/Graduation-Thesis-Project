import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Root layout component — wraps every page with the navbar and footer.
 * Uses React Router's <Outlet /> to render child routes.
 */
export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
