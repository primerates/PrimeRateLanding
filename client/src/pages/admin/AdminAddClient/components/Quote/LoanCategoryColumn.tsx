import { Button } from '@/components/ui/button';
import { type LoanCategoryOption } from '../../data/formOptions';

interface LoanCategoryColumnProps {
  title: string;
  titleSecondary?: string;
  options: LoanCategoryOption[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  hasExemptButton?: boolean;
  isExempt?: boolean;
  onExemptToggle?: () => void;
  exemptDisabled?: boolean;
  exemptTestId?: string;
}

const LoanCategoryColumn = ({
  title,
  titleSecondary,
  options,
  selectedCategory,
  onSelectCategory,
  hasExemptButton = false,
  isExempt = false,
  onExemptToggle,
  exemptDisabled = false,
  exemptTestId
}: LoanCategoryColumnProps) => {
  return (
    <div className="border-r pr-4 last:border-r-0">
      {/* Title with optional Exempt Button */}
      <div className={`px-2 py-1.5 ${hasExemptButton ? 'flex items-center justify-between' : ''}`}>
        <div className="text-base font-bold text-green-700">
          {title}
          {titleSecondary && <span className="text-sm"> {titleSecondary}</span>}
        </div>
        {hasExemptButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onExemptToggle?.();
            }}
            disabled={exemptDisabled}
            className={`h-4 px-1.5 text-[0.625rem] leading-none ${
              isExempt
                ? 'bg-green-600 text-white hover:bg-green-700 hover:text-white border-green-600'
                : ''
            }`}
            data-testid={exemptTestId}
          >
            Exempt
          </Button>
        )}
      </div>

      {/* Sub-options with squares */}
      <div className="ml-3 space-y-1">
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 py-1.5 px-2 hover-elevate rounded-md cursor-pointer"
            onClick={() => onSelectCategory(option.value)}
            data-testid={option.testId}
          >
            <div
              className={`w-3 h-3 border flex-shrink-0 ${
                selectedCategory === option.value
                  ? 'bg-green-700 border-green-700'
                  : 'border-current'
              }`}
            />
            <span className="text-sm">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanCategoryColumn;
