import React, { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { DollarSign } from 'lucide-react';

// Helper function to calculate color state based on estimated vs appraised values
const getValueComparisonColor = (estimatedValue: string, appraisedValue: string): { iconClass: string; shadowColor: 'green' | 'red' | 'none' } => {
  const parseValue = (value: string) => {
    if (!value) return 0;
    // Handle both raw numbers and formatted currency
    const cleaned = value.replace(/[^\d.]/g, '');
    return cleaned ? parseFloat(cleaned) : 0;
  };

  const estimatedNum = parseValue(estimatedValue || '');
  const appraisedNum = parseValue(appraisedValue || '');

  if (appraisedNum === 0 || estimatedNum === 0) {
    return { iconClass: 'text-black hover:text-gray-600', shadowColor: 'none' };
  } else if (appraisedNum > estimatedNum) {
    return { iconClass: 'text-green-600 hover:text-green-800', shadowColor: 'green' };
  } else if (appraisedNum < estimatedNum) {
    return { iconClass: 'text-red-600 hover:text-red-800', shadowColor: 'red' };
  } else {
    return { iconClass: 'text-black hover:text-gray-600', shadowColor: 'none' };
  }
};

interface AppraisalIconProps {
  index: number;
  control: any;
}

// Memoized AppraisalIcon component to prevent typing lag
const AppraisalIcon = React.memo<AppraisalIconProps>(({ index, control }) => {
  const estimatedValue = useWatch({ 
    control, 
    name: `property.properties.${index}.estimatedValue` as const 
  });
  const appraisedValue = useWatch({ 
    control, 
    name: `property.properties.${index}.appraisedValue` as const 
  });

  const { iconClass } = useMemo(() => {
    return getValueComparisonColor(estimatedValue || '', appraisedValue || '');
  }, [estimatedValue, appraisedValue]);

  return <DollarSign className={`h-4 w-4 ${iconClass}`} />;
});

AppraisalIcon.displayName = 'AppraisalIcon';

export default AppraisalIcon;
export { getValueComparisonColor };