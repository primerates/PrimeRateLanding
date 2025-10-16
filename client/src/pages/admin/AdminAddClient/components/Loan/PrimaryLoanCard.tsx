import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Minus } from 'lucide-react';
import PrimaryLoanForm from './PrimaryLoanForm';
import DeleteConfirmationDialog from '../../dialogs/DeleteConfirmationDialog';

interface PrimaryLoanCardProps {
  loanId: string;
  onRemove: (loanId: string) => void;
  onAdd?: () => void;
  currentCount?: number;
  maxCount?: number;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

const PrimaryLoanCard = ({
  loanId,
  onRemove,
  onAdd,
  currentCount = 1,
  maxCount = 2,
  expanded = true,
  onExpandChange
}: PrimaryLoanCardProps) => {
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
    return 'Existing Primary Loan';
  };

  const getBorderStyles = () => {
    return 'border-l-4 border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500 transition-colors duration-200';
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
                      data-testid={`button-add-primary-loan-${loanId}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Primary Loan
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
              <PrimaryLoanForm loanId={loanId} />
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
        description="Are you sure you want to remove this primary loan? This will clear all entered data for this loan. This action cannot be undone."
        confirmButtonText="Remove"
        testId={`dialog-delete-loan-${loanId}`}
        confirmButtonTestId={`button-confirm-delete-loan-${loanId}`}
        cancelButtonTestId={`button-cancel-delete-loan-${loanId}`}
      />
    </>
  );
};

export default PrimaryLoanCard;
