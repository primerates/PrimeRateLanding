import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';

interface EmploymentVerificationToggleProps {
  cardId: string;
  getEmployerFieldPath: (cardId: string, fieldName: string) => string;
}

const EmploymentVerificationToggle = ({ 
  cardId, 
  getEmployerFieldPath 
}: EmploymentVerificationToggleProps) => {
  const form = useFormContext<InsertClient>();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="template-employer-phone" className="text-xs">
          {form.watch(getEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) ? 'Job Verification' : 'Employer Phone'}
        </Label>
        <Switch
          checked={form.watch(getEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) || false}
          onCheckedChange={(checked) => form.setValue(getEmployerFieldPath(cardId, 'isShowingEmploymentVerification') as any, checked)}
          data-testid="toggle-template-employment-verification"
          className="scale-[0.8]"
        />
      </div>
      <Input
        id="template-employer-phone"
        placeholder=""
        value={form.watch(getEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) 
          ? (form.watch(getEmployerFieldPath(cardId, 'employmentVerificationPhone')) || '')
          : (form.watch(getEmployerFieldPath(cardId, 'employerPhone')) || '')}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '');
          let formatted = '';
          if (value.length > 0) {
            formatted = value.substring(0, 3);
            if (value.length > 3) {
              formatted += '-' + value.substring(3, 6);
              if (value.length > 6) {
                formatted += '-' + value.substring(6, 10);
              }
            }
          }
          const fieldName = form.watch(getEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) 
            ? getEmployerFieldPath(cardId, 'employmentVerificationPhone')
            : getEmployerFieldPath(cardId, 'employerPhone');
          form.setValue(fieldName as any, formatted);
        }}
        maxLength={12}
        data-testid="input-template-employer-phone"
      />
    </div>
  );
};

export default EmploymentVerificationToggle;