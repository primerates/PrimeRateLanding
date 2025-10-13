import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface EmploymentTypeRadioProps {
  showAnimation?: boolean;
}

const EmploymentTypeRadio = ({ showAnimation = false }: EmploymentTypeRadioProps) => {
  return (
    <Card className={`bg-muted ${showAnimation ? 'animate-roll-down-subject-property' : ''}`}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="employment-current"
                name="employment-type"
                data-testid="radio-employment-current"
              />
              <Label htmlFor="employment-current">Current Employer</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="employment-prior"
                name="employment-type"
                data-testid="radio-employment-prior"
              />
              <Label htmlFor="employment-prior">Prior Employer</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmploymentTypeRadio;