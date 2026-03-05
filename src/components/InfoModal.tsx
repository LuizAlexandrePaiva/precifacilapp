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
        <>
          {/* Overlay */}
          <div
            className="fixed z-[9999]"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div
            className="fixed z-[10000] bg-background border"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 360,
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
        </>
      )}
    </>
  );
}
