import { useState } from "react";
import type {
  BuilderElement,
  BuilderSiteSettings,
} from "../../types/builder";
import { uploadImage } from "../../services/uploadApi";
import { useAuthStore } from "../../store/authStore";
import { POPULAR_ICONS } from "./DynamicIcon";
import {
  Type,
  Palette,
  Layout,
  Sliders,
  Upload,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Settings,
  Move,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BuilderPropertiesPanelProps {
  selectedElement: BuilderElement | null;
  onUpdateElement: (id: string, updater: (el: BuilderElement) => BuilderElement) => void;
  siteSettings: BuilderSiteSettings;
  onUpdateSiteSettings: (settings: Partial<BuilderSiteSettings>) => void;
  dockPosition?: 'left' | 'right';
  onToggleDockPosition?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FONT_OPTIONS = [
  { label: 'Inter (Hiện đại)', value: 'Inter, sans-serif' },
  { label: 'Roboto (Chuẩn)', value: 'Roboto, sans-serif' },
  { label: 'Poppins (Trẻ trung)', value: 'Poppins, sans-serif' },
  { label: 'Montserrat (Thương hiệu)', value: 'Montserrat, sans-serif' },
  { label: 'Playfair Display (Sang trọng)', value: '"Playfair Display", serif' },
  { label: 'Open Sans (Thân thiện)', value: '"Open Sans", sans-serif' },
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
];

const COLOR_PRESETS = [
  '#ffffff',
  '#f8fafc',
  '#94a3b8',
  '#64748b',
  '#0f172a',
  '#090d16',
  '#6366f1',
  '#818cf8',
  '#ec4899',
  '#f43f5e',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
];

export default function BuilderPropertiesPanel({
  selectedElement,
  onUpdateElement,
  siteSettings,
  onUpdateSiteSettings,
  dockPosition = 'right',
  onToggleDockPosition,
  isCollapsed = false,
  onToggleCollapse,
}: BuilderPropertiesPanelProps) {
  const token = useAuthStore((s) => s.token);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout' | 'border'>('content');
  const [isUploading, setIsUploading] = useState(false);

  if (isCollapsed) {
    return (
      <div
        className={`fixed ${dockPosition === 'left' ? 'left-2' : 'right-2'} top-20 z-40 bg-slate-900/90 border border-white/20 p-2 rounded-2xl shadow-2xl backdrop-blur-md cursor-pointer hover:bg-slate-800 transition`}
        onClick={onToggleCollapse}
        title="Mở rộng bảng thuộc tính"
      >
        <button
          type="button"
          className="flex flex-col items-center gap-1.5 text-xs text-indigo-400 font-bold p-1"
        >
          {dockPosition === 'left' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span className="text-[10px] [writing-mode:vertical-lr] tracking-wider py-1 text-white/80">
            Thuộc tính
          </span>
        </button>
      </div>
    );
  }

  if (!selectedElement) {
    return (
      <aside className={`w-80 bg-slate-900/90 ${dockPosition === 'left' ? 'border-r' : 'border-l'} border-white/10 flex flex-col h-full shrink-0 select-none z-20 backdrop-blur-md`}>
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-indigo-400" />
            <h2 className="text-xs font-bold text-white">Cài đặt Website Chung</h2>
          </div>
          <div className="flex items-center gap-1">
            {onToggleDockPosition && (
              <button
                type="button"
                onClick={onToggleDockPosition}
                className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition"
                title={dockPosition === 'left' ? "Chuyển sang bên Phải" : "Chuyển sang bên Trái"}
              >
                <ArrowLeftRight size={14} />
              </button>
            )}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition"
                title="Thu gọn bảng"
              >
                {dockPosition === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          <div className="text-xs text-white/50 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
            💡 Chọn một thành phần trên Canvas để tùy chỉnh nội dung, màu sắc, font chữ và kích thước của phần tử đó.
          </div>

          {/* Meta Title */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Tiêu đề trang (Meta Title)
            </label>
            <input
              type="text"
              value={siteSettings.metaTitle || ''}
              onChange={(e) => onUpdateSiteSettings({ metaTitle: e.target.value })}
              placeholder="VD: Trang chủ Doanh nghiệp..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Mô tả SEO (Meta Description)
            </label>
            <textarea
              rows={3}
              value={siteSettings.metaDescription || ''}
              onChange={(e) => onUpdateSiteSettings({ metaDescription: e.target.value })}
              placeholder="Mô tả website cho công cụ tìm kiếm Google..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Global Font Family */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Font chữ mặc định toàn trang
            </label>
            <select
              value={siteSettings.fontFamily || 'Inter, sans-serif'}
              onChange={(e) => onUpdateSiteSettings({ fontFamily: e.target.value })}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Background color of page */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Màu nền chung của trang
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={siteSettings.backgroundColor || '#090d16'}
                onChange={(e) => onUpdateSiteSettings({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={siteSettings.backgroundColor || '#090d16'}
                onChange={(e) => onUpdateSiteSettings({ backgroundColor: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const { id, type, props, styles } = selectedElement;

  const updateProp = (key: string, val: any) => {
    onUpdateElement(id, (el) => ({
      ...el,
      props: {
        ...el.props,
        [key]: val,
      },
    }));
  };

  const updateStyle = (key: keyof typeof styles, val: any) => {
    onUpdateElement(id, (el) => ({
      ...el,
      styles: {
        ...el.styles,
        [key]: val,
      },
    }));
  };

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImage(file, token || "");
      if (res?.url) {
        updateProp('src', res.url);
      }
    } catch (err: any) {
      alert("Tải ảnh thất bại: " + (err?.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <aside className={`w-80 bg-slate-900/90 ${dockPosition === 'left' ? 'border-r' : 'border-l'} border-white/10 flex flex-col h-full shrink-0 select-none z-20 backdrop-blur-md`}>
      {/* Header with Type & Name */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {type}
          </span>
          <span className="text-xs font-semibold text-white/90 truncate max-w-[130px]">
            {selectedElement.name || type}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onToggleDockPosition && (
            <button
              type="button"
              onClick={onToggleDockPosition}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
              title={dockPosition === 'left' ? "Chuyển sang bên Phải" : "Chuyển sang bên Trái"}
            >
              <ArrowLeftRight size={14} />
            </button>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
              title="Thu gọn bảng"
            >
              {dockPosition === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-white/10 px-2 pt-2 text-xs">
        {[
          { id: 'content', label: 'Nội dung', icon: Type },
          { id: 'style', label: 'Chữ & Màu', icon: Palette },
          { id: 'layout', label: 'Bố cục', icon: Layout },
          { id: 'border', label: 'Viền & Bo', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 pb-2 flex flex-col items-center gap-1 border-b-2 font-medium transition ${
                isActive
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
            >
              <Icon size={14} />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* ================= CONTENT TAB ================= */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Heading specific */}
            {type === 'heading' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Thẻ tiêu đề
                  </label>
                  <div className="grid grid-cols-6 gap-1">
                    {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => updateProp('level', lvl)}
                        className={`py-1 rounded text-xs font-bold uppercase transition ${
                          props.level === lvl
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Nội dung tiêu đề
                  </label>
                  <textarea
                    rows={2}
                    value={props.content || ''}
                    onChange={(e) => updateProp('content', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>
              </>
            )}

            {/* Text specific */}
            {type === 'text' && (
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Nội dung đoạn văn
                </label>
                <textarea
                  rows={6}
                  value={props.content || ''}
                  onChange={(e) => updateProp('content', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition resize-y"
                />
              </div>
            )}

            {/* Image specific */}
            {type === 'image' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Đường dẫn hình ảnh (URL)
                  </label>
                  <input
                    type="text"
                    value={props.src || ''}
                    onChange={(e) => updateProp('src', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Hoặc tải ảnh từ máy tính
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer text-xs text-white/70 hover:text-white transition">
                    <Upload size={14} />
                    <span>{isUploading ? 'Đang tải lên...' : 'Chọn file ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Mô tả ảnh (Alt)
                  </label>
                  <input
                    type="text"
                    value={props.alt || ''}
                    onChange={(e) => updateProp('alt', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </>
            )}

            {/* Video specific */}
            {type === 'video' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Đường dẫn Video (YouTube, Vimeo, MP4)
                  </label>
                  <input
                    type="text"
                    value={props.url || ''}
                    onChange={(e) => updateProp('url', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="flex items-center gap-4 text-xs text-white/80">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={props.controls !== false}
                      onChange={(e) => updateProp('controls', e.target.checked)}
                      className="rounded bg-white/10 text-indigo-600 focus:ring-0"
                    />
                    <span>Thanh điều khiển</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={props.autoplay === true}
                      onChange={(e) => updateProp('autoplay', e.target.checked)}
                      className="rounded bg-white/10 text-indigo-600 focus:ring-0"
                    />
                    <span>Tự phát</span>
                  </label>
                </div>
              </>
            )}

            {/* Button specific */}
            {type === 'button' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Chữ hiển thị trên Nút
                  </label>
                  <input
                    type="text"
                    value={props.text || ''}
                    onChange={(e) => updateProp('text', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Đường dẫn liên kết (URL / Hash)
                  </label>
                  <div className="relative">
                    <Link size={14} className="absolute left-2.5 top-2.5 text-white/40" />
                    <input
                      type="text"
                      value={props.url || ''}
                      onChange={(e) => updateProp('url', e.target.value)}
                      placeholder="https://... hoặc #features"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Cách mở liên kết
                  </label>
                  <select
                    value={props.target || '_self'}
                    onChange={(e) => updateProp('target', e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="_self">Cùng một tab (_self)</option>
                    <option value="_blank">Mở trong tab mới (_blank)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Biểu tượng kèm theo
                  </label>
                  <select
                    value={props.icon || ''}
                    onChange={(e) => updateProp('icon', e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">Không có icon</option>
                    {POPULAR_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Icon specific */}
            {type === 'icon' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Chọn Biểu Tượng
                  </label>
                  <select
                    value={props.iconName || 'Sparkles'}
                    onChange={(e) => updateProp('iconName', e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-white"
                  >
                    {POPULAR_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-white/80 mb-1.5">
                    <span>Kích thước icon</span>
                    <span>{props.size || 32}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="96"
                    value={props.size || 32}
                    onChange={(e) => updateProp('size', Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Divider specific */}
            {type === 'divider' && (
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Kiểu đường kẻ
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['solid', 'dashed', 'dotted'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateProp('style', st)}
                      className={`py-1.5 rounded text-xs capitalize transition ${
                        (props.style || 'solid') === st
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Header specific */}
            {type === 'header' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Tên Logo / Thương hiệu
                  </label>
                  <input
                    type="text"
                    value={props.logoText || ''}
                    onChange={(e) => updateProp('logoText', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Nút kêu gọi (CTA)
                  </label>
                  <input
                    type="text"
                    value={props.ctaText || ''}
                    onChange={(e) => updateProp('ctaText', e.target.value)}
                    placeholder="VD: Bắt đầu"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white mb-2"
                  />
                  <input
                    type="text"
                    value={props.ctaUrl || ''}
                    onChange={(e) => updateProp('ctaUrl', e.target.value)}
                    placeholder="Liên kết CTA (#contact)"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </>
            )}

            {/* Banner specific */}
            {type === 'banner' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Huy hiệu (Badge)
                  </label>
                  <input
                    type="text"
                    value={props.badge || ''}
                    onChange={(e) => updateProp('badge', e.target.value)}
                    placeholder="VD: ⚡ Ra mắt tính năng mới"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Tiêu đề chính
                  </label>
                  <textarea
                    rows={2}
                    value={props.title || ''}
                    onChange={(e) => updateProp('title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Phụ đề
                  </label>
                  <textarea
                    rows={3}
                    value={props.subtitle || ''}
                    onChange={(e) => updateProp('subtitle', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Nút bấm Banner
                  </label>
                  <input
                    type="text"
                    value={props.buttonText || ''}
                    onChange={(e) => updateProp('buttonText', e.target.value)}
                    placeholder="Chữ trên nút"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white mb-2"
                  />
                  <input
                    type="text"
                    value={props.buttonUrl || ''}
                    onChange={(e) => updateProp('buttonUrl', e.target.value)}
                    placeholder="URL nút"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </>
            )}

            {/* Footer specific */}
            {type === 'footer' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Mô tả ngắn
                  </label>
                  <textarea
                    rows={2}
                    value={props.description || ''}
                    onChange={(e) => updateProp('description', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Bản quyền (Copyright)
                  </label>
                  <input
                    type="text"
                    value={props.copyright || ''}
                    onChange={(e) => updateProp('copyright', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= STYLE & COLOR TAB ================= */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Text Color */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Màu chữ (Text Color)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={styles.color || '#ffffff'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={styles.color || '#ffffff'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              {/* Color Presets */}
              <div className="grid grid-cols-8 gap-1.5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateStyle('color', c)}
                    style={{ backgroundColor: c }}
                    className="w-6 h-6 rounded border border-white/20 transition hover:scale-110"
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Màu nền (Background Color)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={styles.backgroundColor || '#000000'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={styles.backgroundColor || 'transparent'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => updateStyle('backgroundColor', 'transparent')}
                  className="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded text-[11px] text-white/70"
                  title="Trong suốt"
                >
                  Xóa
                </button>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-8 gap-1.5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateStyle('backgroundColor', c)}
                    style={{ backgroundColor: c }}
                    className="w-6 h-6 rounded border border-white/20 transition hover:scale-110"
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Phông chữ (Font Family)
              </label>
              <select
                value={styles.fontFamily || ''}
                onChange={(e) => updateStyle('fontFamily', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="">Kế thừa từ trang</option>
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex justify-between text-xs text-white/80 mb-1.5">
                <span>Cỡ chữ (Font Size)</span>
                <span>{styles.fontSize || '16px'}</span>
              </div>
              <input
                type="range"
                min="12"
                max="72"
                value={parseInt(styles.fontSize || '16', 10)}
                onChange={(e) => updateStyle('fontSize', `${e.target.value}px`)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Căn lề chữ (Text Align)
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'left', icon: AlignLeft },
                  { id: 'center', icon: AlignCenter },
                  { id: 'right', icon: AlignRight },
                  { id: 'justify', icon: AlignJustify },
                ].map((al) => {
                  const Icon = al.icon;
                  const isCurrent = (styles.textAlign || 'left') === al.id;
                  return (
                    <button
                      key={al.id}
                      type="button"
                      onClick={() => updateStyle('textAlign', al.id)}
                      className={`py-1.5 flex items-center justify-center rounded transition ${
                        isCurrent
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Weight */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Độ đậm (Font Weight)
              </label>
              <select
                value={styles.fontWeight || 'normal'}
                onChange={(e) => updateStyle('fontWeight', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="300">Light (300)</option>
                <option value="normal">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">SemiBold (600)</option>
                <option value="bold">Bold (700)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>
          </div>
        )}

        {/* ================= LAYOUT & SIZE TAB ================= */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            {/* Positioning Mode (Freeform vs Flow) */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Move size={14} className="text-indigo-400" />
                  <span>Chế độ vị trí</span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    styles.position === 'absolute'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {styles.position === 'absolute' ? '🎯 Tự do (Free)' : '🧱 Khung chuẩn (Flow)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateStyle('position', 'relative');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition text-center ${
                    styles.position !== 'absolute'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Khung chuẩn
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateStyle('position', 'absolute');
                    if (!styles.left) updateStyle('left', '40px');
                    if (!styles.top) updateStyle('top', '40px');
                    if (!styles.zIndex) updateStyle('zIndex', 10);
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition text-center ${
                    styles.position === 'absolute'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Tự do bất kỳ đâu
                </button>
              </div>

              {styles.position === 'absolute' && (
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <p className="text-[11px] text-indigo-300 leading-relaxed bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20">
                    💡 <b>Mẹo đỉnh cao:</b> Bạn có thể <b>nhấn chuột phải vào phần tử</b> trên Canvas để rê tự do đến bất kỳ vị trí nào, rồi bấm <b>"Ghim tại đây"</b> (hoặc nhấn phím Enter / Click chuột). Ngoài ra có thể nhập trực tiếp tọa độ X, Y bên dưới:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-white/60 block mb-1">Tọa độ X (Trái / Left)</span>
                      <input
                        type="text"
                        value={styles.left || '40px'}
                        onChange={(e) => updateStyle('left', e.target.value)}
                        placeholder="VD: 50px, 20%"
                        className="w-full bg-slate-800 border border-white/10 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/60 block mb-1">Tọa độ Y (Trên / Top)</span>
                      <input
                        type="text"
                        value={styles.top || '40px'}
                        onChange={(e) => updateStyle('top', e.target.value)}
                        placeholder="VD: 50px, 10%"
                        className="w-full bg-slate-800 border border-white/10 rounded p-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-white/80 mb-1">
                      <span>Thứ tự lớp hiển thị (Z-Index)</span>
                      <span className="font-mono text-indigo-300">{styles.zIndex || 10}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={Number(styles.zIndex) || 10}
                      onChange={(e) => updateStyle('zIndex', Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Width & Height */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Chiều rộng (Width)
                </label>
                <input
                  type="text"
                  value={styles.width || ''}
                  onChange={(e) => updateStyle('width', e.target.value)}
                  placeholder="100%, 600px..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Chiều cao (Height)
                </label>
                <input
                  type="text"
                  value={styles.height || ''}
                  onChange={(e) => updateStyle('height', e.target.value)}
                  placeholder="auto, 400px..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Max-Width */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Chiều rộng tối đa (Max Width)
              </label>
              <input
                type="text"
                value={styles.maxWidth || ''}
                onChange={(e) => updateStyle('maxWidth', e.target.value)}
                placeholder="VD: 1200px, 800px..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
              />
            </div>

            {/* Padding Controls */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Đệm bên trong (Padding)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-white/50 block mb-1">Trên (Top)</span>
                  <input
                    type="text"
                    value={styles.paddingTop || ''}
                    onChange={(e) => updateStyle('paddingTop', e.target.value)}
                    placeholder="VD: 24px"
                    className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block mb-1">Dưới (Bottom)</span>
                  <input
                    type="text"
                    value={styles.paddingBottom || ''}
                    onChange={(e) => updateStyle('paddingBottom', e.target.value)}
                    placeholder="VD: 24px"
                    className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block mb-1">Trái (Left)</span>
                  <input
                    type="text"
                    value={styles.paddingLeft || ''}
                    onChange={(e) => updateStyle('paddingLeft', e.target.value)}
                    placeholder="VD: 16px"
                    className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block mb-1">Phải (Right)</span>
                  <input
                    type="text"
                    value={styles.paddingRight || ''}
                    onChange={(e) => updateStyle('paddingRight', e.target.value)}
                    placeholder="VD: 16px"
                    className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Margin Controls */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Khoảng cách ngoài (Margin)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-white/50 block mb-1">Trên (Top)</span>
                  <input
                    type="text"
                    value={styles.marginTop || ''}
                    onChange={(e) => updateStyle('marginTop', e.target.value)}
                    placeholder="VD: 16px"
                    className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block mb-1">Dưới (Bottom)</span>
                  <input
                    type="text"
                    value={styles.marginBottom || ''}
                    onChange={(e) => updateStyle('marginBottom', e.target.value)}
                    placeholder="VD: 16px"
                    className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Container / Section Flex Direction */}
            {(type === 'container' || type === 'section') && (
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Bố cục Flex (Direction)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateStyle('flexDirection', 'column')}
                    className={`py-1.5 text-xs rounded transition ${
                      (styles.flexDirection || 'column') === 'column'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Dọc (Column)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStyle('flexDirection', 'row')}
                    className={`py-1.5 text-xs rounded transition ${
                      styles.flexDirection === 'row'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Ngang (Row)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= BORDER & EFFECTS TAB ================= */}
        {activeTab === 'border' && (
          <div className="space-y-4">
            {/* Border Radius */}
            <div>
              <div className="flex justify-between text-xs text-white/80 mb-1.5">
                <span>Bo góc (Border Radius)</span>
                <span>{styles.borderRadius || '0px'}</span>
              </div>
              <input
                type="range"
                min="0"
                max="48"
                value={parseInt(styles.borderRadius || '0', 10)}
                onChange={(e) => updateStyle('borderRadius', `${e.target.value}px`)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Border Width & Style */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Đường viền (Border)
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <span className="text-[10px] text-white/50 block mb-1">Độ dày viền</span>
                  <input
                    type="text"
                    value={styles.borderWidth || ''}
                    onChange={(e) => updateStyle('borderWidth', e.target.value)}
                    placeholder="VD: 1px, 2px"
                    className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-white text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block mb-1">Kiểu viền</span>
                  <select
                    value={styles.borderStyle || 'none'}
                    onChange={(e) => updateStyle('borderStyle', e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded p-1.5 text-white text-xs"
                  >
                    <option value="none">Không viền (None)</option>
                    <option value="solid">Nét liền (Solid)</option>
                    <option value="dashed">Nét đứt (Dashed)</option>
                    <option value="dotted">Chấm bi (Dotted)</option>
                  </select>
                </div>
              </div>

              {/* Border Color */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.borderColor || '#ffffff'}
                  onChange={(e) => updateStyle('borderColor', e.target.value)}
                  className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={styles.borderColor || 'rgba(255, 255, 255, 0.1)'}
                  onChange={(e) => updateStyle('borderColor', e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Box Shadow */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                Đổ bóng (Box Shadow)
              </label>
              <select
                value={styles.boxShadow || 'none'}
                onChange={(e) => updateStyle('boxShadow', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="none">Không bóng (None)</option>
                <option value="0 1px 3px 0 rgba(0, 0, 0, 0.1)">Nhẹ (Subtle)</option>
                <option value="0 10px 15px -3px rgba(0, 0, 0, 0.3)">Vừa (Medium)</option>
                <option value="0 25px 50px -12px rgba(0, 0, 0, 0.5)">Lớn (Large)</option>
                <option value="0 10px 30px -5px rgba(99, 102, 241, 0.4)">Phát sáng Indigo (Glow)</option>
              </select>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between text-xs text-white/80 mb-1.5">
                <span>Độ trong suốt (Opacity)</span>
                <span>{styles.opacity ? `${Math.round(Number(styles.opacity) * 100)}%` : '100%'}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={styles.opacity ? Number(styles.opacity) * 100 : 100}
                onChange={(e) => updateStyle('opacity', `${Number(e.target.value) / 100}`)}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
