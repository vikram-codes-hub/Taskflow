import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/50 px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-slate-100 font-bold text-2xl tracking-tight hover:opacity-80 transition group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            ✓
          </div>
          <span>
            Task<span className="text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text">Flow</span>
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {user && (
            <>
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3 pr-6 border-r border-slate-800/50">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="text-slate-200 font-semibold">{user?.name}</p>
                  <p className={`text-xs font-bold ${user?.role === "ADMIN" ? "text-amber-400" : "text-emerald-400"}`}>
                    {user?.role}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-block text-sm text-slate-300 hover:text-slate-100 transition font-semibold"
                >
                  Dashboard
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="hidden sm:inline-block text-sm text-slate-300 hover:text-slate-100 transition font-semibold"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 px-4 py-2 rounded-lg border border-rose-700/50 transition font-semibold"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}