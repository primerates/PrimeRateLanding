import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Filter, ArrowLeft, Plus, X, ArrowUpDown, Minus, MoreVertical } from 'lucide-react';

export default function AdminSnapshot() {
  const [, setLocation] = useLocation();
  const [entityFilter, setEntityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('financials');
  const [timeFilter, setTimeFilter] = useState('mtd');
  const [revenueDetailView, setRevenueDetailView] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [isRevenueFormMinimized, setIsRevenueFormMinimized] = useState(false);
  const [isExpenseTableMinimized, setIsExpenseTableMinimized] = useState(false);
  const [areChartsMinimized, setAreChartsMinimized] = useState(false);
  const [isTransactionsMinimized, setIsTransactionsMinimized] = useState(false);
  const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);
  const [transactionDateFilter, setTransactionDateFilter] = useState('today');
  const [transactionDateRange, setTransactionDateRange] = useState({
    fromDate: '',
    toDate: ''
  });
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editingRevenueId, setEditingRevenueId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<number | null>(null);
  const [deleteRevenueId, setDeleteRevenueId] = useState<number | null>(null);
  const [adminCode, setAdminCode] = useState('');
  const [expenseEntries, setExpenseEntries] = useState([
    {
      id: 1,
      logDate: '10/01/2025',
      expense: '$5,000',
      paidWith: 'Amex',
      expenseCategory: 'Marketing',
      paidTo: 'Google Ads',
      transactionDate: '10/01/2025',
      clearanceDate: '10/02/2025'
    },
    {
      id: 2,
      logDate: '10/05/2025',
      expense: '$1,250',
      paidWith: 'Capital One',
      expenseCategory: 'Supplies',
      paidTo: 'Staples',
      transactionDate: '10/04/2025',
      clearanceDate: '10/06/2025'
    }
  ]);
  const [revenueEntries, setRevenueEntries] = useState([
    {
      id: 1,
      logDate: '10/03/2025',
      revenue: '$15,000',
      paymentForm: 'Wire Transfer',
      revenueCategory: 'Select',
      paymentFrom: 'ABC Mortgage',
      transactionDate: '10/03/2025',
      clearanceDate: '10/04/2025',
      revenueTerm: 'One-Time Payment'
    }
  ]);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [newExpense, setNewExpense] = useState({
    logDate: '',
    expense: '',
    paidWith: '',
    expenseCategory: '',
    paidTo: '',
    transactionDate: '',
    clearanceDate: '',
    paymentTerm: ''
  });
  const [newRevenue, setNewRevenue] = useState({
    logDate: '',
    revenue: '',
    paymentForm: '',
    revenueCategory: '',
    paymentFrom: '',
    transactionDate: '',
    clearanceDate: '',
    revenueTerm: ''
  });

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

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    setNewExpense({ ...newExpense, [field]: value });
  };

  const handleRevenueDateInput = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    setNewRevenue({ ...newRevenue, [field]: value });
  };

  const handleDollarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setNewExpense({ ...newExpense, expense: '' });
      return;
    }
    const numValue = parseInt(value);
    const formatted = '$' + numValue.toLocaleString('en-US');
    setNewExpense({ ...newExpense, expense: formatted });
  };

  const handleRevenueDollarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
      setNewRevenue({ ...newRevenue, revenue: '' });
      return;
    }
    const numValue = parseInt(value);
    const formatted = '$' + numValue.toLocaleString('en-US');
    setNewRevenue({ ...newRevenue, revenue: formatted });
  };

  const handleTransactionDateInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'fromDate' | 'toDate') => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    setTransactionDateRange({ ...transactionDateRange, [field]: value });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = [...expenseEntries].sort((a: any, b: any) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleAddExpense = () => {
    if (newExpense.logDate && newExpense.expense) {
      if (isEditMode && editingExpenseId) {
        // Update existing expense
        setExpenseEntries(expenseEntries.map(entry => 
          entry.id === editingExpenseId ? { ...newExpense, id: editingExpenseId } : entry
        ));
        setIsEditMode(false);
        setEditingExpenseId(null);
      } else {
        // Add new expense
        setExpenseEntries([...expenseEntries, { ...newExpense, id: expenseEntries.length + 1 }]);
      }
      setNewExpense({
        logDate: '',
        expense: '',
        paidWith: '',
        expenseCategory: '',
        paidTo: '',
        transactionDate: '',
        clearanceDate: '',
        paymentTerm: ''
      });
      setShowExpenseForm(false);
    }
  };

  const handleEditExpense = (expense: any) => {
    setNewExpense({
      logDate: expense.logDate,
      expense: expense.expense,
      paidWith: expense.paidWith,
      expenseCategory: expense.expenseCategory,
      paidTo: expense.paidTo,
      transactionDate: expense.transactionDate,
      clearanceDate: expense.clearanceDate,
      paymentTerm: expense.paymentTerm || ''
    });
    setIsEditMode(true);
    setEditingExpenseId(expense.id);
    setShowExpenseForm(true);
    setAreChartsMinimized(true); // Minimize charts to reduce clutter
    setOpenActionMenu(null);
  };

  const handleDeleteExpense = (expenseId: number) => {
    setDeleteExpenseId(expenseId);
    setShowDeleteModal(true);
    setOpenActionMenu(null);
  };

  const confirmDelete = () => {
    // In production, validate admin code here
    if (deleteExpenseId) {
      setExpenseEntries(expenseEntries.filter(entry => entry.id !== deleteExpenseId));
      setShowDeleteModal(false);
      setDeleteExpenseId(null);
      setAdminCode('');
    }
    if (deleteRevenueId) {
      setRevenueEntries(revenueEntries.filter(entry => entry.id !== deleteRevenueId));
      setShowDeleteModal(false);
      setDeleteRevenueId(null);
      setAdminCode('');
    }
  };

  const handleAddRevenue = () => {
    if (newRevenue.logDate && newRevenue.revenue) {
      if (isEditMode && editingRevenueId) {
        // Update existing revenue
        setRevenueEntries(revenueEntries.map(entry => 
          entry.id === editingRevenueId ? { ...newRevenue, id: editingRevenueId } : entry
        ));
        setIsEditMode(false);
        setEditingRevenueId(null);
      } else {
        // Add new revenue
        setRevenueEntries([...revenueEntries, { ...newRevenue, id: revenueEntries.length + 1 }]);
      }
      setNewRevenue({
        logDate: '',
        revenue: '',
        paymentForm: '',
        revenueCategory: '',
        paymentFrom: '',
        transactionDate: '',
        clearanceDate: '',
        revenueTerm: ''
      });
      // Minimize the form but keep transactions visible
      setIsRevenueFormMinimized(true);
    }
  };

  const handleEditRevenue = (revenue: any) => {
    setNewRevenue({
      logDate: revenue.logDate,
      revenue: revenue.revenue,
      paymentForm: revenue.paymentForm,
      revenueCategory: revenue.revenueCategory,
      paymentFrom: revenue.paymentFrom,
      transactionDate: revenue.transactionDate,
      clearanceDate: revenue.clearanceDate,
      revenueTerm: revenue.revenueTerm || ''
    });
    setIsEditMode(true);
    setEditingRevenueId(revenue.id);
    setShowRevenueForm(true);
    setIsRevenueFormMinimized(false); // Expand form when editing
    setAreChartsMinimized(true); // Minimize charts to reduce clutter
    setOpenActionMenu(null);
  };

  const handleDeleteRevenue = (revenueId: number) => {
    setDeleteRevenueId(revenueId);
    setShowDeleteModal(true);
    setOpenActionMenu(null);
  };

  const sortedRevenues = [...revenueEntries].sort((a: any, b: any) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Custom tooltip that matches the pie slice color
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      // Use the color from the data if available (pie chart), otherwise use the fill color (bar chart)
      const bgColor = data.payload.color || data.fill || '#6366f1';
      return (
        <div
          className="px-3 py-2 rounded-lg shadow-lg"
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${bgColor}`,
          }}
        >
          <p className="text-white font-semibold text-sm">{data.name}</p>
          <p className="text-white text-sm">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black italic text-white mb-2" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }} data-testid="heading-analytics-dashboard">LOANVIEW GPT</h1>
            <div className="flex items-center gap-2">
              <p 
                className="text-purple-300 cursor-pointer hover:text-purple-200 transition-colors"
                onClick={() => setLocation('/admin/dashboard')}
              >
                Dashboard
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/admin/dashboard')}
                className="text-purple-300 hover:text-white hover:bg-purple-500/20 h-6 w-6"
                title="Back to Snapshot"
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-purple-200 text-sm">Live</span>
            </div>
            <button 
              onClick={() => {
                setShowAddModal(true);
                setIsFiltersMinimized(true); // Minimize Dashboard card for cleaner data entry
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg border border-purple-400/30 transition-all shadow-lg hover:shadow-purple-500/50"
              data-testid="button-add-entry"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold">Add Entry</span>
            </button>
          </div>
        </div>

        {/* Top Card - Filters and Metrics */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Performance</h3>
            <div className="flex items-center gap-3">
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-white px-3 py-1 rounded-lg focus:outline-none transition-colors cursor-pointer"
                data-testid="select-time-filter"
              >
                <option value="today">Today</option>
                <option value="mtd">Month to Date</option>
                <option value="ytd">Year to Date</option>
                <option value="custom">Custom Date Range</option>
              </select>
              <button
                onClick={() => setIsFiltersMinimized(!isFiltersMinimized)}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                title={isFiltersMinimized ? "Expand" : "Minimize"}
                data-testid="button-toggle-filters"
              >
                {isFiltersMinimized ? (
                  <Plus className="w-5 h-5 text-purple-300" />
                ) : (
                  <Minus className="w-5 h-5 text-purple-300" />
                )}
              </button>
            </div>
          </div>

          {!isFiltersMinimized && (
            <>
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
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                  data-testid="select-category-filter"
                >
                  <option value="financials">Financials</option>
                  <option value="direct-mail">Direct Mail</option>
                  <option value="lead-vendor">Lead Vendor</option>
                  <option value="social-media">Social Media</option>
                  <option value="loan-agent">Loan Agent</option>
                  <option value="loan-processor">Loan Processor</option>
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
            </>
          )}
        </div>

        {/* Second Card - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Breakdown */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl" data-testid="card-revenue-sources">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Revenue</h3>
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

          {/* Expense Breakdown */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl" data-testid="card-expense-breakdown">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Expense</h3>
              <button
                onClick={() => setAreChartsMinimized(!areChartsMinimized)}
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
        </div>

        {/* Expense Entry Form */}
        {showExpenseForm && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl animate-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Expense log</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpenseTableMinimized(!isExpenseTableMinimized)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isExpenseTableMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-expense-form"
                >
                  {isExpenseTableMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowExpenseForm(false)}
                  className="text-purple-300 hover:text-white transition-colors"
                  data-testid="button-close-expense-form"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Separation line */}
            <div className="border-t border-purple-500/30 mb-6"></div>

            {!isExpenseTableMinimized && (
              <>
                {/* First Row: Log Date, Transaction Date, Clear Date, Expense Category */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Log Date (MM/DD/YYYY)"
                    value={newExpense.logDate}
                    onChange={(e) => handleDateInput(e, 'logDate')}
                    maxLength={10}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="input-log-date"
                  />
                  <input
                    type="text"
                    placeholder="Transaction Date (MM/DD/YYYY)"
                    value={newExpense.transactionDate}
                    onChange={(e) => handleDateInput(e, 'transactionDate')}
                    maxLength={10}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="input-transaction-date"
                  />
                  <input
                    type="text"
                    placeholder="Clear Date (MM/DD/YYYY)"
                    value={newExpense.clearanceDate}
                    onChange={(e) => handleDateInput(e, 'clearanceDate')}
                    maxLength={10}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="input-clear-date"
                  />
                  <select
                    value={newExpense.expenseCategory}
                    onChange={(e) => setNewExpense({ ...newExpense, expenseCategory: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-expense-category"
                  >
                    <option value="">Expense Category</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Staff">Staff</option>
                    <option value="Vendors">Vendors</option>
                    <option value="Services">Services</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                </div>

                {/* Second Row: Payment Term, Paid To, Paid By, Amount */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <select
                    value={newExpense.paymentTerm}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentTerm: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-payment-term"
                  >
                    <option value="" disabled>Payment Term</option>
                    <option value="Monthly Payment">Monthly Payment</option>
                    <option value="One Time Payment">One Time Payment</option>
                  </select>
                  <select
                    value={newExpense.paidTo}
                    onChange={(e) => setNewExpense({ ...newExpense, paidTo: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-paid-to"
                  >
                    <option value="" disabled>Paid To</option>
                    <option value="Select">Select</option>
                    <option value="TBD">TBD</option>
                  </select>
                  <select
                    value={newExpense.paidWith}
                    onChange={(e) => setNewExpense({ ...newExpense, paidWith: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-paid-by"
                  >
                    <option value="" disabled>Paid By</option>
                    <option value="Select">Select</option>
                    <option value="TBD">TBD</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Amount"
                    value={newExpense.expense}
                    onChange={handleDollarInput}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="input-expense"
                  />
                </div>

                <button
                  onClick={handleAddExpense}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg border border-purple-400/30 transition-all shadow-lg hover:shadow-purple-500/50"
                  data-testid="button-submit-expense"
                >
                  {isEditMode ? 'Update Expense' : 'Add Expense'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Transactions Table - Separate Card */}
        {showExpenseForm && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl animate-roll-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Transactions</h3>
              <button
                onClick={() => setIsTransactionsMinimized(!isTransactionsMinimized)}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                title={isTransactionsMinimized ? "Expand" : "Minimize"}
                data-testid="button-toggle-transactions"
              >
                {isTransactionsMinimized ? (
                  <Plus className="w-5 h-5 text-purple-300" />
                ) : (
                  <Minus className="w-5 h-5 text-purple-300" />
                )}
              </button>
            </div>

            {/* Date Filter Dropdown */}
            {!isTransactionsMinimized && (
              <div className="mb-4">
                <select 
                  value={transactionDateFilter}
                  onChange={(e) => setTransactionDateFilter(e.target.value)}
                  className="bg-transparent text-purple-300 px-0 py-1 focus:outline-none border-none cursor-pointer"
                  data-testid="select-transaction-date-filter"
                >
                  <option value="today">Today</option>
                  <option value="mtd">MTD</option>
                  <option value="ytd">YTD</option>
                  <option value="dateRange">Date Range</option>
                </select>

                {/* Date Range Inputs */}
                {transactionDateFilter === 'dateRange' && (
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <label className="text-purple-300 text-sm">From Date:</label>
                      <input
                        type="text"
                        placeholder="MM/DD/YYYY"
                        value={transactionDateRange.fromDate}
                        onChange={(e) => handleTransactionDateInput(e, 'fromDate')}
                        className="bg-slate-700/50 text-white px-3 py-1 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        data-testid="input-from-date"
                        maxLength={10}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-purple-300 text-sm">To Date:</label>
                      <input
                        type="text"
                        placeholder="MM/DD/YYYY"
                        value={transactionDateRange.toDate}
                        onChange={(e) => handleTransactionDateInput(e, 'toDate')}
                        className="bg-slate-700/50 text-white px-3 py-1 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        data-testid="input-to-date"
                        maxLength={10}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Separation line */}
            <div className="border-t border-purple-500/30 mb-6"></div>

            {!isTransactionsMinimized && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-500/30">
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('logDate')}
                        data-testid="header-log-date"
                      >
                        <div className="flex items-center gap-1">
                          Log Date
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('transactionDate')}
                        data-testid="header-transaction-date"
                      >
                        <div className="flex items-center gap-1">
                          Transaction Date
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('clearanceDate')}
                        data-testid="header-clear-date"
                      >
                        <div className="flex items-center gap-1">
                          Clear Date
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('expenseCategory')}
                        data-testid="header-expense-category"
                      >
                        <div className="flex items-center gap-1">
                          Category
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('paymentTerm')}
                        data-testid="header-payment-term"
                      >
                        <div className="flex items-center gap-1">
                          Payment Term
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('paidTo')}
                        data-testid="header-paid-to"
                      >
                        <div className="flex items-center gap-1">
                          Paid To
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('paidWith')}
                        data-testid="header-paid-by"
                      >
                        <div className="flex items-center gap-1">
                          Paid By
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('expense')}
                        data-testid="header-expense"
                      >
                        <div className="flex items-center gap-1">
                          Amount
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="text-left text-purple-300 font-semibold py-3 px-2">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedExpenses.map((entry: any) => (
                      <tr 
                        key={entry.id} 
                        className="border-b border-purple-500/10 hover:bg-slate-700/30 transition-colors"
                        data-testid={`expense-row-${entry.id}`}
                      >
                        <td className="py-3 px-2 text-purple-200">{entry.logDate}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.transactionDate}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.clearanceDate}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.expenseCategory}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.paymentTerm || '-'}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.paidTo}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.paidWith}</td>
                        <td className="py-3 px-2 text-white">{entry.expense}</td>
                        <td className="py-3 px-2 relative">
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === entry.id ? null : entry.id)}
                            className="text-purple-300 hover:text-white transition-colors"
                            data-testid={`button-action-menu-${entry.id}`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {/* Action Menu Popup */}
                          {openActionMenu === entry.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-slate-800 rounded-lg border border-purple-500/30 shadow-xl z-50 overflow-hidden">
                              <button
                                onClick={() => handleEditExpense(entry)}
                                className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                                data-testid={`button-edit-${entry.id}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(entry.id)}
                                className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                                data-testid={`button-delete-${entry.id}`}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Revenue Log - Similar structure to Expense Log */}
        {showRevenueForm && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl animate-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Revenue Log</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRevenueFormMinimized(!isRevenueFormMinimized)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isRevenueFormMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-revenue-form"
                >
                  {isRevenueFormMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowRevenueForm(false)}
                  className="text-purple-300 hover:text-white transition-colors"
                  data-testid="button-close-revenue-form"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Separation line */}
            <div className="border-t border-purple-500/30 mb-6"></div>

            {!isRevenueFormMinimized && (
              <>
                {/* First Row: Log Date, Transaction Date, Clear Date, Revenue Category */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Log Date (MM/DD/YYYY)"
                    value={newRevenue.logDate}
                    onChange={(e) => handleRevenueDateInput(e, 'logDate')}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="input-revenue-log-date"
                  />
                  <input
                    type="text"
                    placeholder="Transaction Date (MM/DD/YYYY)"
                    value={newRevenue.transactionDate}
                    onChange={(e) => handleRevenueDateInput(e, 'transactionDate')}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="input-revenue-transaction-date"
                  />
                  <input
                    type="text"
                    placeholder="Clear Date (MM/DD/YYYY)"
                    value={newRevenue.clearanceDate}
                    onChange={(e) => handleRevenueDateInput(e, 'clearanceDate')}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="input-revenue-clear-date"
                  />
                  <select
                    value={newRevenue.revenueCategory}
                    onChange={(e) => setNewRevenue({ ...newRevenue, revenueCategory: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-revenue-category"
                  >
                    <option value="" disabled>Revenue Category</option>
                    <option value="Select">Select</option>
                    <option value="TBD">TBD</option>
                  </select>
                </div>

                {/* Second Row: Revenue Term, Payment From, Payment Form, Amount */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <select
                    value={newRevenue.revenueTerm}
                    onChange={(e) => setNewRevenue({ ...newRevenue, revenueTerm: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-revenue-term"
                  >
                    <option value="" disabled>Revenue Term</option>
                    <option value="Monthly Payment">Monthly Payment</option>
                    <option value="One-Time Payment">One-Time Payment</option>
                  </select>
                  <select
                    value={newRevenue.paymentFrom}
                    onChange={(e) => setNewRevenue({ ...newRevenue, paymentFrom: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-payment-from"
                  >
                    <option value="" disabled>Payment From</option>
                    <option value="Select">Select</option>
                    <option value="TBD">TBD</option>
                  </select>
                  <select
                    value={newRevenue.paymentForm}
                    onChange={(e) => setNewRevenue({ ...newRevenue, paymentForm: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-payment-form"
                  >
                    <option value="" disabled>Payment Form</option>
                    <option value="Select">Select</option>
                    <option value="TBD">TBD</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Amount"
                    value={newRevenue.revenue}
                    onChange={handleRevenueDollarInput}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="input-revenue"
                  />
                </div>

                <button
                  onClick={handleAddRevenue}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg border border-purple-400/30 transition-all shadow-lg hover:shadow-purple-500/50"
                  data-testid="button-submit-revenue"
                >
                  {isEditMode ? 'Update Revenue' : 'Add Revenue'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Transactions Table for Revenue - Separate Card */}
        {showRevenueForm && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl animate-roll-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Transactions</h3>
              <button
                onClick={() => setIsTransactionsMinimized(!isTransactionsMinimized)}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                title={isTransactionsMinimized ? "Expand" : "Minimize"}
                data-testid="button-toggle-revenue-transactions"
              >
                {isTransactionsMinimized ? (
                  <Plus className="w-5 h-5 text-purple-300" />
                ) : (
                  <Minus className="w-5 h-5 text-purple-300" />
                )}
              </button>
            </div>

            {!isTransactionsMinimized && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <select
                    value={transactionDateFilter}
                    onChange={(e) => setTransactionDateFilter(e.target.value)}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                    data-testid="select-revenue-date-filter"
                  >
                    <option value="today">Today</option>
                    <option value="mtd">MTD</option>
                    <option value="ytd">YTD</option>
                    <option value="dateRange">Date Range</option>
                  </select>

                  {transactionDateFilter === 'dateRange' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="From (MM/DD/YYYY)"
                        value={transactionDateRange.fromDate}
                        onChange={(e) => handleTransactionDateInput(e, 'fromDate')}
                        className="bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm w-36"
                        data-testid="input-revenue-from-date"
                      />
                      <input
                        type="text"
                        placeholder="To (MM/DD/YYYY)"
                        value={transactionDateRange.toDate}
                        onChange={(e) => handleTransactionDateInput(e, 'toDate')}
                        className="bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm w-36"
                        data-testid="input-revenue-to-date"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Separation line */}
            <div className="border-t border-purple-500/30 mb-6"></div>

            {!isTransactionsMinimized && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-500/30">
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('logDate')}
                        data-testid="header-revenue-log-date"
                      >
                        <div className="flex items-center gap-1">
                          Log Date
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('transactionDate')}
                        data-testid="header-revenue-transaction-date"
                      >
                        <div className="flex items-center gap-1">
                          Transaction Date
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('clearanceDate')}
                        data-testid="header-revenue-clear-date"
                      >
                        <div className="flex items-center gap-1">
                          Clear Date
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('revenueCategory')}
                        data-testid="header-revenue-category"
                      >
                        <div className="flex items-center gap-1">
                          Revenue Category
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('revenueTerm')}
                        data-testid="header-revenue-term"
                      >
                        <div className="flex items-center gap-1">
                          Revenue Term
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('paymentFrom')}
                        data-testid="header-payment-from"
                      >
                        <div className="flex items-center gap-1">
                          Payment From
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('paymentForm')}
                        data-testid="header-payment-form"
                      >
                        <div className="flex items-center gap-1">
                          Payment Form
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                        onClick={() => handleSort('revenue')}
                        data-testid="header-revenue"
                      >
                        <div className="flex items-center gap-1">
                          Amount
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="text-left text-purple-300 font-semibold py-3 px-2">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRevenues.map((entry: any) => (
                      <tr 
                        key={entry.id} 
                        className="border-b border-purple-500/10 hover:bg-slate-700/30 transition-colors"
                        data-testid={`revenue-row-${entry.id}`}
                      >
                        <td className="py-3 px-2 text-purple-200">{entry.logDate}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.transactionDate}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.clearanceDate}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.revenueCategory}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.revenueTerm || '-'}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.paymentFrom}</td>
                        <td className="py-3 px-2 text-purple-200">{entry.paymentForm}</td>
                        <td className="py-3 px-2 text-white">{entry.revenue}</td>
                        <td className="py-3 px-2 relative">
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === entry.id ? null : entry.id)}
                            className="text-purple-300 hover:text-white transition-colors"
                            data-testid={`button-revenue-action-menu-${entry.id}`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {/* Action Menu Popup */}
                          {openActionMenu === entry.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-slate-800 rounded-lg border border-purple-500/30 shadow-xl z-50 overflow-hidden">
                              <button
                                onClick={() => handleEditRevenue(entry)}
                                className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                                data-testid={`button-revenue-edit-${entry.id}`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRevenue(entry.id)}
                                className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                                data-testid={`button-revenue-delete-${entry.id}`}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Entry Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-purple-500/30 shadow-2xl max-w-md w-full p-6 relative animate-in">
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors"
                data-testid="button-close-modal"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6">Add New Entry</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setEntryType('revenue');
                    setShowRevenueForm(true);
                    setIsRevenueFormMinimized(false); // Ensure form is expanded when adding new revenue
                    setAreChartsMinimized(true); // Minimize charts to reduce clutter
                    setShowAddModal(false);
                  }}
                  className="w-full p-6 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 hover:from-blue-500/30 hover:to-indigo-600/30 rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-all group"
                  data-testid="button-add-revenue"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white mb-1">Add Revenue</h3>
                      <p className="text-blue-300 text-sm">Record new income or revenue</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setEntryType('expense');
                    setShowExpenseForm(true);
                    setAreChartsMinimized(true); // Minimize charts to reduce clutter
                    setShowAddModal(false);
                  }}
                  className="w-full p-6 bg-gradient-to-br from-red-500/20 to-pink-600/20 hover:from-red-500/30 hover:to-pink-600/30 rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all group"
                  data-testid="button-add-expense"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white mb-1">Add Expense</h3>
                      <p className="text-red-300 text-sm">Record new cost or expense</p>
                    </div>
                    <ArrowDownRight className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-purple-500/30 shadow-2xl max-w-md w-full p-6 relative animate-in">
              <h2 className="text-2xl font-bold text-white mb-6">
                {deleteExpenseId ? 'Delete Expense' : 'Delete Revenue'}
              </h2>
              
              <p className="text-purple-300 mb-6">Enter admin code to confirm deletion</p>
              
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter 4-digit Admin Code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  maxLength={4}
                  className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                  data-testid="input-admin-code"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteExpenseId(null);
                      setDeleteRevenueId(null);
                      setAdminCode('');
                    }}
                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg border border-purple-500/30 transition-all"
                    data-testid="button-go-back"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold rounded-lg border border-red-400/30 transition-all shadow-lg hover:shadow-red-500/50"
                    data-testid="button-confirm-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
