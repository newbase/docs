import * as React from "react"
import { cn } from "@/lib/cn"

export interface CodeInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  label?: string;
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
}

const CodeInput = React.forwardRef<HTMLDivElement, CodeInputProps>(
  ({ length = 6, value, onChange, error, label, onComplete, autoFocus = false }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    React.useEffect(() => {
      if (autoFocus) {
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    }, [autoFocus]);

    const handleChange = (index: number, inputValue: string) => {
      const newValue = inputValue.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
      if (!newValue && inputValue !== '') return;

      const newCode = [...value];
      newCode[index] = newValue;
      onChange(newCode);

      // Move to next input if value is entered
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Call onComplete if all fields are filled
      if (onComplete && newCode.every(v => v) && newCode.length === length) {
        onComplete(newCode.join(''));
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length);
      const newCode = [...value];
      
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      
      onChange(newCode);
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      // Call onComplete if all fields are filled
      if (onComplete && newCode.every(v => v) && newCode.length === length) {
        onComplete(newCode.join(''));
      }
    };

    return (
      <div ref={ref} className="w-full">
        {label && (
          <label className="block text-base font-medium text-gray-600 ml-0.5 mb-2">
            {label}
          </label>
        )}
        
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {Array.from({ length }).map((_, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              value={value[index] || ''}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                "w-10 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all",
                "focus:outline-none focus:ring-2 focus:ring-brand-500",
                error 
                  ? "border-red-300 bg-red-50 focus:ring-red-500" 
                  : "border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500"
              )}
              maxLength={1}
              autoComplete="off"
            />
          ))}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
CodeInput.displayName = "CodeInput"

export { CodeInput }
