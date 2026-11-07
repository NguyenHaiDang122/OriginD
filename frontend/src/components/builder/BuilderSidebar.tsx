import { useState } from "react";
import type {
  ElementType,
  BuilderElement,
} from "../../types/builder";
import {
  COMPONENT_DEFINITIONS,
} from "../../utils/builderDefaults";
import {
  Layers,
  Box,
  Heading,
  Type,
  Image as ImageIcon,
  Video,
  MousePointerClick,
  Sparkles,
  Minus,
  Compass,
  PanelBottom,
  Flag,
  Search,
  ListTree,
  Trash2,
} from "lucide-react";

interface BuilderSidebarProps {
  onAddElement: (type: ElementType) => void;
  elements: BuilderElement[];
  selectedId: string | null;
  onSelectElement: (element: BuilderElement) => void;
  onDeleteElement: (id: string) => void;
}

const iconComponentMap: Record<string, any> = {
  Layers,
  Box,
  Heading,
  Type,
  Image: ImageIcon,
  Video,
  MousePointerClick,
  Sparkles,
  Minus,
  Compass,
  PanelBottom,
  Flag,
};

export default function BuilderSidebar({
  onAddElement,
  elements,
  selectedId,
  onSelectElement,
  onDeleteElement,
}: BuilderSidebarProps) {
  const [activeTab, setActiveTab] = useState<'components' | 'layers'>('components');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'layout', label: 'Bố cục' },
    { id: 'content', label: 'Nội dung' },
    { id: 'interactive', label: 'Tương tác' },
    { id: 'prebuilt', label: 'Dựng sẵn' },
  ];

  const filteredComponents = COMPONENT_DEFINITIONS.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, type: ElementType) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ source: "sidebar", elementType: type })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  // Recursive tree view node
  const renderLayerNode = (node: BuilderElement, depth = 0) => {
    const isSelected = selectedId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const IconComp = iconComponentMap[
      COMPONENT_DEFINITIONS.find((c) => c.type === node.type)?.icon || 'Box'
    ] || Box;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => onSelectElement(node)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`flex items-center justify-between py-2 pr-2.5 rounded-lg text-xs font-medium cursor-pointer transition group ${
            isSelected
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <IconComp size={14} className="shrink-0 text-white/50 group-hover:text-white/80" />
            <span className="truncate">
              {node.name || node.type}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteElement(node.id);
              }}
              className="p-1 hover:bg-red-500/20 text-red-400 rounded transition"
              title="Xóa phần tử"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {hasChildren && (
          <div className="space-y-0.5 mt-0.5">
            {node.children!.map((child) => renderLayerNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-72 bg-slate-900/90 border-r border-white/10 flex flex-col h-full shrink-0 select-none z-20 backdrop-blur-md">
      {/* Sidebar Tabs */}
      <div className="flex items-center border-b border-white/10 px-3 pt-3">
        <button
          type="button"
          onClick={() => setActiveTab('components')}
          className={`flex-1 pb-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'components'
              ? 'text-indigo-400 border-indigo-500'
              : 'text-white/50 border-transparent hover:text-white/80'
          }`}
        >
          <Box size={14} />
          <span>Thành phần</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 pb-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
            activeTab === 'layers'
              ? 'text-indigo-400 border-indigo-500'
              : 'text-white/50 border-transparent hover:text-white/80'
          }`}
        >
          <ListTree size={14} />
          <span>Cây phân cấp</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-white/70">
            {elements.length}
          </span>
        </button>
      </div>

      {activeTab === 'components' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-white/40" />
              <input
                type="text"
                placeholder="Tìm thành phần..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1 overflow-x-auto mt-2.5 pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Component Grid */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1">
              Kéo thả vào Canvas hoặc bấm để thêm
            </div>

            <div className="grid grid-cols-2 gap-2">
              {filteredComponents.map((item) => {
                const IconComp = iconComponentMap[item.icon] || Box;

                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                    onClick={() => onAddElement(item.type)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 cursor-grab active:cursor-grabbing transition duration-150 group text-center"
                    title={item.description}
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition duration-200 mb-2">
                      <IconComp size={18} />
                    </div>
                    <span className="text-xs font-semibold text-white/90 group-hover:text-white">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                      {item.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-1 mb-2">
            Cấu trúc phân cấp các phần tử
          </div>

          {elements.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-xs">
              Chưa có thành phần nào trên trang.
              <br />
              Kéo từ tab "Thành phần" để bắt đầu!
            </div>
          ) : (
            elements.map((el) => renderLayerNode(el, 0))
          )}
        </div>
      )}
    </aside>
  );
}
