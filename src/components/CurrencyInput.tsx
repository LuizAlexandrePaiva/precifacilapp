import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  /** Raw numeric value in reais (e.g. 1500.34) */
  value: number;
  /** Called with the raw numeric value */
  onValueChange: (value: number) => void;
}

function formatCents(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  const reaisStr = reais.toLocaleString('pt-BR');
  const centavosStr = centavos.toString().padStart(2, '0');
  return `R$ ${reaisStr},${centavosStr}`;
}

function valueToCents(value: number): number {
  return Math.round(value * 100);
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, className, ...props }, ref) => {
    const cents = valueToCents(value);
    const display = formatCents(cents);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow navigation keys
      if (['Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;

      e.preventDefault();

      if (e.key === 'Backspace') {
        const newCents = Math.floor(cents / 10);
        onValueChange(newCents / 100);
        return;
      }

      if (e.key === 'Delete') {
        onValueChange(0);
        return;
      }

      if (/^\d$/.test(e.key)) {
        const newCents = cents * 10 + parseInt(e.key);
        // Cap at 999,999,999.99
        if (newCents > 99999999999) return;
        onValueChange(newCents / 100);
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      const digits = text.replace(/\D/g, '');
      if (digits) {
        const newCents = parseInt(digits);
        if (newCents <= 99999999999) {
          onValueChange(newCents / 100);
        }
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={() => {}} // controlled via keyDown
        className={cn(className)}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
export { CurrencyInput };
