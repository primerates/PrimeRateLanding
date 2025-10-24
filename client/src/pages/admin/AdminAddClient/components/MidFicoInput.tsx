import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type FicoType = 'mid-fico' | 'borrower-scores' | 'co-borrower-scores';

interface MidFicoInputProps {
  fieldPrefix: string;
  ficoType: FicoType;
  onCycleFicoType: () => void;
  onClickBorrowerScores: () => void;
  onClickCoBorrowerScores: () => void;
  calculatedMidFico: string;
  hasCoBorrower: boolean;
  testIdPrefix?: string;
}

const MidFicoInput = ({
  fieldPrefix,
  ficoType,
  onCycleFicoType,
  onClickBorrowerScores,
  onClickCoBorrowerScores,
  calculatedMidFico,
  hasCoBorrower,
  testIdPrefix
}: MidFicoInputProps) => {
  const form = useFormContext();

  const getLabel = (): string => {
    switch (ficoType) {
      case 'mid-fico':
        return 'Mid FICO';
      case 'borrower-scores':
        return 'Borrower Credit Scores';
      case 'co-borrower-scores':
        return 'Co-Borrower Credit Scores';
      default:
        return 'Mid FICO';
    }
  };

  const handleClick = () => {
    if (ficoType === 'borrower-scores') {
      onClickBorrowerScores();
    } else if (ficoType === 'co-borrower-scores') {
      if (hasCoBorrower) {
        onClickCoBorrowerScores();
      }
      // Could add a warning here if no co-borrower
    }
  };

  const isReadOnly = ficoType === 'mid-fico';
  const isClickable = ficoType === 'borrower-scores' || ficoType === 'co-borrower-scores';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={`${fieldPrefix}-midFico`} className="text-sm">
          {getLabel()}
        </Label>
        <Controller
          control={form.control}
          name={`${fieldPrefix}.midFico` as any}
          render={({ field }) => (
            <Switch
              checked={!!field.value || !!calculatedMidFico}
              onCheckedChange={onCycleFicoType}
              data-testid={`toggle-${testIdPrefix || fieldPrefix}-fico-type`}
              className="scale-[0.8]"
            />
          )}
        />
      </div>
      <Input
        id={`${fieldPrefix}-midFico`}
        {...(isReadOnly ? {} : form.register(`${fieldPrefix}.midFico` as any))}
        value={isReadOnly ? calculatedMidFico : undefined}
        placeholder="Enter"
        className="border border-input bg-background px-3 rounded-md"
        data-testid={`input-${testIdPrefix || fieldPrefix}-midFico`}
        readOnly={isReadOnly}
        onClick={handleClick}
        style={{
          cursor: isClickable ? 'pointer' : 'text'
        }}
      />
    </div>
  );
};

export default MidFicoInput;
