import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseBreakdownChartProps {
  categoryFilter: string;
  expenseData: ChartData[];
  areChartsMinimized: boolean;
  setAreChartsMinimized: (value: boolean) => void;
  formatCurrency: (value: number) => string;
  CustomTooltip: any;
  showCreateBatch?: boolean;
  onShowBatchWarning?: () => void;
  showStaffForm?: boolean;
  onShowStaffWarning?: () => void;
  showExpenseForm?: boolean;
  showRevenueForm?: boolean;
  onShowFormConflictWarning?: (type: 'expense' | 'revenue') => void;
}

// Helper functions for donut chart
const calculateSegments = (data: ChartData[]) => {
  // Filter out zero or negative values
  const validData = data.filter(item => item.value > 0);
  
  if (validData.length === 0) {
    return [];
  }

  const total = validData.reduce((sum, item) => sum + item.value, 0);
  
  // Guard against zero or invalid totals
  if (total <= 0 || !isFinite(total)) {
    return [];
  }

  let currentAngle = 0;
  const gap = 2;

  return validData.map((item) => {
    const percentage = item.value / total;
    let angle = (percentage * 360) - gap;
    
    // Ensure angle is non-negative and valid
    angle = Math.max(0.5, angle); // Minimum 0.5 degree slice
    angle = Math.min(360, angle); // Maximum 360 degrees
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    currentAngle = endAngle + gap;

    return {
      ...item,
      startAngle,
      endAngle,
      angle
    };
  });
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const createArc = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
  const start = polarToCartesian(100, 100, outerRadius, endAngle);
  const end = polarToCartesian(100, 100, outerRadius, startAngle);
  const innerStart = polarToCartesian(100, 100, innerRadius, endAngle);
  const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${start.x} ${start.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    'Z'
  ].join(' ');
};

export function ExpenseBreakdownChart({
  categoryFilter,
  expenseData,
  areChartsMinimized,
  setAreChartsMinimized,
  formatCurrency,
  CustomTooltip,
  showCreateBatch = false,
  onShowBatchWarning = () => {},
  showStaffForm = false,
  onShowStaffWarning = () => {},
  showExpenseForm = false,
  showRevenueForm = false,
  onShowFormConflictWarning = () => {}
}: ExpenseBreakdownChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [selectedLegend, setSelectedLegend] = useState<number | null>(null);
  const [animateSegments, setAnimateSegments] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateSegments(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced Donut Chart with animations and interactions
  const DonutChart = ({ data, size = 280 }: { data: ChartData[], size?: number }) => {
    const segments = calculateSegments(data);
    const innerRadius = 60;
    const outerRadius = 95;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full" style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}>
          {segments.map((segment, index) => {
            const isHovered = hoveredSegment === index;
            const isSelected = selectedLegend === index;
            const isDimmed = selectedLegend !== null && !isSelected;
            
            return (
              <g 
                key={index}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <path
                  d={createArc(
                    segment.startAngle, 
                    segment.endAngle, 
                    isHovered ? innerRadius - 2 : innerRadius, 
                    isHovered ? outerRadius + 4 : outerRadius
                  )}
                  fill={segment.color}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    opacity: isDimmed ? 0.3 : 1,
                    filter: isHovered || isSelected ? 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.6))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                    strokeDasharray: animateSegments ? '1000' : '0',
                    strokeDashoffset: animateSegments ? '0' : '1000',
                    animation: animateSegments ? `drawSegment 1s ease-out ${index * 0.1}s forwards` : 'none'
                  }}
                />
              </g>
            );
          })}
          
          {/* Center circle with total */}
          <circle cx="100" cy="100" r={innerRadius} fill="#1e293b" />
          <text x="100" y="95" textAnchor="middle" className="fill-purple-300 text-xs font-medium">
            Total
          </text>
          <text x="100" y="110" textAnchor="middle" className="fill-white text-sm font-bold">
            {formatCurrency(total)}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl" data-testid="card-expense-breakdown">
      <style>{`
        @keyframes drawSegment {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          {categoryFilter === 'financials' ? 'Expense' : categoryFilter === 'staff' ? 'Access' : categoryFilter === 'vendor' ? 'All Vendors' : 'Geography'}
        </h3>
        <button
          onClick={() => {
            if (showCreateBatch && areChartsMinimized) {
              onShowBatchWarning();
            } else if (showStaffForm && areChartsMinimized) {
              onShowStaffWarning();
            } else if (showExpenseForm && areChartsMinimized) {
              onShowFormConflictWarning('expense');
            } else if (showRevenueForm && areChartsMinimized) {
              onShowFormConflictWarning('revenue');
            } else {
              setAreChartsMinimized(!areChartsMinimized);
            }
          }}
          className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
          title={areChartsMinimized ? "Expand" : "Minimize"}
          data-testid="button-toggle-expense-chart"
        >
          {areChartsMinimized ? (
            <Plus className="w-5 h-5 text-purple-300" />
          ) : (
            <Minus className="w-5 h-5 text-purple-300" />
          )}
        </button>
      </div>
      
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          areChartsMinimized ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
        }`}
      >
        <div className="h-[300px] flex items-center justify-center">
          <DonutChart data={expenseData} size={280} />
        </div>
        <div className="mt-4 space-y-2">
          {expenseData.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              onMouseEnter={() => setSelectedLegend(index)}
              onMouseLeave={() => setSelectedLegend(null)}
              data-testid={`expense-item-${item.name.toLowerCase()}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-purple-200">{item.name}</span>
              </div>
              <span className="text-white font-semibold">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
