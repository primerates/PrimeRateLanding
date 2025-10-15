import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import DateInput from '../../DateInput';
import FormInput from '../../FormInput';

interface EmploymentDate {
  startDate: string;
  endDate: string;
  isPresent: boolean;
  duration: string;
}

interface EmploymentDateFieldsProps {
  propertyId: string;
  employmentDates: Record<string, EmploymentDate>;
  updateEmploymentDuration: (cardId: string, startDate: string, endDate: string, isPresent: boolean) => void;
  setEmploymentDates: (updater: (prev: Record<string, EmploymentDate>) => Record<string, EmploymentDate>) => void;
}

const EmploymentDateFields = ({ 
  propertyId, 
  employmentDates, 
  updateEmploymentDuration,
  setEmploymentDates 
}: EmploymentDateFieldsProps) => {
  return (
    <>
      {/* Start Date */}
      <DateInput
        label="Start Date"
        value={employmentDates[propertyId]?.startDate || ''}
        onChange={(formatted) => {
          const currentData = employmentDates[propertyId] || { endDate: '', isPresent: false, duration: '' };
          updateEmploymentDuration(propertyId, formatted, currentData.endDate, currentData.isPresent);
        }}
        id={`${propertyId}-startDate`}
        testId={`input-${propertyId}-startDate`}
        className="space-y-2"
      />
      
      {/* End Date */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor={`${propertyId}-endDate`} className="text-sm">
            {employmentDates[propertyId]?.isPresent ? 'Present' : 'End Date'}
          </Label>
          <Switch
            checked={employmentDates[propertyId]?.isPresent ?? false}
            onCheckedChange={(checked) => {
              const currentData = employmentDates[propertyId] || { startDate: '', endDate: '', duration: '' };
              updateEmploymentDuration(propertyId, currentData.startDate, currentData.endDate, checked);
            }}
            data-testid={`toggle-${propertyId}-present`}
            className="scale-[0.8]"
          />
        </div>
        <Input
          id={`${propertyId}-endDate`}
          value={employmentDates[propertyId]?.isPresent ? 'present' : (employmentDates[propertyId]?.endDate || '')}
          onChange={(e) => {
            if (!employmentDates[propertyId]?.isPresent) {
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
              const currentData = employmentDates[propertyId] || { startDate: '', isPresent: false, duration: '' };
              updateEmploymentDuration(propertyId, currentData.startDate, formatted, currentData.isPresent);
            }
          }}
          placeholder={employmentDates[propertyId]?.isPresent ? 'Enter' : 'MM/DD/YYYY'}
          maxLength={10}
          readOnly={employmentDates[propertyId]?.isPresent}
          className={employmentDates[propertyId]?.isPresent ? 'bg-muted' : ''}
          data-testid={`input-${propertyId}-endDate`}
        />
      </div>
      
      {/* Duration */}
      <FormInput
        label="Employment Duration"
        value={employmentDates[propertyId]?.duration || ''}
        onChange={(value) => {
          if (employmentDates[propertyId]?.isPresent) {
            const currentData = employmentDates[propertyId] || { startDate: '', endDate: '', isPresent: false };
            setEmploymentDates(prev => ({
              ...prev,
              [propertyId]: {
                ...currentData,
                duration: value
              }
            }));
          }
        }}
        id={`${propertyId}-employment-duration`}
        testId={`input-${propertyId}-employment-duration`}
        placeholder={employmentDates[propertyId]?.isPresent ? 'Enter' : '0'}
        readOnly={!employmentDates[propertyId]?.isPresent}
        className="space-y-2"
      />
    </>
  );
};

export default EmploymentDateFields;