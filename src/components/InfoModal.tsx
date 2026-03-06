import * as React from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

interface InfoModalProps {
  title: string;
  content: string;
  iconSize?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function InfoModal({ title, content, iconSize = "h-4 w-4", actionLabel, onAction }: InfoModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const closeTimerRef = React.useRef<number | null>(null);

  const closeModal = React.useCallback(() => {
    setIsClosing(true);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 100);
  }, []);

  React.useEffect(() => {
    return () => { if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current); };
  }, []);

  return (
    <>
      <button
        type="button"
        className="inline-flex cursor-help"
        tabIndex={-1}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsClosing(false);
          setOpen(true);
        }}
      >
        <HelpCircle className={`${iconSize} text-muted-foreground`} />
      </button>

      {open &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                zIndex: 9999, background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
                pointerEvents: isClosing ? "none" : "auto",
              }}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); closeModal(); }}
            />
            <div
              style={{
                position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                zIndex: 10000, width: "90%", maxWidth: 360, padding: 24,
                borderRadius: 12, background: "#ffffff", border: "1px solid #e2e8f0",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4a5568", marginBottom: 20 }}>
                {content}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {actionLabel && onAction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                      closeModal();
                      onAction();
                    }}
                    style={{
                      width: "100%", padding: "10px 0", background: "#3182ce", color: "#fff",
                      border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {actionLabel}
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    closeModal();
                  }}
                  style={{
                    width: "100%", padding: "10px 0",
                    background: actionLabel ? "transparent" : "#3182ce",
                    color: actionLabel ? "#4a5568" : "#fff",
                    border: actionLabel ? "1px solid #e2e8f0" : "none",
                    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Entendi
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
