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

const BorrowerForm = () => {
    const form = useFormContext<InsertClient>();
    const {
        isBorrowerOpen,
        setIsBorrowerOpen,
        hasCoBorrower,
        addCoBorrower,
        removeCoBorrower,
        setMaritalStatusDialog
    } = useAdminAddClientStore();

    return (
        <Card className="border-l-4 border-l-green-500 hover:border-green-500 focus-within:border-green-500 transition-colors duration-200">
            <Collapsible open={isBorrowerOpen} onOpenChange={setIsBorrowerOpen}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Borrower</CardTitle>
                        <div className="flex items-center gap-2">
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
                                    onClick={removeCoBorrower}
                                    className="hover:bg-red-500 hover:text-white"
                                    data-testid="button-remove-coborrower-from-borrower"
                                >
                                    Remove Co-Borrower
                                </Button>
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
                                value={form.watch('borrower.firstName') || ''}
                                onChange={(value) => form.setValue('borrower.firstName', value)}
                                id="borrower-firstName"
                                testId="input-borrower-firstName"
                                className='space-y-2'
                            />
                            <FormInput
                                label="Middle Name"
                                value={form.watch('borrower.middleName') || ''}
                                onChange={(value) => form.setValue('borrower.middleName', value)}
                                id="borrower-middleName"
                                testId="input-borrower-middleName"
                                className='space-y-2'
                            />
                            <FormInput
                                label="Last Name"
                                value={form.watch('borrower.lastName') || ''}
                                onChange={(value) => form.setValue('borrower.lastName', value)}
                                id="borrower-lastName"
                                testId="input-borrower-lastName"
                                className='space-y-2'
                            />
                            <DateInput
                                label="Date of Birth"
                                value={form.watch('borrower.dateOfBirth') || ''}
                                onChange={(value) => form.setValue('borrower.dateOfBirth', value)}
                                id="borrower-dateOfBirth"
                                testId="input-borrower-dateOfBirth"
                                className='space-y-2'
                            />
                            <SSNInput
                                label="SSN"
                                value={form.watch('borrower.ssn') || ''}
                                onChange={(value) => form.setValue('borrower.ssn', value)}
                                id="borrower-ssn"
                                testId="input-borrower-ssn"
                                className='space-y-2'
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <FormSelect
                                label="Marital Status"
                                value={form.watch('borrower.maritalStatus') || 'Select'}
                                onValueChange={(value) => {
                                    form.setValue('borrower.maritalStatus', value as any);
                                    // Trigger co-borrower popup when married is selected
                                    if (value === 'married' && !hasCoBorrower) {
                                        setMaritalStatusDialog({ isOpen: true });
                                    }
                                }}
                                options={MARITAL_STATUS_OPTIONS}
                                placeholder="Select"
                                testId="select-borrower-maritalStatus"
                                className="space-y-2"
                            />
                            <FormSelect
                                label="Relationship to Co-borrower"
                                value={form.watch('borrower.relationshipToBorrower') || 'N/A'}
                                onValueChange={(value) => form.setValue('borrower.relationshipToBorrower', value as any)}
                                options={RELATIONSHIP_OPTIONS}
                                placeholder="N/A"
                                testId="select-borrower-relationshipToBorrower"
                                className="space-y-2"
                            />
                            <PhoneInput
                                label="Phone"
                                value={form.watch('borrower.phone') || ''}
                                onChange={(value) => form.setValue('borrower.phone', value)}
                                id="borrower-phone"
                                testId="input-borrower-phone"
                                className="space-y-2"
                                placeholder=""
                            />
                            <FormInput
                                label="Email"
                                value={form.watch('borrower.email') || ''}
                                onChange={(value) => form.setValue('borrower.email', value)}
                                id="borrower-email"
                                testId="input-borrower-email"
                                className="space-y-2"
                            />
                            <FormSelect
                                label="Preferred Contact Time"
                                value={form.watch('borrower.preferredContactTime') || 'Select'}
                                onValueChange={(value) => form.setValue('borrower.preferredContactTime', value as any)}
                                options={CONTACT_TIME_OPTIONS}
                                placeholder="Select"
                                testId="select-borrower-preferredContactTime"
                                className="space-y-2"
                            />
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
            <MaritalStatusDialog />
        </Card>
    );
};

export default BorrowerForm;