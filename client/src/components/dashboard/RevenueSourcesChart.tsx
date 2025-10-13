import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Minus } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface RevenueSourcesChartProps {
  categoryFilter: string;
  revenueData: ChartData[];
  directMailByState: { name: string; value: number }[];
  loanProgramData: ChartData[];
  areChartsMinimized: boolean;
  setAreChartsMinimized: (value: boolean) => void;
  revenueDetailView: string | null;
  setRevenueDetailView: (value: string | null) => void;
  formatCurrency: (value: number) => string;
  CustomTooltip: any;
}

export function RevenueSourcesChart({
  categoryFilter,
  revenueData,
  directMailByState,
  loanProgramData,
  areChartsMinimized,
  setAreChartsMinimized,
  revenueDetailView,
  setRevenueDetailView,
  formatCurrency,
  CustomTooltip
}: RevenueSourcesChartProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl" data-testid="card-revenue-sources">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{categoryFilter === 'financials' ? 'Revenue' : 'Activity'}</h3>
        <button
          onClick={() => setAreChartsMinimized(!areChartsMinimized)}
          className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
          title={areChartsMinimized ? "Expand" : "Minimize"}
          data-testid="button-toggle-revenue-chart"
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
          {!revenueDetailView ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(data) => {
                      if (data.name === 'Direct Mail') {
                        setRevenueDetailView('directMail');
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {revenueData.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (item.name === 'Direct Mail') {
                        setRevenueDetailView('directMail');
                      }
                    }}
                    data-testid={`revenue-item-${item.name.toLowerCase().replace(' ', '-')}`}
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
          ) : (
            <div>
              <button 
                onClick={() => setRevenueDetailView(null)}
                className="mb-4 text-purple-400 hover:text-purple-300 text-sm"
                data-testid="button-back-to-revenue"
              >
                ← Back to Revenue
              </button>
              <h4 className="text-lg font-semibold text-white mb-4">Direct Mail - State Breakdown</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={directMailByState}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#a78bfa" />
                  <YAxis stroke="#a78bfa" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              
              <h4 className="text-lg font-semibold text-white mb-4 mt-6">Loan Programs</h4>
              <div className="space-y-2">
                {loanProgramData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg" data-testid={`loan-program-${item.name.toLowerCase()}`}>
                    <span className="text-purple-200">{item.name}</span>
                    <span className="text-white font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
