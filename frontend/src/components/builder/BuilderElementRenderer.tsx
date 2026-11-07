import React, { useState, useRef, useEffect } from "react";
import type {
  BuilderElement,
  DropPosition,
  DragItem,
} from "../../types/builder";
import DynamicIcon from "./DynamicIcon";
import {
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Plus,
  Move,
  Pin,
  PinOff,
  Check,
} from "lucide-react";

interface BuilderElementRendererProps {
  element: BuilderElement;
  isSelected?: boolean;
  selectedId?: string | null;
  isEditor?: boolean;
  onSelect?: (element: BuilderElement, e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onUpdateElement?: (id: string, updater: (el: BuilderElement) => BuilderElement) => void;
  onDropItem?: (item: DragItem, target: DropPosition) => void;
  draggedItem?: DragItem | null;
  parentId?: string | null;
  index?: number;
  totalSiblings?: number;
}

// Convert common YouTube or Vimeo links to embed URLs
function getEmbedVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'mp4'; embedUrl: string } {
  if (!url) return { type: 'mp4', embedUrl: '' };

  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
    };
  }

  return { type: 'mp4', embedUrl: url };
}

export default function BuilderElementRenderer({
  element,
  isSelected: propsIsSelected = false,
  selectedId,
  isEditor = false,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onUpdateElement,
  onDropItem,
  draggedItem = null,
  parentId = null,
  index = 0,
  totalSiblings = 1,
}: BuilderElementRendererProps) {
  const isSelected = selectedId !== undefined ? selectedId === element.id : propsIsSelected;
  const [dropHoverPosition, setDropHoverPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [isSelfDragging, setIsSelfDragging] = useState(false);

  const { type, props, styles, children } = element;
  const isAbsolute = styles.position === 'absolute';

  const elementRef = useRef<HTMLDivElement>(null);

  // Free-form Drag State (moving via drag handle)
  const [isFreeDragging, setIsFreeDragging] = useState(false);
  const [dragCoords, setDragCoords] = useState<{ x: number; y: number } | null>(null);

  // Right-click "Rê & Ghim" State (Free Hover & Pin anywhere)
  const [isHoverMoving, setIsHoverMoving] = useState(false);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [pinnedNotice, setPinnedNotice] = useState<string | null>(null);
  const originalStylesRef = useRef<Record<string, any> | null>(null);
  const cleanupListenersRef = useRef<(() => void) | null>(null);

  // Clean up any global listeners on unmount
  useEffect(() => {
    return () => {
      if (cleanupListenersRef.current) {
        cleanupListenersRef.current();
      }
    };
  }, []);

  const handlePinNow = (e?: React.MouseEvent | MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (cleanupListenersRef.current) {
      cleanupListenersRef.current();
    }
    setIsHoverMoving(false);
    const coords = hoverCoords || {
      x: parseInt(styles.left || '0', 10),
      y: parseInt(styles.top || '0', 10),
    };
    setPinnedNotice(`Đã ghim tại X: ${coords.x}px, Y: ${coords.y}px`);
    setTimeout(() => {
      setPinnedNotice(null);
    }, 2500);
  };

  const handleCancelPin = (e?: React.MouseEvent | MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (cleanupListenersRef.current) {
      cleanupListenersRef.current();
    }
    setIsHoverMoving(false);
    setHoverCoords(null);
    if (originalStylesRef.current && onUpdateElement) {
      const orig = originalStylesRef.current;
      onUpdateElement(element.id, (el) => ({
        ...el,
        styles: { ...orig },
      }));
    }
  };

  const handleUnpin = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!onUpdateElement) return;
    onUpdateElement(element.id, (el) => {
      const newStyles = { ...el.styles };
      delete newStyles.position;
      delete newStyles.left;
      delete newStyles.top;
      delete newStyles.right;
      delete newStyles.bottom;
      delete newStyles.zIndex;
      return {
        ...el,
        styles: newStyles,
      };
    });
    setPinnedNotice('Đã gỡ ghim (trở về khung chuẩn)');
    setTimeout(() => setPinnedNotice(null), 2000);
  };

  const startHoverMove = (e?: React.MouseEvent) => {
    if (!isEditor || !onUpdateElement) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // If currently hover-moving, clicking again pins it
    if (isHoverMoving) {
      handlePinNow();
      return;
    }

    // Select the element
    if (onSelect) {
      onSelect(element, e as any);
    }

    const domEl = elementRef.current;
    if (!domEl) return;

    // Save previous styles to allow cancellation
    originalStylesRef.current = { ...styles };

    const elemRect = domEl.getBoundingClientRect();
    const parentEl = (domEl.offsetParent as HTMLElement) || domEl.parentElement || document.body;
    const parentRect = parentEl.getBoundingClientRect();

    // Grab offset from click point to element's top-left
    const clickX = e ? e.clientX : (elemRect.left + elemRect.width / 2);
    const clickY = e ? e.clientY : (elemRect.top + elemRect.height / 2);
    const grabOffsetX = Math.max(0, Math.min(elemRect.width, clickX - elemRect.left));
    const grabOffsetY = Math.max(0, Math.min(elemRect.height, clickY - elemRect.top));

    const initialX = Math.max(0, Math.round(elemRect.left - parentRect.left));
    const initialY = Math.max(0, Math.round(elemRect.top - parentRect.top));

    setHoverCoords({ x: initialX, y: initialY });
    setIsHoverMoving(true);

    // Immediately put in absolute position so it follows cursor smoothly
    onUpdateElement(element.id, (el) => ({
      ...el,
      styles: {
        ...el.styles,
        position: 'absolute',
        left: `${initialX}px`,
        top: `${initialY}px`,
        zIndex: 50,
      },
    }));

    const handleMouseMove = (moveEv: MouseEvent) => {
      const newX = Math.max(0, Math.round(moveEv.clientX - parentRect.left - grabOffsetX));
      const newY = Math.max(0, Math.round(moveEv.clientY - parentRect.top - grabOffsetY));
      setHoverCoords({ x: newX, y: newY });

      onUpdateElement(element.id, (el) => ({
        ...el,
        styles: {
          ...el.styles,
          position: 'absolute',
          left: `${newX}px`,
          top: `${newY}px`,
          zIndex: 50,
        },
      }));
    };

    const handleKeyDown = (keyEv: KeyboardEvent) => {
      if (keyEv.key === 'Escape') {
        keyEv.preventDefault();
        handleCancelPin();
      } else if (keyEv.key === 'Enter' || keyEv.key === ' ') {
        keyEv.preventDefault();
        handlePinNow();
      }
    };

    const handleWindowClick = (clickEv: MouseEvent) => {
      const target = clickEv.target as HTMLElement | null;
      if (target?.closest('.btn-cancel-pin')) {
        return;
      }
      clickEv.preventDefault();
      clickEv.stopPropagation();
      handlePinNow();
    };

    // Clean up listeners helper
    const cleanup = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleWindowClick, { capture: true });
      cleanupListenersRef.current = null;
    };

    cleanupListenersRef.current = cleanup;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    // Attach window click listener after 150ms so right-click release doesn't immediately pin
    setTimeout(() => {
      if (cleanupListenersRef.current) {
        window.addEventListener('click', handleWindowClick, { capture: true, once: true });
      }
    }, 150);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isEditor) return;
    e.preventDefault();
    e.stopPropagation();
    startHoverMove(e);
  };

  const handleFreeDragMouseDown = (e: React.MouseEvent) => {
    if (!isEditor || !onUpdateElement) return;
    e.stopPropagation();

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;

    const startLeft = parseInt(styles.left || '40', 10);
    const startTop = parseInt(styles.top || '40', 10);

    setIsFreeDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startMouseX;
      const dy = moveEvent.clientY - startMouseY;
      const newLeft = Math.max(0, startLeft + dx);
      const newTop = Math.max(0, startTop + dy);

      setDragCoords({ x: newLeft, y: newTop });

      onUpdateElement(element.id, (el) => ({
        ...el,
        styles: {
          ...el.styles,
          position: 'absolute',
          left: `${newLeft}px`,
          top: `${newTop}px`,
        },
      }));
    };

    const handleMouseUp = () => {
      setIsFreeDragging(false);
      setDragCoords(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!isEditor || !onUpdateElement) return;
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = parseInt(styles.width || '240', 10) || 240;
    const startH = parseInt(styles.height || '120', 10) || 120;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newW = Math.max(40, startW + dx);
      const newH = Math.max(20, startH + dy);

      onUpdateElement(element.id, (el) => ({
        ...el,
        styles: {
          ...el.styles,
          width: `${newW}px`,
          height: `${newH}px`,
        },
      }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // CSS Properties mapped from styles
  const computedStyle: React.CSSProperties = {
    color: styles.color,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    fontFamily: styles.fontFamily,
    textAlign: styles.textAlign,
    lineHeight: styles.lineHeight,
    letterSpacing: styles.letterSpacing,
    backgroundColor: styles.backgroundColor,
    backgroundImage: styles.backgroundImage ? `url(${styles.backgroundImage})` : undefined,
    backgroundSize: styles.backgroundSize || 'cover',
    backgroundPosition: styles.backgroundPosition || 'center',
    width: styles.width,
    maxWidth: styles.maxWidth,
    height: styles.height,
    minHeight: styles.minHeight,
    padding: styles.padding,
    margin: styles.margin,
    paddingTop: styles.paddingTop,
    paddingRight: styles.paddingRight,
    paddingBottom: styles.paddingBottom,
    paddingLeft: styles.paddingLeft,
    marginTop: styles.marginTop,
    marginRight: styles.marginRight,
    marginBottom: styles.marginBottom,
    marginLeft: styles.marginLeft,
    borderWidth: styles.borderWidth,
    borderStyle: styles.borderStyle,
    borderColor: styles.borderColor,
    borderRadius: styles.borderRadius,
    boxShadow: styles.boxShadow,
    opacity: styles.opacity ? Number(styles.opacity) : undefined,
    display: styles.display,
    flexDirection: styles.flexDirection,
    justifyContent: styles.justifyContent,
    alignItems: styles.alignItems,
    gap: styles.gap,
    gridTemplateColumns: styles.gridTemplateColumns,
    overflow: styles.overflow,
    boxSizing: 'border-box',
    transition: isFreeDragging || isHoverMoving ? 'none' : 'all 0.15s ease',
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditor || !onDropItem || isAbsolute || isHoverMoving) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;

    const isContainerLike = type === 'section' || type === 'container';

    if (isContainerLike) {
      if (offsetY < 20) {
        setDropHoverPosition('before');
      } else if (offsetY > height - 20) {
        setDropHoverPosition('after');
      } else {
        setDropHoverPosition('inside');
      }
    } else {
      if (offsetY < height / 2) {
        setDropHoverPosition('before');
      } else {
        setDropHoverPosition('after');
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isEditor) return;
    e.preventDefault();
    e.stopPropagation();
    setDropHoverPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditor || !onDropItem || isAbsolute || isHoverMoving) return;
    e.preventDefault();
    e.stopPropagation();

    const currentPosition = dropHoverPosition || 'after';
    setDropHoverPosition(null);

    let rawData: any = null;
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (dataStr) rawData = JSON.parse(dataStr);
    } catch {}

    const item: DragItem = rawData || draggedItem;
    if (!item) return;

    if (currentPosition === 'inside' && (type === 'section' || type === 'container')) {
      onDropItem(item, {
        parentId: element.id,
        targetIndex: children ? children.length : 0,
        position: 'inside',
      });
    } else if (currentPosition === 'before') {
      onDropItem(item, {
        parentId: parentId,
        targetIndex: index,
        position: 'before',
      });
    } else {
      onDropItem(item, {
        parentId: parentId,
        targetIndex: index + 1,
        position: 'after',
      });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditor) return;
    e.stopPropagation();
    if (isHoverMoving) {
      handlePinNow(e);
      return;
    }
    if (onSelect) {
      onSelect(element, e);
    }
  };

  // Render Inner Content by Type
  const renderContent = () => {
    switch (type) {
      case 'heading': {
        const HeadingTag = (props.level || 'h2') as keyof React.JSX.IntrinsicElements;
        return (
          <HeadingTag style={computedStyle} className="leading-tight">
            {props.content || 'Tiêu đề'}
          </HeadingTag>
        );
      }

      case 'text': {
        return (
          <div style={computedStyle} className="whitespace-pre-line">
            {props.content || 'Nội dung văn bản...'}
          </div>
        );
      }

      case 'image': {
        return (
          <img
            src={props.src || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'}
            alt={props.alt || 'Hình ảnh'}
            style={computedStyle}
            className="transition duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
            }}
          />
        );
      }

      case 'video': {
        const videoInfo = getEmbedVideoUrl(props.url || '');
        return (
          <div style={computedStyle} className="relative aspect-video overflow-hidden">
            {videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' ? (
              <iframe
                src={videoInfo.embedUrl}
                title="Video player"
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={props.url}
                controls={props.controls !== false}
                autoPlay={props.autoplay === true}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        );
      }

      case 'button': {
        const isExternal = props.target === '_blank';
        return (
          <a
            href={isEditor ? undefined : (props.url || '#')}
            target={isExternal ? '_blank' : '_self'}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            style={computedStyle}
            onClick={(e) => {
              if (isEditor) e.preventDefault();
            }}
            className="inline-flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 hover:opacity-95 text-decoration-none select-none"
          >
            {props.icon && <DynamicIcon name={props.icon} size={18} />}
            <span>{props.text || 'Nút bấm'}</span>
          </a>
        );
      }

      case 'icon': {
        return (
          <div style={computedStyle} className="inline-flex items-center justify-center">
            <DynamicIcon
              name={props.iconName || 'Sparkles'}
              size={Number(props.size) || 32}
              color={props.color || styles.color || '#818cf8'}
            />
          </div>
        );
      }

      case 'divider': {
        return (
          <div
            style={{
              ...computedStyle,
              borderTopStyle: props.style || 'solid',
              borderTopWidth: computedStyle.height || '1px',
              borderTopColor: computedStyle.backgroundColor || 'rgba(255, 255, 255, 0.15)',
              backgroundColor: 'transparent',
              height: '0px',
            }}
          />
        );
      }

      case 'header': {
        const links = Array.isArray(props.links) ? props.links : [];
        return (
          <header style={computedStyle} className="flex items-center justify-between gap-6 flex-wrap">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {props.logoImage ? (
                <img src={props.logoImage} alt="Logo" className="h-8 max-w-[140px] object-contain" />
              ) : null}
              <span className="text-xl font-bold tracking-tight text-white">
                {props.logoText || 'OriginD Brand'}
              </span>
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-6 text-sm font-medium text-white/80 flex-wrap">
              {links.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={isEditor ? undefined : (link.url || '#')}
                  onClick={(e) => isEditor && e.preventDefault()}
                  className="hover:text-white transition"
                >
                  {link.label || `Mục ${idx + 1}`}
                </a>
              ))}
            </nav>

            {/* CTA */}
            {props.ctaText && (
              <a
                href={isEditor ? undefined : (props.ctaUrl || '#')}
                onClick={(e) => isEditor && e.preventDefault()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
              >
                {props.ctaText}
              </a>
            )}
          </header>
        );
      }

      case 'footer': {
        const columns = Array.isArray(props.columns) ? props.columns : [];
        return (
          <footer style={computedStyle} className="w-full">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
              <div className="max-w-sm">
                <div className="text-xl font-bold text-white mb-2">OriginD</div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {props.description || 'Nền tảng kiến tạo website trực quan số 1 - Sáng tạo không giới hạn.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                {columns.map((col: any, idx: number) => (
                  <div key={idx}>
                    <div className="text-sm font-semibold text-white/90 mb-3">{col.title || 'Mục'}</div>
                    <ul className="space-y-2 text-xs text-white/60">
                      {Array.isArray(col.links) && col.links.map((lk: any, lkIdx: number) => (
                        <li key={lkIdx}>
                          <a
                            href={isEditor ? undefined : (lk.url || '#')}
                            onClick={(e) => isEditor && e.preventDefault()}
                            className="hover:text-white transition"
                          >
                            {lk.label || 'Liên kết'}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/40 text-center">
              {props.copyright || '© 2026 OriginD. Tất cả các quyền được bảo lưu.'}
            </div>
          </footer>
        );
      }

      case 'banner': {
        return (
          <div style={computedStyle} className="flex flex-col items-center justify-center text-center relative overflow-hidden">
            {props.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4 backdrop-blur-sm">
                <span>{props.badge}</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl leading-tight mb-4">
              {props.title || 'Tiêu Đề Banner Nổi Bật'}
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mb-8 leading-relaxed">
              {props.subtitle || 'Mô tả ngắn gọn về sản phẩm, dịch vụ hoặc thông điệp chính mà bạn muốn truyền tải.'}
            </p>
            {props.buttonText && (
              <a
                href={isEditor ? undefined : (props.buttonUrl || '#')}
                onClick={(e) => isEditor && e.preventDefault()}
                className="px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {props.buttonText}
              </a>
            )}
          </div>
        );
      }

      case 'section':
      case 'container': {
        const Tag = type === 'section' ? 'section' : 'div';
        const hasChildren = children && children.length > 0;

        return (
          <Tag style={computedStyle} className="relative">
            {hasChildren ? (
              children!.map((child, idx) => (
                <BuilderElementRenderer
                  key={child.id}
                  element={child}
                  selectedId={selectedId}
                  isEditor={isEditor}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  onUpdateElement={onUpdateElement}
                  onDropItem={onDropItem}
                  draggedItem={draggedItem}
                  parentId={element.id}
                  index={idx}
                  totalSiblings={children!.length}
                />
              ))
            ) : isEditor ? (
              <div
                className={`py-8 px-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition ${
                  dropHoverPosition === 'inside'
                    ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200 scale-[1.01]'
                    : 'border-white/20 bg-white/[0.02] text-white/40 hover:border-white/40 hover:bg-white/[0.04]'
                }`}
              >
                <Plus size={24} className="mb-2 opacity-60" />
                <span className="text-xs font-medium">
                  {type === 'section' ? 'Kéo thả Container hoặc Phần tử vào Section này' : 'Kéo thả phần tử vào Container này'}
                </span>
              </div>
            ) : null}
          </Tag>
        );
      }

      default:
        return <div>Unknown element type</div>;
    }
  };

  if (!isEditor) {
    if (isAbsolute) {
      return (
        <div
          style={{
            position: 'absolute',
            left: styles.left || '40px',
            top: styles.top || '40px',
            zIndex: Number(styles.zIndex) || 10,
            width: styles.width,
          }}
        >
          {renderContent()}
        </div>
      );
    }
    return renderContent();
  }

  // Quick Action Toolbar atop selected element
  const typeLabelMap: Record<string, string> = {
    section: 'Section',
    container: 'Container',
    heading: 'Heading',
    text: 'Text',
    image: 'Image',
    video: 'Video',
    button: 'Button',
    icon: 'Icon',
    divider: 'Divider',
    header: 'Header',
    footer: 'Footer',
    banner: 'Banner',
  };

  return (
    <div
      ref={elementRef}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: isAbsolute ? 'absolute' : 'relative',
        left: isAbsolute ? (styles.left || '40px') : undefined,
        top: isAbsolute ? (styles.top || '40px') : undefined,
        zIndex: isHoverMoving ? 60 : (isAbsolute ? (Number(styles.zIndex) || 10) : undefined),
        width: isAbsolute ? styles.width : undefined,
      }}
      className={`group/elem transition-all duration-150 ${
        isHoverMoving
          ? 'outline outline-2 outline-amber-400 ring-4 ring-amber-400/30 shadow-[0_12px_35px_rgba(245,158,11,0.35)] cursor-move z-50'
          : isSelected
          ? 'outline outline-2 outline-indigo-500 ring-4 ring-indigo-500/20 z-30'
          : 'hover:outline hover:outline-1 hover:outline-indigo-400/50'
      } ${isSelfDragging ? 'opacity-40 scale-98' : ''}`}
    >
      {/* Drop Indicator (Line Before) - only for flow elements */}
      {!isAbsolute && !isHoverMoving && dropHoverPosition === 'before' && (
        <div className="absolute -top-1.5 left-0 right-0 h-1 bg-indigo-500 rounded-full z-40 shadow-[0_0_10px_#6366f1] animate-pulse">
          <div className="absolute -left-1.5 -top-1 w-3 h-3 rounded-full bg-indigo-500" />
          <div className="absolute -right-1.5 -top-1 w-3 h-3 rounded-full bg-indigo-500" />
        </div>
      )}

      {/* Floating Active "Rê & Ghim" Toolbar while moving freely */}
      {isHoverMoving && (
        <div
          className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-950/95 border-2 border-amber-400 rounded-xl px-3 py-1.5 shadow-[0_12px_35px_rgba(245,158,11,0.45)] z-50 text-white backdrop-blur-md select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs pr-2 border-r border-white/20">
            <Pin size={15} className="fill-amber-400 animate-bounce" />
            <span>Rê tự do:</span>
            <span className="font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-xs font-black">
              X: {hoverCoords?.x ?? 0}px | Y: {hoverCoords?.y ?? 0}px
            </span>
          </div>

          <button
            type="button"
            onClick={handlePinNow}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
            title="Bấm để ghim phần tử tại vị trí này (Hoặc Click chuột / Nhấn Enter)"
          >
            <Pin size={13} className="fill-slate-950" />
            <span>Ghim tại đây</span>
          </button>

          <button
            type="button"
            onClick={handleCancelPin}
            className="btn-cancel-pin bg-white/10 hover:bg-red-500/30 text-white/80 hover:text-red-200 text-xs px-2.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer whitespace-nowrap"
            title="Hủy di chuyển và quay lại vị trí cũ (Esc)"
          >
            ✕ Hủy
          </button>
        </div>
      )}

      {/* Pinned Success Toast */}
      {pinnedNotice && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-600/95 text-white border border-emerald-400/80 font-bold text-xs px-3 py-1.5 rounded-xl shadow-2xl z-50 flex items-center gap-1.5 whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
          <Check size={14} className="stroke-[3]" />
          <span>{pinnedNotice}</span>
        </div>
      )}

      {/* Floating Action Toolbar on Selected */}
      {isSelected && !isHoverMoving && (
        <div
          className="absolute -top-10 left-0 flex items-center gap-1 bg-slate-900/95 border border-indigo-500/60 rounded-lg px-2 py-1 shadow-2xl z-50 text-white backdrop-blur-md select-none text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Element Type Badge */}
          <div className="flex items-center gap-1.5 font-semibold text-indigo-300 pr-2 border-r border-white/20">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>{typeLabelMap[type] || type}</span>
          </div>

          {/* Rê & Ghim Toolbar Controls */}
          {isAbsolute ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUnpin}
                className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition"
                title="Đang ghim vị trí tự do. Bấm để gỡ ghim về bố cục chuẩn"
              >
                <PinOff size={12} />
                <span className="hidden sm:inline">Đã ghim (Gỡ)</span>
              </button>
              <button
                type="button"
                onClick={(e) => startHoverMove(e)}
                className="px-2 py-0.5 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                title="Bấm hoặc Chuột phải để rê tự do đến vị trí mới và ghim"
              >
                <Move size={12} />
                <span>Rê lại</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => startHoverMove(e)}
              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition"
              title="Nhấn chuột phải vào phần tử (hoặc bấm nút này) để rê đến bất kỳ vị trí nào rồi bấm Ghim"
            >
              <Pin size={12} />
              <span>Rê & Ghim</span>
            </button>
          )}

          {/* Drag Handle: Free Drag if Absolute, HTML5 Drag if Flow */}
          {isAbsolute ? (
            <div
              onMouseDown={handleFreeDragMouseDown}
              className="p-1 hover:bg-white/10 rounded cursor-move text-indigo-300 hover:text-white flex items-center gap-1"
              title="Nhấn giữ chuột để kéo tự do đến bất kỳ vị trí nào trên Canvas"
            >
              <Move size={14} />
              <span className="text-[10px] text-indigo-300 font-mono hidden sm:inline">Kéo</span>
            </div>
          ) : (
            <div
              draggable
              onDragStart={(e) => {
                setIsSelfDragging(true);
                e.dataTransfer.setData(
                  'application/json',
                  JSON.stringify({ source: 'canvas', elementId: element.id })
                );
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragEnd={() => setIsSelfDragging(false)}
              className="p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing text-white/70 hover:text-white"
              title="Kéo di chuyển vị trí"
            >
              <GripVertical size={14} />
            </div>
          )}

          {/* Move Up (only for flow layout) */}
          {!isAbsolute && onMoveUp && index > 0 && (
            <button
              type="button"
              onClick={() => onMoveUp(element.id)}
              className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition"
              title="Di chuyển lên trên"
            >
              <ChevronUp size={14} />
            </button>
          )}

          {/* Move Down (only for flow layout) */}
          {!isAbsolute && onMoveDown && index < totalSiblings - 1 && (
            <button
              type="button"
              onClick={() => onMoveDown(element.id)}
              className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition"
              title="Di chuyển xuống dưới"
            >
              <ChevronDown size={14} />
            </button>
          )}

          {/* Duplicate */}
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(element.id)}
              className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition"
              title="Nhân bản (Ctrl+D)"
            >
              <Copy size={14} />
            </button>
          )}

          {/* Delete */}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(element.id)}
              className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition"
              title="Xóa phần tử (Del)"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}

      {/* Floating Coordinates Tooltip while dragging freely */}
      {isFreeDragging && dragCoords && (
        <div className="absolute -top-16 left-0 bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shadow-xl z-50 pointer-events-none animate-pulse">
          📍 X: {dragCoords.x}px | Y: {dragCoords.y}px
        </div>
      )}

      {/* Corner Resize Handle */}
      {isSelected && !isHoverMoving && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-full cursor-nwse-resize z-50 shadow-md hover:scale-125 transition-transform"
          title="Kéo góc này để thay đổi kích thước (Rộng & Cao)"
        />
      )}

      {/* Render Component Content */}
      {renderContent()}

      {/* Drop Indicator (Line After) - only for flow elements */}
      {!isAbsolute && !isHoverMoving && dropHoverPosition === 'after' && (
        <div className="absolute -bottom-1.5 left-0 right-0 h-1 bg-indigo-500 rounded-full z-40 shadow-[0_0_10px_#6366f1] animate-pulse">
          <div className="absolute -left-1.5 -top-1 w-3 h-3 rounded-full bg-indigo-500" />
          <div className="absolute -right-1.5 -top-1 w-3 h-3 rounded-full bg-indigo-500" />
        </div>
      )}

      {/* Drop Indicator (Inside highlight) */}
      {!isAbsolute && !isHoverMoving && dropHoverPosition === 'inside' && (
        <div className="absolute inset-0 bg-indigo-500/10 border-2 border-indigo-400 rounded-lg pointer-events-none z-30" />
      )}
    </div>
  );
}
