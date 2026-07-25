import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-primary-600">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page not found</p>
      <p className="text-sm text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 flex items-center gap-2">
        <Home size={16} /> Go Home
      </Link>
    </div>
  );
}
