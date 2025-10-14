import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormInput from '../FormInput';
import PhoneInput from '../PhoneInput';
import FormSelect from '../FormSelect';
import DateInput from '../DateInput';
import { US_STATES_OPTIONS, FORMATION_OPTIONS } from '../../data/formOptions';
import BusinessDescriptionDialog from '../../dialogs/BusinessDescriptionDialog';
import TaxPreparerDialog from '../../dialogs/TaxPreparerDialog';

interface SelfEmploymentFormProps {
  cardId: string;
  propertyId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSelfEmployment: () => void;
  onDeleteSelfEmployment: () => void;
  showAnimation?: boolean;
  getSelfEmploymentFieldPath: (cardId: string, fieldName: string) => string;
  setShowIncomeCardAnimation: (updater: (prev: any) => any) => void;
  showAddButton?: boolean;
  title?: string;
}

const SelfEmploymentForm = ({
  cardId,
  propertyId,
  isOpen,
  onOpenChange,
  onAddSelfEmployment,
  onDeleteSelfEmployment,
  showAnimation = false,
  getSelfEmploymentFieldPath,
  setShowIncomeCardAnimation,
  showAddButton = true,
  title = "Borrower Self-Employment"
}: SelfEmploymentFormProps) => {  
  const form = useFormContext<InsertClient>();

  // Dialog states
  const [isBusinessDescriptionOpen, setIsBusinessDescriptionOpen] = useState(false);
  const [isTaxPreparerOpen, setIsTaxPreparerOpen] = useState(false);

  // Dialog handlers
  const handleOpenBusinessDescription = () => {
    setIsBusinessDescriptionOpen(true);
  };

  const handleCloseBusinessDescription = () => {
    setIsBusinessDescriptionOpen(false);
  };

  const handleSaveBusinessDescription = (description: string) => {
    form.setValue(getSelfEmploymentFieldPath(cardId, 'businessDescription') as any, description);
  };

  const handleOpenTaxPreparer = () => {
    setIsTaxPreparerOpen(true);
  };

  const handleCloseTaxPreparer = () => {
    setIsTaxPreparerOpen(false);
  };

  const handleSaveTaxPreparer = (preparer: string) => {
    form.setValue(getSelfEmploymentFieldPath(cardId, 'taxesPreparedBy') as any, preparer);
  };

  return (
    <Card key={cardId} className="transition-colors duration-200">
      <Collapsible 
        open={isOpen} 
        onOpenChange={(open) => {
          onOpenChange(open);
          if (open) {
            setTimeout(() => {
              setShowIncomeCardAnimation(prev => ({ ...prev, 'borrower-self-employment': true }));
              setTimeout(() => {
                setShowIncomeCardAnimation(prev => ({ ...prev, 'borrower-self-employment': false }));
              }, 800);
            }, 200);
          }
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <CardTitle className="flex items-center gap-2">
                {title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {/* Add Self-Employment Button */}
              {showAddButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddSelfEmployment}
                  className="hover:bg-blue-500 hover:text-white"
                  data-testid="button-add-self-employment"
                  title="Add New Self-Employment"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Self-Employment
                </Button>
              )}
              
              {/* Delete Self-Employment Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDeleteSelfEmployment}
                className="hover:bg-red-500 hover:text-white"
                data-testid="button-delete-self-employment"
                title="Delete Self-Employment"
              >
                <Minus className="h-4 w-4 mr-2" />
                Remove
              </Button>
              
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-orange-500 hover:text-white" 
                  data-testid={`button-toggle-self-employment-${propertyId}`}
                  title={isOpen ? 'Minimize' : 'Expand'}
                  key={`self-employment-${propertyId}-${isOpen}`}
                >
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>
      
        <CollapsibleContent>
          <CardContent>
            {/* Employment Type Selection */}
            <Card className={`bg-muted mb-4 ${
              showAnimation ? 'animate-roll-down-subject-property' : ''
            }`}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex gap-4 justify-between items-center">
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`self-employment-current-${cardId}`}
                          name={`self-employment-type-${cardId}`}
                          data-testid={`radio-self-employment-current-${cardId}`}
                          defaultChecked
                        />
                        <Label htmlFor={`self-employment-current-${cardId}`}>Current</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`self-employment-prior-${cardId}`}
                          name={`self-employment-type-${cardId}`}
                          data-testid={`radio-self-employment-prior-${cardId}`}
                        />
                        <Label htmlFor={`self-employment-prior-${cardId}`}>Prior</Label>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mr-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenBusinessDescription}
                        className="bg-gray-300 text-gray-700 hover:bg-gray-400 min-w-[180px]"
                        style={{ backgroundColor: '#d1d5db', borderColor: '#d1d5db', color: '#374151' }}
                        data-testid={`button-self-employment-description-${cardId}`}
                        title="Description"
                      >
                        Description
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenTaxPreparer}
                        className="bg-gray-300 text-gray-700 hover:bg-gray-400 min-w-[110px]"
                        style={{ backgroundColor: '#d1d5db', borderColor: '#d1d5db', color: '#374151' }}
                        data-testid={`button-self-employment-filing-${cardId}`}
                        title="Filing"
                      >
                        Filing
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* First Row: Business Name, Phone, Gross Monthly Income, Start Date, End Date, Duration */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Business Name */}
                <FormInput
                  label="Business Name"
                  value={form.watch(getSelfEmploymentFieldPath(cardId, 'businessName') as any) || ''}
                  onChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'businessName') as any, value)}
                  id={`self-employment-business-name-${cardId}`}
                  testId={`input-self-employment-business-name-${cardId}`}
                  className="space-y-2"
                />
                
                {/* Phone */}
                <PhoneInput
                  label="Phone"
                  value={form.watch(getSelfEmploymentFieldPath(cardId, 'businessPhone') as any) || ''}
                  onChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'businessPhone') as any, value)}
                  id={`self-employment-phone-${cardId}`}
                  testId={`input-self-employment-phone-${cardId}`}
                  className="space-y-2"
                />
                
                {/* Gross Monthly Income */}
                <div className="space-y-2">
                  <Label htmlFor={`self-employment-gross-income-${cardId}`}>Gross Monthly Income</Label>
                  <Controller
                    control={form.control}
                    name={getSelfEmploymentFieldPath(cardId, 'businessMonthlyIncome') as any}
                    defaultValue=""
                    render={({ field }) => {
                      const numVal = field.value ? String(field.value).replace(/[^\d]/g, '') : '';
                      const displayValue = numVal ? `$${numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
                      
                      return (
                        <Input
                          id={`self-employment-gross-income-${cardId}`}
                          type="text"
                          placeholder="$0"
                          value={displayValue}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(value);
                          }}
                          data-testid={`input-self-employment-gross-income-${cardId}`}
                        />
                      );
                    }}
                  />
                </div>

                {/* Start Date */}
                <DateInput
                  label="Start Date"
                  value={form.watch(getSelfEmploymentFieldPath(cardId, 'startDate') as any) || ''}
                  onChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'startDate') as any, value)}
                  id={`self-employment-start-date-${cardId}`}
                  testId={`input-self-employment-start-date-${cardId}`}
                  className="space-y-2"
                />

                {/* End Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor={`self-employment-end-date-${cardId}`} className="text-sm">
                      {form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any) ? 'Present' : 'End Date'}
                    </Label>
                    <Switch
                      checked={form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any) ?? false}
                      onCheckedChange={(checked) => {
                        form.setValue(getSelfEmploymentFieldPath(cardId, 'isPresent') as any, checked);
                        if (checked) {
                          form.setValue(getSelfEmploymentFieldPath(cardId, 'endDate') as any, '');
                        }
                      }}
                      data-testid={`switch-self-employment-present-${cardId}`}
                      className="scale-[0.8]"
                    />
                  </div>
                  <Input
                    id={`self-employment-end-date-${cardId}`}
                    value={form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any) ? 'present' : (form.watch(getSelfEmploymentFieldPath(cardId, 'endDate') as any) || '')}
                    onChange={(e) => {
                      if (!form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any)) {
                        const value = e.target.value.replace(/\D/g, '');
                        let formatted = '';
                        if (value.length > 0) {
                          formatted = value.substring(0, 2);
                          if (value.length > 2) {
                            formatted += '/' + value.substring(2, 4);
                            if (value.length > 4) {
                              formatted += '/' + value.substring(4, 8);
                            }
                          }
                        }
                        form.setValue(getSelfEmploymentFieldPath(cardId, 'endDate') as any, formatted);
                      }
                    }}
                    placeholder={form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any) ? 'Present' : 'MM/DD/YYYY'}
                    maxLength={10}
                    readOnly={form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any)}
                    className={form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any) ? 'bg-muted' : ''}
                    data-testid={`input-self-employment-end-date-${cardId}`}
                  />
                </div>

                {/* Duration */}
                <FormInput
                  label="Duration"
                  value={form.watch(getSelfEmploymentFieldPath(cardId, 'duration') as any) || ''}
                  onChange={(value) => {
                    if (form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any)) {
                      form.setValue(getSelfEmploymentFieldPath(cardId, 'duration') as any, value);
                    }
                  }}
                  id={`self-employment-duration-${cardId}`}
                  testId={`input-self-employment-duration-${cardId}`}
                  className="space-y-2"
                  placeholder={form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any) ? 'Enter' : '0'}
                  readOnly={!form.watch(getSelfEmploymentFieldPath(cardId, 'isPresent') as any)}
                />
              </div>

              {/* Second Row: Street Address, Unit/Suite, City, State, Zip Code, County, Formation */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3">
                  <FormInput
                    label="Street Address"
                    value={form.watch(getSelfEmploymentFieldPath(cardId, 'businessAddress.street') as any) || ''}
                    onChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'businessAddress.street') as any, value)}
                    id={`self-employment-street-address-${cardId}`}
                    testId={`input-self-employment-street-address-${cardId}`}
                    className="space-y-2"
                  />
                </div>
                
                <div className="md:col-span-1">
                  <FormInput
                    label="Unit/Suite"
                    value={form.watch(getSelfEmploymentFieldPath(cardId, 'businessAddress.unit') as any) || ''}
                    onChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'businessAddress.unit') as any, value)}
                    id={`self-employment-unit-suite-${cardId}`}
                    testId={`input-self-employment-unit-suite-${cardId}`}
                    className="space-y-2"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <FormInput
                    label="City"
                    value={form.watch(getSelfEmploymentFieldPath(cardId, 'businessAddress.city') as any) || ''}
                    onChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'businessAddress.city') as any, value)}
                    id={`self-employment-city-${cardId}`}
                    testId={`input-self-employment-city-${cardId}`}
                    className="space-y-2"
                  />
                </div>
                
                <div className="md:col-span-1">
                  <FormSelect
                    label="State"
                    value={form.watch(getSelfEmploymentFieldPath(cardId, 'businessAddress.state') as any) || ''}
                    onValueChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'businessAddress.state') as any, value)}
                    options={US_STATES_OPTIONS}
                    placeholder="State"
                    testId={`select-self-employment-state-${cardId}`}
                    className="space-y-2"
                    displayValue={true}
                  />
                </div>
                
                <div className="md:col-span-1">
                  <FormInput
                    label="ZIP Code"
                    value={form.watch(getSelfEmploymentFieldPath(cardId, 'businessAddress.zip') as any) || ''}
                    onChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'businessAddress.zip') as any, value)}
                    id={`self-employment-zip-code-${cardId}`}
                    testId={`input-self-employment-zip-code-${cardId}`}
                    className="space-y-2"
                    maxLength={5}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <FormInput
                    label="County"
                    value={form.watch(getSelfEmploymentFieldPath(cardId, 'businessAddress.county') as any) || ''}
                    onChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'businessAddress.county') as any, value)}
                    id={`self-employment-county-${cardId}`}
                    testId={`input-self-employment-county-${cardId}`}
                    className="space-y-2"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <FormSelect
                    label="Formation"
                    value={form.watch(getSelfEmploymentFieldPath(cardId, 'formation') as any) || ''}
                    onValueChange={(value) => form.setValue(getSelfEmploymentFieldPath(cardId, 'formation') as any, value)}
                    options={FORMATION_OPTIONS}
                    placeholder="Select"
                    testId={`select-self-employment-formation-${cardId}`}
                    className="space-y-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Business Description Dialog */}
      <BusinessDescriptionDialog
        isOpen={isBusinessDescriptionOpen}
        onClose={handleCloseBusinessDescription}
        onSave={handleSaveBusinessDescription}
        currentValue={form.watch(getSelfEmploymentFieldPath(cardId, 'businessDescription') as any) || ''}
      />

      {/* Tax Preparer Dialog */}
      <TaxPreparerDialog
        isOpen={isTaxPreparerOpen}
        onClose={handleCloseTaxPreparer}
        onSave={handleSaveTaxPreparer}
        currentValue={form.watch(getSelfEmploymentFieldPath(cardId, 'taxesPreparedBy') as any) || 'Select'}
      />
    </Card>
  );
};

export default SelfEmploymentForm;