import { useEffect, useState } from "react";
import PageSection from "../../components/common/PageSection";
import GlassCard from "../../components/common/GlassCard";
import { Plus, Trash2, Save } from "lucide-react";
import { getSupportSettings, updateSupportSettings } from "../../services/settingApi";
import type { SupportSettings } from "../../services/settingApi";

export default function AdminSupport() {
  const [settings, setSettings] = useState<SupportSettings>({
    zalo: "",
    facebook: "",
    email: "",
    videos: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSupportSettings();
      setSettings(data || { zalo: "", facebook: "", email: "", videos: [] });
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể tải cấu hình hỗ trợ.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateSupportSettings(settings);
      setSuccessMsg(res.message || "Đã lưu cấu hình.");
    } catch (err: any) {
      setErrorMsg(err.message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddVideo = () => {
    setSettings(prev => ({
      ...prev,
      videos: [
        ...(prev.videos || []),
        { id: Date.now(), title: "", description: "", link: "" }
      ]
    }));
  };

  const handleRemoveVideo = (id: number) => {
    setSettings(prev => ({
      ...prev,
      videos: (prev.videos || []).filter(v => v.id !== id)
    }));
  };

  const handleUpdateVideo = (id: number, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      videos: (prev.videos || []).map(v => v.id === id ? { ...v, [field]: value } : v)
    }));
  };

  if (loading) {
    return <div className="text-white text-center p-10">Đang tải cấu hình...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      <PageSection
        title="Quản lý trang Hỗ trợ"
        subtitle="Cập nhật các liên kết liên hệ và video hướng dẫn."
      />

      <GlassCard title="Liên hệ trực tiếp">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Link Zalo</label>
            <input
              type="text"
              value={settings.zalo || ""}
              onChange={(e) => setSettings({ ...settings, zalo: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="Ví dụ: https://zalo.me/0866984097"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Link Facebook</label>
            <input
              type="text"
              value={settings.facebook || ""}
              onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="Ví dụ: https://facebook.com/groups/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email Hỗ trợ</label>
            <input
              type="text"
              value={settings.email || ""}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-violet-500 focus:outline-none"
              placeholder="Ví dụ: support@origind.id.vn"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Video hướng dẫn">
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleAddVideo}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            <Plus size={14} /> Thêm Video
          </button>
        </div>
        <div className="space-y-4">
          {(!settings.videos || settings.videos.length === 0) && (
            <div className="text-white/50 text-sm italic py-4">Chưa có video nào. Bấm "Thêm Video" để bắt đầu.</div>
          )}
          {settings.videos?.map((vid) => (
            <div key={vid.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 pr-12">
              <button
                onClick={() => handleRemoveVideo(vid.id)}
                className="absolute right-3 top-3 p-2 text-white/40 hover:text-red-400 transition"
                title="Xóa Video"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-white/60 mb-1">Tiêu đề Video</label>
                  <input
                    type="text"
                    value={vid.title}
                    onChange={(e) => handleUpdateVideo(vid.id, 'title', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-white/60 mb-1">Mô tả ngắn</label>
                  <input
                    type="text"
                    value={vid.description}
                    onChange={(e) => handleUpdateVideo(vid.id, 'description', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-white/60 mb-1">Link (URL)</label>
                  <input
                    type="text"
                    value={vid.link}
                    onChange={(e) => handleUpdateVideo(vid.id, 'link', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {successMsg && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-transparent px-6 py-3 font-bold text-emerald-400 transition-all hover:bg-emerald-500/10 hover:text-emerald-300 disabled:opacity-70 disabled:hover:bg-transparent"
        >
          <Save size={18} />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
