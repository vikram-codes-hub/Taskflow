import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ADMIN_CREDENTIALS = {
  email: "admin@taskflow.com",
  password: "admin123456",
};

const USER_CREDENTIALS = {
  email: "user@taskflow.com",
  password: "user123456",
};

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (credentials) => {
    setForm(credentials);
    // Auto-submit after setting form
    setTimeout(async () => {
      try {
        setLoading(true);
        await login(credentials.email, credentials.password);
      } catch (err) {
        toast.error(err.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-sm mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            Welcome to TaskFlow
          </h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to manage your tasks</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2 font-semibold">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-lg text-sm transition disabled:opacity-50 transform hover:scale-105 active:scale-95"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-slate-400 mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Register here
            </Link>
          </p>
        </div>

        {/* Demo Credentials Cloud */}
        <div className="space-y-4">
          {/* Admin Credentials Card */}
          <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl p-5 border border-amber-700/50 backdrop-blur-sm hover:border-amber-700 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wide">👑 Admin Account</h3>
                <p className="text-amber-200/70 text-xs mt-1">For recruiters to test admin features</p>
              </div>
              <span className="text-xl">☁️</span>
            </div>
            <div className="space-y-2 mb-4 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-amber-300 font-mono text-sm break-all">{ADMIN_CREDENTIALS.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Password</p>
                <p className="text-amber-300 font-mono text-sm">{ADMIN_CREDENTIALS.password}</p>
              </div>
            </div>
            <button
              onClick={() => quickLogin(ADMIN_CREDENTIALS)}
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wide transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Quick Login as Admin"}
            </button>
          </div>

          {/* User Credentials Card */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-xl p-5 border border-emerald-700/50 backdrop-blur-sm hover:border-emerald-700 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-wide">👤 User Account</h3>
                <p className="text-emerald-200/70 text-xs mt-1">For recruiters to test user features</p>
              </div>
              <span className="text-xl">☁️</span>
            </div>
            <div className="space-y-2 mb-4 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-emerald-300 font-mono text-sm break-all">{USER_CREDENTIALS.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Password</p>
                <p className="text-emerald-300 font-mono text-sm">{USER_CREDENTIALS.password}</p>
              </div>
            </div>
            <button
              onClick={() => quickLogin(USER_CREDENTIALS)}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wide transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Quick Login as User"}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-xs">
            <span className="font-bold text-slate-300">💡 Demo Tip:</span> Click the quick login buttons above to instantly access the application with pre-filled credentials. Perfect for testing both admin and user roles!
          </p>
        </div>
      </div>
    </div>
  );
}