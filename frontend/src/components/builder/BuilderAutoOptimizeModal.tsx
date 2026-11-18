import { useState } from "react";
import type {
  BuilderElement,
  BuilderSiteSettings,
  DesignThemeId,
  OptimizeOptions,
  OptimizeReport,
} from "../../types/builder";
import { DESIGN_THEMES, optimizeWebsite } from "../../utils/builderOptimizer";
import {
  Sparkles,
  Check,
  Smartphone,
  Type,
  Layout,
  Palette,
  ShieldCheck,
  X,
  Sliders,
  CheckCircle2,
} from "lucide-react";

interface BuilderAutoOptimizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: BuilderElement[];
  siteSettings: BuilderSiteSettings;
  onApplyOptimization: (
    newElements: BuilderElement[],
    newSettings: BuilderSiteSettings,
    report: OptimizeReport
  ) => void;
}

export default function BuilderAutoOptimizeModal({
  isOpen,
  onClose,
  elements,
  siteSettings,
  onApplyOptimization,
}: BuilderAutoOptimizeModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<DesignThemeId>('cyber-indigo');
  const [options, setOptions] = useState<Omit<OptimizeOptions, 'themeId'>>({
    harmonizeColors: true,
    normalizeTypography: true,
    normalizeSpacing: true,
    optimizeMobile: true,
    unifyBordersAndShadows: true,
  });

  const [lastReport, setLastReport] = useState<OptimizeReport | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const handleRunOptimization = () => {
    setIsApplying(true);
    setTimeout(() => {
      const fullOptions: OptimizeOptions = {
        themeId: selectedTheme,
        ...options,
      };

      const result = optimizeWebsite(elements, siteSettings, fullOptions);
      setLastReport(result.report);
      setIsApplying(false);

      onApplyOptimization(
        result.optimizedElements,
        result.updatedSettings,
        result.report
      );
    }, 300);
  };

  const themesList = Object.values(DESIGN_THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.35)] relative text-white max-h-[92vh] flex flex-col overflow-hidden">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 shrink-0 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300 mb-2">
              <Sparkles size={14} className="text-indigo-400 animate-pulse" />
              <span>Công Nghệ Tối Ưu Bố Cục Thông Minh</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Tự Động Tối Ưu Giao Diện Website
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-lg leading-relaxed">
              Tự động phân tích, phối màu chuẩn tương phản, chuẩn hóa cỡ chữ theo tỷ lệ vàng và tối ưu 100% hiển thị trên điện thoại.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar relative z-10 pr-1">
          {/* Report Alert if already ran */}
          {lastReport && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">Đã tối ưu thành công! </span>
                  Đã cập nhật {lastReport.modifiedCount} thành phần, chuẩn hóa {lastReport.typographyAdjustedCount} khối chữ và sửa {lastReport.fixedMobileCount} lỗi tràn viền mobile.
                </div>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 font-bold">
                {lastReport.themeApplied}
              </span>
            </div>
          )}

          {/* Section 1: Choose Design Theme */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-3">
              <Palette size={14} className="text-indigo-400" />
              <span>1. Chọn Bộ Phong Cách Màu Sắc & Nhận Diện</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themesList.map((th) => {
                const isSelected = selectedTheme === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setSelectedTheme(th.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition relative group ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {/* Active checkmark */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                    )}

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      {th.previewColors.map((color, idx) => (
                        <span
                          key={idx}
                          style={{ backgroundColor: color }}
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        />
                      ))}
                    </div>

                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                      {th.name}
                    </div>
                    <div className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                      {th.tagline}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Optimization Rules Checklist */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mb-3">
              <Sliders size={14} className="text-indigo-400" />
              <span>2. Các Tiêu Chuẩn Sẽ Được Tối Ưu Tự Động</span>
            </label>

            <div className="space-y-2.5">
              {[
                {
                  key: 'harmonizeColors' as const,
                  label: 'Phối màu chuẩn tương phản & nền chuyển tầng (Color Harmony)',
                  desc: 'Tự động phối màu nền, đường viền, nút bấm và icon tương phản cao, chống lóa mắt.',
                  icon: Palette,
                },
                {
                  key: 'normalizeTypography' as const,
                  label: 'Chuẩn hóa tỷ lệ chữ vàng & phân cấp font (Golden Typography Scale)',
                  desc: 'H1 44px, H2 32px, H3 22px, body 16px với line-height 1.65 thoáng mắt, dễ đọc.',
                  icon: Type,
                },
                {
                  key: 'normalizeSpacing' as const,
                  label: 'Cân bằng đệm lề chuẩn thiết kế (Spacing & Padding Grid)',
                  desc: 'Section đệm 72px, container 1140px căn giữa chuẩn, loại bỏ khoảng cách thừa hoặc co rúm.',
                  icon: Layout,
                },
                {
                  key: 'optimizeMobile' as const,
                  label: 'Khắc phục triệt để lỗi tràn lề trên Di Động (Mobile Auto-Fix 100%)',
                  desc: 'Chuyển đổi kích thước cứng thành co giãn linh hoạt (max-width), bảo đảm không tràn ngang trên màn hình điện thoại.',
                  icon: Smartphone,
                },
                {
                  key: 'unifyBordersAndShadows' as const,
                  label: 'Đồng bộ bo góc hiện đại & bóng mờ sang trọng (Smooth Radius & Glow)',
                  desc: 'Bo góc 16px chuẩn phong cách 2026 kèm bóng đổ mịn màng tạo chiều sâu không gian.',
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isChecked = options[item.key];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition select-none ${
                      isChecked
                        ? 'border-indigo-500/40 bg-indigo-500/10'
                        : 'border-white/5 bg-white/[0.02] opacity-60 hover:opacity-80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setOptions((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="mt-1 w-4 h-4 rounded text-indigo-600 bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-white">{item.label}</span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4 shrink-0 relative z-10">
          <div className="text-xs text-white/50 hidden sm:block">
            Áp dụng cho <span className="font-bold text-white">{elements.length}</span> thành phần trên trang
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleRunOptimization}
              disabled={isApplying}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles size={15} className={isApplying ? "animate-spin" : ""} />
              <span>{isApplying ? "Đang Tối Ưu..." : "✨ Áp Dụng Tối Ưu Ngay"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
