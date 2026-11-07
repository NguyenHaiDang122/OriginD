import React, { useState } from "react";
import type {
  BuilderElement,
  DeviceMode,
  DropPosition,
  DragItem,
  BuilderSiteSettings,
} from "../../types/builder";
import BuilderElementRenderer from "./BuilderElementRenderer";
import { Plus, Eye, ArrowLeft } from "lucide-react";

interface BuilderCanvasProps {
  elements: BuilderElement[];
  selectedId: string | null;
  onSelectElement: (element: BuilderElement | null) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onMoveUpElement: (id: string) => void;
  onMoveDownElement: (id: string) => void;
  onUpdateElement?: (id: string, updater: (el: BuilderElement) => BuilderElement) => void;
  onDropItem: (item: DragItem, target: DropPosition) => void;
  deviceMode: DeviceMode;
  siteSettings: BuilderSiteSettings;
  isPreview?: boolean;
  onExitPreview?: () => void;
}

export default function BuilderCanvas({
  elements,
  selectedId,
  onSelectElement,
  onDeleteElement,
  onDuplicateElement,
  onMoveUpElement,
  onMoveDownElement,
  onUpdateElement,
  onDropItem,
  deviceMode,
  siteSettings,
  isPreview = false,
  onExitPreview,
}: BuilderCanvasProps) {
  const [isRootDropOver, setIsRootDropOver] = useState(false);

  const handleRootDragOver = (e: React.DragEvent) => {
    if (isPreview) return;
    e.preventDefault();
    setIsRootDropOver(true);
  };

  const handleRootDragLeave = (e: React.DragEvent) => {
    if (isPreview) return;
    e.preventDefault();
    setIsRootDropOver(false);
  };

  const handleRootDrop = (e: React.DragEvent) => {
    if (isPreview) return;
    e.preventDefault();
    setIsRootDropOver(false);

    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (dataStr) {
        const item: DragItem = JSON.parse(dataStr);
        onDropItem(item, {
          parentId: null,
          targetIndex: elements.length,
          position: 'after',
        });
      }
    } catch {}
  };

  // Device container dimensions and frame styles
  const deviceStyles: Record<DeviceMode, { width: string; className: string }> = {
    desktop: {
      width: '100%',
      className: 'w-full min-h-full transition-all duration-300',
    },
    tablet: {
      width: '768px',
      className: 'w-[768px] my-6 rounded-2xl border-8 border-slate-800 shadow-2xl transition-all duration-300 overflow-hidden',
    },
    mobile: {
      width: '375px',
      className: 'w-[375px] my-6 rounded-[36px] border-[10px] border-slate-800 shadow-2xl transition-all duration-300 overflow-hidden',
    },
  };

  return (
    <div
      onClick={() => onSelectElement(null)}
      className="flex-1 bg-slate-950 overflow-y-auto flex flex-col items-center custom-scrollbar relative"
      style={{
        backgroundImage: !isPreview
          ? 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
          : undefined,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Floating Preview Banner */}
      {isPreview && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 border border-white/20 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 text-xs text-white">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Eye size={14} />
            <span>Chế độ Xem Trước (Preview)</span>
          </span>
          <span className="text-white/40">|</span>
          <button
            type="button"
            onClick={onExitPreview}
            className="flex items-center gap-1 font-bold text-indigo-400 hover:text-indigo-300 transition"
          >
            <ArrowLeft size={14} />
            <span>Thoát Xem Trước</span>
          </button>
        </div>
      )}

      {/* Device Viewport Canvas */}
      <div
        style={{
          maxWidth: deviceStyles[deviceMode].width,
          fontFamily: siteSettings.fontFamily || 'Inter, sans-serif',
          backgroundColor: siteSettings.backgroundColor || '#090d16',
        }}
        className={`${deviceStyles[deviceMode].className} min-h-[calc(100vh-3.5rem)] flex flex-col relative text-white`}
      >
        {/* Mobile Device Notch simulation */}
        {deviceMode === 'mobile' && !isPreview && (
          <div className="h-6 bg-slate-900 w-full flex items-center justify-center shrink-0 border-b border-white/5">
            <div className="w-24 h-3.5 bg-slate-800 rounded-full" />
          </div>
        )}

        {/* Empty Canvas Placeholder */}
        {elements.length === 0 ? (
          <div
            onDragOver={handleRootDragOver}
            onDragLeave={handleRootDragLeave}
            onDrop={handleRootDrop}
            className={`flex-1 m-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center transition ${
              isRootDropOver
                ? 'border-indigo-400 bg-indigo-500/10 scale-99'
                : 'border-white/15 bg-white/[0.02] hover:border-white/25'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Plus size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trang web của bạn đang trống</h3>
            <p className="text-sm text-white/50 max-w-md leading-relaxed mb-6">
              Kéo các thành phần từ thanh công cụ bên trái (Section, Banner, Tiêu đề, v.v.) vào khu vực này để bắt đầu thiết kế website.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-400/80 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
              <span>💡 Mẹo: Bắt đầu bằng một Section hoặc Banner</span>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleRootDragOver}
            onDragLeave={handleRootDragLeave}
            onDrop={handleRootDrop}
            className="flex-1 flex flex-col relative"
          >
            {/* Elements list */}
            {elements.map((elem, idx) => (
              <BuilderElementRenderer
                key={elem.id}
                element={elem}
                selectedId={selectedId}
                isEditor={!isPreview}
                onSelect={(selectedElem) => onSelectElement(selectedElem)}
                onDelete={onDeleteElement}
                onDuplicate={onDuplicateElement}
                onMoveUp={onMoveUpElement}
                onMoveDown={onMoveDownElement}
                onUpdateElement={onUpdateElement}
                onDropItem={onDropItem}
                parentId={null}
                index={idx}
                totalSiblings={elements.length}
              />
            ))}

            {/* Root bottom drop zone indicator */}
            {!isPreview && isRootDropOver && (
              <div className="m-4 py-6 border-2 border-dashed border-indigo-400 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-300 text-xs font-semibold animate-pulse">
                Thả phần tử vào cuối trang web
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
