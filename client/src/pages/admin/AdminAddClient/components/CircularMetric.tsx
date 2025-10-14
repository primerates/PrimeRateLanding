import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface CircularMetricProps {
  label: string;
  value: ReactNode;
  showAnimation?: boolean;
  testId?: string;
}

const CircularMetric = ({
  label,
  value,
  showAnimation = false,
  testId
}: CircularMetricProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-semibold">{label}</Label>
      <div className="min-h-[40px] flex items-center">
        <div
          className="bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
          style={{
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            fontSize: '36px',
            fontWeight: 600,
            backgroundColor: '#1a3373',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
          }}
          data-testid={testId}
        >
          <span className={`${showAnimation ? 'animate-roll-down' : ''}`}>
            {value}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CircularMetric;