import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus } from 'lucide-react';
import LoanCategoryColumn from './LoanCategoryColumn';
import {
  VA_OPTIONS,
  VA_JUMBO_OPTIONS,
  FANNIE_CONV_OPTIONS,
  FANNIE_JUMBO_OPTIONS,
  FHA_OPTIONS,
  NON_QM_OPTIONS,
  SECOND_LOAN_OPTIONS
} from '../../data/formOptions';

interface LoanCategorySelectProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isVAExempt?: boolean;
  isVAJumboExempt?: boolean;
  onVAExemptChange?: (exempt: boolean) => void;
  onVAJumboExemptChange?: (exempt: boolean) => void;
}

const LoanCategorySelect = ({
  selectedCategory,
  onCategoryChange,
  isVAExempt = false,
  isVAJumboExempt = false,
  onVAExemptChange,
  onVAJumboExemptChange
}: LoanCategorySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectCategory = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  const handleVAExemptToggle = () => {
    const isVASelected = selectedCategory?.startsWith('VA - ');
    if (isVASelected) {
      if (isVAJumboExempt) {
        onVAJumboExemptChange?.(false);
      }
      onVAExemptChange?.(!isVAExempt);
    }
  };

  const handleVAJumboExemptToggle = () => {
    const isVAJumboSelected = selectedCategory?.startsWith('VA Jumbo - ');
    if (isVAJumboSelected) {
      if (isVAExempt) {
        onVAExemptChange?.(false);
      }
      onVAJumboExemptChange?.(!isVAJumboExempt);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="category-select">
        Loan Category
        {(isVAExempt || isVAJumboExempt) && <span className="text-green-600 ml-2">- Exempt</span>}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            data-testid="button-category-select"
          >
            {selectedCategory || "Select"}
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[1400px] p-3" align="start">
          <div className="space-y-2">
            {/* Select Option */}
            <div
              className="flex items-center space-x-2 py-1.5 px-2 hover-elevate rounded-md cursor-pointer"
              onClick={() => handleSelectCategory('')}
              data-testid="option-category-select"
            >
              <span className="text-sm">Select</span>
            </div>

            {/* All Loan Categories Side by Side */}
            <div className="grid grid-cols-7 gap-4 border-t pt-2">
              {/* VA Section */}
              <LoanCategoryColumn
                title="VA"
                options={VA_OPTIONS}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                hasExemptButton={true}
                isExempt={isVAExempt}
                onExemptToggle={handleVAExemptToggle}
                exemptDisabled={!selectedCategory?.startsWith('VA - ')}
                exemptTestId="button-va-exempt"
              />

              {/* VA Jumbo Section */}
              <LoanCategoryColumn
                title="VA"
                titleSecondary="Jumbo"
                options={VA_JUMBO_OPTIONS}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                hasExemptButton={true}
                isExempt={isVAJumboExempt}
                onExemptToggle={handleVAJumboExemptToggle}
                exemptDisabled={!selectedCategory?.startsWith('VA Jumbo - ')}
                exemptTestId="button-va-jumbo-exempt"
              />

              {/* Fannie Conv Section */}
              <LoanCategoryColumn
                title="Fannie Conv"
                options={FANNIE_CONV_OPTIONS}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />

              {/* Fannie Jumbo Section */}
              <LoanCategoryColumn
                title="Fannie Jumbo"
                options={FANNIE_JUMBO_OPTIONS}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />

              {/* FHA Section */}
              <LoanCategoryColumn
                title="FHA"
                options={FHA_OPTIONS}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />

              {/* Non-QM Section */}
              <LoanCategoryColumn
                title="Non-QM"
                options={NON_QM_OPTIONS}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />

              {/* Second Loan Section */}
              <LoanCategoryColumn
                title="Second Loan"
                options={SECOND_LOAN_OPTIONS}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LoanCategorySelect;
