import * as React from "react";
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

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* Overlay */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} />

          {/* Modal */}
          <div
            className="relative bg-background border"
            style={{
              maxWidth: 360,
              width: "calc(100% - 32px)",
              padding: 24,
              borderRadius: 12,
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
              onClick={() => setOpen(false)}
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
        </div>
      )}
    </>
  );
}
