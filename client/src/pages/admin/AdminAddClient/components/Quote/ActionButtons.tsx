import { Button } from '@/components/ui/button';
import { Pin, FileText, StickyNote, BookOpen, Calculator, Printer, Plus, Minus } from 'lucide-react';

interface ActionButtonsProps {
  showCalculator?: boolean;
  isCardsMinimized?: boolean;
  onPinClick?: () => void;
  onPageClick?: () => void;
  onStickyNotesClick?: () => void;
  onGuidelinesClick?: () => void;
  onCalculatorClick?: () => void;
  onPrintClick?: () => void;
  onToggleMinimize?: () => void;
}

const ActionButtons = ({
  showCalculator = false,
  isCardsMinimized = false,
  onPinClick,
  onPageClick,
  onStickyNotesClick,
  onGuidelinesClick,
  onCalculatorClick,
  onPrintClick,
  onToggleMinimize
}: ActionButtonsProps) => {
  return (
    <div className="flex justify-end items-center gap-2 pt-4 px-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hover:bg-pink-500 hover:text-white"
        onClick={onPinClick}
        title="Pin Reference"
        data-testid="button-pin"
      >
        <Pin className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hover:bg-purple-500 hover:text-white"
        onClick={onPageClick}
        title="Page"
        data-testid="button-page"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hover:bg-yellow-500 hover:text-white"
        onClick={onStickyNotesClick}
        title="Sticky Notes"
        data-testid="button-sticky-notes"
      >
        <StickyNote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hover:bg-teal-500 hover:text-white"
        onClick={onGuidelinesClick}
        title="Guidelines"
        data-testid="button-open-book"
      >
        <BookOpen className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hover:bg-blue-500 hover:text-white"
        onClick={onCalculatorClick}
        title="Calculator"
        data-testid="button-calculator"
      >
        <Calculator className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hover:bg-green-500 hover:text-white"
        onClick={onPrintClick}
        title="Print Quote Details"
        data-testid="button-print-quote"
      >
        <Printer className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hover:bg-orange-500 hover:text-white"
        onClick={onToggleMinimize}
        title={isCardsMinimized ? 'Expand' : 'Minimize'}
        data-testid="button-toggle-quote-cards"
      >
        {isCardsMinimized ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default ActionButtons;
