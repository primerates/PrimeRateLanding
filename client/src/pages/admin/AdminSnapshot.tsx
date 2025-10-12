import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Filter, ArrowLeft } from 'lucide-react';

export default function AdminSnapshot() {
  const [, setLocation] = useLocation();
  const [entityFilter, setEntityFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('mtd');
  const [revenueDetailView, setRevenueDetailView] = useState<string | null>(null);

  // Sample data - in production, this would come from your API
  const metricsData = {
    grossIncome: 2847500,
    revenue: 1923400,
    expense: 924100
  };

  const revenueData = [
    { name: 'Direct Mail', value: 685020, color: '#6366f1' },
    { name: 'Lead Vendors', value: 480850, color: '#8b5cf6' },
    { name: 'Social Media', value: 365510, color: '#ec4899' },
    { name: 'Repeat Clients', value: 250340, color: '#f59e0b' },
    { name: 'Referrals', value: 141680, color: '#10b981' }
  ];

  const expenseData = [
    { name: 'Marketing', value: 323435, color: '#ef4444' },
    { name: 'Staff', value: 277230, color: '#f97316' },
    { name: 'Vendors', value: 184820, color: '#eab308' },
    { name: 'Services', value: 92410, color: '#06b6d4' },
    { name: 'Supplies', value: 46205, color: '#8b5cf6' }
  ];

  // Drill-down data for Direct Mail example
  const directMailByState = [
    { name: 'California', value: 205506 },
    { name: 'Texas', value: 171255 },
    { name: 'Florida', value: 137004 },
    { name: 'New York', value: 102753 },
    { name: 'Others', value: 68502 }
  ];

  const loanProgramData = [
    { name: 'Conventional', value: 274008 },
    { name: 'FHA', value: 205506 },
    { name: 'VA', value: 137004 },
    { name: 'Jumbo', value: 48251 },
    { name: 'USDA', value: 20251 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/admin/dashboard')}
              className="text-purple-300 hover:text-white hover:bg-purple-500/20"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2" data-testid="heading-analytics-dashboard">Analytics Dashboard</h1>
              <p className="text-purple-300">Real-time financial insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-purple-200 text-sm">Live</span>
          </div>
        </div>

        {/* Top Card - Filters and Metrics */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-400" />
              <select 
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                data-testid="select-entity-filter"
              >
                <option value="all">Show All</option>
                <option value="company">Company</option>
                <option value="branch">Branch</option>
                <option value="partners">Partners</option>
              </select>
            </div>
            
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
              data-testid="select-time-filter"
            >
              <option value="today">Today</option>
              <option value="mtd">Month to Date</option>
              <option value="ytd">Year to Date</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gross Income */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all" data-testid="card-gross-income">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-300 text-sm font-medium">Gross Income</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1" data-testid="value-gross-income">{formatCurrency(metricsData.grossIncome)}</div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12.5% vs last period</span>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/50 transition-all" data-testid="card-revenue">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 text-sm font-medium">Revenue</span>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1" data-testid="value-revenue">{formatCurrency(metricsData.revenue)}</div>
              <div className="flex items-center gap-1 text-blue-400 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+8.3% vs last period</span>
              </div>
            </div>

            {/* Expense */}
            <div className="bg-gradient-to-br from-red-500/20 to-pink-600/20 rounded-xl p-6 border border-red-500/30 hover:border-red-500/50 transition-all" data-testid="card-expense">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-300 text-sm font-medium">Expense</span>
                <ArrowDownRight className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1" data-testid="value-expense">{formatCurrency(metricsData.expense)}</div>
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <ArrowDownRight className="w-4 h-4" />
                <span>-3.2% vs last period</span>
              </div>
            </div>
          </div>
        </div>

        {/* Second Card - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Breakdown */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl" data-testid="card-revenue-sources">
            <h3 className="text-xl font-bold text-white mb-4">Revenue Sources</h3>
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
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px' }}
                    />
                    <Legend />
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
                  ← Back to Revenue Sources
                </button>
                <h4 className="text-lg font-semibold text-white mb-4">Direct Mail - State Breakdown</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={directMailByState}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#a78bfa" />
                    <YAxis stroke="#a78bfa" />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px' }}
                    />
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
          </div>

          {/* Expense Breakdown */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl" data-testid="card-expense-breakdown">
            <h3 className="text-xl font-bold text-white mb-4">Expense Breakdown</h3>
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
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px' }}
                />
                <Legend />
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
          </div>
        </div>
      </div>
    </div>
  );
}
