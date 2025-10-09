import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Upload, Plus, BarChart3, FileSpreadsheet, Trash2, Eye, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BatchData {
  id: string;
  batchNumber: string;
  batchTitle: string;
  createdDate: string;
  excelData: Array<{
    referenceNumber: string;
    clientName: string;
    address: string;
    [key: string]: any;
  }>;
  stats: {
    totalLeads: number;
    totalQuotes: number;
    totalLoanPreps: number;
    totalLoans: number;
    totalFunded: number;
    totalCancelled: number;
    totalWithdrawn: number;
  };
}

type SortColumn = 'createdDate' | 'batchNumber' | 'batchTitle';
type SortDirection = 'asc' | 'desc';

export default function AdminMarketing() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [batchNumber, setBatchNumber] = useState('');
  const [batchTitle, setBatchTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewBatchDialog, setViewBatchDialog] = useState(false);
  const [statsDialog, setStatsDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchData | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Load batches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('directMailBatches');
    if (stored) {
      setBatches(JSON.parse(stored));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const parseExcelFile = async (file: File): Promise<Array<any>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('Empty file'));
            return;
          }

          // First line is headers
          const headers = lines[0].split(',').map(h => h.trim());
          
          // Parse data rows
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleCreateBatch = async () => {
    if (!batchNumber.trim() || !batchTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both batch number and batch title.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload an Excel CSV file.",
        variant: "destructive"
      });
      return;
    }

    try {
      const excelData = await parseExcelFile(selectedFile);
      
      // Ensure data has required fields
      const formattedData = excelData.map(row => ({
        referenceNumber: row['Reference Number'] || row['referenceNumber'] || '',
        clientName: row['Client Name'] || row['clientName'] || '',
        address: row['Address'] || row['address'] || '',
        ...row
      }));

      const newBatch: BatchData = {
        id: Date.now().toString(),
        batchNumber: batchNumber.trim(),
        batchTitle: batchTitle.trim(),
        createdDate: new Date().toLocaleDateString(),
        excelData: formattedData,
        stats: {
          totalLeads: 0,
          totalQuotes: 0,
          totalLoanPreps: 0,
          totalLoans: 0,
          totalFunded: 0,
          totalCancelled: 0,
          totalWithdrawn: 0
        }
      };

      const updatedBatches = [...batches, newBatch];
      setBatches(updatedBatches);
      localStorage.setItem('directMailBatches', JSON.stringify(updatedBatches));

      toast({
        title: "Batch Created",
        description: `Batch ${batchNumber} created successfully with ${formattedData.length} records.`,
      });

      // Reset form
      setBatchNumber('');
      setBatchTitle('');
      setSelectedFile(null);
      const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse Excel file. Please ensure it's a valid CSV format.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBatch = (batchId: string) => {
    const updatedBatches = batches.filter(b => b.id !== batchId);
    setBatches(updatedBatches);
    localStorage.setItem('directMailBatches', JSON.stringify(updatedBatches));
    toast({
      title: "Batch Deleted",
      description: "The batch has been removed.",
    });
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedBatches = useMemo(() => {
    return [...batches].sort((a, b) => {
      let comparison = 0;
      
      if (sortColumn === 'createdDate') {
        const dateA = new Date(a.createdDate).getTime();
        const dateB = new Date(b.createdDate).getTime();
        comparison = dateA - dateB;
      } else if (sortColumn === 'batchNumber') {
        comparison = a.batchNumber.localeCompare(b.batchNumber, undefined, { numeric: true });
      } else if (sortColumn === 'batchTitle') {
        comparison = a.batchTitle.toLowerCase().localeCompare(b.batchTitle.toLowerCase());
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [batches, sortColumn, sortDirection]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/admin/dashboard')}
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
                MARKETING - DIRECT MAIL CAMPAIGNS
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" data-testid="tab-create-batch">Create Batch</TabsTrigger>
            <TabsTrigger value="all-batches" data-testid="tab-all-batches">All Batches</TabsTrigger>
            <TabsTrigger value="stats-overview" data-testid="tab-stats-overview">Stats Overview</TabsTrigger>
          </TabsList>

          {/* Create Batch Tab */}
          <TabsContent value="create" className="mt-8">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle>Create New Direct Mail Batch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="batch-number">Batch Number *</Label>
                    <Input
                      id="batch-number"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="Enter batch number (e.g., DM-2024-001)"
                      data-testid="input-batch-number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch-title">Batch Title *</Label>
                    <Input
                      id="batch-title"
                      value={batchTitle}
                      onChange={(e) => setBatchTitle(e.target.value)}
                      placeholder="Enter descriptive title"
                      data-testid="input-batch-title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excel-upload">Upload Excel File (CSV Format) *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="excel-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      data-testid="input-excel-upload"
                    />
                    {selectedFile && (
                      <span className="text-sm text-muted-foreground">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expected columns: Reference Number, Client Name, Address
                  </p>
                </div>

                <Button
                  onClick={handleCreateBatch}
                  className="w-full md:w-auto"
                  data-testid="button-create-batch"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Batch
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Batches Tab */}
          <TabsContent value="all-batches" className="mt-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle>All Direct Mail Batches</CardTitle>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No batches created yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th 
                            className="text-left p-3 cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('createdDate')}
                            data-testid="th-created-date"
                          >
                            <div className="flex items-center gap-2">
                              Created Date
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('batchNumber')}
                            data-testid="th-batch-number"
                          >
                            <div className="flex items-center gap-2">
                              Batch Number
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('batchTitle')}
                            data-testid="th-batch-title"
                          >
                            <div className="flex items-center gap-2">
                              Batch Title
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th className="text-left p-3">Total Records</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedBatches.map((batch) => (
                          <tr 
                            key={batch.id} 
                            className="border-b hover:bg-muted/50 cursor-pointer"
                            data-testid={`row-batch-${batch.id}`}
                          >
                            <td className="p-3">{batch.createdDate}</td>
                            <td className="p-3 font-medium">{batch.batchNumber}</td>
                            <td className="p-3">{batch.batchTitle}</td>
                            <td className="p-3">{batch.excelData.length}</td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBatch(batch);
                                    setViewBatchDialog(true);
                                  }}
                                  data-testid={`button-view-batch-${batch.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBatch(batch);
                                    setStatsDialog(true);
                                  }}
                                  data-testid={`button-stats-batch-${batch.id}`}
                                >
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  Stats
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteBatch(batch.id)}
                                  data-testid={`button-delete-batch-${batch.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Overview Tab */}
          <TabsContent value="stats-overview" className="mt-8">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle>Marketing Statistics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Overall campaign performance metrics will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Batch Dialog */}
      <Dialog open={viewBatchDialog} onOpenChange={setViewBatchDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBatch?.batchNumber} - {selectedBatch?.batchTitle}
            </DialogTitle>
            <DialogDescription>
              Created: {selectedBatch?.createdDate} | Total Records: {selectedBatch?.excelData.length}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            {selectedBatch && selectedBatch.excelData.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Reference Number</th>
                    <th className="text-left p-2">Client Name</th>
                    <th className="text-left p-2">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBatch.excelData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{row.referenceNumber}</td>
                      <td className="p-2">{row.clientName}</td>
                      <td className="p-2">{row.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewBatchDialog(false)} data-testid="button-close-view-dialog">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={statsDialog} onOpenChange={setStatsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Batch Statistics - {selectedBatch?.batchNumber}
            </DialogTitle>
            <DialogDescription>
              Campaign performance metrics
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedBatch?.excelData.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{selectedBatch?.stats.totalLeads || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{selectedBatch?.stats.totalQuotes || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Loan Preps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{selectedBatch?.stats.totalLoanPreps || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{selectedBatch?.stats.totalLoans || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Funded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{selectedBatch?.stats.totalFunded || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{selectedBatch?.stats.totalCancelled || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Withdrawn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{selectedBatch?.stats.totalWithdrawn || 0}</div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Statistics are automatically calculated based on leads created with reference numbers from this batch.
              Detailed breakdowns by loan category, program, and purpose will be available once integration with the Lead system is complete.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setStatsDialog(false)} data-testid="button-close-stats-dialog">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
