import { useState, useEffect } from "react";
import { getMaintenanceSettings, updateMaintenanceSettings } from "../../services/settingApi";
import type { MaintenanceSettings } from "../../services/settingApi";
import GlassCard from "../../components/common/GlassCard";

export default function AdminMaintenance() {
  const [settings, setSettings] = useState<MaintenanceSettings>({
    maintenance_mode: false,
    maintenance_message: "Hệ thống đang được bảo trì. Vui lòng quay lại sau."
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pendingMode, setPendingMode] = useState(false);

  useEffect(() => {
    fetchMaintenanceSettings();
  }, []);

  const fetchMaintenanceSettings = async () => {
    try {
      setLoading(true);
      const data = await getMaintenanceSettings();
      setSettings(data);
    } catch (err) {
      // ignore init error
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = (newMode: boolean) => {
    setPendingMode(newMode);
    setShowConfirm(true);
    setConfirmText("");
  };

  const handleConfirmToggle = async () => {
    if (confirmText !== "XÁC NHẬN") return;
    
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      const newSettings = { ...settings, maintenance_mode: pendingMode };
      await updateMaintenanceSettings(newSettings);
      
      setSettings(newSettings);
      setSuccess(pendingMode ? "Đã BẬT chế độ bảo trì toàn hệ thống!" : "Đã TẮT chế độ bảo trì, hệ thống hoạt động bình thường!");
      setShowConfirm(false);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã xảy ra lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMessage = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updateMaintenanceSettings(settings);
      setSuccess("Đã lưu thông báo bảo trì thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã xảy ra lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-white/70 animate-pulse">Đang tải cấu hình bảo trì...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Chế độ Bảo trì Hệ thống</h1>
        <p className="mt-2 text-white/60">
          Khi bật, toàn bộ user sẽ bị khóa, ngoại trừ các Landing Page đã tạo vẫn truy cập được.
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
          {/* Red Glow effect background for danger zone */}
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-rose-600/10 blur-[100px] pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-6">
              <div>
                <h3 className="text-xl font-bold text-rose-400">Trạng thái</h3>
                <p className="text-sm text-white/50 mt-1">Hệ thống đang hoạt động hay đang được nâng cấp?</p>
              </div>
              
              <button
                onClick={() => handleToggleClick(!settings.maintenance_mode)}
                className={`px-4 py-2 rounded-lg font-bold border transition ${
                  settings.maintenance_mode 
                    ? "bg-rose-500/20 border-rose-500 text-rose-400 hover:bg-rose-500/30" 
                    : "bg-transparent border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40"
                }`}
              >
                {settings.maintenance_mode ? "ĐANG BẢO TRÌ (TẮT)" : "BẬT BẢO TRÌ"}
              </button>
            </div>

            <div className="pt-2">
              <label className="mb-2 block text-sm font-semibold text-white/80">Nội dung thông báo cho người dùng</label>
              <input
                type="text"
                value={settings.maintenance_message}
                onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                placeholder="VD: Hệ thống đang nâng cấp, dự kiến hoàn thành lúc 22:30..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/30 transition focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={handleSaveMessage}
                disabled={saving}
                className="ghost-btn !border-white/20 !text-white/80 hover:!bg-white/10 px-6 py-2"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                }}
              >
                {saving ? "Đang lưu..." : "Lưu câu thông báo"}
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-rose-500/30 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">
              Xác nhận {pendingMode ? "BẬT" : "TẮT"} Bảo trì
            </h3>
            <p className="text-white/70 text-sm mb-6">
              Bạn đang chuẩn bị {pendingMode ? "đóng" : "mở"} toàn bộ hệ thống. 
              Vui lòng gõ chữ <strong className="text-rose-400">XÁC NHẬN</strong> vào ô bên dưới để tiếp tục.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="XÁC NHẬN"
              className="w-full rounded-xl border border-rose-500/50 bg-black/30 px-4 py-3 text-white placeholder-white/30 outline-none mb-6 text-center tracking-widest font-bold"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/10"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmToggle}
                disabled={confirmText !== "XÁC NHẬN" || saving}
                className={`px-4 py-2 rounded-lg border font-bold transition ${
                  confirmText === "XÁC NHẬN" && !saving
                    ? "border-rose-500 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20" 
                    : "border-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                {saving ? "Đang xử lý..." : "Đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
