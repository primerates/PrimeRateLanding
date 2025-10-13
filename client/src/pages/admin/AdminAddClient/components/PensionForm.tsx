import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Minus } from 'lucide-react';
import { InsertClient } from '@shared/schema';
import FormInput from './FormInput';
import DateInput from './DateInput';
import DeleteConfirmationDialog from '../dialogs/DeleteConfirmationDialog';

interface PensionFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onDeletePension: () => void;
    showAnimation?: boolean;
    setShowAnimation?: (callback: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}

const PensionForm = ({ 
    isOpen, 
    onOpenChange, 
    onDeletePension,
    showAnimation,
    setShowAnimation 
}: PensionFormProps) => {
    const form = useFormContext<InsertClient>();
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false });
    const [deletePensionDialog, setDeletePensionDialog] = useState<{
        isOpen: boolean;
        pensionId: string;
    }>({ isOpen: false, pensionId: '' });

    // Generate unique ID for new pensions
    const generateUniqueId = (): string => {
        return `pension-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    };

    const addPension = () => {
        const currentPensions = form.watch('income.pensions') || [];
        const newPension = {
            id: generateUniqueId(),
            payerName: '',
            monthlyAmount: '',
            startDate: ''
        };
        form.setValue('income.pensions', [...currentPensions, newPension]);
    };

    const removePension = (pensionId: string) => {
        setDeletePensionDialog({ isOpen: true, pensionId });
    };

    const handleConfirmRemovePension = (pensionId: string) => {
        const currentPensions = form.watch('income.pensions') || [];
        const updatedPensions = currentPensions.filter(p => p.id !== pensionId);
        form.setValue('income.pensions', updatedPensions);
        
        // If no pensions left, uncheck the pension checkbox
        if (updatedPensions.length === 0) {
            form.setValue('income.incomeTypes.pension', false);
        }
        
        setDeletePensionDialog({ isOpen: false, pensionId: '' });
    };

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        if (open && !showAnimation && setShowAnimation) {
            setTimeout(() => {
                setShowAnimation((prev) => ({ ...prev, 'pension': true }));
                setTimeout(() => {
                    setShowAnimation((prev) => ({ ...prev, 'pension': false }));
                }, 800);
            }, 200);
        }
    };

    const pensions = form.watch('income.pensions') || [];

    return (
        <>
            <Card>
                <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Borrower - Pension</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addPension}
                                    className="hover:bg-blue-500 hover:text-white"
                                    data-testid="button-add-borrower-pension-header"
                                    title="Add New Pension"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Pension
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteDialog({ isOpen: true })}
                                    className="hover:bg-red-500 hover:text-white"
                                    data-testid="button-remove-default-pension"
                                    title="Delete Pension"
                                >
                                    <Minus className="h-4 w-4 mr-2" />
                                    Remove
                                </Button>
                                <CollapsibleTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="hover:bg-orange-500 hover:text-white" 
                                        data-testid="button-toggle-pension-income"
                                        title={isOpen ? 'Minimize' : 'Expand'}
                                        key={`pension-income-${isOpen}`}
                                    >
                                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                        </div>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            {pensions.map((pension, index) => (
                                <Card key={pension.id || index} className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium">Pension {index + 1}</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removePension(pension.id!)}
                                            className="hover:bg-orange-500 hover:text-white"
                                            data-testid={`button-remove-borrower-pension-${index}`}
                                            title="Delete Pension"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FormInput
                                            label="Payer Name"
                                            value={form.watch(`income.pensions.${index}.payerName`) || ''}
                                            onChange={(value) => form.setValue(`income.pensions.${index}.payerName`, value)}
                                            id={`income-pension-${index}-payerName`}
                                            placeholder="e.g., Federal Retirement Fund"
                                            testId={`input-income-pension-${index}-payerName`}
                                        />
                                        <FormInput
                                            label="Gross Monthly Income"
                                            value={(() => {
                                                const rawValue = form.watch(`income.pensions.${index}.monthlyAmount`) || '';
                                                const numVal = rawValue.replace(/[^\d]/g, '');
                                                return numVal ? `$${numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
                                            })()}
                                            onChange={(value) => {
                                                const cleanValue = value.replace(/[^\d]/g, '');
                                                form.setValue(`income.pensions.${index}.monthlyAmount`, cleanValue);
                                            }}
                                            id={`income-pension-${index}-monthlyAmount`}
                                            placeholder="$0"
                                            testId={`input-income-pension-${index}-monthlyAmount`}
                                        />
                                        <DateInput
                                            label="Start Date"
                                            value={form.watch(`income.pensions.${index}.startDate`) || ''}
                                            onChange={(value) => form.setValue(`income.pensions.${index}.startDate`, value)}
                                            id={`income-pension-${index}-startDate`}
                                            testId={`input-income-pension-${index}-startDate`}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            <DeleteConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false })}
                onConfirm={() => {
                    onDeletePension();
                    setDeleteDialog({ isOpen: false });
                }}
                title="Remove Pension Income"
                description="Are you sure you want to remove the Pension income section? This will clear all entered data and hide the section. This action cannot be undone."
                confirmButtonText="Remove"
                testId="dialog-delete-pension"
                confirmButtonTestId="button-confirm-delete-pension"
                cancelButtonTestId="button-cancel-delete-pension"
            />

            <DeleteConfirmationDialog
                isOpen={deletePensionDialog.isOpen}
                onClose={() => setDeletePensionDialog({ isOpen: false, pensionId: '' })}
                onConfirm={() => handleConfirmRemovePension(deletePensionDialog.pensionId)}
                title="Delete Pension"
                description="Are you sure you want to delete this pension entry? This action cannot be undone and will remove all associated pension information."
                testId="dialog-delete-individual-pension"
                confirmButtonTestId="button-confirm-delete-individual-pension"
                cancelButtonTestId="button-cancel-delete-individual-pension"
            />
        </>
    );
};

export default PensionForm;