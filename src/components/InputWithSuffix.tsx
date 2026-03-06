import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputWithSuffixProps extends React.ComponentProps<'input'> {
  suffix: string;
}

const InputWithSuffix = React.forwardRef<HTMLInputElement, InputWithSuffixProps>(
  ({ suffix, className, value, placeholder, ...props }, ref) => {
    const measureRef = React.useRef<HTMLSpanElement>(null);
    const [suffixLeft, setSuffixLeft] = React.useState(0);

    const displayText = String(value || '');
    const showSuffix = displayText.length > 0;

    React.useEffect(() => {
      if (measureRef.current) {
        setSuffixLeft(measureRef.current.offsetWidth);
      }
    }, [displayText]);

    return (
      <div className="relative">
        <input
          ref={ref}
          value={value}
          placeholder={placeholder ? `${placeholder} ${suffix}` : undefined}
          className={cn(
            "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className,
          )}
          {...props}
        />
        {/* Hidden span to measure text width */}
        <span
          ref={measureRef}
          aria-hidden
          className="absolute top-0 left-3 h-0 overflow-hidden whitespace-pre text-base md:text-sm pointer-events-none"
          style={{ visibility: 'hidden' }}
        >
          {displayText}
        </span>
        {showSuffix && (
          <span
            className="absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none"
            style={{ left: `calc(0.75rem + ${suffixLeft}px + 0.35rem)` }}
          >
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

InputWithSuffix.displayName = 'InputWithSuffix';
export { InputWithSuffix };
