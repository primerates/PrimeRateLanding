import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Minus } from 'lucide-react';
import ExistingLoanForm from './ExistingLoanForm';
import DeleteConfirmationDialog from '../../dialogs/DeleteConfirmationDialog';

interface ExistingLoanCardProps {
  loanId: string;
  loanType: 'second' | 'third';
  onRemove: (loanId: string) => void;
  onAdd?: () => void;
  currentCount?: number;
  maxCount?: number;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

const ExistingLoanCard = ({
  loanId,
  loanType,
  onRemove,
  onAdd,
  currentCount = 1,
  maxCount = 10,
  expanded = true,
  onExpandChange
}: ExistingLoanCardProps) => {
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

  const handleAdd = () => {
    onAdd?.();
  };

  const getCardTitle = () => {
    return loanType === 'second' ? 'Existing Second Loan' : 'Existing Third Loan';
  };

  const getBorderStyles = () => {
    // Purple for second, orange for third
    return loanType === 'second'
      ? 'border-l-4 border-l-purple-500 hover:border-purple-500 focus-within:border-purple-500 transition-colors duration-200'
      : 'border-l-4 border-l-orange-500 hover:border-orange-500 focus-within:border-orange-500 transition-colors duration-200';
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
                  {/* Add Another Button - Only show if under max count */}
                  {onAdd && currentCount < maxCount && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="hover:bg-blue-500 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd();
                      }}
                      data-testid={`button-add-${loanType}-loan-${loanId}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another {loanType === 'second' ? 'Second' : 'Third'} Loan
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-500 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    data-testid={`button-delete-${loanType}-loan-${loanId}`}
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
              <ExistingLoanForm loanId={loanId} loanType={loanType} />
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
        description={`Are you sure you want to remove this ${loanType} loan? This will clear all entered data for this loan. This action cannot be undone.`}
        confirmButtonText="Remove"
        testId={`dialog-delete-${loanType}-loan-${loanId}`}
        confirmButtonTestId={`button-confirm-delete-${loanType}-loan-${loanId}`}
        cancelButtonTestId={`button-cancel-delete-${loanType}-loan-${loanId}`}
      />
    </>
  );
};

export default ExistingLoanCard;
