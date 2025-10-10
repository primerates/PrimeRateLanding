import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { RotateCcw, Monitor, Save, Upload, Plus, BarChart3, FileText, Trash2, Eye, EyeOff, ArrowUpDown, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface BatchData {
  id: string;
  batchNumber: string;
  batchTitle: string;
  category: string;
  dataType: string;
  delivery: string;
  mailDate: string; // This is "First Call" field
  dataDate: string;
  printDate: string;
  newMailDate: string;
  durationToFirstCall: string;
  dataSource: string;
  mailVendor: string;
  printVendor: string;
  supplyVendor: string;
  dataCost: string;
  mailCost: string;
  printCost: string;
  supplyCost: string;
  tenYearBond: string;
  parRate: string;
  states: string[]; // Array of state abbreviations
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

// US States list
const US_STATES = [
  { abbr: 'AL', name: 'Alabama' },
  { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' },
  { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' },
  { abbr: 'DE', name: 'Delaware' },
  { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' },
  { abbr: 'HI', name: 'Hawaii' },
  { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' },
  { abbr: 'IN', name: 'Indiana' },
  { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' },
  { abbr: 'KY', name: 'Kentucky' },
  { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' },
  { abbr: 'MD', name: 'Maryland' },
  { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' },
  { abbr: 'MN', name: 'Minnesota' },
  { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' },
  { abbr: 'MT', name: 'Montana' },
  { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' },
  { abbr: 'NH', name: 'New Hampshire' },
  { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' },
  { abbr: 'NY', name: 'New York' },
  { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' },
  { abbr: 'OH', name: 'Ohio' },
  { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' },
  { abbr: 'PA', name: 'Pennsylvania' },
  { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' },
  { abbr: 'SD', name: 'South Dakota' },
  { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' },
  { abbr: 'UT', name: 'Utah' },
  { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' },
  { abbr: 'WA', name: 'Washington' },
  { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' },
  { abbr: 'WY', name: 'Wyoming' }
];

// CurrencyInput component for dollar values - matches Income tab style
const CurrencyInput = ({ value, onChange, placeholder = '$0', id, dataTestId }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  dataTestId?: string;
}) => {
  // Display value with $ and comma formatting
  const displayValue = useMemo(() => {
    if (!value) return '';
    const numVal = value.replace(/[^\d]/g, '');
    return numVal ? `$${numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, '');
    onChange(val);
  };

  return (
    <Input
      id={id}
      type="text"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      data-testid={dataTestId}
    />
  );
};

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
  
  // Edit batch title state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Batch details visibility state
  const [isBatchDetailsExpanded, setIsBatchDetailsExpanded] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  
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
  
  // New batch fields
  const [tenYearBond, setTenYearBond] = useState('');
  const [parRate, setParRate] = useState('');
  const [category, setCategory] = useState('');
  const [dataType, setDataType] = useState('');
  const [delivery, setDelivery] = useState('');
  const [mailDate, setMailDate] = useState(''); // This is "First Call"
  const [dataDate, setDataDate] = useState('');
  const [printDate, setPrintDate] = useState('');
  const [newMailDate, setNewMailDate] = useState('');
  const [durationToFirstCall, setDurationToFirstCall] = useState('');
  const [mailVendor, setMailVendor] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [printVendor, setPrintVendor] = useState('');
  const [supplyVendor, setSupplyVendor] = useState('');
  const [dataCost, setDataCost] = useState('');
  const [mailCost, setMailCost] = useState('');
  const [printCost, setPrintCost] = useState('');
  const [supplyCost, setSupplyCost] = useState('');
  
  // States selection
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [statesDialogOpen, setStatesDialogOpen] = useState(false);
  const [batchStatesDialogOpen, setBatchStatesDialogOpen] = useState(false);

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

      // Create a copy of row without the mapped columns to avoid duplicates
      const { [columnMapping.reference]: _, [columnMapping.firstName]: __, ...otherColumns } = row;
      
      return {
        referenceNumber: row[columnMapping.reference] || '',
        clientName: clientName,
        address: fullAddress,
        ...otherColumns // Preserve all other original columns (excluding mapped ones)
      };
    });

    const newBatch: BatchData = {
      id: Date.now().toString(),
      batchNumber: batchNumber,
      batchTitle: batchTitle,
      category: category,
      dataType: dataType,
      delivery: delivery,
      mailDate: mailDate,
      dataDate: dataDate,
      printDate: printDate,
      newMailDate: newMailDate,
      durationToFirstCall: durationToFirstCall,
      dataSource: dataSource,
      mailVendor: mailVendor,
      printVendor: printVendor,
      supplyVendor: supplyVendor,
      dataCost: dataCost,
      mailCost: mailCost,
      printCost: printCost,
      supplyCost: supplyCost,
      tenYearBond: tenYearBond,
      parRate: parRate,
      states: selectedStates,
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
    setCategory('');
    setDataType('');
    setDelivery('');
    setMailDate('');
    setDataDate('');
    setPrintDate('');
    setNewMailDate('');
    setDurationToFirstCall('');
    setDataSource('');
    setMailVendor('');
    setPrintVendor('');
    setSupplyVendor('');
    setDataCost('');
    setMailCost('');
    setPrintCost('');
    setSupplyCost('');
    setTenYearBond('');
    setParRate('');
    setSelectedStates([]);
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
    setBatchToDelete(id);
    setDeleteConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (!batchToDelete) return;
    
    const updatedBatches = batches.filter(b => b.id !== batchToDelete);
    setBatches(updatedBatches);
    localStorage.setItem('directMailBatches', JSON.stringify(updatedBatches));
    
    // Close the batch details if the deleted batch was selected
    if (selectedBatch?.id === batchToDelete) {
      setSelectedBatch(null);
    }
    
    setDeleteConfirmDialog(false);
    setBatchToDelete(null);
    
    toast({
      title: "Batch Deleted",
      description: "The batch has been removed successfully.",
    });
  };

  const cancelDelete = () => {
    setDeleteConfirmDialog(false);
    setBatchToDelete(null);
  };

  const handleSaveBatchTitle = () => {
    if (!selectedBatch || !editedTitle.trim()) return;
    
    const updatedBatches = batches.map(batch => 
      batch.id === selectedBatch.id 
        ? { ...batch, batchTitle: editedTitle.trim() }
        : batch
    );
    
    setBatches(updatedBatches);
    localStorage.setItem('directMailBatches', JSON.stringify(updatedBatches));
    
    // Update selectedBatch to reflect the change
    setSelectedBatch({ ...selectedBatch, batchTitle: editedTitle.trim() });
    
    setIsEditingTitle(false);
    toast({
      title: "Title Updated",
      description: "Batch title has been updated successfully.",
    });
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle('');
  };

  // Format column names for display (convert camelCase to Title Case)
  const formatColumnName = (columnName: string): string => {
    if (columnName === 'referenceNumber') return 'Reference #';
    // Add space before capital letters and capitalize first letter
    return columnName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
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
              <TabsTrigger value="all-batches" data-testid="tab-all-batches" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Batch List</TabsTrigger>
              <TabsTrigger value="stats" data-testid="tab-stats-overview" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Stats</TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Notes</TabsTrigger>
            </TabsList>

          {/* CREATE BATCH TAB */}
          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Create New Batch</CardTitle>
                  <Button 
                    onClick={() => setStatesDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white scale-95"
                    data-testid="button-states"
                  >
                    {selectedStates.length > 0 ? `${selectedStates.length} States` : 'States'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stage: Upload */}
                {uploadStage === 'upload' && (
                  <div className="space-y-6">
                    {/* First Row */}
                    <div className="grid grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="batch-number">Batch Number</Label>
                        <Input
                          id="batch-number"
                          value={batchNumber}
                          onChange={(e) => setBatchNumber(e.target.value)}
                          placeholder=""
                          data-testid="input-batch-number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batch-title">Batch Title</Label>
                        <Input
                          id="batch-title"
                          value={batchTitle}
                          onChange={(e) => setBatchTitle(e.target.value)}
                          placeholder=""
                          data-testid="input-batch-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ten-year-bond">10 Year Bond</Label>
                        <Input
                          id="ten-year-bond"
                          value={tenYearBond}
                          onChange={(e) => setTenYearBond(e.target.value)}
                          placeholder=""
                          data-testid="input-ten-year-bond"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="par-rate">Par Rate</Label>
                        <Input
                          id="par-rate"
                          value={parRate}
                          onChange={(e) => setParRate(e.target.value)}
                          placeholder=""
                          data-testid="input-par-rate"
                        />
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="category">Loan Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger id="category" data-testid="select-category">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="va">VA</SelectItem>
                            <SelectItem value="va-jumbo">VA Jumbo</SelectItem>
                            <SelectItem value="conv">Conv.</SelectItem>
                            <SelectItem value="conv-jumbo">Conv. Jumbo</SelectItem>
                            <SelectItem value="fha">FHA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data-type">Data Speed</Label>
                        <Select value={dataType} onValueChange={setDataType}>
                          <SelectTrigger id="data-type" data-testid="select-data-type">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trigger">Trigger</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery">Delivery</Label>
                        <Select value={delivery} onValueChange={setDelivery}>
                          <SelectTrigger id="delivery" data-testid="select-delivery">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first-class">First Class</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="bulk">Bulk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration-first-call">Duration to First Call</Label>
                        <Input
                          id="duration-first-call"
                          value={durationToFirstCall}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            let formatted = '';
                            
                            if (value.length > 0) {
                              formatted = value.substring(0, 2);
                            }
                            if (value.length > 2) {
                              formatted += '/' + value.substring(2, 4);
                            }
                            if (value.length > 4) {
                              formatted += '/' + value.substring(4, 8);
                            }
                            
                            setDurationToFirstCall(formatted);
                          }}
                          placeholder="MM/DD/YYYY"
                          data-testid="input-duration-first-call"
                        />
                      </div>
                    </div>

                    {/* Third Row - Date Fields */}
                    <div className="grid grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="data-date">Data Date</Label>
                        <Input
                          id="data-date"
                          value={dataDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            let formatted = '';
                            
                            if (value.length > 0) {
                              formatted = value.substring(0, 2);
                            }
                            if (value.length > 2) {
                              formatted += '/' + value.substring(2, 4);
                            }
                            if (value.length > 4) {
                              formatted += '/' + value.substring(4, 8);
                            }
                            
                            setDataDate(formatted);
                          }}
                          placeholder="MM/DD/YYYY"
                          data-testid="input-data-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="print-date">Print Date</Label>
                        <Input
                          id="print-date"
                          value={printDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            let formatted = '';
                            
                            if (value.length > 0) {
                              formatted = value.substring(0, 2);
                            }
                            if (value.length > 2) {
                              formatted += '/' + value.substring(2, 4);
                            }
                            if (value.length > 4) {
                              formatted += '/' + value.substring(4, 8);
                            }
                            
                            setPrintDate(formatted);
                          }}
                          placeholder="MM/DD/YYYY"
                          data-testid="input-print-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-mail-date">Mail Date</Label>
                        <Input
                          id="new-mail-date"
                          value={newMailDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            let formatted = '';
                            
                            if (value.length > 0) {
                              formatted = value.substring(0, 2);
                            }
                            if (value.length > 2) {
                              formatted += '/' + value.substring(2, 4);
                            }
                            if (value.length > 4) {
                              formatted += '/' + value.substring(4, 8);
                            }
                            
                            setNewMailDate(formatted);
                          }}
                          placeholder="MM/DD/YYYY"
                          data-testid="input-new-mail-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="first-call">First Call</Label>
                        <Input
                          id="first-call"
                          value={mailDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                            let formatted = '';
                            
                            if (value.length > 0) {
                              formatted = value.substring(0, 2); // MM
                            }
                            if (value.length > 2) {
                              formatted += '/' + value.substring(2, 4); // /DD
                            }
                            if (value.length > 4) {
                              formatted += '/' + value.substring(4, 8); // /YYYY
                            }
                            
                            setMailDate(formatted);
                          }}
                          placeholder="MM/DD/YYYY"
                          data-testid="input-first-call"
                        />
                      </div>
                    </div>

                    {/* Separation Line */}
                    <div className="h-4"></div>
                    <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '24px' }}>
                      {/* Fourth Row - Vendor Fields */}
                      <div className="grid grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="data-source">Data Vendor</Label>
                        <Select value={dataSource} onValueChange={setDataSource}>
                          <SelectTrigger id="data-source" data-testid="select-data-source">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dlx">DLX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="print-vendor">Print Vendor</Label>
                        <Select value={printVendor} onValueChange={setPrintVendor}>
                          <SelectTrigger id="print-vendor" data-testid="select-print-vendor">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-house">In House</SelectItem>
                            <SelectItem value="tbd">TBD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mail-vendor">Mail Vendor</Label>
                        <Select value={mailVendor} onValueChange={setMailVendor}>
                          <SelectTrigger id="mail-vendor" data-testid="select-mail-vendor">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-house">In House</SelectItem>
                            <SelectItem value="tbd">TBD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supply-vendor">Supply Vendor</Label>
                        <Select value={supplyVendor} onValueChange={setSupplyVendor}>
                          <SelectTrigger id="supply-vendor" data-testid="select-supply-vendor">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-house">In House</SelectItem>
                            <SelectItem value="tbd">TBD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    </div>

                    {/* Fifth Row - Cost Fields */}
                    <div className="grid grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="data-cost">Data Cost</Label>
                        <CurrencyInput
                          id="data-cost"
                          value={dataCost}
                          onChange={setDataCost}
                          placeholder="$"
                          dataTestId="input-data-cost"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mail-cost">Mail Cost</Label>
                        <CurrencyInput
                          id="mail-cost"
                          value={mailCost}
                          onChange={setMailCost}
                          placeholder="$"
                          dataTestId="input-mail-cost"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="print-cost">Print Cost</Label>
                        <CurrencyInput
                          id="print-cost"
                          value={printCost}
                          onChange={setPrintCost}
                          placeholder="$"
                          dataTestId="input-print-cost"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supply-cost">Supply Cost</Label>
                        <CurrencyInput
                          id="supply-cost"
                          value={supplyCost}
                          onChange={setSupplyCost}
                          placeholder="$"
                          dataTestId="input-supply-cost"
                        />
                      </div>
                    </div>

                    {/* Separation Line */}
                    <div className="h-4"></div>
                    <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '24px' }}>
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
                          <p className="text-sm text-green-600">Upload Excel File Format (CSV UTF8) <span className="text-destructive">*</span></p>
                        </label>
                      </div>
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
                <CardTitle>Batch List</CardTitle>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No batches created yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto flywheel-scroll">
                    <table className="w-full border-collapse min-w-max">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                            onClick={() => handleSort('createdDate')}
                            data-testid="sort-date"
                          >
                            <div className="flex items-center gap-2">
                              Created
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                            onClick={() => handleSort('batchNumber')}
                            data-testid="sort-batch-number"
                          >
                            <div className="flex items-center gap-2">
                              Batch #
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th 
                            className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                            onClick={() => handleSort('batchTitle')}
                            data-testid="sort-batch-title"
                          >
                            <div className="flex items-center gap-2">
                              Batch Title
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </th>
                          <th className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 whitespace-nowrap">Category</th>
                          <th className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 whitespace-nowrap">Data</th>
                          <th className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 whitespace-nowrap">Delivery</th>
                          <th className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 whitespace-nowrap">10 Yr Bond</th>
                          <th className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 whitespace-nowrap">Par Rate</th>
                          <th className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 whitespace-nowrap">Records</th>
                          <th className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 whitespace-nowrap">States</th>
                          <th className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 whitespace-nowrap">Cost</th>
                          <th className="text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedBatches.map((batch, index) => {
                          // Calculate actual lead count by filtering out empty rows
                          const actualLeadCount = batch.excelData.filter((row) => {
                            return Object.values(row).some(value => value && value.toString().trim() !== '');
                          }).length;
                          
                          // Format category display
                          const getCategoryDisplay = (cat: string | undefined) => {
                            if (!cat) return '-';
                            switch(cat) {
                              case 'va': return 'VA';
                              case 'va-jumbo': return 'VA Jumbo';
                              case 'conv': return 'Conv.';
                              case 'conv-jumbo': return 'Conv. Jumbo';
                              case 'fha': return 'FHA';
                              default: return cat;
                            }
                          };
                          
                          // Format data speed display
                          const getDataSpeedDisplay = (speed: string | undefined) => {
                            if (!speed) return '-';
                            switch(speed) {
                              case 'trigger': return 'Trigger';
                              case 'monthly': return 'Monthly';
                              default: return speed;
                            }
                          };
                          
                          // Format delivery display
                          const getDeliveryDisplay = (del: string | undefined) => {
                            if (!del) return '-';
                            switch(del) {
                              case 'first-class': return 'First Class';
                              case 'standard': return 'Standard';
                              case 'bulk': return 'Bulk';
                              default: return del;
                            }
                          };
                          
                          return (
                            <tr key={batch.id} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                              <td className="p-3 whitespace-nowrap">{new Date(batch.createdDate).toLocaleDateString()}</td>
                              <td className="p-3 whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedBatch(batch)}
                                  className="text-primary hover:underline cursor-pointer font-medium"
                                  data-testid={`button-view-${batch.id}`}
                                >
                                  {batch.batchNumber}
                                </button>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedBatch(batch)}
                                  className="text-primary hover:underline cursor-pointer font-medium"
                                  data-testid={`button-view-title-${batch.id}`}
                                >
                                  {batch.batchTitle}
                                </button>
                              </td>
                              <td className="p-3 whitespace-nowrap">{batch.category ? getCategoryDisplay(batch.category) : '-'}</td>
                              <td className="p-3 whitespace-nowrap">{batch.dataType ? getDataSpeedDisplay(batch.dataType) : '-'}</td>
                              <td className="p-3 whitespace-nowrap">{getDeliveryDisplay(batch.delivery)}</td>
                              <td className="p-3 whitespace-nowrap">{batch.tenYearBond || '-'}</td>
                              <td className="p-3 whitespace-nowrap">{batch.parRate || '-'}</td>
                              <td className="p-3 whitespace-nowrap">{actualLeadCount}</td>
                              <td className="p-3 whitespace-nowrap">
                                {batch.states && batch.states.length > 0 ? batch.states.join(', ') : '-'}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                {(() => {
                                  const dataCost = parseInt((batch.dataCost || '0').replace(/[^\d]/g, ''), 10);
                                  const mailCost = parseInt((batch.mailCost || '0').replace(/[^\d]/g, ''), 10);
                                  const printCost = parseInt((batch.printCost || '0').replace(/[^\d]/g, ''), 10);
                                  const supplyCost = parseInt((batch.supplyCost || '0').replace(/[^\d]/g, ''), 10);
                                  const totalCost = dataCost + mailCost + printCost + supplyCost;
                                  return totalCost > 0 ? `$${totalCost.toLocaleString()}` : '-';
                                })()}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteBatch(batch.id)}
                                      data-testid={`button-delete-${batch.id}`}
                                      className="group"
                                    >
                                      <Trash2 className="h-4 w-4 transition-colors group-hover:text-red-600" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Delete Batch?
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Second Card - Batch Details (shows when batch is selected) */}
            {selectedBatch && selectedBatch.excelData.length > 0 && (() => {
              // Filter out rows with no data
              const filteredRows = sortedBatchDetails.filter((row) => {
                return Object.values(row).some(value => value && value.toString().trim() !== '');
              });
              
              // Filter out columns that have no data in any row, and also exclude repetitive columns
              const columnsWithData = Object.keys(selectedBatch.excelData[0]).filter((column) => {
                // Skip clientName and address columns (repetitive)
                if (column === 'clientName' || column === 'address') {
                  return false;
                }
                // Skip any column that looks like "reference" since we already have referenceNumber
                if (column !== 'referenceNumber' && column.toLowerCase().includes('ref')) {
                  return false;
                }
                return filteredRows.some(row => {
                  const value = row[column];
                  return value && value.toString().trim() !== '';
                });
              });

              return (
                <motion.div
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="mt-6"
                >
                  <Card>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
                    >
                      <CardHeader>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-2">
                              {isEditingTitle ? (
                                <>
                                  <Input 
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="flex-1 max-w-md"
                                    data-testid="input-edit-batch-title"
                                  />
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={handleSaveBatchTitle}
                                    data-testid="button-save-title"
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={handleCancelEdit}
                                    data-testid="button-cancel-edit"
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span>{selectedBatch.batchTitle}</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => setIsBatchDetailsExpanded(!isBatchDetailsExpanded)}
                                        data-testid="button-toggle-batch-details"
                                      >
                                        {isBatchDetailsExpanded ? (
                                          <EyeOff className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <Eye className="h-4 w-4 text-green-600" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                    {isBatchDetailsExpanded ? 'Hide' : 'Show'} Batch Details
                                  </TooltipContent>
                                </Tooltip>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setIsEditingTitle(true);
                                    setEditedTitle(selectedBatch.batchTitle);
                                  }}
                                  data-testid="button-edit-title"
                                >
                                  <Pencil className="h-4 w-4 text-green-600" />
                                </Button>
                              </>
                            )}
                          </CardTitle>
                          
                          <Button 
                            onClick={() => setBatchStatesDialogOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white scale-95"
                            data-testid="button-batch-states"
                          >
                            {selectedBatch.states && selectedBatch.states.length > 0 
                              ? `${selectedBatch.states.length} States` 
                              : 'States'}
                          </Button>
                        </div>
                          
                          {/* Collapsible Batch Details */}
                          {isBatchDetailsExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-3 pt-2 border-t"
                            >
                              {/* Row 1: Batch #, Title, 10 Year Bond, Par Rate */}
                              <div className="grid grid-cols-4 gap-4 pt-3">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Batch #</Label>
                                  <p className="font-medium">{selectedBatch.batchNumber}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Batch Title</Label>
                                  <p className="font-medium">{selectedBatch.batchTitle}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">10 Year Bond</Label>
                                  <p className="font-medium">{selectedBatch.tenYearBond || '-'}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Par Rate</Label>
                                  <p className="font-medium">{selectedBatch.parRate || '-'}</p>
                                </div>
                              </div>
                              
                              {/* Row 2: Category, Data Speed, Delivery, Mail Date */}
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Category</Label>
                                  <p className="font-medium">
                                    {selectedBatch.category ? (() => {
                                      switch(selectedBatch.category) {
                                        case 'va': return 'VA';
                                        case 'va-jumbo': return 'VA Jumbo';
                                        case 'conv': return 'Conv.';
                                        case 'conv-jumbo': return 'Conv. Jumbo';
                                        case 'fha': return 'FHA';
                                        default: return selectedBatch.category;
                                      }
                                    })() : '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Data Speed</Label>
                                  <p className="font-medium">
                                    {selectedBatch.dataType ? (selectedBatch.dataType === 'trigger' ? 'Trigger' : 'Monthly') : '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Delivery</Label>
                                  <p className="font-medium">
                                    {selectedBatch.delivery ? selectedBatch.delivery.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Mail Date</Label>
                                  <p className="font-medium">{selectedBatch.mailDate || '-'}</p>
                                </div>
                              </div>
                              
                              {/* Row 3: Vendors */}
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Data Vendor</Label>
                                  <p className="font-medium">{selectedBatch.dataSource ? (selectedBatch.dataSource === 'dlx' ? 'DLX' : selectedBatch.dataSource) : '-'}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Mail Vendor</Label>
                                  <p className="font-medium">
                                    {selectedBatch.mailVendor ? (selectedBatch.mailVendor === 'in-house' ? 'In House' : selectedBatch.mailVendor === 'tbd' ? 'TBD' : selectedBatch.mailVendor) : '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Print Vendor</Label>
                                  <p className="font-medium">
                                    {selectedBatch.printVendor ? (selectedBatch.printVendor === 'in-house' ? 'In House' : selectedBatch.printVendor === 'tbd' ? 'TBD' : selectedBatch.printVendor) : '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Supply Vendor</Label>
                                  <p className="font-medium">
                                    {selectedBatch.supplyVendor ? (selectedBatch.supplyVendor === 'in-house' ? 'In House' : selectedBatch.supplyVendor === 'tbd' ? 'TBD' : selectedBatch.supplyVendor) : '-'}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Row 4: Costs */}
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Data Cost</Label>
                                  <p className="font-medium">
                                    {selectedBatch.dataCost && parseInt(selectedBatch.dataCost) ? `$${parseInt(selectedBatch.dataCost).toLocaleString()}` : '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Mail Cost</Label>
                                  <p className="font-medium">
                                    {selectedBatch.mailCost && parseInt(selectedBatch.mailCost) ? `$${parseInt(selectedBatch.mailCost).toLocaleString()}` : '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Print Cost</Label>
                                  <p className="font-medium">
                                    {selectedBatch.printCost && parseInt(selectedBatch.printCost) ? `$${parseInt(selectedBatch.printCost).toLocaleString()}` : '-'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Supply Cost</Label>
                                  <p className="font-medium">
                                    {selectedBatch.supplyCost && parseInt(selectedBatch.supplyCost) ? `$${parseInt(selectedBatch.supplyCost).toLocaleString()}` : '-'}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </CardHeader>
                    </motion.div>
                    <CardContent className="pt-6">
                    <div className="border-2 border-blue-400 rounded-lg">
                      {/* Top Scrollbar */}
                      <div 
                        className="overflow-x-scroll w-full" 
                        style={{ scrollbarWidth: 'auto', height: '20px' }}
                        onScroll={(e) => {
                          const bottomScroll = document.getElementById('batch-table-scroll');
                          if (bottomScroll) {
                            bottomScroll.scrollLeft = e.currentTarget.scrollLeft;
                          }
                        }}
                        id="top-scrollbar"
                      >
                        <div style={{ width: 'max-content', height: '1px' }}>
                          {/* Spacer to create scrollbar width matching table */}
                          <table className="w-max border-collapse invisible">
                            <thead>
                              <tr>
                                {columnsWithData.map((column) => (
                                  <th key={column} className="p-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      {formatColumnName(column)}
                                      <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                  </th>
                                ))}
                                {/* Empty spacer column */}
                                <th className="p-3" style={{ width: '200px' }}></th>
                              </tr>
                            </thead>
                          </table>
                        </div>
                      </div>

                      {/* Actual Table */}
                      <style>{`
                        #batch-table-scroll::-webkit-scrollbar {
                          display: none;
                        }
                        #batch-table-scroll {
                          -ms-overflow-style: none;
                          scrollbar-width: none;
                        }
                        #top-scrollbar::-webkit-scrollbar {
                          height: 12px;
                        }
                        #top-scrollbar::-webkit-scrollbar-track {
                          background: transparent;
                        }
                        #top-scrollbar::-webkit-scrollbar-thumb {
                          background-color: #1a3373;
                          border-radius: 6px;
                          border: 2px solid transparent;
                          background-clip: padding-box;
                        }
                        #top-scrollbar::-webkit-scrollbar-thumb:hover {
                          background-color: #152a5e;
                        }
                        #top-scrollbar::-webkit-scrollbar-button {
                          width: 0;
                          height: 0;
                          display: none;
                          -webkit-appearance: none;
                          background: none;
                        }
                        #top-scrollbar::-webkit-scrollbar-button:single-button {
                          display: none;
                          width: 0;
                          height: 0;
                          -webkit-appearance: none;
                          background: none;
                        }
                        #top-scrollbar::-webkit-scrollbar-button:horizontal:end:increment {
                          display: none;
                          width: 0;
                          height: 0;
                          -webkit-appearance: none;
                          background: none;
                        }
                        #top-scrollbar::-webkit-scrollbar-button:horizontal:start:decrement {
                          display: none;
                          width: 0;
                          height: 0;
                          -webkit-appearance: none;
                          background: none;
                        }
                        #top-scrollbar::-webkit-scrollbar-button:start:decrement,
                        #top-scrollbar::-webkit-scrollbar-button:end:increment {
                          display: none;
                        }
                        #top-scrollbar::-webkit-scrollbar-corner {
                          background: transparent;
                          display: none;
                        }
                        .sticky-col-lastName {
                          position: sticky;
                          left: 0;
                          z-index: 20;
                          box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
                        }
                        .sticky-col-firstName {
                          position: sticky;
                          left: 150px;
                          z-index: 20;
                          box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
                        }
                        .sticky-header {
                          z-index: 30 !important;
                          background-color: rgb(229, 231, 235) !important;
                        }
                        @media (prefers-color-scheme: dark) {
                          .sticky-header {
                            background-color: rgb(55, 65, 81) !important;
                          }
                        }
                      `}</style>
                      <div 
                        className="overflow-x-scroll w-full max-h-[600px] overflow-y-auto" 
                        onScroll={(e) => {
                          const topScroll = document.getElementById('top-scrollbar');
                          if (topScroll) {
                            topScroll.scrollLeft = e.currentTarget.scrollLeft;
                          }
                        }}
                        id="batch-table-scroll"
                      >
                        <table className="w-max border-collapse">
                          <thead className="sticky top-0 z-10">
                            <tr className="border-b border-gray-300">
                              {columnsWithData.map((column, colIdx) => {
                                const isLastName = column.toLowerCase().includes('last') && column.toLowerCase().includes('name');
                                const isFirstName = column.toLowerCase().includes('first') && column.toLowerCase().includes('name');
                                const isSticky = colIdx < 2 && (isLastName || isFirstName);
                                
                                return (
                                  <th 
                                    key={column}
                                    className={`text-left p-3 font-semibold bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap ${
                                      colIdx === 0 ? 'sticky-col-lastName sticky-header' : 
                                      colIdx === 1 ? 'sticky-col-firstName sticky-header' : ''
                                    }`}
                                    onClick={() => handleBatchDetailSort(column)}
                                    data-testid={`sort-${column}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {formatColumnName(column)}
                                      <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                  </th>
                                );
                              })}
                              {/* Empty spacer column */}
                              <th className="p-3 bg-gray-200 dark:bg-gray-700" style={{ width: '200px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRows.map((row, idx) => (
                              <tr key={idx} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                                {columnsWithData.map((column, colIdx) => (
                                  <td 
                                    key={column} 
                                    className={`p-3 whitespace-nowrap ${
                                      colIdx === 0 ? `sticky-col-lastName ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}` : 
                                      colIdx === 1 ? `sticky-col-firstName ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}` : ''
                                    }`}
                                  >
                                    {row[column] || '-'}
                                  </td>
                                ))}
                                {/* Empty spacer cell */}
                                <td className="p-3" style={{ width: '200px' }}></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Showing {filteredRows.length} records with {columnsWithData.length} columns
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              );
            })()}
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

      {/* States Selection Dialog */}
      <Dialog open={statesDialogOpen} onOpenChange={setStatesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select States for This Batch</DialogTitle>
            <DialogDescription>
              Choose which states this batch covers. Selected: {selectedStates.length}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {US_STATES.map((state) => {
              const isSelected = selectedStates.includes(state.abbr);
              return (
                <Button
                  key={state.abbr}
                  variant={isSelected ? "default" : "outline"}
                  className={`justify-start ${isSelected ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedStates(selectedStates.filter(s => s !== state.abbr));
                    } else {
                      setSelectedStates([...selectedStates, state.abbr]);
                    }
                  }}
                  data-testid={`button-state-${state.abbr}`}
                >
                  <span className="font-semibold mr-2">{state.abbr}</span>
                  <span className="text-sm">{state.name}</span>
                </Button>
              );
            })}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSelectedStates([])}
              data-testid="button-clear-states"
            >
              Clear All
            </Button>
            <Button 
              onClick={() => setStatesDialogOpen(false)}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-done-states"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch States Display Dialog (Read-only) */}
      <Dialog open={batchStatesDialogOpen} onOpenChange={setBatchStatesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>States for This Batch</DialogTitle>
            <DialogDescription>
              {selectedBatch?.states && selectedBatch.states.length > 0 
                ? `This batch covers ${selectedBatch.states.length} state${selectedBatch.states.length > 1 ? 's' : ''}`
                : 'No states selected for this batch'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {selectedBatch?.states && selectedBatch.states.length > 0 ? (
              US_STATES.map((state) => {
                const isSelected = selectedBatch.states.includes(state.abbr);
                return isSelected ? (
                  <div
                    key={state.abbr}
                    className="flex items-center gap-2 p-3 rounded-md bg-green-600 text-white"
                    data-testid={`batch-state-${state.abbr}`}
                  >
                    <span className="font-semibold">{state.abbr}</span>
                    <span className="text-sm">{state.name}</span>
                  </div>
                ) : null;
              })
            ) : (
              <p className="col-span-3 text-center text-muted-foreground">No states selected</p>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setBatchStatesDialogOpen(false)}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-close-batch-states"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog} onOpenChange={setDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete Batch Confirmation
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="font-semibold text-foreground mb-2">
                Are you sure you want to delete this batch?
              </div>
              <div className="text-muted-foreground">
                Clicking Yes will permanently remove all items in this batch. This action cannot be undone.
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={cancelDelete}
              data-testid="button-cancel-delete"
            >
              Go Back
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
