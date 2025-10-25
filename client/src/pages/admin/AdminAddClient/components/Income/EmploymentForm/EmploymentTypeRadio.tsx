import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { InsertClient } from '@shared/schema';

interface EmploymentTypeRadioProps {
  showAnimation?: boolean;
  cardId: string;
  fieldPrefix: 'income' | 'coBorrowerIncome';
  employerType: 'employers' | 'secondEmployers';
}

const EmploymentTypeRadio = ({
  showAnimation = false,
  cardId,
  fieldPrefix,
  employerType
}: EmploymentTypeRadioProps) => {
  const form = useFormContext<InsertClient>();
  const fieldPath = `${fieldPrefix}.${employerType}.${cardId}.employerStatus` as any;
  const value = form.watch(fieldPath) || 'current'; // Default to 'current'

  const handleChange = (newValue: 'current' | 'prior') => {
    form.setValue(fieldPath, newValue);
  };

  const radioName = `employment-type-${fieldPrefix}-${employerType}-${cardId}`;

  return (
    <Card className={`bg-muted ${showAnimation ? 'animate-roll-down-subject-property' : ''}`}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${radioName}-current`}
                name={radioName}
                value="current"
                checked={value === 'current'}
                onChange={() => handleChange('current')}
                data-testid={`radio-${fieldPrefix}-${employerType}-${cardId}-current`}
              />
              <Label htmlFor={`${radioName}-current`} className="cursor-pointer">
                Current Employer
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${radioName}-prior`}
                name={radioName}
                value="prior"
                checked={value === 'prior'}
                onChange={() => handleChange('prior')}
                data-testid={`radio-${fieldPrefix}-${employerType}-${cardId}-prior`}
              />
              <Label htmlFor={`${radioName}-prior`} className="cursor-pointer">
                Prior Employer
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmploymentTypeRadio;