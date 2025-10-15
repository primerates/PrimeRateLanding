import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Minus } from 'lucide-react';
import { InsertClient } from '@shared/schema';
import FormInput from '../FormInput';
import DateInput from '../DateInput';
import DisabilityOption from './DisabilityOption';
import DeleteConfirmationDialog from '../../dialogs/DeleteConfirmationDialog';

interface DisabilityCardProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleteDisability: () => void;
    fieldPrefix?: string;
}

const DisabilityCard = ({ isOpen, onOpenChange, onDeleteDisability, fieldPrefix = 'income' }: DisabilityCardProps) => {
    const form = useFormContext<InsertClient>();
    
    // Local state for disability type selections
    const [vaDisabilitySelected, setVaDisabilitySelected] = useState(false);
    const [otherDisabilitySelected, setOtherDisabilitySelected] = useState(false);
    
    // Dialog states
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false });
    const [deleteVaTypeDialog, setDeleteVaTypeDialog] = useState({ isOpen: false });
    const [deleteOtherTypeDialog, setDeleteOtherTypeDialog] = useState({ isOpen: false });

    const handleVaDisabilityToggle = () => {
        if (vaDisabilitySelected) {
            setDeleteVaTypeDialog({ isOpen: true });
        } else {
            setVaDisabilitySelected(true);
        }
    };

    const handleOtherDisabilityToggle = () => {
        if (otherDisabilitySelected) {
            setDeleteOtherTypeDialog({ isOpen: true });
        } else {
            setOtherDisabilitySelected(true);
        }
    };

    const handleConfirmDeleteVaType = () => {
        setVaDisabilitySelected(false);
        // Clear VA disability form fields
        form.setValue(`${fieldPrefix}.vaBenefitsMonthlyAmount` as any, '');
        form.setValue(`${fieldPrefix}.vaBenefitsStartDate` as any, '');
        setDeleteVaTypeDialog({ isOpen: false });
    };

    const handleConfirmDeleteOtherType = () => {
        setOtherDisabilitySelected(false);
        // Clear other disability form fields
        form.setValue(`${fieldPrefix}.disabilityMonthlyAmount` as any, '');
        form.setValue(`${fieldPrefix}.disabilityStartDate` as any, '');
        setDeleteOtherTypeDialog({ isOpen: false });
    };

    return (
        <>
            <Card>
                <Collapsible open={isOpen} onOpenChange={onOpenChange}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Borrower - Disability</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteDialog({ isOpen: true })}
                                    className="hover:bg-red-500 hover:text-white"
                                    data-testid="button-delete-disability"
                                    title="Delete Disability Income"
                                >
                                    <Minus className="h-4 w-4 mr-2" />
                                    Remove
                                </Button>
                                <CollapsibleTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="hover:bg-orange-500 hover:text-white" 
                                        data-testid="button-toggle-disability-income"
                                        title={isOpen ? 'Minimize' : 'Expand'}
                                        key={`disability-income-${isOpen}`}
                                    >
                                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                        </div>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            {/* Disability Type Selection */}
                            <Card className="bg-muted">
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <div className="flex gap-4">
                                            <DisabilityOption
                                                id="disability-va"
                                                label="VA Disability"
                                                selected={vaDisabilitySelected}
                                                onToggle={handleVaDisabilityToggle}
                                                testId="circle-disability-va"
                                            />
                                            
                                            <DisabilityOption
                                                id="disability-other"
                                                label="Other Disability"
                                                selected={otherDisabilitySelected}
                                                onToggle={handleOtherDisabilityToggle}
                                                testId="circle-disability-other"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* VA Disability Benefits Row - Only show when VA Disability is selected */}
                            {vaDisabilitySelected && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="VA Disability Benefits - Gross Monthly Income"
                                        value={(() => {
                                            const rawValue = form.watch(`${fieldPrefix}.vaBenefitsMonthlyAmount` as any) || '';
                                            const numVal = rawValue.replace(/[^\d]/g, '');
                                            return numVal ? `$${numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
                                        })()}
                                        onChange={(value) => {
                                            const cleanValue = value.replace(/[^\d]/g, '');
                                            form.setValue(`${fieldPrefix}.vaBenefitsMonthlyAmount` as any, cleanValue);
                                        }}
                                        id={`${fieldPrefix}-vaBenefitsMonthlyAmount`}
                                        placeholder="$0"
                                        testId={`input-${fieldPrefix}-vaBenefitsMonthlyAmount`}
                                    />
                                    <DateInput
                                        label="Start Date"
                                        value={form.watch(`${fieldPrefix}.vaBenefitsStartDate` as any) || ''}
                                        onChange={(value) => form.setValue(`${fieldPrefix}.vaBenefitsStartDate` as any, value)}
                                        id={`${fieldPrefix}-vaBenefitsStartDate`}
                                        testId={`input-${fieldPrefix}-vaBenefitsStartDate`}
                                    />
                                </div>
                            )}

                            {/* Other Disability Row - Only show when Other Disability is selected */}
                            {otherDisabilitySelected && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Disability - Gross Monthly Income"
                                        value={(() => {
                                            const rawValue = form.watch(`${fieldPrefix}.disabilityMonthlyAmount` as any) || '';
                                            const numVal = rawValue.replace(/[^\d]/g, '');
                                            return numVal ? `$${numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
                                        })()}
                                        onChange={(value) => {
                                            const cleanValue = value.replace(/[^\d]/g, '');
                                            form.setValue(`${fieldPrefix}.disabilityMonthlyAmount` as any, cleanValue);
                                        }}
                                        id={`${fieldPrefix}-disabilityMonthlyAmount`}
                                        placeholder="$0"
                                        testId={`input-${fieldPrefix}-disabilityMonthlyAmount`}
                                    />
                                    <DateInput
                                        label="Start Date"
                                        value={form.watch(`${fieldPrefix}.disabilityStartDate` as any) || ''}
                                        onChange={(value) => form.setValue(`${fieldPrefix}.disabilityStartDate` as any, value)}
                                        id={`${fieldPrefix}-disabilityStartDate`}
                                        testId={`input-${fieldPrefix}-disabilityStartDate`}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Delete entire disability section dialog */}
            <DeleteConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false })}
                onConfirm={() => {
                    onDeleteDisability();
                    setDeleteDialog({ isOpen: false });
                }}
                title="Remove Disability Income"
                description="Are you sure you want to remove the Disability income section? This will clear all entered data and hide the section. This action cannot be undone."
                confirmButtonText="Remove"
                testId="dialog-delete-disability"
                confirmButtonTestId="button-confirm-delete-disability"
                cancelButtonTestId="button-cancel-delete-disability"
            />

            {/* Delete VA disability type dialog */}
            <DeleteConfirmationDialog
                isOpen={deleteVaTypeDialog.isOpen}
                onClose={() => setDeleteVaTypeDialog({ isOpen: false })}
                onConfirm={handleConfirmDeleteVaType}
                title="Remove VA Disability"
                description="Are you sure you want to remove VA Disability? This will clear all VA disability data."
                confirmButtonText="Remove"
                testId="dialog-delete-va-disability-type"
                confirmButtonTestId="button-confirm-delete-va-disability-type"
                cancelButtonTestId="button-cancel-delete-va-disability-type"
            />

            {/* Delete other disability type dialog */}
            <DeleteConfirmationDialog
                isOpen={deleteOtherTypeDialog.isOpen}
                onClose={() => setDeleteOtherTypeDialog({ isOpen: false })}
                onConfirm={handleConfirmDeleteOtherType}
                title="Remove Other Disability"
                description="Are you sure you want to remove Other Disability? This will clear all other disability data."
                confirmButtonText="Remove"
                testId="dialog-delete-other-disability-type"
                confirmButtonTestId="button-confirm-delete-other-disability-type"
                cancelButtonTestId="button-cancel-delete-other-disability-type"
            />
        </>
    );
};

export default DisabilityCard;