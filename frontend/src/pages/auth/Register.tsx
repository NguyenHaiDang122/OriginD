import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import GoogleAuthButton from "../../components/common/GoogleAuthButton";

export default function Register() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtpAndRegister = useAuthStore((s) => s.verifyOtpAndRegister);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [otp, setOtp] = useState("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  async function onSubmitStep1(e: React.FormEvent) {
    e.preventDefault();
    setInfoMessage(null);
    try {
      const msg = await sendOtp({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setInfoMessage(msg || "Mã OTP đã được gửi đến email của bạn.");
      setStep(2);
    } catch (err) {
      // Error is handled in store
    }
  }

  async function onSubmitStep2(e: React.FormEvent) {
    e.preventDefault();
    try {
      await verifyOtpAndRegister({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        otp,
      });
      const currentToken = useAuthStore.getState().token;
      if (currentToken) navigate("/");
    } catch (err) {
      // Error is handled in store
    }
  }

  async function handleResendOtp() {
    setInfoMessage(null);
    try {
      const msg = await sendOtp({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setInfoMessage(msg || "Đã gửi lại mã OTP mới đến email của bạn.");
    } catch (err) {
      // Error handled in store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md glass-panel-strong p-6 sm:p-8 relative overflow-hidden">
        {step === 1 ? (
          <>
            <div className="text-center">
              <div className="text-3xl font-black tracking-tight text-white/95">
                OriginD
              </div>
              <div className="mt-2 text-sm text-white/60">
                Tạo tài khoản mới
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={onSubmitStep1}>
              <div>
                <label className="text-sm text-white/70">Tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                  placeholder="Tên của bạn"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Email (Gmail)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                  placeholder="you@gmail.com"
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
              </div>

              <div>
                <label className="text-sm text-white/70">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              ) : null}

              <button type="submit" className="primary-btn w-full justify-center py-3" disabled={loading}>
                {loading ? "Đang gửi mã OTP..." : "Tiếp tục - Xác thực Gmail →"}
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative bg-[#161a2b] px-3 text-xs text-white/50">
                  Hoặc đăng ký nhanh bằng
                </span>
              </div>

              <GoogleAuthButton
                text="signup_with"
                onSuccess={async (credential) => {
                  await googleLogin(credential);
                  const token = useAuthStore.getState().token;
                  if (token) navigate("/");
                }}
              />

              <div className="text-center text-sm text-white/60">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-white/90 font-semibold hover:underline"
                >
                  Đăng nhập
                </Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 text-2xl text-violet-300 border border-violet-500/30 shadow-inner">
                📧
              </div>
              <div className="mt-4 text-2xl font-black tracking-tight text-white/95">
                Xác nhận mã OTP
              </div>
              <div className="mt-2 text-xs text-white/70 leading-relaxed">
                Chúng tôi đã gửi mã xác thực 6 chữ số đến địa chỉ:
                <div className="font-semibold text-violet-300 mt-1 text-sm">{email}</div>
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={onSubmitStep2}>
              <div>
                <label className="block text-center text-xs text-white/60 uppercase tracking-wider font-semibold mb-2">
                  Nhập mã OTP 6 chữ số
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full rounded-2xl border border-violet-500/40 bg-white/10 px-4 py-4 text-center text-3xl font-black tracking-[10px] text-white placeholder:text-white/20 outline-none focus:border-violet-400 focus:bg-white/15 shadow-inner transition-all"
                  placeholder="------"
                  autoFocus
                  required
                />
              </div>

              {infoMessage ? (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200 text-center font-medium">
                  {infoMessage}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200 text-center font-medium">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="primary-btn w-full justify-center py-3 text-sm font-bold shadow-lg shadow-violet-500/30"
                disabled={loading || otp.length < 6}
              >
                {loading ? "Đang xác nhận & tạo tài khoản..." : "Xác nhận OTP & Hoàn tất Đăng ký"}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                  }}
                  className="text-white/60 hover:text-white transition-all font-medium"
                >
                  ← Nhập lại Email khác
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-violet-300 hover:text-violet-200 transition-all font-semibold underline disabled:opacity-50"
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

