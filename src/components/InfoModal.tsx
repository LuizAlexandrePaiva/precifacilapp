import * as React from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

interface InfoModalProps {
  title: string;
  content: string;
  iconSize?: string;
}

export function InfoModal({ title, content, iconSize = "h-4 w-4" }: InfoModalProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex cursor-help"
        tabIndex={-1}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <HelpCircle className={`${iconSize} text-muted-foreground`} />
      </button>

      {open && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setOpen(false)}
        >
          {/* Modal */}
          <div
            style={{
              position: "relative",
              zIndex: 10000,
              width: "90%",
              maxWidth: 360,
              padding: 24,
              borderRadius: 12,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 12,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "#4a5568",
                marginBottom: 20,
              }}
            >
              {content}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 0",
                background: "#3182ce",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Entendi
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
