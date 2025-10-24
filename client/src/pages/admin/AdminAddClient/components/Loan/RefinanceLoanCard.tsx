import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Minus } from 'lucide-react';
import RefinanceLoanForm from './RefinanceLoanForm';
import DeleteConfirmationDialog from '../../dialogs/DeleteConfirmationDialog';

type FicoType = 'mid-fico' | 'borrower-scores' | 'co-borrower-scores';

interface RefinanceLoanCardProps {
  loanId: string;
  onRemove: (loanId: string) => void;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  ficoType?: FicoType;
  onCycleFicoType?: () => void;
  onOpenBorrowerScores?: () => void;
  onOpenCoBorrowerScores?: () => void;
  calculatedMidFico?: string;
  hasCoBorrower?: boolean;
}

const RefinanceLoanCard = ({
  loanId,
  onRemove,
  expanded = true,
  onExpandChange,
  ficoType = 'mid-fico',
  onCycleFicoType = () => {},
  onOpenBorrowerScores = () => {},
  onOpenCoBorrowerScores = () => {},
  calculatedMidFico = '',
  hasCoBorrower = false
}: RefinanceLoanCardProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false });

  // Sync local state with prop changes (for expand/collapse all functionality)
  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  const handleExpandToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandChange?.(newExpanded);
  };

  const handleRemove = () => {
    setDeleteDialog({ isOpen: true });
  };

  const handleConfirmDelete = () => {
    onRemove(loanId);
    setDeleteDialog({ isOpen: false });
  };

  const getCardTitle = () => {
    return 'New Refinance Loan';
  };

  const getBorderStyles = () => {
    return 'border-l-4 border-l-green-500 hover:border-green-500 focus-within:border-green-500 transition-colors duration-200';
  };

  return (
    <>
      <Card className={`transition-all duration-700 ${getBorderStyles()}`}>
        <Collapsible open={isExpanded} onOpenChange={handleExpandToggle}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {getCardTitle()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-500 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    data-testid={`button-delete-loan-${loanId}`}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:bg-orange-500 hover:text-white"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <RefinanceLoanForm
                loanId={loanId}
                ficoType={ficoType}
                onCycleFicoType={onCycleFicoType}
                onOpenBorrowerScores={onOpenBorrowerScores}
                onOpenCoBorrowerScores={onOpenCoBorrowerScores}
                calculatedMidFico={calculatedMidFico}
                hasCoBorrower={hasCoBorrower}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={`Remove ${getCardTitle()}`}
        description="Are you sure you want to remove this refinance loan? This will clear all entered data for this loan. This action cannot be undone."
        confirmButtonText="Remove"
        testId={`dialog-delete-loan-${loanId}`}
        confirmButtonTestId={`button-confirm-delete-loan-${loanId}`}
        cancelButtonTestId={`button-cancel-delete-loan-${loanId}`}
      />
    </>
  );
};

export default RefinanceLoanCard;