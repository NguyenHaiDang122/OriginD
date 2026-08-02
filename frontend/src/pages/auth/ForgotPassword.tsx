import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendForgotPasswordOtpApi, resetPasswordApi } from "../../services/authApi";
import SEO from "../../components/common/SEO";
import { isAxiosError } from "axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Countdown for resend
  const [countdown, setCountdown] = useState(0);
  const [otpLifespan, setOtpLifespan] = useState(0);

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => window.clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    let timer: number;
    if (otpLifespan > 0) {
      timer = window.setInterval(() => setOtpLifespan((c) => c - 1), 1000);
    }
    return () => window.clearInterval(timer);
  }, [otpLifespan]);

  // Countdown for auto-redirect on success
  const [redirectTimer, setRedirectTimer] = useState(3);

  useEffect(() => {
    let timer: number;
    if (step === 3 && redirectTimer > 0) {
      timer = window.setInterval(() => setRedirectTimer((c) => c - 1), 1000);
    } else if (step === 3 && redirectTimer === 0) {
      navigate("/login");
    }
    return () => window.clearInterval(timer);
  }, [step, redirectTimer, navigate]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }
    
    setError(null);
    setLoading(true);
    try {
      await sendForgotPasswordOtpApi(email);
      setStep(2);
      setCountdown(60);
      setOtpLifespan(300);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Có lỗi xảy ra khi gửi OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await resetPasswordApi({
        email,
        otp,
        password,
        password_confirmation: passwordConfirm,
      });
      setStep(3);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.errors?.otp) {
        setError(err.response.data.errors.otp[0]);
      } else if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Có lỗi xảy ra khi đặt lại mật khẩu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Khôi phục mật khẩu" />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md glass-panel-strong p-6 sm:p-8">
          <div className="text-center">
            <div className="text-3xl font-black tracking-tight text-white/95">
              OriginD
            </div>
            <div className="mt-2 text-sm text-white/60">
              {step === 1 && "Khôi phục mật khẩu"}
              {step === 2 && "Nhập mã xác nhận"}
              {step === 3 && "Thành công"}
            </div>
          </div>

          {step === 1 && (
            <form className="mt-6 space-y-4" onSubmit={handleSendOtp}>
              <div>
                <label className="text-sm text-white/70">Email tài khoản</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                  placeholder="Nhập email của bạn..."
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button type="submit" className="primary-btn w-full" disabled={loading}>
                {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
              </button>

              <div className="text-center text-sm text-white/60 pt-2">
                Nhớ mật khẩu rồi?{" "}
                <Link to="/login" className="text-white/90 font-semibold hover:underline">
                  Đăng nhập
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
              <div className="text-sm text-white/70 text-center mb-4 bg-white/5 p-3 rounded-xl border border-white/10">
                Mã OTP đã được gửi đến email:<br />
                <strong className="text-white text-base block my-1">{email}</strong>
                {otpLifespan > 0 ? (
                  <span className="text-violet-300 font-medium">Mã OTP có hiệu lực trong {Math.floor(otpLifespan / 60)}:{String(otpLifespan % 60).padStart(2, '0')}</span>
                ) : (
                  <span className="text-rose-400 font-medium">Mã OTP đã hết hạn</span>
                )}
              </div>

              <div>
                <label className="text-sm text-white/70">Mã OTP (6 số)</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30 text-center tracking-widest text-lg"
                  placeholder="000000"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Mật khẩu mới</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                  placeholder="Mật khẩu ít nhất 6 ký tự"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button type="submit" className="primary-btn w-full" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>

              <div className="text-center text-sm text-white/60 pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={countdown > 0 || loading}
                  className="text-white/90 font-semibold hover:underline disabled:opacity-50 disabled:hover:no-underline"
                >
                  {countdown > 0 ? `Gửi lại mã OTP sau ${countdown}s` : "Gửi lại mã OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-white/40 hover:text-white/80 transition-colors"
                >
                  Đổi email khác
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="mt-6 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-3xl">
                ✓
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">Đổi mật khẩu thành công!</h2>
              <p className="text-sm text-white/60 mb-8 leading-relaxed">
                Mật khẩu của bạn đã được cập nhật an toàn. Mọi phiên đăng nhập cũ trên các thiết bị khác đã bị đăng xuất tự động.
              </p>
              
              <button
                onClick={() => navigate("/login")}
                className="primary-btn w-full mb-4"
              >
                Đăng nhập ngay ({redirectTimer}s)
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
