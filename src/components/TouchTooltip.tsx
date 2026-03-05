import * as React from "react";
import { HelpCircle } from "lucide-react";
import { useGlobalTooltip } from "@/contexts/TooltipContext";

interface TouchTooltipProps {
  content: string;
  iconSize?: string;
}

let tooltipCounter = 0;

export function TouchTooltip({ content, iconSize = "h-4 w-4" }: TouchTooltipProps) {
  const idRef = React.useRef(`tt-${++tooltipCounter}`);
  const { activeTooltipId, setActiveTooltipId, isTouch } = useGlobalTooltip();
  const isOpen = activeTooltipId === idRef.current;

  const handleToggle = (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTooltipId(isOpen ? null : idRef.current);
  };

  // Desktop: hover open/close
  const handleMouseEnter = () => {
    if (!isTouch) setActiveTooltipId(idRef.current);
  };
  const handleMouseLeave = () => {
    if (!isTouch) setActiveTooltipId(null);
  };

  return (
    <span
      className="inline-flex relative"
      onPointerDown={(e) => {
        if (isTouch) {
          e.stopPropagation(); // prevent outside-click handler from immediately closing
          handleToggle(e);
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button type="button" className="inline-flex cursor-help" tabIndex={-1}>
        <HelpCircle className={`${iconSize} text-muted-foreground`} />
      </button>
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1 z-[9999] rounded-lg border bg-popover text-popover-foreground shadow-tooltip"
          style={{
            minWidth: 120,
            maxWidth: 280,
            whiteSpace: "normal",
            wordBreak: "break-word",
            fontSize: 13,
            lineHeight: 1.5,
            padding: "10px 14px",
            textAlign: "left",
            borderRadius: 8,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      )}
    </span>
  );
}
