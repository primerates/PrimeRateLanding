import { Card, CardContent } from "@/components/ui/card";
import { useFormContext } from 'react-hook-form';
import { useMemo } from 'react';
import { type InsertClient } from '@shared/schema';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import { US_STATES_OPTIONS } from '../data/formOptions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const AddressForm = () => {
    const form = useFormContext<InsertClient>();
    const {
        borrowerCountyOptions,
        countyLookupLoading,
        isBorrowerCurrentResidencePresent,
        setBorrowerCountyOptions,
        setCountyLookupLoading,
        setIsBorrowerCurrentResidencePresent
    } = useAdminAddClientStore();

    // Duration calculator
    const { displayValue, years, months } = useMemo(() => {
        const fromDate = form.watch('borrower.residenceAddress.from') || '';
        const toDate = form.watch('borrower.residenceAddress.to') || '';
        
        if (!fromDate || !toDate) return { displayValue: '', years: 0, months: 0 };
        
        const from = new Date(fromDate);
        // If toDate is "Present", use current date for calculations
        const to = toDate === 'Present' ? new Date() : new Date(toDate);
        
        if (isNaN(from.getTime()) || isNaN(to.getTime())) return { displayValue: '', years: 0, months: 0 };
        
        // Calculate difference in months accounting for days
        let yearsDiff = to.getFullYear() - from.getFullYear();
        let monthsDiff = to.getMonth() - from.getMonth();
        let daysDiff = to.getDate() - from.getDate();
        
        // If the TO day is greater than or equal to FROM day, we're into the next month period
        if (daysDiff >= 0) {
            monthsDiff += 1;
        }
        
        let totalMonths = yearsDiff * 12 + monthsDiff;
        if (totalMonths < 0) return { displayValue: '', years: 0, months: 0 };
        
        const calcYears = Math.floor(totalMonths / 12);
        const calcMonths = totalMonths % 12;
        
        // Display with Years or Months suffix based on value
        let display = '';
        if (calcYears >= 1) {
            // Show as Years (e.g., "1.6 Years" or "2 Years")
            const yearValue = calcMonths === 0 ? calcYears.toString() : `${calcYears}.${calcMonths}`;
            display = `${yearValue} Years`;
        } else if (calcMonths > 0) {
            // Show as Months (e.g., "0.4 Months")
            display = `0.${calcMonths} Months`;
        }
        
        return { displayValue: display, years: calcYears, months: calcMonths };
    }, [form.watch('borrower.residenceAddress.from'), form.watch('borrower.residenceAddress.to')]);

    // Update form values for years and months
    useMemo(() => {
        form.setValue('borrower.yearsAtAddress', years.toString(), { shouldDirty: false });
        form.setValue('borrower.monthsAtAddress', months.toString(), { shouldDirty: false });
    }, [years, months, form]);

    const autoCopyBorrowerAddressToPrimaryProperty = () => {
        const borrowerAddress = form.getValues('borrower.residenceAddress');
        const properties = form.watch('property.properties') || [];
        const primaryPropertyIndex = properties.findIndex(p => p.use === 'primary');

        if (primaryPropertyIndex >= 0 && borrowerAddress) {
            form.setValue(`property.properties.${primaryPropertyIndex}.address` as any, {
                street: borrowerAddress.street || '',
                unit: borrowerAddress.unit || '',
                city: borrowerAddress.city || '',
                state: borrowerAddress.state || '',
                zip: borrowerAddress.zip || '',
                county: borrowerAddress.county || ''
            });
        }
    };

    const lookupCountyFromZip = async (zipCode: string): Promise<Array<{ value: string, label: string }>> => {
        if (!zipCode || zipCode.length < 5) return [];

        try {
            const response = await fetch(`/api/county-lookup/${zipCode}`);
            if (response.ok) {
                const data = await response.json();
                return data.counties || [];
            }
        } catch (error) {
            console.error('County lookup failed:', error);
        }
        return [];
    };

    const handleBorrowerZipCodeLookup = async (zipCode: string) => {
        if (!zipCode || zipCode.length < 5) {
            setBorrowerCountyOptions([]);
            return;
        }

        setCountyLookupLoading((prev) => ({ ...prev, borrower: true }));
        const counties = await lookupCountyFromZip(zipCode);

        if (counties.length === 1) {
            // Auto-fill single county result
            form.setValue('borrower.residenceAddress.county', counties[0].label, { shouldDirty: true });
            setBorrowerCountyOptions([]); // Keep as input field but with value filled
        } else if (counties.length > 1) {
            // Show dropdown for multiple counties
            setBorrowerCountyOptions(counties);
        } else {
            // No counties found, keep as input field
            setBorrowerCountyOptions([]);
        }

        setCountyLookupLoading((prev) => ({ ...prev, borrower: false }));
    };

    return (
        <Card className={`bg-muted mt-8  ? 'animate-roll-down-subject-property' : ''}`}>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                        <FormInput
                            label="Street Address"
                            value={form.watch('borrower.residenceAddress.street') || ''}
                            onChange={(value) => {
                                form.setValue('borrower.residenceAddress.street', value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            id="borrower-residence-street"
                            testId="input-borrower-residence-street"
                            className="space-y-2"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <FormInput
                            label="Unit/Apt"
                            value={form.watch('borrower.residenceAddress.unit') || ''}
                            onChange={(value) => {
                                form.setValue('borrower.residenceAddress.unit', value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            id="borrower-residence-unit"
                            testId="input-borrower-residence-unit"
                            className="space-y-2"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <FormInput
                            label="City"
                            value={form.watch('borrower.residenceAddress.city') || ''}
                            onChange={(value) => {
                                form.setValue('borrower.residenceAddress.city', value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            id="borrower-residence-city"
                            testId="input-borrower-residence-city"
                            className="space-y-2"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <FormSelect
                            label="State"
                            value={form.watch('borrower.residenceAddress.state') || ''}
                            onValueChange={(value) => {
                                form.setValue('borrower.residenceAddress.state', value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            options={US_STATES_OPTIONS}
                            placeholder="State"
                            testId="select-borrower-residence-state"
                            className="space-y-2"
                            displayValue={true}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <FormInput
                            label="ZIP Code"
                            value={form.watch('borrower.residenceAddress.zip') || ''}
                            onChange={(value) => {
                                form.setValue('borrower.residenceAddress.zip', value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            onBlur={(e) => handleBorrowerZipCodeLookup(e.target.value)}
                            id="borrower-residence-zip"
                            testId="input-borrower-residence-zip"
                            className="space-y-2"
                        />
                    </div>

                    <div className="md:col-span-2">
                        {borrowerCountyOptions.length > 0 ? (
                            <FormSelect
                                label="County"
                                value={form.watch('borrower.residenceAddress.county') || ''}
                                onValueChange={(value) => {
                                    if (value === 'manual-entry') {
                                        form.setValue('borrower.residenceAddress.county', '');
                                        setBorrowerCountyOptions([]);
                                    } else {
                                        // Find the selected county to get its label for display
                                        const selectedCounty = borrowerCountyOptions.find(county => county.value === value);
                                        form.setValue('borrower.residenceAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                                    }
                                }}
                                options={[
                                    ...borrowerCountyOptions,
                                    { value: 'manual-entry', label: 'Enter county manually' }
                                ]}
                                placeholder={countyLookupLoading.borrower ? "Looking up counties..." : "Select county"}
                                testId="select-borrower-residence-county"
                                className="space-y-2"
                            />
                        ) : (
                            <FormInput
                                label="County"
                                value={form.watch('borrower.residenceAddress.county') || ''}
                                onChange={(value) => {
                                    form.setValue('borrower.residenceAddress.county', value);
                                    setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                                }}
                                placeholder={countyLookupLoading.borrower ? "Looking up counties..." : ""}
                                id="borrower-residence-county"
                                testId="input-borrower-residence-county"
                                className="space-y-2"
                            />
                        )}
                    </div>

                    <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="borrower-residence-from">From</Label>
                        <Input
                            id="borrower-residence-from"
                            type="text"
                            placeholder="mm/dd/yyyy"
                            value={form.watch('borrower.residenceAddress.from') || ''}
                            onChange={(e) => {
                                const input = e.target.value;
                                const currentValue = form.getValues('borrower.residenceAddress.from') || '';

                                // If input is empty or being deleted, allow it
                                if (input.length === 0) {
                                    form.setValue('borrower.residenceAddress.from', '');
                                    setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                                    return;
                                }

                                // If user is deleting (input shorter than current), just update without formatting
                                if (typeof currentValue === 'string' && input.length < currentValue.length) {
                                    form.setValue('borrower.residenceAddress.from', input);
                                    setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                                    return;
                                }

                                // Otherwise, apply formatting
                                let value = input.replace(/\D/g, ''); // Remove non-digits
                                if (value.length >= 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2);
                                }
                                if (value.length >= 5) {
                                    value = value.slice(0, 5) + '/' + value.slice(5);
                                }
                                value = value.slice(0, 10); // Limit to mm/dd/yyyy
                                form.setValue('borrower.residenceAddress.from', value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            data-testid="input-borrower-residence-from"
                            className="!text-[13px] placeholder:text-[10px]"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="borrower-residence-to" className="text-sm">
                                {isBorrowerCurrentResidencePresent ? 'Present' : 'To'}
                            </Label>
                            <Switch
                                checked={isBorrowerCurrentResidencePresent}
                                onCheckedChange={(checked) => {
                                    setIsBorrowerCurrentResidencePresent(checked);
                                    if (checked) {
                                        // Set to "Present" and store current date for calculations
                                        form.setValue('borrower.residenceAddress.to', 'Present');
                                    } else {
                                        // Clear the field when toggled off
                                        form.setValue('borrower.residenceAddress.to', '');
                                    }
                                    setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                                }}
                                data-testid="toggle-borrower-residence-present"
                                className="scale-[0.8]"
                            />
                        </div>
                        <Input
                            id="borrower-residence-to"
                            type="text"
                            placeholder="mm/dd/yyyy"
                            value={isBorrowerCurrentResidencePresent ? 'Present' : form.watch('borrower.residenceAddress.to') || ''}
                            onChange={(e) => {
                                if (isBorrowerCurrentResidencePresent) return; // Disable editing when Present

                                const input = e.target.value;
                                const currentValue = form.getValues('borrower.residenceAddress.to') || '';

                                // If input is empty or being deleted, allow it
                                if (input.length === 0) {
                                    form.setValue('borrower.residenceAddress.to', '');
                                    return;
                                }

                                // If user is deleting (input shorter than current), just update without formatting
                                if (typeof currentValue === 'string' && input.length < currentValue.length) {
                                    form.setValue('borrower.residenceAddress.to', input);
                                    return;
                                }

                                // Otherwise, apply formatting
                                let value = input.replace(/\D/g, ''); // Remove non-digits
                                if (value.length >= 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2);
                                }
                                if (value.length >= 5) {
                                    value = value.slice(0, 5) + '/' + value.slice(5);
                                }
                                value = value.slice(0, 10); // Limit to mm/dd/yyyy
                                form.setValue('borrower.residenceAddress.to', value);
                            }}
                            data-testid="input-borrower-residence-to"
                            className="!text-[13px] placeholder:text-[10px]"
                            readOnly={isBorrowerCurrentResidencePresent}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="borrower-time-address" className="text-sm">
                            Duration
                        </Label>
                        <div className="h-9 px-3 py-2 border border-input bg-background rounded-md flex items-center text-sm">
                            <span className="text-muted-foreground">{displayValue || '—'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AddressForm;