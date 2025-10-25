import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Controller, useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import FormInput from '../../FormInput';
import EmploymentTypeRadio from './EmploymentTypeRadio';
import EmploymentVerificationToggle from './EmploymentVerificationToggle';
import EmploymentDateFields from './EmploymentDateFields';
import EmployerAddressRow from './EmployerAddressRow';

interface EmploymentDate {
  startDate: string;
  endDate: string;
  isPresent: boolean;
  duration: string;
}

interface EmploymentFormProps {
  cardId: string;
  propertyId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEmployer: () => void;
  onDeleteEmployer: () => void;
  showAnimation?: boolean;
  getEmployerFieldPath: (cardId: string, fieldName: string) => string;
  employmentDates: Record<string, EmploymentDate>;
  updateEmploymentDuration: (cardId: string, startDate: string, endDate: string, isPresent: boolean) => void;
  setEmploymentDates: (updater: (prev: Record<string, EmploymentDate>) => Record<string, EmploymentDate>) => void;
  calculatedAdjustedNewFhaMip: string;
  setShowIncomeCardAnimation: (updater: (prev: any) => any) => void;
  showAddButton?: boolean;
  title?: string;
  fieldPrefix: 'income' | 'coBorrowerIncome';
  employerType: 'employers' | 'secondEmployers';
}

const EmploymentForm = ({
  cardId,
  propertyId,
  isOpen,
  onOpenChange,
  onAddEmployer,
  onDeleteEmployer,
  showAnimation = false,
  getEmployerFieldPath,
  employmentDates,
  updateEmploymentDuration,
  setEmploymentDates,
  calculatedAdjustedNewFhaMip,
  setShowIncomeCardAnimation,
  showAddButton = true,
  title = "Borrower Employer",
  fieldPrefix,
  employerType
}: EmploymentFormProps) => {
  const form = useFormContext<InsertClient>();

  return (
    <Card key={cardId} className="transition-colors duration-200">
      <Collapsible
        open={isOpen}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (open) {
            setTimeout(() => {
              setShowIncomeCardAnimation(prev => ({ ...prev, 'borrower-employment': true }));
              setTimeout(() => {
                setShowIncomeCardAnimation(prev => ({ ...prev, 'borrower-employment': false }));
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
              {/* Add Employer Button */}
              {showAddButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddEmployer}
                  className="hover:bg-blue-500 hover:text-white"
                  data-testid="button-add-employer"
                  title="Add New Employer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employer
                </Button>
              )}

              {/* Delete Employer Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDeleteEmployer}
                className="hover:bg-red-500 hover:text-white"
                data-testid="button-delete-employer"
                title="Delete Employer"
              >
                <Minus className="h-4 w-4 mr-2" />
                Remove
              </Button>

              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-orange-500 hover:text-white"
                  data-testid={`button-toggle-income-${propertyId}`}
                  title={isOpen ? 'Minimize' : 'Expand'}
                  key={`employment-income-${propertyId}-${isOpen}`}
                >
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <div className="space-y-6">
              {/* Employment Type Selection */}
              <EmploymentTypeRadio
                showAnimation={showAnimation}
                cardId={cardId}
                fieldPrefix={fieldPrefix}
                employerType={employerType}
              />

              {/* Employment Information - Single Row */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {/* Employer Name */}
                <FormInput
                  label="Employer Name"
                  value={form.watch(getEmployerFieldPath(cardId, 'employerName')) || ''}
                  onChange={(value) => form.setValue(getEmployerFieldPath(cardId, 'employerName') as any, value)}
                  id="template-employer-name"
                  testId="input-template-employer-name"
                  className="space-y-2"
                />
                
                {/* Employer Phone with Verification Toggle */}
                <EmploymentVerificationToggle 
                  cardId={cardId}
                  getEmployerFieldPath={getEmployerFieldPath}
                />
                
                {/* Job Title */}
                <FormInput
                  label="Job Title"
                  value={form.watch(getEmployerFieldPath(cardId, 'jobTitle')) || ''}
                  onChange={(value) => form.setValue(getEmployerFieldPath(cardId, 'jobTitle') as any, value)}
                  id="template-job-title"
                  testId="input-template-job-title"
                  className="space-y-2"
                />
                
                {/* Gross Monthly Income */}
                <div className="space-y-2">
                  <Label htmlFor={`income-employer-income-${cardId}`}>Gross Monthly Income</Label>
                  <Controller
                    control={form.control}
                    name={getEmployerFieldPath(cardId, 'monthlyIncome')}
                    defaultValue=""
                    render={({ field }) => {
                      const numVal = field.value ? field.value.replace(/[^\d]/g, '') : '';
                      const displayValue = numVal ? `$${numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
                      
                      return (
                        <Input
                          id={`income-employer-income-${cardId}`}
                          type="text"
                          placeholder="$0"
                          value={displayValue}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(value);
                          }}
                          data-testid={`input-income-employer-${cardId}`}
                        />
                      );
                    }}
                  />
                </div>
                
                {/* Employment Date Fields */}
                <EmploymentDateFields
                  propertyId={propertyId}
                  employmentDates={employmentDates}
                  updateEmploymentDuration={updateEmploymentDuration}
                  setEmploymentDates={setEmploymentDates}
                />
              </div>

              {/* Employer Address Row */}
              <EmployerAddressRow 
                calculatedAdjustedNewFhaMip={calculatedAdjustedNewFhaMip}
                cardId={cardId}
                getEmployerFieldPath={getEmployerFieldPath}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default EmploymentForm;