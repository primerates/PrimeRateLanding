import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import { RESIDENCE_TYPE_OPTIONS, type Option } from '../data/formOptions';

interface ResidenceTypeSelectorProps {
  fieldPath: string;
  testIdPrefix?: string;
  options?: Option[];
  className?: string;
}

const ResidenceTypeSelector = ({
  fieldPath,
  testIdPrefix = 'residence',
  options = RESIDENCE_TYPE_OPTIONS,
  className = 'flex items-center gap-4 ml-1'
}: ResidenceTypeSelectorProps) => {
  const form = useFormContext<InsertClient>();
  const currentValue = form.watch(fieldPath as any);

  return (
    <div className={className}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => form.setValue(fieldPath as any, option.value)}
          className="flex items-center gap-1.5 group"
          data-testid={`button-${testIdPrefix}-${option.value}`}
        >
          <div className={`w-3 h-3 rounded-full transition-colors ${
            currentValue === option.value
              ? 'bg-purple-500'
              : 'border border-gray-400 bg-white hover:border-purple-400'
          }`}>
          </div>
          <span className="text-sm font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ResidenceTypeSelector;