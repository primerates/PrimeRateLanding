import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { RotateCcw, Monitor, Save, Upload, Plus, BarChart3, FileText, Trash2, Eye, ArrowUpDown, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

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
type UploadStage = 'upload' | 'mapping' | 'preview' | 'success';

interface ColumnMapping {
  reference: string;
  firstName: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
}

interface RequiredField {
  key: keyof ColumnMapping;
  label: string;
  description: string;
}

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
  
  // Batch detail table sorting
  const [batchDetailSortColumn, setBatchDetailSortColumn] = useState<string>('');
  const [batchDetailSortDirection, setBatchDetailSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Column Mapping States
  const [uploadStage, setUploadStage] = useState<UploadStage>('upload');
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    reference: '',
    firstName: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: ''
  });
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  
  // Animation states for buttons
  const [showRevertAnimation, setShowRevertAnimation] = useState(false);
  const [screenshareLoading, setScreenshareLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const requiredFields: RequiredField[] = [
    { key: 'reference', label: 'Reference Number', description: 'Unique identifier for tracking' },
    { key: 'firstName', label: 'Client Name', description: 'First name or full name' },
    { key: 'streetAddress', label: 'Street Address', description: 'Mailing address' },
    { key: 'city', label: 'City', description: 'City name' },
    { key: 'state', label: 'State', description: 'State abbreviation' },
    { key: 'zip', label: 'Zip Code', description: 'Postal code' }
  ];

  // Load batches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('directMailBatches');
    if (stored) {
      setBatches(JSON.parse(stored));
    }
  }, []);

  const autoMapColumns = (columns: string[]) => {
    const mapping: Partial<ColumnMapping> = {};
    
    const matchPatterns: Record<keyof ColumnMapping, string[]> = {
      reference: ['reference', 'ref', 'ref#', 'reference number', 'refnum'],
      firstName: ['first name', 'firstname', 'name', 'client name', 'clientname', 'last name', 'lastname'],
      streetAddress: ['street address', 'streetaddress', 'address', 'street'],
      city: ['city'],
      state: ['state'],
      zip: ['zip', 'zipcode', 'zip code', 'postal']
    };

    Object.entries(matchPatterns).forEach(([field, patterns]) => {
      const match = columns.find(col => {
        const normalized = col.toLowerCase().trim();
        return patterns.some(pattern => normalized.includes(pattern));
      });
      mapping[field as keyof ColumnMapping] = match || '';
    });

    setColumnMapping(mapping as ColumnMapping);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setError('Error parsing CSV file. Please check the file format.');
          return;
        }

        if (results.data.length === 0) {
          setError('CSV file is empty.');
          return;
        }

        // Get column headers - filter out empty column names
        const allColumns = Object.keys(results.data[0] as any);
        const columns = allColumns.filter(col => col && col.trim() !== '');
        
        setDetectedColumns(columns);
        setCsvData(results.data);
        setPreviewData(results.data.slice(0, 5));

        // Auto-detect columns with fuzzy matching
        autoMapColumns(columns);
        
        setUploadStage('mapping');
      },
      error: (error) => {
        setError(`Failed to read file: ${error.message}`);
      }
    });
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateMapping = () => {
    const missing = requiredFields.filter(field => !columnMapping[field.key]);
    if (missing.length > 0) {
      setError(`Please map the following required fields: ${missing.map(f => f.label).join(', ')}`);
      return false;
    }
    setError('');
    return true;
  };

  const handleConfirmMapping = () => {
    if (validateMapping()) {
      setUploadStage('preview');
    }
  };

  const handleCreateBatch = () => {
    if (!batchNumber.trim()) {
      setError('Please enter a batch number');
      return;
    }
    if (!batchTitle.trim()) {
      setError('Please enter a batch title');
      return;
    }
    if (!csvData) {
      setError('No data to import');
      return;
    }

    // Map the CSV data to our format
    const mappedData = csvData.map((row: any) => {
      // Get address components
      const streetAddress = row[columnMapping.streetAddress] || '';
      const city = row[columnMapping.city] || '';
      const state = row[columnMapping.state] || '';
      const zip = row[columnMapping.zip] || '';
      
      // Combine address
      const addressParts = [streetAddress, city, state, zip].filter(Boolean);
      const fullAddress = addressParts.join(', ');

      // Get client name (handle both first/last name separately or combined)
      let clientName = row[columnMapping.firstName] || '';
      
      // Check if there's a Last Name column that wasn't mapped
      const lastNameCol = detectedColumns.find(col => 
        col.toLowerCase().includes('last') && col !== columnMapping.firstName
      );
      if (lastNameCol && row[lastNameCol]) {
        clientName = row[lastNameCol] + ', ' + clientName;
      }

      return {
        referenceNumber: row[columnMapping.reference] || '',
        clientName: clientName,
        address: fullAddress,
        ...row // Preserve all original columns
      };
    });

    const newBatch: BatchData = {
      id: Date.now().toString(),
      batchNumber: batchNumber,
      batchTitle: batchTitle,
      createdDate: new Date().toISOString(),
      excelData: mappedData,
      stats: {
        totalLeads: mappedData.length,
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

    setUploadStage('success');
    
    toast({
      title: "Batch Created Successfully",
      description: `${batchNumber} - ${batchTitle} with ${mappedData.length} records`,
    });

    // Reset after 3 seconds
    setTimeout(() => {
      resetForm();
    }, 3000);
  };

  const resetForm = () => {
    setBatchNumber('');
    setBatchTitle('');
    setCsvData(null);
    setDetectedColumns([]);
    setPreviewData([]);
    setColumnMapping({
      reference: '',
      firstName: '',
      streetAddress: '',
      city: '',
      state: '',
      zip: ''
    });
    setUploadStage('upload');
    setError('');
    setSelectedFile(null);
  };

  const handleCancel = () => {
    resetForm();
  };
  
  const handleBackToDashboard = () => {
    setShowRevertAnimation(true);
    setTimeout(() => {
      setLocation('/admin');
      setShowRevertAnimation(false);
    }, 300);
  };

  const handleScreenshare = () => {
    setScreenshareLoading(true);
    setTimeout(() => {
      setScreenshareLoading(false);
      toast({
        title: "Screenshare Started",
        description: "Screen sharing feature activated",
      });
    }, 1000);
  };

  const handleSave = () => {
    setSaveLoading(true);
    setTimeout(() => {
      setSaveLoading(false);
      toast({
        title: "Saved Successfully",
        description: "All changes have been saved",
      });
    }, 1000);
  };

  const handleDeleteBatch = (id: string) => {
    const updatedBatches = batches.filter(b => b.id !== id);
    setBatches(updatedBatches);
    localStorage.setItem('directMailBatches', JSON.stringify(updatedBatches));
    toast({
      title: "Batch Deleted",
      description: "The batch has been removed successfully.",
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

  const handleBatchDetailSort = (column: string) => {
    if (batchDetailSortColumn === column) {
      setBatchDetailSortDirection(batchDetailSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setBatchDetailSortColumn(column);
      setBatchDetailSortDirection('asc');
    }
  };

  const sortedBatches = useMemo(() => {
    return [...batches].sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      if (sortColumn === 'createdDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [batches, sortColumn, sortDirection]);

  const sortedBatchDetails = useMemo(() => {
    if (!selectedBatch || !batchDetailSortColumn) return selectedBatch?.excelData || [];
    
    return [...(selectedBatch.excelData || [])].sort((a, b) => {
      let aVal: any = a[batchDetailSortColumn] || '';
      let bVal: any = b[batchDetailSortColumn] || '';
      
      // Convert to lowercase for string comparison
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal === bVal) return 0;
      
      if (batchDetailSortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [selectedBatch, batchDetailSortColumn, batchDetailSortDirection]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background">
        {/* Header - Matching Comments & Posts Design */}
        <header className="bg-primary text-primary-foreground shadow-lg border-b transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
                  Marketing - Direct Mail
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToDashboard}
                      className="text-primary-foreground hover:text-white hover:bg-green-600 p-2 transition-colors duration-200"
                      data-testid="button-back-to-dashboard"
                    >
                      <RotateCcw className={`h-6 w-6 ${showRevertAnimation ? 'animate-rotate-360' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={10} className="text-sm">
                    <p>Back to Dashboard</p>
                  </TooltipContent>
                </Tooltip>
                <Button
                  onClick={handleScreenshare}
                  disabled={screenshareLoading}
                  size="sm"
                  className="bg-primary-foreground text-primary hover:bg-green-600 hover:text-white"
                  data-testid="button-screenshare"
                >
                  <Monitor className={`h-3 w-3 mr-2 transition-transform duration-500 ${screenshareLoading ? 'animate-spin' : ''}`} />
                  {screenshareLoading ? 'Starting...' : 'Screenshare'}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveLoading}
                  size="sm"
                  className="bg-white text-primary border hover:bg-green-600 hover:text-white transition-all duration-500"
                  data-testid="button-save"
                >
                  <Save className={`h-3 w-3 mr-2 transition-transform duration-500 ${saveLoading ? 'rotate-180' : ''}`} />
                  {saveLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs - Matching Comments & Posts Design */}
        <div className="container mx-auto px-6 mt-6">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0 relative border-b border-gray-200 group">
              <TabsTrigger value="create" data-testid="tab-create-batch" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Create Batch</TabsTrigger>
              <TabsTrigger value="all-batches" data-testid="tab-all-batches" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">All Batches</TabsTrigger>
              <TabsTrigger value="stats" data-testid="tab-stats-overview" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Stats Overview</TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Notes</TabsTrigger>
            </TabsList>

          {/* CREATE BATCH TAB */}
          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Direct Mail Batch</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Stage: Upload */}
                {uploadStage === 'upload' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="batch-number">
                          Batch Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="batch-number"
                          value={batchNumber}
                          onChange={(e) => setBatchNumber(e.target.value)}
                          placeholder="e.g., DM-2024-001"
                          data-testid="input-batch-number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batch-title">
                          Batch Title <span className="text-destructive">*</span>
                        </Label>
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
                      <Label htmlFor="csv-upload">
                        Upload Excel File (CSV Format) <span className="text-destructive">*</span>
                      </Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="csv-upload"
                          data-testid="input-csv-file"
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-foreground mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-muted-foreground">CSV files only</p>
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Any CSV format accepted - you'll map columns in the next step
                      </p>
                    </div>
                  </div>
                )}

                {/* Stage: Column Mapping */}
                {uploadStage === 'mapping' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-start">
                        <FileText className="w-5 h-5 text-primary mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium">
                            {detectedColumns.length} columns detected • {csvData?.length} records
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Map your CSV columns to required fields. We've auto-detected some matches.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {requiredFields.map(field => (
                        <Card key={field.key}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Label className="text-sm font-medium">
                                  {field.label} <span className="text-destructive">*</span>
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
                              </div>
                              {columnMapping[field.key] && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                            <Select
                              value={columnMapping[field.key]}
                              onValueChange={(value) => handleMappingChange(field.key, value)}
                            >
                              <SelectTrigger data-testid={`select-${field.key}`}>
                                <SelectValue placeholder="-- Select Column --" />
                              </SelectTrigger>
                              <SelectContent>
                                {detectedColumns.map(col => (
                                  <SelectItem key={col} value={col}>{col}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Additional Columns</h4>
                        <p className="text-xs text-muted-foreground">
                          All other columns will be preserved: {detectedColumns.filter(col => !Object.values(columnMapping).includes(col)).join(', ') || 'None'}
                        </p>
                      </CardContent>
                    </Card>

                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={handleConfirmMapping} data-testid="button-continue-preview">
                        Continue to Preview
                      </Button>
                      <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-mapping">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stage: Preview */}
                {uploadStage === 'preview' && csvData && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Preview Mapped Data</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                          data-testid="button-toggle-preview"
                        >
                          {showPreview ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                          {showPreview ? 'Hide' : 'Show'} Preview
                        </Button>
                      </div>

                      {showPreview && (
                        <div className="overflow-x-auto border rounded-lg">
                          <table className="min-w-full divide-y">
                            <thead className="bg-muted">
                              <tr>
                                {requiredFields.map(field => (
                                  <th key={field.key} className="px-4 py-3 text-left text-xs font-medium uppercase">
                                    {field.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {previewData.map((row, idx) => (
                                <tr key={idx}>
                                  {requiredFields.map(field => (
                                    <td key={field.key} className="px-4 py-3 text-sm">
                                      {row[columnMapping[field.key]] || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mt-3">
                        Showing first 5 of {csvData.length} records
                      </p>
                    </div>

                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-green-700 dark:text-green-400">Ready to Create Batch</h4>
                          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                            Batch: {batchNumber} - {batchTitle} • {csvData.length} records mapped successfully
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={handleCreateBatch} data-testid="button-create-batch">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Batch
                      </Button>
                      <Button variant="outline" onClick={() => setUploadStage('mapping')} data-testid="button-back-mapping">
                        Back to Mapping
                      </Button>
                      <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-preview">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Stage: Success */}
                {uploadStage === 'success' && csvData && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Batch Created Successfully!</h3>
                    <p className="text-muted-foreground mb-1">{batchNumber} - {batchTitle}</p>
                    <p className="text-sm text-muted-foreground">{csvData.length} records imported</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALL BATCHES TAB */}
          <TabsContent value="all-batches" className="mt-6">
            {/* First Card - Batch List */}
            <Card>
              <CardHeader>
                <CardTitle>All Direct Mail Batches</CardTitle>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No batches created yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => handleSort('createdDate')}
                            data-testid="sort-date"
                          >
                            <div className="flex items-center gap-2">
                              Date Created
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => handleSort('batchNumber')}
                            data-testid="sort-batch-number"
                          >
                            <div className="flex items-center gap-2">
                              Batch Number
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => handleSort('batchTitle')}
                            data-testid="sort-batch-title"
                          >
                            <div className="flex items-center gap-2">
                              Batch Title
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800">Total Leads</th>
                          <th className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedBatches.map((batch) => (
                          <tr key={batch.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="p-3">{new Date(batch.createdDate).toLocaleDateString()}</td>
                            <td className="p-3">
                              <button
                                onClick={() => setSelectedBatch(batch)}
                                className="text-primary hover:underline cursor-pointer font-medium"
                                data-testid={`button-view-${batch.id}`}
                              >
                                {batch.batchNumber}
                              </button>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => setSelectedBatch(batch)}
                                className="text-primary hover:underline cursor-pointer font-medium"
                                data-testid={`button-view-title-${batch.id}`}
                              >
                                {batch.batchTitle}
                              </button>
                            </td>
                            <td className="p-3">{batch.stats.totalLeads}</td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBatch(batch.id)}
                                data-testid={`button-delete-${batch.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Second Card - Batch Details (shows when batch is selected) */}
            {selectedBatch && selectedBatch.excelData.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>
                    Batch Details: {selectedBatch.batchNumber} - {selectedBatch.batchTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <ArrowUpDown className="h-4 w-4" />
                      <span>
                        Drag the scrollbar below the table or click and drag on the table to scroll horizontally and see all {Object.keys(selectedBatch.excelData[0]).length} columns
                      </span>
                    </div>
                    <div className="overflow-x-scroll w-full border-2 border-blue-400 rounded-lg" style={{ scrollbarWidth: 'auto' }}>
                      <table className="w-max border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-gray-300">
                            {Object.keys(selectedBatch.excelData[0]).map((column) => (
                              <th 
                                key={column}
                                className="text-left p-3 font-semibold bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                                onClick={() => handleBatchDetailSort(column)}
                                data-testid={`sort-${column}`}
                              >
                                <div className="flex items-center gap-2">
                                  {column}
                                  <ArrowUpDown className="h-4 w-4" />
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedBatchDetails.map((row, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              {Object.keys(selectedBatch.excelData[0]).map((column) => (
                                <td key={column} className="p-3 whitespace-nowrap">
                                  {row[column] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Showing {selectedBatch.excelData.length} records with {Object.keys(selectedBatch.excelData[0]).length} columns
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* STATS OVERVIEW TAB */}
          <TabsContent value="stats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{batches.length}</div>
                      <p className="text-sm text-muted-foreground">Total Batches</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {batches.reduce((sum, b) => sum + b.stats.totalLeads, 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Leads</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {batches.reduce((sum, b) => sum + b.stats.totalFunded, 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Funded</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Notes feature coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
