import { useState } from "react";
import { PREBUILT_SITE_TEMPLATES, type PrebuiltSiteTemplate } from "../../utils/builderTemplates";
import {
  Sparkles,
  Layers,
  Check,
  Search,
  X,
  ArrowRight,
} from "lucide-react";

interface BuilderTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PrebuiltSiteTemplate, customTitle: string) => void;
  titlePrompt?: string;
  confirmButtonText?: string;
}

export default function BuilderTemplatePickerModal({
  isOpen,
  onClose,
  onSelectTemplate,
  titlePrompt = "Khởi Tạo Website Mới Từ Mẫu",
  confirmButtonText = "Bắt Đầu Với Mẫu Này",
}: BuilderTemplatePickerModalProps) {
  const [selectedId, setSelectedId] = useState<string>('tpl-saas-tech');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState("");
  const [websiteTitle, setWebsiteTitle] = useState("");

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Tất cả mẫu' },
    { id: 'business', label: 'Doanh nghiệp & Tech' },
    { id: 'ecommerce', label: 'Bán hàng & Thời trang' },
    { id: 'education', label: 'Giáo dục & Khóa học' },
    { id: 'beauty', label: 'Làm đẹp & Spa' },
    { id: 'portfolio', label: 'Portfolio & Chuyên gia' },
    { id: 'blank', label: 'Trang trắng' },
  ];

  const filteredTemplates = PREBUILT_SITE_TEMPLATES.filter((tpl) => {
    const matchesCat = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase()) ||
      tpl.categoryLabel.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedTemplate = PREBUILT_SITE_TEMPLATES.find((t) => t.id === selectedId) || PREBUILT_SITE_TEMPLATES[0];

  const handleConfirm = () => {
    const finalTitle = websiteTitle.trim() || selectedTemplate.title;
    onSelectTemplate(selectedTemplate, finalTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-8 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.35)] relative text-white max-h-[92vh] flex flex-col overflow-hidden">
        {/* Decorative Blur */}
        <div className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 shrink-0 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 mb-2">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Kho Mẫu Giao Diện Chuẩn Đẹp 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {titlePrompt}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Chọn một mẫu giao diện chuyên nghiệp để bắt đầu tùy biến hoặc thiết kế tự do.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="py-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-10">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-3 text-white/40" />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu giao diện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto py-5 custom-scrollbar relative z-10 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedId(tpl.id);
                    if (!websiteTitle.trim()) {
                      setWebsiteTitle(tpl.title);
                    }
                  }}
                  className={`rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden flex flex-col justify-between group ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Thumbnail banner */}
                    <div className="h-36 w-full relative overflow-hidden bg-slate-950">
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/90 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                          {tpl.badge}
                        </span>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                            <Check size={14} className="stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Elements Count pill */}
                      <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 text-white/80 backdrop-blur-md">
                        {tpl.elementsCount} khối dựng sẵn
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="text-[11px] font-semibold text-indigo-400 mb-1">
                        {tpl.categoryLabel}
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                        {tpl.title}
                      </h3>
                      <p className="text-xs text-white/60 mt-1.5 leading-relaxed line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  {/* Card bottom footer */}
                  <div className="p-4 pt-0 flex items-center justify-between">
                    <span className="text-[11px] text-white/40 font-mono">
                      Font: {tpl.settings.fontFamily?.split(',')[0]}
                    </span>

                    <span className={`text-xs font-bold transition flex items-center gap-1 ${
                      isSelected ? 'text-indigo-300' : 'text-white/50 group-hover:text-white'
                    }`}>
                      <span>{isSelected ? 'Đang chọn' : 'Chọn mẫu'}</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom: Title Input & Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 relative z-10">
          {/* Website Name input */}
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-semibold text-white/80 mb-1">
              Tên website của bạn:
            </label>
            <input
              type="text"
              placeholder="VD: Website Bán Hàng, Dịch Vụ Công Ty..."
              value={websiteTitle}
              onChange={(e) => setWebsiteTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition transform active:scale-95"
            >
              <Layers size={14} />
              <span>{confirmButtonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
