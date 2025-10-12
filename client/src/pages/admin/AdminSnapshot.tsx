import { useState, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Upload as UploadIcon, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface RevenueEntry {
  channel: string;
  amount: number;
  date: string;
}

interface ExpenseEntry {
  category: string;
  amount: number;
  date: string;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
}

const revenueChannels = ["Product Sales", "Consulting", "Affiliate", "Services", "Licensing"];
const expenseCategories = ["Marketing", "Tech", "Payroll", "Operations", "Software"];

export default function AdminSnapshot() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [revenue, setRevenue] = useState<RevenueEntry[]>([
    { channel: "Product Sales", amount: 15000, date: "2025-01-15" },
    { channel: "Consulting", amount: 8500, date: "2025-02-20" },
    { channel: "Affiliate", amount: 3200, date: "2025-03-10" },
  ]);
  
  const [expense, setExpense] = useState<ExpenseEntry[]>([
    { category: "Marketing", amount: 4500, date: "2025-01-20" },
    { category: "Tech", amount: 6200, date: "2025-02-15" },
    { category: "Payroll", amount: 12000, date: "2025-03-01" },
  ]);
  
  const [fileList, setFileList] = useState<UploadedFile[]>([]);
  const [filters, setFilters] = useState({
    period: 'YTD' as 'YTD' | 'MTD' | 'Year',
    year: '2025',
  });
  
  const [revenueForm, setRevenueForm] = useState({
    channel: revenueChannels[0],
    amount: '',
  });
  
  const [expenseForm, setExpenseForm] = useState({
    category: expenseCategories[0],
    amount: '',
  });

  const filteredRevenue = useMemo(() => {
    const currentDate = new Date();
    const filterYear = parseInt(filters.year);
    
    return revenue.filter(r => {
      const entryDate = new Date(r.date);
      const entryYear = entryDate.getFullYear();
      
      if (filters.period === 'YTD') {
        // Year to Date: entries from the selected year up to current date
        return entryYear === filterYear && entryDate <= currentDate;
      } else if (filters.period === 'MTD') {
        // Month to Date: entries from the selected year and current month
        return entryYear === filterYear && 
               entryDate.getMonth() === currentDate.getMonth() &&
               entryDate <= currentDate;
      } else if (filters.period === 'Year') {
        // Full Year: all entries from the selected year
        return entryYear === filterYear;
      }
      return true;
    });
  }, [revenue, filters]);

  const filteredExpense = useMemo(() => {
    const currentDate = new Date();
    const filterYear = parseInt(filters.year);
    
    return expense.filter(e => {
      const entryDate = new Date(e.date);
      const entryYear = entryDate.getFullYear();
      
      if (filters.period === 'YTD') {
        // Year to Date: entries from the selected year up to current date
        return entryYear === filterYear && entryDate <= currentDate;
      } else if (filters.period === 'MTD') {
        // Month to Date: entries from the selected year and current month
        return entryYear === filterYear && 
               entryDate.getMonth() === currentDate.getMonth() &&
               entryDate <= currentDate;
      } else if (filters.period === 'Year') {
        // Full Year: all entries from the selected year
        return entryYear === filterYear;
      }
      return true;
    });
  }, [expense, filters]);

  const totalRevenue = useMemo(() => {
    return filteredRevenue.reduce((sum, r) => sum + r.amount, 0);
  }, [filteredRevenue]);

  const totalExpense = useMemo(() => {
    return filteredExpense.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpense]);

  const handleAddRevenue = () => {
    const amount = parseFloat(revenueForm.amount);
    
    if (!revenueForm.channel) {
      toast({
        title: "Validation Error",
        description: "Please select a revenue channel",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be a valid positive number",
        variant: "destructive",
      });
      return;
    }
    
    const newRevenue: RevenueEntry = {
      channel: revenueForm.channel,
      amount,
      date: new Date().toISOString().split('T')[0],
    };
    
    setRevenue([...revenue, newRevenue]);
    setRevenueForm({ channel: revenueChannels[0], amount: '' });
    
    toast({
      title: "Revenue Added",
      description: `${newRevenue.channel} revenue of $${amount.toLocaleString()} added successfully`,
    });
  };

  const handleAddExpense = () => {
    const amount = parseFloat(expenseForm.amount);
    
    if (!expenseForm.category) {
      toast({
        title: "Validation Error",
        description: "Please select an expense category",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be a valid positive number",
        variant: "destructive",
      });
      return;
    }
    
    const newExpense: ExpenseEntry = {
      category: expenseForm.category,
      amount,
      date: new Date().toISOString().split('T')[0],
    };
    
    setExpense([...expense, newExpense]);
    setExpenseForm({ category: expenseCategories[0], amount: '' });
    
    toast({
      title: "Expense Added",
      description: `${newExpense.category} expense of $${amount.toLocaleString()} added successfully`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toISOString().split('T')[0],
    }));

    setFileList([...fileList, ...newFiles]);
    
    toast({
      title: "Files Uploaded",
      description: `${newFiles.length} file(s) uploaded successfully`,
    });
    
    // Reset input
    event.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    setFileList(fileList.filter(f => f.id !== fileId));
    toast({
      title: "File Removed",
      description: "File removed successfully",
    });
  };

  const filteredFiles = useMemo(() => {
    const currentDate = new Date();
    const filterYear = parseInt(filters.year);
    
    return fileList.filter(f => {
      const fileDate = new Date(f.uploadDate);
      const fileYear = fileDate.getFullYear();
      
      if (filters.period === 'YTD') {
        // Year to Date: files from the selected year up to current date
        return fileYear === filterYear && fileDate <= currentDate;
      } else if (filters.period === 'MTD') {
        // Month to Date: files from the selected year and current month
        return fileYear === filterYear && 
               fileDate.getMonth() === currentDate.getMonth() &&
               fileDate <= currentDate;
      } else if (filters.period === 'Year') {
        // Full Year: all files from the selected year
        return fileYear === filterYear;
      }
      return true;
    });
  }, [fileList, filters]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/dashboard')}
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold" data-testid="text-snapshot-title">Business Snapshot</h1>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <Label>Period</Label>
                <Select 
                  value={filters.period} 
                  onValueChange={(value: 'YTD' | 'MTD' | 'Year') => setFilters({ ...filters, period: value })}
                >
                  <SelectTrigger data-testid="select-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YTD">Year to Date</SelectItem>
                    <SelectItem value="MTD">Month to Date</SelectItem>
                    <SelectItem value="Year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 flex-1">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  data-testid="input-year"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card data-testid="card-total-revenue">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Revenue ({filters.period})</p>
                <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-expense">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Expense ({filters.period})</p>
                <p className="text-3xl font-bold text-red-600">${totalExpense.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-net-income">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Net Income ({filters.period})</p>
                <p className={`text-3xl font-bold ${totalRevenue - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(totalRevenue - totalExpense).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Entry Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select
                    value={revenueForm.channel}
                    onValueChange={(value) => setRevenueForm({ ...revenueForm, channel: value })}
                  >
                    <SelectTrigger data-testid="select-revenue-channel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueChannels.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue-amount">Amount</Label>
                  <Input
                    id="revenue-amount"
                    type="number"
                    step="0.01"
                    value={revenueForm.amount}
                    onChange={(e) => setRevenueForm({ ...revenueForm, amount: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-revenue-amount"
                  />
                </div>

                <Button 
                  onClick={handleAddRevenue} 
                  className="w-full"
                  data-testid="button-add-revenue"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Revenue
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={expenseForm.category}
                    onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
                  >
                    <SelectTrigger data-testid="select-expense-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="0.00"
                    data-testid="input-expense-amount"
                  />
                </div>

                <Button 
                  onClick={handleAddExpense} 
                  className="w-full"
                  data-testid="button-add-expense"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Invoice/Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-file"
                >
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <p className="text-sm text-muted-foreground">
                  Files this {filters.period}: {filteredFiles.length}
                </p>
              </div>

              {filteredFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Uploaded Files:</h4>
                  <div className="space-y-2">
                    {filteredFiles.map(file => (
                      <div 
                        key={file.id} 
                        className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                        data-testid={`file-item-${file.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB • {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.id)}
                          data-testid={`button-remove-file-${file.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue/Expense History */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue/Expense History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue Table */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">Revenue</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Channel</th>
                        <th className="text-right py-2 px-2">Amount</th>
                        <th className="text-right py-2 px-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRevenue.map((r, idx) => (
                        <tr key={idx} className="border-b hover-elevate" data-testid={`row-revenue-${idx}`}>
                          <td className="py-2 px-2">{r.channel}</td>
                          <td className="text-right py-2 px-2 text-green-600 font-semibold">
                            ${r.amount.toLocaleString()}
                          </td>
                          <td className="text-right py-2 px-2 text-sm text-muted-foreground">
                            {new Date(r.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {filteredRevenue.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-muted-foreground">
                            No revenue entries for this period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expense Table */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">Expenses</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Category</th>
                        <th className="text-right py-2 px-2">Amount</th>
                        <th className="text-right py-2 px-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpense.map((e, idx) => (
                        <tr key={idx} className="border-b hover-elevate" data-testid={`row-expense-${idx}`}>
                          <td className="py-2 px-2">{e.category}</td>
                          <td className="text-right py-2 px-2 text-red-600 font-semibold">
                            ${e.amount.toLocaleString()}
                          </td>
                          <td className="text-right py-2 px-2 text-sm text-muted-foreground">
                            {new Date(e.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {filteredExpense.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-muted-foreground">
                            No expense entries for this period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
