import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Filter, ArrowLeft, Plus, X, ArrowUpDown, Minus, MoreVertical, User, Monitor, ChevronDown, ChevronUp, Upload, CheckCircle, AlertCircle, FileText, Paperclip, Download, Trash2, Camera, Phone, Mail, Briefcase, Calendar, Shield } from 'lucide-react';
import { RevenueSourcesChart } from '@/components/dashboard/RevenueSourcesChart';
import { ExpenseBreakdownChart } from '@/components/dashboard/ExpenseBreakdownChart';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip as TooltipComponent, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

// CSV Upload types
type UploadStage = 'upload' | 'mapping' | 'preview' | 'success';

interface ColumnMapping {
  reference: string;
  firstName: string;
  lastName: string;
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

// CurrencyInput component for dollar values
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
      className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
    />
  );
};

export default function AdminSnapshot() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [entityFilter, setEntityFilter] = useState('prime-rate');
  const [categoryFilter, setCategoryFilter] = useState('financials');
  const [teamFilter, setTeamFilter] = useState('select');
  const [timeFilter, setTimeFilter] = useState('today');
  const [timeFilterFromDate, setTimeFilterFromDate] = useState('');
  const [timeFilterToDate, setTimeFilterToDate] = useState('');
  const [revenueDetailView, setRevenueDetailView] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState<string | null>(null);
  const [showExpenseNotesDialog, setShowExpenseNotesDialog] = useState(false);
  const [showRevenueNotesDialog, setShowRevenueNotesDialog] = useState(false);
  const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<{ id: string | number; type: 'expense' | 'revenue' } | null>(null);
  const [showExpenseLogAttachmentsDialog, setShowExpenseLogAttachmentsDialog] = useState(false);
  const [showRevenueLogAttachmentsDialog, setShowRevenueLogAttachmentsDialog] = useState(false);
  const [tempExpenseLogId, setTempExpenseLogId] = useState(() => `temp-expense-${Date.now()}`);
  const [tempRevenueLogId, setTempRevenueLogId] = useState(() => `temp-revenue-${Date.now()}`);
  const [shortcutDropdownOpen, setShortcutDropdownOpen] = useState(false);
  const [screenshareLoading, setScreenshareLoading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  
  // Staff form state
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [payrollType, setPayrollType] = useState('');
  const [level, setLevel] = useState('');
  const [role, setRole] = useState('');
  const [authorization, setAuthorization] = useState('');
  const [access, setAccess] = useState('');
  const [specialAccess, setSpecialAccess] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [backgroundCheck, setBackgroundCheck] = useState('');
  const [references, setReferences] = useState('');
  const [creditReview, setCreditReview] = useState('');
  const [identification, setIdentification] = useState('');
  const [workAuthorization, setWorkAuthorization] = useState('');
  const [drugScreening, setDrugScreening] = useState('');
  const [employmentAgreement, setEmploymentAgreement] = useState('');
  const [policy, setPolicy] = useState('');
  const [ndaAgreement, setNdaAgreement] = useState('');
  const [interviewGrade, setInterviewGrade] = useState('');
  
  const [isRevenueFormMinimized, setIsRevenueFormMinimized] = useState(false);
  const [isExpenseTableMinimized, setIsExpenseTableMinimized] = useState(false);
  const [areChartsMinimized, setAreChartsMinimized] = useState(false);
  const [isTransactionsMinimized, setIsTransactionsMinimized] = useState(false);
  const [isFiltersMinimized, setIsFiltersMinimized] = useState(false);
  const [transactionDateFilter, setTransactionDateFilter] = useState('today');
  
  // Query card state variables (only shown when categoryFilter is 'direct-mail')
  const [isQueryCardMinimized, setIsQueryCardMinimized] = useState(false);
  const [selectedQueryStates, setSelectedQueryStates] = useState<string[]>([]);
  const [selectedBatchActivities, setSelectedBatchActivities] = useState<string[]>([]);
  const [cashOutAbove, setCashOutAbove] = useState('');
  const [ficoRangeAbove, setFicoRangeAbove] = useState('');
  const [parRateAbove, setParRateAbove] = useState('');
  const [dataCategory, setDataCategory] = useState('Select');
  const [batchResults, setBatchResults] = useState<'show-all' | 'profitable' | 'loss'>('show-all');
  const [showBatchWarning, setShowBatchWarning] = useState(false);
  const [showFormConflictWarning, setShowFormConflictWarning] = useState(false);
  const [conflictFormType, setConflictFormType] = useState<'expense' | 'revenue'>('expense');
  
  // Batch List sorting state
  const [batchSortColumn, setBatchSortColumn] = useState<string>('createdDate');
  const [batchSortDirection, setBatchSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showStatesDialog, setShowStatesDialog] = useState(false);
  const [selectedBatchStates, setSelectedBatchStates] = useState<string[]>([]);
  
  // Create New Batch card state (only shown when categoryFilter is 'direct-mail')
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');
  const [batchTitle, setBatchTitle] = useState('');
  const [tenYearBond, setTenYearBond] = useState('');
  const [parRate, setParRate] = useState('');
  const [category, setCategory] = useState('select');
  const [dataType, setDataType] = useState('select');
  const [delivery, setDelivery] = useState('select');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [dataCost, setDataCost] = useState('');
  const [mailCost, setMailCost] = useState('');
  const [printCost, setPrintCost] = useState('');
  const [supplyCost, setSupplyCost] = useState('');
  const [dataDate, setDataDate] = useState('');
  const [dataSource, setDataSource] = useState('select');
  const [printVendor, setPrintVendor] = useState('select');
  const [mailVendor, setMailVendor] = useState('select');
  const [supplyVendor, setSupplyVendor] = useState('select');
  const [durationToFirstCall, setDurationToFirstCall] = useState('');
  const [printDate, setPrintDate] = useState('');
  const [mailDate, setMailDate] = useState('');
  const [firstCallDate, setFirstCallDate] = useState('');
  
  // CSV Upload state variables
  const [uploadStage, setUploadStage] = useState<UploadStage>('upload');
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    reference: '',
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [incompleteFieldsDialog, setIncompleteFieldsDialog] = useState(false);
  const [noStatesWarningDialog, setNoStatesWarningDialog] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [statesDialogOpen, setStatesDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [batches, setBatches] = useState<any[]>([]);
  const [transactionDateRange, setTransactionDateRange] = useState({
    fromDate: '',
    toDate: ''
  });
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const [openBatchActionMenu, setOpenBatchActionMenu] = useState<string | null>(null);
  const [deleteBatchId, setDeleteBatchId] = useState<string | null>(null);
  const [showDeleteBatchModal, setShowDeleteBatchModal] = useState(false);
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
    paymentTerm: '',
    notes: '',
    checkNumber: '',
    invoiceNumber: ''
  });
  const [newRevenue, setNewRevenue] = useState({
    logDate: '',
    revenue: '',
    paymentForm: '',
    revenueCategory: '',
    paymentFrom: '',
    transactionDate: '',
    clearanceDate: '',
    revenueTerm: '',
    notes: '',
    reference: '',
    checkNumber: ''
  });

  // Sample data - in production, this would come from your API
  const metricsData = {
    grossIncome: 2847500,
    revenue: 1923400,
    expense: 924100
  };

  const revenueData = categoryFilter === 'financials' 
    ? [
        { name: 'Direct Mail', value: 685020, color: '#6366f1' },
        { name: 'Lead Vendors', value: 480850, color: '#8b5cf6' },
        { name: 'Social Media', value: 365510, color: '#ec4899' },
        { name: 'Repeat Clients', value: 250340, color: '#f59e0b' },
        { name: 'Referrals', value: 141680, color: '#10b981' }
      ]
    : [
        { name: 'Funded', value: 685020, color: '#6366f1' },
        { name: 'Loan', value: 480850, color: '#8b5cf6' },
        { name: 'Loan Prep', value: 365510, color: '#ec4899' },
        { name: 'Quote', value: 250340, color: '#f59e0b' },
        { name: 'Lead', value: 141680, color: '#10b981' }
      ];

  const loanProgramData = [
    { name: 'VA', value: 685020, color: '#6366f1' },
    { name: 'Conventional', value: 480850, color: '#8b5cf6' },
    { name: 'FHA', value: 365510, color: '#ec4899' },
    { name: 'VA Jumbo', value: 250340, color: '#f59e0b' },
    { name: 'Conv Jumbo', value: 141680, color: '#10b981' }
  ];

  // Mock batch data for Batch List table
  const mockBatches = [
    {
      id: '1',
      createdDate: '10/05/2025',
      batchNumber: 'B-1001',
      batchTitle: 'VA Refinance Q4',
      category: 'VA',
      tenYearBond: '4.25',
      parRate: '6.75',
      records: 1250,
      states: ['CA', 'TX', 'FL'],
      dataCost: '5000',
      mailCost: '3500',
      printCost: '2000',
      supplyCost: '500'
    },
    {
      id: '2',
      createdDate: '10/08/2025',
      batchNumber: 'B-1002',
      batchTitle: 'FHA Purchase Campaign',
      category: 'FHA',
      tenYearBond: '4.30',
      parRate: '6.85',
      records: 890,
      states: ['NY', 'NJ', 'PA'],
      dataCost: '4200',
      mailCost: '2800',
      printCost: '1500',
      supplyCost: '400'
    },
    {
      id: '3',
      createdDate: '10/10/2025',
      batchNumber: 'B-1003',
      batchTitle: 'Conventional Jumbo',
      category: 'Conventional Jumbo',
      tenYearBond: '4.35',
      parRate: '7.00',
      records: 450,
      states: ['CA', 'WA'],
      dataCost: '3000',
      mailCost: '2000',
      printCost: '1200',
      supplyCost: '300'
    }
  ];

  // Load batches from localStorage on component mount
  useEffect(() => {
    const storedBatches = localStorage.getItem('directMailBatches');
    if (storedBatches) {
      setBatches(JSON.parse(storedBatches));
    }
  }, []);

  const expenseData = categoryFilter === 'financials'
    ? [
        { name: 'Marketing', value: 323435, color: '#ef4444' },
        { name: 'Staff', value: 277230, color: '#f97316' },
        { name: 'Vendors', value: 184820, color: '#eab308' },
        { name: 'Services', value: 92410, color: '#06b6d4' },
        { name: 'Supplies', value: 46205, color: '#8b5cf6' }
      ]
    : [
        { name: 'Florida', value: 323435, color: '#ef4444' },
        { name: 'California', value: 277230, color: '#f97316' },
        { name: 'Washington', value: 184820, color: '#eab308' },
        { name: 'Virginia', value: 92410, color: '#06b6d4' },
        { name: 'Tennessee', value: 46205, color: '#8b5cf6' }
      ];

  // Drill-down data for Direct Mail example
  const directMailByState = [
    { name: 'California', value: 205506 },
    { name: 'Texas', value: 171255 },
    { name: 'Florida', value: 137004 },
    { name: 'New York', value: 102753 },
    { name: 'Others', value: 68502 }
  ];

  // Dashboard shortcuts menu items
  const dashboardMenuItems = [
    // Row 1
    { label: 'Lead', path: '/admin/add-client' },
    { label: 'Quote', path: '/admin/quotes' },
    { label: 'Loan Prep', path: '/admin/loan-prep' },
    { label: 'Loan', path: '/admin/pipeline' },
    { label: 'Funded', path: '/admin/funded' },
    { label: 'Closed', path: '/admin/records' },
    // Row 2
    { label: 'Dashboard', path: '/admin/reports' },
    { label: 'Settings', path: '/admin/settings' },
    // Navigation options
    { label: 'Back to Tiles', path: '/admin' },
    { label: 'Back to Site', path: '/' },
    { label: 'Log Out', path: '/logout' }
  ];

  const requiredFields: RequiredField[] = [
    { key: 'reference', label: 'Reference Number', description: 'Unique identifier for tracking' },
    { key: 'firstName', label: 'First Name', description: 'Client first name' },
    { key: 'lastName', label: 'Last Name', description: 'Client last name' },
    { key: 'streetAddress', label: 'Street Address', description: 'Mailing address' },
    { key: 'city', label: 'City', description: 'City name' },
    { key: 'state', label: 'State', description: 'State abbreviation' },
    { key: 'zip', label: 'Zip Code', description: 'Postal code' }
  ];

  const autoMapColumns = (columns: string[]) => {
    const mapping: Partial<ColumnMapping> = {};
    
    const matchPatterns: Record<keyof ColumnMapping, string[]> = {
      reference: ['reference', 'ref', 'ref#', 'reference number', 'refnum'],
      firstName: ['first name', 'firstname', 'first', 'client name', 'clientname'],
      lastName: ['last name', 'lastname', 'last', 'surname'],
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

    // Check if states are selected first (specific warning)
    if (selectedStates.length === 0) {
      setNoStatesWarningDialog(true);
      // Clear the file input
      e.target.value = '';
      return;
    }

    // Then check if all other required fields are completed
    if (getCompletedBatchFieldsCount() < 17) {
      setIncompleteFieldsDialog(true);
      // Clear the file input
      e.target.value = '';
      return;
    }

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

      // Get client name (keep last name and first name separate)
      const firstName = row[columnMapping.firstName] || '';
      const lastName = row[columnMapping.lastName] || '';

      // Create a copy of row without the mapped columns to avoid duplicates
      const { 
        [columnMapping.reference]: _, 
        [columnMapping.firstName]: __,
        [columnMapping.lastName]: ___,
        [columnMapping.streetAddress]: ____,
        [columnMapping.city]: _____,
        [columnMapping.state]: ______,
        [columnMapping.zip]: _______,
        ...otherColumns 
      } = row;
      
      return {
        referenceNumber: row[columnMapping.reference] || '',
        lastName: lastName,
        firstName: firstName,
        address: fullAddress,
        ...otherColumns // Preserve all other original columns (excluding mapped ones)
      };
    });

    const newBatch: any = {
      id: Date.now().toString(),
      batchNumber: batchNumber,
      batchTitle: batchTitle,
      category: category,
      dataType: dataType,
      delivery: delivery,
      mailDate: mailDate,
      dataDate: dataDate,
      printDate: printDate,
      firstCallDate: firstCallDate,
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
      records: mappedData.length,
      createdDate: new Date().toLocaleDateString('en-US'),
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

    const storedBatches = localStorage.getItem('directMailBatches');
    const existingBatches = storedBatches ? JSON.parse(storedBatches) : [];
    const updatedBatches = [...existingBatches, newBatch];
    localStorage.setItem('directMailBatches', JSON.stringify(updatedBatches));
    
    // Update the batches state to refresh the UI immediately
    setBatches(updatedBatches);

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
    setCategory('select');
    setDataType('select');
    setDelivery('select');
    setMailDate('');
    setDataDate('');
    setPrintDate('');
    setFirstCallDate('');
    setDurationToFirstCall('');
    setDataSource('select');
    setMailVendor('select');
    setPrintVendor('select');
    setSupplyVendor('select');
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
      lastName: '',
      streetAddress: '',
      city: '',
      state: '',
      zip: ''
    });
    setUploadStage('upload');
    setError('');
    setSelectedFile(null);
    setShowCreateBatch(false);
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const handleDeleteBatch = (batchId: string) => {
    setDeleteBatchId(batchId);
    setShowDeleteBatchModal(true);
    setOpenBatchActionMenu(null);
  };

  const confirmDeleteBatch = () => {
    if (!deleteBatchId) return;
    
    const storedBatches = localStorage.getItem('directMailBatches');
    if (storedBatches) {
      const existingBatches = JSON.parse(storedBatches);
      const updatedBatches = existingBatches.filter((b: any) => b.id !== deleteBatchId);
      localStorage.setItem('directMailBatches', JSON.stringify(updatedBatches));
      setBatches(updatedBatches);
    }
    
    setShowDeleteBatchModal(false);
    setDeleteBatchId(null);
    
    toast({
      title: "Batch Deleted",
      description: "The batch has been removed successfully",
    });
  };

  const handleScreenshare = () => {
    setScreenshareLoading(true);
    setTimeout(() => {
      setScreenshareLoading(false);
    }, 1000);
  };

  // Calculate completion count for Create New Batch (16 fields)
  const getCompletedBatchFieldsCount = () => {
    const fields = [
      !!batchNumber && batchNumber.trim() !== '',
      !!batchTitle && batchTitle.trim() !== '',
      !!tenYearBond && tenYearBond.trim() !== '',
      !!parRate && parRate.trim() !== '',
      !!category && category !== '' && category !== 'select',
      !!dataType && dataType !== '' && dataType !== 'select',
      !!delivery && delivery !== '' && delivery !== 'select',
      !!dataDate && dataDate.trim() !== '',
      !!dataSource && dataSource !== '' && dataSource !== 'select',
      !!printVendor && printVendor !== '' && printVendor !== 'select',
      !!mailVendor && mailVendor !== '' && mailVendor !== 'select',
      !!supplyVendor && supplyVendor !== '' && supplyVendor !== 'select',
      !!dataCost && dataCost.trim() !== '',
      !!mailCost && mailCost.trim() !== '',
      !!printCost && printCost.trim() !== '',
      !!supplyCost && supplyCost.trim() !== '',
      !!selectedStates && selectedStates.length > 0
    ];
    return fields.filter(Boolean).length;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Auto-format date with slashes as user types (MM/DD/YYYY)
  const handleDateFormat = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Format as MM/DD/YYYY
    let formatted = numbers;
    if (numbers.length >= 3) {
      formatted = numbers.slice(0, 2) + '/' + numbers.slice(2);
    }
    if (numbers.length >= 5) {
      formatted = numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
    }
    
    return formatted;
  };

  // Handle batch list sorting
  const handleBatchSort = (column: string) => {
    if (batchSortColumn === column) {
      setBatchSortDirection(batchSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setBatchSortColumn(column);
      setBatchSortDirection('asc');
    }
  };

  // Sorted batches for Batch List table
  const sortedBatches = useMemo(() => {
    // Combine mock batches with batches from localStorage
    const allBatches = [...mockBatches, ...batches];
    return allBatches.sort((a: any, b: any) => {
      let aVal: any;
      let bVal: any;

      if (batchSortColumn === 'createdDate') {
        aVal = new Date(a.createdDate).getTime();
        bVal = new Date(b.createdDate).getTime();
      } else if (batchSortColumn === 'records') {
        aVal = a.records;
        bVal = b.records;
      } else if (batchSortColumn === 'states') {
        aVal = a.states?.length || 0;
        bVal = b.states?.length || 0;
      } else if (batchSortColumn === 'cost') {
        aVal = (parseInt(a.dataCost) + parseInt(a.mailCost) + parseInt(a.printCost) + parseInt(a.supplyCost));
        bVal = (parseInt(b.dataCost) + parseInt(b.mailCost) + parseInt(b.printCost) + parseInt(b.supplyCost));
      } else if (batchSortColumn === 'tenYearBond' || batchSortColumn === 'parRate') {
        aVal = parseFloat(a[batchSortColumn] || '0');
        bVal = parseFloat(b[batchSortColumn] || '0');
      } else {
        aVal = (a[batchSortColumn] || '').toLowerCase();
        bVal = (b[batchSortColumn] || '').toLowerCase();
      }

      if (aVal < bVal) return batchSortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return batchSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [batchSortColumn, batchSortDirection, batches]);

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

  const handleTimeFilterDateInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    if (field === 'from') {
      setTimeFilterFromDate(value);
    } else {
      setTimeFilterToDate(value);
    }
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

  const handleAddExpense = async () => {
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
        const newExpenseId = expenseEntries.length + 1;
        setExpenseEntries([...expenseEntries, { ...newExpense, id: newExpenseId }]);
        
        // Transfer attachments from temp expense log to the new transaction
        try {
          const response = await fetch('/api/transactions/transfer-attachments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromTransactionId: tempExpenseLogId,
              toTransactionId: newExpenseId.toString(),
              transactionType: 'expense'
            })
          });
          
          if (!response.ok) {
            const error = await response.json();
            toast({
              title: "Attachment Transfer Failed",
              description: error.message || "Failed to transfer attachments to expense",
              variant: "destructive",
            });
          } else {
            // Invalidate attachment queries to refresh counts
            queryClient.invalidateQueries({ 
              queryKey: ['/api/transactions', 'expense', tempExpenseLogId, 'attachments'] 
            });
            queryClient.invalidateQueries({ 
              queryKey: ['/api/transactions', 'expense', newExpenseId.toString(), 'attachments'] 
            });
            
            // Show success toast
            const result = await response.json();
            if (result.success) {
              toast({
                title: "Expense Added",
                description: "Expense and attachments saved successfully",
              });
            }
            
            // Generate new temp ID for next expense
            setTempExpenseLogId(`temp-expense-${Date.now()}`);
          }
        } catch (error) {
          console.error('Error transferring attachments:', error);
          toast({
            title: "Attachment Transfer Error",
            description: "An error occurred while transferring attachments",
            variant: "destructive",
          });
        }
      }
      setNewExpense({
        logDate: '',
        expense: '',
        paidWith: '',
        expenseCategory: '',
        paidTo: '',
        transactionDate: '',
        clearanceDate: '',
        paymentTerm: '',
        notes: '',
        checkNumber: '',
        invoiceNumber: ''
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
      paymentTerm: expense.paymentTerm || '',
      notes: expense.notes || '',
      checkNumber: expense.checkNumber || '',
      invoiceNumber: expense.invoiceNumber || ''
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
        revenueTerm: '',
        notes: '',
        reference: '',
        checkNumber: ''
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
      revenueTerm: revenue.revenueTerm || '',
      notes: revenue.notes || '',
      reference: revenue.reference || '',
      checkNumber: revenue.checkNumber || ''
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
            <h1 className="text-xl font-black italic text-white" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }} data-testid="heading-analytics-dashboard">LOANVIEW GPT</h1>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu open={shortcutDropdownOpen} onOpenChange={setShortcutDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all"
                  data-testid="button-shortcut"
                >
                  <User className="h-5 w-5 text-purple-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
                {dashboardMenuItems.map((item, index) => (
                  <div key={item.path}>
                    <DropdownMenuItem
                      onClick={() => setLocation(item.path)}
                      className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                      data-testid={`shortcut-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.label}
                    </DropdownMenuItem>
                    {(index === 5 || index === 7) && <DropdownMenuSeparator className="bg-purple-500/30" />}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={handleScreenshare}
              disabled={screenshareLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all disabled:opacity-50"
              data-testid="button-screenshare"
            >
              <Monitor className={`h-4 w-4 text-purple-300 transition-transform duration-500 ${screenshareLoading ? 'animate-spin' : ''}`} />
              <span className="text-purple-200 text-sm">{screenshareLoading ? 'Starting...' : 'Screenshare'}</span>
            </button>
            
            {/* Time Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all"
                  data-testid="button-time-filter"
                >
                  <span className="text-purple-200 text-sm">
                    {timeFilter === 'today' && new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    {timeFilter === 'mtd' && 'MTD'}
                    {timeFilter === 'ytd' && 'YTD'}
                    {timeFilter === 'fromDate' && 'From Date'}
                    {timeFilter === 'toDate' && 'To Date'}
                    {timeFilter === 'compare' && 'Compare'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-purple-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
                <DropdownMenuItem
                  onClick={() => setTimeFilter('today')}
                  className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                  data-testid="option-today"
                >
                  Today ({new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })})
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeFilter('mtd')}
                  className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                  data-testid="option-mtd"
                >
                  MTD
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeFilter('ytd')}
                  className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                  data-testid="option-ytd"
                >
                  YTD
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeFilter('fromDate')}
                  className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                  data-testid="option-from-date"
                >
                  From Date
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeFilter('toDate')}
                  className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                  data-testid="option-to-date"
                >
                  To Date
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTimeFilter('compare')}
                  className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                  data-testid="option-compare"
                >
                  Compare
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Date input fields for From Date and To Date */}
            {timeFilter === 'fromDate' && (
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={timeFilterFromDate}
                onChange={(e) => handleTimeFilterDateInput(e, 'from')}
                className="bg-slate-700/50 text-white px-3 py-1 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm w-32"
                data-testid="input-time-filter-from-date"
                maxLength={10}
              />
            )}
            
            {timeFilter === 'toDate' && (
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={timeFilterToDate}
                onChange={(e) => handleTimeFilterDateInput(e, 'to')}
                className="bg-slate-700/50 text-white px-3 py-1 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm w-32"
                data-testid="input-time-filter-to-date"
                maxLength={10}
              />
            )}
            
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
              <span className="text-white text-sm">Add Entry</span>
            </button>
          </div>
        </div>

        {/* Top Card - Filters and Metrics */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">Performance</h3>
              <Filter className="w-5 h-5 text-purple-400" />
            </div>
            <button
              onClick={() => {
                if (showCreateBatch && isFiltersMinimized) {
                  setShowBatchWarning(true);
                } else {
                  setIsFiltersMinimized(!isFiltersMinimized);
                }
              }}
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

          {!isFiltersMinimized && (
            <>
              <DashboardFilters
                entityFilter={entityFilter}
                setEntityFilter={setEntityFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                teamFilter={teamFilter}
                setTeamFilter={setTeamFilter}
              />

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

        {/* Staff Form Cards - Only shown when Staff category is selected and Add Entry is clicked */}
        {categoryFilter === 'staff' && showStaffForm && (
          <>
            {/* Staff Information Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Staff</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={staffFirstName}
                    onChange={(e) => setStaffFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={staffLastName}
                    onChange={(e) => setStaffLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-purple-300">
                    <Phone className="w-4 h-4" />
                    Phone *
                  </label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-purple-300">
                    <Mail className="w-4 h-4" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Emergency</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Contact name"
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Scope & Permissions Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Role</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Payroll Type
                  </label>
                  <select 
                    value={payrollType}
                    onChange={(e) => setPayrollType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="w2">W2</option>
                    <option value="1099">1099</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Level
                  </label>
                  <select 
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="company">Company</option>
                    <option value="branch">Branch</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Role
                  </label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="mlo">MLO</option>
                    <option value="processor">Processor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Authorization
                  </label>
                  <select 
                    value={authorization}
                    onChange={(e) => setAuthorization(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="company">Company</option>
                    <option value="department">Department</option>
                    <option value="team">Team</option>
                    <option value="pipeline">Pipeline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Access
                  </label>
                  <select 
                    value={access}
                    onChange={(e) => setAccess(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="mlo">MLO</option>
                    <option value="processor">Processor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Special Access
                  </label>
                  <select 
                    value={specialAccess}
                    onChange={(e) => setSpecialAccess(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="team">Team</option>
                    <option value="department">Department</option>
                    <option value="company">Company</option>
                  </select>
                </div>
              </div>
            </div>

            {/* HR & Compliance Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Compliance</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-purple-300">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-purple-300">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-purple-300">
                    <Shield className="w-4 h-4" />
                    Background Check
                  </label>
                  <select 
                    value={backgroundCheck}
                    onChange={(e) => setBackgroundCheck(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    References
                  </label>
                  <select 
                    value={references}
                    onChange={(e) => setReferences(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Credit Review
                  </label>
                  <select 
                    value={creditReview}
                    onChange={(e) => setCreditReview(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Identification
                  </label>
                  <select 
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Work Authorization
                  </label>
                  <select 
                    value={workAuthorization}
                    onChange={(e) => setWorkAuthorization(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Drug Screening
                  </label>
                  <select 
                    value={drugScreening}
                    onChange={(e) => setDrugScreening(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Employment Agreement
                  </label>
                  <select 
                    value={employmentAgreement}
                    onChange={(e) => setEmploymentAgreement(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="signed">Signed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Policy
                  </label>
                  <select 
                    value={policy}
                    onChange={(e) => setPolicy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    NDA Agreement
                  </label>
                  <select 
                    value={ndaAgreement}
                    onChange={(e) => setNdaAgreement(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    Interview Grade
                  </label>
                  <select 
                    value={interviewGrade}
                    onChange={(e) => setInterviewGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="failed">Failed</option>
                    <option value="na">Not Applicable</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Second Card - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueSourcesChart
            categoryFilter={categoryFilter}
            revenueData={revenueData}
            directMailByState={directMailByState}
            loanProgramData={loanProgramData}
            areChartsMinimized={areChartsMinimized}
            setAreChartsMinimized={setAreChartsMinimized}
            revenueDetailView={revenueDetailView}
            setRevenueDetailView={setRevenueDetailView}
            formatCurrency={formatCurrency}
            CustomTooltip={CustomTooltip}
            showCreateBatch={showCreateBatch}
            onShowBatchWarning={() => setShowBatchWarning(true)}
          />

          <ExpenseBreakdownChart
            categoryFilter={categoryFilter}
            expenseData={expenseData}
            areChartsMinimized={areChartsMinimized}
            setAreChartsMinimized={setAreChartsMinimized}
            formatCurrency={formatCurrency}
            CustomTooltip={CustomTooltip}
            showCreateBatch={showCreateBatch}
            onShowBatchWarning={() => setShowBatchWarning(true)}
          />
        </div>

        {/* Query Card - Only shown when Direct Mail category is selected */}
        {categoryFilter === 'direct-mail' && (
          <TooltipProvider>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Query</h3>
                <TooltipComponent>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (showCreateBatch && isQueryCardMinimized) {
                          setShowBatchWarning(true);
                        } else {
                          setIsQueryCardMinimized(!isQueryCardMinimized);
                        }
                      }}
                      className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                      data-testid="button-toggle-query-card"
                    >
                      {isQueryCardMinimized ? <Plus className="h-4 w-4 text-purple-300" /> : <Minus className="h-4 w-4 text-purple-300" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isQueryCardMinimized ? 'Expand' : 'Minimize'}</p>
                  </TooltipContent>
                </TooltipComponent>
              </div>
              {!isQueryCardMinimized && (
                <div>
                  {/* Row 1 */}
                  <div className="grid grid-cols-5 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label className="text-purple-200">Data Category</Label>
                      <Select value={dataCategory} onValueChange={setDataCategory}>
                        <SelectTrigger data-testid="select-data-category" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Select">Select</SelectItem>
                          <SelectItem value="Show All">Show All</SelectItem>
                          <SelectItem value="Trigger Data">Trigger Data</SelectItem>
                          <SelectItem value="Monthly Data">Monthly Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">States</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal h-9 bg-slate-700/50 text-white border-purple-500/30 hover:border-purple-500 px-3 py-2 text-sm"
                            data-testid="button-query-states"
                          >
                            <span className="truncate">
                              {selectedQueryStates.length === 0
                                ? 'Select'
                                : selectedQueryStates.length === 1
                                ? selectedQueryStates[0]
                                : `${selectedQueryStates.length} selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-2 max-h-[400px] overflow-y-auto" align="start">
                          <div className="grid grid-cols-2 gap-1">
                            {US_STATES.map((state) => (
                              <div key={state.abbr}>
                                <div 
                                  className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-purple-500 hover:text-white transition-colors cursor-pointer"
                                  onClick={() => {
                                    const isChecked = selectedQueryStates.includes(state.abbr);
                                    if (isChecked) {
                                      setSelectedQueryStates(selectedQueryStates.filter(s => s !== state.abbr));
                                    } else {
                                      setSelectedQueryStates([...selectedQueryStates, state.abbr]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    id={`query-state-${state.abbr}`}
                                    checked={selectedQueryStates.includes(state.abbr)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedQueryStates([...selectedQueryStates, state.abbr]);
                                      } else {
                                        setSelectedQueryStates(selectedQueryStates.filter(s => s !== state.abbr));
                                      }
                                    }}
                                    data-testid={`checkbox-query-state-${state.abbr}`}
                                    className="pointer-events-none"
                                  />
                                  <label
                                    htmlFor={`query-state-${state.abbr}`}
                                    className="text-sm font-normal cursor-pointer flex-1 pointer-events-none"
                                  >
                                    {state.abbr}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Loan Category</Label>
                      <Select defaultValue="show-all">
                        <SelectTrigger data-testid="select-loan-category" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Show All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show-all">Show All</SelectItem>
                          <SelectItem value="va">VA</SelectItem>
                          <SelectItem value="va-jumbo">VA Jumbo</SelectItem>
                          <SelectItem value="conventional">Conventional</SelectItem>
                          <SelectItem value="conventional-jumbo">Conventional Jumbo</SelectItem>
                          <SelectItem value="fha">FHA</SelectItem>
                          <SelectItem value="second-loan">Second Loan</SelectItem>
                          <SelectItem value="non-qm">Non-QM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Loan Purpose</Label>
                      <Select defaultValue="show-all">
                        <SelectTrigger data-testid="select-loan-purpose" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Show All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show-all">Show All</SelectItem>
                          <SelectItem value="cash-out">Cash Out</SelectItem>
                          <SelectItem value="rate-term">Rate & Term</SelectItem>
                          <SelectItem value="purchase">Purchase</SelectItem>
                          <SelectItem value="streamline">Streamline</SelectItem>
                          <SelectItem value="irrrl">IRRRL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Property Use</Label>
                      <Select defaultValue="show-all">
                        <SelectTrigger data-testid="select-property-use" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Show All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show-all">Show All</SelectItem>
                          <SelectItem value="primary-residence">Primary Residence</SelectItem>
                          <SelectItem value="second-home">Second Home</SelectItem>
                          <SelectItem value="investment-property">Investment Property</SelectItem>
                          <SelectItem value="home-purchase">Home Purchase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-5 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label className="text-purple-200">Property Type</Label>
                      <Select defaultValue="show-all">
                        <SelectTrigger data-testid="select-property-type" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Show All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show-all">Show All</SelectItem>
                          <SelectItem value="single-family">Single Family</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="duplex-multi-family">Duplex, Multi-Family</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Lenders</Label>
                      <Select defaultValue="show-all">
                        <SelectTrigger data-testid="select-lenders" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Show All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show-all">Show All</SelectItem>
                          <SelectItem value="uwm">UWM</SelectItem>
                          <SelectItem value="pennymac">Pennymac</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Data Vendors</Label>
                      <Select defaultValue="show-all">
                        <SelectTrigger data-testid="select-data-vendors" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Show All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show-all">Show All</SelectItem>
                          <SelectItem value="in-house">In-House</SelectItem>
                          <SelectItem value="tbd">TBD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Mail Vendors</Label>
                      <Select defaultValue="show-all">
                        <SelectTrigger data-testid="select-mail-vendors" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Show All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show-all">Show All</SelectItem>
                          <SelectItem value="in-house">In-House</SelectItem>
                          <SelectItem value="tbd">TBD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Batch Activity To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between font-normal h-9 bg-slate-700/50 text-white border-purple-500/30 hover:border-purple-500 px-3 py-2 text-sm"
                            data-testid="button-batch-activity"
                          >
                            <span className="truncate">
                              {selectedBatchActivities.length === 0
                                ? 'Select'
                                : selectedBatchActivities.length === 1
                                ? selectedBatchActivities[0]
                                : `${selectedBatchActivities.length} selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-2" align="start">
                          <div>
                            {['Select', 'Lead', 'Quote', 'Loan Prep', 'Loan', 'Funded', 'Withdrawn', 'Cancelled'].map((activity) => (
                              <div key={activity}>
                                <div 
                                  className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-purple-500 hover:text-white transition-colors cursor-pointer mb-1"
                                  onClick={() => {
                                    const isChecked = selectedBatchActivities.includes(activity);
                                    if (isChecked) {
                                      setSelectedBatchActivities(selectedBatchActivities.filter(a => a !== activity));
                                    } else {
                                      setSelectedBatchActivities([...selectedBatchActivities, activity]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    id={`activity-${activity}`}
                                    checked={selectedBatchActivities.includes(activity)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedBatchActivities([...selectedBatchActivities, activity]);
                                      } else {
                                        setSelectedBatchActivities(selectedBatchActivities.filter(a => a !== activity));
                                      }
                                    }}
                                    data-testid={`checkbox-activity-${activity.toLowerCase().replace(' ', '-')}`}
                                    className="pointer-events-none"
                                  />
                                  <label
                                    htmlFor={`activity-${activity}`}
                                    className="text-sm font-normal cursor-pointer flex-1 pointer-events-none"
                                  >
                                    {activity}
                                  </label>
                                </div>
                                {(activity === 'Funded' || activity === 'Withdrawn') && (
                                  <div className="border-t border-border my-2" />
                                )}
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-5 gap-6">
                    <div className="space-y-2">
                      <Label className="text-purple-200">FICO Range Above</Label>
                      <Input
                        value={ficoRangeAbove}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
                          setFicoRangeAbove(value);
                        }}
                        placeholder=""
                        maxLength={3}
                        data-testid="input-fico-range"
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">10 Yr Bond Above</Label>
                      <Input
                        placeholder=""
                        data-testid="input-bond-above"
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Par Rate Above</Label>
                      <div className="flex items-center border border-purple-500/30 bg-slate-700/50 px-3 rounded-md h-9">
                        <Input
                          value={parRateAbove}
                          onChange={(e) => setParRateAbove(e.target.value)}
                          placeholder="0.00"
                          className="border-0 bg-transparent px-2 focus-visible:ring-0 h-auto text-white"
                          data-testid="input-par-rate-above"
                        />
                        <span className="text-purple-300 text-sm">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Cash Out Above</Label>
                      <CurrencyInput
                        value={cashOutAbove}
                        onChange={setCashOutAbove}
                        placeholder="$0"
                        id="cash-out-above"
                        dataTestId="input-cash-out-above"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Batch Results To Date</Label>
                      <div className="flex h-8 rounded-md overflow-hidden border border-purple-500/30">
                        <TooltipComponent>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setBatchResults('show-all')}
                              className="flex-1 flex items-center justify-center text-xs font-medium transition-all h-full text-white"
                              style={{ 
                                background: batchResults === 'show-all' 
                                  ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' 
                                  : '#475569'
                              }}
                              data-testid="button-batch-results-show-all"
                            >
                              {batchResults === 'show-all' && 'Show All'}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Show All</TooltipContent>
                        </TooltipComponent>
                        <TooltipComponent>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setBatchResults('profitable')}
                              className="flex-1 flex items-center justify-center text-xs font-medium transition-all h-full text-white border-x border-purple-500/30"
                              style={{ 
                                background: batchResults === 'profitable' 
                                  ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' 
                                  : '#475569'
                              }}
                              data-testid="button-batch-results-profitable"
                            >
                              {batchResults === 'profitable' && 'Profitable'}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Profitable</TooltipContent>
                        </TooltipComponent>
                        <TooltipComponent>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setBatchResults('loss')}
                              className="flex-1 flex items-center justify-center text-xs font-medium transition-all h-full text-white"
                              style={{ 
                                background: batchResults === 'loss' 
                                  ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' 
                                  : '#475569'
                              }}
                              data-testid="button-batch-results-loss"
                            >
                              {batchResults === 'loss' && 'Loss'}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Loss</TooltipContent>
                        </TooltipComponent>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TooltipProvider>
        )}

        {/* Batch List Table - Only shown when Data Category is "Show All" */}
        {categoryFilter === 'direct-mail' && dataCategory === 'Show All' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Batch List</h3>
            {sortedBatches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-purple-300">No batches created yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-max">
                  <thead>
                    <tr className="border-b border-purple-500/30">
                      <th 
                        className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
                        onClick={() => handleBatchSort('createdDate')}
                        data-testid="sort-date"
                      >
                        <div className="flex items-center gap-2">
                          Created
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
                        onClick={() => handleBatchSort('batchNumber')}
                        data-testid="sort-batch-number"
                      >
                        <div className="flex items-center gap-2">
                          Batch #
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
                        onClick={() => handleBatchSort('batchTitle')}
                        data-testid="sort-batch-title"
                      >
                        <div className="flex items-center gap-2">
                          Batch Title
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
                        onClick={() => handleBatchSort('category')}
                        data-testid="sort-category"
                      >
                        <div className="flex items-center gap-2">
                          Category
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
                        onClick={() => handleBatchSort('tenYearBond')}
                        data-testid="sort-ten-year-bond"
                      >
                        <div className="flex items-center gap-2">
                          10 Yr Bond
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
                        onClick={() => handleBatchSort('parRate')}
                        data-testid="sort-par-rate"
                      >
                        <div className="flex items-center gap-2">
                          Par Rate
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
                        onClick={() => handleBatchSort('records')}
                        data-testid="sort-records"
                      >
                        <div className="flex items-center gap-2">
                          Records
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
                        onClick={() => handleBatchSort('states')}
                        data-testid="sort-states"
                      >
                        <div className="flex items-center gap-2">
                          States
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 cursor-pointer hover:bg-slate-700 transition-colors whitespace-nowrap"
                        onClick={() => handleBatchSort('cost')}
                        data-testid="sort-cost"
                      >
                        <div className="flex items-center gap-2">
                          Total Cost
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="text-left p-3 font-semibold bg-slate-700/50 text-purple-200 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBatches.map((batch: any) => {
                      const totalCost = (parseInt(batch.dataCost) || 0) + (parseInt(batch.mailCost) || 0) + (parseInt(batch.printCost) || 0) + (parseInt(batch.supplyCost) || 0);
                      const stateCount = batch.states?.length || 0;
                      return (
                        <tr key={batch.id} className="border-b border-purple-500/20 hover:bg-slate-700/30 transition-colors">
                          <td className="p-3 text-white whitespace-nowrap">{batch.createdDate}</td>
                          <td className="p-3 text-purple-300 whitespace-nowrap">{batch.batchNumber}</td>
                          <td className="p-3 text-white whitespace-nowrap">{batch.batchTitle}</td>
                          <td className="p-3 text-purple-300 whitespace-nowrap">{batch.category}</td>
                          <td className="p-3 text-white whitespace-nowrap">{batch.tenYearBond}%</td>
                          <td className="p-3 text-white whitespace-nowrap">{batch.parRate}%</td>
                          <td className="p-3 text-purple-300 whitespace-nowrap">{(batch.records || 0).toLocaleString()}</td>
                          <td className="p-3 text-white whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedBatchStates(batch.states || []);
                                setShowStatesDialog(true);
                              }}
                              className="text-purple-400 hover:text-purple-300 underline cursor-pointer transition-colors"
                              data-testid={`states-count-${batch.id}`}
                            >
                              {stateCount}
                            </button>
                          </td>
                          <td className="p-3 text-green-400 whitespace-nowrap font-semibold">${totalCost.toLocaleString()}</td>
                          <td className="p-3 relative">
                            <button
                              onClick={() => setOpenBatchActionMenu(openBatchActionMenu === batch.id ? null : batch.id)}
                              className="text-purple-300 hover:text-white transition-colors"
                              data-testid={`button-batch-action-menu-${batch.id}`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {/* Action Menu Popup */}
                            {openBatchActionMenu === batch.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-slate-800 rounded-lg border border-purple-500/30 shadow-xl z-50 overflow-hidden">
                                <button
                                  onClick={() => handleDeleteBatch(batch.id)}
                                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 transition-colors"
                                  data-testid={`button-delete-batch-${batch.id}`}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Create New Batch Card - Only shown when Direct Mail category is selected and Add New Batch is clicked */}
        {categoryFilter === 'direct-mail' && showCreateBatch && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">New Batch</h3>
              <div className="flex items-center gap-3">
                <button className="px-3 min-h-8 text-xs font-medium rounded transition-all bg-gradient-to-r from-indigo-900 to-blue-900 text-white hover:from-indigo-800 hover:to-blue-800 shadow-md flex items-center">
                  {getCompletedBatchFieldsCount()} / 17 Fields
                </button>
                <Button 
                  onClick={() => setStatesDialogOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0"
                  data-testid="button-states-batch"
                >
                  {selectedStates.length > 0 ? `${selectedStates.length} States` : 'States'}
                </Button>
                <button
                  onClick={() => setCancelDialogOpen(true)}
                  className="text-purple-300 hover:text-white transition-colors"
                  data-testid="button-cancel-new-batch"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Completion Bar - 17 segments */}
            <div className="px-4 pb-2">
              <div className="relative flex gap-0 h-px">
                {Array.from({ length: 17 }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 transition-colors duration-300`}
                    style={{ backgroundColor: index < getCompletedBatchFieldsCount() ? 'rgb(168, 85, 247)' : '#D1D5DB' }}
                  />
                ))}
                {getCompletedBatchFieldsCount() > 0 && getCompletedBatchFieldsCount() < 17 && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: 'rgb(168, 85, 247)',
                      left: `calc(${(getCompletedBatchFieldsCount() / 17) * 100}% - 4px)`
                    }}
                  />
                )}
              </div>
            </div>
            
            <div className="pt-6">
              {/* Stage: Upload */}
              {uploadStage === 'upload' && (
                <div className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-purple-200">Batch Number</Label>
                      <Input
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                        placeholder=""
                        data-testid="input-batch-number-dm"
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Batch Title</Label>
                      <Input
                        value={batchTitle}
                        onChange={(e) => setBatchTitle(e.target.value)}
                        placeholder=""
                        data-testid="input-batch-title-dm"
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">10 Year Bond</Label>
                      <Input
                        value={tenYearBond}
                        onChange={(e) => setTenYearBond(e.target.value)}
                        placeholder=""
                        data-testid="input-ten-year-bond-dm"
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Par Rate</Label>
                      <Input
                        value={parRate}
                        onChange={(e) => setParRate(e.target.value)}
                        placeholder=""
                        data-testid="input-par-rate-dm"
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-purple-200">Loan Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger data-testid="select-category-dm" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="va">VA</SelectItem>
                          <SelectItem value="va-jumbo">VA Jumbo</SelectItem>
                          <SelectItem value="conventional">Conventional</SelectItem>
                          <SelectItem value="conventional-jumbo">Conventional Jumbo</SelectItem>
                          <SelectItem value="fha">FHA</SelectItem>
                          <SelectItem value="second-loan">Second Loan</SelectItem>
                          <SelectItem value="non-qm">Non-QM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Data Category</Label>
                      <Select value={dataType} onValueChange={setDataType}>
                        <SelectTrigger data-testid="select-data-type-dm" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="trigger">Trigger</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Delivery Speed</Label>
                      <Select value={delivery} onValueChange={setDelivery}>
                        <SelectTrigger data-testid="select-delivery-dm" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="first-class">First Class</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="bulk">Bulk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Duration to First Call</Label>
                      <Input
                        value={durationToFirstCall}
                        onChange={(e) => setDurationToFirstCall(e.target.value)}
                        placeholder=""
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                        data-testid="input-duration-first-call-dm"
                      />
                    </div>
                  </div>

                  {/* Third Row - Date Fields */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-purple-200">Data Date</Label>
                      <Input
                        value={dataDate}
                        onChange={(e) => setDataDate(handleDateFormat(e.target.value))}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-500"
                        data-testid="input-data-date-dm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Print Date</Label>
                      <Input
                        value={printDate}
                        onChange={(e) => setPrintDate(handleDateFormat(e.target.value))}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-500"
                        data-testid="input-print-date-dm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Mail Date</Label>
                      <Input
                        value={mailDate}
                        onChange={(e) => setMailDate(handleDateFormat(e.target.value))}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-500"
                        data-testid="input-mail-date-dm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">First Call</Label>
                      <Input
                        value={firstCallDate}
                        onChange={(e) => setFirstCallDate(handleDateFormat(e.target.value))}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-500"
                        data-testid="input-first-call-dm"
                      />
                    </div>
                  </div>

                  {/* Separation Line */}
                  <div className="h-4"></div>
                  <div style={{ borderTop: '1px solid rgba(168, 85, 247, 0.3)', paddingTop: '24px' }}>
                    {/* Fourth Row - Vendor Fields */}
                    <div className="grid grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label className="text-purple-200">Data Vendor</Label>
                        <Select value={dataSource} onValueChange={setDataSource}>
                          <SelectTrigger data-testid="select-data-source-dm" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="dlx">DLX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-200">Print Vendor</Label>
                        <Select value={printVendor} onValueChange={setPrintVendor}>
                          <SelectTrigger data-testid="select-print-vendor-dm" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="in-house">In House</SelectItem>
                            <SelectItem value="tbd">TBD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-200">Mail Vendor</Label>
                        <Select value={mailVendor} onValueChange={setMailVendor}>
                          <SelectTrigger data-testid="select-mail-vendor-dm" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="in-house">In House</SelectItem>
                            <SelectItem value="tbd">TBD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-200">Supply Vendor</Label>
                        <Select value={supplyVendor} onValueChange={setSupplyVendor}>
                          <SelectTrigger data-testid="select-supply-vendor-dm" className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">Select</SelectItem>
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
                      <Label className="text-purple-200">Data Cost</Label>
                      <CurrencyInput
                        value={dataCost}
                        onChange={setDataCost}
                        placeholder="$"
                        id="data-cost-dm"
                        dataTestId="input-data-cost-dm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Mail Cost</Label>
                      <CurrencyInput
                        value={mailCost}
                        onChange={setMailCost}
                        placeholder="$"
                        id="mail-cost-dm"
                        dataTestId="input-mail-cost-dm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Print Cost</Label>
                      <CurrencyInput
                        value={printCost}
                        onChange={setPrintCost}
                        placeholder="$"
                        id="print-cost-dm"
                        dataTestId="input-print-cost-dm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Supply Cost</Label>
                      <CurrencyInput
                        value={supplyCost}
                        onChange={setSupplyCost}
                        placeholder="$"
                        id="supply-cost-dm"
                        dataTestId="input-supply-cost-dm"
                      />
                    </div>
                  </div>

                  {/* Separation Line and Upload Box - Only show when completion bar is at 100% */}
                  {getCompletedBatchFieldsCount() === 17 && (
                    <div style={{ borderTop: '1px solid rgba(168, 85, 247, 0.3)', paddingTop: '24px' }}>
                      <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/60 transition-colors bg-slate-900/30">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="csv-upload-dm"
                          data-testid="input-csv-file-dm"
                        />
                        <label htmlFor="csv-upload-dm" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                          <p className="text-white mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-green-400">Upload Excel File Format (CSV UTF8) <span className="text-red-400">*</span></p>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stage: Column Mapping */}
              {uploadStage === 'mapping' && (
                <div className="space-y-6">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-start">
                      <FileText className="w-5 h-5 text-purple-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-purple-200">
                          We've auto-detected some matches. Please verify your CSV columns to required fields.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {requiredFields.map(field => (
                      <Card key={field.key} className="bg-slate-700/30 border-purple-500/20">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Label className="text-sm font-medium text-purple-200">
                                {field.label} <span className="text-red-400">*</span>
                              </Label>
                            </div>
                            {columnMapping[field.key] && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <Select
                            value={columnMapping[field.key]}
                            onValueChange={(value) => handleMappingChange(field.key, value)}
                          >
                            <SelectTrigger data-testid={`select-${field.key}-dm`} className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500">
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

                  <Card className="bg-purple-500/10 border-purple-500/20">
                    <CardContent className="pt-4">
                      <h4 className="text-sm font-medium text-purple-200 mb-2">Additional Columns</h4>
                      <p className="text-xs text-purple-300">
                        All other columns will be preserved: {detectedColumns.filter(col => !Object.values(columnMapping).includes(col)).join(', ') || 'None'}
                      </p>
                    </CardContent>
                  </Card>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-sm text-red-400">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleConfirmMapping} 
                      data-testid="button-continue-preview-dm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                    >
                      Continue to Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel} 
                      data-testid="button-cancel-mapping-dm"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
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
                      <h3 className="text-lg font-semibold text-white">Preview Mapped Data</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        data-testid="button-toggle-preview-dm"
                        className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                      >
                        {showPreview ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                        {showPreview ? 'Hide' : 'Show'} Preview
                      </Button>
                    </div>

                    {showPreview && (
                      <div className="overflow-x-auto border border-purple-500/30 rounded-lg">
                        <table className="min-w-full divide-y divide-purple-500/20">
                          <thead className="bg-purple-500/10">
                            <tr>
                              {requiredFields.map(field => (
                                <th key={field.key} className="px-4 py-3 text-left text-xs font-medium uppercase text-purple-200">
                                  {field.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-500/10">
                            {previewData.map((row, idx) => (
                              <tr key={idx}>
                                {requiredFields.map(field => (
                                  <td key={field.key} className="px-4 py-3 text-sm text-purple-100">
                                    {row[columnMapping[field.key]] || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <p className="text-sm text-purple-300 mt-3">
                      Showing first 5 of {csvData.length} records
                    </p>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-400">Ready to Create</p>
                        <p className="text-sm text-purple-200 mt-1">
                          Column mapping complete. Click Create Batch to save.
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-sm text-red-400">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleCreateBatch} 
                      data-testid="button-create-batch-dm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                    >
                      Create Batch
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel} 
                      data-testid="button-cancel-preview-dm"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expense Entry Form */}
        {showExpenseForm && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl animate-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Expense log</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExpenseLogAttachmentsDialog(true)}
                  className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Add Doc"
                  data-testid="button-expense-log-attachments"
                >
                  <Paperclip className="w-5 h-5 text-purple-300" />
                  <AttachmentCountBadge 
                    transactionId={tempExpenseLogId} 
                    transactionType="expense" 
                  />
                </button>
                <button
                  onClick={() => setShowExpenseNotesDialog(true)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Add Check#, Invoice, Notes"
                  data-testid="button-expense-notes"
                >
                  <FileText className="w-5 h-5 text-purple-300" />
                </button>
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
                      <th className="text-center text-purple-300 font-semibold py-3 px-2">
                        <Paperclip className="w-4 h-4 mx-auto" />
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
                        <td className="py-3 px-2 text-center">
                          <AttachmentIndicator 
                            transactionId={entry.id} 
                            transactionType="expense"
                            onOpenDialog={() => {
                              setSelectedTransaction({ id: entry.id, type: 'expense' });
                              setShowAttachmentsDialog(true);
                            }}
                          />
                        </td>
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
                            <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg border border-purple-500/30 shadow-xl z-50 overflow-hidden">
                              <button
                                onClick={() => {
                                  setSelectedTransaction({ id: entry.id, type: 'expense' });
                                  setShowAttachmentsDialog(true);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                                data-testid={`button-manage-attachments-${entry.id}`}
                              >
                                Attach Doc
                              </button>
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
                  onClick={() => setShowRevenueLogAttachmentsDialog(true)}
                  className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Add Doc"
                  data-testid="button-revenue-log-attachments"
                >
                  <Paperclip className="w-5 h-5 text-purple-300" />
                  <AttachmentCountBadge 
                    transactionId={tempRevenueLogId} 
                    transactionType="revenue" 
                  />
                </button>
                <button
                  onClick={() => setShowRevenueNotesDialog(true)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Add Note, Ref, Check#"
                  data-testid="button-revenue-notes"
                >
                  <FileText className="w-5 h-5 text-purple-300" />
                </button>
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
                      <th className="text-center text-purple-300 font-semibold py-3 px-2">
                        <Paperclip className="w-4 h-4 mx-auto" />
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
                        <td className="py-3 px-2 text-center">
                          <AttachmentIndicator 
                            transactionId={entry.id} 
                            transactionType="revenue"
                            onOpenDialog={() => {
                              setSelectedTransaction({ id: entry.id, type: 'revenue' });
                              setShowAttachmentsDialog(true);
                            }}
                          />
                        </td>
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
                            <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg border border-purple-500/30 shadow-xl z-50 overflow-hidden">
                              <button
                                onClick={() => {
                                  setSelectedTransaction({ id: entry.id, type: 'revenue' });
                                  setShowAttachmentsDialog(true);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                                data-testid={`button-revenue-manage-attachments-${entry.id}`}
                              >
                                Attach Doc
                              </button>
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
                {categoryFilter === 'financials' ? (
                  <>
                    <button
                      onClick={() => {
                        if (showExpenseForm) {
                          setConflictFormType('expense');
                          setShowFormConflictWarning(true);
                        } else {
                          setEntryType('revenue');
                          setShowRevenueForm(true);
                          setIsRevenueFormMinimized(false); // Ensure form is expanded when adding new revenue
                          setAreChartsMinimized(true); // Minimize charts to reduce clutter
                          setShowAddModal(false);
                        }
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
                        if (showRevenueForm) {
                          setConflictFormType('revenue');
                          setShowFormConflictWarning(true);
                        } else {
                          setEntryType('expense');
                          setShowExpenseForm(true);
                          setAreChartsMinimized(true); // Minimize charts to reduce clutter
                          setShowAddModal(false);
                        }
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
                  </>
                ) : categoryFilter === 'staff' ? (
                  <button
                    onClick={() => {
                      setShowStaffForm(true);
                      setIsFiltersMinimized(true); // Minimize Performance card
                      setAreChartsMinimized(true); // Minimize Charts
                      setShowAddModal(false);
                    }}
                    className="w-full p-6 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 hover:from-purple-500/30 hover:to-indigo-600/30 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all group"
                    data-testid="button-add-staff"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white mb-1">Add Staff Member</h3>
                        <p className="text-purple-300 text-sm">Add new employee to the team</p>
                      </div>
                      <User className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowCreateBatch(true);
                      setIsQueryCardMinimized(true); // Minimize Query card
                      setIsFiltersMinimized(true); // Minimize Performance card
                      setAreChartsMinimized(true); // Minimize Charts
                      setShowAddModal(false);
                    }}
                    className="w-full p-6 bg-gradient-to-br from-purple-500/20 to-pink-600/20 hover:from-purple-500/30 hover:to-pink-600/30 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all group"
                    data-testid="button-add-batch"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white mb-1">Add New Batch</h3>
                        <p className="text-purple-300 text-sm">Create new direct mail campaign</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </button>
                )}
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

        {/* Batch Warning Dialog */}
        <Dialog open={showBatchWarning} onOpenChange={setShowBatchWarning}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Batch Card Open</DialogTitle>
              <DialogDescription className="text-purple-200 pt-2">
                Please create or cancel the open batch card first
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setShowBatchWarning(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                data-testid="button-close-batch-warning"
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Form Conflict Warning Dialog */}
        <Dialog open={showFormConflictWarning} onOpenChange={setShowFormConflictWarning}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {conflictFormType === 'expense' ? 'Expense Log Open' : 'Revenue Log Open'}
              </DialogTitle>
              <DialogDescription className="text-purple-200 pt-2">
                Please complete or cancel the open {conflictFormType} card log
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setShowFormConflictWarning(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                data-testid="button-close-form-conflict-warning"
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* States Dialog - Shows list of states when count is clicked */}
        <Dialog open={showStatesDialog} onOpenChange={setShowStatesDialog}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Selected States</DialogTitle>
              <DialogDescription className="text-purple-200 pt-2">
                States included in this batch
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {selectedBatchStates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedBatchStates.map((state, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-md border border-purple-500/30"
                      data-testid={`state-badge-${state}`}
                    >
                      {state}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-purple-300">No states selected</p>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowStatesDialog(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                data-testid="button-close-states-dialog"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel New Batch Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Cancel new batch?</DialogTitle>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                data-testid="button-go-back"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                Go Back
              </Button>
              <Button
                onClick={() => {
                  setCancelDialogOpen(false);
                  resetForm();
                }}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
                data-testid="button-yes-cancel"
              >
                Yes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Incomplete Fields Warning Dialog */}
        <Dialog open={incompleteFieldsDialog} onOpenChange={setIncompleteFieldsDialog}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Incomplete Required Fields</DialogTitle>
            </DialogHeader>
            <p className="text-purple-200 pt-2">Please complete all 17 required fields (including States) before uploading a CSV file.</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => setIncompleteFieldsDialog(false)}
                data-testid="button-ok-incomplete-fields"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* No States Selected Warning Dialog */}
        <Dialog open={noStatesWarningDialog} onOpenChange={setNoStatesWarningDialog}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">No States Selected</DialogTitle>
            </DialogHeader>
            <p className="text-purple-200 pt-2">Please select at least one state before uploading a CSV file.</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => setNoStatesWarningDialog(false)}
                data-testid="button-ok-no-states"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* States Selection Dialog for Batch Creation */}
        <Dialog open={statesDialogOpen} onOpenChange={setStatesDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Select States for This Batch</DialogTitle>
              <DialogDescription className="text-purple-200 pt-2">
                Choose which states this batch covers. Selected: {selectedStates.length}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {US_STATES.map((state) => (
                <div key={state.abbr} className="flex items-center space-x-2">
                  <Checkbox
                    id={`batch-create-state-${state.abbr}`}
                    checked={selectedStates.includes(state.abbr)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStates([...selectedStates, state.abbr]);
                      } else {
                        setSelectedStates(selectedStates.filter(s => s !== state.abbr));
                      }
                    }}
                    data-testid={`checkbox-batch-state-${state.abbr}`}
                  />
                  <label
                    htmlFor={`batch-create-state-${state.abbr}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-purple-200"
                  >
                    {state.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setStatesDialogOpen(false)}
                data-testid="button-cancel-states"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStatesDialogOpen(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0"
                data-testid="button-confirm-states"
              >
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Batch Confirmation Dialog */}
        <Dialog open={showDeleteBatchModal} onOpenChange={setShowDeleteBatchModal}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Delete Batch?</DialogTitle>
            </DialogHeader>
            <p className="text-purple-200 pt-2">Are you sure you want to delete this batch? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteBatchModal(false)}
                data-testid="button-cancel-delete-batch"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteBatch}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
                data-testid="button-confirm-delete-batch"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Expense Notes Dialog */}
        <Dialog open={showExpenseNotesDialog} onOpenChange={setShowExpenseNotesDialog}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Expense Notes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="expense-notes" className="text-sm text-purple-200">Notes</Label>
                <textarea
                  id="expense-notes"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="Enter notes..."
                  rows={4}
                  className="w-full bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  data-testid="textarea-expense-notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check-number" className="text-sm text-purple-200">Check Number</Label>
                <Input
                  id="check-number"
                  value={newExpense.checkNumber}
                  onChange={(e) => setNewExpense({ ...newExpense, checkNumber: e.target.value })}
                  placeholder="Enter check number..."
                  className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                  data-testid="input-check-number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-number" className="text-sm text-purple-200">Invoice Number</Label>
                <Input
                  id="invoice-number"
                  value={newExpense.invoiceNumber}
                  onChange={(e) => setNewExpense({ ...newExpense, invoiceNumber: e.target.value })}
                  placeholder="Enter invoice number..."
                  className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                  data-testid="input-invoice-number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowExpenseNotesDialog(false)}
                data-testid="button-close-expense-notes"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attachments Dialog */}
        <AttachmentsDialog
          open={showAttachmentsDialog}
          onClose={() => {
            setShowAttachmentsDialog(false);
            setSelectedTransaction(null);
          }}
          transactionId={selectedTransaction?.id}
          transactionType={selectedTransaction?.type}
        />

        {/* Expense Log Attachments Dialog */}
        <AttachmentsDialog
          open={showExpenseLogAttachmentsDialog}
          onClose={() => setShowExpenseLogAttachmentsDialog(false)}
          transactionId={tempExpenseLogId}
          transactionType="expense"
        />

        {/* Revenue Notes Dialog */}
        <Dialog open={showRevenueNotesDialog} onOpenChange={setShowRevenueNotesDialog}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Revenue Notes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="revenue-notes" className="text-sm text-purple-200">Note</Label>
                <textarea
                  id="revenue-notes"
                  value={newRevenue.notes}
                  onChange={(e) => setNewRevenue({ ...newRevenue, notes: e.target.value })}
                  placeholder="Enter note..."
                  rows={4}
                  className="w-full bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  data-testid="textarea-revenue-notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue-reference" className="text-sm text-purple-200">Reference</Label>
                <Input
                  id="revenue-reference"
                  value={newRevenue.reference}
                  onChange={(e) => setNewRevenue({ ...newRevenue, reference: e.target.value })}
                  placeholder="Enter reference..."
                  className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                  data-testid="input-revenue-reference"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue-check-number" className="text-sm text-purple-200">Check #</Label>
                <Input
                  id="revenue-check-number"
                  value={newRevenue.checkNumber}
                  onChange={(e) => setNewRevenue({ ...newRevenue, checkNumber: e.target.value })}
                  placeholder="Enter check number..."
                  className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                  data-testid="input-revenue-check-number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowRevenueNotesDialog(false)}
                data-testid="button-close-revenue-notes"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Revenue Log Attachments Dialog */}
        <AttachmentsDialog
          open={showRevenueLogAttachmentsDialog}
          onClose={() => setShowRevenueLogAttachmentsDialog(false)}
          transactionId={tempRevenueLogId}
          transactionType="revenue"
        />
      </div>
    </div>
  );
}

function AttachmentIndicator({ 
  transactionId, 
  transactionType,
  onOpenDialog
}: { 
  transactionId: string | number; 
  transactionType: 'expense' | 'revenue';
  onOpenDialog: () => void;
}) {
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['/api/transactions', transactionType, transactionId, 'attachments'],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${transactionId}/attachments?transactionType=${transactionType}`);
      if (!res.ok) throw new Error('Failed to fetch attachments');
      const result = await res.json();
      return result.data || [];
    },
  });

  if (isLoading) return null;
  if (attachments.length === 0) return null;
  
  return (
    <button
      onClick={onOpenDialog}
      className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer font-semibold"
      data-testid={`button-attachment-indicator-${transactionId}`}
      title={`${attachments.length} attachment${attachments.length > 1 ? 's' : ''}`}
    >
      {attachments.length}
    </button>
  );
}

function AttachmentCountBadge({ 
  transactionId, 
  transactionType 
}: { 
  transactionId: string | number; 
  transactionType: 'expense' | 'revenue';
}) {
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['/api/transactions', transactionType, transactionId, 'attachments'],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${transactionId}/attachments?transactionType=${transactionType}`);
      if (!res.ok) throw new Error('Failed to fetch attachments');
      const result = await res.json();
      return result.data || [];
    },
  });

  if (isLoading) return null;
  if (attachments.length === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
      {attachments.length}
    </div>
  );
}

function AttachmentsDialog({ 
  open, 
  onClose, 
  transactionId, 
  transactionType 
}: { 
  open: boolean; 
  onClose: () => void; 
  transactionId?: string | number; 
  transactionType?: 'expense' | 'revenue';
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Query to fetch attachments
  const { data: attachments = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/transactions', transactionType, transactionId, 'attachments'],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${transactionId}/attachments?transactionType=${transactionType}`);
      if (!res.ok) throw new Error('Failed to fetch attachments');
      const result = await res.json();
      return result.data || [];
    },
    enabled: open && !!transactionId,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('transactionType', transactionType || 'expense');

      const res = await fetch(`/api/transactions/${transactionId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/transactions', transactionType, transactionId, 'attachments'] 
      });
      setUploadError(null);
    },
    onError: (error: Error) => {
      setUploadError(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await fetch(`/api/transactions/${transactionId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/transactions', transactionType, transactionId, 'attachments'] 
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const startCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setUploadError('Camera not supported in this browser. Try opening in a new window.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Use rear camera on mobile
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
        setUploadError(null);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Camera permission denied. Try opening this page in a new browser tab.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera constraints not supported.';
      } else if (error.name === 'SecurityError') {
        errorMessage += 'Camera blocked due to security settings. Open in a new window.';
      } else {
        errorMessage += 'Please check permissions or open in a new browser tab.';
      }
      
      setUploadError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(videoRef.current, 0, 0);

    // Convert canvas to blob
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;

      // Create a file from the blob
      const file = new File([blob], `invoice-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Upload the captured photo
      uploadMutation.mutate(file);
      
      // Stop camera
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  // Cleanup: Stop camera when dialog closes
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
    if (fileType.includes('image')) return <FileText className="w-5 h-5 text-blue-400" />;
    return <Paperclip className="w-5 h-5 text-purple-400" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Manage Attachments
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Camera View */}
          {isCameraOpen ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                  data-testid="camera-preview"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={capturePhoto}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  data-testid="button-capture-photo"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  data-testid="button-cancel-camera"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Upload Options */}
              <div className="grid grid-cols-2 gap-4">
                {/* Upload Dropzone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
                    ${isDragging 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-purple-500/30 hover:border-purple-500/50'
                    }
                  `}
                  onClick={() => document.getElementById('file-upload')?.click()}
                  data-testid="dropzone-attachment-upload"
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    data-testid="input-file-upload"
                  />
                  
                  <Upload className="w-10 h-10 mx-auto mb-3 text-purple-300" />
                  <p className="text-white font-medium mb-1 text-sm">
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
                  </p>
                  <p className="text-xs text-purple-300">
                    PDF, JPG, PNG
                  </p>
                </div>

                {/* Camera Option */}
                <div
                  onClick={startCamera}
                  className="border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer border-purple-500/30 hover:border-purple-500/50"
                  data-testid="button-open-camera"
                >
                  <Camera className="w-10 h-10 mx-auto mb-3 text-purple-300" />
                  <p className="text-white font-medium mb-1 text-sm">
                    Take Photo
                  </p>
                  <p className="text-xs text-purple-300">
                    Scan invoice
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 text-sm">{uploadError}</p>
              </div>
              {uploadError.includes('new') && (
                <Button
                  onClick={() => window.open(window.location.href, '_blank')}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 w-full"
                  data-testid="button-open-new-window"
                >
                  Open in New Window
                </Button>
              )}
            </div>
          )}

          {/* Attachments List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-purple-200 mb-3">
              Attached Files ({attachments.length})
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : attachments.length === 0 ? (
              <div className="text-center py-8 text-purple-300">
                No attachments yet
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {attachments.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between hover:bg-slate-700/70 transition-colors"
                    data-testid={`attachment-item-${attachment.id}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(attachment.fileType)}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{attachment.fileName}</p>
                        <p className="text-purple-300 text-xs">
                          {formatFileSize(attachment.fileSize)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/api/transactions/${transactionId}/attachments/${attachment.id}/view`, '_blank')}
                        data-testid={`button-view-${attachment.id}`}
                        className="text-purple-300 hover:text-white"
                        title="View in new tab"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(attachment.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-attachment-${attachment.id}`}
                        className="text-red-400 hover:text-red-300"
                        title="Delete attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="button-close-attachments"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
