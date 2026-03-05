import * as React from "react";

interface TooltipContextType {
  activeTooltipId: string | null;
  setActiveTooltipId: (id: string | null) => void;
  isTouch: boolean;
}

const TooltipContext = React.createContext<TooltipContextType>({
  activeTooltipId: null,
  setActiveTooltipId: () => {},
  isTouch: false,
});

export function GlobalTooltipProvider({ children }: { children: React.ReactNode }) {
  const [activeTooltipId, setActiveTooltipId] = React.useState<string | null>(null);
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  // Close tooltip on outside click/touch
  React.useEffect(() => {
    if (!activeTooltipId) return;
    const handler = () => setActiveTooltipId(null);
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [activeTooltipId]);

  return (
    <TooltipContext.Provider value={{ activeTooltipId, setActiveTooltipId, isTouch }}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useGlobalTooltip() {
  return React.useContext(TooltipContext);
}
