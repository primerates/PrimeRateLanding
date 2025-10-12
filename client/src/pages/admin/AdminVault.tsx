import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Filter, ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface VaultEntry {
  date: string;
  type: 'revenue' | 'expense';
  category: string;
  account: string;
  amount: number;
  budget: number;
}

interface CategorySummary {
  name: string;
  type: 'revenue' | 'expense';
  amount: number;
  budget: number;
}

interface AccountSummary {
  name: string;
  amount: number;
  budget: number;
  type: 'revenue' | 'expense';
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  expense: number;
}

interface PieData {
  name: string;
  value: number;
}

const sampleData: VaultEntry[] = [
  { date: '2023-01-15', type: 'revenue', category: 'Sales', account: 'Product A', amount: 5000, budget: 4500 },
  { date: '2023-02-20', type: 'revenue', category: 'Sales', account: 'Product B', amount: 7500, budget: 7000 },
  { date: '2023-03-10', type: 'expense', category: 'Marketing', account: 'Advertising', amount: 2000, budget: 2500 },
  { date: '2023-04-05', type: 'expense', category: 'Operations', account: 'Rent', amount: 3000, budget: 3000 },
  { date: '2023-05-18', type: 'revenue', category: 'Services', account: 'Consulting', amount: 8000, budget: 7500 },
  { date: '2024-01-12', type: 'revenue', category: 'Sales', account: 'Product A', amount: 6000, budget: 5500 },
  { date: '2024-02-15', type: 'revenue', category: 'Sales', account: 'Product B', amount: 8500, budget: 8000 },
  { date: '2024-03-08', type: 'expense', category: 'Marketing', account: 'Advertising', amount: 2500, budget: 3000 },
  { date: '2024-04-10', type: 'expense', category: 'Operations', account: 'Rent', amount: 3200, budget: 3200 },
  { date: '2024-05-20', type: 'revenue', category: 'Services', account: 'Consulting', amount: 9000, budget: 8500 },
  { date: '2024-06-15', type: 'expense', category: 'Payroll', account: 'Salaries', amount: 15000, budget: 15000 },
  { date: '2024-07-22', type: 'revenue', category: 'Sales', account: 'Product A', amount: 6500, budget: 6000 },
  { date: '2024-08-18', type: 'expense', category: 'Marketing', account: 'Social Media', amount: 1800, budget: 2000 },
  { date: '2024-09-25', type: 'revenue', category: 'Sales', account: 'Product B', amount: 9200, budget: 9000 },
  { date: '2024-10-05', type: 'expense', category: 'Operations', account: 'Utilities', amount: 800, budget: 900 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AdminVault() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [data, setData] = useState<VaultEntry[]>(sampleData);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [viewMode, setViewMode] = useState<'ytd' | 'mtd' | 'year' | 'compare'>('ytd');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [compareYears, setCompareYears] = useState(['2023', '2024']);
  const [filterType, setFilterType] = useState<'all' | 'revenue' | 'expense'>('all');
  const [entriesFilter, setEntriesFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'revenue' | 'expense',
    category: '',
    account: '',
    amount: '',
    budget: '',
  });

  const availableYears = useMemo(() => {
    const years = new Set(data.map(d => new Date(d.date).getFullYear().toString()));
    return Array.from(years).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return data.filter(item => {
      const itemDate = new Date(item.date);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth();

      if (filterType !== 'all' && item.type !== filterType) return false;

      if (viewMode === 'ytd') {
        return itemYear === currentYear;
      } else if (viewMode === 'mtd') {
        return itemYear === currentYear && itemMonth === currentMonth;
      } else if (viewMode === 'year') {
        return itemYear === parseInt(selectedYear);
      } else if (viewMode === 'compare') {
        return compareYears.includes(itemYear.toString());
      }
      return true;
    });
  }, [data, viewMode, selectedYear, compareYears, filterType]);

  const summaryStats = useMemo(() => {
    const revenue = filteredData.filter(d => d.type === 'revenue').reduce((sum, d) => sum + d.amount, 0);
    const expense = filteredData.filter(d => d.type === 'expense').reduce((sum, d) => sum + d.amount, 0);
    const budgetRev = filteredData.filter(d => d.type === 'revenue').reduce((sum, d) => sum + d.budget, 0);
    const budgetExp = filteredData.filter(d => d.type === 'expense').reduce((sum, d) => sum + d.budget, 0);
    
    return {
      revenue,
      expense,
      netIncome: revenue - expense,
      budgetRev,
      budgetExp,
      revVariance: revenue - budgetRev,
      expVariance: budgetExp - expense,
    };
  }, [filteredData]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, CategorySummary> = {};
    filteredData.forEach(item => {
      const key = `${item.type}-${item.category}`;
      if (!breakdown[key]) {
        breakdown[key] = {
          name: item.category,
          type: item.type,
          amount: 0,
          budget: 0,
        };
      }
      breakdown[key].amount += item.amount;
      breakdown[key].budget += item.budget;
    });
    return Object.values(breakdown);
  }, [filteredData]);

  const accountBreakdown = useMemo(() => {
    const breakdown: Record<string, AccountSummary> = {};
    filteredData.forEach(item => {
      if (!breakdown[item.account]) {
        breakdown[item.account] = {
          name: item.account,
          amount: 0,
          budget: 0,
          type: item.type,
        };
      }
      breakdown[item.account].amount += item.amount;
      breakdown[item.account].budget += item.budget;
    });
    return Object.values(breakdown);
  }, [filteredData]);

  const monthlyTrend = useMemo(() => {
    const monthly: Record<string, MonthlyTrend> = {};
    filteredData.forEach(item => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) {
        monthly[key] = { month: key, revenue: 0, expense: 0 };
      }
      if (item.type === 'revenue') {
        monthly[key].revenue += item.amount;
      } else {
        monthly[key].expense += item.amount;
      }
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredData]);

  const pieData = useMemo(() => {
    return categoryBreakdown
      .filter((d) => d.type === (filterType === 'all' ? 'expense' : filterType))
      .map((d) => ({ name: d.name, value: d.amount }));
  }, [categoryBreakdown, filterType]);

  const filteredEntries = useMemo(() => {
    if (entriesFilter === 'all') return data;
    return data.filter(entry => entry.type === entriesFilter);
  }, [data, entriesFilter]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.account.trim()) {
      toast({
        title: "Validation Error",
        description: "Account is required",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be a valid positive number",
        variant: "destructive",
      });
      return;
    }
    
    const budget = formData.budget ? parseFloat(formData.budget) : amount;
    if (isNaN(budget) || budget < 0) {
      toast({
        title: "Validation Error",
        description: "Budget must be a valid positive number",
        variant: "destructive",
      });
      return;
    }
    
    const newEntry: VaultEntry = {
      date: formData.date,
      type: formData.type,
      category: formData.category.trim(),
      account: formData.account.trim(),
      amount,
      budget,
    };
    
    setData([...data, newEntry]);
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: '',
      account: '',
      amount: '',
      budget: '',
    });
    
    setShowEntryForm(false);
    
    toast({
      title: "Entry Added",
      description: `${newEntry.type === 'revenue' ? 'Revenue' : 'Expense'} entry for $${newEntry.amount.toLocaleString()} added successfully`,
    });
  };

  const handleDeleteEntry = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(data.map(d => d.category))).sort();
  }, [data]);

  const uniqueAccounts = useMemo(() => {
    return Array.from(new Set(data.map(d => d.account))).sort();
  }, [data]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin')}
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold" data-testid="text-vault-title">Financial Vault</h1>
          </div>
          <Button
            onClick={() => setShowEntryForm(!showEntryForm)}
            data-testid="button-toggle-entry-form"
          >
            {showEntryForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Close Form
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </>
            )}
          </Button>
        </div>

        {/* Entry Form */}
        {showEntryForm && (
          <Card className="mb-6" data-testid="card-entry-form">
            <CardHeader>
              <CardTitle>Add New Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      data-testid="input-entry-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type" data-testid="select-entry-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      type="text"
                      list="categories"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Marketing, Sales"
                      data-testid="input-entry-category"
                    />
                    <datalist id="categories">
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Account</Label>
                    <Input
                      id="account"
                      type="text"
                      list="accounts"
                      value={formData.account}
                      onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                      placeholder="e.g., Advertising, Product A"
                      data-testid="input-entry-account"
                    />
                    <datalist id="accounts">
                      {uniqueAccounts.map(acc => (
                        <option key={acc} value={acc} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      data-testid="input-entry-amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (Optional)</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="Leave empty to use amount"
                      data-testid="input-entry-budget"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEntryForm(false)}
                    data-testid="button-cancel-entry"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    data-testid="button-submit-entry"
                  >
                    Add Entry
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>View Mode</Label>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger data-testid="select-view-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                    <SelectItem value="mtd">Month to Date</SelectItem>
                    <SelectItem value="year">Specific Year</SelectItem>
                    <SelectItem value="compare">Compare Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {viewMode === 'year' && (
                <div className="space-y-2">
                  <Label>Select Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger data-testid="select-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {viewMode === 'compare' && (
                <div className="space-y-2">
                  <Label>Compare Years</Label>
                  <div className="flex gap-3 items-center pt-2">
                    {availableYears.map(year => (
                      <label key={year} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={compareYears.includes(year)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCompareYears([...compareYears, year]);
                            } else {
                              setCompareYears(compareYears.filter(y => y !== year));
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{year}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Filter Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger data-testid="select-filter-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="revenue">Revenue Only</SelectItem>
                    <SelectItem value="expense">Expense Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card data-testid="card-total-revenue">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${summaryStats.revenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Budget: ${summaryStats.budgetRev.toLocaleString()}</p>
                </div>
                <TrendingUp className="text-green-600 h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-expense">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expense</p>
                  <p className="text-2xl font-bold text-red-600">${summaryStats.expense.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Budget: ${summaryStats.budgetExp.toLocaleString()}</p>
                </div>
                <TrendingDown className="text-red-600 h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-net-income">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Income</p>
                  <p className={`text-2xl font-bold ${summaryStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${summaryStats.netIncome.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="text-blue-600 h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-budget-variance">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Budget Variance</p>
                <p className="text-sm font-semibold">
                  Rev: <span className={summaryStats.revVariance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${summaryStats.revVariance.toLocaleString()}
                  </span>
                </p>
                <p className="text-sm font-semibold">
                  Exp: <span className={summaryStats.expVariance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${summaryStats.expVariance.toLocaleString()}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Analysis Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Category Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Category</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-right py-2 px-4">Actual</th>
                    <th className="text-right py-2 px-4">Budget</th>
                    <th className="text-right py-2 px-4">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((cat, idx) => (
                    <tr key={idx} className="border-b hover-elevate" data-testid={`row-category-${idx}`}>
                      <td className="py-2 px-4">{cat.name}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${cat.type === 'revenue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {cat.type}
                        </span>
                      </td>
                      <td className="text-right py-2 px-4">${cat.amount.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">${cat.budget.toLocaleString()}</td>
                      <td className={`text-right py-2 px-4 ${cat.amount - cat.budget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(cat.amount - cat.budget).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Account Breakdown Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Account</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-right py-2 px-4">Amount</th>
                    <th className="text-right py-2 px-4">Budget</th>
                    <th className="text-right py-2 px-4">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {accountBreakdown.map((acc, idx) => (
                    <tr key={idx} className="border-b hover-elevate" data-testid={`row-account-${idx}`}>
                      <td className="py-2 px-4">{acc.name}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${acc.type === 'revenue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {acc.type}
                        </span>
                      </td>
                      <td className="text-right py-2 px-4">${acc.amount.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">${acc.budget.toLocaleString()}</td>
                      <td className={`text-right py-2 px-4 ${acc.amount - acc.budget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(acc.amount - acc.budget).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* All Entries */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>
                All Entries ({filteredEntries.length} {entriesFilter === 'all' ? 'total' : entriesFilter})
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={entriesFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEntriesFilter('all')}
                  data-testid="button-filter-all"
                >
                  All
                </Button>
                <Button
                  variant={entriesFilter === 'revenue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEntriesFilter('revenue')}
                  data-testid="button-filter-revenue"
                >
                  Revenue
                </Button>
                <Button
                  variant={entriesFilter === 'expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEntriesFilter('expense')}
                  data-testid="button-filter-expense"
                >
                  Expense
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Category</th>
                    <th className="text-left py-2 px-4">Account</th>
                    <th className="text-right py-2 px-4">Amount</th>
                    <th className="text-right py-2 px-4">Budget</th>
                    <th className="text-center py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, idx) => (
                    <tr key={idx} className="border-b hover-elevate" data-testid={`row-entry-${idx}`}>
                      <td className="py-2 px-4">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${entry.type === 'revenue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-2 px-4">{entry.category}</td>
                      <td className="py-2 px-4">{entry.account}</td>
                      <td className="text-right py-2 px-4">${entry.amount.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">${entry.budget.toLocaleString()}</td>
                      <td className="text-center py-2 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(idx)}
                          data-testid={`button-delete-entry-${idx}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
