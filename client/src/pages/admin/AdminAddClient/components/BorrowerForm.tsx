import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Minus } from 'lucide-react';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormInput from './FormInput';
import DateInput from './DateInput';
import SSNInput from './SSNInput';
import FormSelect from './FormSelect';
import PhoneInput from './PhoneInput';
import { MARITAL_STATUS_OPTIONS, RELATIONSHIP_OPTIONS, CONTACT_TIME_OPTIONS } from '../data/formOptions';
import MaritalStatusDialog from '../dialogs/maritalStatusDialog';
import ResidenceForm from './ResidenceForm';
import AddressForm from './AddressForm';

interface BorrowerFormProps {
    isPrimary?: boolean;
}

const BorrowerForm = ({ isPrimary = true }: BorrowerFormProps) => {
    const form = useFormContext<InsertClient>();
    const {
        isBorrowerOpen,
        setIsBorrowerOpen,
        hasCoBorrower,
        addCoBorrower,
        removeCoBorrower,
        setMaritalStatusDialog,
        setCoBorrowerCountyOptions
    } = useAdminAddClientStore();

    // Field prefix based on whether this is primary borrower or co-borrower
    const fieldPrefix = isPrimary ? 'borrower' : 'coBorrower';
    const title = isPrimary ? 'Borrower' : 'Co-Borrower';
    const borderColor = isPrimary ? 'border-l-green-500 hover:border-green-500' : 'border-l-blue-500 hover:border-blue-500';

    return (
        <Card className={`border-l-4 ${borderColor} focus-within:border-green-500 transition-colors duration-200`}>
            <Collapsible open={isBorrowerOpen} onOpenChange={setIsBorrowerOpen}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{title}</CardTitle>
                        <div className="flex items-center gap-2">
                            {isPrimary && (
                                <>
                                    {!hasCoBorrower ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addCoBorrower}
                                            className="hover:bg-blue-500 hover:text-white"
                                            data-testid="button-add-coborrower-from-borrower"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Co-Borrower
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // Clear all coBorrower form data
                                                form.setValue('coBorrower', undefined as any);
                                                // Clear co-borrower county options
                                                setCoBorrowerCountyOptions([]);
                                                // Remove co-borrower from UI
                                                removeCoBorrower();
                                            }}
                                            className="hover:bg-red-500 hover:text-white"
                                            data-testid="button-remove-coborrower-from-borrower"
                                        >
                                            Remove Co-Borrower
                                        </Button>
                                    )}
                                </>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="hover:bg-orange-500 hover:text-black"
                                            data-testid="button-toggle-borrower"
                                        >
                                            {isBorrowerOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                        </Button>
                                    </CollapsibleTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{isBorrowerOpen ? 'Minimize' : 'Expand'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <FormInput
                                label="First Name"
                                value={form.watch(`${fieldPrefix}.firstName` as any) || ''}
                                onChange={(value) => form.setValue(`${fieldPrefix}.firstName` as any, value)}
                                id={`${fieldPrefix}-firstName`}
                                testId={`input-${fieldPrefix}-firstName`}
                                className='space-y-2'
                            />
                            <FormInput
                                label="Middle Name"
                                value={form.watch(`${fieldPrefix}.middleName` as any) || ''}
                                onChange={(value) => form.setValue(`${fieldPrefix}.middleName` as any, value)}
                                id={`${fieldPrefix}-middleName`}
                                testId={`input-${fieldPrefix}-middleName`}
                                className='space-y-2'
                            />
                            <FormInput
                                label="Last Name"
                                value={form.watch(`${fieldPrefix}.lastName` as any) || ''}
                                onChange={(value) => form.setValue(`${fieldPrefix}.lastName` as any, value)}
                                id={`${fieldPrefix}-lastName`}
                                testId={`input-${fieldPrefix}-lastName`}
                                className='space-y-2'
                            />
                            <DateInput
                                label="Date of Birth"
                                value={form.watch(`${fieldPrefix}.dateOfBirth` as any) || ''}
                                onChange={(value) => form.setValue(`${fieldPrefix}.dateOfBirth` as any, value)}
                                id={`${fieldPrefix}-dateOfBirth`}
                                testId={`input-${fieldPrefix}-dateOfBirth`}
                                className='space-y-2'
                            />
                            <SSNInput
                                label="SSN"
                                value={form.watch(`${fieldPrefix}.ssn` as any) || ''}
                                onChange={(value) => form.setValue(`${fieldPrefix}.ssn` as any, value)}
                                id={`${fieldPrefix}-ssn`}
                                testId={`input-${fieldPrefix}-ssn`}
                                className='space-y-2'
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <FormSelect
                                label="Marital Status"
                                value={form.watch(`${fieldPrefix}.maritalStatus` as any) || 'Select'}
                                onValueChange={(value) => {
                                    form.setValue(`${fieldPrefix}.maritalStatus` as any, value);
                                    // Only trigger co-borrower popup for primary borrower
                                    if (isPrimary && value === 'married' && !hasCoBorrower) {
                                        setMaritalStatusDialog({ isOpen: true });
                                    }
                                }}
                                options={MARITAL_STATUS_OPTIONS}
                                placeholder="Select"
                                testId={`select-${fieldPrefix}-maritalStatus`}
                                className="space-y-2"
                            />
                            <FormSelect
                                label="Relationship to Co-borrower"
                                value={form.watch(`${fieldPrefix}.relationshipToBorrower` as any) || 'N/A'}
                                onValueChange={(value) => form.setValue(`${fieldPrefix}.relationshipToBorrower` as any, value)}
                                options={RELATIONSHIP_OPTIONS}
                                placeholder="N/A"
                                testId={`select-${fieldPrefix}-relationshipToBorrower`}
                                className="space-y-2"
                            />
                            <PhoneInput
                                label="Phone"
                                value={form.watch(`${fieldPrefix}.phone` as any) || ''}
                                onChange={(value) => form.setValue(`${fieldPrefix}.phone` as any, value)}
                                id={`${fieldPrefix}-phone`}
                                testId={`input-${fieldPrefix}-phone`}
                                className="space-y-2"
                                placeholder=""
                            />
                            <FormInput
                                label="Email"
                                value={form.watch(`${fieldPrefix}.email` as any) || ''}
                                onChange={(value) => form.setValue(`${fieldPrefix}.email` as any, value)}
                                id={`${fieldPrefix}-email`}
                                testId={`input-${fieldPrefix}-email`}
                                className="space-y-2"
                            />
                            <FormSelect
                                label="Preferred Contact Time"
                                value={form.watch(`${fieldPrefix}.preferredContactTime` as any) || 'Select'}
                                onValueChange={(value) => form.setValue(`${fieldPrefix}.preferredContactTime` as any, value)}
                                options={CONTACT_TIME_OPTIONS}
                                placeholder="Select"
                                testId={`select-${fieldPrefix}-preferredContactTime`}
                                className="space-y-2"
                            />
                        </div>

                        {/* Extra spacing row */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-10">
                            <div className="space-y-2 flex items-center gap-2">
                                <ResidenceForm />
                            </div>
                        </div>

                        <AddressForm isPrimary={isPrimary} />
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
            {isPrimary && <MaritalStatusDialog />}
        </Card>
    );
};

export default BorrowerForm;