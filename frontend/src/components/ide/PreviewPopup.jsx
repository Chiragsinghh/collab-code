import React, { useState, useEffect } from "react";
import { X, RotateCw, ExternalLink } from "lucide-react";

export default function PreviewPopup({ url, onClose }) {
  const [rect, setRect] = useState({
    x: window.innerWidth - 650,
    y: 80,
    w: 600,
    h: 450
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Reposition if window size changes significantly
  useEffect(() => {
    const handleResizeWindow = () => {
      setRect(prev => ({
        ...prev,
        x: Math.max(10, Math.min(window.innerWidth - prev.w - 20, prev.x)),
        y: Math.max(10, Math.min(window.innerHeight - prev.h - 20, prev.y))
      }));
    };
    window.addEventListener("resize", handleResizeWindow);
    return () => window.removeEventListener("resize", handleResizeWindow);
  }, []);

  const handleDragStart = (e) => {
    // Only drag with left click on the header, not on buttons/inputs
    if (e.button !== 0 || e.target.closest("button") || e.target.closest("input")) return;
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { x: rect.x, y: rect.y };
    setIsDragging(true);

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Keep within bounds
      const nextX = Math.max(0, Math.min(window.innerWidth - rect.w, startPos.x + dx));
      const nextY = Math.max(0, Math.min(window.innerHeight - rect.h, startPos.y + dy));

      setRect(prev => ({ ...prev, x: nextX, y: nextY }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeStart = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { w: rect.w, h: rect.h };
    setIsResizing(true);

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      setRect(prev => ({
        ...prev,
        w: Math.max(320, Math.min(window.innerWidth - prev.x - 10, startSize.w + dx)),
        h: Math.max(240, Math.min(window.innerHeight - prev.y - 10, startSize.h + dy))
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const openInNewTab = () => {
    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        position: "fixed",
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.w}px`,
        height: `${rect.h}px`,
        zIndex: 9999,
        background: "rgba(26, 24, 20, 0.95)",
        border: "1px solid rgba(244, 241, 234, 0.15)",
        boxShadow: "0 24px 64px -16px rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(16px)",
      }}
      className="rounded-xl flex flex-col overflow-hidden text-[#F4F1EA] select-none"
    >
      {/* Header (Draggable) */}
      <div
        onMouseDown={handleDragStart}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          background: "rgba(34, 31, 26, 0.5)",
          borderBottom: "1px solid rgba(244, 241, 234, 0.08)"
        }}
        className="h-11 px-3 flex items-center justify-between gap-3 shrink-0"
      >
        <span className="text-[12px] font-semibold text-[#E4895F] tracking-wide shrink-0">
          APP PREVIEW
        </span>

        {/* Read-only URL Field */}
        <input
          type="text"
          readOnly
          value={url}
          className="flex-1 min-w-0 bg-black/40 border border-white/5 rounded px-2.5 py-1 text-[11px] text-[#F4F1EA]/70 focus:outline-none select-all"
        />

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={triggerRefresh}
            title="Refresh Preview"
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-[#F4F1EA]/70 hover:text-white"
          >
            <RotateCw size={13} />
          </button>
          <button
            onClick={openInNewTab}
            title="Open in New Tab"
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-[#F4F1EA]/70 hover:text-white"
          >
            <ExternalLink size={13} />
          </button>
          <button
            onClick={onClose}
            title="Close Preview"
            className="p-1.5 hover:bg-[#D9705A]/20 hover:text-[#D9705A] rounded transition-colors text-[#F4F1EA]/70"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Preview Content (Iframe Area) */}
      <div className="flex-1 relative bg-white">
        {/* Iframe */}
        <iframe
          key={refreshKey}
          src={url}
          title="Website Preview"
          className="w-full h-full border-none"
        />

        {/* Drag/Resize Overlay (prevents iframe from eating mouse events) */}
        {(isDragging || isResizing) && (
          <div
            className="absolute inset-0 z-50"
            style={{
              background: "transparent",
              cursor: isDragging ? "grabbing" : "nwse-resize"
            }}
          />
        )}
      </div>

      {/* Resize Handle (Bottom-Right) */}
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "16px",
          height: "16px",
          cursor: "nwse-resize",
          zIndex: 60,
          background: "linear-gradient(135deg, transparent 40%, rgba(244, 241, 234, 0.4) 100%)",
        }}
        className="rounded-br-xl"
      />
    </div>
  );
}
