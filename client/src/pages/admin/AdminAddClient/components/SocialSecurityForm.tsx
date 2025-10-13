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

interface SocialSecurityFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleteSocialSecurity: () => void;
    fieldPrefix?: string;
}

const SocialSecurityForm = ({ isOpen, onOpenChange, onDeleteSocialSecurity, fieldPrefix = 'income' }: SocialSecurityFormProps) => {
    const form = useFormContext<InsertClient>();
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false });

    return (
        <>
            <Card>
                <Collapsible open={isOpen} onOpenChange={onOpenChange}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Borrower - Social Security</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteDialog({ isOpen: true })}
                                    className="hover:bg-red-500 hover:text-white"
                                    data-testid="button-delete-social-security"
                                    title="Delete Social Security Income"
                                >
                                    <Minus className="h-4 w-4 mr-2" />
                                    Remove
                                </Button>
                                <CollapsibleTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="hover:bg-orange-500 hover:text-white" 
                                        data-testid="button-toggle-social-security-income"
                                        title={isOpen ? 'Minimize' : 'Expand'}
                                        key={`social-security-income-${isOpen}`}
                                    >
                                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                        </div>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Gross Monthly Income"
                                    value={(() => {
                                        const rawValue = form.watch(`${fieldPrefix}.socialSecurityMonthlyAmount` as any) || '';
                                        const numVal = rawValue.replace(/[^\d]/g, '');
                                        return numVal ? `$${numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
                                    })()}
                                    onChange={(value) => {
                                        const cleanValue = value.replace(/[^\d]/g, '');
                                        form.setValue(`${fieldPrefix}.socialSecurityMonthlyAmount` as any, cleanValue);
                                    }}
                                    id={`${fieldPrefix}-socialSecurityMonthlyAmount`}
                                    placeholder="$0"
                                    testId={`input-${fieldPrefix}-socialSecurityMonthlyAmount`}
                                />
                                <DateInput
                                    label="Start Date"
                                    value={form.watch(`${fieldPrefix}.socialSecurityStartDate` as any) || ''}
                                    onChange={(value) => form.setValue(`${fieldPrefix}.socialSecurityStartDate` as any, value)}
                                    id={`${fieldPrefix}-socialSecurityStartDate`}
                                    testId={`input-${fieldPrefix}-socialSecurityStartDate`}
                                />
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            <DeleteConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false })}
                onConfirm={() => {
                    onDeleteSocialSecurity();
                    setDeleteDialog({ isOpen: false });
                }}
                title="Remove Social Security Income"
                description="Are you sure you want to remove the Social Security income section? This will clear all entered data and hide the section. This action cannot be undone."
                confirmButtonText="Remove"
                testId="dialog-delete-social-security"
                confirmButtonTestId="button-confirm-delete-social-security"
                cancelButtonTestId="button-cancel-delete-social-security"
            />
        </>
    );
};

export default SocialSecurityForm;