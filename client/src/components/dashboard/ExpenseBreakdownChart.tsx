import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
}

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
  onShowStaffWarning = () => {}
}: ExpenseBreakdownChartProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl" data-testid="card-expense-breakdown">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          {categoryFilter === 'financials' ? 'Expense' : categoryFilter === 'staff' ? 'Access' : 'Geography'}
        </h3>
        <button
          onClick={() => {
            if (showCreateBatch && areChartsMinimized) {
              onShowBatchWarning();
            } else if (showStaffForm && areChartsMinimized) {
              onShowStaffWarning();
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
      
      {!areChartsMinimized && (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {expenseData.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
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
        </>
      )}
    </div>
  );
}
