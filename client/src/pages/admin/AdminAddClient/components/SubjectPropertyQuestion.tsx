import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';

interface SubjectPropertyQuestionProps {
  propertyId: string;
  propertyIndex: number;
  showAnimation?: boolean;
}

const SubjectPropertyQuestion = ({
  propertyId,
  propertyIndex,
  showAnimation = false
}: SubjectPropertyQuestionProps) => {
  const form = useFormContext<InsertClient>();

  const getPropertyFieldPath = (field: string) => {
    return `property.properties.${propertyIndex}.${field}`;
  };

  return (
    <Card className={`bg-muted ${showAnimation ? 'animate-roll-down-subject-property' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div className="space-y-3 flex-1">
            <Label className="text-base font-semibold">Is this the subject property that will secure the new loan?</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`subject-yes-${propertyId}`}
                  name={`subject-${propertyId}`}
                  checked={form.watch(getPropertyFieldPath('isSubject') as any) === true}
                  onChange={() => {
                    form.setValue(getPropertyFieldPath('isSubject') as any, true);
                  }}
                  data-testid={`radio-subject-yes-${propertyId}`}
                />
                <Label htmlFor={`subject-yes-${propertyId}`}>Yes</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`subject-no-${propertyId}`}
                  name={`subject-${propertyId}`}
                  checked={form.watch(getPropertyFieldPath('isSubject') as any) === false}
                  onChange={() => {
                    form.setValue(getPropertyFieldPath('isSubject') as any, false);
                  }}
                  data-testid={`radio-subject-no-${propertyId}`}
                />
                <Label htmlFor={`subject-no-${propertyId}`}>No</Label>
              </div>
            </div>
          </div>
          
          {/* Loans button */}
          <div className="flex items-center mr-8">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Loans button clicked');
              }}
              className="w-24 hover:bg-red-500 hover:text-white"
              data-testid={`button-grey-box-action-${propertyId}`}
              title="Loans"
            >
              <span>
                <span className="mr-3 font-semibold">0</span>
                <span>Loans</span>
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectPropertyQuestion;