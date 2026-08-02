import { useState, useEffect } from "react";
import { getPopupSettings, updatePopupSettings } from "../../services/settingApi";
import type { PopupSettings } from "../../services/settingApi";
import GlassCard from "../../components/common/GlassCard";

export default function AdminPopup() {
  const [settings, setSettings] = useState<PopupSettings>({
    isActive: false,
    title: "",
    content: "",
    hideDurationHours: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getPopupSettings();
      setSettings(data);
    } catch (err: any) {
      setError("Không thể tải cấu hình thông báo. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updatePopupSettings(settings);
      setSuccess("Lưu cấu hình thông báo thành công!");
      // clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã xảy ra lỗi khi lưu thông báo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-white/70 animate-pulse">Đang tải cấu hình thông báo...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Quản lý Thông báo (Popup)</h1>
        <p className="mt-2 text-white/60">
          Cài đặt bảng thông báo hiển thị cho người dùng khi truy cập vào website.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
          {success}
        </div>
      )}

      <GlassCard>
        <div className="p-8 relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Trạng thái Bảng thông báo</h3>
              <p className="text-sm text-white/50 mt-1">Bật để hiển thị thông báo ngoài giao diện</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={settings.isActive}
                onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
              />
              <div className="peer h-7 w-14 rounded-full bg-slate-700/50 after:absolute after:left-[4px] after:top-[4px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-violet-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none border border-white/10" />
            </label>
          </div>

          <div className="pt-2">
            <label className="mb-2 block text-sm font-semibold text-white/80">Tiêu đề thông báo</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="VD: Thông báo bảo trì, Sự kiện đặc biệt..."
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">Nội dung thông báo</label>
            <textarea
              rows={6}
              value={settings.content}
              onChange={(e) => setSettings({ ...settings, content: e.target.value })}
              placeholder="Nhập nội dung chi tiết. Có thể xuống dòng để định dạng..."
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">Thời gian tự động tắt khi người dùng bấm nút Đóng (Giờ)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={settings.hideDurationHours || 0}
              onChange={(e) => setSettings({ ...settings, hideDurationHours: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <p className="text-xs text-white/50 mt-1">Khi người dùng bấm "Tắt trong X giờ", bảng thông báo sẽ không hiển thị lại cho họ trong khoảng thời gian này (Tính bằng Giờ).</p>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`primary-btn px-6 py-3 font-semibold ${
                saving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Đang lưu..." : "Lưu cài đặt thông báo"}
            </button>
          </div>
        </div>
        </div>
      </GlassCard>
    </div>
  );
}
