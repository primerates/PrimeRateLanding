import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Save, Minus, Home, Building, RefreshCw, Loader2, Monitor, Info } from 'lucide-react';
import { SiZillow } from 'react-icons/si';
import { MdRealEstateAgent } from 'react-icons/md';
import { FaHome } from 'react-icons/fa';
import { nanoid } from 'nanoid';
import { insertClientSchema, type InsertClient } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

// US States for dropdown
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

export default function AdminAddClient() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Utility function to lookup county from zip code using backend API
  const lookupCountyFromZip = async (zipCode: string): Promise<Array<{value: string, label: string}>> => {
    if (!zipCode || zipCode.length < 5) return [];
    
    try {
      const response = await fetch(`/api/county-lookup/${zipCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.counties) {
          return data.counties;
        }
      }
      return [];
    } catch (error) {
      console.error('Error looking up county from ZIP code:', error);
      return [];
    }
  };

  // Handler for borrower ZIP code lookup
  const handleBorrowerZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setBorrowerCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, borrower: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      // Auto-fill single county result
      form.setValue('borrower.residenceAddress.county', counties[0].label, { shouldDirty: true });
      setBorrowerCountyOptions([]); // Keep as input field but with value filled
    } else if (counties.length > 1) {
      // Show dropdown for multiple counties
      setBorrowerCountyOptions(counties);
    } else {
      // No counties found, keep as input field
      setBorrowerCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, borrower: false}));
  };

  // Handler for co-borrower ZIP code lookup
  const handleCoBorrowerZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setCoBorrowerCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrower: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      // Auto-fill single county result
      form.setValue('coBorrower.residenceAddress.county', counties[0].label, { shouldDirty: true });
      setCoBorrowerCountyOptions([]); // Keep as input field but with value filled
    } else if (counties.length > 1) {
      // Show dropdown for multiple counties
      setCoBorrowerCountyOptions(counties);
    } else {
      // No counties found, keep as input field
      setCoBorrowerCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrower: false}));
  };

  // Handler for borrower prior ZIP code lookup
  const handleBorrowerPriorZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setBorrowerPriorCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, borrowerPrior: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      // Auto-fill single county result
      form.setValue('borrower.priorResidenceAddress.county', counties[0].label, { shouldDirty: true });
      setBorrowerPriorCountyOptions([]); // Keep as input field but with value filled
    } else if (counties.length > 1) {
      // Show dropdown for multiple counties
      setBorrowerPriorCountyOptions(counties);
    } else {
      // No counties found, keep as input field
      setBorrowerPriorCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, borrowerPrior: false}));
  };

  // Handler for co-borrower prior ZIP code lookup
  const handleCoBorrowerPriorZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setCoBorrowerPriorCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerPrior: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      // Auto-fill single county result
      form.setValue('coBorrower.priorResidenceAddress.county', counties[0].label, { shouldDirty: true });
      setCoBorrowerPriorCountyOptions([]); // Keep as input field but with value filled
    } else if (counties.length > 1) {
      // Show dropdown for multiple counties
      setCoBorrowerPriorCountyOptions(counties);
    } else {
      // No counties found, keep as input field
      setCoBorrowerPriorCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerPrior: false}));
  };

  // Handler for borrower employer ZIP code lookup
  const handleBorrowerEmployerZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setBorrowerEmployerCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, borrowerEmployer: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      form.setValue('income.employerAddress.county', counties[0].label, { shouldDirty: true });
      setBorrowerEmployerCountyOptions([]);
    } else if (counties.length > 1) {
      setBorrowerEmployerCountyOptions(counties);
    } else {
      setBorrowerEmployerCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, borrowerEmployer: false}));
  };

  // Handler for borrower prior employer ZIP code lookup
  const handleBorrowerPriorEmployerZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setBorrowerPriorEmployerCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, borrowerPriorEmployer: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      form.setValue('income.priorEmployerAddress.county', counties[0].label, { shouldDirty: true });
      setBorrowerPriorEmployerCountyOptions([]);
    } else if (counties.length > 1) {
      setBorrowerPriorEmployerCountyOptions(counties);
    } else {
      setBorrowerPriorEmployerCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, borrowerPriorEmployer: false}));
  };

  // Handler for borrower second employer ZIP code lookup
  const handleBorrowerSecondEmployerZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setBorrowerSecondEmployerCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, borrowerSecondEmployer: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      form.setValue('income.secondEmployerAddress.county', counties[0].label, { shouldDirty: true });
      setBorrowerSecondEmployerCountyOptions([]);
    } else if (counties.length > 1) {
      setBorrowerSecondEmployerCountyOptions(counties);
    } else {
      setBorrowerSecondEmployerCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, borrowerSecondEmployer: false}));
  };

  // Handler for co-borrower employer ZIP code lookup
  const handleCoBorrowerEmployerZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setCoBorrowerEmployerCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerEmployer: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      form.setValue('coBorrowerIncome.employerAddress.county', counties[0].label, { shouldDirty: true });
      setCoBorrowerEmployerCountyOptions([]);
    } else if (counties.length > 1) {
      setCoBorrowerEmployerCountyOptions(counties);
    } else {
      setCoBorrowerEmployerCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerEmployer: false}));
  };

  // Handler for co-borrower prior employer ZIP code lookup
  const handleCoBorrowerPriorEmployerZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setCoBorrowerPriorEmployerCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerPriorEmployer: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      form.setValue('coBorrowerIncome.priorEmployerAddress.county', counties[0].label, { shouldDirty: true });
      setCoBorrowerPriorEmployerCountyOptions([]);
    } else if (counties.length > 1) {
      setCoBorrowerPriorEmployerCountyOptions(counties);
    } else {
      setCoBorrowerPriorEmployerCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerPriorEmployer: false}));
  };

  // Handler for co-borrower second employer ZIP code lookup
  const handleCoBorrowerSecondEmployerZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setCoBorrowerSecondEmployerCountyOptions([]);
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerSecondEmployer: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      form.setValue('coBorrowerIncome.secondEmployerAddress.county', counties[0].label, { shouldDirty: true });
      setCoBorrowerSecondEmployerCountyOptions([]);
    } else if (counties.length > 1) {
      setCoBorrowerSecondEmployerCountyOptions(counties);
    } else {
      setCoBorrowerSecondEmployerCountyOptions([]);
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerSecondEmployer: false}));
  };

  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [isCurrentLoanOpen, setIsCurrentLoanOpen] = useState(true);
  
  // Multiple prior addresses state management
  const [borrowerPriorAddresses, setBorrowerPriorAddresses] = useState<{ id: string }[]>([]);

  // Function to add a new prior address
  const addBorrowerPriorAddress = () => {
    const newAddress = { id: crypto.randomUUID() };
    setBorrowerPriorAddresses(prev => [...prev, newAddress]);
  };

  // Function to remove a prior address
  const removeBorrowerPriorAddress = (addressId: string) => {
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'prior-address',
      itemId: addressId,
      onConfirm: () => {
        setBorrowerPriorAddresses(prev => prev.filter(addr => addr.id !== addressId));
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };

  // Co-borrower multiple prior addresses state management
  const [coBorrowerPriorAddresses, setCoBorrowerPriorAddresses] = useState<{ id: string }[]>([]);

  // Function to add a new co-borrower prior address
  const addCoBorrowerPriorAddress = () => {
    const newAddress = { id: crypto.randomUUID() };
    setCoBorrowerPriorAddresses(prev => [...prev, newAddress]);
  };

  // Function to remove a co-borrower prior address
  const removeCoBorrowerPriorAddress = (addressId: string) => {
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'prior-address',
      itemId: addressId,
      onConfirm: () => {
        setCoBorrowerPriorAddresses(prev => prev.filter(addr => addr.id !== addressId));
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };
  
  // Function to remove a third loan
  const removeThirdLoan = (propertyIndex: number) => {
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'third-loan',
      itemId: propertyIndex.toString(),
      onConfirm: () => {
        form.setValue(`property.properties.${propertyIndex}.activeThirdLoan` as const, '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan` as const, {
          lenderName: '',
          loanNumber: '',
          mortgageBalance: '',
          piPayment: '',
          escrowPayment: '',
          totalMonthlyPayment: '',
        });
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };
  
  // Borrower income section collapsible states
  const [isEmploymentIncomeOpen, setIsEmploymentIncomeOpen] = useState(true);
  const [isPriorEmploymentIncomeOpen, setIsPriorEmploymentIncomeOpen] = useState(true);
  const [isSecondEmploymentIncomeOpen, setIsSecondEmploymentIncomeOpen] = useState(true);
  const [isSelfEmploymentIncomeOpen, setIsSelfEmploymentIncomeOpen] = useState(true);
  const [isSocialSecurityIncomeOpen, setIsSocialSecurityIncomeOpen] = useState(true);
  const [isVaBenefitsIncomeOpen, setIsVaBenefitsIncomeOpen] = useState(true);
  const [isDisabilityIncomeOpen, setIsDisabilityIncomeOpen] = useState(true);
  const [isOtherIncomeOpen, setIsOtherIncomeOpen] = useState(true);

  // Co-Borrower income collapsible state
  const [isCoBorrowerEmploymentIncomeOpen, setIsCoBorrowerEmploymentIncomeOpen] = useState(true);
  const [isCoBorrowerPriorEmploymentIncomeOpen, setIsCoBorrowerPriorEmploymentIncomeOpen] = useState(true);
  const [isCoBorrowerSecondEmploymentIncomeOpen, setIsCoBorrowerSecondEmploymentIncomeOpen] = useState(true);
  const [isCoBorrowerSelfEmploymentIncomeOpen, setIsCoBorrowerSelfEmploymentIncomeOpen] = useState(true);
  const [isCoBorrowerSocialSecurityIncomeOpen, setIsCoBorrowerSocialSecurityIncomeOpen] = useState(true);
  const [isCoBorrowerVaBenefitsIncomeOpen, setIsCoBorrowerVaBenefitsIncomeOpen] = useState(true);
  const [isCoBorrowerDisabilityIncomeOpen, setIsCoBorrowerDisabilityIncomeOpen] = useState(true);
  const [isCoBorrowerOtherIncomeOpen, setIsCoBorrowerOtherIncomeOpen] = useState(true);

  // Pension income collapsible state
  const [isPensionIncomeOpen, setIsPensionIncomeOpen] = useState(true);
  const [isCoBorrowerPensionIncomeOpen, setIsCoBorrowerPensionIncomeOpen] = useState(true);

  // Property collapsible state (using object to manage multiple property cards)
  const [propertyCardStates, setPropertyCardStates] = useState<Record<string, boolean>>({});
  
  // Subject property confirmation dialog state
  const [subjectConfirmDialog, setSubjectConfirmDialog] = useState<{
    isOpen: boolean;
    newSubjectPropertyId: string | null;
  }>({ isOpen: false, newSubjectPropertyId: null });

  // Removal confirmation dialog state
  const [confirmRemovalDialog, setConfirmRemovalDialog] = useState<{
    isOpen: boolean;
    type: 'co-borrower' | 'property' | 'property-type' | 'income' | 'prior-address' | 'third-loan' | null;
    itemId?: string;
    itemType?: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: null });

  // Property valuation modal state
  const [valuationDialog, setValuationDialog] = useState<{
    isOpen: boolean;
    service: 'zillow' | 'redfin' | 'realtor' | null;
    propertyIndex: number | null;
    currentValue: string;
  }>({ isOpen: false, service: null, propertyIndex: null, currentValue: '' });

  // Property valuation hover tooltip state
  const [valuationHover, setValuationHover] = useState<{
    isVisible: boolean;
    service: 'zillow' | 'redfin' | 'realtor' | null;
    propertyIndex: number | null;
    value: string;
    position: { x: number; y: number };
  }>({ isVisible: false, service: null, propertyIndex: null, value: '', position: { x: 0, y: 0 } });
  
  const [valuationInput, setValuationInput] = useState('');
  
  // Auto-valuation state
  const [autoValuationLoading, setAutoValuationLoading] = useState<{
    [propertyIndex: number]: {
      zillow?: boolean;
      realtor?: boolean;
      all?: boolean;
    }
  }>({});
  

  // Unsaved changes warning dialog state
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // Screenshare state
  const [screenshareLoading, setScreenshareLoading] = useState(false);

  // Co-borrower marital status popup state
  const [maritalStatusDialog, setMaritalStatusDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });


  // Valuation summary dialog state
  const [valuationSummaryDialog, setValuationSummaryDialog] = useState<{
    isOpen: boolean;
    propertyIndex: number | null;
  }>({ isOpen: false, propertyIndex: null });

  // County lookup state
  const [borrowerCountyOptions, setBorrowerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [coBorrowerCountyOptions, setCoBorrowerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [borrowerPriorCountyOptions, setBorrowerPriorCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [coBorrowerPriorCountyOptions, setCoBorrowerPriorCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  
  // Employment income county lookup state
  const [borrowerEmployerCountyOptions, setBorrowerEmployerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [borrowerPriorEmployerCountyOptions, setBorrowerPriorEmployerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [borrowerSecondEmployerCountyOptions, setBorrowerSecondEmployerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [coBorrowerEmployerCountyOptions, setCoBorrowerEmployerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [coBorrowerPriorEmployerCountyOptions, setCoBorrowerPriorEmployerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [coBorrowerSecondEmployerCountyOptions, setCoBorrowerSecondEmployerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  
  const [countyLookupLoading, setCountyLookupLoading] = useState<{
    borrower: boolean, 
    coBorrower: boolean, 
    borrowerPrior: boolean, 
    coBorrowerPrior: boolean,
    borrowerEmployer: boolean,
    borrowerPriorEmployer: boolean,
    borrowerSecondEmployer: boolean,
    coBorrowerEmployer: boolean,
    coBorrowerPriorEmployer: boolean,
    coBorrowerSecondEmployer: boolean
  }>({
    borrower: false, 
    coBorrower: false, 
    borrowerPrior: false, 
    coBorrowerPrior: false,
    borrowerEmployer: false,
    borrowerPriorEmployer: false,
    borrowerSecondEmployer: false,
    coBorrowerEmployer: false,
    coBorrowerPriorEmployer: false,
    coBorrowerSecondEmployer: false
  });

  // Property rental popup dialog state
  const [propertyRentalDialog, setPropertyRentalDialog] = useState<{
    isOpen: boolean;
    type: 'add' | 'remove' | null;
  }>({ isOpen: false, type: null });

  // Property usage change confirmation dialog state
  const [propertyUsageChangeDialog, setPropertyUsageChangeDialog] = useState<{
    isOpen: boolean;
    propertyId: string | undefined;
    newUsage: 'primary' | 'second-home' | 'investment' | undefined;
  }>({ isOpen: false, propertyId: undefined, newUsage: undefined });

  // Mortgage balance field toggle state (per property)
  const [mortgageBalanceFieldType, setMortgageBalanceFieldType] = useState<Record<string, 'statement' | 'payoff'>>({});
  
  // Escrow payment field toggle state (per property)
  const [escrowPaymentFieldType, setEscrowPaymentFieldType] = useState<Record<string, 'tax-insurance' | 'property-tax' | 'home-insurance'>>({});

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      borrower: {
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        maritalStatus: 'single',
        dateOfBirth: '',
        ssn: '',
        residenceAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
        },
        yearsAtAddress: '',
        monthsAtAddress: '',
        priorResidenceAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
          county: ''
        },
        priorYearsAtAddress: '',
        priorMonthsAtAddress: '',
        subjectProperty: undefined,
        leadRef: '',
        callDate: '',
        startDate: '',
      },
      coBorrower: undefined,
      income: {
        incomeTypes: {
          employment: false,
          secondEmployment: false,
          selfEmployment: false,
          pension: false,
          socialSecurity: false,
          vaBenefits: false,
          disability: false,
          other: false
        },
        employerName: '',
        jobTitle: '',
        monthlyIncome: '',
        yearsEmployedYears: '',
        yearsEmployedMonths: '',
        employerAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
          county: ''
        },
        employerPhone: '',
        priorEmployerName: '',
        priorJobTitle: '',
        priorMonthlyIncome: '',
        priorYearsEmployedYears: '',
        priorYearsEmployedMonths: '',
        priorEmployerAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
          county: ''
        },
        priorEmployerPhone: '',
        secondEmployerName: '',
        secondJobTitle: '',
        secondMonthlyIncome: '',
        secondYearsEmployedYears: '',
        secondYearsEmployedMonths: '',
        secondEmployerAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
          county: ''
        },
        secondEmployerPhone: '',
        businessName: '',
        businessMonthlyIncome: '',
        yearsInBusinessYears: '',
        yearsInBusinessMonths: '',
        businessAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
          county: ''
        },
        businessPhone: '',
        pensions: [],
        socialSecurityMonthlyAmount: '',
        vaBenefitsMonthlyAmount: '',
        disabilityPayerName: '',
        disabilityMonthlyAmount: '',
        otherIncomeDescription: '',
        otherIncomeMonthlyAmount: '',
        frontDTI: '',
        backDTI: '',
      },
      coBorrowerIncome: {
        incomeTypes: {
          employment: false,
          secondEmployment: false,
          selfEmployment: false,
          pension: false,
          socialSecurity: false,
          vaBenefits: false,
          disability: false,
          other: false
        },
        employerName: '',
        jobTitle: '',
        monthlyIncome: '',
        yearsEmployedYears: '',
        yearsEmployedMonths: '',
        employerAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
          county: ''
        },
        employerPhone: '',
        priorEmployerName: '',
        priorJobTitle: '',
        priorMonthlyIncome: '',
        priorYearsEmployedYears: '',
        priorYearsEmployedMonths: '',
        priorEmployerAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
          county: ''
        },
        priorEmployerPhone: '',
        secondEmployerName: '',
        secondJobTitle: '',
        secondMonthlyIncome: '',
        secondYearsEmployedYears: '',
        secondYearsEmployedMonths: '',
        secondEmployerAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
          county: ''
        },
        secondEmployerPhone: '',
        businessName: '',
        businessMonthlyIncome: '',
        yearsInBusinessYears: '',
        yearsInBusinessMonths: '',
        businessAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zip: '',
          county: ''
        },
        businessPhone: '',
        pensions: [],
        socialSecurityMonthlyAmount: '',
        vaBenefitsMonthlyAmount: '',
        disabilityPayerName: '',
        disabilityMonthlyAmount: '',
        otherIncomeDescription: '',
        otherIncomeMonthlyAmount: '',
        frontDTI: '',
        backDTI: '',
      },
      property: {
        estimatedLTV: '',
        properties: [],
      },
      currentLoan: {
        currentLender: '',
        currentBalance: '',
        currentRate: '',
        currentPayment: '',
        loanType: '',
        remainingTerm: '',
      },
      newLoan: {
        loanAmount: '',
        loanProgram: '',
        interestRate: '',
        loanTerm: '',
        loanPurpose: '',
        lockPeriod: '',
      },
      vendors: {
        realtor: '',
        appraiser: '',
        titleCompany: '',
        inspector: '',
        insurance: '',
        attorney: '',
      },
      status: 'active',
    },
  });

  // Debounced auto-fetch with address watching
  const debouncedAutoFetch = useCallback(
    (propertyIndex: number): number => {
      const timeoutId = window.setTimeout(() => {
        const address = {
          street: form.getValues(`property.properties.${propertyIndex}.address.street`),
          city: form.getValues(`property.properties.${propertyIndex}.address.city`),
          state: form.getValues(`property.properties.${propertyIndex}.address.state`),
          zipCode: form.getValues(`property.properties.${propertyIndex}.address.zip`)
        };
        
        if (address.street && address.city && address.state && !autoValuationLoading[propertyIndex]?.all) {
          autoFetchValuations(propertyIndex, address);
        }
      }, 600); // 600ms debounce
      
      return timeoutId;
    },
    [autoValuationLoading]
  );
  
  // Watch address changes for each property
  useEffect(() => {
    const timeouts = new Map<number, number>();
    const subscriptions: Array<{ unsubscribe: () => void }> = [];
    
    const properties = form.watch('property.properties') || [];
    
    properties.forEach((_, index) => {
      const subscription = form.watch((value, { name }) => {
        if (name && (
          name === `property.properties.${index}.address.street` ||
          name === `property.properties.${index}.address.city` ||
          name === `property.properties.${index}.address.state` ||
          name === `property.properties.${index}.address.zip`
        )) {
          // Clear any existing timeout for this property
          const existingTimeout = timeouts.get(index);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }
          // Set new debounced timeout
          const timeoutId = debouncedAutoFetch(index);
          timeouts.set(index, timeoutId);
        }
      });
      
      subscriptions.push(subscription);
    });
    
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [debouncedAutoFetch, form.watch('property.properties')?.length]);

  const addClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      return apiRequest('POST', '/api/admin/clients', data);
    },
    onSuccess: () => {
      toast({
        title: "Client Added Successfully",
        description: "The new client has been added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      setLocation('/admin/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add client",
        variant: "destructive",
      });
    },
  });

  // Screenleap integration functionality
  const handleScreenshare = async () => {
    setScreenshareLoading(true);
    
    try {
      // Remove any existing screenleap script
      const existingScript = document.querySelector('script[src*="screenleap.js"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Create and inject screenleap script for presenter role
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://integration.screenleap.com/screenleap.js';
      script.setAttribute('data-param', 'userId=438165&role=presenter');
      
      // Add script to document head
      document.head.appendChild(script);
      
      // Wait for script to load and initialize
      script.onload = () => {
        toast({
          title: 'Screenshare Ready',
          description: 'Screenleap presenter mode activated. You can now start screen sharing.',
        });
        setScreenshareLoading(false);
      };
      
      script.onerror = () => {
        toast({
          title: 'Screenshare Error',
          description: 'Failed to load screenleap integration',
          variant: 'destructive',
        });
        setScreenshareLoading(false);
      };
      
    } catch (error: any) {
      toast({
        title: 'Screenshare Error',
        description: error.message || 'Failed to initialize screenleap',
        variant: 'destructive',
      });
      setScreenshareLoading(false);
    }
  };

  const onSubmit = (data: InsertClient) => {
    // Clean up co-borrower data if not needed
    if (!hasCoBorrower) {
      data.coBorrower = undefined;
      data.coBorrowerIncome = undefined;
    }
    addClientMutation.mutate(data);
  };

  const addCoBorrower = () => {
    setHasCoBorrower(true);
    form.setValue('coBorrower', {
      firstName: '',
      middleName: '',
      lastName: '',
      phone: '',
      email: '',
      maritalStatus: 'single',
      dateOfBirth: '',
      ssn: '',
      residenceAddress: {
        street: '',
        unit: '',
        city: '',
        state: '',
        zip: '',
      },
      yearsAtAddress: '',
      monthsAtAddress: '',
    });
  };


  const removeCoBorrower = () => {
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'co-borrower',
      onConfirm: () => {
        setHasCoBorrower(false);
        form.setValue('coBorrower', undefined);
        form.setValue('coBorrowerIncome', undefined);
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };

  const copyResidenceToSubjectProperty = () => {
    const residenceAddress = form.getValues('borrower.residenceAddress');
    form.setValue('borrower.subjectProperty', residenceAddress);
  };

  // Auto-copy borrower residence address to primary residence property
  const autoCopyBorrowerAddressToPrimaryProperty = () => {
    const borrowerAddress = form.getValues('borrower.residenceAddress');
    const properties = form.watch('property.properties') || [];
    const primaryPropertyIndex = properties.findIndex(p => p.use === 'primary');
    
    if (primaryPropertyIndex >= 0 && borrowerAddress) {
      form.setValue(`property.properties.${primaryPropertyIndex}.address`, {
        street: borrowerAddress.street || '',
        unit: borrowerAddress.unit || '',
        city: borrowerAddress.city || '',
        state: borrowerAddress.state || '',
        zip: borrowerAddress.zip || '',
        county: borrowerAddress.county || ''
      });
    }
  };

  // Auto-copy co-borrower residence address to co-borrower property
  const autoCopyCoBorrowerAddressToProperty = () => {
    const coBorrowerAddress = form.getValues('coBorrower.residenceAddress');
    const properties = form.watch('property.properties') || [];
    // Find a non-primary property for co-borrower (second home or investment)
    const coBorrowerPropertyIndex = properties.findIndex(p => p.use !== 'primary');
    
    if (coBorrowerPropertyIndex >= 0 && coBorrowerAddress) {
      form.setValue(`property.properties.${coBorrowerPropertyIndex}.address`, {
        street: coBorrowerAddress.street || '',
        unit: coBorrowerAddress.unit || '',
        city: coBorrowerAddress.city || '',
        state: coBorrowerAddress.state || '',
        zip: coBorrowerAddress.zip || '',
        county: coBorrowerAddress.county || ''
      });
    }
  };

  const copyBorrowerToCoResidence = () => {
    const borrowerResidenceAddress = form.getValues('borrower.residenceAddress');
    const borrowerYearsAtAddress = form.getValues('borrower.yearsAtAddress');
    const borrowerMonthsAtAddress = form.getValues('borrower.monthsAtAddress');
    
    form.setValue('coBorrower.residenceAddress', borrowerResidenceAddress);
    form.setValue('coBorrower.yearsAtAddress', borrowerYearsAtAddress);
    form.setValue('coBorrower.monthsAtAddress', borrowerMonthsAtAddress);
  };

  // Phone number formatting
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else if (phoneNumber.length >= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    } else if (phoneNumber.length >= 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    
    return phoneNumber;
  };

  const handlePhoneChange = (fieldName: string, value: string) => {
    const formatted = formatPhoneNumber(value);
    form.setValue(fieldName as any, formatted);
  };

  // Parse monetary value and convert to number
  const parseMonetaryValue = (value: string | undefined): number => {
    if (!value || value.trim() === '') return 0;
    // Remove $ signs, commas, and convert to number
    const cleaned = value.replace(/[$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculate total monthly income
  const calculateTotalBorrowerIncome = (): string => {
    const income = form.watch('income');
    
    const employmentIncome = parseMonetaryValue(income?.monthlyIncome);
    const secondEmploymentIncome = parseMonetaryValue(income?.secondMonthlyIncome);
    const businessIncome = parseMonetaryValue(income?.businessMonthlyIncome);
    const pensionIncome = income?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
    const socialSecurityIncome = parseMonetaryValue(income?.socialSecurityMonthlyAmount);
    const vaBenefitsIncome = parseMonetaryValue(income?.vaBenefitsMonthlyAmount);
    const disabilityIncome = parseMonetaryValue(income?.disabilityMonthlyAmount);
    const otherIncome = parseMonetaryValue(income?.otherIncomeMonthlyAmount);
    
    const total = employmentIncome + secondEmploymentIncome + businessIncome + 
                  pensionIncome + socialSecurityIncome + vaBenefitsIncome + 
                  disabilityIncome + otherIncome;
    
    // Format as currency
    return `$${total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const calculateTotalCoBorrowerIncome = (): string => {
    const coBorrowerIncome = form.watch('coBorrowerIncome');
    
    const employmentIncome = parseMonetaryValue(coBorrowerIncome?.monthlyIncome);
    const secondEmploymentIncome = parseMonetaryValue(coBorrowerIncome?.secondMonthlyIncome);
    const businessIncome = parseMonetaryValue(coBorrowerIncome?.businessMonthlyIncome);
    const pensionIncome = coBorrowerIncome?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
    const socialSecurityIncome = parseMonetaryValue(coBorrowerIncome?.socialSecurityMonthlyAmount);
    const vaBenefitsIncome = parseMonetaryValue(coBorrowerIncome?.vaBenefitsMonthlyAmount);
    const disabilityIncome = parseMonetaryValue(coBorrowerIncome?.disabilityMonthlyAmount);
    const otherIncome = parseMonetaryValue(coBorrowerIncome?.otherIncomeMonthlyAmount);
    
    const total = employmentIncome + secondEmploymentIncome + businessIncome + 
                  pensionIncome + socialSecurityIncome + vaBenefitsIncome + 
                  disabilityIncome + otherIncome;
    
    // Format as currency
    return `$${total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Calculate total household income (borrower + co-borrower)
  const calculateTotalHouseholdIncome = (): string => {
    const income = form.watch('income');
    const coBorrowerIncome = form.watch('coBorrowerIncome');
    
    // Calculate borrower total
    const borrowerEmploymentIncome = parseMonetaryValue(income?.monthlyIncome);
    const borrowerSecondEmploymentIncome = parseMonetaryValue(income?.secondMonthlyIncome);
    const borrowerBusinessIncome = parseMonetaryValue(income?.businessMonthlyIncome);
    const borrowerPensionIncome = income?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
    const borrowerSocialSecurityIncome = parseMonetaryValue(income?.socialSecurityMonthlyAmount);
    const borrowerVaBenefitsIncome = parseMonetaryValue(income?.vaBenefitsMonthlyAmount);
    const borrowerDisabilityIncome = parseMonetaryValue(income?.disabilityMonthlyAmount);
    const borrowerOtherIncome = parseMonetaryValue(income?.otherIncomeMonthlyAmount);
    
    const borrowerTotal = borrowerEmploymentIncome + borrowerSecondEmploymentIncome + borrowerBusinessIncome + 
                         borrowerPensionIncome + borrowerSocialSecurityIncome + borrowerVaBenefitsIncome + 
                         borrowerDisabilityIncome + borrowerOtherIncome;
    
    // Calculate co-borrower total (only if co-borrower exists)
    let coBorrowerTotal = 0;
    if (hasCoBorrower && coBorrowerIncome) {
      const coBorrowerEmploymentIncome = parseMonetaryValue(coBorrowerIncome?.monthlyIncome);
      const coBorrowerSecondEmploymentIncome = parseMonetaryValue(coBorrowerIncome?.secondMonthlyIncome);
      const coBorrowerBusinessIncome = parseMonetaryValue(coBorrowerIncome?.businessMonthlyIncome);
      const coBorrowerPensionIncome = coBorrowerIncome?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
      const coBorrowerSocialSecurityIncome = parseMonetaryValue(coBorrowerIncome?.socialSecurityMonthlyAmount);
      const coBorrowerVaBenefitsIncome = parseMonetaryValue(coBorrowerIncome?.vaBenefitsMonthlyAmount);
      const coBorrowerDisabilityIncome = parseMonetaryValue(coBorrowerIncome?.disabilityMonthlyAmount);
      const coBorrowerOtherIncome = parseMonetaryValue(coBorrowerIncome?.otherIncomeMonthlyAmount);
      
      coBorrowerTotal = coBorrowerEmploymentIncome + coBorrowerSecondEmploymentIncome + coBorrowerBusinessIncome + 
                       coBorrowerPensionIncome + coBorrowerSocialSecurityIncome + coBorrowerVaBenefitsIncome + 
                       coBorrowerDisabilityIncome + coBorrowerOtherIncome;
    }
    
    const householdTotal = borrowerTotal + coBorrowerTotal;
    
    // Format as currency
    return `$${householdTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Helper functions to get numerical values for styling
  const calculateTotalBorrowerIncomeValue = (): number => {
    const income = form.watch('income');
    
    const employmentIncome = parseMonetaryValue(income?.monthlyIncome);
    const secondEmploymentIncome = parseMonetaryValue(income?.secondMonthlyIncome);
    const businessIncome = parseMonetaryValue(income?.businessMonthlyIncome);
    const pensionIncome = income?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
    const socialSecurityIncome = parseMonetaryValue(income?.socialSecurityMonthlyAmount);
    const vaBenefitsIncome = parseMonetaryValue(income?.vaBenefitsMonthlyAmount);
    const disabilityIncome = parseMonetaryValue(income?.disabilityMonthlyAmount);
    const otherIncome = parseMonetaryValue(income?.otherIncomeMonthlyAmount);
    
    return employmentIncome + secondEmploymentIncome + businessIncome + 
           pensionIncome + socialSecurityIncome + vaBenefitsIncome + 
           disabilityIncome + otherIncome;
  };

  const calculateTotalCoBorrowerIncomeValue = (): number => {
    const coBorrowerIncome = form.watch('coBorrowerIncome');
    
    const employmentIncome = parseMonetaryValue(coBorrowerIncome?.monthlyIncome);
    const secondEmploymentIncome = parseMonetaryValue(coBorrowerIncome?.secondMonthlyIncome);
    const businessIncome = parseMonetaryValue(coBorrowerIncome?.businessMonthlyIncome);
    const pensionIncome = coBorrowerIncome?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
    const socialSecurityIncome = parseMonetaryValue(coBorrowerIncome?.socialSecurityMonthlyAmount);
    const vaBenefitsIncome = parseMonetaryValue(coBorrowerIncome?.vaBenefitsMonthlyAmount);
    const disabilityIncome = parseMonetaryValue(coBorrowerIncome?.disabilityMonthlyAmount);
    const otherIncome = parseMonetaryValue(coBorrowerIncome?.otherIncomeMonthlyAmount);
    
    return employmentIncome + secondEmploymentIncome + businessIncome + 
           pensionIncome + socialSecurityIncome + vaBenefitsIncome + 
           disabilityIncome + otherIncome;
  };

  const calculateTotalHouseholdIncomeValue = (): number => {
    const borrowerTotal = calculateTotalBorrowerIncomeValue();
    const coBorrowerTotal = hasCoBorrower ? calculateTotalCoBorrowerIncomeValue() : 0;
    return borrowerTotal + coBorrowerTotal;
  };

  // Auto-sync rental property income with property data
  useEffect(() => {
    const properties = form.watch('property.properties') || [];
    const investmentProperties = properties.filter(p => p.use === 'investment' && p.loan && p.loan.monthlyIncome);
    
    if (investmentProperties.length > 0) {
      // Auto-check Property Rental checkbox
      form.setValue('income.incomeTypes.other', true);
      
      // Calculate total rental income including negative values
      const totalRentalIncome = investmentProperties.reduce((total, property) => {
        return total + parseMonetaryValue(property.loan?.monthlyIncome || '');
      }, 0);
      
      const addressList = investmentProperties.map((p, index) => {
        const propertyTitle = `Investment Property ${index + 1}`;
        return p.address?.street ? `${propertyTitle} (${p.address.street})` : propertyTitle;
      }).join(', ');
      
      // Update rental income fields with proper negative formatting
      const formattedAmount = totalRentalIncome >= 0 
        ? `$${totalRentalIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : `-$${Math.abs(totalRentalIncome).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      
      form.setValue('income.otherIncomeDescription', addressList);
      form.setValue('income.otherIncomeMonthlyAmount', formattedAmount);
    } else {
      // No rental properties, uncheck the box
      form.setValue('income.incomeTypes.other', false);
      form.setValue('income.otherIncomeDescription', '');
      form.setValue('income.otherIncomeMonthlyAmount', '');
    }
  }, [form.watch('property.properties')]);

  // Pension management helper functions
  const generateUniqueId = (): string => {
    return `pension-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addBorrowerPension = () => {
    const currentPensions = form.watch('income.pensions') || [];
    const newPension = {
      id: generateUniqueId(),
      payerName: '',
      monthlyAmount: '',
    };
    form.setValue('income.pensions', [...currentPensions, newPension]);
  };

  const removeBorrowerPension = (pensionId: string) => {
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'income',
      itemId: pensionId,
      itemType: 'pension',
      onConfirm: () => {
        const currentPensions = form.watch('income.pensions') || [];
        const updatedPensions = currentPensions.filter(pension => pension.id !== pensionId);
        form.setValue('income.pensions', updatedPensions);
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };

  const addCoBorrowerPension = () => {
    const currentPensions = form.watch('coBorrowerIncome.pensions') || [];
    const newPension = {
      id: generateUniqueId(),
      payerName: '',
      monthlyAmount: '',
    };
    form.setValue('coBorrowerIncome.pensions', [...currentPensions, newPension]);
  };

  const removeCoBorrowerPension = (pensionId: string) => {
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'income',
      itemId: pensionId,
      itemType: 'co-borrower pension',
      onConfirm: () => {
        const currentPensions = form.watch('coBorrowerIncome.pensions') || [];
        const updatedPensions = currentPensions.filter(pension => pension.id !== pensionId);
        form.setValue('coBorrowerIncome.pensions', updatedPensions);
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };

  // Property valuation handlers
  const openValuationDialog = (service: 'zillow' | 'redfin' | 'realtor', propertyIndex: number) => {
    const currentValue = form.watch(`property.properties.${propertyIndex}.valuations.${service}`) || '';
    setValuationInput(currentValue);
    setValuationDialog({
      isOpen: true,
      service,
      propertyIndex,
      currentValue
    });
  };

  const closeValuationDialog = () => {
    setValuationDialog({ isOpen: false, service: null, propertyIndex: null, currentValue: '' });
    setValuationInput('');
  };

  const saveValuation = () => {
    if (valuationDialog.propertyIndex !== null && valuationDialog.service) {
      form.setValue(`property.properties.${valuationDialog.propertyIndex}.valuations.${valuationDialog.service}`, valuationInput);
      closeValuationDialog();
    }
  };

  const saveAndApplyValuation = () => {
    if (valuationDialog.propertyIndex !== null && valuationDialog.service) {
      form.setValue(`property.properties.${valuationDialog.propertyIndex}.valuations.${valuationDialog.service}`, valuationInput);
      form.setValue(`property.properties.${valuationDialog.propertyIndex}.estimatedValue`, valuationInput);
      closeValuationDialog();
    }
  };

  // Property valuation hover handlers
  const handleValuationHover = (service: 'zillow' | 'redfin' | 'realtor', propertyIndex: number, event: React.MouseEvent) => {
    const savedValue = form.watch(`property.properties.${propertyIndex}.valuations.${service}`) || '';
    const rect = event.currentTarget.getBoundingClientRect();
    // Position tooltip above the icon with estimated tooltip height of 120px
    const tooltipHeight = 120;
    setValuationHover({
      isVisible: true,
      service,
      propertyIndex,
      value: savedValue,
      position: { 
        x: rect.left + window.scrollX, 
        y: rect.top + window.scrollY - tooltipHeight - 10 
      }
    });
  };

  const handleValuationHoverLeave = () => {
    setValuationHover({ isVisible: false, service: null, propertyIndex: null, value: '', position: { x: 0, y: 0 } });
  };

  // Open valuation summary dialog
  const openValuationSummary = (propertyIndex: number) => {
    setValuationSummaryDialog({ isOpen: true, propertyIndex });
  };

  const closeValuationSummary = () => {
    setValuationSummaryDialog({ isOpen: false, propertyIndex: null });
  };
  
  // Auto-fetch property valuations
  const autoFetchValuations = async (propertyIndex: number, address: { street?: string; city?: string; state?: string; zipCode?: string }) => {
    if (!address.street || !address.city || !address.state) {
      return;
    }
    
    const fullAddress = `${address.street}, ${address.city}, ${address.state}${address.zipCode ? ' ' + address.zipCode : ''}`;
    
    setAutoValuationLoading(prev => ({
      ...prev,
      [propertyIndex]: { ...prev[propertyIndex], all: true, zillow: true, realtor: true }
    }));
    
    try {
      const response = await fetch(`/api/property-valuations?address=${encodeURIComponent(fullAddress)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request unsuccessful');
      }
      
      const results = [];
      
      // Handle Zillow valuation
      if (data.data.zillow) {
        if (data.data.zillow.estimate) {
          const formattedZillowValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(data.data.zillow.estimate);
          form.setValue(`property.properties.${propertyIndex}.valuations.zillow`, formattedZillowValue);
          results.push('Zillow');
        } else if (data.data.zillow.error) {
          toast({
            title: "Zillow Valuation Failed",
            description: data.data.zillow.error,
            variant: "destructive"
          });
        }
      }
      
      // Handle Realtor.com valuation
      if (data.data.realtor) {
        if (data.data.realtor.estimate) {
          const formattedRealtorValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(data.data.realtor.estimate);
          form.setValue(`property.properties.${propertyIndex}.valuations.realtor`, formattedRealtorValue);
          results.push('Realtor.com');
        } else if (data.data.realtor.error) {
          toast({
            title: "Realtor.com Valuation Failed",
            description: data.data.realtor.error,
            variant: "destructive"
          });
        }
      }
      
      // Show success toast for successful results
      if (results.length > 0) {
        toast({
          title: "Property Valuations Updated",
          description: `Auto-fetched from ${results.join(' and ')} for ${address.street}`,
        });
      } else {
        toast({
          title: "No Valuations Available",
          description: "No property data found for this address",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Auto-fetch valuations error:', error);
      toast({
        title: "Valuation Fetch Failed",
        description: error instanceof Error ? error.message : "Could not retrieve automatic valuations",
        variant: "destructive"
      });
    } finally {
      setAutoValuationLoading(prev => ({
        ...prev,
        [propertyIndex]: { ...prev[propertyIndex], all: false, zillow: false, realtor: false }
      }));
    }
  };
  
  // Fetch individual service valuation
  const fetchServiceValuation = async (service: 'zillow' | 'realtor', propertyIndex: number, address: { street?: string; city?: string; state?: string; zipCode?: string }) => {
    if (!address.street || !address.city || !address.state) {
      toast({
        title: "Incomplete Address",
        description: "Please fill out street, city, and state to fetch valuations",
        variant: "destructive"
      });
      return;
    }
    
    const fullAddress = `${address.street}, ${address.city}, ${address.state}${address.zipCode ? ' ' + address.zipCode : ''}`;
    
    setAutoValuationLoading(prev => ({
      ...prev,
      [propertyIndex]: { ...prev[propertyIndex], [service]: true }
    }));
    
    try {
      const response = await fetch(`/api/property-valuations/${service}?address=${encodeURIComponent(fullAddress)}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API request unsuccessful');
      }
      
      if (data.data && data.data.estimate) {
        const formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(data.data.estimate);
        form.setValue(`property.properties.${propertyIndex}.valuations.${service}`, formattedValue);
        
        toast({
          title: `${service.charAt(0).toUpperCase() + service.slice(1)} Valuation Updated`,
          description: `Fetched: ${formattedValue}`,
        });
      } else {
        toast({
          title: "No Valuation Found",
          description: data.message || `No ${service} data available for this address`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error(`${service} valuation fetch error:`, error);
      toast({
        title: `${service.charAt(0).toUpperCase() + service.slice(1)} Valuation Failed`,
        description: error instanceof Error ? error.message : `Could not retrieve ${service} valuation`,
        variant: "destructive"
      });
    } finally {
      setAutoValuationLoading(prev => ({
        ...prev,
        [propertyIndex]: { ...prev[propertyIndex], [service]: false }
      }));
    }
  };
  
  // Auto-fetch when address changes
  const handleAddressChange = (propertyIndex: number) => {
    const streetValue = form.watch(`property.properties.${propertyIndex}.address.street` as const);
    const cityValue = form.watch(`property.properties.${propertyIndex}.address.city` as const);
    const stateValue = form.watch(`property.properties.${propertyIndex}.address.state` as const);
    const zipCodeValue = form.watch(`property.properties.${propertyIndex}.address.zip` as const);
    
    const address = {
      street: typeof streetValue === 'string' ? streetValue : '',
      city: typeof cityValue === 'string' ? cityValue : '',
      state: typeof stateValue === 'string' ? stateValue : '',
      zipCode: typeof zipCodeValue === 'string' ? zipCodeValue : ''
    };
    
    // Auto-fetch if all required fields are filled
    if (address.street && address.city && address.state) {
      autoFetchValuations(propertyIndex, address);
    }
  };

  // Property management helper functions
  const addProperty = (use: 'primary' | 'second-home' | 'investment') => {
    const currentProperties = form.watch('property.properties') || [];
    const newProperty = {
      id: nanoid(),
      use,
      isSubject: false,
      address: {},
      propertyType: '',
      estimatedValue: '',
      valuations: {
        zillow: '',
        redfin: '',
        realtor: '',
      },
      appraisedValue: '',
      ownedSince: '',
      purchasePrice: '',
      hoaFee: '',
      loan: {
        lenderName: '',
        loanNumber: '',
        mortgageBalance: '',
        piPayment: '',
        escrowPayment: '',
        totalMonthlyPayment: '',
      },
      activeSecondLoan: '',
      secondLoan: {
        lenderName: '',
        loanNumber: '',
        mortgageBalance: '',
        piPayment: '',
        escrowPayment: '',
        totalMonthlyPayment: '',
      },
    };
    form.setValue('property.properties', [...currentProperties, newProperty]);
    // Set initial collapsible state for new property
    setPropertyCardStates(prev => ({ ...prev, [newProperty.id!]: true }));
  };

  const removeProperty = (propertyId: string) => {
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'property',
      itemId: propertyId,
      onConfirm: () => {
        const currentProperties = form.watch('property.properties') || [];
        const updatedProperties = currentProperties.filter(property => property.id !== propertyId);
        form.setValue('property.properties', updatedProperties);
        
        // Remove collapsible state for removed property
        setPropertyCardStates(prev => {
          const { [propertyId]: _, ...rest } = prev;
          return rest;
        });
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };

  const setSubjectProperty = (propertyId: string) => {
    const currentProperties = form.watch('property.properties') || [];
    
    // Check if another property is already selected as subject
    const currentSubjectProperty = currentProperties.find(property => property.isSubject === true);
    
    if (currentSubjectProperty && currentSubjectProperty.id !== propertyId) {
      // Show confirmation dialog
      setSubjectConfirmDialog({
        isOpen: true,
        newSubjectPropertyId: propertyId
      });
      return;
    }
    
    // No existing subject property or same property selected, proceed with change
    const updatedProperties = currentProperties.map(property => ({
      ...property,
      isSubject: property.id === propertyId,
    }));
    form.setValue('property.properties', updatedProperties);
  };

  // Handle subject property confirmation
  const handleSubjectPropertyConfirmation = (confirmed: boolean) => {
    if (confirmed && subjectConfirmDialog.newSubjectPropertyId) {
      const currentProperties = form.watch('property.properties') || [];
      const updatedProperties = currentProperties.map(property => ({
        ...property,
        isSubject: property.id === subjectConfirmDialog.newSubjectPropertyId,
      }));
      form.setValue('property.properties', updatedProperties);
    }
    
    // Close dialog
    setSubjectConfirmDialog({ isOpen: false, newSubjectPropertyId: null });
  };

  // Handle property usage change request
  const requestPropertyUsageChange = (propertyId: string, newUsage: 'primary' | 'second-home' | 'investment') => {
    const currentProperties = form.watch('property.properties') || [];
    const property = currentProperties.find(p => p.id === propertyId);
    
    if (!property || property.use === newUsage) return;
    
    // Check if changing to primary residence and one already exists
    if (newUsage === 'primary') {
      const hasExistingPrimary = currentProperties.some(p => p.use === 'primary' && p.id !== propertyId);
      if (hasExistingPrimary) {
        alert('You can only have one Primary Residence property.');
        return;
      }
    }
    
    setPropertyUsageChangeDialog({
      isOpen: true,
      propertyId,
      newUsage
    });
  };

  // Handle property usage change confirmation
  const handlePropertyUsageChangeConfirmation = (confirmed: boolean) => {
    if (confirmed && propertyUsageChangeDialog.propertyId && propertyUsageChangeDialog.newUsage) {
      const currentProperties = form.watch('property.properties') || [];
      const updatedProperties = currentProperties.map(property => 
        property.id === propertyUsageChangeDialog.propertyId 
          ? { ...property, use: propertyUsageChangeDialog.newUsage }
          : property
      );
      form.setValue('property.properties', updatedProperties);
    }
    
    // Close dialog
    setPropertyUsageChangeDialog({ isOpen: false, propertyId: undefined, newUsage: undefined });
  };

  // Property type management functions
  const addPropertyType = (type: 'primary' | 'second-home' | 'investment') => {
    const currentProperties = form.watch('property.properties') || [];
    
    // For primary residence, ensure only one exists
    if (type === 'primary') {
      const hasExistingPrimary = currentProperties.some(p => p.use === 'primary');
      if (hasExistingPrimary) return;
    }
    
    addProperty(type);
  };

  const removePropertyType = (type: 'primary' | 'second-home' | 'investment') => {
    const typeLabels = {
      'primary': 'Primary Residence',
      'second-home': 'Second Home',
      'investment': 'Investment Property'
    };
    
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'property-type',
      itemType: typeLabels[type],
      onConfirm: () => {
        const currentProperties = form.watch('property.properties') || [];
        const propertiesToRemove = currentProperties.filter(property => property.use === type);
        
        propertiesToRemove.forEach(property => {
          if (property.id) {
            const currentPropertiesNow = form.watch('property.properties') || [];
            const updatedProperties = currentPropertiesNow.filter(p => p.id !== property.id);
            form.setValue('property.properties', updatedProperties);
            
            // Remove collapsible state for removed property
            setPropertyCardStates(prev => {
              const { [property.id!]: _, ...rest } = prev;
              return rest;
            });
          }
        });
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };

  const hasPropertyType = (type: 'primary' | 'second-home' | 'investment'): boolean => {
    const currentProperties = form.watch('property.properties') || [];
    return currentProperties.some(property => property.use === type);
  };

  // Calculate total monthly payment for a property loan
  const calculateTotalMonthlyPayment = (propertyId: string) => {
    const properties = form.watch('property.properties') || [];
    const property = properties.find(p => p.id === propertyId);
    
    if (!property?.loan) return;
    
    const piPayment = parseMonetaryValue(property.loan.piPayment || '');
    const escrowPayment = parseMonetaryValue(property.loan.escrowPayment || '');
    const total = piPayment + escrowPayment;
    
    // Update the form with calculated total
    const updatedProperties = properties.map(p => 
      p.id === propertyId 
        ? { ...p, loan: { ...p.loan, totalMonthlyPayment: `$${total.toFixed(2)}` } }
        : p
    );
    form.setValue('property.properties', updatedProperties);

    // If this is an investment property, also update the monthly income calculation
    if (property.use === 'investment') {
      calculateInvestmentIncome(propertyId);
    }
  };

  // Calculate monthly income for investment properties (rental - total payment)
  const calculateInvestmentIncome = (propertyId: string) => {
    const properties = form.watch('property.properties') || [];
    const property = properties.find(p => p.id === propertyId);
    
    if (!property?.loan || property.use !== 'investment') return;
    
    const monthlyRental = parseMonetaryValue(property.loan.monthlyRental || '');
    const totalPayment = parseMonetaryValue(property.loan.totalMonthlyPayment || '');
    const monthlyIncome = monthlyRental - totalPayment; // Allow negative values
    
    // Format with proper sign for negative values
    const formattedIncome = monthlyIncome >= 0 
      ? `$${monthlyIncome.toFixed(2)}` 
      : `-$${Math.abs(monthlyIncome).toFixed(2)}`;
    
    // Update the form with calculated income
    const updatedProperties = properties.map(p => 
      p.id === propertyId 
        ? { ...p, loan: { ...p.loan, monthlyIncome: formattedIncome } }
        : p
    );
    form.setValue('property.properties', updatedProperties);
  };

  // Toggle mortgage balance field type
  const toggleMortgageBalanceFieldType = (propertyId: string) => {
    setMortgageBalanceFieldType(prev => ({
      ...prev,
      [propertyId]: prev[propertyId] === 'payoff' ? 'statement' : 'payoff'
    }));
  };

  // Get mortgage balance field label
  const getMortgageBalanceLabel = (propertyId: string) => {
    const fieldType = mortgageBalanceFieldType[propertyId] || 'statement';
    return fieldType === 'statement' ? 'Mortgage Statement Balance' : 'Pay Off Demand Balance';
  };

  // Toggle escrow payment field type
  const toggleEscrowPaymentFieldType = (propertyId: string) => {
    setEscrowPaymentFieldType(prev => {
      const currentType = prev[propertyId] || 'tax-insurance';
      const nextType = currentType === 'tax-insurance' ? 'property-tax' : 
                      currentType === 'property-tax' ? 'home-insurance' : 'tax-insurance';
      return {
        ...prev,
        [propertyId]: nextType
      };
    });
  };

  // Get escrow payment field label
  const getEscrowPaymentLabel = (propertyId: string) => {
    const fieldType = escrowPaymentFieldType[propertyId] || 'tax-insurance';
    switch (fieldType) {
      case 'tax-insurance': return 'Tax & Insurance Payment';
      case 'property-tax': return 'Property Tax';
      case 'home-insurance': return 'Home Insurance';
      default: return 'Tax & Insurance Payment';
    }
  };

  // Sort properties by hierarchy: Primary Residence, Second Homes, Investment Properties
  const sortPropertiesByHierarchy = (properties: any[]) => {
    const hierarchyOrder = { 'primary': 1, 'second-home': 2, 'investment': 3 };
    return [...properties].sort((a, b) => {
      const aOrder = hierarchyOrder[a.use as keyof typeof hierarchyOrder] || 999;
      const bOrder = hierarchyOrder[b.use as keyof typeof hierarchyOrder] || 999;
      return aOrder - bOrder;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Always show unsaved changes dialog when navigating away from Add Client page
                  setUnsavedChangesDialog({ isOpen: true });
                }}
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
                Add New Client
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleScreenshare}
                disabled={screenshareLoading}
                className="bg-primary-foreground text-primary hover:bg-green-600 hover:text-white"
                data-testid="button-screenshare"
              >
                <Monitor className="h-4 w-4 mr-2" />
                {screenshareLoading ? 'Starting...' : 'Screenshare'}
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={addClientMutation.isPending}
                className="bg-white text-primary border hover:bg-green-600 hover:text-white"
                data-testid="button-save-client"
              >
                <Save className="h-4 w-4 mr-2" />
                {addClientMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="client" className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="client" data-testid="tab-client" className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Client</TabsTrigger>
              <TabsTrigger value="income" data-testid="tab-income" className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Income</TabsTrigger>
              <TabsTrigger value="property" data-testid="tab-property" className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Property</TabsTrigger>
              <TabsTrigger value="loan" data-testid="tab-loan" className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Loan</TabsTrigger>
              <TabsTrigger value="status" data-testid="tab-status" className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Status</TabsTrigger>
              <TabsTrigger value="vendors" data-testid="tab-vendors" className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Vendors</TabsTrigger>
              <TabsTrigger value="quote" data-testid="tab-quote" className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Quote</TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes" className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Notes</TabsTrigger>
            </TabsList>

            {/* Client Tab */}
            <TabsContent value="client" className="space-y-6">
              {/* Lead Information Fields */}
              <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="borrower-leadRef">Lead Reference</Label>
                    <Input
                      id="borrower-leadRef"
                      {...form.register('borrower.leadRef')}
                      data-testid="input-borrower-leadRef"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-callDate">Call Date</Label>
                    <Input
                      id="borrower-callDate"
                      type="date"
                      {...form.register('borrower.callDate')}
                      data-testid="input-borrower-callDate"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-startDate">Start Date</Label>
                    <Input
                      id="borrower-startDate"
                      type="date"
                      {...form.register('borrower.startDate')}
                      data-testid="input-borrower-startDate"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Borrower Information */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle>Borrower Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="borrower-firstName">First Name *</Label>
                    <Input
                      id="borrower-firstName"
                      {...form.register('borrower.firstName')}
                      data-testid="input-borrower-firstName"
                    />
                    {form.formState.errors.borrower?.firstName && (
                      <p className="text-sm text-destructive">{form.formState.errors.borrower.firstName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-middleName">Middle Name</Label>
                    <Input
                      id="borrower-middleName"
                      {...form.register('borrower.middleName')}
                      data-testid="input-borrower-middleName"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-lastName">Last Name *</Label>
                    <Input
                      id="borrower-lastName"
                      {...form.register('borrower.lastName')}
                      data-testid="input-borrower-lastName"
                    />
                    {form.formState.errors.borrower?.lastName && (
                      <p className="text-sm text-destructive">{form.formState.errors.borrower.lastName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-phone">Phone *</Label>
                    <Input
                      id="borrower-phone"
                      value={form.watch('borrower.phone') || ''}
                      onChange={(e) => handlePhoneChange('borrower.phone', e.target.value)}
                      placeholder="(XXX) XXX-XXXX"
                      data-testid="input-borrower-phone"
                    />
                    {form.formState.errors.borrower?.phone && (
                      <p className="text-sm text-destructive">{form.formState.errors.borrower.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-email">Email *</Label>
                    <Input
                      id="borrower-email"
                      type="email"
                      {...form.register('borrower.email')}
                      data-testid="input-borrower-email"
                    />
                    {form.formState.errors.borrower?.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.borrower.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-maritalStatus">Marital Status *</Label>
                    <Select 
                      value={form.watch('borrower.maritalStatus') || 'single'}
                      onValueChange={(value) => {
                        form.setValue('borrower.maritalStatus', value as any);
                        // Trigger co-borrower popup when married is selected
                        if (value === 'married' && !hasCoBorrower) {
                          setMaritalStatusDialog({ isOpen: true });
                        }
                      }}
                    >
                      <SelectTrigger data-testid="select-borrower-maritalStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="borrower-relationshipToBorrower">Relationship to Co-borrower</Label>
                    <Select 
                      value={form.watch('borrower.relationshipToBorrower') || ''}
                      onValueChange={(value) => form.setValue('borrower.relationshipToBorrower', value as any)}
                    >
                      <SelectTrigger data-testid="select-borrower-relationshipToBorrower">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="not-applicable">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="borrower-dateOfBirth"
                      type="date"
                      {...form.register('borrower.dateOfBirth')}
                      data-testid="input-borrower-dateOfBirth"
                    />
                    {form.formState.errors.borrower?.dateOfBirth && (
                      <p className="text-sm text-destructive">{form.formState.errors.borrower.dateOfBirth.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-ssn">SSN *</Label>
                    <Input
                      id="borrower-ssn"
                      {...form.register('borrower.ssn')}
                      placeholder="XXX-XX-XXXX"
                      data-testid="input-borrower-ssn"
                    />
                    {form.formState.errors.borrower?.ssn && (
                      <p className="text-sm text-destructive">{form.formState.errors.borrower.ssn.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Residence Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Borrower Residence Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="space-y-2 md:col-span-4">
                      <Label htmlFor="borrower-residence-street">Street Address *</Label>
                      <Input
                        id="borrower-residence-street"
                        {...form.register('borrower.residenceAddress.street', {
                          onChange: () => setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100)
                        })}
                        data-testid="input-borrower-residence-street"
                      />
                      {form.formState.errors.borrower?.residenceAddress?.street && (
                        <p className="text-sm text-destructive">{form.formState.errors.borrower.residenceAddress.street.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="borrower-residence-unit">Unit/Apt</Label>
                      <Input
                        id="borrower-residence-unit"
                        {...form.register('borrower.residenceAddress.unit', {
                          onChange: () => setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100)
                        })}
                        data-testid="input-borrower-residence-unit"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="borrower-residence-city">City *</Label>
                      <Input
                        id="borrower-residence-city"
                        {...form.register('borrower.residenceAddress.city', {
                          onChange: () => setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100)
                        })}
                        data-testid="input-borrower-residence-city"
                      />
                      {form.formState.errors.borrower?.residenceAddress?.city && (
                        <p className="text-sm text-destructive">{form.formState.errors.borrower.residenceAddress.city.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="borrower-residence-state">State *</Label>
                      <Select
                        value={form.watch('borrower.residenceAddress.state') || ''}
                        onValueChange={(value) => {
                          form.setValue('borrower.residenceAddress.state', value);
                          setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100);
                        }}
                      >
                        <SelectTrigger data-testid="select-borrower-residence-state">
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.borrower?.residenceAddress?.state && (
                        <p className="text-sm text-destructive">{form.formState.errors.borrower.residenceAddress.state.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="borrower-residence-zip">ZIP Code *</Label>
                      <Input
                        id="borrower-residence-zip"
                        {...form.register('borrower.residenceAddress.zip', {
                          onChange: () => setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100)
                        })}
                        onBlur={(e) => handleBorrowerZipCodeLookup(e.target.value)}
                        data-testid="input-borrower-residence-zip"
                      />
                      {form.formState.errors.borrower?.residenceAddress?.zip && (
                        <p className="text-sm text-destructive">{form.formState.errors.borrower.residenceAddress.zip.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="borrower-residence-county">County</Label>
                      {borrowerCountyOptions.length > 0 ? (
                        <Select
                          value={form.watch('borrower.residenceAddress.county') || ''}
                          onValueChange={(value) => {
                            if (value === 'manual-entry') {
                              form.setValue('borrower.residenceAddress.county', '');
                              setBorrowerCountyOptions([]);
                            } else {
                              // Find the selected county to get its label for display
                              const selectedCounty = borrowerCountyOptions.find(county => county.value === value);
                              form.setValue('borrower.residenceAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                            }
                          }}
                        >
                          <SelectTrigger data-testid="select-borrower-residence-county">
                            <SelectValue placeholder={countyLookupLoading.borrower ? "Looking up counties..." : "Select county"} />
                          </SelectTrigger>
                          <SelectContent>
                            {borrowerCountyOptions.map((county) => (
                              <SelectItem key={county.value} value={county.value}>
                                {county.label}
                              </SelectItem>
                            ))}
                            <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                              Enter county manually
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="borrower-residence-county"
                          {...form.register('borrower.residenceAddress.county')}
                          placeholder={countyLookupLoading.borrower ? "Looking up counties..." : "Enter county name"}
                          disabled={countyLookupLoading.borrower}
                          data-testid="input-borrower-residence-county"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="borrower-years">Years at this Address</Label>
                        <Input
                          id="borrower-years"
                          type="number"
                          min="0"
                          max="99"
                          {...form.register('borrower.yearsAtAddress')}
                          data-testid="input-borrower-years"
                        />
                      </div>
                      <div>
                        <Label htmlFor="borrower-months">Months at this Address</Label>
                        <Input
                          id="borrower-months"
                          type="number"
                          min="0"
                          max="11"
                          {...form.register('borrower.monthsAtAddress')}
                          data-testid="input-borrower-months"
                        />
                      </div>
                    </div>
                    {form.formState.errors.borrower?.yearsAtAddress && (
                      <p className="text-sm text-destructive">{form.formState.errors.borrower.yearsAtAddress.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Prior Borrower Residence Address - Show if less than 2 years at current address */}
              {(() => {
                const years = parseInt(form.watch('borrower.yearsAtAddress') || '0');
                const months = parseInt(form.watch('borrower.monthsAtAddress') || '0');
                const showPriorAddress = years < 2 || (years === 0 && months < 24);
                return showPriorAddress;
              })() && (
                <Card>
                  <CardHeader>
                    <CardTitle>Borrower's Prior Residence Address</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="borrower-prior-street">Street Address</Label>
                      <Input
                        id="borrower-prior-street"
                        {...form.register('borrower.priorResidenceAddress.street')}
                        data-testid="input-borrower-prior-street"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="borrower-prior-unit">Unit/Apt</Label>
                      <Input
                        id="borrower-prior-unit"
                        {...form.register('borrower.priorResidenceAddress.unit')}
                        data-testid="input-borrower-prior-unit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="borrower-prior-city">City</Label>
                      <Input
                        id="borrower-prior-city"
                        {...form.register('borrower.priorResidenceAddress.city')}
                        data-testid="input-borrower-prior-city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="borrower-prior-state">State</Label>
                      <Select
                        value={form.watch('borrower.priorResidenceAddress.state') || ''}
                        onValueChange={(value) => form.setValue('borrower.priorResidenceAddress.state', value, { shouldDirty: true })}
                      >
                        <SelectTrigger data-testid="select-borrower-prior-state">
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="borrower-prior-zip">ZIP Code</Label>
                      <Input
                        id="borrower-prior-zip"
                        {...form.register('borrower.priorResidenceAddress.zip')}
                        onBlur={(e) => handleBorrowerPriorZipCodeLookup(e.target.value)}
                        data-testid="input-borrower-prior-zip"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="borrower-prior-county">County</Label>
                      {borrowerPriorCountyOptions.length > 0 ? (
                        <Select
                          value={form.watch('borrower.priorResidenceAddress.county') || ''}
                          onValueChange={(value) => {
                            if (value === 'manual-entry') {
                              form.setValue('borrower.priorResidenceAddress.county', '');
                              setBorrowerPriorCountyOptions([]);
                            } else {
                              // Find the selected county to get its label for display
                              const selectedCounty = borrowerPriorCountyOptions.find(county => county.value === value);
                              form.setValue('borrower.priorResidenceAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                            }
                          }}
                        >
                          <SelectTrigger data-testid="select-borrower-prior-county">
                            <SelectValue placeholder={countyLookupLoading.borrowerPrior ? "Looking up counties..." : "Select county"} />
                          </SelectTrigger>
                          <SelectContent>
                            {borrowerPriorCountyOptions.map((county) => (
                              <SelectItem key={county.value} value={county.value}>
                                {county.label}
                              </SelectItem>
                            ))}
                            <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                              Enter county manually
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="borrower-prior-county"
                          {...form.register('borrower.priorResidenceAddress.county')}
                          placeholder={countyLookupLoading.borrowerPrior ? "Looking up counties..." : "Enter county name"}
                          disabled={countyLookupLoading.borrowerPrior}
                          data-testid="input-borrower-prior-county"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="borrower-prior-years">Years at this Address</Label>
                          <Input
                            id="borrower-prior-years"
                            type="number"
                            min="0"
                            max="99"
                            {...form.register('borrower.priorYearsAtAddress')}
                            data-testid="input-borrower-prior-years"
                          />
                        </div>
                        <div>
                          <Label htmlFor="borrower-prior-months">Months at this Address</Label>
                          <Input
                            id="borrower-prior-months"
                            type="number"
                            min="0"
                            max="11"
                            {...form.register('borrower.priorMonthsAtAddress')}
                            data-testid="input-borrower-prior-months"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Add Prior Address Button - positioned at bottom right */}
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addBorrowerPriorAddress}
                        className="hover:bg-blue-500 hover:text-white"
                        data-testid="button-add-prior-address"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prior Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Prior Addresses for Borrower */}
              {borrowerPriorAddresses.map((address, index) => (
                <Card key={address.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Borrower's Prior Residence Address #{index + 2}</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBorrowerPriorAddress(address.id)}
                      className="hover:bg-orange-500 hover:text-white"
                      data-testid={`button-remove-prior-address-${address.id}`}
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`borrower-prior-street-${address.id}`}>Street Address</Label>
                      <Input
                        id={`borrower-prior-street-${address.id}`}
                        placeholder="Street Address"
                        data-testid={`input-borrower-prior-street-${address.id}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`borrower-prior-unit-${address.id}`}>Unit/Apt</Label>
                      <Input
                        id={`borrower-prior-unit-${address.id}`}
                        placeholder="Unit/Apt"
                        data-testid={`input-borrower-prior-unit-${address.id}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`borrower-prior-city-${address.id}`}>City</Label>
                      <Input
                        id={`borrower-prior-city-${address.id}`}
                        placeholder="City"
                        data-testid={`input-borrower-prior-city-${address.id}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`borrower-prior-state-${address.id}`}>State</Label>
                      <Select defaultValue="">
                        <SelectTrigger data-testid={`select-borrower-prior-state-${address.id}`}>
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`borrower-prior-zip-${address.id}`}>ZIP Code</Label>
                      <Input
                        id={`borrower-prior-zip-${address.id}`}
                        placeholder="ZIP Code"
                        data-testid={`input-borrower-prior-zip-${address.id}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`borrower-prior-county-${address.id}`}>County</Label>
                      <Input
                        id={`borrower-prior-county-${address.id}`}
                        placeholder="County"
                        data-testid={`input-borrower-prior-county-${address.id}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`borrower-prior-years-${address.id}`}>Years at this Address</Label>
                          <Input
                            id={`borrower-prior-years-${address.id}`}
                            type="number"
                            min="0"
                            max="99"
                            placeholder="Years"
                            data-testid={`input-borrower-prior-years-${address.id}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`borrower-prior-months-${address.id}`}>Months at this Address</Label>
                          <Input
                            id={`borrower-prior-months-${address.id}`}
                            type="number"
                            min="0"
                            max="11"
                            placeholder="Months"
                            data-testid={`input-borrower-prior-months-${address.id}`}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Co-Borrower Section */}
<Card className="mt-16 border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Co-Borrower Information</CardTitle>
                  {!hasCoBorrower ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCoBorrower}
                      className="hover:bg-orange-500 hover:text-white"
                      data-testid="button-add-coborrower"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Co-Borrower
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeCoBorrower}
                      className="hover:bg-orange-500 hover:text-white"
                      data-testid="button-remove-coborrower"
                    >
                      Remove Co-Borrower
                    </Button>
                  )}
                </CardHeader>
                {hasCoBorrower && (
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-firstName">First Name</Label>
                      <Input
                        id="coBorrower-firstName"
                        {...form.register('coBorrower.firstName')}
                        data-testid="input-coborrower-firstName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-middleName">Middle Name</Label>
                      <Input
                        id="coBorrower-middleName"
                        {...form.register('coBorrower.middleName')}
                        data-testid="input-coborrower-middleName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-lastName">Last Name</Label>
                      <Input
                        id="coBorrower-lastName"
                        {...form.register('coBorrower.lastName')}
                        data-testid="input-coborrower-lastName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-phone">Phone</Label>
                      <Input
                        id="coBorrower-phone"
                        value={form.watch('coBorrower.phone') || ''}
                        onChange={(e) => handlePhoneChange('coBorrower.phone', e.target.value)}
                        placeholder="(XXX) XXX-XXXX"
                        data-testid="input-coborrower-phone"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-email">Email</Label>
                      <Input
                        id="coBorrower-email"
                        type="email"
                        {...form.register('coBorrower.email')}
                        data-testid="input-coborrower-email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-maritalStatus">Marital Status</Label>
                      <Select 
                        value={form.watch('coBorrower.maritalStatus') || 'single'}
                        onValueChange={(value) => form.setValue('coBorrower.maritalStatus', value as any)}
                      >
                        <SelectTrigger data-testid="select-coborrower-maritalStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-relationshipToBorrower">Relationship to Borrower</Label>
                      <Select 
                        value={form.watch('coBorrower.relationshipToBorrower') || ''}
                        onValueChange={(value) => form.setValue('coBorrower.relationshipToBorrower', value as any)}
                      >
                        <SelectTrigger data-testid="select-coborrower-relationshipToBorrower">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-dateOfBirth">Date of Birth</Label>
                      <Input
                        id="coBorrower-dateOfBirth"
                        type="date"
                        {...form.register('coBorrower.dateOfBirth')}
                        data-testid="input-coborrower-dateOfBirth"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-ssn">SSN</Label>
                      <Input
                        id="coBorrower-ssn"
                        {...form.register('coBorrower.ssn')}
                        placeholder="XXX-XX-XXXX"
                        data-testid="input-coborrower-ssn"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Co-Borrower Residence Address */}
              {hasCoBorrower && (
                <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Co-Borrower Residence Address</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyBorrowerToCoResidence}
                      className="hover:bg-orange-500 hover:text-white"
                      data-testid="button-copy-borrower-address"
                    >
                      Same as Borrower
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="space-y-2 md:col-span-4">
                        <Label htmlFor="coBorrower-residence-street">Street Address</Label>
                        <Input
                          id="coBorrower-residence-street"
                          {...form.register('coBorrower.residenceAddress.street', {
                            onChange: () => setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100)
                          })}
                          data-testid="input-coborrower-residence-street"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="coBorrower-residence-unit">Unit/Apt</Label>
                        <Input
                          id="coBorrower-residence-unit"
                          {...form.register('coBorrower.residenceAddress.unit', {
                            onChange: () => setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100)
                          })}
                          data-testid="input-coborrower-residence-unit"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="coBorrower-residence-city">City</Label>
                        <Input
                          id="coBorrower-residence-city"
                          {...form.register('coBorrower.residenceAddress.city', {
                            onChange: () => setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100)
                          })}
                          data-testid="input-coborrower-residence-city"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-residence-state">State</Label>
                        <Select
                          value={form.watch('coBorrower.residenceAddress.state') || ''}
                          onValueChange={(value) => {
                            form.setValue('coBorrower.residenceAddress.state', value);
                            setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100);
                          }}
                        >
                          <SelectTrigger data-testid="select-coborrower-residence-state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-residence-zip">ZIP Code</Label>
                        <Input
                          id="coBorrower-residence-zip"
                          {...form.register('coBorrower.residenceAddress.zip', {
                            onChange: () => setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100)
                          })}
                          onBlur={(e) => handleCoBorrowerZipCodeLookup(e.target.value)}
                          data-testid="input-coborrower-residence-zip"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="coBorrower-residence-county">County</Label>
                        {coBorrowerCountyOptions.length > 0 ? (
                          <Select
                            value={form.watch('coBorrower.residenceAddress.county') || ''}
                            onValueChange={(value) => {
                              if (value === 'manual-entry') {
                                form.setValue('coBorrower.residenceAddress.county', '');
                                setCoBorrowerCountyOptions([]);
                              } else {
                                form.setValue('coBorrower.residenceAddress.county', value, { shouldDirty: true });
                              }
                            }}
                          >
                            <SelectTrigger data-testid="select-coborrower-residence-county">
                              <SelectValue placeholder={countyLookupLoading.coBorrower ? "Looking up counties..." : "Select county"} />
                            </SelectTrigger>
                            <SelectContent>
                              {coBorrowerCountyOptions.map((county) => (
                                <SelectItem key={county.value} value={county.value}>
                                  {county.label}
                                </SelectItem>
                              ))}
                              <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                                Enter county manually
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="coBorrower-residence-county"
                            {...form.register('coBorrower.residenceAddress.county')}
                            placeholder={countyLookupLoading.coBorrower ? "Looking up counties..." : "Enter county name"}
                            disabled={countyLookupLoading.coBorrower}
                            data-testid="input-coborrower-residence-county"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="coBorrower-years">Years at this Address</Label>
                          <Input
                            id="coBorrower-years"
                            type="number"
                            min="0"
                            max="99"
                            {...form.register('coBorrower.yearsAtAddress')}
                            data-testid="input-coborrower-years"
                          />
                        </div>
                        <div>
                          <Label htmlFor="coBorrower-months">Months at this Address</Label>
                          <Input
                            id="coBorrower-months"
                            type="number"
                            min="0"
                            max="11"
                            {...form.register('coBorrower.monthsAtAddress')}
                            data-testid="input-coborrower-months"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prior Co-Borrower Residence Address - Show if less than 2 years at current address */}
                {(() => {
                  const years = parseInt(form.watch('coBorrower.yearsAtAddress') || '0');
                  const months = parseInt(form.watch('coBorrower.monthsAtAddress') || '0');
                  const showPriorAddress = years < 2 || (years === 0 && months < 24);
                  return showPriorAddress;
                })() && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Co-Borrower's Prior Residence Address</CardTitle>
                      </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-prior-street">Street Address</Label>
                        <Input
                          id="coBorrower-prior-street"
                          {...form.register('coBorrower.priorResidenceAddress.street')}
                          data-testid="input-coborrower-prior-street"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-prior-unit">Unit/Apt</Label>
                        <Input
                          id="coBorrower-prior-unit"
                          {...form.register('coBorrower.priorResidenceAddress.unit')}
                          data-testid="input-coborrower-prior-unit"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-prior-city">City</Label>
                        <Input
                          id="coBorrower-prior-city"
                          {...form.register('coBorrower.priorResidenceAddress.city')}
                          data-testid="input-coborrower-prior-city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-prior-state">State</Label>
                        <Select
                          value={form.watch('coBorrower.priorResidenceAddress.state') || ''}
                          onValueChange={(value) => form.setValue('coBorrower.priorResidenceAddress.state', value, { shouldDirty: true })}
                        >
                          <SelectTrigger data-testid="select-coborrower-prior-state">
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-prior-zip">ZIP Code</Label>
                        <Input
                          id="coBorrower-prior-zip"
                          {...form.register('coBorrower.priorResidenceAddress.zip')}
                          onBlur={(e) => handleCoBorrowerPriorZipCodeLookup(e.target.value)}
                          data-testid="input-coborrower-prior-zip"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-prior-county">County</Label>
                        {coBorrowerPriorCountyOptions.length > 0 ? (
                          <Select
                            value={form.watch('coBorrower.priorResidenceAddress.county') || ''}
                            onValueChange={(value) => {
                              if (value === 'manual-entry') {
                                form.setValue('coBorrower.priorResidenceAddress.county', '');
                                setCoBorrowerPriorCountyOptions([]);
                              } else {
                                // Find the selected county to get its label for display
                                const selectedCounty = coBorrowerPriorCountyOptions.find(county => county.value === value);
                                form.setValue('coBorrower.priorResidenceAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                              }
                            }}
                          >
                            <SelectTrigger data-testid="select-coborrower-prior-county">
                              <SelectValue placeholder={countyLookupLoading.coBorrowerPrior ? "Looking up counties..." : "Select county"} />
                            </SelectTrigger>
                            <SelectContent>
                              {coBorrowerPriorCountyOptions.map((county) => (
                                <SelectItem key={county.value} value={county.value}>
                                  {county.label}
                                </SelectItem>
                              ))}
                              <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                                Enter county manually
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="coBorrower-prior-county"
                            {...form.register('coBorrower.priorResidenceAddress.county')}
                            placeholder={countyLookupLoading.coBorrowerPrior ? "Looking up counties..." : "Enter county name"}
                            disabled={countyLookupLoading.coBorrowerPrior}
                            data-testid="input-coborrower-prior-county"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="coBorrower-prior-years">Years at this Address</Label>
                            <Input
                              id="coBorrower-prior-years"
                              type="number"
                              min="0"
                              max="99"
                              {...form.register('coBorrower.priorYearsAtAddress')}
                              data-testid="input-coborrower-prior-years"
                            />
                          </div>
                          <div>
                            <Label htmlFor="coBorrower-prior-months">Months at this Address</Label>
                            <Input
                              id="coBorrower-prior-months"
                              type="number"
                              min="0"
                              max="11"
                              {...form.register('coBorrower.priorMonthsAtAddress')}
                              data-testid="input-coborrower-prior-months"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addCoBorrowerPriorAddress}
                          className="hover:bg-blue-500 hover:text-white"
                          data-testid="button-add-coborrower-prior-address"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Prior Address
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Co-Borrower Prior Addresses */}
                  {coBorrowerPriorAddresses.map((address, index) => (
                    <Card key={address.id}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Co-Borrower's Prior Residence Address #{index + 2}</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCoBorrowerPriorAddress(address.id)}
                          className="hover:bg-orange-500 hover:text-white"
                          data-testid={`button-remove-coborrower-prior-address-${address.id}`}
                        >
                          <Minus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`coBorrower-prior-street-${address.id}`}>Street Address</Label>
                          <Input
                            id={`coBorrower-prior-street-${address.id}`}
                            placeholder="Street Address"
                            data-testid={`input-coborrower-prior-street-${address.id}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`coBorrower-prior-unit-${address.id}`}>Unit/Apt</Label>
                          <Input
                            id={`coBorrower-prior-unit-${address.id}`}
                            placeholder="Unit/Apt"
                            data-testid={`input-coborrower-prior-unit-${address.id}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`coBorrower-prior-city-${address.id}`}>City</Label>
                          <Input
                            id={`coBorrower-prior-city-${address.id}`}
                            placeholder="City"
                            data-testid={`input-coborrower-prior-city-${address.id}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`coBorrower-prior-state-${address.id}`}>State</Label>
                          <Select defaultValue="">
                            <SelectTrigger data-testid={`select-coborrower-prior-state-${address.id}`}>
                              <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`coBorrower-prior-zip-${address.id}`}>ZIP Code</Label>
                          <Input
                            id={`coBorrower-prior-zip-${address.id}`}
                            placeholder="ZIP Code"
                            data-testid={`input-coborrower-prior-zip-${address.id}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`coBorrower-prior-county-${address.id}`}>County</Label>
                          <Input
                            id={`coBorrower-prior-county-${address.id}`}
                            placeholder="County"
                            data-testid={`input-coborrower-prior-county-${address.id}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`coBorrower-prior-years-${address.id}`}>Years at this Address</Label>
                              <Input
                                id={`coBorrower-prior-years-${address.id}`}
                                type="number"
                                min="0"
                                max="99"
                                placeholder="Years"
                                data-testid={`input-coborrower-prior-years-${address.id}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`coBorrower-prior-months-${address.id}`}>Months at this Address</Label>
                              <Input
                                id={`coBorrower-prior-months-${address.id}`}
                                type="number"
                                min="0"
                                max="11"
                                placeholder="Months"
                                data-testid={`input-coborrower-prior-months-${address.id}`}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </>
                )}
                </>
              )}
            </TabsContent>

            {/* Income Tab */}
            <TabsContent value="income" className="space-y-6">
              {/* Household Income Summary */}
              <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="household-income-total">Total Household Income</Label>
                    <div 
                      className={`text-2xl font-bold ${(() => {
                        const totalValue = calculateTotalHouseholdIncomeValue();
                        return totalValue > 0 ? 'text-orange-600' : 'text-primary';
                      })()}`}
                      data-testid="text-household-income-total"
                    >
                      {calculateTotalHouseholdIncome()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="income-frontDTI">Front DTI</Label>
                    <Input
                      id="income-frontDTI"
                      {...form.register('income.frontDTI')}
                      placeholder="0.00%"
                      data-testid="input-income-frontDTI"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="income-backDTI">Back DTI</Label>
                    <Input
                      id="income-backDTI"
                      {...form.register('income.backDTI')}
                      placeholder="0.00%"
                      data-testid="input-income-backDTI"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Income Type Selection */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle>
                    Borrower Income{' '}
                    <span className={(() => {
                      const totalValue = calculateTotalBorrowerIncomeValue();
                      return totalValue > 0 ? 'text-green-600' : '';
                    })()}>
                      {calculateTotalBorrowerIncome()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Income Types</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-employment"
                          checked={form.watch('income.incomeTypes.employment') || false}
                          onCheckedChange={(checked) => form.setValue('income.incomeTypes.employment', !!checked)}
                          data-testid="checkbox-employment"
                        />
                        <Label htmlFor="income-type-employment">Employment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-secondEmployment"
                          checked={form.watch('income.incomeTypes.secondEmployment') || false}
                          onCheckedChange={(checked) => form.setValue('income.incomeTypes.secondEmployment', !!checked)}
                          data-testid="checkbox-secondEmployment"
                        />
                        <Label htmlFor="income-type-secondEmployment">Second Employment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-selfEmployment"
                          checked={form.watch('income.incomeTypes.selfEmployment') || false}
                          onCheckedChange={(checked) => form.setValue('income.incomeTypes.selfEmployment', !!checked)}
                          data-testid="checkbox-selfEmployment"
                        />
                        <Label htmlFor="income-type-selfEmployment">Self-Employment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-pension"
                          checked={form.watch('income.incomeTypes.pension') || false}
                          onCheckedChange={(checked) => form.setValue('income.incomeTypes.pension', !!checked)}
                          data-testid="checkbox-pension"
                        />
                        <Label htmlFor="income-type-pension">Pension</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-socialSecurity"
                          checked={form.watch('income.incomeTypes.socialSecurity') || false}
                          onCheckedChange={(checked) => form.setValue('income.incomeTypes.socialSecurity', !!checked)}
                          data-testid="checkbox-socialSecurity"
                        />
                        <Label htmlFor="income-type-socialSecurity">Social Security</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-vaBenefits"
                          checked={form.watch('income.incomeTypes.vaBenefits') || false}
                          onCheckedChange={(checked) => form.setValue('income.incomeTypes.vaBenefits', !!checked)}
                          data-testid="checkbox-vaBenefits"
                        />
                        <Label htmlFor="income-type-vaBenefits">VA Disability</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-disability"
                          checked={form.watch('income.incomeTypes.disability') || false}
                          onCheckedChange={(checked) => form.setValue('income.incomeTypes.disability', !!checked)}
                          data-testid="checkbox-disability"
                        />
                        <Label htmlFor="income-type-disability">Disability</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-property-rental"
                          checked={form.watch('income.incomeTypes.other') || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // Show popup for adding property rental
                              setPropertyRentalDialog({ isOpen: true, type: 'add' });
                            } else {
                              // Show popup for removing property rental
                              setPropertyRentalDialog({ isOpen: true, type: 'remove' });
                            }
                          }}
                          data-testid="checkbox-property-rental"
                        />
                        <Label htmlFor="income-type-property-rental">Rental Property</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Income Card */}
              {form.watch('income.incomeTypes.employment') && (
                <Card>
                  <Collapsible open={isEmploymentIncomeOpen} onOpenChange={setIsEmploymentIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Borrower Employer</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-employment-income">
                            {isEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Basic Employment Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="income-employerName">Employer Name</Label>
                              <Input
                                id="income-employerName"
                                {...form.register('income.employerName')}
                                data-testid="input-income-employerName"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-jobTitle">Job Title</Label>
                              <Input
                                id="income-jobTitle"
                                {...form.register('income.jobTitle')}
                                data-testid="input-income-jobTitle"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-monthlyIncome">Gross Monthly Income</Label>
                              <Input
                                id="income-monthlyIncome"
                                {...form.register('income.monthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-income-monthlyIncome"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-employmentType">Full-Time / Part-Time</Label>
                              <Select
                                value={form.watch('income.employmentType') || ''}
                                onValueChange={(value) => form.setValue('income.employmentType', value as any)}
                              >
                                <SelectTrigger data-testid="select-income-employmentType">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="income-years">Years Employed</Label>
                                  <Input
                                    id="income-years"
                                    type="number"
                                    min="0"
                                    max="99"
                                    {...form.register('income.yearsEmployedYears')}
                                    data-testid="input-income-years"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="income-months">Months Employed</Label>
                                  <Input
                                    id="income-months"
                                    type="number"
                                    min="0"
                                    max="11"
                                    placeholder="0"
                                    {...form.register('income.yearsEmployedMonths')}
                                    data-testid="input-income-months"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 lg:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="income-employer-phone">
                                  {form.watch('income.isShowingEmploymentVerification') ? 'Employment Verification' : 'Employer Phone'}
                                </Label>
                                <Switch
                                  checked={form.watch('income.isShowingEmploymentVerification') || false}
                                  onCheckedChange={(checked) => form.setValue('income.isShowingEmploymentVerification', checked)}
                                  data-testid="toggle-employment-verification"
                                />
                              </div>
                              <Input
                                id="income-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('income.isShowingEmploymentVerification') 
                                  ? (form.watch('income.employmentVerificationPhone') || '')
                                  : (form.watch('income.employerPhone') || '')}
                                onChange={(e) => {
                                  const fieldName = form.watch('income.isShowingEmploymentVerification') 
                                    ? 'income.employmentVerificationPhone'
                                    : 'income.employerPhone';
                                  handlePhoneChange(fieldName, e.target.value);
                                }}
                                data-testid="input-income-employer-phone"
                              />
                            </div>
                          </div>
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2 md:col-span-4">
                              <Label htmlFor="income-employer-street">Street Address</Label>
                              <Input
                                id="income-employer-street"
                                placeholder="123 Main St"
                                {...form.register('income.employerAddress.street')}
                                data-testid="input-income-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-employer-unit">Unit/Apt</Label>
                              <Input
                                id="income-employer-unit"
                                {...form.register('income.employerAddress.unit')}
                                data-testid="input-income-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-employer-city">City</Label>
                              <Input
                                id="income-employer-city"
                                {...form.register('income.employerAddress.city')}
                                data-testid="input-income-employer-city"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-employer-state">State</Label>
                              <Select onValueChange={(value) => form.setValue('income.employerAddress.state', value)}>
                                <SelectTrigger data-testid="select-income-employer-state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-employer-zip">ZIP Code</Label>
                              <Input
                                id="income-employer-zip"
                                {...form.register('income.employerAddress.zip')}
                                onBlur={(e) => handleBorrowerEmployerZipCodeLookup(e.target.value)}
                                data-testid="input-income-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-employer-county">County</Label>
                              {borrowerEmployerCountyOptions.length > 0 ? (
                                <Select
                                  value={form.watch('income.employerAddress.county') || ''}
                                  onValueChange={(value) => {
                                    if (value === 'manual-entry') {
                                      form.setValue('income.employerAddress.county', '');
                                      setBorrowerEmployerCountyOptions([]);
                                    } else {
                                      const selectedCounty = borrowerEmployerCountyOptions.find(county => county.value === value);
                                      form.setValue('income.employerAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                                    }
                                  }}
                                >
                                  <SelectTrigger data-testid="select-income-employer-county">
                                    <SelectValue placeholder={countyLookupLoading.borrowerEmployer ? "Looking up counties..." : "Select county"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {borrowerEmployerCountyOptions.map((county) => (
                                      <SelectItem key={county.value} value={county.value}>
                                        {county.label}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                                      Enter county manually
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id="income-employer-county"
                                  {...form.register('income.employerAddress.county')}
                                  placeholder={countyLookupLoading.borrowerEmployer ? "Looking up counties..." : "Enter county name"}
                                  disabled={countyLookupLoading.borrowerEmployer}
                                  data-testid="input-income-employer-county"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Prior Employment - Show if less than 2 years at current employment */}
              {form.watch('income.incomeTypes.employment') && (() => {
                const years = parseInt(form.watch('income.yearsEmployedYears') || '0');
                const months = parseInt(form.watch('income.yearsEmployedMonths') || '0');
                const totalMonths = years * 12 + months;
                const showPriorEmployment = totalMonths < 24;
                return showPriorEmployment;
              })() && (
                <Card>
                  <Collapsible open={isPriorEmploymentIncomeOpen} onOpenChange={setIsPriorEmploymentIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Prior Employment</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-prior-employment-income">
                            {isPriorEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Basic Employment Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="income-priorEmployerName">Employer Name</Label>
                              <Input
                                id="income-priorEmployerName"
                                {...form.register('income.priorEmployerName')}
                                data-testid="input-income-priorEmployerName"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-priorJobTitle">Job Title</Label>
                              <Input
                                id="income-priorJobTitle"
                                {...form.register('income.priorJobTitle')}
                                data-testid="input-income-priorJobTitle"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-priorMonthlyIncome">Gross Monthly Income</Label>
                              <Input
                                id="income-priorMonthlyIncome"
                                {...form.register('income.priorMonthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-income-priorMonthlyIncome"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-priorEmploymentType">Full-Time / Part-Time</Label>
                              <Select
                                value={form.watch('income.priorEmploymentType') || ''}
                                onValueChange={(value) => form.setValue('income.priorEmploymentType', value as any)}
                              >
                                <SelectTrigger data-testid="select-income-priorEmploymentType">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="income-prior-years">Years Employed</Label>
                                  <Input
                                    id="income-prior-years"
                                    type="number"
                                    min="0"
                                    max="99"
                                    {...form.register('income.priorYearsEmployedYears')}
                                    data-testid="input-income-prior-years"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="income-prior-months">Months Employed</Label>
                                  <Input
                                    id="income-prior-months"
                                    type="number"
                                    min="0"
                                    max="11"
                                    placeholder="0"
                                    {...form.register('income.priorYearsEmployedMonths')}
                                    data-testid="input-income-prior-months"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 lg:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="income-prior-employer-phone">
                                  {form.watch('income.priorIsShowingEmploymentVerification') ? 'Employment Verification' : 'Employer Phone'}
                                </Label>
                                <Switch
                                  checked={form.watch('income.priorIsShowingEmploymentVerification') || false}
                                  onCheckedChange={(checked) => form.setValue('income.priorIsShowingEmploymentVerification', checked)}
                                  data-testid="toggle-prior-employment-verification"
                                />
                              </div>
                              <Input
                                id="income-prior-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('income.priorIsShowingEmploymentVerification') 
                                  ? (form.watch('income.priorEmploymentVerificationPhone') || '')
                                  : (form.watch('income.priorEmployerPhone') || '')}
                                onChange={(e) => {
                                  const fieldName = form.watch('income.priorIsShowingEmploymentVerification') 
                                    ? 'income.priorEmploymentVerificationPhone'
                                    : 'income.priorEmployerPhone';
                                  handlePhoneChange(fieldName, e.target.value);
                                }}
                                data-testid="input-income-prior-employer-phone"
                              />
                            </div>
                          </div>
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2 md:col-span-4">
                              <Label htmlFor="income-prior-employer-street">Street Address</Label>
                              <Input
                                id="income-prior-employer-street"
                                placeholder="123 Main St"
                                {...form.register('income.priorEmployerAddress.street')}
                                data-testid="input-income-prior-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-prior-employer-unit">Unit/Apt</Label>
                              <Input
                                id="income-prior-employer-unit"
                                {...form.register('income.priorEmployerAddress.unit')}
                                data-testid="input-income-prior-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-prior-employer-city">City</Label>
                              <Input
                                id="income-prior-employer-city"
                                {...form.register('income.priorEmployerAddress.city')}
                                data-testid="input-income-prior-employer-city"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-prior-employer-state">State</Label>
                              <Select onValueChange={(value) => form.setValue('income.priorEmployerAddress.state', value)}>
                                <SelectTrigger data-testid="select-income-prior-employer-state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-prior-employer-zip">ZIP Code</Label>
                              <Input
                                id="income-prior-employer-zip"
                                {...form.register('income.priorEmployerAddress.zip')}
                                onBlur={(e) => handleBorrowerPriorEmployerZipCodeLookup(e.target.value)}
                                data-testid="input-income-prior-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-prior-employer-county">County</Label>
                              {borrowerPriorEmployerCountyOptions.length > 0 ? (
                                <Select
                                  value={form.watch('income.priorEmployerAddress.county') || ''}
                                  onValueChange={(value) => {
                                    if (value === 'manual-entry') {
                                      form.setValue('income.priorEmployerAddress.county', '');
                                      setBorrowerPriorEmployerCountyOptions([]);
                                    } else {
                                      const selectedCounty = borrowerPriorEmployerCountyOptions.find(county => county.value === value);
                                      form.setValue('income.priorEmployerAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                                    }
                                  }}
                                >
                                  <SelectTrigger data-testid="select-income-prior-employer-county">
                                    <SelectValue placeholder={countyLookupLoading.borrowerPriorEmployer ? "Looking up counties..." : "Select county"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {borrowerPriorEmployerCountyOptions.map((county) => (
                                      <SelectItem key={county.value} value={county.value}>
                                        {county.label}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                                      Enter county manually
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id="income-prior-employer-county"
                                  {...form.register('income.priorEmployerAddress.county')}
                                  placeholder={countyLookupLoading.borrowerPriorEmployer ? "Looking up counties..." : "Enter county name"}
                                  disabled={countyLookupLoading.borrowerPriorEmployer}
                                  data-testid="input-income-prior-employer-county"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Second Employment Income Card */}
              {form.watch('income.incomeTypes.secondEmployment') && (
                <Card>
                  <Collapsible open={isSecondEmploymentIncomeOpen} onOpenChange={setIsSecondEmploymentIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Second Employment Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-second-employment-income">
                            {isSecondEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Basic Employment Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="income-secondEmployerName">Employer Name</Label>
                              <Input
                                id="income-secondEmployerName"
                                {...form.register('income.secondEmployerName')}
                                data-testid="input-income-secondEmployerName"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-secondJobTitle">Job Title</Label>
                              <Input
                                id="income-secondJobTitle"
                                {...form.register('income.secondJobTitle')}
                                data-testid="input-income-secondJobTitle"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-secondMonthlyIncome">Gross Monthly Income</Label>
                              <Input
                                id="income-secondMonthlyIncome"
                                {...form.register('income.secondMonthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-income-secondMonthlyIncome"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-secondEmploymentType">Full-Time / Part-Time</Label>
                              <Select
                                value={form.watch('income.secondEmploymentType') || ''}
                                onValueChange={(value) => form.setValue('income.secondEmploymentType', value as any)}
                              >
                                <SelectTrigger data-testid="select-income-secondEmploymentType">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="income-second-years">Years Employed</Label>
                                  <Input
                                    id="income-second-years"
                                    type="number"
                                    min="0"
                                    max="99"
                                    {...form.register('income.secondYearsEmployedYears')}
                                    data-testid="input-income-second-years"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="income-second-months">Months Employed</Label>
                                  <Input
                                    id="income-second-months"
                                    type="number"
                                    min="0"
                                    max="11"
                                    placeholder="0"
                                    {...form.register('income.secondYearsEmployedMonths')}
                                    data-testid="input-income-second-months"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 lg:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="income-second-employer-phone">
                                  {form.watch('income.secondIsShowingEmploymentVerification') ? 'Employment Verification' : 'Employer Phone'}
                                </Label>
                                <Switch
                                  checked={form.watch('income.secondIsShowingEmploymentVerification') || false}
                                  onCheckedChange={(checked) => form.setValue('income.secondIsShowingEmploymentVerification', checked)}
                                  data-testid="toggle-second-employment-verification"
                                />
                              </div>
                              <Input
                                id="income-second-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('income.secondIsShowingEmploymentVerification') 
                                  ? (form.watch('income.secondEmploymentVerificationPhone') || '')
                                  : (form.watch('income.secondEmployerPhone') || '')}
                                onChange={(e) => {
                                  const fieldName = form.watch('income.secondIsShowingEmploymentVerification') 
                                    ? 'income.secondEmploymentVerificationPhone'
                                    : 'income.secondEmployerPhone';
                                  handlePhoneChange(fieldName, e.target.value);
                                }}
                                data-testid="input-income-second-employer-phone"
                              />
                            </div>
                          </div>
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2 md:col-span-4">
                              <Label htmlFor="income-second-employer-street">Street Address</Label>
                              <Input
                                id="income-second-employer-street"
                                placeholder="123 Main St"
                                {...form.register('income.secondEmployerAddress.street')}
                                data-testid="input-income-second-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-second-employer-unit">Unit/Apt</Label>
                              <Input
                                id="income-second-employer-unit"
                                {...form.register('income.secondEmployerAddress.unit')}
                                data-testid="input-income-second-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-second-employer-city">City</Label>
                              <Input
                                id="income-second-employer-city"
                                {...form.register('income.secondEmployerAddress.city')}
                                data-testid="input-income-second-employer-city"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-second-employer-state">State</Label>
                              <Select
                                value={form.watch('income.secondEmployerAddress.state') || ''}
                                onValueChange={(value) => form.setValue('income.secondEmployerAddress.state', value)}
                              >
                                <SelectTrigger data-testid="select-income-second-employer-state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-second-employer-zip">ZIP Code</Label>
                              <Input
                                id="income-second-employer-zip"
                                {...form.register('income.secondEmployerAddress.zip')}
                                onBlur={(e) => handleBorrowerSecondEmployerZipCodeLookup(e.target.value)}
                                data-testid="input-income-second-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-second-employer-county">County</Label>
                              {borrowerSecondEmployerCountyOptions.length > 0 ? (
                                <Select
                                  value={form.watch('income.secondEmployerAddress.county') || ''}
                                  onValueChange={(value) => {
                                    if (value === 'manual-entry') {
                                      form.setValue('income.secondEmployerAddress.county', '');
                                      setBorrowerSecondEmployerCountyOptions([]);
                                    } else {
                                      const selectedCounty = borrowerSecondEmployerCountyOptions.find(county => county.value === value);
                                      form.setValue('income.secondEmployerAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                                    }
                                  }}
                                >
                                  <SelectTrigger data-testid="select-income-second-employer-county">
                                    <SelectValue placeholder={countyLookupLoading.borrowerSecondEmployer ? "Looking up counties..." : "Select county"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {borrowerSecondEmployerCountyOptions.map((county) => (
                                      <SelectItem key={county.value} value={county.value}>
                                        {county.label}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                                      Enter county manually
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id="income-second-employer-county"
                                  {...form.register('income.secondEmployerAddress.county')}
                                  placeholder={countyLookupLoading.borrowerSecondEmployer ? "Looking up counties..." : "Enter county name"}
                                  disabled={countyLookupLoading.borrowerSecondEmployer}
                                  data-testid="input-income-second-employer-county"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Self-Employment Income Card */}
              {form.watch('income.incomeTypes.selfEmployment') && (
                <Card>
                  <Collapsible open={isSelfEmploymentIncomeOpen} onOpenChange={setIsSelfEmploymentIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Self-Employment Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-self-employment-income">
                            {isSelfEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="income-businessName">Business Name</Label>
                          <Input
                            id="income-businessName"
                            {...form.register('income.businessName')}
                            data-testid="input-income-businessName"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="income-businessMonthlyIncome">Monthly Net Income</Label>
                          <Input
                            id="income-businessMonthlyIncome"
                            {...form.register('income.businessMonthlyIncome')}
                            placeholder="$0.00"
                            data-testid="input-income-businessMonthlyIncome"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Years in Business</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="income-business-years">Years</Label>
                              <Input
                                id="income-business-years"
                                type="number"
                                min="0"
                                max="99"
                                {...form.register('income.yearsInBusinessYears')}
                                data-testid="input-income-business-years"
                              />
                            </div>
                            <div>
                              <Label htmlFor="income-business-months">Months</Label>
                              <Input
                                id="income-business-months"
                                type="number"
                                min="0"
                                max="11"
                                placeholder="0"
                                {...form.register('income.yearsInBusinessMonths')}
                                data-testid="input-income-business-months"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 md:col-span-3">
                          <Label className="text-base font-semibold">Business Address</Label>
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2 md:col-span-4">
                              <Label htmlFor="income-business-street">Street Address</Label>
                              <Input
                                id="income-business-street"
                                placeholder="123 Main St"
                                {...form.register('income.businessAddress.street')}
                                data-testid="input-income-business-street"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-business-unit">Unit/Suite</Label>
                              <Input
                                id="income-business-unit"
                                {...form.register('income.businessAddress.unit')}
                                data-testid="input-income-business-unit"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-business-city">City</Label>
                              <Input
                                id="income-business-city"
                                {...form.register('income.businessAddress.city')}
                                data-testid="input-income-business-city"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-business-state">State</Label>
                              <Select onValueChange={(value) => form.setValue('income.businessAddress.state', value)}>
                                <SelectTrigger data-testid="select-income-business-state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-business-zip">ZIP Code</Label>
                              <Input
                                id="income-business-zip"
                                {...form.register('income.businessAddress.zip')}
                                data-testid="input-income-business-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-business-county">County</Label>
                              <Input
                                id="income-business-county"
                                {...form.register('income.businessAddress.county')}
                                data-testid="input-income-business-county"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="income-business-phone">Business Phone</Label>
                          <Input
                            id="income-business-phone"
                            placeholder="(XXX) XXX-XXXX"
                            value={form.watch('income.businessPhone') || ''}
                            onChange={(e) => handlePhoneChange('income.businessPhone', e.target.value)}
                            data-testid="input-income-business-phone"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Pension Income Card */}
              {form.watch('income.incomeTypes.pension') && (
                <Card>
                  <Collapsible open={isPensionIncomeOpen} onOpenChange={setIsPensionIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Pension Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-pension-income">
                            {isPensionIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Pension Entries</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addBorrowerPension}
                            className="hover:bg-orange-500 hover:text-white hover:border-orange-500"
                            data-testid="button-add-borrower-pension"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Pension
                          </Button>
                        </div>
                        
                        {(form.watch('income.pensions') || []).map((pension, index) => (
                          <Card key={pension.id || index} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium">Pension {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBorrowerPension(pension.id!)}
                                data-testid={`button-remove-borrower-pension-${index}`}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`income-pension-${index}-payerName`}>Payer Name</Label>
                                <Input
                                  id={`income-pension-${index}-payerName`}
                                  {...form.register(`income.pensions.${index}.payerName`)}
                                  placeholder="e.g., Federal Retirement Fund"
                                  data-testid={`input-income-pension-${index}-payerName`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`income-pension-${index}-monthlyAmount`}>Monthly Amount</Label>
                                <Input
                                  id={`income-pension-${index}-monthlyAmount`}
                                  {...form.register(`income.pensions.${index}.monthlyAmount`)}
                                  placeholder="$0.00"
                                  data-testid={`input-income-pension-${index}-monthlyAmount`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`income-pension-${index}-startDate`}>Start Date</Label>
                                <Input
                                  id={`income-pension-${index}-startDate`}
                                  {...form.register(`income.pensions.${index}.startDate`)}
                                  placeholder="MM/YYYY"
                                  data-testid={`input-income-pension-${index}-startDate`}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Social Security Income Card */}
              {form.watch('income.incomeTypes.socialSecurity') && (
                <Card>
                  <Collapsible open={isSocialSecurityIncomeOpen} onOpenChange={setIsSocialSecurityIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Social Security Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-social-security-income">
                            {isSocialSecurityIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="income-socialSecurityMonthlyAmount">Monthly Amount</Label>
                          <Input
                            id="income-socialSecurityMonthlyAmount"
                            {...form.register('income.socialSecurityMonthlyAmount')}
                            placeholder="$0.00"
                            data-testid="input-income-socialSecurityMonthlyAmount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income-socialSecurityStartDate">Start Date</Label>
                          <Input
                            id="income-socialSecurityStartDate"
                            {...form.register('income.socialSecurityStartDate')}
                            placeholder="MM/YYYY"
                            data-testid="input-income-socialSecurityStartDate"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* VA Benefits Income Card */}
              {form.watch('income.incomeTypes.vaBenefits') && (
                <Card>
                  <Collapsible open={isVaBenefitsIncomeOpen} onOpenChange={setIsVaBenefitsIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>VA Disability Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-va-benefits-income">
                            {isVaBenefitsIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="income-vaBenefitsMonthlyAmount">Monthly Amount</Label>
                          <Input
                            id="income-vaBenefitsMonthlyAmount"
                            {...form.register('income.vaBenefitsMonthlyAmount')}
                            placeholder="$0.00"
                            data-testid="input-income-vaBenefitsMonthlyAmount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income-vaBenefitsStartDate">Start Date</Label>
                          <Input
                            id="income-vaBenefitsStartDate"
                            {...form.register('income.vaBenefitsStartDate')}
                            placeholder="MM/YYYY"
                            data-testid="input-income-vaBenefitsStartDate"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Disability Income Card */}
              {form.watch('income.incomeTypes.disability') && (
                <Card>
                  <Collapsible open={isDisabilityIncomeOpen} onOpenChange={setIsDisabilityIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Disability Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-disability-income">
                            {isDisabilityIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="income-disabilityPayerName">Payer Name</Label>
                          <Input
                            id="income-disabilityPayerName"
                            {...form.register('income.disabilityPayerName')}
                            data-testid="input-income-disabilityPayerName"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income-disabilityMonthlyAmount">Monthly Amount</Label>
                          <Input
                            id="income-disabilityMonthlyAmount"
                            {...form.register('income.disabilityMonthlyAmount')}
                            placeholder="$0.00"
                            data-testid="input-income-disabilityMonthlyAmount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income-disabilityStartDate">Start Date</Label>
                          <Input
                            id="income-disabilityStartDate"
                            {...form.register('income.disabilityStartDate')}
                            placeholder="MM/YYYY"
                            data-testid="input-income-disabilityStartDate"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Rental Income Card */}
              {form.watch('income.incomeTypes.other') && (
                <Card>
                  <Collapsible open={isOtherIncomeOpen} onOpenChange={setIsOtherIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Rental Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-other-income">
                            {isOtherIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="income-otherIncomeDescription">Investment Property</Label>
                          <Input
                            id="income-otherIncomeDescription"
                            {...form.register('income.otherIncomeDescription')}
                            placeholder="Property address"
                            data-testid="input-income-otherIncomeDescription"
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income-otherIncomeMonthlyAmount">Monthly Amount</Label>
                          <Input
                            id="income-otherIncomeMonthlyAmount"
                            {...form.register('income.otherIncomeMonthlyAmount')}
                            placeholder="$0.00"
                            data-testid="input-income-otherIncomeMonthlyAmount"
                            readOnly
                            className={(() => {
                              const value = form.watch('income.otherIncomeMonthlyAmount') || '';
                              if (value.startsWith('-')) return 'text-red-600';
                              if (value && !value.startsWith('$0') && parseFloat(value.replace(/[$,]/g, '')) > 0) return 'text-green-600';
                              return '';
                            })()}
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Co-Borrower Income */}
              {hasCoBorrower && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle>
                      Co-Borrower Income{' '}
                      <span className={(() => {
                        const totalValue = calculateTotalCoBorrowerIncomeValue();
                        return totalValue > 0 ? 'text-green-600' : '';
                      })()}>
                        {calculateTotalCoBorrowerIncome()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Income Types</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-employment"
                            checked={form.watch('coBorrowerIncome.incomeTypes.employment') || false}
                            onCheckedChange={(checked) => form.setValue('coBorrowerIncome.incomeTypes.employment', !!checked)}
                            data-testid="checkbox-coborrower-employment"
                          />
                          <Label htmlFor="coBorrowerIncome-type-employment">Employment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-secondEmployment"
                            checked={form.watch('coBorrowerIncome.incomeTypes.secondEmployment') || false}
                            onCheckedChange={(checked) => form.setValue('coBorrowerIncome.incomeTypes.secondEmployment', !!checked)}
                            data-testid="checkbox-coborrower-secondEmployment"
                          />
                          <Label htmlFor="coBorrowerIncome-type-secondEmployment">Second Employment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-selfEmployment"
                            checked={form.watch('coBorrowerIncome.incomeTypes.selfEmployment') || false}
                            onCheckedChange={(checked) => form.setValue('coBorrowerIncome.incomeTypes.selfEmployment', !!checked)}
                            data-testid="checkbox-coborrower-selfEmployment"
                          />
                          <Label htmlFor="coBorrowerIncome-type-selfEmployment">Self-Employment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-pension"
                            checked={form.watch('coBorrowerIncome.incomeTypes.pension') || false}
                            onCheckedChange={(checked) => form.setValue('coBorrowerIncome.incomeTypes.pension', !!checked)}
                            data-testid="checkbox-coborrower-pension"
                          />
                          <Label htmlFor="coBorrowerIncome-type-pension">Pension</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-socialSecurity"
                            checked={form.watch('coBorrowerIncome.incomeTypes.socialSecurity') || false}
                            onCheckedChange={(checked) => form.setValue('coBorrowerIncome.incomeTypes.socialSecurity', !!checked)}
                            data-testid="checkbox-coborrower-socialSecurity"
                          />
                          <Label htmlFor="coBorrowerIncome-type-socialSecurity">Social Security</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-vaBenefits"
                            checked={form.watch('coBorrowerIncome.incomeTypes.vaBenefits') || false}
                            onCheckedChange={(checked) => form.setValue('coBorrowerIncome.incomeTypes.vaBenefits', !!checked)}
                            data-testid="checkbox-coborrower-vaBenefits"
                          />
                          <Label htmlFor="coBorrowerIncome-type-vaBenefits">VA Disability</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-disability"
                            checked={form.watch('coBorrowerIncome.incomeTypes.disability') || false}
                            onCheckedChange={(checked) => form.setValue('coBorrowerIncome.incomeTypes.disability', !!checked)}
                            data-testid="checkbox-coborrower-disability"
                          />
                          <Label htmlFor="coBorrowerIncome-type-disability">Disability</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-other"
                            checked={form.watch('coBorrowerIncome.incomeTypes.other') || false}
                            onCheckedChange={(checked) => form.setValue('coBorrowerIncome.incomeTypes.other', !!checked)}
                            data-testid="checkbox-coborrower-other"
                          />
                          <Label htmlFor="coBorrowerIncome-type-other">Other</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Co-Borrower Employment Income Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.employment') && (
                <Card>
                  <Collapsible open={isCoBorrowerEmploymentIncomeOpen} onOpenChange={setIsCoBorrowerEmploymentIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower Employer</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-coborrower-employment-income">
                            {isCoBorrowerEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Basic Employment Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-employerName">Employer Name</Label>
                              <Input
                                id="coBorrowerIncome-employerName"
                                {...form.register('coBorrowerIncome.employerName')}
                                data-testid="input-coborrowerIncome-employerName"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-jobTitle">Job Title</Label>
                              <Input
                                id="coBorrowerIncome-jobTitle"
                                {...form.register('coBorrowerIncome.jobTitle')}
                                data-testid="input-coborrowerIncome-jobTitle"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-monthlyIncome">Gross Monthly Income</Label>
                              <Input
                                id="coBorrowerIncome-monthlyIncome"
                                {...form.register('coBorrowerIncome.monthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-coborrowerIncome-monthlyIncome"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-employmentType">Full-Time / Part-Time</Label>
                              <Select
                                value={form.watch('coBorrowerIncome.employmentType') || ''}
                                onValueChange={(value) => form.setValue('coBorrowerIncome.employmentType', value as any)}
                              >
                                <SelectTrigger data-testid="select-coborrowerIncome-employmentType">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="coBorrowerIncome-years">Years Employed</Label>
                                  <Input
                                    id="coBorrowerIncome-years"
                                    type="number"
                                    min="0"
                                    max="99"
                                    {...form.register('coBorrowerIncome.yearsEmployedYears')}
                                    data-testid="input-coborrowerIncome-years"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="coBorrowerIncome-months">Months Employed</Label>
                                  <Input
                                    id="coBorrowerIncome-months"
                                    type="number"
                                    min="0"
                                    max="11"
                                    placeholder="0"
                                    {...form.register('coBorrowerIncome.yearsEmployedMonths')}
                                    data-testid="input-coborrowerIncome-months"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 lg:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="coBorrowerIncome-employer-phone">
                                  {form.watch('coBorrowerIncome.isShowingEmploymentVerification') ? 'Employment Verification' : 'Employer Phone'}
                                </Label>
                                <Switch
                                  checked={form.watch('coBorrowerIncome.isShowingEmploymentVerification') || false}
                                  onCheckedChange={(checked) => form.setValue('coBorrowerIncome.isShowingEmploymentVerification', checked)}
                                  data-testid="toggle-coborrower-employment-verification"
                                />
                              </div>
                              <Input
                                id="coBorrowerIncome-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('coBorrowerIncome.isShowingEmploymentVerification') 
                                  ? (form.watch('coBorrowerIncome.employmentVerificationPhone') || '')
                                  : (form.watch('coBorrowerIncome.employerPhone') || '')}
                                onChange={(e) => {
                                  const fieldName = form.watch('coBorrowerIncome.isShowingEmploymentVerification') 
                                    ? 'coBorrowerIncome.employmentVerificationPhone'
                                    : 'coBorrowerIncome.employerPhone';
                                  handlePhoneChange(fieldName, e.target.value);
                                }}
                                data-testid="input-coborrowerIncome-employer-phone"
                              />
                            </div>
                          </div>
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2 md:col-span-4">
                              <Label htmlFor="coBorrowerIncome-employer-street">Street Address</Label>
                              <Input
                                id="coBorrowerIncome-employer-street"
                                placeholder="123 Main St"
                                {...form.register('coBorrowerIncome.employerAddress.street')}
                                data-testid="input-coborrowerIncome-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-employer-unit">Unit/Apt</Label>
                              <Input
                                id="coBorrowerIncome-employer-unit"
                                {...form.register('coBorrowerIncome.employerAddress.unit')}
                                data-testid="input-coborrowerIncome-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-employer-city">City</Label>
                              <Input
                                id="coBorrowerIncome-employer-city"
                                {...form.register('coBorrowerIncome.employerAddress.city')}
                                data-testid="input-coborrowerIncome-employer-city"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-employer-state">State</Label>
                              <Select onValueChange={(value) => form.setValue('coBorrowerIncome.employerAddress.state', value)}>
                                <SelectTrigger data-testid="select-coborrowerIncome-employer-state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-employer-zip">ZIP Code</Label>
                              <Input
                                id="coBorrowerIncome-employer-zip"
                                {...form.register('coBorrowerIncome.employerAddress.zip')}
                                onBlur={(e) => handleCoBorrowerEmployerZipCodeLookup(e.target.value)}
                                data-testid="input-coborrowerIncome-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-employer-county">County</Label>
                              {coBorrowerEmployerCountyOptions.length > 0 ? (
                                <Select
                                  value={form.watch('coBorrowerIncome.employerAddress.county') || ''}
                                  onValueChange={(value) => {
                                    if (value === 'manual-entry') {
                                      form.setValue('coBorrowerIncome.employerAddress.county', '');
                                      setCoBorrowerEmployerCountyOptions([]);
                                    } else {
                                      const selectedCounty = coBorrowerEmployerCountyOptions.find(county => county.value === value);
                                      form.setValue('coBorrowerIncome.employerAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                                    }
                                  }}
                                >
                                  <SelectTrigger data-testid="select-coborrowerIncome-employer-county">
                                    <SelectValue placeholder={countyLookupLoading.coBorrowerEmployer ? "Looking up counties..." : "Select county"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {coBorrowerEmployerCountyOptions.map((county) => (
                                      <SelectItem key={county.value} value={county.value}>
                                        {county.label}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                                      Enter county manually
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id="coBorrowerIncome-employer-county"
                                  {...form.register('coBorrowerIncome.employerAddress.county')}
                                  placeholder={countyLookupLoading.coBorrowerEmployer ? "Looking up counties..." : "Enter county name"}
                                  disabled={countyLookupLoading.coBorrowerEmployer}
                                  data-testid="input-coborrowerIncome-employer-county"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                  </CollapsibleContent>
                </Collapsible>
                </Card>
              )}

              {/* Co-Borrower Prior Employment - Show if less than 2 years at current employment */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.employment') && (() => {
                const years = parseInt(form.watch('coBorrowerIncome.yearsEmployedYears') || '0');
                const months = parseInt(form.watch('coBorrowerIncome.yearsEmployedMonths') || '0');
                const totalMonths = years * 12 + months;
                const showPriorEmployment = totalMonths < 24;
                return showPriorEmployment;
              })() && (
                <Card>
                  <Collapsible open={isCoBorrowerPriorEmploymentIncomeOpen} onOpenChange={setIsCoBorrowerPriorEmploymentIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower Prior Employment</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-coborrower-prior-employment-income">
                            {isCoBorrowerPriorEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Basic Employment Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-priorEmployerName">Employer Name</Label>
                              <Input
                                id="coBorrowerIncome-priorEmployerName"
                                {...form.register('coBorrowerIncome.priorEmployerName')}
                                data-testid="input-coborrowerIncome-priorEmployerName"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-priorJobTitle">Job Title</Label>
                              <Input
                                id="coBorrowerIncome-priorJobTitle"
                                {...form.register('coBorrowerIncome.priorJobTitle')}
                                data-testid="input-coborrowerIncome-priorJobTitle"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-priorMonthlyIncome">Monthly Income</Label>
                              <Input
                                id="coBorrowerIncome-priorMonthlyIncome"
                                {...form.register('coBorrowerIncome.priorMonthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-coborrowerIncome-priorMonthlyIncome"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="coBorrowerIncome-prior-years">Years Employed</Label>
                                  <Input
                                    id="coBorrowerIncome-prior-years"
                                    type="number"
                                    min="0"
                                    max="99"
                                    {...form.register('coBorrowerIncome.priorYearsEmployedYears')}
                                    data-testid="input-coborrowerIncome-prior-years"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="coBorrowerIncome-prior-months">Months Employed</Label>
                                  <Input
                                    id="coBorrowerIncome-prior-months"
                                    type="number"
                                    min="0"
                                    max="11"
                                    placeholder="0"
                                    {...form.register('coBorrowerIncome.priorYearsEmployedMonths')}
                                    data-testid="input-coBorrowerIncome-prior-months"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-prior-employer-phone">Employer Phone</Label>
                              <Input
                                id="coBorrowerIncome-prior-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('coBorrowerIncome.priorEmployerPhone') || ''}
                                onChange={(e) => handlePhoneChange('coBorrowerIncome.priorEmployerPhone', e.target.value)}
                                data-testid="input-coBorrowerIncome-prior-employer-phone"
                              />
                            </div>
                          </div>
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2 md:col-span-4">
                              <Label htmlFor="coBorrowerIncome-prior-employer-street">Street Address</Label>
                              <Input
                                id="coBorrowerIncome-prior-employer-street"
                                placeholder="123 Main St"
                                {...form.register('coBorrowerIncome.priorEmployerAddress.street')}
                                data-testid="input-coBorrowerIncome-prior-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-prior-employer-unit">Unit/Apt</Label>
                              <Input
                                id="coBorrowerIncome-prior-employer-unit"
                                {...form.register('coBorrowerIncome.priorEmployerAddress.unit')}
                                data-testid="input-coBorrowerIncome-prior-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-prior-employer-city">City</Label>
                              <Input
                                id="coBorrowerIncome-prior-employer-city"
                                {...form.register('coBorrowerIncome.priorEmployerAddress.city')}
                                data-testid="input-coBorrowerIncome-prior-employer-city"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-prior-employer-state">State</Label>
                              <Select onValueChange={(value) => form.setValue('coBorrowerIncome.priorEmployerAddress.state', value)}>
                                <SelectTrigger data-testid="select-coBorrowerIncome-prior-employer-state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-prior-employer-zip">ZIP Code</Label>
                              <Input
                                id="coBorrowerIncome-prior-employer-zip"
                                {...form.register('coBorrowerIncome.priorEmployerAddress.zip')}
                                onBlur={(e) => handleCoBorrowerPriorEmployerZipCodeLookup(e.target.value)}
                                data-testid="input-coBorrowerIncome-prior-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-prior-employer-county">County</Label>
                              {coBorrowerPriorEmployerCountyOptions.length > 0 ? (
                                <Select
                                  value={form.watch('coBorrowerIncome.priorEmployerAddress.county') || ''}
                                  onValueChange={(value) => {
                                    if (value === 'manual-entry') {
                                      form.setValue('coBorrowerIncome.priorEmployerAddress.county', '');
                                      setCoBorrowerPriorEmployerCountyOptions([]);
                                    } else {
                                      const selectedCounty = coBorrowerPriorEmployerCountyOptions.find(county => county.value === value);
                                      form.setValue('coBorrowerIncome.priorEmployerAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                                    }
                                  }}
                                >
                                  <SelectTrigger data-testid="select-coBorrowerIncome-prior-employer-county">
                                    <SelectValue placeholder={countyLookupLoading.coBorrowerPriorEmployer ? "Looking up counties..." : "Select county"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {coBorrowerPriorEmployerCountyOptions.map((county) => (
                                      <SelectItem key={county.value} value={county.value}>
                                        {county.label}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                                      Enter county manually
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id="coBorrowerIncome-prior-employer-county"
                                  {...form.register('coBorrowerIncome.priorEmployerAddress.county')}
                                  placeholder={countyLookupLoading.coBorrowerPriorEmployer ? "Looking up counties..." : "Enter county name"}
                                  disabled={countyLookupLoading.coBorrowerPriorEmployer}
                                  data-testid="input-coBorrowerIncome-prior-employer-county"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Co-Borrower Second Employment Income Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.secondEmployment') && (
                <Card>
                  <Collapsible open={isCoBorrowerSecondEmploymentIncomeOpen} onOpenChange={setIsCoBorrowerSecondEmploymentIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower Second Employment Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-coborrower-second-employment-income">
                            {isCoBorrowerSecondEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Basic Employment Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-secondEmployerName">Employer Name</Label>
                              <Input
                                id="coBorrowerIncome-secondEmployerName"
                                {...form.register('coBorrowerIncome.secondEmployerName')}
                                data-testid="input-coborrowerIncome-secondEmployerName"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-secondJobTitle">Job Title</Label>
                              <Input
                                id="coBorrowerIncome-secondJobTitle"
                                {...form.register('coBorrowerIncome.secondJobTitle')}
                                data-testid="input-coborrowerIncome-secondJobTitle"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-secondMonthlyIncome">Gross Monthly Income</Label>
                              <Input
                                id="coBorrowerIncome-secondMonthlyIncome"
                                {...form.register('coBorrowerIncome.secondMonthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-coborrowerIncome-secondMonthlyIncome"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-secondEmploymentType">Full-Time / Part-Time</Label>
                              <Select
                                value={form.watch('coBorrowerIncome.secondEmploymentType') || ''}
                                onValueChange={(value) => form.setValue('coBorrowerIncome.secondEmploymentType', value as any)}
                              >
                                <SelectTrigger data-testid="select-coborrowerIncome-secondEmploymentType">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="coBorrowerIncome-second-years">Years Employed</Label>
                                  <Input
                                    id="coBorrowerIncome-second-years"
                                    type="number"
                                    min="0"
                                    max="99"
                                    {...form.register('coBorrowerIncome.secondYearsEmployedYears')}
                                    data-testid="input-coborrowerIncome-second-years"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="coBorrowerIncome-second-months">Months Employed</Label>
                                  <Input
                                    id="coBorrowerIncome-second-months"
                                    type="number"
                                    min="0"
                                    max="11"
                                    placeholder="0"
                                    {...form.register('coBorrowerIncome.secondYearsEmployedMonths')}
                                    data-testid="input-coborrowerIncome-second-months"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2 lg:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="coBorrowerIncome-second-employer-phone">
                                  {form.watch('coBorrowerIncome.secondIsShowingEmploymentVerification') ? 'Employment Verification' : 'Employer Phone'}
                                </Label>
                                <Switch
                                  checked={form.watch('coBorrowerIncome.secondIsShowingEmploymentVerification') || false}
                                  onCheckedChange={(checked) => form.setValue('coBorrowerIncome.secondIsShowingEmploymentVerification', checked)}
                                  data-testid="toggle-coborrower-second-employment-verification"
                                />
                              </div>
                              <Input
                                id="coBorrowerIncome-second-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('coBorrowerIncome.secondIsShowingEmploymentVerification') 
                                  ? (form.watch('coBorrowerIncome.secondEmploymentVerificationPhone') || '')
                                  : (form.watch('coBorrowerIncome.secondEmployerPhone') || '')}
                                onChange={(e) => {
                                  const fieldName = form.watch('coBorrowerIncome.secondIsShowingEmploymentVerification') 
                                    ? 'coBorrowerIncome.secondEmploymentVerificationPhone'
                                    : 'coBorrowerIncome.secondEmployerPhone';
                                  handlePhoneChange(fieldName, e.target.value);
                                }}
                                data-testid="input-coborrowerIncome-second-employer-phone"
                              />
                            </div>
                          </div>
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2 md:col-span-4">
                              <Label htmlFor="coBorrowerIncome-second-employer-street">Street Address</Label>
                              <Input
                                id="coBorrowerIncome-second-employer-street"
                                placeholder="123 Main St"
                                {...form.register('coBorrowerIncome.secondEmployerAddress.street')}
                                data-testid="input-coborrowerIncome-second-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-second-employer-unit">Unit/Apt</Label>
                              <Input
                                id="coBorrowerIncome-second-employer-unit"
                                {...form.register('coBorrowerIncome.secondEmployerAddress.unit')}
                                data-testid="input-coborrowerIncome-second-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-second-employer-city">City</Label>
                              <Input
                                id="coBorrowerIncome-second-employer-city"
                                {...form.register('coBorrowerIncome.secondEmployerAddress.city')}
                                data-testid="input-coborrowerIncome-second-employer-city"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-second-employer-state">State</Label>
                              <Select
                                value={form.watch('coBorrowerIncome.secondEmployerAddress.state') || ''}
                                onValueChange={(value) => form.setValue('coBorrowerIncome.secondEmployerAddress.state', value)}
                              >
                                <SelectTrigger data-testid="select-coborrowerIncome-second-employer-state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-second-employer-zip">ZIP Code</Label>
                              <Input
                                id="coBorrowerIncome-second-employer-zip"
                                {...form.register('coBorrowerIncome.secondEmployerAddress.zip')}
                                onBlur={(e) => handleCoBorrowerSecondEmployerZipCodeLookup(e.target.value)}
                                data-testid="input-coborrowerIncome-second-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-second-employer-county">County</Label>
                              {coBorrowerSecondEmployerCountyOptions.length > 0 ? (
                                <Select
                                  value={form.watch('coBorrowerIncome.secondEmployerAddress.county') || ''}
                                  onValueChange={(value) => {
                                    if (value === 'manual-entry') {
                                      form.setValue('coBorrowerIncome.secondEmployerAddress.county', '');
                                      setCoBorrowerSecondEmployerCountyOptions([]);
                                    } else {
                                      const selectedCounty = coBorrowerSecondEmployerCountyOptions.find(county => county.value === value);
                                      form.setValue('coBorrowerIncome.secondEmployerAddress.county', selectedCounty?.label || value, { shouldDirty: true });
                                    }
                                  }}
                                >
                                  <SelectTrigger data-testid="select-coborrowerIncome-second-employer-county">
                                    <SelectValue placeholder={countyLookupLoading.coBorrowerSecondEmployer ? "Looking up counties..." : "Select county"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {coBorrowerSecondEmployerCountyOptions.map((county) => (
                                      <SelectItem key={county.value} value={county.value}>
                                        {county.label}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="manual-entry" className="text-muted-foreground border-t">
                                      Enter county manually
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id="coBorrowerIncome-second-employer-county"
                                  {...form.register('coBorrowerIncome.secondEmployerAddress.county')}
                                  placeholder={countyLookupLoading.coBorrowerSecondEmployer ? "Looking up counties..." : "Enter county name"}
                                  disabled={countyLookupLoading.coBorrowerSecondEmployer}
                                  data-testid="input-coborrowerIncome-second-employer-county"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Co-Borrower Self-Employment Income Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.selfEmployment') && (
                <Card>
                  <Collapsible open={isCoBorrowerSelfEmploymentIncomeOpen} onOpenChange={setIsCoBorrowerSelfEmploymentIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower Self-Employment Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-coborrower-self-employment-income">
                            {isCoBorrowerSelfEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-businessName">Business Name</Label>
                          <Input
                            id="coBorrowerIncome-businessName"
                            {...form.register('coBorrowerIncome.businessName')}
                            data-testid="input-coborrowerIncome-businessName"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-businessMonthlyIncome">Monthly Net Income</Label>
                          <Input
                            id="coBorrowerIncome-businessMonthlyIncome"
                            {...form.register('coBorrowerIncome.businessMonthlyIncome')}
                            placeholder="$0.00"
                            data-testid="input-coborrowerIncome-businessMonthlyIncome"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Years in Business</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="coBorrowerIncome-business-years">Years</Label>
                              <Input
                                id="coBorrowerIncome-business-years"
                                type="number"
                                min="0"
                                max="99"
                                {...form.register('coBorrowerIncome.yearsInBusinessYears')}
                                data-testid="input-coborrowerIncome-business-years"
                              />
                            </div>
                            <div>
                              <Label htmlFor="coBorrowerIncome-business-months">Months</Label>
                              <Input
                                id="coBorrowerIncome-business-months"
                                type="number"
                                min="0"
                                max="11"
                                placeholder="0"
                                {...form.register('coBorrowerIncome.yearsInBusinessMonths')}
                                data-testid="input-coborrowerIncome-business-months"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 md:col-span-3">
                          <Label className="text-base font-semibold">Business Address</Label>
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2 md:col-span-4">
                              <Label htmlFor="coBorrowerIncome-business-street">Street Address</Label>
                              <Input
                                id="coBorrowerIncome-business-street"
                                placeholder="123 Main St"
                                {...form.register('coBorrowerIncome.businessAddress.street')}
                                data-testid="input-coborrowerIncome-business-street"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-business-unit">Unit/Suite</Label>
                              <Input
                                id="coBorrowerIncome-business-unit"
                                {...form.register('coBorrowerIncome.businessAddress.unit')}
                                data-testid="input-coborrowerIncome-business-unit"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-business-city">City</Label>
                              <Input
                                id="coBorrowerIncome-business-city"
                                {...form.register('coBorrowerIncome.businessAddress.city')}
                                data-testid="input-coborrowerIncome-business-city"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-business-state">State</Label>
                              <Select onValueChange={(value) => form.setValue('coBorrowerIncome.businessAddress.state', value)}>
                                <SelectTrigger data-testid="select-coborrowerIncome-business-state">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>
                                      {state.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-business-zip">ZIP Code</Label>
                              <Input
                                id="coBorrowerIncome-business-zip"
                                {...form.register('coBorrowerIncome.businessAddress.zip')}
                                data-testid="input-coborrowerIncome-business-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-business-county">County</Label>
                              <Input
                                id="coBorrowerIncome-business-county"
                                {...form.register('coBorrowerIncome.businessAddress.county')}
                                data-testid="input-coborrowerIncome-business-county"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-business-phone">Business Phone</Label>
                          <Input
                            id="coBorrowerIncome-business-phone"
                            placeholder="(XXX) XXX-XXXX"
                            value={form.watch('coBorrowerIncome.businessPhone') || ''}
                            onChange={(e) => handlePhoneChange('coBorrowerIncome.businessPhone', e.target.value)}
                            data-testid="input-coborrowerIncome-business-phone"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Co-Borrower Pension Income Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.pension') && (
                <Card>
                  <Collapsible open={isCoBorrowerPensionIncomeOpen} onOpenChange={setIsCoBorrowerPensionIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower Pension Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-coborrower-pension-income">
                            {isCoBorrowerPensionIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Pension Entries</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addCoBorrowerPension}
                            className="hover:bg-orange-500 hover:text-white hover:border-orange-500"
                            data-testid="button-add-coborrower-pension"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Pension
                          </Button>
                        </div>
                        
                        {(form.watch('coBorrowerIncome.pensions') || []).map((pension, index) => (
                          <Card key={pension.id || index} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium">Pension {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCoBorrowerPension(pension.id!)}
                                data-testid={`button-remove-coborrower-pension-${index}`}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`coBorrowerIncome-pension-${index}-payerName`}>Payer Name</Label>
                                <Input
                                  id={`coBorrowerIncome-pension-${index}-payerName`}
                                  {...form.register(`coBorrowerIncome.pensions.${index}.payerName`)}
                                  placeholder="e.g., Federal Retirement Fund"
                                  data-testid={`input-coborrowerIncome-pension-${index}-payerName`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`coBorrowerIncome-pension-${index}-monthlyAmount`}>Monthly Amount</Label>
                                <Input
                                  id={`coBorrowerIncome-pension-${index}-monthlyAmount`}
                                  {...form.register(`coBorrowerIncome.pensions.${index}.monthlyAmount`)}
                                  placeholder="$0.00"
                                  data-testid={`input-coborrowerIncome-pension-${index}-monthlyAmount`}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`coBorrowerIncome-pension-${index}-startDate`}>Start Date</Label>
                                <Input
                                  id={`coBorrowerIncome-pension-${index}-startDate`}
                                  {...form.register(`coBorrowerIncome.pensions.${index}.startDate`)}
                                  placeholder="MM/YYYY"
                                  data-testid={`input-coborrowerIncome-pension-${index}-startDate`}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Co-Borrower Social Security Income Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.socialSecurity') && (
                <Card>
                  <Collapsible open={isCoBorrowerSocialSecurityIncomeOpen} onOpenChange={setIsCoBorrowerSocialSecurityIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower Social Security Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-coborrower-social-security-income">
                            {isCoBorrowerSocialSecurityIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-socialSecurityMonthlyAmount">Monthly Amount</Label>
                          <Input
                            id="coBorrowerIncome-socialSecurityMonthlyAmount"
                            {...form.register('coBorrowerIncome.socialSecurityMonthlyAmount')}
                            placeholder="$0.00"
                            data-testid="input-coborrowerIncome-socialSecurityMonthlyAmount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-socialSecurityStartDate">Start Date</Label>
                          <Input
                            id="coBorrowerIncome-socialSecurityStartDate"
                            {...form.register('coBorrowerIncome.socialSecurityStartDate')}
                            placeholder="MM/YYYY"
                            data-testid="input-coborrowerIncome-socialSecurityStartDate"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Co-Borrower VA Benefits Income Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.vaBenefits') && (
                <Card>
                  <Collapsible open={isCoBorrowerVaBenefitsIncomeOpen} onOpenChange={setIsCoBorrowerVaBenefitsIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower VA Disability Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-coborrower-va-benefits-income">
                            {isCoBorrowerVaBenefitsIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-vaBenefitsMonthlyAmount">Monthly Amount</Label>
                          <Input
                            id="coBorrowerIncome-vaBenefitsMonthlyAmount"
                            {...form.register('coBorrowerIncome.vaBenefitsMonthlyAmount')}
                            placeholder="$0.00"
                            data-testid="input-coborrowerIncome-vaBenefitsMonthlyAmount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-vaBenefitsStartDate">Start Date</Label>
                          <Input
                            id="coBorrowerIncome-vaBenefitsStartDate"
                            {...form.register('coBorrowerIncome.vaBenefitsStartDate')}
                            placeholder="MM/YYYY"
                            data-testid="input-coborrowerIncome-vaBenefitsStartDate"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Co-Borrower Disability Income Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.disability') && (
                <Card>
                  <Collapsible open={isCoBorrowerDisabilityIncomeOpen} onOpenChange={setIsCoBorrowerDisabilityIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower Disability Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-coborrower-disability-income">
                            {isCoBorrowerDisabilityIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-disabilityPayerName">Payer Name</Label>
                          <Input
                            id="coBorrowerIncome-disabilityPayerName"
                            {...form.register('coBorrowerIncome.disabilityPayerName')}
                            placeholder="e.g., Social Security Administration"
                            data-testid="input-coborrowerIncome-disabilityPayerName"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-disabilityMonthlyAmount">Monthly Amount</Label>
                          <Input
                            id="coBorrowerIncome-disabilityMonthlyAmount"
                            {...form.register('coBorrowerIncome.disabilityMonthlyAmount')}
                            placeholder="$0.00"
                            data-testid="input-coborrowerIncome-disabilityMonthlyAmount"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-disabilityStartDate">Start Date</Label>
                          <Input
                            id="coBorrowerIncome-disabilityStartDate"
                            {...form.register('coBorrowerIncome.disabilityStartDate')}
                            placeholder="MM/YYYY"
                            data-testid="input-coborrowerIncome-disabilityStartDate"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}

              {/* Co-Borrower Other Income Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.other') && (
                <Card>
                  <Collapsible open={isCoBorrowerOtherIncomeOpen} onOpenChange={setIsCoBorrowerOtherIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower Rental Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-coborrower-other-income">
                            {isCoBorrowerOtherIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-otherIncomeDescription">Investment Property</Label>
                          <Input
                            id="coBorrowerIncome-otherIncomeDescription"
                            {...form.register('coBorrowerIncome.otherIncomeDescription')}
                            placeholder="e.g., Investment income, rental income"
                            data-testid="input-coborrowerIncome-otherIncomeDescription"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-otherIncomeMonthlyAmount">Monthly Amount</Label>
                          <Input
                            id="coBorrowerIncome-otherIncomeMonthlyAmount"
                            {...form.register('coBorrowerIncome.otherIncomeMonthlyAmount')}
                            placeholder="$0.00"
                            data-testid="input-coborrowerIncome-otherIncomeMonthlyAmount"
                          />
                        </div>
                      </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}
            </TabsContent>

            {/* Property Tab */}
            <TabsContent value="property" className="space-y-6">
              {/* Property Summary Card */}
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Total Properties
                    <span className="text-lg font-semibold">
                      - <span data-testid="text-property-count">{(form.watch('property.properties') || []).length}</span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>
                        {(() => {
                          const properties = form.watch('property.properties') || [];
                          const subjectProperty = properties.find(p => p.isSubject === true);
                          
                          if (!subjectProperty) return 'Estimated LTV';
                          
                          const hasAppraisedValue = subjectProperty.appraisedValue && parseMonetaryValue(subjectProperty.appraisedValue) > 0;
                          const fieldType = mortgageBalanceFieldType[subjectProperty.id || ''] || 'statement';
                          const hasPayOffBalance = fieldType === 'payoff' && subjectProperty.loan?.mortgageBalance && parseMonetaryValue(subjectProperty.loan.mortgageBalance) > 0;
                          
                          if (hasAppraisedValue && hasPayOffBalance) {
                            return 'Final LTV';
                          }
                          
                          return 'Estimated LTV';
                        })()}
                      </Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-9 w-1/4 px-3 py-2 border border-input bg-background rounded-md text-sm font-medium"
                          data-testid="display-property-estimatedLTV"
                        >
                          {(() => {
                            const properties = form.watch('property.properties') || [];
                            const subjectProperty = properties.find(p => p.isSubject === true);
                            
                            if (!subjectProperty || !subjectProperty.loan?.mortgageBalance) {
                              return '-';
                            }
                            
                            const mortgageBalance = parseMonetaryValue(subjectProperty.loan.mortgageBalance);
                            
                            // Use appraised value if available, otherwise use estimated value
                            let propertyValue = 0;
                            if (subjectProperty.appraisedValue && parseMonetaryValue(subjectProperty.appraisedValue) > 0) {
                              propertyValue = parseMonetaryValue(subjectProperty.appraisedValue);
                            } else if (subjectProperty.estimatedValue && parseMonetaryValue(subjectProperty.estimatedValue) > 0) {
                              propertyValue = parseMonetaryValue(subjectProperty.estimatedValue);
                            }
                            
                            if (propertyValue <= 0) return '-';
                            
                            const ltv = (mortgageBalance / propertyValue * 100);
                            return Math.round(ltv).toString();
                          })()}
                        </div>
                        <span className="text-lg font-medium">%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Subject Property Is</Label>
                      <div className="text-lg font-medium" data-testid="text-subject-property">
                        {(() => {
                          const properties = form.watch('property.properties') || [];
                          const subjectProperty = properties.find(p => p.isSubject);
                          if (!subjectProperty) return 'Not selected';
                          const typeLabels = {
                            'primary': 'Primary Residence',
                            'second-home': 'Second Home', 
                            'investment': 'Investment Property'
                          };
                          return typeLabels[subjectProperty.use as keyof typeof typeLabels] || 'Unknown';
                        })()}
                      </div>
                    </div>
                    
                    <div className="space-y-2 flex flex-col justify-center h-full">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className={`font-medium ${
                            (form.watch('property.properties') || []).filter(p => p.use === 'primary').length > 0 
                              ? 'text-green-500' 
                              : 'text-foreground'
                          }`}>Primary Residence:</span>
                          <span className={`font-medium ${
                            (form.watch('property.properties') || []).filter(p => p.use === 'primary').length > 0 
                              ? 'text-green-500' 
                              : 'text-foreground'
                          }`} data-testid="text-primary-count">
                            {(form.watch('property.properties') || []).filter(p => p.use === 'primary').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-medium ${
                            (form.watch('property.properties') || []).filter(p => p.use === 'second-home').length > 0 
                              ? 'text-blue-500' 
                              : 'text-foreground'
                          }`}>Second Home:</span>
                          <span className={`font-medium ${
                            (form.watch('property.properties') || []).filter(p => p.use === 'second-home').length > 0 
                              ? 'text-blue-500' 
                              : 'text-foreground'
                          }`} data-testid="text-second-home-count">
                            {(form.watch('property.properties') || []).filter(p => p.use === 'second-home').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-medium ${
                            (form.watch('property.properties') || []).filter(p => p.use === 'investment').length > 0 
                              ? 'text-orange-500' 
                              : 'text-foreground'
                          }`}>Investment Property:</span>
                          <span className={`font-medium ${
                            (form.watch('property.properties') || []).filter(p => p.use === 'investment').length > 0 
                              ? 'text-orange-500' 
                              : 'text-foreground'
                          }`} data-testid="text-investment-count">
                            {(form.watch('property.properties') || []).filter(p => p.use === 'investment').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property List Card */}
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle>Property List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-primary"
                          checked={hasPropertyType('primary')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addPropertyType('primary');
                            } else {
                              removePropertyType('primary');
                            }
                          }}
                          data-testid="checkbox-property-primary"
                        />
                        <Label htmlFor="property-type-primary" className="font-medium">
                          Primary Residence
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-second-home"
                          checked={hasPropertyType('second-home')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addPropertyType('second-home');
                            } else {
                              removePropertyType('second-home');
                            }
                          }}
                          data-testid="checkbox-property-second-home"
                        />
                        <Label htmlFor="property-type-second-home" className="font-medium">
                          Second Home
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-investment"
                          checked={hasPropertyType('investment')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addPropertyType('investment');
                            } else {
                              removePropertyType('investment');
                            }
                          }}
                          data-testid="checkbox-property-investment"
                        />
                        <Label htmlFor="property-type-investment" className="font-medium">
                          Investment Property
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Property Cards */}
              {sortPropertiesByHierarchy(form.watch('property.properties') || []).map((property, index) => {
                const propertyId = property.id || `property-${index}`;
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                const getPropertyTitle = () => {
                  const typeLabels = {
                    'primary': 'Primary Residence',
                    'second-home': 'Second Home',
                    'investment': 'Investment Property'
                  };
                  const baseTitle = typeLabels[property.use as keyof typeof typeLabels] || 'Property';
                  const sameTypeCount = (form.watch('property.properties') || [])
                    .filter(p => p.use === property.use)
                    .findIndex(p => p.id === property.id) + 1;
                  return property.use === 'primary' ? baseTitle : `${baseTitle} ${sameTypeCount}`;
                };

                return (
                  <Card key={propertyId} className={`border-l-4 ${
                    property.use === 'primary' ? 'border-l-green-500' : 
                    property.use === 'second-home' ? 'border-l-blue-500' : 
                    property.use === 'investment' ? 'border-l-orange-500' : ''
                  }`}>
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className={`flex items-center gap-2 ${property.isSubject ? 'text-green-600' : ''}`}>
                              {getPropertyTitle()}
                              {property.isSubject && (
                                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  - Subject Property
                                </span>
                              )}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-muted-foreground">Purpose:</Label>
                              <Select
                                value={property.use}
                                onValueChange={(value) => requestPropertyUsageChange(propertyId, value as 'primary' | 'second-home' | 'investment')}
                              >
                                <SelectTrigger className="w-40" data-testid={`select-property-usage-${propertyId}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="primary">Primary Residence</SelectItem>
                                  <SelectItem value="second-home">Second Home</SelectItem>
                                  <SelectItem value="investment">Investment Property</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Add/Remove buttons for multi-property types */}
                            {(property.use === 'second-home' || property.use === 'investment') && (
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addProperty(property.use as 'second-home' | 'investment')}
                                  data-testid={`button-add-${property.use}`}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeProperty(propertyId)}
                                  data-testid={`button-remove-${property.use}-${propertyId}`}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid={`button-toggle-property-${propertyId}`}>
                                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CollapsibleContent>
                        <CardContent>
                          <div className="space-y-6">
                            {/* Subject Property Question - Moved to top */}
                            <Card className="bg-muted">
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <Label className="text-base font-semibold">Is this also the subject property?</Label>
                                  <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`subject-yes-${propertyId}`}
                                        name={`subject-${propertyId}`}
                                        checked={property.isSubject === true}
                                        onChange={() => setSubjectProperty(propertyId)}
                                        data-testid={`radio-subject-yes-${propertyId}`}
                                      />
                                      <Label htmlFor={`subject-yes-${propertyId}`}>Yes</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`subject-no-${propertyId}`}
                                        name={`subject-${propertyId}`}
                                        checked={property.isSubject === false}
                                        onChange={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const updatedProperties = properties.map(p => 
                                            p.id === propertyId ? { ...p, isSubject: false } : p
                                          );
                                          form.setValue('property.properties', updatedProperties);
                                        }}
                                        data-testid={`radio-subject-no-${propertyId}`}
                                      />
                                      <Label htmlFor={`subject-no-${propertyId}`}>No</Label>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Property Address */}
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                              <div className="space-y-2 md:col-span-4">
                                <Label htmlFor={`property-address-street-${propertyId}`}>Street Address</Label>
                                <Input
                                  id={`property-address-street-${propertyId}`}
                                  {...form.register(`property.properties.${index}.address.street` as const)}
                                  placeholder="123 Main St"
                                  data-testid={`input-property-street-${propertyId}`}
                                  onBlur={() => {
                                    // Trigger auto-fetch after a delay to allow other fields to be filled
                                    setTimeout(() => handleAddressChange(index), 1000);
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`property-address-unit-${propertyId}`}>Unit/Apt</Label>
                                <Input
                                  id={`property-address-unit-${propertyId}`}
                                  {...form.register(`property.properties.${index}.address.unit` as const)}
                                  data-testid={`input-property-unit-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`property-address-city-${propertyId}`}>City</Label>
                                <Input
                                  id={`property-address-city-${propertyId}`}
                                  {...form.register(`property.properties.${index}.address.city` as const)}
                                  data-testid={`input-property-city-${propertyId}`}
                                  onBlur={() => {
                                    // Trigger auto-fetch after a delay
                                    setTimeout(() => handleAddressChange(index), 1000);
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`property-address-state-${propertyId}`}>State</Label>
                                <Select
                                  value={form.watch(`property.properties.${index}.address.state` as const) || ''}
                                  onValueChange={(value) => form.setValue(`property.properties.${index}.address.state` as const, value)}
                                >
                                  <SelectTrigger data-testid={`select-property-state-${propertyId}`}>
                                    <SelectValue placeholder="State" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {US_STATES.map((state) => (
                                      <SelectItem key={state.value} value={state.value}>
                                        {state.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`property-address-zip-${propertyId}`}>ZIP Code</Label>
                                <Input
                                  id={`property-address-zip-${propertyId}`}
                                  {...form.register(`property.properties.${index}.address.zip` as const)}
                                  data-testid={`input-property-zip-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`property-address-county-${propertyId}`}>County</Label>
                                <Input
                                  id={`property-address-county-${propertyId}`}
                                  {...form.register(`property.properties.${index}.address.county` as const)}
                                  data-testid={`input-property-county-${propertyId}`}
                                />
                              </div>
                            </div>

                            {/* Property Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`property-type-${propertyId}`}>Property Type</Label>
                                <Select
                                  value={form.watch(`property.properties.${index}.propertyType` as const) || ''}
                                  onValueChange={(value) => form.setValue(`property.properties.${index}.propertyType` as const, value)}
                                >
                                  <SelectTrigger data-testid={`select-property-type-${propertyId}`}>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="single-family">Single Family</SelectItem>
                                    <SelectItem value="condo">Condo</SelectItem>
                                    <SelectItem value="townhouse">Townhouse</SelectItem>
                                    <SelectItem value="duplex">Duplex</SelectItem>
                                    <SelectItem value="multi-family">Multi-Family</SelectItem>
                                    <SelectItem value="mobile-home-sw">Mobile Home SW</SelectItem>
                                    <SelectItem value="mobile-home-dw">Mobile Home DW</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`property-estimated-value-${propertyId}`}>Estimated Property Value</Label>
                                  <div className="flex items-center gap-1">
                                    {/* Zillow */}
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800 no-default-hover-elevate no-default-active-elevate"
                                        onClick={() => openValuationDialog('zillow', index)}
                                        onMouseEnter={(e) => handleValuationHover('zillow', index, e)}
                                        onMouseLeave={handleValuationHoverLeave}
                                        data-testid={`button-zillow-valuation-${propertyId}`}
                                        title="Enter Zillow valuation manually"
                                      >
                                        <SiZillow className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-500 hover:text-blue-700"
                                        onClick={() => {
                                          const address = {
                                            street: form.getValues(`property.properties.${index}.address.street`),
                                            city: form.getValues(`property.properties.${index}.address.city`),
                                            state: form.getValues(`property.properties.${index}.address.state`),
                                            zipCode: form.getValues(`property.properties.${index}.address.zip`)
                                          };
                                          fetchServiceValuation('zillow', index, address);
                                        }}
                                        disabled={autoValuationLoading[index]?.zillow}
                                        data-testid={`button-zillow-auto-${propertyId}`}
                                        title="Auto-fetch Zillow valuation"
                                      >
                                        {autoValuationLoading[index]?.zillow ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <RefreshCw className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                    {/* Realtor */}
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-purple-600 hover:text-purple-800 no-default-hover-elevate no-default-active-elevate"
                                        onClick={() => openValuationDialog('realtor', index)}
                                        onMouseEnter={(e) => handleValuationHover('realtor', index, e)}
                                        onMouseLeave={handleValuationHoverLeave}
                                        data-testid={`button-realtor-valuation-${propertyId}`}
                                        title="Enter Realtor.com valuation manually"
                                      >
                                        <MdRealEstateAgent className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-purple-500 hover:text-purple-700"
                                        onClick={() => {
                                          const address = {
                                            street: form.getValues(`property.properties.${index}.address.street`),
                                            city: form.getValues(`property.properties.${index}.address.city`),
                                            state: form.getValues(`property.properties.${index}.address.state`),
                                            zipCode: form.getValues(`property.properties.${index}.address.zip`)
                                          };
                                          fetchServiceValuation('realtor', index, address);
                                        }}
                                        disabled={autoValuationLoading[index]?.realtor}
                                        data-testid={`button-realtor-auto-${propertyId}`}
                                        title="Auto-fetch Realtor.com valuation"
                                      >
                                        {autoValuationLoading[index]?.realtor ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <RefreshCw className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                    {/* Redfin */}
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-red-600 hover:text-red-800 no-default-hover-elevate no-default-active-elevate"
                                        onClick={() => openValuationDialog('redfin', index)}
                                        onMouseEnter={(e) => handleValuationHover('redfin', index, e)}
                                        onMouseLeave={handleValuationHoverLeave}
                                        data-testid={`button-redfin-valuation-${propertyId}`}
                                        title="Enter Redfin valuation manually"
                                      >
                                        <FaHome className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-gray-600 hover:text-gray-800"
                                        onClick={() => openValuationSummary(index)}
                                        data-testid={`button-valuation-info-${propertyId}`}
                                        title="View all valuation estimates"
                                      >
                                        <Info className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <Input
                                  id={`property-estimated-value-${propertyId}`}
                                  {...form.register(`property.properties.${index}.estimatedValue` as const)}
                                  placeholder="$0.00"
                                  data-testid={`input-property-estimated-value-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`property-appraised-value-${propertyId}`}>Appraised Value</Label>
                                <Input
                                  id={`property-appraised-value-${propertyId}`}
                                  {...form.register(`property.properties.${index}.appraisedValue` as const)}
                                  placeholder="$0.00"
                                  data-testid={`input-property-appraised-value-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`property-owned-since-${propertyId}`}>Owned Since</Label>
                                <Input
                                  id={`property-owned-since-${propertyId}`}
                                  {...form.register(`property.properties.${index}.ownedSince` as const)}
                                  placeholder="MM/YYYY"
                                  data-testid={`input-property-owned-since-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`property-purchase-price-${propertyId}`}>Purchase Price</Label>
                                <Input
                                  id={`property-purchase-price-${propertyId}`}
                                  {...form.register(`property.properties.${index}.purchasePrice` as const)}
                                  placeholder="$0.00"
                                  data-testid={`input-property-purchase-price-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`property-hoa-fee-${propertyId}`}>HOA Fee</Label>
                                <Input
                                  id={`property-hoa-fee-${propertyId}`}
                                  {...form.register(`property.properties.${index}.hoaFee` as const)}
                                  placeholder="$0.00"
                                  data-testid={`input-property-hoa-fee-${propertyId}`}
                                />
                              </div>
                            </div>

                            {/* Active Secured Loans for Primary Residence and Second Home - Side by Side */}
                            {(property.use === 'primary' || property.use === 'second-home') && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`property-active-secured-loan-${propertyId}`}>Secured First Loan</Label>
                                  <Select
                                    value={form.watch(`property.properties.${index}.activeSecuredLoan` as const) || ''}
                                    onValueChange={(value) => form.setValue(`property.properties.${index}.activeSecuredLoan` as const, value)}
                                  >
                                    <SelectTrigger data-testid={`select-property-active-secured-loan-${propertyId}`}>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes</SelectItem>
                                      <SelectItem value="no-paid-off">No, Paid Off</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`property-active-second-loan-${propertyId}`}>Secured Second Loan</Label>
                                  <Select
                                    value={form.watch(`property.properties.${index}.activeSecondLoan` as const) || ''}
                                    onValueChange={(value) => {
                                      form.setValue(`property.properties.${index}.activeSecondLoan` as const, value);
                                      // Clear secondLoan data when toggled to "no" for data hygiene
                                      if (value !== 'yes') {
                                        form.setValue(`property.properties.${index}.secondLoan` as const, {
                                          lenderName: '',
                                          loanNumber: '',
                                          mortgageBalance: '',
                                          piPayment: '',
                                          escrowPayment: '',
                                          totalMonthlyPayment: '',
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger data-testid={`select-property-active-second-loan-${propertyId}`}>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="yes">Yes</SelectItem>
                                      <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}

                            {/* Loan Details Box - Only show for Primary Residence/Second Home if activeSecuredLoan is 'yes', or always for Investment properties */}
                            {(property.use === 'investment' || form.watch(`property.properties.${index}.activeSecuredLoan` as const) === 'yes') && (
                            <Card className="border-2 border-dashed">
                              <CardHeader>
                                <CardTitle className="text-lg">Loan Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-lender-name-${propertyId}`}>Lender Name</Label>
                                    <Input
                                      id={`property-lender-name-${propertyId}`}
                                      {...form.register(`property.properties.${index}.loan.lenderName` as const)}
                                      data-testid={`input-property-lender-name-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-loan-number-${propertyId}`}>Loan Number</Label>
                                    <Input
                                      id={`property-loan-number-${propertyId}`}
                                      {...form.register(`property.properties.${index}.loan.loanNumber` as const)}
                                      data-testid={`input-property-loan-number-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor={`property-mortgage-balance-${propertyId}`}>
                                        {getMortgageBalanceLabel(propertyId)}
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleMortgageBalanceFieldType(propertyId)}
                                        className="h-6 px-2 text-xs hover:bg-orange-500 hover:text-white hover:border-orange-500"
                                        data-testid={`button-toggle-mortgage-balance-type-${propertyId}`}
                                      >
                                        Toggle
                                      </Button>
                                    </div>
                                    <Input
                                      id={`property-mortgage-balance-${propertyId}`}
                                      {...form.register(`property.properties.${index}.loan.mortgageBalance` as const)}
                                      placeholder="$0.00"
                                      data-testid={`input-property-mortgage-balance-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-pi-payment-${propertyId}`}>Principal & Interest Payment</Label>
                                    <Input
                                      id={`property-pi-payment-${propertyId}`}
                                      {...form.register(`property.properties.${index}.loan.piPayment` as const)}
                                      placeholder="$0.00"
                                      onChange={(e) => {
                                        form.setValue(`property.properties.${index}.loan.piPayment` as const, e.target.value);
                                        calculateTotalMonthlyPayment(propertyId);
                                      }}
                                      data-testid={`input-property-pi-payment-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor={`property-escrow-payment-${propertyId}`}>
                                        {getEscrowPaymentLabel(propertyId)}
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleEscrowPaymentFieldType(propertyId)}
                                        className="h-6 px-2 text-xs hover:bg-orange-500 hover:text-white hover:border-orange-500"
                                        data-testid={`button-toggle-escrow-payment-type-${propertyId}`}
                                      >
                                        Toggle
                                      </Button>
                                    </div>
                                    <Input
                                      id={`property-escrow-payment-${propertyId}`}
                                      {...form.register(`property.properties.${index}.loan.escrowPayment` as const)}
                                      placeholder="$0.00"
                                      onChange={(e) => {
                                        form.setValue(`property.properties.${index}.loan.escrowPayment` as const, e.target.value);
                                        calculateTotalMonthlyPayment(propertyId);
                                      }}
                                      data-testid={`input-property-escrow-payment-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-total-payment-${propertyId}`}>Total Monthly Payment</Label>
                                    <Input
                                      id={`property-total-payment-${propertyId}`}
                                      {...form.register(`property.properties.${index}.loan.totalMonthlyPayment` as const)}
                                      placeholder="$0.00"
                                      readOnly
                                      className="bg-muted"
                                      data-testid={`input-property-total-payment-${propertyId}`}
                                    />
                                  </div>
                                  
                                  {/* Investment Property Rental Fields */}
                                  {property.use === 'investment' && (
                                    <>
                                      <div className="space-y-2">
                                        <Label htmlFor={`property-is-rented-${propertyId}`}>Is this Property Rented?</Label>
                                        <Select
                                          value={form.watch(`property.properties.${index}.loan.isPropertyRented` as const) || ''}
                                          onValueChange={(value) => form.setValue(`property.properties.${index}.loan.isPropertyRented` as const, value)}
                                        >
                                          <SelectTrigger data-testid={`select-property-is-rented-${propertyId}`}>
                                            <SelectValue placeholder="Select" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`property-monthly-rental-${propertyId}`}>Monthly Rental</Label>
                                        <Input
                                          id={`property-monthly-rental-${propertyId}`}
                                          {...form.register(`property.properties.${index}.loan.monthlyRental` as const)}
                                          placeholder="$0.00"
                                          onChange={(e) => {
                                            form.setValue(`property.properties.${index}.loan.monthlyRental` as const, e.target.value);
                                            calculateInvestmentIncome(propertyId);
                                          }}
                                          data-testid={`input-property-monthly-rental-${propertyId}`}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`property-monthly-income-${propertyId}`}>Monthly Income</Label>
                                        <Input
                                          id={`property-monthly-income-${propertyId}`}
                                          {...form.register(`property.properties.${index}.loan.monthlyIncome` as const)}
                                          placeholder="$0.00"
                                          readOnly
                                          className={(() => {
                                            const value = form.watch(`property.properties.${index}.loan.monthlyIncome` as const) || '';
                                            let colorClass = '';
                                            if (value.startsWith('-')) colorClass = 'text-red-600';
                                            else if (value && !value.startsWith('$0') && parseFloat(value.replace(/[$,]/g, '')) > 0) colorClass = 'text-green-600';
                                            return `bg-muted ${colorClass}`;
                                          })()}
                                          data-testid={`input-property-monthly-income-${propertyId}`}
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                            )}

                            {/* Second Loan Details Box - Only show when activeSecondLoan is 'yes' and property is primary/second-home */}
                            {(property.use === 'primary' || property.use === 'second-home') && form.watch(`property.properties.${index}.activeSecondLoan` as const) === 'yes' && (
                            <Card className="border-2 border-dashed">
                              <CardHeader>
                                <CardTitle className="text-lg">Second Loan Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-second-lender-name-${propertyId}`}>Lender Name</Label>
                                    <Input
                                      id={`property-second-lender-name-${propertyId}`}
                                      {...form.register(`property.properties.${index}.secondLoan.lenderName` as const)}
                                      data-testid={`input-property-second-lender-name-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-second-loan-number-${propertyId}`}>Loan Number</Label>
                                    <Input
                                      id={`property-second-loan-number-${propertyId}`}
                                      {...form.register(`property.properties.${index}.secondLoan.loanNumber` as const)}
                                      data-testid={`input-property-second-loan-number-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-second-mortgage-balance-${propertyId}`}>Mortgage Balance</Label>
                                    <Input
                                      id={`property-second-mortgage-balance-${propertyId}`}
                                      {...form.register(`property.properties.${index}.secondLoan.mortgageBalance` as const)}
                                      placeholder="$0.00"
                                      data-testid={`input-property-second-mortgage-balance-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-second-pi-payment-${propertyId}`}>Principal & Interest Payment</Label>
                                    <Input
                                      id={`property-second-pi-payment-${propertyId}`}
                                      {...form.register(`property.properties.${index}.secondLoan.piPayment` as const)}
                                      placeholder="$0.00"
                                      data-testid={`input-property-second-pi-payment-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-second-escrow-payment-${propertyId}`}>Other</Label>
                                    <Input
                                      id={`property-second-escrow-payment-${propertyId}`}
                                      {...form.register(`property.properties.${index}.secondLoan.escrowPayment` as const)}
                                      placeholder="$0.00"
                                      data-testid={`input-property-second-escrow-payment-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-second-total-monthly-payment-${propertyId}`}>Total Monthly Payment</Label>
                                    <Input
                                      id={`property-second-total-monthly-payment-${propertyId}`}
                                      {...form.register(`property.properties.${index}.secondLoan.totalMonthlyPayment` as const)}
                                      placeholder="$0.00"
                                      readOnly
                                      className="bg-muted"
                                      data-testid={`input-property-second-total-monthly-payment-${propertyId}`}
                                    />
                                  </div>
                                </div>
                                
                                {/* Add Third Loan Button */}
                                {!form.watch(`property.properties.${index}.activeThirdLoan` as const) && (
                                  <div className="mt-4 flex justify-center">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => form.setValue(`property.properties.${index}.activeThirdLoan` as const, 'yes')}
                                      className="hover:bg-blue-500 hover:text-white"
                                      data-testid={`button-add-third-loan-${propertyId}`}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Third Loan
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            )}

                            {/* Third Loan Details Box - Only show when activeThirdLoan is 'yes' and property is primary/second-home */}
                            {(property.use === 'primary' || property.use === 'second-home') && form.watch(`property.properties.${index}.activeThirdLoan` as const) === 'yes' && (
                            <Card className="border-2 border-dashed">
                              <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Third Loan Details</CardTitle>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeThirdLoan(index)}
                                  className="hover:bg-orange-500 hover:text-white"
                                  data-testid={`button-remove-third-loan-${propertyId}`}
                                >
                                  <Minus className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-third-lender-name-${propertyId}`}>Lender Name</Label>
                                    <Input
                                      id={`property-third-lender-name-${propertyId}`}
                                      {...form.register(`property.properties.${index}.thirdLoan.lenderName` as const)}
                                      data-testid={`input-property-third-lender-name-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-third-loan-number-${propertyId}`}>Loan Number</Label>
                                    <Input
                                      id={`property-third-loan-number-${propertyId}`}
                                      {...form.register(`property.properties.${index}.thirdLoan.loanNumber` as const)}
                                      data-testid={`input-property-third-loan-number-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-third-mortgage-balance-${propertyId}`}>Mortgage Balance</Label>
                                    <Input
                                      id={`property-third-mortgage-balance-${propertyId}`}
                                      {...form.register(`property.properties.${index}.thirdLoan.mortgageBalance` as const)}
                                      placeholder="$0.00"
                                      data-testid={`input-property-third-mortgage-balance-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-third-pi-payment-${propertyId}`}>Principal & Interest Payment</Label>
                                    <Input
                                      id={`property-third-pi-payment-${propertyId}`}
                                      {...form.register(`property.properties.${index}.thirdLoan.piPayment` as const)}
                                      placeholder="$0.00"
                                      data-testid={`input-property-third-pi-payment-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-third-escrow-payment-${propertyId}`}>Other</Label>
                                    <Input
                                      id={`property-third-escrow-payment-${propertyId}`}
                                      {...form.register(`property.properties.${index}.thirdLoan.escrowPayment` as const)}
                                      placeholder="$0.00"
                                      data-testid={`input-property-third-escrow-payment-${propertyId}`}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor={`property-third-total-monthly-payment-${propertyId}`}>Total Monthly Payment</Label>
                                    <Input
                                      id={`property-third-total-monthly-payment-${propertyId}`}
                                      {...form.register(`property.properties.${index}.thirdLoan.totalMonthlyPayment` as const)}
                                      placeholder="$0.00"
                                      readOnly
                                      className="bg-muted"
                                      data-testid={`input-property-third-total-monthly-payment-${propertyId}`}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            )}

                            {/* Add Second Home Button - Only show for second-home properties */}
                            {property.use === 'second-home' && (
                              <div className="flex justify-end mt-6">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addProperty('second-home')}
                                  className="hover:bg-blue-500 hover:text-white"
                                  data-testid={`button-add-second-home-${propertyId}`}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Second Home
                                </Button>
                              </div>
                            )}

                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}

            </TabsContent>


            {/* New Loan Tab */}
            <TabsContent value="loan" className="space-y-6">
              {/* Current Loan Information */}
              <Card>
                <Collapsible open={isCurrentLoanOpen} onOpenChange={setIsCurrentLoanOpen}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Current Loan Information</CardTitle>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-orange-500 hover:text-white" data-testid="button-toggle-current-loan">
                          {isCurrentLoanOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentLoan-currentLender">Current Lender</Label>
                        <Input
                          id="currentLoan-currentLender"
                          {...form.register('currentLoan.currentLender')}
                          data-testid="input-currentLoan-currentLender"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currentLoan-currentBalance">Current Balance</Label>
                        <Input
                          id="currentLoan-currentBalance"
                          {...form.register('currentLoan.currentBalance')}
                          placeholder="$0.00"
                          data-testid="input-currentLoan-currentBalance"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currentLoan-currentRate">Current Rate</Label>
                        <Input
                          id="currentLoan-currentRate"
                          {...form.register('currentLoan.currentRate')}
                          placeholder="0.00%"
                          data-testid="input-currentLoan-currentRate"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currentLoan-currentPayment">Current Payment</Label>
                        <Input
                          id="currentLoan-currentPayment"
                          {...form.register('currentLoan.currentPayment')}
                          placeholder="$0.00"
                          data-testid="input-currentLoan-currentPayment"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currentLoan-loanType">Loan Type</Label>
                        <Input
                          id="currentLoan-loanType"
                          {...form.register('currentLoan.loanType')}
                          data-testid="input-currentLoan-loanType"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currentLoan-remainingTerm">Remaining Term</Label>
                        <Input
                          id="currentLoan-remainingTerm"
                          {...form.register('currentLoan.remainingTerm')}
                          placeholder="Years/Months"
                          data-testid="input-currentLoan-remainingTerm"
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* New Loan Information */}
              <Card>
                <CardHeader>
                  <CardTitle>New Loan Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newLoan-loanAmount">Loan Amount</Label>
                    <Input
                      id="newLoan-loanAmount"
                      {...form.register('newLoan.loanAmount')}
                      placeholder="$0.00"
                      data-testid="input-newLoan-loanAmount"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newLoan-loanProgram">Loan Program</Label>
                    <Input
                      id="newLoan-loanProgram"
                      {...form.register('newLoan.loanProgram')}
                      data-testid="input-newLoan-loanProgram"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newLoan-interestRate">Interest Rate</Label>
                    <Input
                      id="newLoan-interestRate"
                      {...form.register('newLoan.interestRate')}
                      placeholder="0.00%"
                      data-testid="input-newLoan-interestRate"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newLoan-loanTerm">Loan Term</Label>
                    <Input
                      id="newLoan-loanTerm"
                      {...form.register('newLoan.loanTerm')}
                      placeholder="Years"
                      data-testid="input-newLoan-loanTerm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newLoan-loanPurpose">Loan Purpose</Label>
                    <Select 
                      value={form.watch('newLoan.loanPurpose') || ''}
                      onValueChange={(value) => form.setValue('newLoan.loanPurpose', value as any)}
                    >
                      <SelectTrigger data-testid="select-newLoan-loanPurpose">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="refinance">Refinance</SelectItem>
                        <SelectItem value="cash-out">Cash-Out Refinance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newLoan-lockPeriod">Lock Period</Label>
                    <Input
                      id="newLoan-lockPeriod"
                      {...form.register('newLoan.lockPeriod')}
                      placeholder="Days"
                      data-testid="input-newLoan-lockPeriod"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vendors Tab */}
            <TabsContent value="vendors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendors-realtor">Realtor</Label>
                    <Input
                      id="vendors-realtor"
                      {...form.register('vendors.realtor')}
                      data-testid="input-vendors-realtor"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendors-appraiser">Appraiser</Label>
                    <Input
                      id="vendors-appraiser"
                      {...form.register('vendors.appraiser')}
                      data-testid="input-vendors-appraiser"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendors-titleCompany">Title Company</Label>
                    <Input
                      id="vendors-titleCompany"
                      {...form.register('vendors.titleCompany')}
                      data-testid="input-vendors-titleCompany"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendors-inspector">Inspector</Label>
                    <Input
                      id="vendors-inspector"
                      {...form.register('vendors.inspector')}
                      data-testid="input-vendors-inspector"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendors-insurance">Insurance</Label>
                    <Input
                      id="vendors-insurance"
                      {...form.register('vendors.insurance')}
                      data-testid="input-vendors-insurance"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendors-attorney">Attorney</Label>
                    <Input
                      id="vendors-attorney"
                      {...form.register('vendors.attorney')}
                      data-testid="input-vendors-attorney"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Status Tab */}
            <TabsContent value="status" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Status functionality will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quote Tab */}
            <TabsContent value="quote" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quote</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Quote functionality will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Notes functionality will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>

      {/* Removal Confirmation Dialog */}
      <Dialog open={confirmRemovalDialog.isOpen} onOpenChange={(open) => !open && setConfirmRemovalDialog({ isOpen: false, type: null })}>
        <DialogContent data-testid="dialog-removal-confirmation">
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              <span className="text-red-600 font-medium">
                Removing this information will delete any corresponding data. Would you like to still continue?
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmRemovalDialog({ isOpen: false, type: null })}
              data-testid="button-removal-no"
            >
              No
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmRemovalDialog.onConfirm) {
                  confirmRemovalDialog.onConfirm();
                }
              }}
              data-testid="button-removal-yes"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Rental Dialog */}
      <Dialog open={propertyRentalDialog.isOpen} onOpenChange={(open) => !open && setPropertyRentalDialog({ isOpen: false, type: null })}>
        <DialogContent data-testid="dialog-property-rental">
          <DialogHeader>
            <DialogTitle>
              {propertyRentalDialog.type === 'add' ? 'Rental Income' : 'Remove Property Rental'}
            </DialogTitle>
            <DialogDescription>
              {propertyRentalDialog.type === 'add' 
                ? 'Please add property details using property menu option. This area will update automatically.'
                : 'Please remove property rental using property menu option.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setPropertyRentalDialog({ isOpen: false, type: null })}
              data-testid="button-property-rental-ok"
            >
              Ok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subject Property Confirmation Dialog */}
      <Dialog open={subjectConfirmDialog.isOpen} onOpenChange={(open) => !open && handleSubjectPropertyConfirmation(false)}>
        <DialogContent data-testid="dialog-subject-property-confirmation">
          <DialogHeader>
            <DialogTitle>Change Subject Property</DialogTitle>
            <DialogDescription>
              Another property is designated as subject property. Would you like to proceed with this change?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubjectPropertyConfirmation(false)}
              data-testid="button-subject-property-no"
            >
              No
            </Button>
            <Button
              onClick={() => handleSubjectPropertyConfirmation(true)}
              data-testid="button-subject-property-yes"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Usage Change Confirmation Dialog */}
      <Dialog open={propertyUsageChangeDialog.isOpen} onOpenChange={(open) => !open && handlePropertyUsageChangeConfirmation(false)}>
        <DialogContent data-testid="dialog-property-usage-change-confirmation">
          <DialogHeader>
            <DialogTitle>Change Property Usage</DialogTitle>
            <DialogDescription>
              You are changing the purpose/use of this property. Would you like to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handlePropertyUsageChangeConfirmation(false)}
              data-testid="button-property-usage-change-no"
            >
              No
            </Button>
            <Button
              onClick={() => handlePropertyUsageChangeConfirmation(true)}
              data-testid="button-property-usage-change-yes"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Warning Dialog */}
      <Dialog open={unsavedChangesDialog.isOpen} onOpenChange={(open) => !open && setUnsavedChangesDialog({ isOpen: false })}>
        <DialogContent data-testid="dialog-unsaved-changes-warning">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription className="text-destructive">
              By returning to dashboard now, unsaved changes will be lost. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setUnsavedChangesDialog({ isOpen: false })}
              data-testid="button-unsaved-changes-no"
            >
              No
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setUnsavedChangesDialog({ isOpen: false });
                setLocation('/admin/dashboard');
              }}
              data-testid="button-unsaved-changes-yes"
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Valuation Dialog */}
      <Dialog open={valuationDialog.isOpen} onOpenChange={(open) => !open && closeValuationDialog()}>
        <DialogContent data-testid="dialog-property-valuation">
          <DialogHeader>
            <DialogTitle>
              {valuationDialog.service === 'zillow' && 'Zillow Valuation'}
              {valuationDialog.service === 'redfin' && 'Redfin Valuation'}
              {valuationDialog.service === 'realtor' && 'Realtor.com Valuation'}
            </DialogTitle>
            <DialogDescription>
              Enter the property valuation from {valuationDialog.service === 'zillow' && 'Zillow.com'}
              {valuationDialog.service === 'redfin' && 'Redfin.com'}
              {valuationDialog.service === 'realtor' && 'Realtor.com'}.
              You can save the value for reference or apply it to the estimated property value field.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="valuation-input">Property Value</Label>
              <Input
                id="valuation-input"
                value={valuationInput}
                onChange={(e) => setValuationInput(e.target.value)}
                placeholder="$0.00"
                data-testid="input-valuation-amount"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeValuationDialog}
              data-testid="button-valuation-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={saveValuation}
              data-testid="button-valuation-save"
            >
              Save
            </Button>
            <Button
              onClick={saveAndApplyValuation}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-valuation-save-apply"
            >
              Save & Apply to Estimated Value
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Valuation Hover Tooltip */}
      {valuationHover.isVisible && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border-2 border-orange-500 rounded-md shadow-lg p-6 max-w-md w-80"
          style={{
            left: valuationHover.position.x,
            top: valuationHover.position.y,
          }}
          data-testid="tooltip-valuation-hover"
        >
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {valuationHover.service === 'zillow' && 'Zillow Valuation'}
            {valuationHover.service === 'redfin' && 'Redfin Valuation'}
            {valuationHover.service === 'realtor' && 'Realtor.com Valuation'}
          </div>
          <div className="text-base text-gray-600 dark:text-gray-400 mt-2">
            {valuationHover.value ? (
              <span className="font-mono text-green-600 dark:text-green-400">{valuationHover.value}</span>
            ) : (
              <span className="italic text-gray-500">No value saved</span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            Click to open full editor
          </div>
        </div>
      )}

      {/* Co-Borrower Marital Status Dialog */}
      <AlertDialog open={maritalStatusDialog.isOpen} onOpenChange={(open) => !open && setMaritalStatusDialog({ isOpen: false })}>
        <AlertDialogContent data-testid="dialog-marital-status-coborrower">
          <AlertDialogHeader>
            <AlertDialogTitle>Add Co-Borrower?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to add a Co-Borrower?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setMaritalStatusDialog({ isOpen: false })}
              data-testid="button-marital-status-not-yet"
            >
              Not Yet
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setMaritalStatusDialog({ isOpen: false });
                addCoBorrower();
              }}
              data-testid="button-marital-status-yes"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Valuation Summary Dialog */}
      <Dialog open={valuationSummaryDialog.isOpen} onOpenChange={(open) => !open && closeValuationSummary()}>
        <DialogContent data-testid="dialog-valuation-summary">
          <DialogHeader>
            <DialogTitle>Property Valuation Summary</DialogTitle>
            <DialogDescription>
              All valuation estimates for this property
            </DialogDescription>
          </DialogHeader>
          {valuationSummaryDialog.propertyIndex !== null && (
            <div className="space-y-4">
              {(() => {
                const propertyIndex = valuationSummaryDialog.propertyIndex!;
                const property = (form.watch('property.properties') || [])[propertyIndex];
                const clientEstimate = property?.estimatedValue || '';
                const zillowEstimate = property?.valuations?.zillow || '';
                const realtorEstimate = property?.valuations?.realtor || '';
                const redfinEstimate = property?.valuations?.redfin || '';
                const appraisedValue = property?.appraisedValue || '';

                return (
                  <>
                    <div className="grid gap-4">
                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-muted-foreground">CLIENT ESTIMATE</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {clientEstimate || 'Not entered'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-muted-foreground">ZILLOW</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {zillowEstimate || 'Not available'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-muted-foreground">REALTOR.COM</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {realtorEstimate || 'Not available'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-muted-foreground">REDFIN</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {redfinEstimate || 'Not available'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-muted-foreground">APPRAISAL</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {appraisedValue || 'Not entered'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={closeValuationSummary}
              data-testid="button-valuation-summary-close"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}