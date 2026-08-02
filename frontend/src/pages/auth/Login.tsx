import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import GoogleAuthButton from "../../components/common/GoogleAuthButton";
import SEO from "../../components/common/SEO";

export default function Login() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);

  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password }, rememberMe);
    const currentToken = useAuthStore.getState().token;
    if (currentToken) navigate("/");
  };

  return (
    <>
      <SEO title="Đăng nhập" />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-panel-strong p-6 sm:p-8">
          <div className="text-center">
            <div className="text-3xl font-black tracking-tight text-white/95">
              OriginD
            </div>
            <div className="mt-2 text-sm text-white/60">
              Đăng nhập để bắt đầu
            </div>
          </div>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-white/70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
              placeholder="••••••••"
              required
            />
            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500 focus:ring-offset-gray-900 cursor-pointer"
                />
                <span className="text-sm text-white/70 hover:text-white/90 transition-colors">Ghi nhớ đăng nhập</span>
              </label>
              
              <Link to="/forgot-password" className="text-sm text-white/60 hover:text-white transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <button type="submit" className="primary-btn w-full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#161a2b] px-3 text-xs text-white/50">
              Hoặc tiếp tục với
            </span>
          </div>

          <GoogleAuthButton
            text="signin_with"
            onSuccess={async (credential) => {
              await googleLogin(credential);
              const token = useAuthStore.getState().token;
              if (token) navigate("/");
            }}
          />

          <div className="text-center text-sm text-white/60">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-white/90 font-semibold hover:underline"
            >
              Đăng ký
            </Link>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

