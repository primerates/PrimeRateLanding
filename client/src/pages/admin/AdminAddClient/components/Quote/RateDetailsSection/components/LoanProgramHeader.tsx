import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoanProgramHeaderProps {
  quoteLoanProgram: string;
  setQuoteLoanProgram: (value: string) => void;
  showLoanProgramControls: boolean;
  setShowLoanProgramControls: (show: boolean) => void;
  loanProgramFontSize: string;
  setLoanProgramFontSize: (size: string) => void;
  loanProgramColor: string;
  setLoanProgramColor: (color: string) => void;
  loanProgramTextareaRef: React.RefObject<HTMLTextAreaElement>;
}

/**
 * Loan Program Header with editable text and styling controls
 */
const LoanProgramHeader = ({
  quoteLoanProgram,
  setQuoteLoanProgram,
  showLoanProgramControls,
  setShowLoanProgramControls,
  loanProgramFontSize,
  setLoanProgramFontSize,
  loanProgramColor,
  setLoanProgramColor,
  loanProgramTextareaRef
}: LoanProgramHeaderProps) => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="w-full">
        <textarea
          ref={loanProgramTextareaRef}
          placeholder="Loan Type"
          value={quoteLoanProgram}
          onChange={(e) => setQuoteLoanProgram(e.target.value)}
          onFocus={() => setShowLoanProgramControls(true)}
          onBlur={() => setTimeout(() => setShowLoanProgramControls(false), 200)}
          rows={2}
          className={`bg-transparent border-0 ${loanProgramFontSize} ${loanProgramColor} font-semibold text-center focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 resize-none w-full`}
          data-testid="input-quote-loan-program"
        />

        {/* Font Controls */}
        {showLoanProgramControls && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-md shadow-lg p-3 z-50 flex gap-4"
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Font Size</Label>
              <Select
                value={loanProgramFontSize}
                onValueChange={(value) => {
                  setLoanProgramFontSize(value);
                  setTimeout(() => loanProgramTextareaRef.current?.focus(), 0);
                }}
              >
                <SelectTrigger className="w-32 h-8" data-testid="select-loan-program-font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-xl">Small</SelectItem>
                  <SelectItem value="text-2xl">Medium</SelectItem>
                  <SelectItem value="text-3xl">Large</SelectItem>
                  <SelectItem value="text-4xl">X-Large</SelectItem>
                  <SelectItem value="text-5xl">XX-Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Font Color</Label>
              <Select
                value={loanProgramColor}
                onValueChange={(value) => {
                  setLoanProgramColor(value);
                  setTimeout(() => loanProgramTextareaRef.current?.focus(), 0);
                }}
              >
                <SelectTrigger className="w-32 h-8" data-testid="select-loan-program-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-foreground">Default</SelectItem>
                  <SelectItem value="text-primary">Primary</SelectItem>
                  <SelectItem value="text-blue-600">Blue</SelectItem>
                  <SelectItem value="text-green-600">Green</SelectItem>
                  <SelectItem value="text-red-600">Red</SelectItem>
                  <SelectItem value="text-purple-600">Purple</SelectItem>
                  <SelectItem value="text-orange-600">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanProgramHeader;
