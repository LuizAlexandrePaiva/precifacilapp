import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TouchTooltipProps {
  content: string;
  iconSize?: string;
}

export function TouchTooltip({ content, iconSize = "h-4 w-4" }: TouchTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  if (isTouch) {
    return (
      <button
        type="button"
        className="inline-flex relative"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <HelpCircle className={`${iconSize} text-muted-foreground`} />
        {open && (
          <div className="absolute left-0 top-full mt-1 z-[9999] max-w-xs rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md">
            {content}
          </div>
        )}
      </button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex">
            <HelpCircle className={`${iconSize} text-muted-foreground`} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-xs z-[9999]">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
