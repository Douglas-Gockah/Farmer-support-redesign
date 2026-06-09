"use client";

import React, { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StagedEntry = {
  id:      string;
  url:     string;
  isImage: boolean;
  name:    string;
  size:    number;
};

export type ProofEntry = {
  id?:     string;
  url:     string;
  isImage: boolean;
  name?:   string;
  size?:   number;
  error?:  boolean;
};

// ---------------------------------------------------------------------------
// Shared upload / preview strip with staged commit flow
//
// Props:
//   entries     — committed (saved) proof files
//   onSave      — called when user clicks "Save upload"; receives staged files
//   onRemove    — called when user trashes a committed file (entry + index)
//   onRemoveAll — called when user clicks "Remove all"
//
// When none of the *on* callbacks are provided the component is read-only.
// ---------------------------------------------------------------------------

export function ProofThumbnailStrip({
  entries,
  onSave,
  onRemove,
  onRemoveAll,
}: {
  entries:      ProofEntry[];
  onSave?:      (staged: StagedEntry[]) => void;
  onRemove?:    (entry: ProofEntry, idx: number) => void;
  onRemoveAll?: () => void;
}) {
  const [lightbox,   setLightbox]   = useState<{ url: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [staged,     setStaged]     = useState<StagedEntry[]>([]);
  const [isSaving,   setIsSaving]   = useState(false);

  // All non-empty image URLs (committed + staged) — used for lightbox navigation
  const allImageUrls: string[] = [
    ...entries.filter(e => e.isImage && e.url).map(e => e.url),
    ...staged.filter(s => s.isImage).map(s => s.url),
  ];

  // ── helpers ────────────────────────────────────────────────────────────────

  function UploadArrowIcon({ size = 16, color = "#6b7280" }: { size?: number; color?: string }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path d="M12 16V8M8 12l4-4 4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 18h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  function TrashIcon({ size = 16 }: { size?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  function PdfFileIcon() {
    return (
      <div style={{ width: 36, height: 44, position: "relative", flexShrink: 0 }}>
        <div style={{ width: "100%", height: "100%", background: "#f3f4f6", borderRadius: 4, border: "1px solid #e5e7eb" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, background: "#e5e7eb", borderBottomLeftRadius: 4 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
          <span style={{ background: "#ef4444", color: "#fff", fontSize: "0.5rem", fontWeight: 800, padding: "2px 4px", borderRadius: 2, letterSpacing: "0.03em" }}>PDF</span>
        </div>
      </div>
    );
  }

  function fmtSize(bytes: number) {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + "KB";
    return (bytes / (1024 * 1024)).toFixed(2) + "MB";
  }

  function handleFiles(files: File[]) {
    const newStaged: StagedEntry[] = files
      .filter(f => f.type.startsWith("image/") || f.type === "application/pdf")
      .map(f => ({
        id:      Math.random().toString(36).slice(2) + Date.now().toString(36),
        url:     URL.createObjectURL(f),
        isImage: f.type.startsWith("image/"),
        name:    f.name,
        size:    f.size,
      }));
    if (newStaged.length > 0) setStaged(prev => [...prev, ...newStaged]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (!onSave) return;
    handleFiles(Array.from(e.dataTransfer.files));
  }

  function lightboxNav(dir: 1 | -1) {
    if (!lightbox) return;
    const idx = allImageUrls.indexOf(lightbox.url);
    if (idx === -1) return;
    setLightbox({ url: allImageUrls[(idx + dir + allImageUrls.length) % allImageUrls.length] });
  }

  function openImage(url: string, isImage: boolean) {
    if (!url) return;
    if (isImage) setLightbox({ url });
    else window.open(url, "_blank");
  }

  const FileInput = ({ label, style }: { label: React.ReactNode; style?: React.CSSProperties }) => (
    <label style={{ cursor: "pointer", ...style }}>
      <input
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        multiple
        style={{ display: "none" }}
        onChange={(e) => { if (e.target.files) handleFiles(Array.from(e.target.files)); }}
      />
      {label}
    </label>
  );

  const totalCount = entries.length + staged.length;

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (totalCount === 0 && onSave) {
    return (
      <>
        <FileInput
          label={
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 16, padding: "32px 24px", borderRadius: 12,
                border: `1.5px dashed ${isDragging ? "#16a34a" : "#d1d5db"}`,
                background: isDragging ? "#f0fdf4" : "#fff",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <UploadArrowIcon size={24} color="#16a34a" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Upload or drag and drop file here</p>
                <p style={{ fontSize: "0.8125rem", color: "#9ca3af", margin: 0 }}>PNG, JPEG/JPG, or PDF (Up to 2 files, Max size: 2MB each)</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 22px", background: "#fff", color: "#374151", fontSize: "0.9375rem", fontWeight: 600, pointerEvents: "none" }}>
                <UploadArrowIcon size={16} color="#6b7280" />
                Choose files
              </div>
            </div>
          }
        />
      </>
    );
  }

  // ── File list state ──────────────────────────────────────────────────────────
  const lightboxPos = lightbox ? allImageUrls.indexOf(lightbox.url) : -1;

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#9ca3af" }}>Files ({totalCount})</span>
        {onSave && (
          <div style={{ display: "flex", gap: 8 }}>
            <FileInput
              label={
                <div style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", background: "#fff", color: "#374151", fontSize: "0.875rem", fontWeight: 600 }}>
                  <UploadArrowIcon size={14} />
                  Add more
                </div>
              }
            />
            {(entries.length > 0 || staged.length > 0) && (
              <button
                onClick={() => { setStaged([]); onRemoveAll?.(); }}
                style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", background: "#fff", color: "#374151", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
              >
                <TrashIcon size={14} />
                Remove all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Committed file rows */}
      {entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((entry, i) => {
            const canClick = !!entry.url && entry.isImage;
            return (
              <div
                key={entry.id ?? i}
                style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, background: "#fff" }}
              >
                <button
                  onClick={() => openImage(entry.url, entry.isImage)}
                  disabled={!canClick}
                  style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0, cursor: canClick ? "pointer" : "default" }}
                >
                  {entry.isImage && entry.url ? (
                    <img src={entry.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : <PdfFileIcon />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.name ?? "Uploaded document"}
                  </p>
                  {entry.size ? <span style={{ fontSize: "0.8125rem", color: "#9ca3af", marginTop: 2, display: "block" }}>{fmtSize(entry.size)}</span> : null}
                </div>
                {onRemove && (
                  <button
                    onClick={() => onRemove(entry, i)}
                    style={{ width: 36, height: 36, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", flexShrink: 0 }}
                    title="Remove file"
                  >
                    <TrashIcon size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Divider between committed and staged */}
      {entries.length > 0 && staged.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ fontSize: "0.6875rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Pending — not saved yet</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>
      )}

      {/* Staged (pending) file rows */}
      {staged.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {staged.map((s, i) => (
            <div
              key={s.id}
              style={{ border: "1.5px dashed #fcd34d", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, background: "#fffbeb" }}
            >
              <button
                onClick={() => openImage(s.url, s.isImage)}
                disabled={!s.isImage}
                style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid #fde68a", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0, cursor: s.isImage ? "pointer" : "default" }}
              >
                {s.isImage ? (
                  <img src={s.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : <PdfFileIcon />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{s.name}</p>
                  <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#92400e", background: "#fde68a", padding: "2px 7px", borderRadius: 20, flexShrink: 0, letterSpacing: "0.04em", textTransform: "uppercase" }}>Unsaved</span>
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#92400e" }}>{fmtSize(s.size)}</span>
              </div>
              <button
                onClick={() => setStaged(prev => prev.filter((_, j) => j !== i))}
                style={{ width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", color: "#d97706", flexShrink: 0, fontSize: "1.1rem", fontWeight: 700 }}
                title="Discard this file"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Save footer */}
      {staged.length > 0 && onSave && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid #fde68a" }}>
          <span style={{ fontSize: "0.8125rem", color: "#92400e", flex: 1 }}>
            {staged.length} file{staged.length > 1 ? "s" : ""} waiting to be saved
          </span>
          <button
            disabled={isSaving}
            onClick={() => !isSaving && setStaged([])}
            style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: isSaving ? "#d1d5db" : "#6b7280", fontSize: "0.875rem", fontWeight: 600, cursor: isSaving ? "default" : "pointer" }}
          >
            Discard
          </button>
          <button
            disabled={isSaving}
            onClick={() => {
              if (isSaving) return;
              setIsSaving(true);
              const toSave = staged;
              setTimeout(() => {
                onSave(toSave);
                setStaged([]);
                setIsSaving(false);
              }, 900);
            }}
            style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: isSaving ? "#4ade80" : "#16a34a", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: isSaving ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, minWidth: 120, justifyContent: "center", transition: "background 0.15s" }}
          >
            {isSaving ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Save upload
              </>
            )}
          </button>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Lightbox overlay */}
      {lightbox && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 700, zIndex: 1 }}
          >×</button>
          {allImageUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNav(-1); }}
              style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 700 }}
            >‹</button>
          )}
          <img
            src={lightbox.url}
            alt="Proof"
            style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
            onClick={(e) => e.stopPropagation()}
          />
          {allImageUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNav(1); }}
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", fontWeight: 700 }}
            >›</button>
          )}
          {allImageUrls.length > 1 && lightboxPos !== -1 && (
            <p style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>
              {lightboxPos + 1} of {allImageUrls.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
