import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import FormInput from '../components/FormInput';

interface CreditScoresDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  scores: {
    experian: string;
    equifax: string;
    transunion: string;
    midFico: string;
  };
  onScoresChange: (scores: { experian: string; equifax: string; transunion: string; midFico: string }) => void;
  testIdPrefix?: string;
}

const CreditScoresDialog = ({
  isOpen,
  onClose,
  title,
  scores,
  onScoresChange,
  testIdPrefix = 'credit-scores'
}: CreditScoresDialogProps) => {
  // Calculate Mid FICO based on the three scores
  const calculateMidFico = (experian: string, equifax: string, transunion: string): string => {
    const allScores = [
      parseInt(experian) || 0,
      parseInt(equifax) || 0,
      parseInt(transunion) || 0
    ].filter(score => score > 0).sort((a, b) => a - b);

    if (allScores.length === 3) {
      return allScores[1].toString(); // Middle value
    } else if (allScores.length === 2) {
      return 'Pending'; // Show "Pending" when only 2 fields filled
    } else if (allScores.length === 1) {
      return allScores[0].toString(); // Only one score
    } else {
      return '';
    }
  };

  const handleScoreChange = (field: 'experian' | 'equifax' | 'transunion', value: string) => {
    // Only allow numeric characters, max 3 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 3);

    const updated = {
      ...scores,
      [field]: numericValue
    };

    // Calculate Mid FICO
    updated.midFico = calculateMidFico(
      field === 'experian' ? numericValue : scores.experian,
      field === 'equifax' ? numericValue : scores.equifax,
      field === 'transunion' ? numericValue : scores.transunion
    );

    onScoresChange(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xs" data-testid={`dialog-${testIdPrefix}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mid FICO Display */}
          <div className="space-y-2 mt-6">
            <Label htmlFor={`${testIdPrefix}-mid-fico`} className="text-lg">
              {title.includes('Co-Borrower') ? 'Co-Borrower' : 'Borrower'} Mid FICO
            </Label>
            <div
              className="text-4xl font-bold text-blue-900 py-2"
              data-testid={`display-${testIdPrefix}-mid-fico`}
            >
              {scores.midFico || "000"}
            </div>
          </div>

          {/* Experian Score */}
          <FormInput
            label="Experian"
            value={scores.experian}
            onChange={(value) => handleScoreChange('experian', value)}
            id={`${testIdPrefix}-experian`}
            placeholder="000"
            maxLength={3}
            testId={`input-${testIdPrefix}-experian`}
            className="space-y-2"
            labelClassName="text-green-600 font-medium text-lg"
          />

          {/* Equifax Score */}
          <FormInput
            label="Equifax"
            value={scores.equifax}
            onChange={(value) => handleScoreChange('equifax', value)}
            id={`${testIdPrefix}-equifax`}
            placeholder="000"
            maxLength={3}
            testId={`input-${testIdPrefix}-equifax`}
            className="space-y-2"
            labelClassName="text-purple-600 font-medium text-lg"
          />

          {/* TransUnion Score */}
          <FormInput
            label="TransUnion"
            value={scores.transunion}
            onChange={(value) => handleScoreChange('transunion', value)}
            id={`${testIdPrefix}-transunion`}
            placeholder="000"
            maxLength={3}
            testId={`input-${testIdPrefix}-transunion`}
            className="space-y-2"
            labelClassName="text-orange-600 font-medium text-lg"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-testid={`button-cancel-${testIdPrefix}`}
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            data-testid={`button-save-${testIdPrefix}`}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditScoresDialog;
