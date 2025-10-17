import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Filter, ArrowLeft, Plus, X, ArrowUpDown, Minus, MoreVertical, User, Users, Monitor, ChevronDown, ChevronUp, Upload, CheckCircle, AlertCircle, FileText, Paperclip, Download, Trash2, Camera, Phone, Mail, Briefcase, Calendar, Shield, Search, Stamp, HardHat } from 'lucide-react';
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
  const [categoryFilter, setCategoryFilter] = useState('select');
  const [teamFilter, setTeamFilter] = useState('show-all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [timeFilterFromDate, setTimeFilterFromDate] = useState('');
  const [timeFilterToDate, setTimeFilterToDate] = useState('');
  const [revenueDetailView, setRevenueDetailView] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [entryType, setEntryType] = useState<string | null>(null);
  const [showExpenseNotesDialog, setShowExpenseNotesDialog] = useState(false);
  const [showRevenueNotesDialog, setShowRevenueNotesDialog] = useState(false);
  const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<{ id: string | number; type: 'expense' | 'revenue' | 'staff' } | null>(null);
  const [showExpenseLogAttachmentsDialog, setShowExpenseLogAttachmentsDialog] = useState(false);
  const [showRevenueLogAttachmentsDialog, setShowRevenueLogAttachmentsDialog] = useState(false);
  const [showStaffAttachmentsDialog, setShowStaffAttachmentsDialog] = useState(false);
  const [showBatchAttachmentsDialog, setShowBatchAttachmentsDialog] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [tempExpenseLogId, setTempExpenseLogId] = useState(() => `temp-expense-${Date.now()}`);
  const [tempRevenueLogId, setTempRevenueLogId] = useState(() => `temp-revenue-${Date.now()}`);
  const [tempStaffId, setTempStaffId] = useState(() => `temp-staff-${Date.now()}`);
  const [shortcutDropdownOpen, setShortcutDropdownOpen] = useState(false);
  const [screenshareLoading, setScreenshareLoading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [isSearchMinimized, setIsSearchMinimized] = useState(false);
  
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
  
  // Staff Search form state
  const [searchArea, setSearchArea] = useState('');
  const [searchMagnify, setSearchMagnify] = useState('');
  const [searchRating, setSearchRating] = useState('');
  const [searchPerformance, setSearchPerformance] = useState('');
  const [searchWithCompany, setSearchWithCompany] = useState('');
  const [searchCompensation, setSearchCompensation] = useState('');
  const [searchEarnings, setSearchEarnings] = useState('');
  const [searchBonus, setSearchBonus] = useState('');
  const [searchLicenseCount, setSearchLicenseCount] = useState('');
  const [searchLoanVolume, setSearchLoanVolume] = useState('');
  const [searchFundingVolume, setSearchFundingVolume] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [staffSortConfig, setStaffSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  // Marketing search state (Query card - Direct Mail)
  const [selectedQueryStates, setSelectedQueryStates] = useState<string[]>([]);
  const [selectedBatchActivities, setSelectedBatchActivities] = useState<string[]>([]);
  const [cashOutAbove, setCashOutAbove] = useState('');
  const [ficoRangeAbove, setFicoRangeAbove] = useState('');
  const [parRateAbove, setParRateAbove] = useState('');
  const [dataCategory, setDataCategory] = useState('Select');
  const [batchResults, setBatchResults] = useState<'' | 'profitable' | 'loss'>('');

  // Performance card title state
  const [performanceCardTitle, setPerformanceCardTitle] = useState('Prime Rate');

  // Vendor Add state (Add Vendor card)
  const [showVendorSearch, setShowVendorSearch] = useState(false);
  const [isVendorSearchMinimized, setIsVendorSearchMinimized] = useState(false);
  const [addVendorData, setAddVendorData] = useState({
    businessName: '', website: '', phone: '', email: '', services: '', state: '',
    internalRating: '', onlineRating: '', ratingSource: '', contact: '', position: '',
    latestQuote: '', clientServiced: '', clientPhone: '', dateOfService: '', streetAddress: ''
  });
  
  // Vendor Search state (Search card from magnifying glass)
  const [showVendorSearchCard, setShowVendorSearchCard] = useState(false);
  const [isVendorSearchCardMinimized, setIsVendorSearchCardMinimized] = useState(false);
  const [vendorSearchParams, setVendorSearchParams] = useState({
    businessName: '', website: '', phone: '', email: '', services: '', state: '',
    internalRating: '', onlineRating: '', ratingSource: '', contact: '', position: '',
    latestQuote: '', clientServiced: '', clientPhone: '', dateOfService: '', streetAddress: ''
  });
  const [vendorSortConfig, setVendorSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [showVendorWarning, setShowVendorWarning] = useState(false);
  const [showVendorTeamWarning, setShowVendorTeamWarning] = useState(false);
  const [showVendorResults, setShowVendorResults] = useState(false);
  const [visibleVendorColumns, setVisibleVendorColumns] = useState<string[]>(['all']);
  
  // Vendor data (now stateful so it can be updated)
  const [vendors, setVendors] = useState([
    { id: 1, businessName: 'ABC Inspection Services', website: 'www.abcinspection.com', phone: '(555) 123-4567',
      email: 'info@abcinspection.com', services: 'Property Inspection', state: 'CA', internalRating: '5 Stars',
      onlineRating: '4 Stars', ratingSource: 'Google', contactName: 'Mike Johnson', position: 'Manager',
      latestQuote: '$450', clientServiced: 'John Smith', clientPhone: '(555) 987-6543',
      dateOfService: '10/01/2024', streetAddress: '123 Main St' },
    { id: 2, businessName: 'Premier Appraisal Group', website: 'www.premierappraisal.com', phone: '(555) 234-5678',
      email: 'contact@premierappraisal.com', services: 'Appraisal', state: 'TX', internalRating: '4 Stars',
      onlineRating: '5 Stars', ratingSource: 'Yelp', contactName: 'Lisa Anderson', position: 'Lead Appraiser',
      latestQuote: '$650', clientServiced: 'Sarah Davis', clientPhone: '(555) 876-5432',
      dateOfService: '10/05/2024', streetAddress: '456 Oak Ave' },
    { id: 3, businessName: 'Quality WDO Solutions', website: 'www.qualitywdo.com', phone: '(555) 345-6789',
      email: 'service@qualitywdo.com', services: 'WDO', state: 'FL', internalRating: '5 Stars',
      onlineRating: '5 Stars', ratingSource: 'BBB', contactName: 'Tom Martinez', position: 'Inspector',
      latestQuote: '$300', clientServiced: 'Robert Wilson', clientPhone: '(555) 765-4321',
      dateOfService: '10/08/2024', streetAddress: '789 Pine Rd' }
  ]);

  // Staff search field configuration - maps search fields to table columns
  const staffFieldConfig = [
    { key: 'area', label: 'Area', searchValue: searchArea, isDropdown: true },
    { key: 'role', label: 'Role', searchValue: searchMagnify, isDropdown: true },
    { key: 'rating', label: 'Rating', searchValue: searchRating, isDropdown: true },
    { key: 'performance', label: 'Performance', searchValue: searchPerformance, isDropdown: true },
    { key: 'status', label: 'Status', searchValue: searchBonus, isDropdown: true },
    { key: 'duration', label: 'Duration', searchValue: searchWithCompany, isDropdown: true },
    { key: 'category', label: 'Category', searchValue: searchCompensation, isDropdown: true },
    { key: 'earnings', label: 'Earnings', searchValue: searchEarnings, isDropdown: false },
    { key: 'licenseCount', label: 'License Count', searchValue: searchLicenseCount, isDropdown: false },
    { key: 'loanVolume', label: 'Loan Volume', searchValue: searchLoanVolume, isDropdown: false },
    { key: 'fundingVolume', label: 'Funding Volume', searchValue: searchFundingVolume, isDropdown: false },
  ];

  // Compute active columns based on search criteria
  const activeStaffColumns = useMemo(() => {
    // Always include Last Name and First Name
    const columns = [
      { key: 'lastName', label: 'Last Name' },
      { key: 'firstName', label: 'First Name' }
    ];
    
    // Add columns that have active search criteria
    staffFieldConfig.forEach(field => {
      if (field.isDropdown) {
        // For dropdowns, check if value is not empty (not "Select")
        if (field.searchValue && field.searchValue !== '') {
          columns.push({ key: field.key, label: field.label });
        }
      } else {
        // For input fields, check if there's any value
        if (field.searchValue && field.searchValue.toString().trim() !== '') {
          columns.push({ key: field.key, label: field.label });
        }
      }
    });
    
    return columns;
  }, [searchArea, searchMagnify, searchRating, searchPerformance, searchBonus, searchWithCompany, searchCompensation, searchEarnings, searchLicenseCount, searchLoanVolume, searchFundingVolume]);

  // Compute active batch columns based on search criteria
  const activeBatchColumns = useMemo(() => {
    // Always include default columns
    const columns = [
      { key: 'createdDate', label: 'Created' },
      { key: 'batchNumber', label: 'Batch #' },
      { key: 'batchTitle', label: 'Batch Title' },
      { key: 'records', label: 'Records' },
      { key: 'cost', label: 'Total Cost' }
    ];
    
    // Batch search field configuration - inline to avoid initialization issues
    const batchFieldConfig = [
      { key: 'dataCategory', label: 'Data Category', searchValue: dataCategory, isDropdown: true },
      { key: 'states', label: 'States', searchValue: selectedQueryStates.length > 0 ? selectedQueryStates.join(', ') : '', isDropdown: true },
      { key: 'loanCategory', label: 'Loan Category', searchValue: '', isDropdown: true },
      { key: 'loanPurpose', label: 'Loan Purpose', searchValue: '', isDropdown: true },
      { key: 'propertyUse', label: 'Property Use', searchValue: '', isDropdown: true },
      { key: 'propertyType', label: 'Property Type', searchValue: '', isDropdown: true },
      { key: 'lenders', label: 'Lenders', searchValue: '', isDropdown: true },
      { key: 'dataVendors', label: 'Data Vendors', searchValue: '', isDropdown: true },
      { key: 'mailVendors', label: 'Mail Vendors', searchValue: '', isDropdown: true },
      { key: 'batchActivity', label: 'Batch Activity To Date', searchValue: selectedBatchActivities.length > 0 ? selectedBatchActivities.join(', ') : '', isDropdown: true },
      { key: 'ficoRange', label: 'FICO Range Above', searchValue: ficoRangeAbove, isDropdown: false },
      { key: 'tenYearBond', label: '10 Yr Bond Above', searchValue: '', isDropdown: false },
      { key: 'parRate', label: 'Par Rate Above', searchValue: parRateAbove, isDropdown: false },
      { key: 'cashOut', label: 'Cash Out Above', searchValue: cashOutAbove, isDropdown: false },
      { key: 'batchFinancials', label: 'Batch Financials', searchValue: batchResults, isDropdown: true },
    ];
    
    // Add columns that have active search criteria
    batchFieldConfig.forEach(field => {
      if (field.isDropdown) {
        // For dropdowns, check if value is not empty and not "Select"
        if (field.searchValue && field.searchValue !== '' && field.searchValue !== 'Select') {
          columns.push({ key: field.key, label: field.label });
        }
      } else {
        // For input fields, check if there's any value
        if (field.searchValue && field.searchValue.toString().trim() !== '') {
          columns.push({ key: field.key, label: field.label });
        }
      }
    });
    
    // Note: Paperclip and Actions columns are rendered separately as icon columns, not included in this array
    
    return columns;
  }, [dataCategory, selectedQueryStates, selectedBatchActivities, ficoRangeAbove, parRateAbove, cashOutAbove, batchResults]);

  // Mock staff data for search results
  const mockStaffData = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Smith',
      area: 'Company',
      role: 'MLO',
      rating: 'Review',
      performance: '+25%',
      status: 'Active',
      duration: '5 years',
      category: 'W2',
      earnings: 145000,
      licenseCount: 3,
      loanVolume: 127,
      fundingVolume: 32500000
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      area: 'Branch',
      role: 'Processor',
      rating: 'Attendance',
      performance: '+42%',
      status: 'Active',
      duration: '3 years',
      category: '1099',
      earnings: 98000,
      licenseCount: 2,
      loanVolume: 89,
      fundingVolume: 18750000
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Chen',
      area: 'Region',
      role: 'MLO',
      rating: 'Review',
      performance: '+18%',
      status: 'Active',
      duration: '7 years',
      category: 'W2',
      earnings: 167000,
      licenseCount: 5,
      loanVolume: 156,
      fundingVolume: 45200000
    },
    {
      id: 4,
      firstName: 'Emily',
      lastName: 'Davis',
      area: 'Partner',
      role: 'Team',
      rating: 'Review',
      performance: '+33%',
      status: 'Paused',
      duration: '2 years',
      category: 'W2',
      earnings: 112000,
      licenseCount: 1,
      loanVolume: 98,
      fundingVolume: 24300000
    },
    {
      id: 5,
      firstName: 'Robert',
      lastName: 'Martinez',
      area: 'District',
      role: 'MLO',
      rating: 'Attendance',
      performance: '-8%',
      status: 'Active',
      duration: '1 year',
      category: '1099',
      earnings: 78000,
      licenseCount: 2,
      loanVolume: 54,
      fundingVolume: 12100000
    },
    {
      id: 6,
      firstName: 'Jennifer',
      lastName: 'Wilson',
      area: 'State',
      role: 'Processor',
      rating: 'Review',
      performance: '+51%',
      status: 'Active',
      duration: '4 years',
      category: 'W2',
      earnings: 128000,
      licenseCount: 4,
      loanVolume: 142,
      fundingVolume: 38900000
    },
    {
      id: 7,
      firstName: 'David',
      lastName: 'Brown',
      area: 'City',
      role: 'MLO',
      rating: 'Attendance',
      performance: '+15%',
      status: 'Not Active',
      duration: '8 years',
      category: '1099',
      earnings: 189000,
      licenseCount: 6,
      loanVolume: 198,
      fundingVolume: 52300000
    }
  ];

  const [isRevenueFormMinimized, setIsRevenueFormMinimized] = useState(false);
  const [isExpenseTableMinimized, setIsExpenseTableMinimized] = useState(false);
  const [areChartsMinimized, setAreChartsMinimized] = useState(false);
  const [isTransactionsMinimized, setIsTransactionsMinimized] = useState(false);
  const [showTransactionsCard, setShowTransactionsCard] = useState(false); // Only show when Search has values
  const [showRevenueTransactionsCard, setShowRevenueTransactionsCard] = useState(false); // Only show when Revenue Search has values
  const [isRevenueTransactionsMinimized, setIsRevenueTransactionsMinimized] = useState(false);
  const [visibleTransactionColumns, setVisibleTransactionColumns] = useState<string[]>(['all']);
  const [visibleRevenueColumns, setVisibleRevenueColumns] = useState<string[]>(['all']);
  const [isFiltersMinimized, setIsFiltersMinimized] = useState(false); // Always start expanded
  const [areStaffCardsMinimized, setAreStaffCardsMinimized] = useState(false);
  const [isStaffResultsMinimized, setIsStaffResultsMinimized] = useState(false);
  const [isBatchListMinimized, setIsBatchListMinimized] = useState(false);
  const [isPrimeRateMinimized, setIsPrimeRateMinimized] = useState(true); // Minimized when Team = "Select"
  const [showBatchList, setShowBatchList] = useState(false); // Start hidden, shown only after search
  const [transactionDateFilter, setTransactionDateFilter] = useState('today');
  
  // Auto-minimize/expand Performance card and Prime Rate card based on Category and Team selection
  useEffect(() => {
    // Performance card logic - keep expanded for Vendor with Show All, minimize for Vendor with specific teams
    if (categoryFilter === 'vendor') {
      if (teamFilter === 'show-all') {
        setIsFiltersMinimized(false); // Keep expanded when Vendor + Show All
      } else {
        setIsFiltersMinimized(true); // Minimize when Vendor + specific team
      }
    } else if (categoryFilter === 'staff' || categoryFilter === 'marketing' || categoryFilter === 'financials') {
      setIsFiltersMinimized(false);
    }
    // Note: 'select' category keeps whatever state it has (starts expanded by default)
    
    // Prime Rate card logic (Staff category with MLO team only)
    if (categoryFilter === 'staff' && teamFilter === 'mlo') {
      setIsPrimeRateMinimized(false);
    }
    
    // Staff Search card logic - DON'T auto-show, user must click magnifying glass
    if (categoryFilter === 'staff') {
      // Always hide Search card when Team changes - user must manually open via magnifying glass
      setShowStaffSearch(false);
    }
    
    // Marketing Search card logic - DON'T auto-show, user must click magnifying glass
    if (categoryFilter === 'marketing') {
      // Always hide Search card when Team changes - user must manually open via magnifying glass
      setShowQueryCard(false);
      // Also hide Batch List when Team changes
      setShowBatchList(false);
    }
    
    // Financials Search card logic - only show when Team is "Expense", hide otherwise
    if (categoryFilter === 'financials') {
      if (teamFilter === 'expense-add') {
        // Keep expense search card visible only when Expense is selected
        // Hide revenue search when switching to expense
        setShowRevenueSearch(false);
      } else if (teamFilter === 'revenue-add') {
        // Keep revenue search card visible only when Revenue is selected
        // Hide expense search when switching to revenue
        setShowFinancialsSearch(false);
      } else {
        // Hide both search cards when Team is not "Expense" or "Revenue"
        setShowFinancialsSearch(false);
        setShowRevenueSearch(false);
      }
    }
  }, [teamFilter, categoryFilter]);
  
  // Query card state variables (only shown when categoryFilter is 'marketing' and teamFilter is not 'select')
  const [isQueryCardMinimized, setIsQueryCardMinimized] = useState(false);
  const [showQueryCard, setShowQueryCard] = useState(false); // Start hidden when Team = "Select"
  const [showBatchWarning, setShowBatchWarning] = useState(false);
  
  // Staff search card state
  const [showStaffSearch, setShowStaffSearch] = useState(false); // Start hidden when Team = "Select"
  const [showStaffWarning, setShowStaffWarning] = useState(false);
  const [showFormConflictWarning, setShowFormConflictWarning] = useState(false);
  const [conflictFormType, setConflictFormType] = useState<'expense' | 'revenue'>('expense');
  
  // Financials search card state (Expense)
  const [showFinancialsSearch, setShowFinancialsSearch] = useState(false);
  const [isFinancialsSearchMinimized, setIsFinancialsSearchMinimized] = useState(false);
  const [financialsSearchParams, setFinancialsSearchParams] = useState({
    logDate: '',
    transactionDate: '',
    clearDate: '',
    amount: '',
    payee: '',
    paymentFor: '',
    invoiceNum: '',
    checkNum: '',
    paymentMethod: '',
    paymentTerm: '',
    vendor: '',
    area: '',
    // Legacy fields (may be used elsewhere)
    date: '',
    services: '',
    role: ''
  });
  
  // Revenue search card state
  const [showRevenueSearch, setShowRevenueSearch] = useState(false);
  const [isRevenueSearchMinimized, setIsRevenueSearchMinimized] = useState(false);
  const [revenueSearchParams, setRevenueSearchParams] = useState({
    paymentDate: '',
    source: '',
    amount: '',
    referenceNum: '',
    paymentMethod: '',
    purpose: '',
    term: '',
    status: ''
  });
  
  // Batch List sorting state
  const [batchSortColumn, setBatchSortColumn] = useState<string>('createdDate');
  const [batchSortDirection, setBatchSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showStatesDialog, setShowStatesDialog] = useState(false);
  const [selectedBatchStates, setSelectedBatchStates] = useState<string[]>([]);
  
  // Create New Batch card state (only shown when categoryFilter is 'marketing' and teamFilter is 'direct-mail')
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
    invoiceNumber: '',
    area: '',
    payee: ''
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

  // Mock batch data for Batch List table (empty - batches come from localStorage or user creation)
  const mockBatches: any[] = [];

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

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/admin/logout');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation('/');
    } catch (error) {
      // Even if logout fails, redirect to home page
      setLocation('/');
    }
  };

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

  // Sorted staff data for search results
  const sortedStaffData = useMemo(() => {
    if (!staffSortConfig.key) return mockStaffData;
    
    return [...mockStaffData].sort((a: any, b: any) => {
      const aValue = a[staffSortConfig.key!];
      const bValue = b[staffSortConfig.key!];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return staffSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue < bValue) {
        return staffSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return staffSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [staffSortConfig, mockStaffData]);

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

  const handleSearchCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'earnings' | 'bonus' | 'fundingVolume') => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const numValue = parseInt(value);
      const formatted = numValue.toLocaleString('en-US');
      if (field === 'earnings') setSearchEarnings(formatted);
      else if (field === 'bonus') setSearchBonus(formatted);
      else if (field === 'fundingVolume') setSearchFundingVolume(formatted);
    } else {
      if (field === 'earnings') setSearchEarnings('');
      else if (field === 'bonus') setSearchBonus('');
      else if (field === 'fundingVolume') setSearchFundingVolume('');
    }
  };

  const handleStaffSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (staffSortConfig.key === key && staffSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setStaffSortConfig({ key, direction });
  };

  const handleSearchStaff = () => {
    setShowSearchResults(true);
    console.log('Search Staff clicked with params:', {
      searchArea,
      searchMagnify,
      searchRating,
      searchPerformance,
      searchWithCompany,
      searchCompensation,
      searchEarnings,
      searchBonus,
      searchLicenseCount,
      searchLoanVolume,
      searchFundingVolume
    });
  };

  // Vendor handler functions
  const handleVendorPhoneInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'clientPhone') => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) value = value;
    else if (value.length <= 6) value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
    else if (value.length <= 10) value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6);
    else value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6, 10);
    setVendorSearchParams({ ...vendorSearchParams, [field]: value });
  };

  const handleVendorCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) value = parseInt(value).toLocaleString('en-US');
    else value = '';
    setVendorSearchParams({ ...vendorSearchParams, latestQuote: value });
  };

  const handleVendorDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5);
    if (value.length > 10) value = value.slice(0, 10);
    setVendorSearchParams({ ...vendorSearchParams, dateOfService: value });
  };

  const clearVendorFilters = () => {
    setVendorSearchParams({ 
      businessName: '', website: '', phone: '', email: '', services: '', state: '',
      internalRating: '', onlineRating: '', ratingSource: '', contact: '', position: '',
      latestQuote: '', clientServiced: '', clientPhone: '', dateOfService: '', streetAddress: '' 
    });
  };

  // Add Vendor functions (separate from search)
  const handleAddVendorPhoneInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'clientPhone') => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) value = value;
    else if (value.length <= 6) value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
    else if (value.length <= 10) value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6);
    else value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6, 10);
    setAddVendorData({ ...addVendorData, [field]: value });
  };

  const handleAddVendorCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) value = parseInt(value).toLocaleString('en-US');
    else value = '';
    setAddVendorData({ ...addVendorData, latestQuote: value });
  };

  const handleAddVendorDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5);
    if (value.length > 10) value = value.slice(0, 10);
    setAddVendorData({ ...addVendorData, dateOfService: value });
  };

  const clearAddVendorForm = () => {
    setAddVendorData({
      businessName: '', website: '', phone: '', email: '', services: '', state: '',
      internalRating: '', onlineRating: '', ratingSource: '', contact: '', position: '',
      latestQuote: '', clientServiced: '', clientPhone: '', dateOfService: '', streetAddress: ''
    });
  };

  const handleSaveVendor = () => {
    // Check if at least business name is filled
    if (!addVendorData.businessName.trim()) {
      alert('Please enter at least a business name');
      return;
    }

    // Create new vendor object
    const newVendor = {
      id: vendors.length + 1,
      businessName: addVendorData.businessName,
      website: addVendorData.website,
      phone: addVendorData.phone,
      email: addVendorData.email,
      services: addVendorData.services,
      state: addVendorData.state,
      internalRating: addVendorData.internalRating,
      onlineRating: addVendorData.onlineRating,
      ratingSource: addVendorData.ratingSource,
      contactName: addVendorData.contact, // Map contact to contactName
      position: addVendorData.position,
      latestQuote: addVendorData.latestQuote ? `$${addVendorData.latestQuote}` : '',
      clientServiced: addVendorData.clientServiced,
      clientPhone: addVendorData.clientPhone,
      dateOfService: addVendorData.dateOfService,
      streetAddress: addVendorData.streetAddress
    };

    // Add to vendors list
    setVendors([...vendors, newVendor]);
    
    // Clear form and close
    clearAddVendorForm();
    setShowVendorSearch(false);
    
    // Show success message
    alert(`Vendor "${newVendor.businessName}" added successfully!`);
  };

  const handleVendorSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (vendorSortConfig.key === key && vendorSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setVendorSortConfig({ key, direction });
  };

  const getSortedVendors = () => {
    // Filter vendors based on search parameters
    const filteredVendors = vendors.filter((vendor: any) => {
      // If no search parameters are set, return empty array
      const hasSearchParams = Object.values(vendorSearchParams).some(val => val !== '');
      if (!hasSearchParams) return false;

      // Match each search parameter if it's filled (partial match for text fields)
      const matchBusinessName = !vendorSearchParams.businessName || 
        vendor.businessName.toLowerCase().includes(vendorSearchParams.businessName.toLowerCase());
      const matchWebsite = !vendorSearchParams.website || 
        vendor.website.toLowerCase().includes(vendorSearchParams.website.toLowerCase());
      const matchPhone = !vendorSearchParams.phone || 
        vendor.phone.includes(vendorSearchParams.phone);
      const matchEmail = !vendorSearchParams.email || 
        vendor.email.toLowerCase().includes(vendorSearchParams.email.toLowerCase());
      const matchServices = !vendorSearchParams.services || 
        vendor.services.toLowerCase().includes(vendorSearchParams.services.toLowerCase());
      const matchState = !vendorSearchParams.state || 
        vendor.state.toLowerCase().includes(vendorSearchParams.state.toLowerCase());
      const matchInternalRating = !vendorSearchParams.internalRating || 
        vendor.internalRating.toLowerCase().includes(vendorSearchParams.internalRating.toLowerCase());
      const matchOnlineRating = !vendorSearchParams.onlineRating || 
        vendor.onlineRating.toLowerCase().includes(vendorSearchParams.onlineRating.toLowerCase());
      const matchRatingSource = !vendorSearchParams.ratingSource || 
        vendor.ratingSource.toLowerCase().includes(vendorSearchParams.ratingSource.toLowerCase());
      const matchContact = !vendorSearchParams.contact || 
        vendor.contactName.toLowerCase().includes(vendorSearchParams.contact.toLowerCase());
      const matchPosition = !vendorSearchParams.position || 
        vendor.position.toLowerCase().includes(vendorSearchParams.position.toLowerCase());
      const matchLatestQuote = !vendorSearchParams.latestQuote || 
        vendor.latestQuote.includes(vendorSearchParams.latestQuote);
      const matchClientServiced = !vendorSearchParams.clientServiced || 
        vendor.clientServiced.toLowerCase().includes(vendorSearchParams.clientServiced.toLowerCase());
      const matchClientPhone = !vendorSearchParams.clientPhone || 
        vendor.clientPhone.includes(vendorSearchParams.clientPhone);
      const matchDateOfService = !vendorSearchParams.dateOfService || 
        vendor.dateOfService === vendorSearchParams.dateOfService;
      const matchStreetAddress = !vendorSearchParams.streetAddress || 
        vendor.streetAddress.toLowerCase().includes(vendorSearchParams.streetAddress.toLowerCase());

      return matchBusinessName && matchWebsite && matchPhone && matchEmail && 
             matchServices && matchState && matchInternalRating && matchOnlineRating &&
             matchRatingSource && matchContact && matchPosition && matchLatestQuote &&
             matchClientServiced && matchClientPhone && matchDateOfService && matchStreetAddress;
    });

    // Sort the filtered results
    if (!vendorSortConfig.key) return filteredVendors;
    return [...filteredVendors].sort((a: any, b: any) => {
      const aVal = a[vendorSortConfig.key as string];
      const bVal = b[vendorSortConfig.key as string];
      if (aVal < bVal) return vendorSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return vendorSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const hasVendorSearchCriteria = Object.values(vendorSearchParams).some(val => val !== '');

  // Helper function to check if a vendor column should be visible
  const isVendorColumnVisible = (column: string) => {
    if (visibleVendorColumns.includes('all')) return true;
    return visibleVendorColumns.includes(column);
  };

  // Handle Search Vendors button click
  const handleSearchVendors = () => {
    // Check if any search criteria is provided
    const hasSearchParams = Object.values(vendorSearchParams).some(val => val !== '');
    
    const columns: string[] = [];
    
    // Map search fields to column names
    if (vendorSearchParams.businessName) columns.push('businessName');
    if (vendorSearchParams.website) columns.push('website');
    if (vendorSearchParams.phone) columns.push('phone');
    if (vendorSearchParams.email) columns.push('email');
    if (vendorSearchParams.services) columns.push('services');
    if (vendorSearchParams.state) columns.push('state');
    if (vendorSearchParams.internalRating) columns.push('internalRating');
    if (vendorSearchParams.onlineRating) columns.push('onlineRating');
    if (vendorSearchParams.ratingSource) columns.push('ratingSource');
    if (vendorSearchParams.contact) columns.push('contact');
    if (vendorSearchParams.position) columns.push('position');
    if (vendorSearchParams.latestQuote) columns.push('latestQuote');
    if (vendorSearchParams.clientServiced) columns.push('clientServiced');
    if (vendorSearchParams.clientPhone) columns.push('clientPhone');
    if (vendorSearchParams.dateOfService) columns.push('dateOfService');
    if (vendorSearchParams.streetAddress) columns.push('streetAddress');
    
    // Only show columns that have search criteria
    if (columns.length === 0) {
      setVisibleVendorColumns([]);
    } else {
      setVisibleVendorColumns(columns);
    }
    
    setShowVendorResults(true);
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

  // Helper function to check if a column should be visible
  const isColumnVisible = (column: string) => {
    if (visibleTransactionColumns.includes('all')) return true;
    return visibleTransactionColumns.includes(column);
  };

  const isRevenueColumnVisible = (column: string) => {
    if (visibleRevenueColumns.includes('all')) return true;
    return visibleRevenueColumns.includes(column);
  };

  // Filter expenses based on search parameters
  const filteredExpenses = expenseEntries.filter((entry: any) => {
    // If no search parameters are set, show all entries
    const hasSearchParams = Object.values(financialsSearchParams).some(val => val !== '');
    if (!hasSearchParams) return true;

    // Match each search parameter if it's filled
    const matchLogDate = !financialsSearchParams.logDate || entry.logDate === financialsSearchParams.logDate;
    const matchTransactionDate = !financialsSearchParams.transactionDate || entry.transactionDate === financialsSearchParams.transactionDate;
    const matchClearDate = !financialsSearchParams.clearDate || entry.clearanceDate === financialsSearchParams.clearDate;
    const matchAmount = !financialsSearchParams.amount || entry.expense === financialsSearchParams.amount;
    const matchInvoiceNum = !financialsSearchParams.invoiceNum || entry.invoiceNumber === financialsSearchParams.invoiceNum;
    const matchCheckNum = !financialsSearchParams.checkNum || entry.checkNumber === financialsSearchParams.checkNum;
    const matchPaymentMethod = !financialsSearchParams.paymentMethod || entry.paidWith === financialsSearchParams.paymentMethod;
    const matchPaymentTerm = !financialsSearchParams.paymentTerm || entry.paymentTerm === financialsSearchParams.paymentTerm;
    const matchCategory = !financialsSearchParams.paymentFor || entry.expenseCategory === financialsSearchParams.paymentFor;
    const matchArea = !financialsSearchParams.area || entry.area === financialsSearchParams.area;
    const matchVendor = !financialsSearchParams.vendor || entry.paidTo === financialsSearchParams.vendor;
    const matchPayee = !financialsSearchParams.payee || entry.payee === financialsSearchParams.payee;

    return matchLogDate && matchTransactionDate && matchClearDate && matchAmount && 
           matchInvoiceNum && matchCheckNum && matchPaymentMethod && matchPaymentTerm && 
           matchCategory && matchArea && matchVendor && matchPayee;
  });

  const sortedExpenses = [...filteredExpenses].sort((a: any, b: any) => {
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
                title: "Success",
                description: "Transaction has been recorded",
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
        invoiceNumber: '',
        area: '',
        payee: ''
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
      invoiceNumber: expense.invoiceNumber || '',
      area: expense.area || '',
      payee: expense.payee || ''
    });
    setIsEditMode(true);
    setEditingExpenseId(expense.id);
    setShowExpenseForm(true);
    setShowTransactionsCard(true);
    setVisibleTransactionColumns(['all']); // Show all columns by default
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
            <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }} data-testid="heading-analytics-dashboard">LoanView GPT</h1>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu open={shortcutDropdownOpen} onOpenChange={setShortcutDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="px-2 py-1.5 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all"
                  data-testid="button-shortcut"
                >
                  <User className="h-4 w-4 text-purple-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
                {dashboardMenuItems.map((item, index) => (
                  <div key={item.path}>
                    <DropdownMenuItem
                      onClick={() => {
                        if (item.path === '/logout') {
                          handleLogout();
                        } else {
                          setLocation(item.path);
                        }
                      }}
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
              className="flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all disabled:opacity-50"
              data-testid="button-screenshare"
            >
              <Monitor className={`h-3.5 w-3.5 text-purple-300 transition-transform duration-500 ${screenshareLoading ? 'animate-spin' : ''}`} />
              <span className="text-purple-200 text-xs">{screenshareLoading ? 'Starting...' : 'Screenshare'}</span>
            </button>
            
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-purple-200 text-xs">Live</span>
            </div>
            <button 
              onClick={() => {
                // If in Expense tab, directly open Expense Log form
                if (categoryFilter === 'financials' && teamFilter === 'expense-add') {
                  setEntryType('expense');
                  setShowExpenseForm(true);
                  setIsExpenseTableMinimized(false); // Ensure form is expanded
                  setAreChartsMinimized(true); // Minimize charts to reduce clutter
                  setShowFinancialsSearch(false); // Close search card
                  setIsFiltersMinimized(true); // Minimize Dashboard card for cleaner data entry
                } else if (categoryFilter === 'vendor' && teamFilter === 'show-all') {
                  // If Add Vendor card is already open, ignore the click
                  if (showVendorSearch) {
                    return;
                  }
                  // If in Vendor tab with Show All, close Search card first, then open Add Vendor card
                  setShowVendorSearchCard(false); // Close Search card if open
                  setShowVendorSearch(true);
                  setIsFiltersMinimized(true); // Minimize Performance card for cleaner view
                  setAreChartsMinimized(true); // Minimize charts when Add Entry is triggered
                } else {
                  setShowAddModal(true);
                  setIsFiltersMinimized(true); // Minimize Dashboard card for cleaner data entry
                }
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg border border-purple-400/30 transition-all shadow-lg hover:shadow-purple-500/50"
              data-testid="button-add-entry"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-xs">Add Entry</span>
            </button>
          </div>
        </div>

        {/* Top Card - Filters and Metrics */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{performanceCardTitle}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-purple-500/20 transition-colors"
                    data-testid="button-performance-menu"
                  >
                    <Filter className="w-5 h-5 text-purple-400 hover:text-purple-300" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-slate-800 border-purple-500/30">
                  <DropdownMenuItem 
                    onClick={() => setPerformanceCardTitle('Prime Rate')}
                    className="text-purple-200 hover:text-white hover:bg-purple-500/20 cursor-pointer"
                    data-testid="menu-item-prime-rate"
                  >
                    Prime Rate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setPerformanceCardTitle('Partner')}
                    className="text-purple-200 hover:text-white hover:bg-purple-500/20 cursor-pointer"
                    data-testid="menu-item-partner"
                  >
                    Partner
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setPerformanceCardTitle('Branch')}
                    className="text-purple-200 hover:text-white hover:bg-purple-500/20 cursor-pointer"
                    data-testid="menu-item-branch"
                  >
                    Branch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Check if there's an open expense or revenue form first
                  if (showExpenseForm) {
                    setConflictFormType('expense');
                    setShowFormConflictWarning(true);
                    return;
                  }
                  if (showRevenueForm) {
                    setConflictFormType('revenue');
                    setShowFormConflictWarning(true);
                    return;
                  }
                  // Check if New Batch card is open in Marketing
                  if (showCreateBatch && categoryFilter === 'marketing') {
                    setShowBatchWarning(true);
                    return;
                  }
                  // Check if Add Vendor card is open in Vendor category
                  if (showVendorSearch && categoryFilter === 'vendor') {
                    setShowVendorWarning(true);
                    return;
                  }
                  
                  // Open appropriate search card based on category
                  if (categoryFilter === 'marketing') {
                    setShowQueryCard(true);
                    setIsQueryCardMinimized(false);
                  } else if (categoryFilter === 'staff') {
                    setShowStaffSearch(true);
                    setIsSearchMinimized(false);
                  } else if (categoryFilter === 'financials' && teamFilter === 'expense-add') {
                    setShowFinancialsSearch(true);
                    setIsFinancialsSearchMinimized(false);
                  } else if (categoryFilter === 'financials' && teamFilter === 'revenue-add') {
                    setShowRevenueSearch(true);
                    setIsRevenueSearchMinimized(false);
                    setShowRevenueForm(false); // Close Revenue Log when Search Card opens (mutual exclusivity)
                  } else if (categoryFilter === 'vendor' && teamFilter === 'show-all') {
                    // If Search card is already open, ignore the click
                    if (showVendorSearchCard) {
                      return;
                    }
                    setShowVendorSearchCard(true);
                    setIsVendorSearchCardMinimized(false);
                    setAreChartsMinimized(true); // Minimize charts when Search is triggered
                  }
                }}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                title="Open Search"
                data-testid="button-open-search"
              >
                <Search className="w-5 h-5 text-purple-300" />
              </button>
              <button
                onClick={() => {
                  if (showCreateBatch && isFiltersMinimized) {
                    setShowBatchWarning(true);
                  } else if (showStaffForm && isFiltersMinimized) {
                    setShowStaffWarning(true);
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
          </div>

          <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isFiltersMinimized ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
            }`}
          >
            <DashboardFilters
              entityFilter={entityFilter}
              setEntityFilter={setEntityFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              teamFilter={teamFilter}
              setTeamFilter={setTeamFilter}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              timeFilterFromDate={timeFilterFromDate}
              handleTimeFilterDateInput={handleTimeFilterDateInput}
              showVendorSearch={showVendorSearch}
              onShowVendorWarning={() => setShowVendorTeamWarning(true)}
              timeFilterToDate={timeFilterToDate}
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
          </div>
        </div>

        {/* Second Card - Charts - Only shown when Staff with non-Show All Team, Marketing with non-Show All Team, Financials with Revenue/Expense, or Vendor with Show All */}
        {((categoryFilter === 'staff' && teamFilter !== 'show-all') || (categoryFilter === 'marketing' && teamFilter !== 'show-all') || (categoryFilter === 'financials' && (teamFilter === 'revenue-add' || teamFilter === 'expense-add')) || (categoryFilter === 'vendor' && teamFilter === 'show-all')) && (
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
              showStaffForm={showStaffForm}
              onShowStaffWarning={() => setShowStaffWarning(true)}
              showExpenseForm={showExpenseForm}
              showRevenueForm={showRevenueForm}
              onShowFormConflictWarning={(type) => {
                setConflictFormType(type);
                setShowFormConflictWarning(true);
              }}
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
              showStaffForm={showStaffForm}
              onShowStaffWarning={() => setShowStaffWarning(true)}
              showExpenseForm={showExpenseForm}
              showRevenueForm={showRevenueForm}
              onShowFormConflictWarning={(type) => {
                setConflictFormType(type);
                setShowFormConflictWarning(true);
              }}
            />
          </div>
        )}

        {/* Vendor Search Card - Only shown when Vendor category with Show All is selected and user clicks Add Entry */}
        {showVendorSearch && categoryFilter === 'vendor' && teamFilter === 'show-all' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                  <HardHat className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Add Vendor</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={clearAddVendorForm} 
                  className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors bg-slate-700/50 text-white border border-slate-600 hover:bg-slate-700"
                  data-testid="button-clear-add-vendor-form"
                >
                  Clear Form
                </button>
                <button 
                  onClick={handleSaveVendor}
                  className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  data-testid="button-save-vendor"
                >
                  Save Vendor
                </button>
                <button
                  onClick={() => setIsVendorSearchMinimized(!isVendorSearchMinimized)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isVendorSearchMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-vendor-search"
                >
                  {isVendorSearchMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowVendorSearch(false)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Close"
                  data-testid="button-close-vendor-search"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </button>
              </div>
            </div>

            {!isVendorSearchMinimized && (
            <>
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Business Name</label>
                <input 
                  type="text" 
                  placeholder="Enter business name" 
                  value={vendorSearchParams.businessName} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, businessName: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-business-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Website</label>
                <input 
                  type="text" 
                  placeholder="www.example.com" 
                  value={addVendorData.website} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, website: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Phone</label>
                <input 
                  type="text" 
                  placeholder="(555) 123-4567" 
                  value={addVendorData.phone} 
                  onChange={(e) => handleAddVendorPhoneInput(e, 'phone')} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Email</label>
                <input 
                  type="email" 
                  placeholder="email@example.com" 
                  value={addVendorData.email} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, email: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-email"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Services</label>
                <select 
                  value={addVendorData.services} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, services: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                  data-testid="select-services"
                >
                  <option value="">Select</option>
                  <option value="wdo">WDO</option>
                  <option value="appraisal">Appraisal</option>
                  <option value="watertest">Water Test</option>
                  <option value="propertyinspection">Property Inspection</option>
                  <option value="handyman">Handyman</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">State</label>
                <select 
                  value={addVendorData.state} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, state: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                  data-testid="select-state"
                >
                  <option value="">Select</option>
                  {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Internal Rating</label>
                <select 
                  value={addVendorData.internalRating} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, internalRating: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                  data-testid="select-internal-rating"
                >
                  <option value="">Select</option>
                  <option value="5stars">Five Stars</option>
                  <option value="4stars">4 Stars</option>
                  <option value="3stars">3 Stars</option>
                  <option value="donotuse">Do Not Use</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Online Rating</label>
                <select 
                  value={addVendorData.onlineRating} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, onlineRating: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                  data-testid="select-online-rating"
                >
                  <option value="">Select</option>
                  <option value="5stars">Five Stars</option>
                  <option value="4stars">4 Stars</option>
                  <option value="3stars">3 Stars</option>
                  <option value="donotuse">Do Not Use</option>
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Rating Source</label>
                <select 
                  value={addVendorData.ratingSource} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, ratingSource: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                  data-testid="select-rating-source"
                >
                  <option value="">Select</option>
                  <option value="yelp">Yelp</option>
                  <option value="google">Google</option>
                  <option value="bbb">BBB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Contact</label>
                <input 
                  type="text" 
                  placeholder="Enter contact name" 
                  value={addVendorData.contact} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, contact: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Position</label>
                <input 
                  type="text" 
                  placeholder="Enter position" 
                  value={addVendorData.position} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, position: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-position"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Latest Quote</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input 
                    type="text" 
                    placeholder="0" 
                    value={addVendorData.latestQuote} 
                    onChange={handleAddVendorCurrencyInput} 
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                    data-testid="input-latest-quote"
                  />
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Client Serviced</label>
                <input 
                  type="text" 
                  placeholder="Enter client name" 
                  value={addVendorData.clientServiced} 
                  onChange={(e) => setVendorSearchParams({...addVendorData, clientServiced: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-client-serviced"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Client Phone</label>
                <input 
                  type="text" 
                  placeholder="(555) 123-4567" 
                  value={addVendorData.clientPhone} 
                  onChange={(e) => handleAddVendorPhoneInput(e, 'clientPhone')} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-client-phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Date of Service</label>
                <input 
                  type="text" 
                  placeholder="MM/DD/YYYY" 
                  value={addVendorData.dateOfService} 
                  onChange={handleAddVendorDateInput} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-date-of-service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Street Address</label>
                <input 
                  type="text" 
                  placeholder="Enter street address" 
                  value={addVendorData.streetAddress} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, streetAddress: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-street-address"
                />
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* Vendor Search Card - Only shown when Vendor category with Show All is selected and magnifying glass is clicked */}
        {showVendorSearchCard && categoryFilter === 'vendor' && teamFilter === 'show-all' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <Search className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Search</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={clearVendorFilters} 
                  className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors bg-slate-700/50 text-white border border-slate-600 hover:bg-slate-700"
                  data-testid="button-clear-vendor-search-filters"
                >
                  Clear Filters
                </button>
                <button 
                  onClick={handleSearchVendors}
                  className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  data-testid="button-search-vendors-action"
                >
                  Search Vendors
                </button>
                <button
                  onClick={() => setIsVendorSearchCardMinimized(!isVendorSearchCardMinimized)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isVendorSearchCardMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-vendor-search-card"
                >
                  {isVendorSearchCardMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowVendorSearchCard(false)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Close"
                  data-testid="button-close-vendor-search-card"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </button>
              </div>
            </div>

            {!isVendorSearchCardMinimized && (
            <>
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Business Name</label>
                <input 
                  type="text" 
                  placeholder="Enter business name" 
                  value={vendorSearchParams.businessName} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, businessName: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-business-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Website</label>
                <input 
                  type="text" 
                  placeholder="www.example.com" 
                  value={vendorSearchParams.website} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, website: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Phone</label>
                <input 
                  type="text" 
                  placeholder="(555) 123-4567" 
                  value={vendorSearchParams.phone} 
                  onChange={(e) => handleVendorPhoneInput(e, 'phone')} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Email</label>
                <input 
                  type="email" 
                  placeholder="vendor@example.com" 
                  value={vendorSearchParams.email} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, email: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-email"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Services</label>
                <input 
                  type="text" 
                  placeholder="Enter services" 
                  value={vendorSearchParams.services} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, services: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">State</label>
                <input 
                  type="text" 
                  placeholder="Enter state" 
                  value={vendorSearchParams.state} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, state: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Internal Rating</label>
                <input 
                  type="text" 
                  placeholder="Enter internal rating" 
                  value={vendorSearchParams.internalRating} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, internalRating: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-internal-rating"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Online Rating</label>
                <input 
                  type="text" 
                  placeholder="Enter online rating" 
                  value={vendorSearchParams.onlineRating} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, onlineRating: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-online-rating"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Rating Source</label>
                <input 
                  type="text" 
                  placeholder="Enter rating source" 
                  value={vendorSearchParams.ratingSource} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, ratingSource: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-rating-source"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Contact</label>
                <input 
                  type="text" 
                  placeholder="Enter contact name" 
                  value={vendorSearchParams.contact} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, contact: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Position</label>
                <input 
                  type="text" 
                  placeholder="Enter position" 
                  value={vendorSearchParams.position} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, position: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-position"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Latest Quote</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input 
                    type="text" 
                    placeholder="0" 
                    value={vendorSearchParams.latestQuote} 
                    onChange={handleVendorCurrencyInput} 
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                    data-testid="input-search-latest-quote"
                  />
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Client Serviced</label>
                <input 
                  type="text" 
                  placeholder="Enter client name" 
                  value={vendorSearchParams.clientServiced} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, clientServiced: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-client-serviced"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Client Phone</label>
                <input 
                  type="text" 
                  placeholder="(555) 123-4567" 
                  value={vendorSearchParams.clientPhone} 
                  onChange={(e) => handleVendorPhoneInput(e, 'clientPhone')} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-client-phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Date of Service</label>
                <input 
                  type="text" 
                  placeholder="MM/DD/YYYY" 
                  value={vendorSearchParams.dateOfService} 
                  onChange={handleVendorDateInput} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-date-of-service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">Street Address</label>
                <input 
                  type="text" 
                  placeholder="Enter street address" 
                  value={vendorSearchParams.streetAddress} 
                  onChange={(e) => setVendorSearchParams({...vendorSearchParams, streetAddress: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500" 
                  data-testid="input-search-street-address"
                />
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* Vendor Search Results Table */}
        {showVendorResults && categoryFilter === 'vendor' && teamFilter === 'show-all' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <Search className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Search Results ({getSortedVendors().length} vendors)
                </h3>
              </div>
              <button
                onClick={() => setShowVendorResults(false)}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                title="Close"
                data-testid="button-close-vendor-results"
              >
                <X className="w-5 h-5 text-purple-300" />
              </button>
            </div>

            {/* Custom Scrollbar Track */}
            <div className="mb-4">
              <div 
                className="h-2 rounded-full overflow-hidden cursor-pointer bg-slate-700/50"
                style={{ position: 'relative' }}
                onClick={(e) => {
                  const tableContainer = e.currentTarget.parentElement?.nextElementSibling;
                  if (tableContainer) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    tableContainer.scrollLeft = percentage * (tableContainer.scrollWidth - tableContainer.clientWidth);
                  }
                }}
              >
                <div 
                  id="vendor-scroll-indicator"
                  className="h-full rounded-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: '30%', cursor: 'grab' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const indicator = e.currentTarget;
                    const track = indicator.parentElement;
                    const tableContainer = track?.parentElement?.nextElementSibling;
                    if (!tableContainer) return;
                    
                    indicator.style.cursor = 'grabbing';
                    const startX = e.clientX;
                    const startScrollLeft = tableContainer.scrollLeft;
                    const trackWidth = track.offsetWidth;
                    const scrollWidth = tableContainer.scrollWidth - tableContainer.clientWidth;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const deltaX = e.clientX - startX;
                      const scrollDelta = (deltaX / trackWidth) * scrollWidth;
                      tableContainer.scrollLeft = startScrollLeft + scrollDelta;
                    };
                    
                    const handleMouseUp = () => {
                      indicator.style.cursor = 'grab';
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </div>
              <p className="text-xs mt-1 text-slate-400">
                ← Drag or click the scrollbar to navigate →
              </p>
            </div>

            <div 
              className="overflow-x-auto scrollbar-custom"
              onScroll={(e) => {
                const target = e.target as HTMLElement;
                const scrollPercentage = target.scrollLeft / (target.scrollWidth - target.clientWidth);
                const indicator = document.getElementById('vendor-scroll-indicator');
                if (indicator) {
                  const thumbWidth = (target.clientWidth / target.scrollWidth) * 100;
                  indicator.style.width = `${Math.max(thumbWidth, 10)}%`;
                  indicator.style.transform = `translateX(${scrollPercentage * (100 / thumbWidth - 1)}%)`;
                }
              }}
            >
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    {isVendorColumnVisible('businessName') && (
                      <th onClick={() => handleVendorSort('businessName')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[180px] text-purple-300 hover:text-purple-200" data-testid="header-business-name">
                        <div className="flex items-center gap-2">Business Name <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('website') && (
                      <th onClick={() => handleVendorSort('website')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[180px] text-purple-300 hover:text-purple-200" data-testid="header-website">
                        <div className="flex items-center gap-2">Website <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('phone') && (
                      <th onClick={() => handleVendorSort('phone')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[140px] text-purple-300 hover:text-purple-200" data-testid="header-phone">
                        <div className="flex items-center gap-2">Phone <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('email') && (
                      <th onClick={() => handleVendorSort('email')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[200px] text-purple-300 hover:text-purple-200" data-testid="header-email">
                        <div className="flex items-center gap-2">Email <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('services') && (
                      <th onClick={() => handleVendorSort('services')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[160px] text-purple-300 hover:text-purple-200" data-testid="header-services">
                        <div className="flex items-center gap-2">Services <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('state') && (
                      <th onClick={() => handleVendorSort('state')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[100px] text-purple-300 hover:text-purple-200" data-testid="header-state">
                        <div className="flex items-center gap-2">State <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('internalRating') && (
                      <th onClick={() => handleVendorSort('internalRating')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[140px] text-purple-300 hover:text-purple-200" data-testid="header-internal-rating">
                        <div className="flex items-center gap-2">Internal Rating <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('onlineRating') && (
                      <th onClick={() => handleVendorSort('onlineRating')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[140px] text-purple-300 hover:text-purple-200" data-testid="header-online-rating">
                        <div className="flex items-center gap-2">Online Rating <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('ratingSource') && (
                      <th onClick={() => handleVendorSort('ratingSource')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[140px] text-purple-300 hover:text-purple-200" data-testid="header-rating-source">
                        <div className="flex items-center gap-2">Rating Source <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('contact') && (
                      <th onClick={() => handleVendorSort('contactName')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[140px] text-purple-300 hover:text-purple-200" data-testid="header-contact">
                        <div className="flex items-center gap-2">Contact <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('position') && (
                      <th onClick={() => handleVendorSort('position')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[140px] text-purple-300 hover:text-purple-200" data-testid="header-position">
                        <div className="flex items-center gap-2">Position <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('latestQuote') && (
                      <th onClick={() => handleVendorSort('latestQuote')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[130px] text-purple-300 hover:text-purple-200" data-testid="header-latest-quote">
                        <div className="flex items-center gap-2">Latest Quote <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('clientServiced') && (
                      <th onClick={() => handleVendorSort('clientServiced')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[150px] text-purple-300 hover:text-purple-200" data-testid="header-client-serviced">
                        <div className="flex items-center gap-2">Client Serviced <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('clientPhone') && (
                      <th onClick={() => handleVendorSort('clientPhone')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[140px] text-purple-300 hover:text-purple-200" data-testid="header-client-phone">
                        <div className="flex items-center gap-2">Client Phone <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('dateOfService') && (
                      <th onClick={() => handleVendorSort('dateOfService')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[140px] text-purple-300 hover:text-purple-200" data-testid="header-date-of-service">
                        <div className="flex items-center gap-2">Date of Service <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                    {isVendorColumnVisible('streetAddress') && (
                      <th onClick={() => handleVendorSort('streetAddress')} className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[150px] text-purple-300 hover:text-purple-200" data-testid="header-street-address">
                        <div className="flex items-center gap-2">Street Address <ArrowUpDown className="w-4 h-4" /></div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {getSortedVendors().map((vendor) => (
                    <tr key={vendor.id} className="border-b transition-colors border-slate-700/50 hover:bg-slate-700/30" data-testid={`vendor-row-${vendor.id}`}>
                      {isVendorColumnVisible('businessName') && <td className="py-3 px-4 font-medium text-white">{vendor.businessName}</td>}
                      {isVendorColumnVisible('website') && <td className="py-3 px-4 text-purple-300">{vendor.website}</td>}
                      {isVendorColumnVisible('phone') && <td className="py-3 px-4 text-slate-300">{vendor.phone}</td>}
                      {isVendorColumnVisible('email') && <td className="py-3 px-4 text-purple-300">{vendor.email}</td>}
                      {isVendorColumnVisible('services') && <td className="py-3 px-4 text-slate-300">{vendor.services}</td>}
                      {isVendorColumnVisible('state') && <td className="py-3 px-4 text-slate-300">{vendor.state}</td>}
                      {isVendorColumnVisible('internalRating') && <td className="py-3 px-4 text-slate-300">{vendor.internalRating}</td>}
                      {isVendorColumnVisible('onlineRating') && <td className="py-3 px-4 text-slate-300">{vendor.onlineRating}</td>}
                      {isVendorColumnVisible('ratingSource') && <td className="py-3 px-4 text-slate-300">{vendor.ratingSource}</td>}
                      {isVendorColumnVisible('contact') && <td className="py-3 px-4 text-slate-300">{vendor.contactName}</td>}
                      {isVendorColumnVisible('position') && <td className="py-3 px-4 text-slate-300">{vendor.position}</td>}
                      {isVendorColumnVisible('latestQuote') && <td className="py-3 px-4 font-semibold text-emerald-500">${vendor.latestQuote}</td>}
                      {isVendorColumnVisible('clientServiced') && <td className="py-3 px-4 text-slate-300">{vendor.clientServiced}</td>}
                      {isVendorColumnVisible('clientPhone') && <td className="py-3 px-4 text-slate-300">{vendor.clientPhone}</td>}
                      {isVendorColumnVisible('dateOfService') && <td className="py-3 px-4 text-slate-300">{vendor.dateOfService}</td>}
                      {isVendorColumnVisible('streetAddress') && <td className="py-3 px-4 text-slate-300">{vendor.streetAddress}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Prime Rate Card - Only shown when Staff category is selected AND Team is MLO */}
        {categoryFilter === 'staff' && teamFilter === 'mlo' && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Prime Rate</h2>
              </div>
              <button
                onClick={() => setIsPrimeRateMinimized(!isPrimeRateMinimized)}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                title={isPrimeRateMinimized ? "Expand" : "Minimize"}
                data-testid="button-toggle-prime-rate"
              >
                {isPrimeRateMinimized ? (
                  <Plus className="w-5 h-5 text-purple-300" />
                ) : (
                  <Minus className="w-5 h-5 text-purple-300" />
                )}
              </button>
            </div>

            {!isPrimeRateMinimized && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-purple-300 text-sm mb-1">Current Rate</p>
                    <p className="text-2xl font-bold text-white">6.875%</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-purple-300 text-sm mb-1">30-Yr Fixed</p>
                    <p className="text-2xl font-bold text-white">7.125%</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-purple-300 text-sm mb-1">15-Yr Fixed</p>
                    <p className="text-2xl font-bold text-white">6.625%</p>
                  </div>
                </div>
                <p className="text-purple-300 text-sm">Prime rate information and current mortgage rates</p>
              </div>
            )}
          </div>
        )}

        {/* Staff Search Card - Only shown when Staff category is selected and showStaffSearch is true */}
        {categoryFilter === 'staff' && showStaffSearch && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Search className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Search</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSearchStaff}
                  className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-purple-500/50"
                  data-testid="button-search-staff"
                >
                  Search Staff
                </button>
                <button
                  onClick={() => {
                    if (showStaffForm && isSearchMinimized) {
                      setShowStaffWarning(true);
                    } else {
                      setIsSearchMinimized(!isSearchMinimized);
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isSearchMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-search"
                >
                  {isSearchMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowStaffSearch(false)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Close Search"
                  data-testid="button-close-search-staff"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </button>
              </div>
            </div>

            <div 
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isSearchMinimized ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
              }`}
            >
              {/* Row 1: Area, Role, Rating, Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Area
                </label>
                <select
                  value={searchArea}
                  onChange={(e) => setSearchArea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  data-testid="select-search-area"
                >
                  <option value="">Select</option>
                  <option value="company">Company</option>
                  <option value="region">Region</option>
                  <option value="district">District</option>
                  <option value="state">State</option>
                  <option value="city">City</option>
                  <option value="location">Location</option>
                  <option value="partner">Partner</option>
                  <option value="branch">Branch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Role
                </label>
                <select
                  value={searchMagnify}
                  onChange={(e) => setSearchMagnify(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  data-testid="select-search-magnify"
                >
                  <option value="">Select</option>
                  <option value="team">Team</option>
                  <option value="mlo">MLO</option>
                  <option value="processor">Processor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Rating
                </label>
                <select
                  value={searchRating}
                  onChange={(e) => setSearchRating(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  data-testid="select-search-rating"
                >
                  <option value="">Select</option>
                  <option value="review">Review</option>
                  <option value="attendance">Attendance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Performance
                </label>
                <select
                  value={searchPerformance}
                  onChange={(e) => setSearchPerformance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  data-testid="select-search-performance"
                >
                  <option value="">Select</option>
                  <option value="plus50">50% +</option>
                  <option value="plus40">40% +</option>
                  <option value="plus30">30% +</option>
                  <option value="plus20">20% +</option>
                  <option value="plus10">10% +</option>
                  <option value="minus10">-10%</option>
                  <option value="minus20">-20%</option>
                  <option value="minus30">-30%</option>
                  <option value="minus40">-40%</option>
                </select>
              </div>
            </div>

            {/* Row 2: Status, Duration, Category, Earnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Status
                </label>
                <select
                  value={searchBonus}
                  onChange={(e) => setSearchBonus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  data-testid="input-search-bonus"
                >
                  <option value="">Select</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="not-active">Not Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Duration
                </label>
                <select
                  value={searchWithCompany}
                  onChange={(e) => setSearchWithCompany(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  data-testid="select-search-with-company"
                >
                  <option value="">Select</option>
                  <option value="lt1">Less than 1 year</option>
                  <option value="1plus">1 year +</option>
                  <option value="2plus">2 years +</option>
                  <option value="4plus">4 years +</option>
                  <option value="5plus">5 years +</option>
                  <option value="7plus">7 years +</option>
                  <option value="8plus">8 years +</option>
                  <option value="10plus">10 years +</option>
                  <option value="15plus">15 years +</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Category
                </label>
                <select
                  value={searchCompensation}
                  onChange={(e) => setSearchCompensation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  data-testid="select-search-compensation"
                >
                  <option value="">Select</option>
                  <option value="w2">W2</option>
                  <option value="1099">1099</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Earnings
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="text"
                    placeholder="0"
                    value={searchEarnings}
                    onChange={(e) => handleSearchCurrencyInput(e, 'earnings')}
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                    data-testid="input-search-earnings"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: License Count, Loan Volume, Funding Volume, Clear Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  License Count
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={searchLicenseCount}
                  onChange={(e) => setSearchLicenseCount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  data-testid="input-search-license-count"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Loan Volume
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={searchLoanVolume}
                  onChange={(e) => setSearchLoanVolume(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                  data-testid="input-search-loan-volume"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-purple-300">
                  Funding Volume
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="text"
                    placeholder="0"
                    value={searchFundingVolume}
                    onChange={(e) => handleSearchCurrencyInput(e, 'fundingVolume')}
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder-slate-500 focus:outline-none transition-colors"
                    data-testid="input-search-funding-volume"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setSearchArea('');
                    setSearchMagnify('');
                    setSearchRating('');
                    setSearchPerformance('');
                    setSearchWithCompany('');
                    setSearchCompensation('');
                    setSearchEarnings('');
                    setSearchBonus('');
                    setSearchLicenseCount('');
                    setSearchLoanVolume('');
                    setSearchFundingVolume('');
                  }}
                  className="w-full px-4 py-2.5 rounded-lg font-medium transition-colors bg-slate-700/50 text-white border border-slate-600 hover:bg-slate-700"
                  data-testid="button-clear-search-filters"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Staff Search Results Table - Only shown when search is performed */}
        {categoryFilter === 'staff' && showSearchResults && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <style>{`
              .scrollbar-custom::-webkit-scrollbar {
                height: 8px;
              }
              .scrollbar-custom::-webkit-scrollbar-track {
                background: transparent;
              }
              .scrollbar-custom::-webkit-scrollbar-thumb {
                background: transparent;
                border-radius: 4px;
              }
              .scrollbar-custom {
                scrollbar-width: thin;
                scrollbar-color: transparent transparent;
              }
            `}</style>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Search Results ({sortedStaffData.length} staff members • {activeStaffColumns.length} columns)
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStaffResultsMinimized(!isStaffResultsMinimized)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isStaffResultsMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-staff-results"
                >
                  {isStaffResultsMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-purple-300 hover:text-white transition-colors"
                  data-testid="button-close-staff-results"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {!isStaffResultsMinimized && (
              <>
                {/* Custom Scrollbar Track */}
                <div className="mb-4">
                  <div 
                    className="h-2 rounded-full overflow-hidden cursor-pointer bg-slate-700/50"
                    style={{ position: 'relative' }}
                    onClick={(e) => {
                      const tableContainer = e.currentTarget.parentElement?.nextElementSibling as HTMLDivElement;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = clickX / rect.width;
                      tableContainer.scrollLeft = percentage * (tableContainer.scrollWidth - tableContainer.clientWidth);
                    }}
                  >
                    <div 
                      id="scroll-indicator"
                      className="h-full rounded-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: '30%', cursor: 'grab' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const indicator = e.currentTarget;
                        const track = indicator.parentElement as HTMLDivElement;
                        const tableContainer = track.parentElement?.nextElementSibling as HTMLDivElement;
                        
                        indicator.style.cursor = 'grabbing';
                        const startX = e.clientX;
                        const startScrollLeft = tableContainer.scrollLeft;
                        const trackWidth = track.offsetWidth;
                        const scrollWidth = tableContainer.scrollWidth - tableContainer.clientWidth;
                        
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          const scrollDelta = (deltaX / trackWidth) * scrollWidth;
                          tableContainer.scrollLeft = startScrollLeft + scrollDelta;
                        };
                        
                        const handleMouseUp = () => {
                          indicator.style.cursor = 'grab';
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-slate-400">
                    ← Drag or click the scrollbar to navigate →
                  </p>
                </div>

                <div 
                  className="overflow-x-auto scrollbar-custom"
                  onScroll={(e) => {
                    const scrollPercentage = e.currentTarget.scrollLeft / (e.currentTarget.scrollWidth - e.currentTarget.clientWidth);
                    const indicator = document.getElementById('scroll-indicator');
                    if (indicator) {
                      const thumbWidth = (e.currentTarget.clientWidth / e.currentTarget.scrollWidth) * 100;
                      indicator.style.width = `${Math.max(thumbWidth, 10)}%`;
                      indicator.style.transform = `translateX(${scrollPercentage * (100 / thumbWidth - 1)}%)`;
                    }
                  }}
                >
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    {activeStaffColumns.map((column) => (
                      <th 
                        key={column.key}
                        onClick={() => handleStaffSort(column.key)}
                        className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[130px] text-purple-300 hover:text-purple-200"
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                    ))}
                    <th className="text-center text-purple-300 font-semibold py-3 px-4">
                      <Paperclip className="w-4 h-4 mx-auto" />
                    </th>
                    <th className="text-left text-purple-300 font-semibold py-3 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStaffData.map((staff) => (
                    <tr 
                      key={staff.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      {activeStaffColumns.map((column) => {
                        const value = staff[column.key as keyof typeof staff];
                        const isNameColumn = column.key === 'lastName' || column.key === 'firstName';
                        const isMoneyColumn = column.key === 'earnings' || column.key === 'fundingVolume';
                        
                        return (
                          <td 
                            key={column.key}
                            className={`py-3 px-4 ${
                              isNameColumn 
                                ? 'font-medium text-white' 
                                : isMoneyColumn
                                ? 'font-semibold text-emerald-500'
                                : 'text-slate-300'
                            }`}
                          >
                            {isMoneyColumn && typeof value === 'number' 
                              ? formatCurrency(value) 
                              : value}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center">
                        <AttachmentIndicator 
                          transactionId={`staff-${staff.id}`}
                          transactionType="staff"
                          onOpenDialog={() => {
                            setSelectedTransaction({ id: `staff-${staff.id}`, type: 'staff' });
                            setShowAttachmentsDialog(true);
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 relative">
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === staff.id ? null : staff.id)}
                          className="text-purple-300 hover:text-white transition-colors"
                          data-testid={`button-staff-action-menu-${staff.id}`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {/* Action Menu Popup */}
                        {openActionMenu === staff.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg border border-purple-500/30 shadow-xl z-50 overflow-hidden">
                            <button
                              onClick={() => {
                                setSelectedTransaction({ id: `staff-${staff.id}`, type: 'staff' });
                                setShowAttachmentsDialog(true);
                                setOpenActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                              data-testid={`button-staff-manage-attachments-${staff.id}`}
                            >
                              Attach Doc
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement edit staff functionality
                                setOpenActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                              data-testid={`button-staff-edit-${staff.id}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement delete staff functionality
                                setOpenActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                              data-testid={`button-staff-delete-${staff.id}`}
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
              </>
            )}
          </div>
        )}


        {/* Staff Form Cards - Only shown when Staff category is selected and Add Entry is clicked */}
        {categoryFilter === 'staff' && showStaffForm && (
          <>
            {/* Staff Information Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Staff</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStaffAttachmentsDialog(true)}
                    className="flex items-center justify-center gap-2 px-3 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                    title="Manage Attachments"
                    data-testid="button-staff-attachments"
                  >
                    <Paperclip className="w-5 h-5 text-purple-300" />
                    <StaffAttachmentCount transactionId={tempStaffId} />
                  </button>
                  <button
                    onClick={() => setAreStaffCardsMinimized(!areStaffCardsMinimized)}
                    className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                    title={areStaffCardsMinimized ? "Expand" : "Minimize"}
                    data-testid="button-minimize-staff"
                  >
                    {areStaffCardsMinimized ? (
                      <Plus className="w-5 h-5 text-purple-300" />
                    ) : (
                      <Minus className="w-5 h-5 text-purple-300" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowStaffForm(false);
                      setIsFiltersMinimized(false);
                      setAreChartsMinimized(false);
                      // Clear form fields
                      setStaffFirstName('');
                      setStaffLastName('');
                      setStaffPhone('');
                      setStaffEmail('');
                      setEmergencyContactName('');
                      setEmergencyPhone('');
                      setPayrollType('');
                      setLevel('');
                      setRole('');
                      setAuthorization('');
                      setAccess('');
                      setSpecialAccess('');
                      setStartDate('');
                      setBackgroundCheck('');
                      setCreditReview('');
                      setIdentification('');
                      setWorkAuthorization('');
                      setDrugScreening('');
                      setEmploymentAgreement('');
                      setPolicy('');
                      setNdaAgreement('');
                      setInterviewGrade('');
                    }}
                    className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-500/20 to-pink-500/20 hover:from-red-500/40 hover:to-pink-500/40 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all shadow-lg hover:shadow-red-500/30"
                    title="Close"
                    data-testid="button-close-staff"
                  >
                    <X className="w-5 h-5 text-red-300" />
                  </button>
                </div>
              </div>

              {!areStaffCardsMinimized && (
                <>
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

                  {/* Add Staff Button */}
                  <button
                    onClick={() => {
                      // TODO: Handle staff submission
                      console.log('Add Staff clicked');
                    }}
                    className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/50"
                    data-testid="button-add-staff"
                  >
                    Add Staff
                  </button>
                </>
              )}
            </div>

            {/* Emergency Contact Card */}
            {!areStaffCardsMinimized && (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Emergency</h2>
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
            )}

            {/* Scope & Permissions Card */}
            {!areStaffCardsMinimized && (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Role</h2>
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
            )}

            {/* HR & Compliance Card */}
            {!areStaffCardsMinimized && (
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Compliance</h2>
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
                    Source
                  </label>
                  <select 
                    value={interviewGrade}
                    onChange={(e) => setInterviewGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="referral">Referral</option>
                    <option value="return">Return</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="indeed">Indeed</option>
                  </select>
                </div>
              </div>
            </div>
            )}
          </>
        )}

        {/* Search Card - Only shown when Marketing category is selected and showQueryCard is true */}
        {categoryFilter === 'marketing' && showQueryCard && (
          <TooltipProvider>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <Search className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Search</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setShowBatchList(true);
                      console.log('Search Batch clicked with Data Category:', dataCategory);
                    }}
                    className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-purple-500/50"
                    data-testid="button-search-batch"
                  >
                    Search Batch
                  </button>
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
                  <button
                    onClick={() => {
                      setShowQueryCard(false);
                      setShowBatchList(false); // Also hide Batch List when closing Search card
                    }}
                    className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                    title="Close Search"
                    data-testid="button-close-search-marketing"
                  >
                    <X className="w-5 h-5 text-purple-300" />
                  </button>
                </div>
              </div>
              {!isQueryCardMinimized && (
                <div>
                  {/* Row 1 */}
                  <div className="grid grid-cols-5 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label className="text-purple-200">Data Category</Label>
                      <select 
                        value={dataCategory}
                        onChange={(e) => setDataCategory(e.target.value)}
                        data-testid="select-data-category"
                        className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="Select">Select</option>
                        <option value="Show All">Show All</option>
                        <option value="Trigger Data">Trigger Data</option>
                        <option value="Monthly Data">Monthly Data</option>
                      </select>
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
                      <select 
                        defaultValue="show-all"
                        data-testid="select-loan-category"
                        className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="show-all">Show All</option>
                        <option value="va">VA</option>
                        <option value="va-jumbo">VA Jumbo</option>
                        <option value="conventional">Conventional</option>
                        <option value="conventional-jumbo">Conventional Jumbo</option>
                        <option value="fha">FHA</option>
                        <option value="second-loan">Second Loan</option>
                        <option value="non-qm">Non-QM</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Loan Purpose</Label>
                      <select 
                        defaultValue="show-all"
                        data-testid="select-loan-purpose"
                        className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="show-all">Show All</option>
                        <option value="cash-out">Cash Out</option>
                        <option value="rate-term">Rate & Term</option>
                        <option value="purchase">Purchase</option>
                        <option value="streamline">Streamline</option>
                        <option value="irrrl">IRRRL</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Property Use</Label>
                      <select 
                        defaultValue="show-all"
                        data-testid="select-property-use"
                        className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="show-all">Show All</option>
                        <option value="primary-residence">Primary Residence</option>
                        <option value="second-home">Second Home</option>
                        <option value="investment-property">Investment Property</option>
                        <option value="home-purchase">Home Purchase</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-5 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label className="text-purple-200">Property Type</Label>
                      <select 
                        defaultValue="show-all"
                        data-testid="select-property-type"
                        className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="show-all">Show All</option>
                        <option value="single-family">Single Family</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="duplex-multi-family">Duplex, Multi-Family</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Lenders</Label>
                      <select 
                        defaultValue="show-all"
                        data-testid="select-lenders"
                        className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="show-all">Show All</option>
                        <option value="uwm">UWM</option>
                        <option value="pennymac">Pennymac</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Data Vendors</Label>
                      <select 
                        defaultValue="show-all"
                        data-testid="select-data-vendors"
                        className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="show-all">Show All</option>
                        <option value="in-house">In-House</option>
                        <option value="tbd">TBD</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Mail Vendors</Label>
                      <select 
                        defaultValue="show-all"
                        data-testid="select-mail-vendors"
                        className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="show-all">Show All</option>
                        <option value="in-house">In-House</option>
                        <option value="tbd">TBD</option>
                      </select>
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
                      <Label className="text-purple-200">Batch Financials</Label>
                      <select 
                        value={batchResults}
                        onChange={(e) => setBatchResults(e.target.value as '' | 'profitable' | 'loss')}
                        data-testid="select-batch-financials"
                        className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select</option>
                        <option value="profitable">Profitable</option>
                        <option value="loss">Loss</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TooltipProvider>
        )}

        {/* Financials Search Card - Only shown when Financials category with Expense team is selected and showFinancialsSearch is true */}
        {categoryFilter === 'financials' && teamFilter === 'expense-add' && showFinancialsSearch && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Search className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Search</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Date Filter Dropdown */}
                <select 
                  value={transactionDateFilter}
                  onChange={(e) => setTransactionDateFilter(e.target.value)}
                  className="bg-slate-700/50 text-purple-300 px-3 py-1.5 text-sm rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                  data-testid="select-transaction-date-filter"
                >
                  <option value="today">Today</option>
                  <option value="mtd">MTD</option>
                  <option value="ytd">YTD</option>
                  <option value="dateRange">Date Range</option>
                </select>
                <button 
                  onClick={() => {
                    setFinancialsSearchParams({
                      logDate: '',
                      transactionDate: '',
                      clearDate: '',
                      amount: '',
                      payee: '',
                      paymentFor: '',
                      invoiceNum: '',
                      checkNum: '',
                      paymentMethod: '',
                      paymentTerm: '',
                      vendor: '',
                      area: '',
                      date: '',
                      services: '',
                      role: ''
                    });
                    setShowTransactionsCard(false); // Hide Transactions card when filters are cleared
                  }}
                  className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors bg-slate-700/50 text-white border border-slate-600 hover:bg-slate-700"
                  data-testid="button-clear-filters-financials"
                >
                  Clear Filters
                </button>
                <button 
                  onClick={() => {
                    // Calculate visible columns based on filled search fields
                    const visibleCols: string[] = [];
                    if (financialsSearchParams.logDate) visibleCols.push('logDate');
                    if (financialsSearchParams.transactionDate) visibleCols.push('transactionDate');
                    if (financialsSearchParams.clearDate) visibleCols.push('clearanceDate');
                    if (financialsSearchParams.amount) visibleCols.push('expense');
                    if (financialsSearchParams.invoiceNum) visibleCols.push('invoiceNumber');
                    if (financialsSearchParams.checkNum) visibleCols.push('checkNumber');
                    if (financialsSearchParams.paymentMethod) visibleCols.push('paidWith');
                    if (financialsSearchParams.paymentTerm) visibleCols.push('paymentTerm');
                    if (financialsSearchParams.paymentFor) visibleCols.push('expenseCategory');
                    if (financialsSearchParams.area) visibleCols.push('area');
                    if (financialsSearchParams.vendor) visibleCols.push('paidTo');
                    if (financialsSearchParams.payee) visibleCols.push('payee');
                    
                    setVisibleTransactionColumns(visibleCols.length > 0 ? visibleCols : ['all']);
                    setShowTransactionsCard(true);
                    setIsTransactionsMinimized(false);
                  }}
                  className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-purple-500/50"
                  data-testid="button-search-expense"
                >
                  Search Expense
                </button>
                <button
                  onClick={() => setIsFinancialsSearchMinimized(!isFinancialsSearchMinimized)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isFinancialsSearchMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-financials-search"
                >
                  {isFinancialsSearchMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowFinancialsSearch(false)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Close Search"
                  data-testid="button-close-search-financials"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </button>
              </div>
            </div>
            
            {!isFinancialsSearchMinimized && (
              <div>
                {/* Date Range Inputs - shown when Date Range is selected */}
                {transactionDateFilter === 'dateRange' && (
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-purple-500/30">
                    <div className="flex items-center gap-2">
                      <label className="text-purple-300 text-sm">From Date:</label>
                      <input
                        type="text"
                        placeholder="MM/DD/YYYY"
                        value={transactionDateRange.fromDate}
                        onChange={(e) => handleTransactionDateInput(e, 'fromDate')}
                        className="bg-slate-700/50 text-white px-3 py-1.5 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm"
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
                        className="bg-slate-700/50 text-white px-3 py-1.5 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                        data-testid="input-to-date"
                        maxLength={10}
                      />
                    </div>
                  </div>
                )}
                
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Log Date</label>
                    <input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      value={financialsSearchParams.logDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        if (value.length >= 5) {
                          value = value.slice(0, 5) + '/' + value.slice(5);
                        }
                        if (value.length > 10) {
                          value = value.slice(0, 10);
                        }
                        setFinancialsSearchParams({ ...financialsSearchParams, logDate: value });
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-financials-log-date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Transaction Date</label>
                    <input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      value={financialsSearchParams.transactionDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        if (value.length >= 5) {
                          value = value.slice(0, 5) + '/' + value.slice(5);
                        }
                        if (value.length > 10) {
                          value = value.slice(0, 10);
                        }
                        setFinancialsSearchParams({ ...financialsSearchParams, transactionDate: value });
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-financials-transaction-date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Clear Date</label>
                    <input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      value={financialsSearchParams.clearDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        if (value.length >= 5) {
                          value = value.slice(0, 5) + '/' + value.slice(5);
                        }
                        if (value.length > 10) {
                          value = value.slice(0, 10);
                        }
                        setFinancialsSearchParams({ ...financialsSearchParams, clearDate: value });
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-financials-clear-date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Amount</label>
                    <input
                      type="text"
                      placeholder="$0"
                      value={financialsSearchParams.amount}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^0-9]/g, '');
                        if (value) {
                          const formatted = '$' + parseInt(value).toLocaleString('en-US');
                          setFinancialsSearchParams({ ...financialsSearchParams, amount: formatted });
                        } else {
                          setFinancialsSearchParams({ ...financialsSearchParams, amount: '' });
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-financials-amount"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Invoice #</label>
                    <input
                      type="text"
                      placeholder="Enter invoice number"
                      value={financialsSearchParams.invoiceNum}
                      onChange={(e) => setFinancialsSearchParams({ ...financialsSearchParams, invoiceNum: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-financials-invoice"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Check #</label>
                    <input
                      type="text"
                      placeholder="Enter check number"
                      value={financialsSearchParams.checkNum}
                      onChange={(e) => setFinancialsSearchParams({ ...financialsSearchParams, checkNum: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-financials-check"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Payment Method</label>
                    <select
                      value={financialsSearchParams.paymentMethod}
                      onChange={(e) => setFinancialsSearchParams({ ...financialsSearchParams, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      data-testid="select-financials-payment-method"
                    >
                      <option value="">Select</option>
                      <option value="zelle">Zelle</option>
                      <option value="venmo">Venmo</option>
                      <option value="wire">Wire</option>
                      <option value="check">Check</option>
                      <option value="cash">Cash</option>
                      <option value="directdeposit">Direct Deposit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Payment Term</label>
                    <select
                      value={financialsSearchParams.paymentTerm}
                      onChange={(e) => setFinancialsSearchParams({ ...financialsSearchParams, paymentTerm: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      data-testid="select-financials-payment-term"
                    >
                      <option value="">Select</option>
                      <option value="onetime">One-Time</option>
                      <option value="recurring">Recurring</option>
                    </select>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Category</label>
                    <select
                      value={financialsSearchParams.paymentFor}
                      onChange={(e) => setFinancialsSearchParams({ ...financialsSearchParams, paymentFor: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      data-testid="select-financials-payment-for"
                    >
                      <option value="">Select</option>
                      <option value="tbd">TBD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Area</label>
                    <select
                      value={financialsSearchParams.area}
                      onChange={(e) => setFinancialsSearchParams({ ...financialsSearchParams, area: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      data-testid="select-financials-area"
                    >
                      <option value="">Select</option>
                      <option value="company">Company</option>
                      <option value="partner">Partner</option>
                      <option value="branch">Branch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Paid To</label>
                    <select
                      value={financialsSearchParams.vendor}
                      onChange={(e) => setFinancialsSearchParams({ ...financialsSearchParams, vendor: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      data-testid="select-financials-vendor"
                    >
                      <option value="">Select</option>
                      <option value="tbd">TBD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Payee</label>
                    <input
                      type="text"
                      placeholder="Enter payee name"
                      value={financialsSearchParams.payee}
                      onChange={(e) => setFinancialsSearchParams({ ...financialsSearchParams, payee: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-financials-payee"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revenue Search Card - Only shown when Financials category with Revenue team is selected and showRevenueSearch is true */}
        {categoryFilter === 'financials' && teamFilter === 'revenue-add' && showRevenueSearch && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Search</h2>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={transactionDateFilter}
                  onChange={(e) => setTransactionDateFilter(e.target.value)}
                  className="bg-slate-700/50 text-purple-300 px-3 py-1.5 text-sm rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
                  data-testid="select-revenue-date-filter"
                >
                  <option value="today">Today</option>
                  <option value="mtd">MTD</option>
                  <option value="ytd">YTD</option>
                  <option value="dateRange">Date Range</option>
                </select>

                {transactionDateFilter === 'dateRange' && (
                  <>
                    <input
                      type="text"
                      placeholder="From (MM/DD/YYYY)"
                      value={transactionDateRange.fromDate}
                      onChange={(e) => handleTransactionDateInput(e, 'fromDate')}
                      className="bg-slate-700/50 text-white px-3 py-1.5 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm w-36"
                      data-testid="input-revenue-from-date-search"
                    />
                    <input
                      type="text"
                      placeholder="To (MM/DD/YYYY)"
                      value={transactionDateRange.toDate}
                      onChange={(e) => handleTransactionDateInput(e, 'toDate')}
                      className="bg-slate-700/50 text-white px-3 py-1.5 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm w-36"
                      data-testid="input-revenue-to-date-search"
                    />
                  </>
                )}

                <button 
                  onClick={() => {
                    setRevenueSearchParams({
                      paymentDate: '',
                      source: '',
                      amount: '',
                      referenceNum: '',
                      paymentMethod: '',
                      purpose: '',
                      term: '',
                      status: ''
                    });
                    setShowRevenueTransactionsCard(false); // Hide Transactions card when filters are cleared
                  }}
                  className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors bg-slate-700/50 text-white border border-slate-600 hover:bg-slate-700"
                  data-testid="button-clear-filters-revenue"
                >
                  Clear Filters
                </button>
                <button 
                  onClick={() => {
                    // Calculate visible columns based on filled search fields with proper mapping
                    const visibleCols: string[] = [];
                    
                    // Map revenue search params to actual column names
                    // Row 1 search fields (based on the search card structure):
                    // - Log Date field uses 'purpose' param → maps to 'logDate' column
                    // - Transaction Date field uses 'paymentDate' param → maps to 'transactionDate' column  
                    // - Clear Date field uses 'term' param → maps to 'clearanceDate' column
                    // - Reference # field uses 'referenceNum' param → maps to 'paymentForm' column
                    // Row 2 search fields:
                    // - Revenue Category field uses 'source' param → maps to 'revenueCategory' column
                    // - Revenue Source field uses 'status' param → maps to 'revenueTerm' column
                    // - Payment Method field uses 'paymentMethod' param → maps to 'paymentFrom' column
                    // - Amount field uses 'amount' param → maps to 'revenue' column
                    
                    if (revenueSearchParams.purpose) visibleCols.push('logDate');
                    if (revenueSearchParams.paymentDate) visibleCols.push('transactionDate');
                    if (revenueSearchParams.term) visibleCols.push('clearanceDate');
                    if (revenueSearchParams.referenceNum) visibleCols.push('paymentForm');
                    if (revenueSearchParams.source) visibleCols.push('revenueCategory');
                    if (revenueSearchParams.status) visibleCols.push('revenueTerm');
                    if (revenueSearchParams.paymentMethod) visibleCols.push('paymentFrom');
                    if (revenueSearchParams.amount) visibleCols.push('revenue');
                    
                    // Always show Actions column
                    visibleCols.push('actions');
                    
                    // If no fields filled, show all columns
                    if (visibleCols.length === 1) { // only 'actions' was added
                      setVisibleRevenueColumns(['all']);
                    } else {
                      setVisibleRevenueColumns(visibleCols);
                    }
                    
                    // Show the Transactions card
                    setShowRevenueTransactionsCard(true);
                    setIsRevenueTransactionsMinimized(false);
                  }}
                  className="px-3.5 py-1.5 text-sm rounded-lg font-medium transition-all text-white shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-purple-500/50"
                  data-testid="button-search-revenue"
                >
                  Search Revenue
                </button>
                <button
                  onClick={() => setIsRevenueSearchMinimized(!isRevenueSearchMinimized)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isRevenueSearchMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-revenue-search"
                >
                  {isRevenueSearchMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowRevenueSearch(false)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Close Search"
                  data-testid="button-close-search-revenue"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </button>
              </div>
            </div>
            
            {!isRevenueSearchMinimized && (
              <div>
                {/* Row 1: Log Date, Transaction Date, Clear Date, Reference # */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Log Date</label>
                    <input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      value={revenueSearchParams.purpose}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        if (value.length >= 5) {
                          value = value.slice(0, 5) + '/' + value.slice(5);
                        }
                        if (value.length > 10) {
                          value = value.slice(0, 10);
                        }
                        setRevenueSearchParams({ ...revenueSearchParams, purpose: value });
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-revenue-log-date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Transaction Date</label>
                    <input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      value={revenueSearchParams.paymentDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        if (value.length >= 5) {
                          value = value.slice(0, 5) + '/' + value.slice(5);
                        }
                        if (value.length > 10) {
                          value = value.slice(0, 10);
                        }
                        setRevenueSearchParams({ ...revenueSearchParams, paymentDate: value });
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-revenue-payment-date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Clear Date</label>
                    <input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      value={revenueSearchParams.term}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        if (value.length >= 5) {
                          value = value.slice(0, 5) + '/' + value.slice(5);
                        }
                        if (value.length > 10) {
                          value = value.slice(0, 10);
                        }
                        setRevenueSearchParams({ ...revenueSearchParams, term: value });
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-revenue-clear-date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Reference #</label>
                    <input
                      type="text"
                      placeholder="Enter reference number"
                      value={revenueSearchParams.referenceNum}
                      onChange={(e) => setRevenueSearchParams({ ...revenueSearchParams, referenceNum: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                      data-testid="input-revenue-reference"
                    />
                  </div>
                </div>

                {/* Row 2: Revenue Category, Payment Source, Payment Method, Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Revenue Category</label>
                    <select
                      value={revenueSearchParams.source}
                      onChange={(e) => setRevenueSearchParams({ ...revenueSearchParams, source: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      data-testid="select-revenue-source"
                    >
                      <option value="">Select</option>
                      <option value="tbd">TBD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Revenue Source</label>
                    <select
                      value={revenueSearchParams.status}
                      onChange={(e) => setRevenueSearchParams({ ...revenueSearchParams, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      data-testid="select-revenue-source-field"
                    >
                      <option value="">Select</option>
                      <option value="first-american">First American</option>
                      <option value="reltco">Reltco</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Payment Method</label>
                    <select
                      value={revenueSearchParams.paymentMethod}
                      onChange={(e) => setRevenueSearchParams({ ...revenueSearchParams, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                      data-testid="select-revenue-payment-method"
                    >
                      <option value="">Select</option>
                      <option value="zelle">Zelle</option>
                      <option value="venmo">Venmo</option>
                      <option value="wire">Wire</option>
                      <option value="check">Check</option>
                      <option value="cash">Cash</option>
                      <option value="directdeposit">Direct Deposit</option>
                      <option value="creditcard">Credit Card</option>
                      <option value="ach">ACH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-purple-300">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="text"
                        placeholder="0"
                        value={revenueSearchParams.amount}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^0-9]/g, '');
                          if (value) {
                            value = parseInt(value).toLocaleString('en-US');
                            setRevenueSearchParams({ ...revenueSearchParams, amount: value });
                          } else {
                            setRevenueSearchParams({ ...revenueSearchParams, amount: '' });
                          }
                        }}
                        className="w-full pl-8 pr-4 py-2.5 rounded-lg border bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-500"
                        data-testid="input-revenue-amount"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Batch List Table - Only shown when Marketing is selected with non-Show All Team and Search Batch is clicked */}
        {categoryFilter === 'marketing' && teamFilter !== 'show-all' && showBatchList && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Batch List</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBatchListMinimized(!isBatchListMinimized)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isBatchListMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-batch-list"
                >
                  {isBatchListMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowBatchList(false)}
                  className="text-purple-300 hover:text-white transition-colors"
                  data-testid="button-close-batch-list"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            {!isBatchListMinimized && (
              <>
                {sortedBatches.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-purple-300">No batches created yet</p>
                  </div>
                ) : (
                  <>
                    {/* Custom Scrollbar Track */}
                    <div className="mb-4">
                      <div 
                        className="h-2 rounded-full overflow-hidden cursor-pointer bg-slate-700/50"
                        style={{ position: 'relative' }}
                        onClick={(e) => {
                          const tableContainer = e.currentTarget.parentElement?.nextElementSibling as HTMLDivElement;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const percentage = clickX / rect.width;
                          tableContainer.scrollLeft = percentage * (tableContainer.scrollWidth - tableContainer.clientWidth);
                        }}
                      >
                        <div 
                          id="batch-scroll-indicator"
                          className="h-full rounded-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: '30%', cursor: 'grab' }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const indicator = e.currentTarget;
                            const track = indicator.parentElement as HTMLDivElement;
                            const tableContainer = track.parentElement?.nextElementSibling as HTMLDivElement;
                            
                            indicator.style.cursor = 'grabbing';
                            const startX = e.clientX;
                            const startScrollLeft = tableContainer.scrollLeft;
                            const trackWidth = track.offsetWidth;
                            const scrollWidth = tableContainer.scrollWidth - tableContainer.clientWidth;
                            
                            const handleMouseMove = (e: MouseEvent) => {
                              const deltaX = e.clientX - startX;
                              const scrollDelta = (deltaX / trackWidth) * scrollWidth;
                              tableContainer.scrollLeft = startScrollLeft + scrollDelta;
                            };
                            
                            const handleMouseUp = () => {
                              indicator.style.cursor = 'grab';
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-slate-400">
                        ← Drag or click the scrollbar to navigate →
                      </p>
                    </div>

                    <div 
                      className="overflow-x-auto scrollbar-custom"
                      onScroll={(e) => {
                        const scrollPercentage = e.currentTarget.scrollLeft / (e.currentTarget.scrollWidth - e.currentTarget.clientWidth);
                        const indicator = document.getElementById('batch-scroll-indicator');
                        if (indicator) {
                          const thumbWidth = (e.currentTarget.clientWidth / e.currentTarget.scrollWidth) * 100;
                          indicator.style.width = `${Math.max(thumbWidth, 10)}%`;
                          indicator.style.transform = `translateX(${scrollPercentage * (100 / thumbWidth - 1)}%)`;
                        }
                      }}
                    >
                      <table className="w-full min-w-max">
                        <thead>
                          <tr className="border-b border-purple-500/30">
                            {activeBatchColumns.map((column) => (
                              <th 
                                key={column.key}
                                onClick={() => handleBatchSort(column.key)}
                                className="text-left py-3 px-4 cursor-pointer transition-colors min-w-[130px] text-purple-300 hover:text-purple-200"
                              >
                                <div className="flex items-center gap-2">
                                  {column.label}
                                  <ArrowUpDown className="w-4 h-4" />
                                </div>
                              </th>
                            ))}
                            <th className="text-center text-purple-300 font-semibold py-3 px-4">
                              <Paperclip className="w-4 h-4 mx-auto" />
                            </th>
                            <th className="text-left text-purple-300 font-semibold py-3 px-4">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedBatches.map((batch: any) => {
                            const totalCost = (parseInt(batch.dataCost) || 0) + (parseInt(batch.mailCost) || 0) + (parseInt(batch.printCost) || 0) + (parseInt(batch.supplyCost) || 0);
                            const stateCount = batch.states?.length || 0;
                            
                            return (
                              <tr key={batch.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                {activeBatchColumns.map((column) => {
                                  let value: any = batch[column.key];
                                  
                                  // Format values based on column type
                                  if (column.key === 'cost') {
                                    value = `$${totalCost.toLocaleString()}`;
                                  } else if (column.key === 'records') {
                                    // Display actual count from excelData array, not the stored records field
                                    value = (batch.excelData?.length || batch.records || 0).toLocaleString();
                                  } else if (column.key === 'states' && stateCount > 0) {
                                    return (
                                      <td key={column.key} className="py-3 px-4 text-slate-300">
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
                                    );
                                  } else if (column.key === 'tenYearBond' || column.key === 'parRate') {
                                    value = value ? `${value}%` : '';
                                  }
                                  
                                  const isCostColumn = column.key === 'cost';
                                  const isTitleColumn = column.key === 'batchTitle' || column.key === 'batchNumber';
                                  
                                  return (
                                    <td 
                                      key={column.key}
                                      className={`py-3 px-4 ${
                                        isTitleColumn 
                                          ? 'font-medium text-white' 
                                          : isCostColumn
                                          ? 'font-semibold text-emerald-500'
                                          : 'text-slate-300'
                                      }`}
                                    >
                                      {value}
                                    </td>
                                  );
                                })}
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => {
                                      setSelectedBatchId(batch.id);
                                      setShowBatchAttachmentsDialog(true);
                                    }}
                                    className="flex items-center gap-1 text-purple-300 hover:text-white transition-colors mx-auto"
                                    data-testid={`button-batch-attachments-${batch.id}`}
                                  >
                                    <BatchAttachmentCount transactionId={batch.id} />
                                  </button>
                                </td>
                                <td className="py-3 px-4 relative">
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
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Create New Batch Card - Only shown when Marketing with non-Show All Team is selected and Add New Batch is clicked */}
        {categoryFilter === 'marketing' && teamFilter !== 'show-all' && showCreateBatch && (
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
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Stamp className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Expense log</h3>
              </div>
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
                    <option value="" disabled>Payment Method</option>
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
        {categoryFilter === 'financials' && teamFilter === 'expense-add' && showTransactionsCard && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl animate-roll-down">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Transactions</h3>
              </div>
              <div className="flex items-center gap-2">
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
                <button
                  onClick={() => setShowTransactionsCard(false)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Close"
                  data-testid="button-close-transactions"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </button>
              </div>
            </div>
            
            {/* Separation line */}
            {!isTransactionsMinimized && <div className="border-t border-purple-500/30 my-6"></div>}

            {!isTransactionsMinimized && (
              <>
                {/* Custom Scrollbar Track */}
                <div className="mb-4">
                  <div 
                    className="h-2 rounded-full overflow-hidden cursor-pointer bg-slate-700/50"
                    style={{ position: 'relative' }}
                    onClick={(e) => {
                      const tableContainer = e.currentTarget.parentElement?.nextElementSibling as HTMLDivElement;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = clickX / rect.width;
                      tableContainer.scrollLeft = percentage * (tableContainer.scrollWidth - tableContainer.clientWidth);
                    }}
                  >
                    <div 
                      id="transactions-scroll-indicator"
                      className="h-full rounded-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: '30%', cursor: 'grab' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const indicator = e.currentTarget;
                        const track = indicator.parentElement as HTMLDivElement;
                        const tableContainer = track.parentElement?.nextElementSibling as HTMLDivElement;
                        
                        indicator.style.cursor = 'grabbing';
                        const startX = e.clientX;
                        const startScrollLeft = tableContainer.scrollLeft;
                        const trackWidth = track.offsetWidth;
                        const scrollWidth = tableContainer.scrollWidth - tableContainer.clientWidth;
                        
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          const scrollDelta = (deltaX / trackWidth) * scrollWidth;
                          tableContainer.scrollLeft = startScrollLeft + scrollDelta;
                        };
                        
                        const handleMouseUp = () => {
                          indicator.style.cursor = 'grab';
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-slate-400">
                    ← Drag or click the scrollbar to navigate →
                  </p>
                </div>

                <div 
                  className="overflow-x-auto scrollbar-custom"
                  onScroll={(e) => {
                    const scrollPercentage = e.currentTarget.scrollLeft / (e.currentTarget.scrollWidth - e.currentTarget.clientWidth);
                    const indicator = document.getElementById('transactions-scroll-indicator');
                    if (indicator) {
                      const thumbWidth = (e.currentTarget.clientWidth / e.currentTarget.scrollWidth) * 100;
                      indicator.style.width = `${Math.max(thumbWidth, 10)}%`;
                      indicator.style.transform = `translateX(${scrollPercentage * (100 / thumbWidth - 1)}%)`;
                    }
                  }}
                >
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-purple-500/30">
                      {isColumnVisible('logDate') && (
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
                      )}
                      {isColumnVisible('transactionDate') && (
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
                      )}
                      {isColumnVisible('clearanceDate') && (
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
                      )}
                      {isColumnVisible('invoiceNumber') && (
                        <th 
                          className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                          onClick={() => handleSort('invoiceNumber')}
                          data-testid="header-invoice-number"
                        >
                          <div className="flex items-center gap-1">
                            Invoice #
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </th>
                      )}
                      {isColumnVisible('checkNumber') && (
                        <th 
                          className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                          onClick={() => handleSort('checkNumber')}
                          data-testid="header-check-number"
                        >
                          <div className="flex items-center gap-1">
                            Check #
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </th>
                      )}
                      {isColumnVisible('paidWith') && (
                        <th 
                          className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                          onClick={() => handleSort('paidWith')}
                          data-testid="header-paid-by"
                        >
                          <div className="flex items-center gap-1">
                            Payment Method
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </th>
                      )}
                      {isColumnVisible('paymentTerm') && (
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
                      )}
                      {isColumnVisible('expenseCategory') && (
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
                      )}
                      {isColumnVisible('area') && (
                        <th 
                          className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                          onClick={() => handleSort('area')}
                          data-testid="header-area"
                        >
                          <div className="flex items-center gap-1">
                            Area
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </th>
                      )}
                      {isColumnVisible('paidTo') && (
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
                      )}
                      {isColumnVisible('payee') && (
                        <th 
                          className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                          onClick={() => handleSort('payee')}
                          data-testid="header-payee"
                        >
                          <div className="flex items-center gap-1">
                            Payee
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </th>
                      )}
                      {isColumnVisible('expense') && (
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
                      )}
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
                        {isColumnVisible('logDate') && <td className="py-3 px-2 text-purple-200">{entry.logDate}</td>}
                        {isColumnVisible('transactionDate') && <td className="py-3 px-2 text-purple-200">{entry.transactionDate}</td>}
                        {isColumnVisible('clearanceDate') && <td className="py-3 px-2 text-purple-200">{entry.clearanceDate}</td>}
                        {isColumnVisible('invoiceNumber') && <td className="py-3 px-2 text-purple-200">{entry.invoiceNumber || '-'}</td>}
                        {isColumnVisible('checkNumber') && <td className="py-3 px-2 text-purple-200">{entry.checkNumber || '-'}</td>}
                        {isColumnVisible('paidWith') && <td className="py-3 px-2 text-purple-200">{entry.paidWith}</td>}
                        {isColumnVisible('paymentTerm') && <td className="py-3 px-2 text-purple-200">{entry.paymentTerm || '-'}</td>}
                        {isColumnVisible('expenseCategory') && <td className="py-3 px-2 text-purple-200">{entry.expenseCategory}</td>}
                        {isColumnVisible('area') && <td className="py-3 px-2 text-purple-200">{entry.area || '-'}</td>}
                        {isColumnVisible('paidTo') && <td className="py-3 px-2 text-purple-200">{entry.paidTo}</td>}
                        {isColumnVisible('payee') && <td className="py-3 px-2 text-purple-200">{entry.payee || '-'}</td>}
                        {isColumnVisible('expense') && <td className="py-3 px-2 font-semibold text-emerald-500">{entry.expense}</td>}
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
              </>
            )}
          </div>
        )}

        {/* Revenue Log - Similar structure to Expense Log */}
        {showRevenueForm && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl animate-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Stamp className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Revenue log</h3>
              </div>
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
                {/* First Row: Log Date, Transaction Date, Clear Date, Reference # */}
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
                  <input
                    type="text"
                    value={newRevenue.revenueCategory}
                    onChange={(e) => setNewRevenue({ ...newRevenue, revenueCategory: e.target.value })}
                    placeholder="Reference #"
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors placeholder-slate-500"
                    data-testid="input-reference-number"
                  />
                </div>

                {/* Second Row: Revenue Category, Revenue Source, Payment Method, Amount */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <select
                    value={newRevenue.revenueTerm}
                    onChange={(e) => setNewRevenue({ ...newRevenue, revenueTerm: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-revenue-term"
                  >
                    <option value="" disabled>Revenue Category</option>
                    <option value="Select">Select</option>
                    <option value="First American">First American</option>
                    <option value="Reltco">Reltco</option>
                  </select>
                  <select
                    value={newRevenue.paymentFrom}
                    onChange={(e) => setNewRevenue({ ...newRevenue, paymentFrom: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-revenue-source"
                  >
                    <option value="" disabled>Revenue Source</option>
                    <option value="Select">Select</option>
                    <option value="TBD">TBD</option>
                  </select>
                  <select
                    value={newRevenue.paymentForm}
                    onChange={(e) => setNewRevenue({ ...newRevenue, paymentForm: e.target.value })}
                    className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors"
                    data-testid="select-payment-form"
                  >
                    <option value="" disabled>Payment Method</option>
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
        {categoryFilter === 'financials' && teamFilter === 'revenue-add' && showRevenueTransactionsCard && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl animate-roll-down">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Transactions</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRevenueTransactionsMinimized(!isRevenueTransactionsMinimized)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title={isRevenueTransactionsMinimized ? "Expand" : "Minimize"}
                  data-testid="button-toggle-revenue-transactions"
                >
                  {isRevenueTransactionsMinimized ? (
                    <Plus className="w-5 h-5 text-purple-300" />
                  ) : (
                    <Minus className="w-5 h-5 text-purple-300" />
                  )}
                </button>
                <button
                  onClick={() => setShowRevenueTransactionsCard(false)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/30"
                  title="Close"
                  data-testid="button-close-revenue-transactions"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </button>
              </div>
            </div>
            
            {/* Separation line */}
            {!isRevenueTransactionsMinimized && <div className="border-t border-purple-500/30 my-6"></div>}

            {!isRevenueTransactionsMinimized && (
              <>
                {/* Custom Scrollbar Track */}
                <div className="mb-4">
                  <div 
                    className="h-2 rounded-full overflow-hidden cursor-pointer bg-slate-700/50"
                    style={{ position: 'relative' }}
                    onClick={(e) => {
                      const tableContainer = e.currentTarget.parentElement?.nextElementSibling as HTMLDivElement;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = clickX / rect.width;
                      tableContainer.scrollLeft = percentage * (tableContainer.scrollWidth - tableContainer.clientWidth);
                    }}
                  >
                    <div 
                      id="revenue-transactions-scroll-indicator"
                      className="h-full rounded-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: '30%', cursor: 'grab' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const indicator = e.currentTarget;
                        const track = indicator.parentElement as HTMLDivElement;
                        const tableContainer = track.parentElement?.nextElementSibling as HTMLDivElement;
                        
                        indicator.style.cursor = 'grabbing';
                        const startX = e.clientX;
                        const startScrollLeft = tableContainer.scrollLeft;
                        const trackWidth = track.offsetWidth;
                        const scrollWidth = tableContainer.scrollWidth - tableContainer.clientWidth;
                        
                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          const scrollDelta = (deltaX / trackWidth) * scrollWidth;
                          tableContainer.scrollLeft = startScrollLeft + scrollDelta;
                        };
                        
                        const handleMouseUp = () => {
                          indicator.style.cursor = 'grab';
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-slate-400">
                    ← Drag or click the scrollbar to navigate →
                  </p>
                </div>

                <div 
                  className="overflow-x-auto scrollbar-custom"
                  onScroll={(e) => {
                    const scrollPercentage = e.currentTarget.scrollLeft / (e.currentTarget.scrollWidth - e.currentTarget.clientWidth);
                    const indicator = document.getElementById('revenue-transactions-scroll-indicator');
                    if (indicator) {
                      const thumbWidth = (e.currentTarget.clientWidth / e.currentTarget.scrollWidth) * 100;
                      indicator.style.width = `${Math.max(thumbWidth, 10)}%`;
                      indicator.style.transform = `translateX(${scrollPercentage * (100 / thumbWidth - 1)}%)`;
                    }
                  }}
                >
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-purple-500/30">
                      {isRevenueColumnVisible('logDate') && (
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
                      )}
                      {isRevenueColumnVisible('transactionDate') && (
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
                      )}
                      {isRevenueColumnVisible('clearanceDate') && (
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
                      )}
                      {isRevenueColumnVisible('paymentForm') && (
                        <th 
                          className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                          onClick={() => handleSort('paymentForm')}
                          data-testid="header-reference-number"
                        >
                          <div className="flex items-center gap-1">
                            Reference #
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </th>
                      )}
                      {isRevenueColumnVisible('revenueCategory') && (
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
                      )}
                      {isRevenueColumnVisible('revenueTerm') && (
                        <th 
                          className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                          onClick={() => handleSort('revenueTerm')}
                          data-testid="header-revenue-source"
                        >
                          <div className="flex items-center gap-1">
                            Revenue Source
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </th>
                      )}
                      {isRevenueColumnVisible('paymentFrom') && (
                        <th 
                          className="text-left text-purple-300 font-semibold py-3 px-2 cursor-pointer hover:text-purple-200"
                          onClick={() => handleSort('paymentFrom')}
                          data-testid="header-payment-method"
                        >
                          <div className="flex items-center gap-1">
                            Payment Method
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </th>
                      )}
                      {isRevenueColumnVisible('revenue') && (
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
                      )}
                      <th className="text-center text-purple-300 font-semibold py-3 px-2">
                        <Paperclip className="w-4 h-4 mx-auto" />
                      </th>
                      {isRevenueColumnVisible('actions') && (
                        <th className="text-left text-purple-300 font-semibold py-3 px-2">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRevenues.map((entry: any) => (
                      <tr 
                        key={entry.id} 
                        className="border-b border-purple-500/10 hover:bg-slate-700/30 transition-colors"
                        data-testid={`revenue-row-${entry.id}`}
                      >
                        {isRevenueColumnVisible('logDate') && <td className="py-3 px-2 text-purple-200">{entry.logDate}</td>}
                        {isRevenueColumnVisible('transactionDate') && <td className="py-3 px-2 text-purple-200">{entry.transactionDate}</td>}
                        {isRevenueColumnVisible('clearanceDate') && <td className="py-3 px-2 text-purple-200">{entry.clearanceDate}</td>}
                        {isRevenueColumnVisible('paymentForm') && <td className="py-3 px-2 text-purple-200">{entry.paymentForm}</td>}
                        {isRevenueColumnVisible('revenueCategory') && <td className="py-3 px-2 text-purple-200">{entry.revenueCategory}</td>}
                        {isRevenueColumnVisible('revenueTerm') && <td className="py-3 px-2 text-purple-200">{entry.revenueTerm || '-'}</td>}
                        {isRevenueColumnVisible('paymentFrom') && <td className="py-3 px-2 text-purple-200">{entry.paymentFrom}</td>}
                        {isRevenueColumnVisible('revenue') && <td className="py-3 px-2 text-emerald-500">{entry.revenue}</td>}
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
                        {isRevenueColumnVisible('actions') && (
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
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </>
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
                          setTeamFilter('revenue-add'); // Update Team dropdown to match selection
                          setShowRevenueSearch(false); // Close Search Card when Revenue Log opens (mutual exclusivity)
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
                          setShowTransactionsCard(true);
                          setVisibleTransactionColumns(['all']); // Show all columns by default
                          setAreChartsMinimized(true); // Minimize charts to reduce clutter
                          setShowFinancialsSearch(false); // Close search card before opening expense log
                          setTeamFilter('expense-add'); // Update Team dropdown to match selection
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
                      setIsSearchMinimized(true); // Minimize Search card
                      setShowStaffSearch(false); // Close Staff Search card
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
                      setShowQueryCard(false); // Close Search card (mutual exclusivity)
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
              <DialogTitle className="text-xl font-bold text-white">New Batch Card Open</DialogTitle>
              <DialogDescription className="text-purple-200 pt-2">
                Please complete or close the open new batch entry
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

        {/* Staff Warning Dialog */}
        <Dialog open={showStaffWarning} onOpenChange={setShowStaffWarning}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Staff Cards Open</DialogTitle>
              <DialogDescription className="text-purple-200 pt-2">
                Please complete or cancel open staff cards
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setShowStaffWarning(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                data-testid="button-close-staff-warning"
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Vendor Warning Dialog */}
        <Dialog open={showVendorWarning} onOpenChange={setShowVendorWarning}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Add Vendor Card Open</DialogTitle>
              <DialogDescription className="text-purple-200 pt-2">
                Please complete or close the open add vendor request
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setShowVendorWarning(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                data-testid="button-close-vendor-warning"
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Vendor Team Change Warning Dialog */}
        <Dialog open={showVendorTeamWarning} onOpenChange={setShowVendorTeamWarning}>
          <DialogContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Add Vendor Card Open</DialogTitle>
              <DialogDescription className="text-purple-200 pt-2">
                Please complete or close the open add vendor request before changing the team filter
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setShowVendorTeamWarning(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                data-testid="button-close-vendor-team-warning"
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
                Please complete or cancel the open {conflictFormType} log.
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

        {/* Staff Attachments Dialog */}
        <AttachmentsDialog
          open={showStaffAttachmentsDialog}
          onClose={() => setShowStaffAttachmentsDialog(false)}
          transactionId={tempStaffId}
          transactionType="staff"
        />

        {/* Batch Attachments Dialog */}
        <AttachmentsDialog
          open={showBatchAttachmentsDialog}
          onClose={() => setShowBatchAttachmentsDialog(false)}
          transactionId={selectedBatchId || ''}
          transactionType="batch"
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
  transactionType: 'expense' | 'revenue' | 'staff';
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

function StaffAttachmentCount({ transactionId }: { transactionId: string | number }) {
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['/api/transactions', 'staff', transactionId, 'attachments'],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${transactionId}/attachments?transactionType=staff`);
      if (!res.ok) throw new Error('Failed to fetch attachments');
      const result = await res.json();
      return result.data || [];
    },
  });

  if (isLoading) return null;
  if (attachments.length === 0) return <span className="text-purple-300">0</span>;
  
  return (
    <span className="text-purple-300 font-semibold">
      {attachments.length}
    </span>
  );
}

function BatchAttachmentCount({ transactionId }: { transactionId: string | number }) {
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['/api/transactions', 'batch', transactionId, 'attachments'],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${transactionId}/attachments?transactionType=batch`);
      if (!res.ok) throw new Error('Failed to fetch attachments');
      const result = await res.json();
      return result.data || [];
    },
  });

  if (isLoading) return null;
  if (attachments.length === 0) return <span className="text-purple-300">0</span>;
  
  return (
    <span className="text-purple-300 font-semibold">
      {attachments.length}
    </span>
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
  transactionType?: 'expense' | 'revenue' | 'staff' | 'batch';
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
