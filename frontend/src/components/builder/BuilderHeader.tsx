import { useState } from "react";
import type {
  DeviceMode,
} from "../../types/builder";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Save,
  Eye,
  Rocket,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Loader2,
} from "lucide-react";

interface BuilderHeaderProps {
  title: string;
  onUpdateTitle: (newTitle: string) => void;
  status: 'draft' | 'published';
  slug: string;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onTogglePreview: () => void;
  isPreview: boolean;
  onOpenPublishModal: () => void;
  deviceMode: DeviceMode;
  onChangeDeviceMode: (mode: DeviceMode) => void;
  onBack: () => void;
}

export default function BuilderHeader({
  title,
  onUpdateTitle,
  status,
  slug,
  saveStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onTogglePreview,
  isPreview,
  onOpenPublishModal,
  deviceMode,
  onChangeDeviceMode,
  onBack,
}: BuilderHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (localTitle.trim()) {
      onUpdateTitle(localTitle.trim());
    } else {
      setLocalTitle(title);
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-white/10 px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
          title="Quay lại danh sách Website"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Editable Title */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="bg-white/10 border border-indigo-500 rounded px-2 py-0.5 text-sm font-bold text-white focus:outline-none"
            />
          ) : (
            <span
              onClick={() => {
                setLocalTitle(title);
                setIsEditingTitle(true);
              }}
              className="text-sm font-bold text-white hover:text-indigo-300 cursor-pointer transition flex items-center gap-1.5"
              title="Bấm để đổi tên website"
            >
              {title || "Website chưa đặt tên"}
            </span>
          )}

          {/* Status Badge */}
          {status === 'published' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Đã xuất bản
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/60">
              Bản nháp
            </span>
          )}

          <span className="text-[11px] text-white/40 font-mono hidden lg:inline truncate max-w-[120px]">
            /{slug}
          </span>
        </div>
      </div>

      {/* Center: Device Switcher */}
      <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => onChangeDeviceMode('desktop')}
          className={`p-1.5 rounded-lg transition ${
            deviceMode === 'desktop'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title="Xem chế độ Máy tính (Desktop)"
        >
          <Monitor size={16} />
        </button>

        <button
          type="button"
          onClick={() => onChangeDeviceMode('tablet')}
          className={`p-1.5 rounded-lg transition ${
            deviceMode === 'tablet'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title="Xem chế độ Máy tính bảng (Tablet - 768px)"
        >
          <Tablet size={16} />
        </button>

        <button
          type="button"
          onClick={() => onChangeDeviceMode('mobile')}
          className={`p-1.5 rounded-lg transition ${
            deviceMode === 'mobile'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
          title="Xem chế độ Điện thoại (Mobile - 375px)"
        >
          <Smartphone size={16} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-white/10">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition ${
              canUndo
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-white/20 cursor-not-allowed'
            }`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition ${
              canRedo
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-white/20 cursor-not-allowed'
            }`}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Auto-save Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 px-2 font-medium">
          {saveStatus === 'saving' ? (
            <>
              <Loader2 size={12} className="animate-spin text-indigo-400" />
              <span>Đang lưu...</span>
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400/90">Đã lưu</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400/90">Chưa lưu</span>
            </>
          )}
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition border border-white/10 shadow-sm"
          title="Lưu thiết kế ngay (Ctrl+S)"
        >
          <Save size={14} />
          <span className="hidden sm:inline">Lưu</span>
        </button>

        {/* Preview Button */}
        <button
          type="button"
          onClick={onTogglePreview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
            isPreview
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
              : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
          }`}
          title="Xem trước giao diện hoàn chỉnh"
        >
          <Eye size={14} />
          <span className="hidden sm:inline">{isPreview ? 'Thoát Xem Trước' : 'Xem Trước'}</span>
        </button>

        {/* Publish Button */}
        <button
          type="button"
          onClick={onOpenPublishModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition transform active:scale-95"
          title="Xuất bản website lên Internet"
        >
          <Rocket size={14} />
          <span>Xuất Bản</span>
        </button>
      </div>
    </header>
  );
}
