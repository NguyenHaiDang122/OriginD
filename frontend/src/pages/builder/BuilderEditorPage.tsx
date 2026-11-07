import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {
  BuilderElement,
  BuilderSite,
  BuilderSiteSettings,
  DeviceMode,
  DragItem,
  DropPosition,
  ElementType,
} from "../../types/builder";
import {
  fetchBuilderSite,
  updateBuilderSite,
  publishBuilderSite,
  unpublishBuilderSite,
} from "../../services/builderApi";
import {
  createDefaultElement,
  cloneElement,
  insertElement,
  removeElementById,
  updateElementById,
  findElementById,
} from "../../utils/builderDefaults";
import { useAuthStore } from "../../store/authStore";
import BuilderHeader from "../../components/builder/BuilderHeader";
import BuilderSidebar from "../../components/builder/BuilderSidebar";
import BuilderCanvas from "../../components/builder/BuilderCanvas";
import BuilderPropertiesPanel from "../../components/builder/BuilderPropertiesPanel";
import BuilderPublishModal from "../../components/builder/BuilderPublishModal";
import PageLoader from "../../components/common/PageLoader";
import SEO from "../../components/common/SEO";

export default function BuilderEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  // Site meta
  const [site, setSite] = useState<BuilderSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Builder state
  const [elements, setElements] = useState<BuilderElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<BuilderSiteSettings>({
    metaTitle: "",
    metaDescription: "",
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#090d16",
  });

  // UI state
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [isPreview, setIsPreview] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [panelDock, setPanelDock] = useState<'right' | 'left'>('right');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // History for Undo / Redo
  const [history, setHistory] = useState<BuilderElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Auto-save debounce timer
  const autoSaveTimerRef = useRef<any>(null);

  // Selected element object memo
  const selectedElement = selectedId
    ? findElementById(elements, selectedId)?.element || null
    : null;

  // Load site on mount
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchBuilderSite(id!, token);
        if (isMounted) {
          setSite(data);
          const initialElements = Array.isArray(data.data) ? data.data : [];
          setElements(initialElements);
          setHistory([initialElements]);
          setHistoryIndex(0);

          if (data.settings) {
            setSiteSettings(data.settings);
          }
          setSaveStatus('saved');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Không thể tải trang web");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id, token]);

  // Push new state to history
  const pushHistory = useCallback(
    (newElements: BuilderElement[]) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(newElements);
        return next;
      });
      setHistoryIndex((prev) => prev + 1);
      setSaveStatus('unsaved');
    },
    [historyIndex]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setElements(history[prevIndex]);
      setSaveStatus('unsaved');
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
      setSaveStatus('unsaved');
    }
  }, [history, historyIndex]);

  // Save changes to backend
  const handleSave = useCallback(
    async (showNotification = true) => {
      if (!site) return;
      setSaveStatus('saving');

      try {
        const updated = await updateBuilderSite(
          site.id,
          {
            title: site.title,
            slug: site.slug,
            data: elements,
            settings: siteSettings,
          },
          token
        );
        setSite(updated);
        setSaveStatus('saved');

        // Also update local storage backup
        localStorage.setItem(`origind_builder_backup_${site.id}`, JSON.stringify(elements));

        if (showNotification) {
          // Visual feedback
        }
      } catch (err: any) {
        setSaveStatus('unsaved');
        if (showNotification) {
          alert("Lưu thiết kế thất bại: " + (err?.response?.data?.message || err.message));
        }
      }
    },
    [site, elements, siteSettings, token]
  );

  // Auto-save debounced whenever elements or siteSettings change
  useEffect(() => {
    if (saveStatus !== 'unsaved') return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(false);
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [elements, siteSettings, saveStatus, handleSave]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S, Del, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (!isInput) {
          e.preventDefault();
          if (e.shiftKey) handleRedo();
          else handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (!isInput) {
          e.preventDefault();
          handleRedo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave(true);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !isInput) {
        e.preventDefault();
        handleDeleteElement(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave, selectedId]);

  // Add new element from sidebar
  const handleAddElement = (type: ElementType) => {
    const newElement = createDefaultElement(type);
    let next: BuilderElement[];

    if (selectedId) {
      const found = findElementById(elements, selectedId);
      if (found && (found.element.type === 'section' || found.element.type === 'container')) {
        next = insertElement(elements, newElement, found.element.id, found.element.children ? found.element.children.length : 0);
      } else if (found) {
        next = insertElement(elements, newElement, found.parent ? found.parent.id : null, found.index + 1);
      } else {
        next = [...elements, newElement];
      }
    } else {
      next = [...elements, newElement];
    }

    setElements(next);
    pushHistory(next);
    setSelectedId(newElement.id);
  };

  // Drag and drop handler
  const handleDropItem = (item: DragItem, target: DropPosition) => {
    if (item.source === 'sidebar' && item.elementType) {
      const newElem = createDefaultElement(item.elementType);
      const next = insertElement(elements, newElem, target.parentId, target.targetIndex);
      setElements(next);
      pushHistory(next);
      setSelectedId(newElem.id);
    } else if (item.source === 'canvas' && item.elementId) {
      // Move existing element
      const { updated, removed } = removeElementById(elements, item.elementId);
      if (!removed) return;

      const next = insertElement(updated, removed, target.parentId, target.targetIndex);
      setElements(next);
      pushHistory(next);
      setSelectedId(removed.id);
    }
  };

  // Delete element
  const handleDeleteElement = (elemId: string) => {
    const { updated } = removeElementById(elements, elemId);
    setElements(updated);
    pushHistory(updated);
    if (selectedId === elemId) {
      setSelectedId(null);
    }
  };

  // Duplicate element
  const handleDuplicateElement = (elemId: string) => {
    const found = findElementById(elements, elemId);
    if (!found) return;

    const cloned = cloneElement(found.element);
    const next = insertElement(
      elements,
      cloned,
      found.parent ? found.parent.id : null,
      found.index + 1
    );

    setElements(next);
    pushHistory(next);
    setSelectedId(cloned.id);
  };

  // Move up
  const handleMoveUpElement = (elemId: string) => {
    const found = findElementById(elements, elemId);
    if (!found || found.index <= 0) return;

    const { updated, removed } = removeElementById(elements, elemId);
    if (!removed) return;

    const next = insertElement(
      updated,
      removed,
      found.parent ? found.parent.id : null,
      found.index - 1
    );

    setElements(next);
    pushHistory(next);
    setSelectedId(elemId);
  };

  // Move down
  const handleMoveDownElement = (elemId: string) => {
    const found = findElementById(elements, elemId);
    if (!found) return;

    const siblingsCount = found.parent
      ? found.parent.children?.length || 0
      : elements.length;

    if (found.index >= siblingsCount - 1) return;

    const { updated, removed } = removeElementById(elements, elemId);
    if (!removed) return;

    const next = insertElement(
      updated,
      removed,
      found.parent ? found.parent.id : null,
      found.index + 1
    );

    setElements(next);
    pushHistory(next);
    setSelectedId(elemId);
  };

  // Update element props or styles
  const handleUpdateElement = (
    elemId: string,
    updater: (el: BuilderElement) => BuilderElement
  ) => {
    const next = updateElementById(elements, elemId, updater);
    setElements(next);
    setSaveStatus('unsaved');
  };

  // Publish site
  const handlePublish = async (customSlug?: string) => {
    if (!site) return;
    const res = await publishBuilderSite(
      site.id,
      {
        slug: customSlug,
        data: elements,
      },
      token
    );
    setSite(res);
    setSaveStatus('saved');
  };

  // Unpublish site
  const handleUnpublish = async () => {
    if (!site) return;
    const res = await unpublishBuilderSite(site.id, token);
    setSite(res);
    setSaveStatus('saved');
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-white">
        <div className="text-rose-400 text-lg font-bold mb-2">Đã xảy ra lỗi</div>
        <p className="text-white/60 text-sm max-w-md mb-6">{error || "Không tìm thấy website"}</p>
        <button
          type="button"
          onClick={() => navigate("/builder")}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white transition"
        >
          Quay lại danh sách Website
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-white overflow-hidden">
      <SEO title={`Thiết kế: ${site.title} | OriginD Website Builder`} />

      {/* Top Toolbar */}
      {!isPreview && (
        <BuilderHeader
          title={site.title}
          onUpdateTitle={(newTitle) => {
            setSite((prev) => (prev ? { ...prev, title: newTitle } : prev));
            setSaveStatus('unsaved');
          }}
          status={site.status}
          slug={site.slug}
          saveStatus={saveStatus}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={() => handleSave(true)}
          onTogglePreview={() => setIsPreview(!isPreview)}
          isPreview={isPreview}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
          deviceMode={deviceMode}
          onChangeDeviceMode={setDeviceMode}
          onBack={() => navigate("/builder")}
        />
      )}

      {/* Main Builder Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        {!isPreview && (
          <BuilderSidebar
            onAddElement={handleAddElement}
            elements={elements}
            selectedId={selectedId}
            onSelectElement={(el) => setSelectedId(el.id)}
            onDeleteElement={handleDeleteElement}
          />
        )}

        {/* Left Properties Panel (if docked left) */}
        {!isPreview && panelDock === 'left' && (
          <BuilderPropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            siteSettings={siteSettings}
            onUpdateSiteSettings={(st) => {
              setSiteSettings((prev) => ({ ...prev, ...st }));
              setSaveStatus('unsaved');
            }}
            dockPosition={panelDock}
            onToggleDockPosition={() => setPanelDock((d) => (d === 'right' ? 'left' : 'right'))}
            isCollapsed={isPanelCollapsed}
            onToggleCollapse={() => setIsPanelCollapsed((c) => !c)}
          />
        )}

        {/* Central Canvas */}
        <BuilderCanvas
          elements={elements}
          selectedId={selectedId}
          onSelectElement={(el) => setSelectedId(el ? el.id : null)}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onMoveUpElement={handleMoveUpElement}
          onMoveDownElement={handleMoveDownElement}
          onUpdateElement={handleUpdateElement}
          onDropItem={handleDropItem}
          deviceMode={deviceMode}
          siteSettings={siteSettings}
          isPreview={isPreview}
          onExitPreview={() => setIsPreview(false)}
        />

        {/* Right Properties Panel (if docked right) */}
        {!isPreview && panelDock === 'right' && (
          <BuilderPropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            siteSettings={siteSettings}
            onUpdateSiteSettings={(st) => {
              setSiteSettings((prev) => ({ ...prev, ...st }));
              setSaveStatus('unsaved');
            }}
            dockPosition={panelDock}
            onToggleDockPosition={() => setPanelDock((d) => (d === 'right' ? 'left' : 'right'))}
            isCollapsed={isPanelCollapsed}
            onToggleCollapse={() => setIsPanelCollapsed((c) => !c)}
          />
        )}
      </div>

      {/* Publish & Share Modal */}
      <BuilderPublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        status={site.status}
        slug={site.slug}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />
    </div>
  );
}
