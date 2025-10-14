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

interface AddressFormProps {
    isPrimary?: boolean;
    addressType?: 'current' | 'prior' | 'prior2';
}

const AddressForm = ({ isPrimary = true, addressType = 'current' }: AddressFormProps) => {
    const form = useFormContext<InsertClient>();
    const {
        borrowerCountyOptions,
        coBorrowerCountyOptions,
        borrowerPriorCountyOptions,
        coBorrowerPriorCountyOptions,
        borrowerPrior2CountyOptions,
        coBorrowerPrior2CountyOptions,
        countyLookupLoading,
        isBorrowerCurrentResidencePresent,
        setBorrowerCountyOptions,
        setCoBorrowerCountyOptions,
        setBorrowerPriorCountyOptions,
        setCoBorrowerPriorCountyOptions,
        setBorrowerPrior2CountyOptions,
        setCoBorrowerPrior2CountyOptions,
        setCountyLookupLoading,
        setIsBorrowerCurrentResidencePresent
    } = useAdminAddClientStore();

    // Field prefix based on whether this is primary borrower or co-borrower
    const fieldPrefix = isPrimary ? 'borrower' : 'coBorrower';

    // Get the full field path based on address type
    const getFieldPath = () => {
        const addressSuffix = addressType === 'current' ? 'residenceAddress' :
            addressType === 'prior' ? 'priorResidenceAddress' :
                'priorResidenceAddress2';
        return `${fieldPrefix}.${addressSuffix}`;
    };

    const addressFieldPath = getFieldPath();

    // Dynamic county options and setters based on borrower type and address type
    const getCountyState = () => {
        if (isPrimary) {
            switch (addressType) {
                case 'current':
                    return {
                        options: borrowerCountyOptions,
                        setter: setBorrowerCountyOptions,
                        loadingKey: 'borrower' as const
                    };
                case 'prior':
                    return {
                        options: borrowerPriorCountyOptions,
                        setter: setBorrowerPriorCountyOptions,
                        loadingKey: 'borrowerPrior' as const
                    };
                case 'prior2':
                    return {
                        options: borrowerPrior2CountyOptions,
                        setter: setBorrowerPrior2CountyOptions,
                        loadingKey: 'borrowerPrior2' as const
                    };
                default:
                    return {
                        options: borrowerCountyOptions,
                        setter: setBorrowerCountyOptions,
                        loadingKey: 'borrower' as const
                    };
            }
        } else {
            switch (addressType) {
                case 'current':
                    return {
                        options: coBorrowerCountyOptions,
                        setter: setCoBorrowerCountyOptions,
                        loadingKey: 'coBorrower' as const
                    };
                case 'prior':
                    return {
                        options: coBorrowerPriorCountyOptions,
                        setter: setCoBorrowerPriorCountyOptions,
                        loadingKey: 'coBorrowerPrior' as const
                    };
                case 'prior2':
                    return {
                        options: coBorrowerPrior2CountyOptions,
                        setter: setCoBorrowerPrior2CountyOptions,
                        loadingKey: 'coBorrowerPrior2' as const
                    };
                default:
                    return {
                        options: coBorrowerCountyOptions,
                        setter: setCoBorrowerCountyOptions,
                        loadingKey: 'coBorrower' as const
                    };
            }
        }
    };

    const { options: countyOptions, setter: setCountyOptions, loadingKey } = getCountyState();

    // Duration calculator
    const { displayValue, years, months } = useMemo(() => {
        const fromDate = form.watch(`${addressFieldPath}.from` as any) || '';
        const toDate = form.watch(`${addressFieldPath}.to` as any) || '';

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
    }, [form.watch(`${addressFieldPath}.from` as any), form.watch(`${addressFieldPath}.to` as any)]);

    // Update form values for years and months
    useMemo(() => {
        const yearsField = addressType === 'current' ? `${fieldPrefix}.yearsAtAddress` :
            addressType === 'prior' ? `${fieldPrefix}.priorYearsAtAddress` :
                `${fieldPrefix}.priorYearsAtAddress2`;
        const monthsField = addressType === 'current' ? `${fieldPrefix}.monthsAtAddress` :
            addressType === 'prior' ? `${fieldPrefix}.priorMonthsAtAddress` :
                `${fieldPrefix}.priorMonthsAtAddress2`;
        form.setValue(yearsField as any, years.toString(), { shouldDirty: false });
        form.setValue(monthsField as any, months.toString(), { shouldDirty: false });
    }, [years, months, form, fieldPrefix, addressType]);

    const autoCopyBorrowerAddressToPrimaryProperty = () => {
        // Only auto-copy for primary borrower current address, not co-borrower or prior addresses
        if (!isPrimary || addressType !== 'current') return;

        const borrowerAddress = form.getValues(`${addressFieldPath}` as any);

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

    const handleZipCodeLookup = async (zipCode: string) => {
        if (!zipCode || zipCode.length < 5) {
            setCountyOptions([]);
            return;
        }

        setCountyLookupLoading((prev) => ({ ...prev, [loadingKey]: true }));
        const counties = await lookupCountyFromZip(zipCode);

        if (counties.length === 1) {
            // Auto-fill single county result
            form.setValue(`${fieldPrefix}.residenceAddress.county` as any, counties[0].label, { shouldDirty: true });
            setCountyOptions([]); // Keep as input field but with value filled
        } else if (counties.length > 1) {
            // Show dropdown for multiple counties
            setCountyOptions(counties);
        } else {
            // No counties found, keep as input field
            setCountyOptions([]);
        }

        setCountyLookupLoading((prev) => ({ ...prev, [loadingKey]: false }));
    };

    return (
        <Card className={`bg-muted mt-8  ? 'animate-roll-down-subject-property' : ''}`}>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                        <FormInput
                            label="Street Address"
                            value={form.watch(`${addressFieldPath}.street` as any) || ''}
                            onChange={(value) => {
                                form.setValue(`${addressFieldPath}.street` as any, value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            id={`${fieldPrefix}-${addressType}-street`}
                            testId={`input-${fieldPrefix}-${addressType}-street`}
                            className="space-y-2"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <FormInput
                            label="Unit/Apt"
                            value={form.watch(`${addressFieldPath}.unit` as any) || ''}
                            onChange={(value) => {
                                form.setValue(`${addressFieldPath}.unit` as any, value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            id={`${fieldPrefix}-${addressType}-unit`}
                            testId={`input-${fieldPrefix}-${addressType}-unit`}
                            className="space-y-2"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <FormInput
                            label="City"
                            value={form.watch(`${addressFieldPath}.city` as any) || ''}
                            onChange={(value) => {
                                form.setValue(`${addressFieldPath}.city` as any, value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            id={`${fieldPrefix}-${addressType}-city`}
                            testId={`input-${fieldPrefix}-${addressType}-city`}
                            className="space-y-2"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <FormSelect
                            label="State"
                            value={form.watch(`${addressFieldPath}.state` as any) || ''}
                            onValueChange={(value) => {
                                form.setValue(`${addressFieldPath}.state` as any, value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            options={US_STATES_OPTIONS}
                            placeholder="State"
                            testId={`select-${fieldPrefix}-${addressType}-state`}
                            className="space-y-2"
                            displayValue={true}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <FormInput
                            label="ZIP Code"
                            value={form.watch(`${addressFieldPath}.zip` as any) || ''}
                            onChange={(value) => {
                                form.setValue(`${addressFieldPath}.zip` as any, value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            onBlur={(e) => handleZipCodeLookup(e.target.value)}
                            id={`${fieldPrefix}-${addressType}-zip`}
                            testId={`input-${fieldPrefix}-${addressType}-zip`}
                            className="space-y-2"
                        />
                    </div>

                    <div className="md:col-span-1">
                        {countyOptions.length > 0 ? (
                            <FormSelect
                                label="County"
                                value={form.watch(`${addressFieldPath}.county` as any) || ''}
                                onValueChange={(value) => {
                                    if (value === 'manual-entry') {
                                        form.setValue(`${addressFieldPath}.county` as any, '');
                                        setCountyOptions([]);
                                    } else {
                                        // Find the selected county to get its label for display
                                        const selectedCounty = countyOptions.find(county => county.value === value);
                                        form.setValue(`${addressFieldPath}.county` as any, selectedCounty?.label || value, { shouldDirty: true });
                                    }
                                }}
                                options={[
                                    ...countyOptions,
                                    { value: 'manual-entry', label: 'Enter county manually' }
                                ]}
                                placeholder={countyLookupLoading[loadingKey] ? "Looking up counties..." : "Select county"}
                                testId={`select-${fieldPrefix}-${addressType}-county`}
                                className="space-y-2"
                            />
                        ) : (
                            <FormInput
                                label="County"
                                value={form.watch(`${addressFieldPath}.county` as any) || ''}
                                onChange={(value) => {
                                    form.setValue(`${addressFieldPath}.county` as any, value);
                                    setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                                }}
                                placeholder={countyLookupLoading[loadingKey] ? "Looking up counties..." : ""}
                                id={`${fieldPrefix}-${addressType}-county`}
                                testId={`input-${fieldPrefix}-${addressType}-county`}
                                className="space-y-2"
                            />
                        )}
                    </div>

                    <div className="space-y-2 md:col-span-1">
                        <Label htmlFor={`${fieldPrefix}-${addressType}-from`}>From</Label>
                        <Input
                            id={`${fieldPrefix}-${addressType}-from`}
                            type="text"
                            placeholder="mm/dd/yyyy"
                            value={form.watch(`${addressFieldPath}.from` as any) || ''}
                            onChange={(e) => {
                                const input = e.target.value;
                                const currentValue = form.getValues(`${addressFieldPath}.from` as any) || '';

                                // If input is empty or being deleted, allow it
                                if (input.length === 0) {
                                    form.setValue(`${addressFieldPath}.from` as any, '');
                                    setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                                    return;
                                }

                                // If user is deleting (input shorter than current), just update without formatting
                                if (typeof currentValue === 'string' && input.length < currentValue.length) {
                                    form.setValue(`${addressFieldPath}.from` as any, input);
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
                                form.setValue(`${addressFieldPath}.from` as any, value);
                                setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                            }}
                            data-testid={`input-${fieldPrefix}-${addressType}-from`}
                            className="!text-[13px] placeholder:text-[10px]"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={`${fieldPrefix}-${addressType}-to`} className="text-sm">
                                {addressType === 'current' && isBorrowerCurrentResidencePresent ? 'Present' : 'To'}
                            </Label>
                            {addressType === 'current' && (
                                <Switch
                                    checked={isBorrowerCurrentResidencePresent}
                                    onCheckedChange={(checked) => {
                                        setIsBorrowerCurrentResidencePresent(checked);
                                        if (checked) {
                                            // Set to "Present" and store current date for calculations
                                            form.setValue(`${addressFieldPath}.to` as any, 'Present');
                                        } else {
                                            // Clear the field when toggled off
                                            form.setValue(`${addressFieldPath}.to` as any, '');
                                        }
                                        setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                                    }}
                                    data-testid={`toggle-${fieldPrefix}-${addressType}-present`}
                                    className="scale-[0.8]"
                                />
                            )}
                        </div>
                        <Input
                            id={`${fieldPrefix}-${addressType}-to`}
                            type="text"
                            placeholder="mm/dd/yyyy"
                            value={addressType === 'current' && isBorrowerCurrentResidencePresent ? 'Present' : form.watch(`${addressFieldPath}.to` as any) || ''}
                            onChange={(e) => {
                                if (addressType === 'current' && isBorrowerCurrentResidencePresent) return; // Disable editing when Present

                                const input = e.target.value;
                                const currentValue = form.getValues(`${addressFieldPath}.to` as any) || '';

                                // If input is empty or being deleted, allow it
                                if (input.length === 0) {
                                    form.setValue(`${addressFieldPath}.to` as any, '');
                                    return;
                                }

                                // If user is deleting (input shorter than current), just update without formatting
                                if (typeof currentValue === 'string' && input.length < currentValue.length) {
                                    form.setValue(`${addressFieldPath}.to` as any, input);
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
                                form.setValue(`${addressFieldPath}.to` as any, value);
                            }}
                            data-testid={`input-${fieldPrefix}-${addressType}-to`}
                            className="!text-[13px] placeholder:text-[10px]"
                            readOnly={addressType === 'current' && isBorrowerCurrentResidencePresent}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-1">
                        <Label htmlFor={`${fieldPrefix}-${addressType}-duration`} className="text-sm">
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