import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  // Handler for property address changes - triggers auto-copy functionality
  const handleAddressChange = (index: number) => {
    const properties = form.watch('property.properties') || [];
    if (index < 0 || index >= properties.length) return;
    
    const property = properties[index];
    if (!property || !property.address) return;
    
    // Get the property address
    const propertyAddress = property.address;
    
    // If this property has a ZIP code, trigger county lookup
    if (propertyAddress.zip && propertyAddress.zip.length >= 5) {
      lookupCountyFromZip(propertyAddress.zip).then(counties => {
        if (counties.length === 1) {
          // Auto-fill single county result
          form.setValue(`property.properties.${index}.address.county`, counties[0].label, { shouldDirty: true });
        }
      });
    }
    
    // Auto-copy address to related loan sections if they're attached to this property
    const propertyUse = property.use;
    
    // Check current loan
    const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
    if (currentLoanAttached === propertyUse) {
      form.setValue('currentLoan.propertyAddress', {
        street: propertyAddress.street || '',
        unit: propertyAddress.unit || '',
        city: propertyAddress.city || '',
        state: propertyAddress.state || '',
        zipCode: propertyAddress.zip || '',
        county: propertyAddress.county || ''
      });
    }
    
    // Check second loan
    const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
    if (secondLoanAttached === propertyUse) {
      form.setValue('secondLoan.propertyAddress', {
        street: propertyAddress.street || '',
        unit: propertyAddress.unit || '',
        city: propertyAddress.city || '',
        state: propertyAddress.state || '',
        zipCode: propertyAddress.zip || '',
        county: propertyAddress.county || ''
      });
    }
    
    // Check third loan
    const thirdLoanAttached = form.watch('thirdLoan.attachedToProperty');
    if (thirdLoanAttached === propertyUse) {
      form.setValue('thirdLoan.propertyAddress', {
        street: propertyAddress.street || '',
        unit: propertyAddress.unit || '',
        city: propertyAddress.city || '',
        state: propertyAddress.state || '',
        zipCode: propertyAddress.zip || '',
        county: propertyAddress.county || ''
      });
    }
  };

  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [showCurrentLoan, setShowCurrentLoan] = useState(false);
  const [isCurrentLoanOpen, setIsCurrentLoanOpen] = useState(true);
  const [isReadOnlyCurrentLoanOpen, setIsReadOnlyCurrentLoanOpen] = useState(true);
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(true);
  const [showSecondLoan, setShowSecondLoan] = useState(false);
  const [isSecondLoanOpen, setIsSecondLoanOpen] = useState(true);
  const [showThirdLoan, setShowThirdLoan] = useState(false);
  const [isThirdLoanOpen, setIsThirdLoanOpen] = useState(true);
  const [isThirdLoanPropertyAddressOpen, setIsThirdLoanPropertyAddressOpen] = useState(false);
  
  // State for Current Loan info popup in Property tab
  
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

  // Address box collapsible states
  const [isBorrowerResidenceOpen, setIsBorrowerResidenceOpen] = useState(true);
  const [isBorrowerPriorResidenceOpen, setIsBorrowerPriorResidenceOpen] = useState(true);
  const [isCoBorrowerResidenceOpen, setIsCoBorrowerResidenceOpen] = useState(true);
  const [isCoBorrowerPriorResidenceOpen, setIsCoBorrowerPriorResidenceOpen] = useState(true);

  // Loan details collapsible state (per property)
  const [isLoanDetailsOpen, setIsLoanDetailsOpen] = useState<Record<string, boolean>>({});
  const [isSecondLoanDetailsOpen, setIsSecondLoanDetailsOpen] = useState<Record<string, boolean>>({});

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
    type: 'co-borrower' | 'property' | 'property-type' | 'income' | 'prior-address' | 'third-loan' | 'second-loan' | 'current-loan' | null;
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

  // Add property confirmation dialog state
  const [addPropertyDialog, setAddPropertyDialog] = useState<{
    isOpen: boolean;
    propertyType: 'second-home' | 'investment' | null;
  }>({ isOpen: false, propertyType: null });

  // Mortgage balance field toggle state (per property)
  const [mortgageBalanceFieldType, setMortgageBalanceFieldType] = useState<Record<string, 'statement' | 'payoff'>>({});
  
  // Second mortgage balance field toggle state (per property)
  const [secondMortgageBalanceFieldType, setSecondMortgageBalanceFieldType] = useState<Record<string, 'statement' | 'payoff'>>({});
  
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
        source: '',
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
        loanNumber: '',
        loanStartDate: '',
        remainingTermPerCreditReport: '',
        currentBalance: '',
        currentRate: '',
        principalAndInterestPayment: '',
        escrowPayment: '',
        totalMonthlyPayment: '',
        prepaymentPenalty: 'No' as const,
        statementBalance: {
          mode: 'Statement Balance' as const,
          amount: '',
        },
        attachedToProperty: '' as const,
        propertyAddress: {
          street: '',
          unit: '',
          city: '',
          state: '',
          zipCode: '',
          county: '',
        },
        loanCategory: '',
        loanProgram: '',
        loanTerm: '',
        loanPurpose: '',
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

  
  // DISABLED: Auto-sum calculation for Total Monthly Payment
  // This expensive useEffect was causing typing lag by watching fields on every keystroke
  // useEffect(() => {
  //   const piPayment = form.watch('currentLoan.principalAndInterestPayment') || '0';
  //   const escrowAmount = form.watch('currentLoan.escrowPayment') || '0';
  //   
  //   const parseCurrency = (value: string) => {
  //     return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  //   };
  //   
  //   const piAmount = parseCurrency(piPayment);
  //   const escrowAmountNum = parseCurrency(escrowAmount);
  //   const total = piAmount + escrowAmountNum;
  //   
  //   const formattedTotal = total > 0 ? `$${total.toFixed(2)}` : '';
  //   form.setValue('currentLoan.totalMonthlyPayment', formattedTotal);
  // }, [form.watch('currentLoan.principalAndInterestPayment'), form.watch('currentLoan.escrowPayment')]);
  

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

  // Format currency values for display
  const formatCurrency = (value: string | number | undefined): string => {
    if (!value || value === '') return 'Not entered';
    
    // If it's already formatted as currency, return as is
    if (typeof value === 'string' && value.includes('$')) {
      return value;
    }
    
    // Convert to number and format
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
    if (isNaN(numValue) || numValue === 0) return 'Not entered';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
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

  // Calculate total monthly income - optimized with useMemo
  const borrowerIncomeData = form.watch('income');
  const totalBorrowerIncome = useMemo(() => {
    const employmentIncome = parseMonetaryValue(borrowerIncomeData?.monthlyIncome);
    const secondEmploymentIncome = parseMonetaryValue(borrowerIncomeData?.secondMonthlyIncome);
    const businessIncome = parseMonetaryValue(borrowerIncomeData?.businessMonthlyIncome);
    const pensionIncome = borrowerIncomeData?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
    const socialSecurityIncome = parseMonetaryValue(borrowerIncomeData?.socialSecurityMonthlyAmount);
    const vaBenefitsIncome = parseMonetaryValue(borrowerIncomeData?.vaBenefitsMonthlyAmount);
    const disabilityIncome = parseMonetaryValue(borrowerIncomeData?.disabilityMonthlyAmount);
    const otherIncome = parseMonetaryValue(borrowerIncomeData?.otherIncomeMonthlyAmount);
    
    const total = employmentIncome + secondEmploymentIncome + businessIncome + 
                  pensionIncome + socialSecurityIncome + vaBenefitsIncome + 
                  disabilityIncome + otherIncome;
    
    return total;
  }, [borrowerIncomeData]);
  
  const totalBorrowerIncomeFormatted = useMemo(() => 
    `$${totalBorrowerIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    [totalBorrowerIncome]
  );

  // Calculate co-borrower income - optimized with useMemo
  const coBorrowerIncomeData = form.watch('coBorrowerIncome');
  const totalCoBorrowerIncome = useMemo(() => {
    const employmentIncome = parseMonetaryValue(coBorrowerIncomeData?.monthlyIncome);
    const secondEmploymentIncome = parseMonetaryValue(coBorrowerIncomeData?.secondMonthlyIncome);
    const businessIncome = parseMonetaryValue(coBorrowerIncomeData?.businessMonthlyIncome);
    const pensionIncome = coBorrowerIncomeData?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
    const socialSecurityIncome = parseMonetaryValue(coBorrowerIncomeData?.socialSecurityMonthlyAmount);
    const vaBenefitsIncome = parseMonetaryValue(coBorrowerIncomeData?.vaBenefitsMonthlyAmount);
    const disabilityIncome = parseMonetaryValue(coBorrowerIncomeData?.disabilityMonthlyAmount);
    const otherIncome = parseMonetaryValue(coBorrowerIncomeData?.otherIncomeMonthlyAmount);
    
    const total = employmentIncome + secondEmploymentIncome + businessIncome + 
                  pensionIncome + socialSecurityIncome + vaBenefitsIncome + 
                  disabilityIncome + otherIncome;
    
    return total;
  }, [coBorrowerIncomeData]);
  
  const totalCoBorrowerIncomeFormatted = useMemo(() => 
    `$${totalCoBorrowerIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    [totalCoBorrowerIncome]
  );

  // Calculate total household income (borrower + co-borrower) - optimized with useMemo
  const totalHouseholdIncome = useMemo(() => {
    const coBorrowerTotal = hasCoBorrower ? totalCoBorrowerIncome : 0;
    return totalBorrowerIncome + coBorrowerTotal;
  }, [totalBorrowerIncome, totalCoBorrowerIncome, hasCoBorrower]);
  
  const totalHouseholdIncomeFormatted = useMemo(() => 
    `$${totalHouseholdIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    [totalHouseholdIncome]
  );

  // Calculate Current Loan Total Monthly Payment - optimized with useMemo
  const currentLoanData = form.watch('currentLoan');
  const totalCurrentLoanPayment = useMemo(() => {
    const principalAndInterest = parseMonetaryValue(currentLoanData?.principalAndInterestPayment);
    const escrow = parseMonetaryValue(currentLoanData?.escrowPayment);
    return principalAndInterest + escrow;
  }, [currentLoanData?.principalAndInterestPayment, currentLoanData?.escrowPayment]);
  
  const totalCurrentLoanPaymentFormatted = useMemo(() => 
    totalCurrentLoanPayment > 0 ? `$${totalCurrentLoanPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '',
    [totalCurrentLoanPayment]
  );

  // Helper functions removed - now using optimized useMemo values above

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

  // Bidirectional sync between Property Tab (Primary Residence) and Loan Tab (Current Loan)
  const syncInProgress = useRef(false);
  
  // DISABLED: Bidirectional sync - Removed to improve typing performance
  // This was causing slow typing due to heavy processing on every keystroke
  // Now using simplified one-way flow: Loan Tab -> Property Tab (read-only display)
  
  // useEffect(() => {
  //   // Field mapping configuration
  //   const fieldMappings = [
  //     {
  //       propertyPath: 'loan.lenderName',
  //       loanPath: 'currentLender'
  //     },
  //     {
  //       propertyPath: 'loan.loanNumber',
  //       loanPath: 'loanNumber'
  //     },
  //     {
  //       propertyPath: 'loan.mortgageBalance',
  //       loanPath: 'statementBalance.amount'
  //     },
  //     {
  //       propertyPath: 'loan.piPayment',
  //       loanPath: 'principalAndInterestPayment'
  //     },
  //     {
  //       propertyPath: 'loan.escrowPayment',
  //       loanPath: 'escrowPayment'
  //     }
  //   ];

  //   const subscription = form.watch((value, { name }) => {
  //     if (!name || syncInProgress.current) return;
      
  //     const properties = value.property?.properties || [];
  //     const primaryPropertyIndex = properties.findIndex(p => p?.use === 'primary');
      
  //     if (primaryPropertyIndex < 0) return;
      
  //     syncInProgress.current = true;
      
  //     // Check if the changed field is a property field that should sync to loan
  //     for (const mapping of fieldMappings) {
  //       const propertyFieldPath = `property.properties.${primaryPropertyIndex}.${mapping.propertyPath}`;
  //       const loanFieldPath = `currentLoan.${mapping.loanPath}`;
        
  //       if (name === propertyFieldPath) {
  //         const sourceValue = getNestedValue(value, propertyFieldPath) ?? '';
  //         const targetValue = getNestedValue(value, loanFieldPath) ?? '';
          
  //         if (sourceValue !== targetValue) {
  //           form.setValue(loanFieldPath as any, sourceValue, { shouldDirty: true });
  //         }
  //         break;
  //       }
        
  //       // Check if the changed field is a loan field that should sync to property
  //       if (name === loanFieldPath) {
  //         const sourceValue = getNestedValue(value, loanFieldPath) ?? '';
  //         const targetValue = getNestedValue(value, propertyFieldPath) ?? '';
          
  //         if (sourceValue !== targetValue) {
  //           form.setValue(propertyFieldPath as any, sourceValue, { shouldDirty: true });
  //         }
  //         break;
  //       }
  //     }
      
  //     syncInProgress.current = false;
  //   });

  //   return subscription.unsubscribe;
  // }, []);
  
  // REMOVED: Auto-sync logic between Loan and Property tabs
  // Loan cards are now exclusive to Loan tab, Property tab dropdown is independent
  
  // Helper function to get nested value from object path
  const getNestedValue = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Simplified hook for field binding - canonical mode only
  const useFieldBinding = (name: string, idPrefix: string = '', formInstance: any = null) => {
    const contextForm = useFormContext();
    const targetForm = formInstance || contextForm;
    
    // Safety check for form availability
    if (!targetForm) {
      console.error('useFieldBinding: No form instance available');
      return {
        field: { name: '', onChange: () => {}, onBlur: () => {}, ref: () => {} },
        id: `${idPrefix}${name.replace(/\./g, '-')}`,
        'data-testid': `input-${idPrefix}${name.replace(/\./g, '-')}`
      };
    }
    
    // Normal field registration - let register handle everything
    const registration = targetForm.register(name as any);
    return {
      field: registration,
      id: `${idPrefix}${name.replace(/\./g, '-')}`,
      'data-testid': `input-${idPrefix}${name.replace(/\./g, '-')}`
    };
  };

  // Simplified hook for select field binding - canonical mode only
  const useSelectFieldBinding = (name: string, idPrefix: string = '', formInstance: any = null) => {
    const contextForm = useFormContext();
    const targetForm = formInstance || contextForm;
    const watchedValue = useWatch({ name: name as any, control: targetForm?.control });
    
    // Safety check for form availability
    if (!targetForm) {
      console.error('useSelectFieldBinding: No form instance available');
      return {
        value: '',
        onValueChange: () => {},
        'data-testid': `select-${idPrefix}${name.replace(/\./g, '-')}`
      };
    }
    
    return {
      value: watchedValue || '',
      onValueChange: (value: string) => {
        targetForm.setValue(name as any, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      },
      'data-testid': `select-${idPrefix}${name.replace(/\./g, '-')}`
    };
  };

  // CurrentLoanCard component - canonical mode only
  const CurrentLoanCard = ({ 
    idPrefix = '', 
    borderVariant, 
    isOpen, 
    setIsOpen, 
    onRemove,
    onAutoCopyAddress,
    formInstance 
  }: {
    idPrefix?: string;
    borderVariant: 'blue' | 'none';
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onRemove?: () => void;
    onAutoCopyAddress?: () => void;
    formInstance?: any;
  }) => {
    const contextForm = useFormContext();
    const targetForm = formInstance || contextForm;
    
    // State for property address collapse
    const [isPropertyAddressOpen, setIsPropertyAddressOpen] = useState(true);
    const currentLenderBinding = useFieldBinding('currentLoan.currentLender', idPrefix, targetForm);
    const loanNumberBinding = useFieldBinding('currentLoan.loanNumber', idPrefix, targetForm);
    const loanStartDateBinding = useFieldBinding('currentLoan.loanStartDate', idPrefix, targetForm);
    const remainingTermBinding = useFieldBinding('currentLoan.remainingTermPerCreditReport', idPrefix, targetForm);
    const loanCategoryBinding = useSelectFieldBinding('currentLoan.loanCategory', idPrefix, targetForm);
    const loanProgramBinding = useSelectFieldBinding('currentLoan.loanProgram', idPrefix, targetForm);
    const loanTermBinding = useSelectFieldBinding('currentLoan.loanTerm', idPrefix, targetForm);
    const loanPurposeBinding = useSelectFieldBinding('currentLoan.loanPurpose', idPrefix, targetForm);
    const prepaymentPenaltyBinding = useSelectFieldBinding('currentLoan.prepaymentPenalty', idPrefix, targetForm);
    const statementBalanceBinding = useFieldBinding('currentLoan.statementBalance.amount', idPrefix, targetForm);
    const attachedToPropertyBinding = useSelectFieldBinding('currentLoan.attachedToProperty', idPrefix, targetForm);
    
    // Payment field bindings - optimized for performance
    const currentRateBinding = useFieldBinding('currentLoan.currentRate', idPrefix, targetForm);
    // REMOVED: principalInterestPaymentBinding and escrowPaymentBinding - now using direct form.register() for better performance
    const totalMonthlyPaymentBinding = useFieldBinding('currentLoan.totalMonthlyPayment', idPrefix, targetForm);
    
    // Property address bindings
    const propertyStreetBinding = useFieldBinding('currentLoan.propertyAddress.street', idPrefix, targetForm);
    const propertyUnitBinding = useFieldBinding('currentLoan.propertyAddress.unit', idPrefix, targetForm);
    const propertyCityBinding = useFieldBinding('currentLoan.propertyAddress.city', idPrefix, targetForm);
    const propertyStateBinding = useSelectFieldBinding('currentLoan.propertyAddress.state', idPrefix, targetForm);
    const propertyZipBinding = useFieldBinding('currentLoan.propertyAddress.zipCode', idPrefix, targetForm);
    const propertyCountyBinding = useFieldBinding('currentLoan.propertyAddress.county', idPrefix, targetForm);
    
    const cardClassName = borderVariant === 'blue' ? 'border-l-4 border-l-blue-500' : '';
    
    return (
      <Card className={cardClassName}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Loan</CardTitle>
              <div className="flex items-center gap-2">
                {onRemove && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="hover:bg-red-500 hover:text-white"
                    data-testid={`button-remove-current-loan-${idPrefix}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-orange-500 hover:text-white" 
                    data-testid={`button-toggle-current-loan-${idPrefix}`}
                    title={isOpen ? 'Minimize' : 'Expand'}
                  >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Row 1: Current Lender, Loan Number, Loan Purpose, Loan Start Date, Remaining Term On Credit Report */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={currentLenderBinding.id}>Current Lender</Label>
                  <Input
                    id={currentLenderBinding.id}
                    {...currentLenderBinding.field}
                    data-testid={currentLenderBinding['data-testid']}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentLoan-loanNumber">Loan Number</Label>
                  <Input
                    id="currentLoan-loanNumber"
                    {...form.register('currentLoan.loanNumber')}
                    data-testid="input-currentLoan-loanNumber"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}currentLoan-loanPurpose`}>Loan Purpose</Label>
                  <Select {...loanPurposeBinding}>
                    <SelectTrigger data-testid={loanPurposeBinding['data-testid']}>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="refinance-rate-term">Refinance Rate & Term</SelectItem>
                      <SelectItem value="refinance-cash-out">Refinance Cash Out</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={loanStartDateBinding.id}>Loan Start Date</Label>
                  <Input
                    id={loanStartDateBinding.id}
                    type="date"
                    {...loanStartDateBinding.field}
                    data-testid={loanStartDateBinding['data-testid']}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={remainingTermBinding.id}>Remaining Term On Credit Report</Label>
                  <Input
                    id={remainingTermBinding.id}
                    {...remainingTermBinding.field}
                    placeholder="Years/Months"
                    data-testid={remainingTermBinding['data-testid']}
                  />
                </div>
              </div>
              
              {/* Row 2: Loan Category, Loan Term, Loan Duration, Loan Balance, Loan Rate */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}currentLoan-loanCategory`}>Loan Category</Label>
                  <Select {...loanCategoryBinding}>
                    <SelectTrigger data-testid={loanCategoryBinding['data-testid']}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="conventional-jumbo">Conventional Jumbo</SelectItem>
                      <SelectItem value="fha">FHA</SelectItem>
                      <SelectItem value="va">VA</SelectItem>
                      <SelectItem value="va-jumbo">VA Jumbo</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}currentLoan-loanProgram`}>Loan Term</Label>
                  <Select {...loanProgramBinding}>
                    <SelectTrigger data-testid={loanProgramBinding['data-testid']}>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed-rate">Fixed Rate</SelectItem>
                      <SelectItem value="adjustable">Adjustable</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}currentLoan-loanTerm`}>Loan Duration</Label>
                  <Select {...loanTermBinding}>
                    <SelectTrigger data-testid={loanTermBinding['data-testid']}>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30-years">30 years</SelectItem>
                      <SelectItem value="25-years">25 years</SelectItem>
                      <SelectItem value="20-years">20 years</SelectItem>
                      <SelectItem value="15-years">15 years</SelectItem>
                      <SelectItem value="10-years">10 years</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentLoan-currentBalance">Loan Balance</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="currentLoan-currentBalance"
                      {...form.register('currentLoan.statementBalance.amount')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-currentLoan-currentBalance"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentLoan-currentRate">Loan Rate</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <Input
                      id="currentLoan-currentRate"
                      {...form.register('currentLoan.currentRate')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-currentLoan-currentRate"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>
              
              {/* Row 3: Principal & Interest Payment, Escrow Payment, Total Monthly Payment, Pre-Payment Penalty, Attached to Property */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentLoan-principalInterestPayment">Principal & Interest Payment</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="currentLoan-principalInterestPayment"
                      {...form.register('currentLoan.principalAndInterestPayment')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-currentLoan-principalInterestPayment"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentLoan-escrowPayment">Escrow Payment</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="currentLoan-escrowPayment"
                      {...form.register('currentLoan.escrowPayment')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-currentLoan-escrowPayment"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentLoan-totalMonthlyPayment">Total Monthly Payment</Label>
                  <div className="flex items-center border border-input bg-gray-50 px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="currentLoan-totalMonthlyPayment"
                      value={totalCurrentLoanPaymentFormatted.replace('$', '')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0 cursor-default"
                      readOnly
                      data-testid="input-currentLoan-totalMonthlyPayment"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}currentLoan-prepaymentPenalty`}>Pre-Payment Penalty</Label>
                  <Select {...prepaymentPenaltyBinding}>
                    <SelectTrigger data-testid={prepaymentPenaltyBinding['data-testid']}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes - see notes">Yes - see notes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}currentLoan-attachedToProperty`}>Attached to Property</Label>
                  <Select 
                    {...attachedToPropertyBinding}
                    onValueChange={(value) => {
                      attachedToPropertyBinding.onValueChange(value);
                      if (value && value !== '' && onAutoCopyAddress) {
                        setTimeout(() => onAutoCopyAddress(), 100);
                      }
                    }}
                  >
                    <SelectTrigger data-testid={attachedToPropertyBinding['data-testid']}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="Primary Residence">Primary Residence</SelectItem>
                      <SelectItem value="Second Home">Second Home</SelectItem>
                      <SelectItem value="Investment Property">Investment Property</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Conditional Address Fields - Show when Attached to Property is selected */}
              {targetForm.watch('currentLoan.attachedToProperty') && targetForm.watch('currentLoan.attachedToProperty') !== '' && targetForm.watch('currentLoan.attachedToProperty') !== 'select' && (
                <div className="mt-4 p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Property Address ({targetForm.watch('currentLoan.attachedToProperty')})
                    </Label>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsPropertyAddressOpen(!isPropertyAddressOpen)}
                      className="hover:bg-orange-500 hover:text-white" 
                      data-testid={`button-toggle-property-address-${idPrefix}`}
                      title={isPropertyAddressOpen ? 'Minimize' : 'Expand'}
                    >
                      {isPropertyAddressOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Collapsible open={isPropertyAddressOpen} onOpenChange={setIsPropertyAddressOpen}>
                    <CollapsibleContent>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="space-y-2 md:col-span-4">
                      <Label htmlFor={propertyStreetBinding.id}>Street Address</Label>
                      <Input
                        id={propertyStreetBinding.id}
                        {...propertyStreetBinding.field}
                        data-testid={propertyStreetBinding['data-testid']}
                        readOnly={targetForm.watch('currentLoan.attachedToProperty') !== 'Other'}
                        className={targetForm.watch('currentLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={propertyUnitBinding.id}>Unit/Apt</Label>
                      <Input
                        id={propertyUnitBinding.id}
                        {...propertyUnitBinding.field}
                        data-testid={propertyUnitBinding['data-testid']}
                        readOnly={targetForm.watch('currentLoan.attachedToProperty') !== 'Other'}
                        className={targetForm.watch('currentLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={propertyCityBinding.id}>City</Label>
                      <Input
                        id={propertyCityBinding.id}
                        {...propertyCityBinding.field}
                        data-testid={propertyCityBinding['data-testid']}
                        readOnly={targetForm.watch('currentLoan.attachedToProperty') !== 'Other'}
                        className={targetForm.watch('currentLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`${idPrefix}currentLoan-property-state`}>State</Label>
                      <Select
                        {...propertyStateBinding}
                        disabled={targetForm.watch('currentLoan.attachedToProperty') !== 'Other'}
                      >
                        <SelectTrigger
                          data-testid={propertyStateBinding['data-testid']}
                          className={targetForm.watch('currentLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                        >
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map(state => (
                            <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={propertyZipBinding.id}>ZIP Code</Label>
                      <Input
                        id={propertyZipBinding.id}
                        {...propertyZipBinding.field}
                        data-testid={propertyZipBinding['data-testid']}
                        readOnly={targetForm.watch('currentLoan.attachedToProperty') !== 'Other'}
                        className={targetForm.watch('currentLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={propertyCountyBinding.id}>County</Label>
                      <Input
                        id={propertyCountyBinding.id}
                        {...propertyCountyBinding.field}
                        data-testid={propertyCountyBinding['data-testid']}
                        readOnly={targetForm.watch('currentLoan.attachedToProperty') !== 'Other'}
                        className={targetForm.watch('currentLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                      />
                    </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
              
              {/* Add Second Loan Button - positioned in lower right corner */}
              <div className="flex justify-end mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddSecondLoan}
                  className="hover:bg-orange-500 hover:text-white hover:border-orange-500 no-default-hover-elevate no-default-active-elevate"
                  data-testid={`button-add-second-loan-${idPrefix}`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Second Loan
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // CurrentSecondLoanCard component - using Current Third Loan structure
  const CurrentSecondLoanCard = ({ 
    idPrefix = '', 
    borderVariant, 
    isOpen, 
    setIsOpen, 
    onRemove,
    onAutoCopyAddress,
    formInstance 
  }: {
    idPrefix?: string;
    borderVariant: 'blue' | 'none';
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onRemove?: () => void;
    onAutoCopyAddress?: () => void;
    formInstance?: any;
  }) => {
    const contextForm = useFormContext();
    const targetForm = formInstance || contextForm;
    const [isPropertyAddressOpen, setIsPropertyAddressOpen] = useState(false);
    
    const cardClassName = borderVariant === 'blue' ? 'border-l-4 border-l-purple-500' : '';
    
    return (
      <Card className={cardClassName}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Second Loan</CardTitle>
              <div className="flex items-center gap-2">
                {onRemove && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="hover:bg-red-500 hover:text-white"
                    data-testid={`button-remove-second-loan-${idPrefix}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-orange-500 hover:text-white" 
                    data-testid={`button-toggle-second-loan-${idPrefix}`}
                    title={isOpen ? 'Minimize' : 'Expand'}
                  >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Row 1: Lender Name, Loan Number, Loan Category, Loan Term, Loan Duration */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-lenderName">Lender Name</Label>
                  <Input
                    id="secondLoan-lenderName"
                    {...targetForm.register('secondLoan.lenderName')}
                    placeholder="Enter lender name"
                    data-testid="input-secondLoan-lenderName"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-loanNumber">Loan Number</Label>
                  <Input
                    id="secondLoan-loanNumber"
                    {...targetForm.register('secondLoan.loanNumber')}
                    placeholder="Enter loan number"
                    data-testid="input-secondLoan-loanNumber"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-loanCategory">Loan Category</Label>
                  <Select value={targetForm.watch('secondLoan.loanCategory') || ''} onValueChange={(value) => targetForm.setValue('secondLoan.loanCategory', value)}>
                    <SelectTrigger data-testid="select-secondLoan-loanCategory">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="heloc">HELOC</SelectItem>
                      <SelectItem value="fixed">FIXED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-loanProgram">Loan Term</Label>
                  <Select value={targetForm.watch('secondLoan.loanProgram') || ''} onValueChange={(value) => targetForm.setValue('secondLoan.loanProgram', value)}>
                    <SelectTrigger data-testid="select-secondLoan-loanProgram">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="heloc">HELOC</SelectItem>
                      <SelectItem value="fixed-second-loan">Fixed Second Loan</SelectItem>
                      <SelectItem value="adjustable-second-loan">Adjustable Second Loan</SelectItem>
                      <SelectItem value="home-improvement-loan">Home Improvement Loan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-loanDuration">Loan Duration</Label>
                  <Select value={targetForm.watch('secondLoan.loanDuration') || ''} onValueChange={(value) => targetForm.setValue('secondLoan.loanDuration', value)}>
                    <SelectTrigger data-testid="select-secondLoan-loanDuration">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="30-years">30 Years</SelectItem>
                      <SelectItem value="25-years">25 Years</SelectItem>
                      <SelectItem value="20-years">20 Years</SelectItem>
                      <SelectItem value="15-years">15 Years</SelectItem>
                      <SelectItem value="10-years">10 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Row 2: Current Balance, Current Rate, Monthly Payment, Pre-Payment Penalty, Attached to Property */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-currentBalance">Current Balance</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="secondLoan-currentBalance"
                      {...targetForm.register('secondLoan.currentBalance')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-secondLoan-currentBalance"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-currentRate">Current Rate</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <Input
                      id="secondLoan-currentRate"
                      {...targetForm.register('secondLoan.currentRate')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-secondLoan-currentRate"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-monthlyPayment">Monthly Payment</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="secondLoan-monthlyPayment"
                      {...targetForm.register('secondLoan.monthlyPayment')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-secondLoan-monthlyPayment"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-prepaymentPenalty">Pre-payment Penalty</Label>
                  <Select value={targetForm.watch('secondLoan.prepaymentPenalty') || ''} onValueChange={(value: 'Yes - see notes' | 'No') => targetForm.setValue('secondLoan.prepaymentPenalty', value)}>
                    <SelectTrigger data-testid="select-secondLoan-prepaymentPenalty">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes - see notes">Yes - see notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondLoan-attachedToProperty">Attached to Property</Label>
                  <Select value={targetForm.watch('secondLoan.attachedToProperty') || ''} onValueChange={(value) => {
                    targetForm.setValue('secondLoan.attachedToProperty', value as any);
                    if (['Primary Residence', 'Second Home', 'Investment Property'].includes(value)) {
                      setTimeout(() => onAutoCopyAddress?.(), 100);
                    } else if (value === 'Other' || value === '' || value === 'select') {
                      // Clear address fields for Other, empty, or select
                      targetForm.setValue('secondLoan.propertyAddress.street', '');
                      targetForm.setValue('secondLoan.propertyAddress.unit', '');
                      targetForm.setValue('secondLoan.propertyAddress.city', '');
                      targetForm.setValue('secondLoan.propertyAddress.state', '');
                      targetForm.setValue('secondLoan.propertyAddress.zipCode', '');
                      targetForm.setValue('secondLoan.propertyAddress.county', '');
                    }
                  }}>
                    <SelectTrigger data-testid="select-secondLoan-attachedToProperty">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="Primary Residence">Primary Residence</SelectItem>
                      <SelectItem value="Second Home">Second Home</SelectItem>
                      <SelectItem value="Investment Property">Investment Property</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              
              {/* Conditional Property Address Fields - Show when Attached to Property is selected */}
              {targetForm.watch('secondLoan.attachedToProperty') && targetForm.watch('secondLoan.attachedToProperty') !== '' && targetForm.watch('secondLoan.attachedToProperty') !== 'select' && ['Primary Residence', 'Second Home', 'Investment Property', 'Other'].includes(targetForm.watch('secondLoan.attachedToProperty') || '') && (
                <div className="mt-4 p-4 border-t border-gray-200">
                  <Collapsible open={isPropertyAddressOpen} onOpenChange={setIsPropertyAddressOpen}>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Property Address ({targetForm.watch('secondLoan.attachedToProperty')})
                      </Label>
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="hover:bg-orange-500 hover:text-white"
                          data-testid={`button-toggle-property-address-${idPrefix}`}
                        >
                          {isPropertyAddressOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="space-y-2 md:col-span-4">
                          <Label htmlFor="secondLoan-property-street">Street Address</Label>
                          <Input
                            id="secondLoan-property-street"
                            {...targetForm.register('secondLoan.propertyAddress.street')}
                            data-testid="input-secondLoan-property-street"
                            readOnly={targetForm.watch('secondLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('secondLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="secondLoan-property-unit">Unit/Apt</Label>
                          <Input
                            id="secondLoan-property-unit"
                            {...targetForm.register('secondLoan.propertyAddress.unit')}
                            data-testid="input-secondLoan-property-unit"
                            readOnly={targetForm.watch('secondLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('secondLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="secondLoan-property-city">City</Label>
                          <Input
                            id="secondLoan-property-city"
                            {...targetForm.register('secondLoan.propertyAddress.city')}
                            data-testid="input-secondLoan-property-city"
                            readOnly={targetForm.watch('secondLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('secondLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="secondLoan-property-state">State</Label>
                          <Select
                            value={targetForm.watch('secondLoan.propertyAddress.state') || ''}
                            onValueChange={(value) => targetForm.setValue('secondLoan.propertyAddress.state', value)}
                            disabled={targetForm.watch('secondLoan.attachedToProperty') !== 'Other'}
                          >
                            <SelectTrigger
                              data-testid="select-secondLoan-property-state"
                              className={targetForm.watch('secondLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                            >
                              <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.map(state => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="secondLoan-property-zipCode">ZIP Code</Label>
                          <Input
                            id="secondLoan-property-zipCode"
                            {...targetForm.register('secondLoan.propertyAddress.zipCode')}
                            data-testid="input-secondLoan-property-zipCode"
                            readOnly={targetForm.watch('secondLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('secondLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="secondLoan-property-county">County</Label>
                          <Input
                            id="secondLoan-property-county"
                            {...targetForm.register('secondLoan.propertyAddress.county')}
                            data-testid="input-secondLoan-property-county"
                            readOnly={targetForm.watch('secondLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('secondLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
              
              {/* Add Third Loan Button - positioned in lower right corner */}
              <div className="flex justify-end mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddThirdLoan}
                  className="hover:bg-orange-500 hover:text-white hover:border-orange-500 no-default-hover-elevate no-default-active-elevate"
                  data-testid="button-add-third-loan"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Third Loan
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Read-only version of Current Loan card for Property Tab
  const ReadOnlyCurrentLoanCard = ({ 
    idPrefix = 'readonly-', 
    isOpen, 
    setIsOpen, 
    formInstance 
  }: {
    idPrefix?: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    formInstance?: any;
  }) => {
    const { toast } = useToast();
    const contextForm = useFormContext();
    const targetForm = formInstance || contextForm;
    
    // Watch all current loan values for display
    const currentLender = targetForm.watch('currentLoan.currentLender') || '';
    const loanNumber = targetForm.watch('currentLoan.loanNumber') || '';
    const loanStartDate = targetForm.watch('currentLoan.loanStartDate') || '';
    const remainingTerm = targetForm.watch('currentLoan.remainingTermPerCreditReport') || '';
    const loanCategory = targetForm.watch('currentLoan.loanCategory') || '';
    const loanProgram = targetForm.watch('currentLoan.loanProgram') || '';
    const loanTerm = targetForm.watch('currentLoan.loanTerm') || '';
    const statementBalance = targetForm.watch('currentLoan.statementBalance.amount') || '';
    const currentRate = targetForm.watch('currentLoan.currentRate') || '';
    const principalInterestPayment = targetForm.watch('currentLoan.principalAndInterestPayment') || '';
    const escrowPayment = targetForm.watch('currentLoan.escrowPayment') || '';
    const totalMonthlyPayment = targetForm.watch('currentLoan.totalMonthlyPayment') || '';
    
    // Click handler to show message
    const handleFieldClick = () => {
      toast({
        description: "Please enter or change data in the loan page"
      });
    };
    
    return (
      <Card>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Loan (Read-only)</CardTitle>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  data-testid={`button-toggle-readonly-current-loan-${idPrefix}`}
                  title={isOpen ? 'Minimize' : 'Expand'}
                >
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Row 1: Current Lender, Loan Number, Loan Start Date, Remaining Term */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Current Lender</Label>
                  <Input
                    value={currentLender}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-current-lender-${idPrefix}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Loan Number</Label>
                  <Input
                    value={loanNumber}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-loan-number-${idPrefix}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Loan Start Date</Label>
                  <Input
                    value={loanStartDate}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-loan-start-date-${idPrefix}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Remaining Term Per Credit Report</Label>
                  <Input
                    value={remainingTerm}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-remaining-term-${idPrefix}`}
                  />
                </div>
              </div>
              
              {/* Row 2: Loan Category, Loan Program, Loan Term, Current Balance */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Loan Category</Label>
                  <Input
                    value={loanCategory}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-loan-category-${idPrefix}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Loan Program</Label>
                  <Input
                    value={loanProgram}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-loan-program-${idPrefix}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Loan Duration</Label>
                  <Input
                    value={loanTerm}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-loan-term-${idPrefix}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Current Balance</Label>
                  <Input
                    value={statementBalance}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-statement-balance-${idPrefix}`}
                  />
                </div>
              </div>
              
              {/* Row 3: Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Current Rate</Label>
                  <Input
                    value={currentRate ? `${currentRate}%` : ''}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-current-rate-${idPrefix}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Principal & Interest Payment</Label>
                  <Input
                    value={principalInterestPayment}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-principal-interest-payment-${idPrefix}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Escrow Payment</Label>
                  <Input
                    value={escrowPayment}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-escrow-payment-${idPrefix}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Total Monthly Payment</Label>
                  <Input
                    value={totalMonthlyPayment}
                    readOnly
                    onClick={handleFieldClick}
                    className="bg-gray-50 cursor-pointer"
                    data-testid={`input-readonly-total-monthly-payment-${idPrefix}`}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };


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
    // Position tooltip higher above the icon with increased distance for better spacing
    const tooltipHeight = 120;
    const extraSpacing = 50; // Additional spacing to move tooltip higher
    setValuationHover({
      isVisible: true,
      service,
      propertyIndex,
      value: savedValue,
      position: { 
        x: rect.left + window.scrollX, 
        y: rect.top + window.scrollY - tooltipHeight - extraSpacing 
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
    
    // Auto-copy address data when primary residence is selected
    if (type === 'primary') {
      setTimeout(() => {
        const borrowerAddress = form.getValues('borrower.residenceAddress');
        if (borrowerAddress && (borrowerAddress.street || borrowerAddress.city || borrowerAddress.state)) {
          const updatedProperties = form.watch('property.properties') || [];
          const primaryPropertyIndex = updatedProperties.findIndex(p => p.use === 'primary');
          
          if (primaryPropertyIndex >= 0) {
            form.setValue(`property.properties.${primaryPropertyIndex}.address`, {
              street: borrowerAddress.street || '',
              unit: borrowerAddress.unit || '',
              city: borrowerAddress.city || '',
              state: borrowerAddress.state || '',
              zip: borrowerAddress.zip || '',
              county: borrowerAddress.county || ''
            });
          }
        }
      }, 100);
    }
    
    // Auto-copy co-borrower address if applicable
    if (hasCoBorrower && (type === 'second-home' || type === 'investment')) {
      setTimeout(() => {
        const coBorrowerAddress = form.getValues('coBorrower.residenceAddress');
        if (coBorrowerAddress && (coBorrowerAddress.street || coBorrowerAddress.city || coBorrowerAddress.state)) {
          const updatedProperties = form.watch('property.properties') || [];
          const coBorrowerPropertyIndex = updatedProperties.findIndex(p => p.use === type);
          
          if (coBorrowerPropertyIndex >= 0) {
            form.setValue(`property.properties.${coBorrowerPropertyIndex}.address`, {
              street: coBorrowerAddress.street || '',
              unit: coBorrowerAddress.unit || '',
              city: coBorrowerAddress.city || '',
              state: coBorrowerAddress.state || '',
              zip: coBorrowerAddress.zip || '',
              county: coBorrowerAddress.county || ''
            });
          }
        }
      }, 100);
    }
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

  // Toggle second mortgage balance field type
  const toggleSecondMortgageBalanceFieldType = (propertyId: string) => {
    setSecondMortgageBalanceFieldType(prev => ({
      ...prev,
      [propertyId]: prev[propertyId] === 'payoff' ? 'statement' : 'payoff'
    }));
  };

  // Get second mortgage balance field label
  const getSecondMortgageBalanceLabel = (propertyId: string) => {
    const fieldType = secondMortgageBalanceFieldType[propertyId] || 'statement';
    return fieldType === 'statement' ? 'Mortgage Statement Balance' : 'Pay Off Demand Balance';
  };

  // Toggle loan details collapsible state
  const toggleLoanDetailsOpen = (propertyId: string) => {
    setIsLoanDetailsOpen(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  // Toggle second loan details collapsible state
  const toggleSecondLoanDetailsOpen = (propertyId: string) => {
    setIsSecondLoanDetailsOpen(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };
  
  // Toggle statement balance field type for current loan
  const [currentLoanStatementBalanceFieldType, setCurrentLoanStatementBalanceFieldType] = useState<'statement' | 'payoff'>('statement');
  
  const toggleCurrentLoanStatementBalanceFieldType = () => {
    setCurrentLoanStatementBalanceFieldType(prev => prev === 'statement' ? 'payoff' : 'statement');
  };
  
  const getCurrentLoanStatementBalanceLabel = () => {
    return currentLoanStatementBalanceFieldType === 'statement' ? 'Statement Balance' : 'Pay Off Demand';
  };

  // Handle showing second loan sections
  const handleAddSecondLoan = () => {
    setShowSecondLoan(true);
  };

  // Handle removing second loan
  const removeSecondLoan = () => {
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'second-loan',
      onConfirm: () => {
        setShowSecondLoan(false);
        setShowThirdLoan(false);
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };

  // Handle adding third loan
  const handleAddThirdLoan = () => {
    setShowThirdLoan(true);
  };


  // Handle showing current loan sections  
  const handleAddCurrentLoan = () => {
    setShowCurrentLoan(true);
    // REMOVED: Auto-creation of Primary Residence property
    // Loan cards are now exclusive to Loan tab
  };

  // Handle removing current loan
  const removeCurrentLoan = () => {
    setConfirmRemovalDialog({
      isOpen: true,
      type: 'current-loan',
      onConfirm: () => {
        setShowCurrentLoan(false);
        // REMOVED: Property tab reset logic - now independent
        setConfirmRemovalDialog({ isOpen: false, type: null });
      }
    });
  };
  
  // Toggle escrow payment field type for current loan
  const [currentLoanEscrowPaymentFieldType, setCurrentLoanEscrowPaymentFieldType] = useState<'tax-insurance' | 'property-tax' | 'home-insurance'>('tax-insurance');
  
  const toggleCurrentLoanEscrowPaymentFieldType = () => {
    setCurrentLoanEscrowPaymentFieldType(prev => {
      switch (prev) {
        case 'tax-insurance': return 'property-tax';
        case 'property-tax': return 'home-insurance';
        case 'home-insurance': return 'tax-insurance';
        default: return 'tax-insurance';
      }
    });
  };
  
  const getCurrentLoanEscrowPaymentLabel = () => {
    switch (currentLoanEscrowPaymentFieldType) {
      case 'tax-insurance': return 'Tax & Insurance Payment';
      case 'property-tax': return 'Property Tax';
      case 'home-insurance': return 'Home Insurance';
      default: return 'Tax & Insurance Payment';
    }
  };
  
  // Auto-copy property address to Current Loan based on Attached to Property selection
  const autoCopyPropertyAddressToCurrentLoan = () => {
    const attachedProperty = form.getValues('currentLoan.attachedToProperty');
    
    if (attachedProperty === 'Primary Residence') {
      // First priority: Check Property tab Primary Residence address
      const properties = form.getValues('property.properties') || [];
      const primaryProperty = properties.find(p => p.use === 'primary');
      
      if (primaryProperty?.address && (primaryProperty.address.street || primaryProperty.address.city)) {
        // Use Property tab Primary Residence address
        form.setValue('currentLoan.propertyAddress.street', primaryProperty.address.street || '');
        form.setValue('currentLoan.propertyAddress.unit', primaryProperty.address.unit || '');
        form.setValue('currentLoan.propertyAddress.city', primaryProperty.address.city || '');
        form.setValue('currentLoan.propertyAddress.state', primaryProperty.address.state || '');
        form.setValue('currentLoan.propertyAddress.zipCode', primaryProperty.address.zip || '');
        form.setValue('currentLoan.propertyAddress.county', primaryProperty.address.county || '');
      } else {
        // Fallback: Use Borrower tab Residence Address
        const borrowerAddress = form.getValues('borrower.residenceAddress');
        if (borrowerAddress) {
          form.setValue('currentLoan.propertyAddress.street', borrowerAddress.street || '');
          form.setValue('currentLoan.propertyAddress.unit', borrowerAddress.unit || '');
          form.setValue('currentLoan.propertyAddress.city', borrowerAddress.city || '');
          form.setValue('currentLoan.propertyAddress.state', borrowerAddress.state || '');
          form.setValue('currentLoan.propertyAddress.zipCode', borrowerAddress.zip || '');
          form.setValue('currentLoan.propertyAddress.county', borrowerAddress.county || '');
        }
      }
    } else if (attachedProperty === 'Second Home') {
      const properties = form.getValues('property.properties') || [];
      const secondHome = properties.find(property => property.use === 'second-home');
      if (secondHome?.address) {
        form.setValue('currentLoan.propertyAddress.street', secondHome.address.street || '');
        form.setValue('currentLoan.propertyAddress.unit', secondHome.address.unit || '');
        form.setValue('currentLoan.propertyAddress.city', secondHome.address.city || '');
        form.setValue('currentLoan.propertyAddress.state', secondHome.address.state || '');
        form.setValue('currentLoan.propertyAddress.zipCode', secondHome.address.zip || '');
        form.setValue('currentLoan.propertyAddress.county', secondHome.address.county || '');
      }
    } else if (attachedProperty === 'Investment Property') {
      const properties = form.getValues('property.properties') || [];
      const investmentProperty = properties.find(property => property.use === 'investment');
      if (investmentProperty?.address) {
        form.setValue('currentLoan.propertyAddress.street', investmentProperty.address.street || '');
        form.setValue('currentLoan.propertyAddress.unit', investmentProperty.address.unit || '');
        form.setValue('currentLoan.propertyAddress.city', investmentProperty.address.city || '');
        form.setValue('currentLoan.propertyAddress.state', investmentProperty.address.state || '');
        form.setValue('currentLoan.propertyAddress.zipCode', investmentProperty.address.zip || '');
        form.setValue('currentLoan.propertyAddress.county', investmentProperty.address.county || '');
      }
    } else if (attachedProperty === 'Other') {
      // Clear fields for manual entry
      form.setValue('currentLoan.propertyAddress.street', '');
      form.setValue('currentLoan.propertyAddress.unit', '');
      form.setValue('currentLoan.propertyAddress.city', '');
      form.setValue('currentLoan.propertyAddress.state', '');
      form.setValue('currentLoan.propertyAddress.zipCode', '');
      form.setValue('currentLoan.propertyAddress.county', '');
    }
  };

  // Auto-copy property address to Second Loan based on Attached to Property selection
  const autoCopyPropertyAddressToSecondLoan = (propertyId: string) => {
    const properties = form.getValues('property.properties') || [];
    const propertyIndex = properties.findIndex(p => p.id === propertyId);
    if (propertyIndex === -1) return;

    const attachedProperty = form.getValues(`property.properties.${propertyIndex}.secondLoan.attachedToProperty`);
    
    if (attachedProperty === 'Primary Residence') {
      const primaryProperty = properties.find(p => p.use === 'primary');
      if (primaryProperty?.address && (primaryProperty.address.street || primaryProperty.address.city)) {
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.street`, primaryProperty.address.street || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.unit`, primaryProperty.address.unit || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.city`, primaryProperty.address.city || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.state`, primaryProperty.address.state || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.zipCode`, primaryProperty.address.zip || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.county`, primaryProperty.address.county || '');
      } else {
        const borrowerAddress = form.getValues('borrower.residenceAddress');
        if (borrowerAddress) {
          form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.street`, borrowerAddress.street || '');
          form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.unit`, borrowerAddress.unit || '');
          form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.city`, borrowerAddress.city || '');
          form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.state`, borrowerAddress.state || '');
          form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.zipCode`, borrowerAddress.zip || '');
          form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.county`, borrowerAddress.county || '');
        }
      }
    } else if (attachedProperty === 'Second Home') {
      const secondHome = properties.find(property => property.use === 'second-home');
      if (secondHome?.address) {
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.street`, secondHome.address.street || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.unit`, secondHome.address.unit || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.city`, secondHome.address.city || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.state`, secondHome.address.state || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.zipCode`, secondHome.address.zip || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.county`, secondHome.address.county || '');
      }
    } else if (attachedProperty === 'Investment Property') {
      const investmentProperty = properties.find(property => property.use === 'investment');
      if (investmentProperty?.address) {
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.street`, investmentProperty.address.street || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.unit`, investmentProperty.address.unit || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.city`, investmentProperty.address.city || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.state`, investmentProperty.address.state || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.zipCode`, investmentProperty.address.zip || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.county`, investmentProperty.address.county || '');
      }
    } else if (attachedProperty === 'Other') {
      // Clear all fields for Other
      form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.street`, '');
      form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.unit`, '');
      form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.city`, '');
      form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.state`, '');
      form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.zipCode`, '');
      form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.county`, '');
    }
  };

  // Auto-copy property address to Third Loan based on Attached to Property selection
  const autoCopyPropertyAddressToThirdLoan = (propertyId: string) => {
    const properties = form.getValues('property.properties') || [];
    const propertyIndex = properties.findIndex(p => p.id === propertyId);
    if (propertyIndex === -1) return;

    const attachedProperty = form.getValues(`property.properties.${propertyIndex}.thirdLoan.attachedToProperty`);
    
    if (attachedProperty === 'Primary Residence') {
      const primaryProperty = properties.find(p => p.use === 'primary');
      if (primaryProperty?.address && (primaryProperty.address.street || primaryProperty.address.city)) {
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.street`, primaryProperty.address.street || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.unit`, primaryProperty.address.unit || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.city`, primaryProperty.address.city || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.state`, primaryProperty.address.state || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.zipCode`, primaryProperty.address.zip || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.county`, primaryProperty.address.county || '');
      } else {
        const borrowerAddress = form.getValues('borrower.residenceAddress');
        if (borrowerAddress) {
          form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.street`, borrowerAddress.street || '');
          form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.unit`, borrowerAddress.unit || '');
          form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.city`, borrowerAddress.city || '');
          form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.state`, borrowerAddress.state || '');
          form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.zipCode`, borrowerAddress.zip || '');
          form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.county`, borrowerAddress.county || '');
        }
      }
    } else if (attachedProperty === 'Second Home') {
      const secondHome = properties.find(property => property.use === 'second-home');
      if (secondHome?.address) {
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.street`, secondHome.address.street || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.unit`, secondHome.address.unit || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.city`, secondHome.address.city || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.state`, secondHome.address.state || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.zipCode`, secondHome.address.zip || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.county`, secondHome.address.county || '');
      }
    } else if (attachedProperty === 'Investment Property') {
      const investmentProperty = properties.find(property => property.use === 'investment');
      if (investmentProperty?.address) {
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.street`, investmentProperty.address.street || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.unit`, investmentProperty.address.unit || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.city`, investmentProperty.address.city || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.state`, investmentProperty.address.state || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.zipCode`, investmentProperty.address.zip || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.county`, investmentProperty.address.county || '');
      }
    } else if (attachedProperty === 'Other') {
      // Clear all fields for Other
      form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.street`, '');
      form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.unit`, '');
      form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.city`, '');
      form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.state`, '');
      form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.zipCode`, '');
      form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.county`, '');
    }
  };

  // Auto-copy property address to Global Second Loan based on Attached to Property selection
  const autoCopyPropertyAddressToGlobalSecondLoan = () => {
    const attachedProperty = form.getValues('secondLoan.attachedToProperty');
    
    if (attachedProperty === 'Primary Residence') {
      const properties = form.getValues('property.properties') || [];
      const primaryProperty = properties.find(p => p.use === 'primary');
      if (primaryProperty?.address && (primaryProperty.address.street || primaryProperty.address.city)) {
        form.setValue('secondLoan.propertyAddress.street', primaryProperty.address.street || '');
        form.setValue('secondLoan.propertyAddress.unit', primaryProperty.address.unit || '');
        form.setValue('secondLoan.propertyAddress.city', primaryProperty.address.city || '');
        form.setValue('secondLoan.propertyAddress.state', primaryProperty.address.state || '');
        form.setValue('secondLoan.propertyAddress.zipCode', primaryProperty.address.zip || '');
        form.setValue('secondLoan.propertyAddress.county', primaryProperty.address.county || '');
      } else {
        const borrowerAddress = form.getValues('borrower.residenceAddress');
        if (borrowerAddress) {
          form.setValue('secondLoan.propertyAddress.street', borrowerAddress.street || '');
          form.setValue('secondLoan.propertyAddress.unit', borrowerAddress.unit || '');
          form.setValue('secondLoan.propertyAddress.city', borrowerAddress.city || '');
          form.setValue('secondLoan.propertyAddress.state', borrowerAddress.state || '');
          form.setValue('secondLoan.propertyAddress.zipCode', borrowerAddress.zip || '');
          form.setValue('secondLoan.propertyAddress.county', borrowerAddress.county || '');
        }
      }
    } else if (attachedProperty === 'Second Home') {
      const properties = form.getValues('property.properties') || [];
      const secondHome = properties.find(property => property.use === 'second-home');
      if (secondHome?.address) {
        form.setValue('secondLoan.propertyAddress.street', secondHome.address.street || '');
        form.setValue('secondLoan.propertyAddress.unit', secondHome.address.unit || '');
        form.setValue('secondLoan.propertyAddress.city', secondHome.address.city || '');
        form.setValue('secondLoan.propertyAddress.state', secondHome.address.state || '');
        form.setValue('secondLoan.propertyAddress.zipCode', secondHome.address.zip || '');
        form.setValue('secondLoan.propertyAddress.county', secondHome.address.county || '');
      }
    } else if (attachedProperty === 'Investment Property') {
      const properties = form.getValues('property.properties') || [];
      const investmentProperty = properties.find(property => property.use === 'investment');
      if (investmentProperty?.address) {
        form.setValue('secondLoan.propertyAddress.street', investmentProperty.address.street || '');
        form.setValue('secondLoan.propertyAddress.unit', investmentProperty.address.unit || '');
        form.setValue('secondLoan.propertyAddress.city', investmentProperty.address.city || '');
        form.setValue('secondLoan.propertyAddress.state', investmentProperty.address.state || '');
        form.setValue('secondLoan.propertyAddress.zipCode', investmentProperty.address.zip || '');
        form.setValue('secondLoan.propertyAddress.county', investmentProperty.address.county || '');
      }
    } else if (attachedProperty === 'Other') {
      // Clear fields for manual entry
      form.setValue('secondLoan.propertyAddress.street', '');
      form.setValue('secondLoan.propertyAddress.unit', '');
      form.setValue('secondLoan.propertyAddress.city', '');
      form.setValue('secondLoan.propertyAddress.state', '');
      form.setValue('secondLoan.propertyAddress.zipCode', '');
      form.setValue('secondLoan.propertyAddress.county', '');
    }
  };

  // Auto-copy property address to Global Third Loan based on Attached to Property selection
  const autoCopyPropertyAddressToGlobalThirdLoan = () => {
    const attachedProperty = form.getValues('thirdLoan.attachedToProperty');
    
    if (attachedProperty === 'Primary Residence') {
      const properties = form.getValues('property.properties') || [];
      const primaryProperty = properties.find(p => p.use === 'primary');
      if (primaryProperty?.address && (primaryProperty.address.street || primaryProperty.address.city)) {
        form.setValue('thirdLoan.propertyAddress.street', primaryProperty.address.street || '');
        form.setValue('thirdLoan.propertyAddress.unit', primaryProperty.address.unit || '');
        form.setValue('thirdLoan.propertyAddress.city', primaryProperty.address.city || '');
        form.setValue('thirdLoan.propertyAddress.state', primaryProperty.address.state || '');
        form.setValue('thirdLoan.propertyAddress.zipCode', primaryProperty.address.zip || '');
        form.setValue('thirdLoan.propertyAddress.county', primaryProperty.address.county || '');
      } else {
        const borrowerAddress = form.getValues('borrower.residenceAddress');
        if (borrowerAddress) {
          form.setValue('thirdLoan.propertyAddress.street', borrowerAddress.street || '');
          form.setValue('thirdLoan.propertyAddress.unit', borrowerAddress.unit || '');
          form.setValue('thirdLoan.propertyAddress.city', borrowerAddress.city || '');
          form.setValue('thirdLoan.propertyAddress.state', borrowerAddress.state || '');
          form.setValue('thirdLoan.propertyAddress.zipCode', borrowerAddress.zip || '');
          form.setValue('thirdLoan.propertyAddress.county', borrowerAddress.county || '');
        }
      }
    } else if (attachedProperty === 'Second Home') {
      const properties = form.getValues('property.properties') || [];
      const secondHome = properties.find(property => property.use === 'second-home');
      if (secondHome?.address) {
        form.setValue('thirdLoan.propertyAddress.street', secondHome.address.street || '');
        form.setValue('thirdLoan.propertyAddress.unit', secondHome.address.unit || '');
        form.setValue('thirdLoan.propertyAddress.city', secondHome.address.city || '');
        form.setValue('thirdLoan.propertyAddress.state', secondHome.address.state || '');
        form.setValue('thirdLoan.propertyAddress.zipCode', secondHome.address.zip || '');
        form.setValue('thirdLoan.propertyAddress.county', secondHome.address.county || '');
      }
    } else if (attachedProperty === 'Investment Property') {
      const properties = form.getValues('property.properties') || [];
      const investmentProperty = properties.find(property => property.use === 'investment');
      if (investmentProperty?.address) {
        form.setValue('thirdLoan.propertyAddress.street', investmentProperty.address.street || '');
        form.setValue('thirdLoan.propertyAddress.unit', investmentProperty.address.unit || '');
        form.setValue('thirdLoan.propertyAddress.city', investmentProperty.address.city || '');
        form.setValue('thirdLoan.propertyAddress.state', investmentProperty.address.state || '');
        form.setValue('thirdLoan.propertyAddress.zipCode', investmentProperty.address.zip || '');
        form.setValue('thirdLoan.propertyAddress.county', investmentProperty.address.county || '');
      }
    } else if (attachedProperty === 'Other') {
      // Clear fields for manual entry
      form.setValue('thirdLoan.propertyAddress.street', '');
      form.setValue('thirdLoan.propertyAddress.unit', '');
      form.setValue('thirdLoan.propertyAddress.city', '');
      form.setValue('thirdLoan.propertyAddress.state', '');
      form.setValue('thirdLoan.propertyAddress.zipCode', '');
      form.setValue('thirdLoan.propertyAddress.county', '');
    }
  };

  // Get loan details open state (default to true)
  const getLoanDetailsOpen = (propertyId: string) => {
    return isLoanDetailsOpen[propertyId] ?? true;
  };

  // Get second loan details open state (default to true)
  const getSecondLoanDetailsOpen = (propertyId: string) => {
    return isSecondLoanDetailsOpen[propertyId] ?? true;
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
    <TooltipProvider delayDuration={300}>
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
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="client" data-testid="tab-client" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Borrower</TabsTrigger>
              <TabsTrigger value="income" data-testid="tab-income" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Income</TabsTrigger>
              <TabsTrigger value="property" data-testid="tab-property" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Property</TabsTrigger>
              <TabsTrigger value="credit" data-testid="tab-credit" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Credit</TabsTrigger>
              <TabsTrigger value="loan" data-testid="tab-loan" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Loan</TabsTrigger>
              <TabsTrigger value="status" data-testid="tab-status" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Status</TabsTrigger>
              <TabsTrigger value="vendors" data-testid="tab-vendors" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Vendors</TabsTrigger>
              <TabsTrigger value="quote" data-testid="tab-quote" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Quote</TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Notes</TabsTrigger>
            </TabsList>

            {/* Client Tab */}
            <TabsContent value="client" className="space-y-6">
              {/* Lead Information Fields */}
              <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="borrower-leadRef">Lead Reference</Label>
                    <Input
                      id="borrower-leadRef"
                      {...form.register('borrower.leadRef')}
                      data-testid="input-borrower-leadRef"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-source">Source</Label>
                    <Select
                      value={form.watch('borrower.source') || ''}
                      onValueChange={(value) => form.setValue('borrower.source', value)}
                    >
                      <SelectTrigger data-testid="select-borrower-source">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direct Mail">Direct Mail</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Client Referral">Client Referral</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
              <Card className="border-l-4 border-l-green-500 hover:border-green-500 focus-within:border-green-500 transition-colors duration-200">
                <CardHeader>
                  <CardTitle>Borrower</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Row 1: First Name, Middle Name (narrower), Last Name, Date of Birth, SSN */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  </div>
                  
                  {/* Row 2: Marital Status, Relationship to Co-Borrower, Phone, Email, Preferred Contact Time */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                      <Label htmlFor="borrower-preferredContactTime">Preferred Contact Time</Label>
                      <Select 
                        value={form.watch('borrower.preferredContactTime') || 'Select'}
                        onValueChange={(value) => form.setValue('borrower.preferredContactTime', value as any)}
                      >
                        <SelectTrigger data-testid="select-borrower-preferredContactTime">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Select">Select</SelectItem>
                          <SelectItem value="Morning">Morning</SelectItem>
                          <SelectItem value="Afternoon">Afternoon</SelectItem>
                          <SelectItem value="Evening">Evening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Residence Address */}
              <Card>
                <Collapsible open={isBorrowerResidenceOpen} onOpenChange={setIsBorrowerResidenceOpen}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Borrower Residence Address</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-orange-500 hover:text-black"
                              data-testid="button-toggle-borrower-residence"
                            >
                              {isBorrowerResidenceOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isBorrowerResidenceOpen ? 'Minimize' : 'Expand'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
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
                    
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="borrower-residence-unit">Unit/Apt</Label>
                      <Input
                        id="borrower-residence-unit"
                        {...form.register('borrower.residenceAddress.unit', {
                          onChange: () => setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100)
                        })}
                        data-testid="input-borrower-residence-unit"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-1">
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
                    
                    <div className="space-y-2 md:col-span-1">
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
                              {state.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.borrower?.residenceAddress?.state && (
                        <p className="text-sm text-destructive">{form.formState.errors.borrower.residenceAddress.state.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 md:col-span-1">
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
                    
                    <div className="space-y-2 md:col-span-1">
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
                    
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="borrower-years-address">Years at this Address</Label>
                      <Input
                        id="borrower-years-address"
                        type="number"
                        min="0"
                        max="99"
                        {...form.register('borrower.yearsAtAddress')}
                        data-testid="input-borrower-years-address"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="borrower-months-address">Months at this Address</Label>
                      <Input
                        id="borrower-months-address"
                        type="number"
                        min="0"
                        max="11"
                        placeholder="0"
                        {...form.register('borrower.monthsAtAddress')}
                        data-testid="input-borrower-months-address"
                      />
                    </div>
                  </div>
                  
                  {/* Years and months fields moved to header */}
                  {form.formState.errors.borrower?.yearsAtAddress && (
                    <p className="text-sm text-destructive">{form.formState.errors.borrower.yearsAtAddress.message}</p>
                  )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Prior Borrower Residence Address - Show if less than 2 years at current address */}
              {(() => {
                const years = parseInt(form.watch('borrower.yearsAtAddress') || '0');
                const months = parseInt(form.watch('borrower.monthsAtAddress') || '0');
                const showPriorAddress = years < 2 || (years === 0 && months < 24);
                return showPriorAddress;
              })() && (
                <Card>
                  <Collapsible open={isBorrowerPriorResidenceOpen} onOpenChange={setIsBorrowerPriorResidenceOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Borrower's Prior Residence Address</CardTitle>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-black"
                                data-testid="button-toggle-borrower-prior-residence"
                              >
                                {isBorrowerPriorResidenceOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isBorrowerPriorResidenceOpen ? 'Minimize' : 'Expand'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                                  {state.value}
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
                    </CollapsibleContent>
                  </Collapsible>
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
                              {state.value}
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
<Card className="mt-16 border-l-4 border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500 transition-colors duration-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Co-Borrower</CardTitle>
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
                  <CardContent className="space-y-4">
                    {/* Row 1: First Name, Middle Name, Last Name, Date of Birth, SSN */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    </div>
                    
                    {/* Row 2: Marital Status, Relationship to Borrower, Phone, Email, Preferred Contact Time */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                        <Label htmlFor="coBorrower-preferredContactTime">Preferred Contact Time</Label>
                        <Select 
                          value={form.watch('coBorrower.preferredContactTime') || 'Select'}
                          onValueChange={(value) => form.setValue('coBorrower.preferredContactTime', value as any)}
                        >
                          <SelectTrigger data-testid="select-coborrower-preferredContactTime">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Select">Select</SelectItem>
                            <SelectItem value="Morning">Morning</SelectItem>
                            <SelectItem value="Afternoon">Afternoon</SelectItem>
                            <SelectItem value="Evening">Evening</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Co-Borrower Residence Address */}
              {hasCoBorrower && (
                <>
                <Card>
                  <Collapsible open={isCoBorrowerResidenceOpen} onOpenChange={setIsCoBorrowerResidenceOpen}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Co-Borrower's Residence Address</CardTitle>
                      <div className="flex items-center gap-2">
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                data-testid="button-toggle-coborrower-residence"
                              >
                                {isCoBorrowerResidenceOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isCoBorrowerResidenceOpen ? 'Minimize' : 'Expand'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-residence-street">Street Address</Label>
                        <Input
                          id="coBorrower-residence-street"
                          {...form.register('coBorrower.residenceAddress.street', {
                            onChange: () => setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100)
                          })}
                          data-testid="input-coborrower-residence-street"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-residence-unit">Unit/Apt</Label>
                        <Input
                          id="coBorrower-residence-unit"
                          {...form.register('coBorrower.residenceAddress.unit', {
                            onChange: () => setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100)
                          })}
                          data-testid="input-coborrower-residence-unit"
                        />
                      </div>
                      
                      <div className="space-y-2">
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
                                {state.value}
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
                      
                      <div className="space-y-2">
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
                    </CollapsibleContent>
                  </Collapsible>
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
                      <Collapsible open={isCoBorrowerPriorResidenceOpen} onOpenChange={setIsCoBorrowerPriorResidenceOpen}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Co-Borrower's Prior Residence Address</CardTitle>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CollapsibleTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    data-testid="button-toggle-coborrower-prior-residence"
                                  >
                                    {isCoBorrowerPriorResidenceOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                  </Button>
                                </CollapsibleTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isCoBorrowerPriorResidenceOpen ? 'Minimize' : 'Expand'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </CardHeader>
                        <CollapsibleContent>
                          <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                                      {state.value}
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
                        </CollapsibleContent>
                      </Collapsible>
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
                                  {state.value}
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
                    <Label htmlFor="household-income-total" className="text-2xl font-semibold">Total Household Income</Label>
                    <div 
                      className={`text-2xl font-bold ${(() => {
                        const totalValue = totalHouseholdIncome;
                        return totalValue > 0 ? 'text-orange-600' : 'text-primary';
                      })()}`}
                      data-testid="text-household-income-total"
                    >
                      {totalHouseholdIncomeFormatted}
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
                      const totalValue = totalBorrowerIncome;
                      return totalValue > 0 ? 'text-green-600' : '';
                    })()}>
                      {totalBorrowerIncomeFormatted}
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-employment-income"
                            title={isEmploymentIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`employment-income-${isEmploymentIncomeOpen}`}
                          >
                            {isEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Employment Information - Single Row */}
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="income-employer-phone" className="text-xs">
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
                            
                            <div className="space-y-2">
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
                            
                            <div className="space-y-2">
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
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="income-employer-street">Street Address</Label>
                              <Input
                                id="income-employer-street"
                                placeholder="123 Main St"
                                {...form.register('income.employerAddress.street')}
                                data-testid="input-income-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-employer-unit">Unit/Apt</Label>
                              <Input
                                id="income-employer-unit"
                                {...form.register('income.employerAddress.unit')}
                                data-testid="input-income-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2">
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
                                      {state.value}
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
                            
                            <div className="space-y-2">
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
                        <CardTitle>Borrower Prior Employment</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-prior-employment-income"
                            title={isPriorEmploymentIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`prior-employment-income-${isPriorEmploymentIncomeOpen}`}
                          >
                            {isPriorEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Prior Employment Information - Single Row */}
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="income-prior-employer-phone" className="text-xs">
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
                            
                            <div className="space-y-2">
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
                            
                            <div className="space-y-2">
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
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="income-prior-employer-street">Street Address</Label>
                              <Input
                                id="income-prior-employer-street"
                                placeholder="123 Main St"
                                {...form.register('income.priorEmployerAddress.street')}
                                data-testid="input-income-prior-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-prior-employer-unit">Unit/Apt</Label>
                              <Input
                                id="income-prior-employer-unit"
                                {...form.register('income.priorEmployerAddress.unit')}
                                data-testid="input-income-prior-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2">
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
                                      {state.value}
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
                            
                            <div className="space-y-2">
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
                        <CardTitle>Borrower Second Employment Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-second-employment-income"
                            title={isSecondEmploymentIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`second-employment-income-${isSecondEmploymentIncomeOpen}`}
                          >
                            {isSecondEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Second Employment Information - Single Row */}
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="income-second-employer-phone" className="text-xs">
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
                            
                            <div className="space-y-2">
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
                            
                            <div className="space-y-2">
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
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="income-second-employer-street">Street Address</Label>
                              <Input
                                id="income-second-employer-street"
                                placeholder="123 Main St"
                                {...form.register('income.secondEmployerAddress.street')}
                                data-testid="input-income-second-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-second-employer-unit">Unit/Apt</Label>
                              <Input
                                id="income-second-employer-unit"
                                {...form.register('income.secondEmployerAddress.unit')}
                                data-testid="input-income-second-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2">
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
                                      {state.value}
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
                            
                            <div className="space-y-2">
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
                        <CardTitle>Borrower Self-Employment Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-self-employment-income"
                            title={isSelfEmploymentIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`self-employment-income-${isSelfEmploymentIncomeOpen}`}
                          >
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
                                      {state.value}
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
                        <CardTitle>Borrower Pension Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-pension-income"
                            title={isPensionIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`pension-income-${isPensionIncomeOpen}`}
                          >
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
                        <CardTitle>Borrower Social Security Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-social-security-income"
                            title={isSocialSecurityIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`social-security-income-${isSocialSecurityIncomeOpen}`}
                          >
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
                        <CardTitle>Borrower VA Disability Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-va-benefits-income"
                            title={isVaBenefitsIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`va-benefits-income-${isVaBenefitsIncomeOpen}`}
                          >
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
                        <CardTitle>Borrower Disability Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-disability-income"
                            title={isDisabilityIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`disability-income-${isDisabilityIncomeOpen}`}
                          >
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-other-income"
                            title={isOtherIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`other-income-${isOtherIncomeOpen}`}
                          >
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
                        const totalValue = totalCoBorrowerIncome;
                        return totalValue > 0 ? 'text-green-600' : '';
                      })()}>
                        {totalCoBorrowerIncomeFormatted}
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-coborrower-employment-income"
                            title={isCoBorrowerEmploymentIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`coborrower-employment-income-${isCoBorrowerEmploymentIncomeOpen}`}
                          >
                            {isCoBorrowerEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Co-Borrower Employment Information - Single Row */}
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="coBorrowerIncome-employer-phone" className="text-xs">
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
                            
                            <div className="space-y-2">
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
                            
                            <div className="space-y-2">
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
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-employer-street">Street Address</Label>
                              <Input
                                id="coBorrowerIncome-employer-street"
                                placeholder="123 Main St"
                                {...form.register('coBorrowerIncome.employerAddress.street')}
                                data-testid="input-coborrowerIncome-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-employer-unit">Unit/Apt</Label>
                              <Input
                                id="coBorrowerIncome-employer-unit"
                                {...form.register('coBorrowerIncome.employerAddress.unit')}
                                data-testid="input-coborrowerIncome-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2">
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
                                      {state.value}
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
                            
                            <div className="space-y-2">
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-coborrower-prior-employment-income"
                            title={isCoBorrowerPriorEmploymentIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`coborrower-prior-employment-income-${isCoBorrowerPriorEmploymentIncomeOpen}`}
                          >
                            {isCoBorrowerPriorEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Co-Borrower Prior Employment Information - Single Row */}
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
                              <Label htmlFor="coBorrowerIncome-priorMonthlyIncome">Gross Monthly Income</Label>
                              <Input
                                id="coBorrowerIncome-priorMonthlyIncome"
                                {...form.register('coBorrowerIncome.priorMonthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-coborrowerIncome-priorMonthlyIncome"
                              />
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
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-priorEmploymentType">Full-Time / Part-Time</Label>
                              <Select
                                value={form.watch('coBorrowerIncome.priorEmploymentType') || ''}
                                onValueChange={(value) => form.setValue('coBorrowerIncome.priorEmploymentType', value as any)}
                              >
                                <SelectTrigger data-testid="select-coBorrowerIncome-priorEmploymentType">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
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
                            
                            <div className="space-y-2">
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
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-prior-employer-street">Street Address</Label>
                              <Input
                                id="coBorrowerIncome-prior-employer-street"
                                placeholder="123 Main St"
                                {...form.register('coBorrowerIncome.priorEmployerAddress.street')}
                                data-testid="input-coBorrowerIncome-prior-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-prior-employer-unit">Unit/Apt</Label>
                              <Input
                                id="coBorrowerIncome-prior-employer-unit"
                                {...form.register('coBorrowerIncome.priorEmployerAddress.unit')}
                                data-testid="input-coBorrowerIncome-prior-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2">
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
                                      {state.value}
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
                            
                            <div className="space-y-2">
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-coborrower-second-employment-income"
                            title={isCoBorrowerSecondEmploymentIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`coborrower-second-employment-income-${isCoBorrowerSecondEmploymentIncomeOpen}`}
                          >
                            {isCoBorrowerSecondEmploymentIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Co-Borrower Second Employment Information - Single Row */}
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
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
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="coBorrowerIncome-second-employer-phone" className="text-xs">
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
                            
                            <div className="space-y-2">
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
                            
                            <div className="space-y-2">
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
                          
                          {/* Employer Address */}
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-second-employer-street">Street Address</Label>
                              <Input
                                id="coBorrowerIncome-second-employer-street"
                                placeholder="123 Main St"
                                {...form.register('coBorrowerIncome.secondEmployerAddress.street')}
                                data-testid="input-coborrowerIncome-second-employer-street"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-second-employer-unit">Unit/Apt</Label>
                              <Input
                                id="coBorrowerIncome-second-employer-unit"
                                {...form.register('coBorrowerIncome.secondEmployerAddress.unit')}
                                data-testid="input-coborrowerIncome-second-employer-unit"
                              />
                            </div>
                            
                            <div className="space-y-2">
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
                                      {state.value}
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
                            
                            <div className="space-y-2">
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-coborrower-self-employment-income"
                            title={isCoBorrowerSelfEmploymentIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`coborrower-self-employment-income-${isCoBorrowerSelfEmploymentIncomeOpen}`}
                          >
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
                                      {state.value}
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-coborrower-pension-income"
                            title={isCoBorrowerPensionIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`coborrower-pension-income-${isCoBorrowerPensionIncomeOpen}`}
                          >
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-coborrower-social-security-income"
                            title={isCoBorrowerSocialSecurityIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`coborrower-social-security-income-${isCoBorrowerSocialSecurityIncomeOpen}`}
                          >
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-coborrower-va-benefits-income"
                            title={isCoBorrowerVaBenefitsIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`coborrower-va-benefits-income-${isCoBorrowerVaBenefitsIncomeOpen}`}
                          >
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-coborrower-disability-income"
                            title={isCoBorrowerDisabilityIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`coborrower-disability-income-${isCoBorrowerDisabilityIncomeOpen}`}
                          >
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-orange-500 hover:text-white" 
                            data-testid="button-toggle-coborrower-other-income"
                            title={isCoBorrowerOtherIncomeOpen ? 'Minimize' : 'Expand'}
                            key={`coborrower-other-income-${isCoBorrowerOtherIncomeOpen}`}
                          >
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
                              ? 'text-green-800' 
                              : 'text-foreground'
                          }`}>Primary Residence:</span>
                          <span className={`font-medium ${
                            (form.watch('property.properties') || []).filter(p => p.use === 'primary').length > 0 
                              ? 'text-green-800' 
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
                              ? 'text-purple-500' 
                              : 'text-foreground'
                          }`}>Investment Property:</span>
                          <span className={`font-medium ${
                            (form.watch('property.properties') || []).filter(p => p.use === 'investment').length > 0 
                              ? 'text-purple-500' 
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
                  <Card key={propertyId} className={`border-l-4 transition-colors duration-200 ${
                    property.use === 'primary' ? 'border-l-green-500 hover:border-green-500 focus-within:border-green-500' : 
                    property.use === 'second-home' ? 'border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500' : 
                    property.use === 'investment' ? 'border-l-purple-500 hover:border-purple-500 focus-within:border-purple-500' : ''
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
                                  onClick={() => setAddPropertyDialog({ isOpen: true, propertyType: property.use as 'second-home' | 'investment' })}
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
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-property-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`property-toggle-${propertyId}-${isOpen}`}
                              >
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
                              <div className="space-y-2">
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
                              
                              <div className="space-y-2">
                                <Label htmlFor={`property-address-unit-${propertyId}`}>Unit/Apt</Label>
                                <Input
                                  id={`property-address-unit-${propertyId}`}
                                  {...form.register(`property.properties.${index}.address.unit` as const)}
                                  data-testid={`input-property-unit-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2">
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
                                        {state.value}
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
                              
                              <div className="space-y-2">
                                <Label htmlFor={`property-address-county-${propertyId}`}>County</Label>
                                <Input
                                  id={`property-address-county-${propertyId}`}
                                  {...form.register(`property.properties.${index}.address.county` as const)}
                                  data-testid={`input-property-county-${propertyId}`}
                                />
                              </div>
                            </div>

                            {/* Property Details - Row 1: Property Type, Estimated Property Value, Appraised Value, Purchase Price */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                <Label htmlFor={`property-purchase-price-${propertyId}`}>Purchase Price</Label>
                                <Input
                                  id={`property-purchase-price-${propertyId}`}
                                  {...form.register(`property.properties.${index}.purchasePrice` as const)}
                                  placeholder="$0.00"
                                  data-testid={`input-property-purchase-price-${propertyId}`}
                                />
                              </div>
                            </div>

                            {/* Property Details - Row 2: Owned Since, Owned / Title Held By, Secured First Loan, Secured Second Loan */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
                                <Label htmlFor={`property-owned-held-by-${propertyId}`}>Owned / Title Held By</Label>
                                <Select
                                  value={form.watch(`property.properties.${index}.ownedHeldBy` as const) || ''}
                                  onValueChange={(value: "borrower" | "borrower-coborrower" | "borrower-others") => {
                                    form.setValue(`property.properties.${index}.ownedHeldBy` as const, value);
                                  }}
                                >
                                  <SelectTrigger data-testid={`select-property-owned-held-by-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="borrower">Borrower</SelectItem>
                                    <SelectItem value="borrower-coborrower">Borrower & Co-Borrower</SelectItem>
                                    <SelectItem value="borrower-others">Borrower(s) & Others</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
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
                                    {(property.use === 'primary' || property.use === 'second-home') && (
                                      <SelectItem value="select">Select</SelectItem>
                                    )}
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value={property.use === 'investment' ? 'no-paid-off' : 'paid-off'}>
                                      {property.use === 'investment' ? 'No, Paid Off' : 'Paid Off'}
                                    </SelectItem>
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




                            {/* Second Loan Details Box - Only show when activeSecondLoan is 'yes' for all property types */}
                            {form.watch(`property.properties.${index}.activeSecondLoan` as const) === 'yes' && (
                            <Card className="border-2 border-dashed border-gray-500">
                              <Collapsible open={isSecondLoanDetailsOpen[propertyId] ?? true} onOpenChange={() => toggleSecondLoanDetailsOpen(propertyId)}>
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Second Loan Details</CardTitle>
                                    <CollapsibleTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="hover:bg-orange-500 hover:text-white" 
                                        data-testid={`button-toggle-second-loan-details-${propertyId}`}
                                        title={(isSecondLoanDetailsOpen[propertyId] ?? true) ? 'Minimize' : 'Expand'}
                                        key={`second-loan-details-${propertyId}-${isSecondLoanDetailsOpen[propertyId] ?? true}`}
                                      >
                                        {(isSecondLoanDetailsOpen[propertyId] ?? true) ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                      </Button>
                                    </CollapsibleTrigger>
                                  </div>
                                </CardHeader>
                                <CollapsibleContent>
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
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor={`property-second-mortgage-balance-${propertyId}`}>
                                        {getSecondMortgageBalanceLabel(propertyId)}
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleSecondMortgageBalanceFieldType(propertyId)}
                                        className="h-6 px-2 text-xs hover:bg-orange-500 hover:text-white hover:border-orange-500"
                                        data-testid={`button-toggle-second-mortgage-balance-type-${propertyId}`}
                                      >
                                        Toggle
                                      </Button>
                                    </div>
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
                                </CollapsibleContent>
                              </Collapsible>
                            </Card>
                            )}

                            {/* Third Loan Details Box - Only show when activeThirdLoan is 'yes' and property is primary/second-home */}
                            {(property.use === 'primary' || property.use === 'second-home') && form.watch(`property.properties.${index}.activeThirdLoan` as const) === 'yes' && (
                            <Card className="border-2 border-dashed border-gray-500">
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

                            {/* Add Investment Property Button - Only show for investment properties */}
                            {property.use === 'investment' && (
                              <div className="flex justify-end mt-6">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addProperty('investment')}
                                  className="hover:bg-orange-500 hover:text-white"
                                  data-testid={`button-add-investment-property-${propertyId}`}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Investment Property
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
              {/* New Loan Information */}
              <Card className="border-l-4 border-l-green-500">
                <Collapsible open={isNewLoanOpen} onOpenChange={setIsNewLoanOpen}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>New Loan</CardTitle>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-orange-500 hover:text-white" 
                          data-testid="button-toggle-new-loan"
                          title={isNewLoanOpen ? 'Minimize' : 'Expand'}
                        >
                          {isNewLoanOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
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
                        <Label htmlFor="newLoan-loanTerm">Loan Duration</Label>
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
                        <Label htmlFor="newLoan-monthlyPayment">Monthly Payment</Label>
                        <Input
                          id="newLoan-monthlyPayment"
                          {...form.register('newLoan.monthlyPayment')}
                          placeholder="$0.00"
                          data-testid="input-newLoan-monthlyPayment"
                        />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Current Loan Sections - Show/Hide based on state */}
              {showCurrentLoan ? (
                <>
                  <CurrentLoanCard
                    idPrefix=""
                    borderVariant="blue"
                    isOpen={isCurrentLoanOpen}
                    setIsOpen={setIsCurrentLoanOpen}
                    onRemove={removeCurrentLoan}
                    onAutoCopyAddress={autoCopyPropertyAddressToCurrentLoan}
                    formInstance={form}
                  />
                </>
              ) : (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCurrentLoan}
                      className="hover:bg-blue-500 hover:text-white"
                      data-testid="button-add-current-loan"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Current Loan
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Second Loan Sections - Only show when added */}
              {showSecondLoan && (
                <CurrentSecondLoanCard
                  idPrefix=""
                  borderVariant="blue"
                  isOpen={isSecondLoanOpen}
                  setIsOpen={setIsSecondLoanOpen}
                  onRemove={removeSecondLoan}
                  onAutoCopyAddress={autoCopyPropertyAddressToGlobalSecondLoan}
                  formInstance={form}
                />
              )}

              {/* Third Loan Sections - Only show when added */}
              {showThirdLoan && (
                <>
                  {/* Current Third Loan Information */}
                  <Card className="border-l-4 border-l-orange-500">
                    <Collapsible open={isThirdLoanOpen} onOpenChange={setIsThirdLoanOpen}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Current Third Loan</CardTitle>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setConfirmRemovalDialog({
                                  isOpen: true,
                                  type: 'second-loan',
                                  itemType: 'third-loan',
                                  onConfirm: () => {
                                    setShowThirdLoan(false);
                                    setConfirmRemovalDialog({ isOpen: false, type: null });
                                  }
                                });
                              }}
                              className="hover:bg-red-500 hover:text-white"
                              data-testid="button-remove-third-loan"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white"
                                data-testid="button-toggle-third-loan"
                                title={isThirdLoanOpen ? 'Minimize' : 'Expand'}
                              >
                                {isThirdLoanOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="space-y-4">
                          {/* Row 1: Lender Name, Loan Number, Loan Category, Loan Term, Loan Duration */}
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-lenderName">Lender Name</Label>
                              <Input
                                id="thirdLoan-lenderName"
                                {...form.register('thirdLoan.lenderName')}
                                placeholder="Enter lender name"
                                data-testid="input-thirdLoan-lenderName"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-loanNumber">Loan Number</Label>
                              <Input
                                id="thirdLoan-loanNumber"
                                {...form.register('thirdLoan.loanNumber')}
                                placeholder="Enter loan number"
                                data-testid="input-thirdLoan-loanNumber"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-loanCategory">Loan Category</Label>
                              <Select value={form.watch('thirdLoan.loanCategory') || ''} onValueChange={(value) => form.setValue('thirdLoan.loanCategory', value)}>
                                <SelectTrigger data-testid="select-thirdLoan-loanCategory">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="heloc">HELOC</SelectItem>
                                  <SelectItem value="fixed">FIXED</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-loanProgram">Loan Term</Label>
                              <Select value={form.watch('thirdLoan.loanProgram') || ''} onValueChange={(value) => form.setValue('thirdLoan.loanProgram', value)}>
                                <SelectTrigger data-testid="select-thirdLoan-loanProgram">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="heloc">HELOC</SelectItem>
                                  <SelectItem value="fixed-second-loan">Fixed Second Loan</SelectItem>
                                  <SelectItem value="adjustable-second-loan">Adjustable Second Loan</SelectItem>
                                  <SelectItem value="home-improvement-loan">Home Improvement Loan</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-loanDuration">Loan Duration</Label>
                              <Select value={form.watch('thirdLoan.loanDuration') || ''} onValueChange={(value) => form.setValue('thirdLoan.loanDuration', value)}>
                                <SelectTrigger data-testid="select-thirdLoan-loanDuration">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="30-years">30 Years</SelectItem>
                                  <SelectItem value="25-years">25 Years</SelectItem>
                                  <SelectItem value="20-years">20 Years</SelectItem>
                                  <SelectItem value="15-years">15 Years</SelectItem>
                                  <SelectItem value="10-years">10 Years</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          {/* Row 2: Current Balance, Current Rate, Monthly Payment, Pre-Payment Penalty, Attached to Property */}
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-currentBalance">Current Balance</Label>
                              <div className="flex items-center border border-input bg-background px-3 rounded-md">
                                <span className="text-muted-foreground text-sm">$</span>
                                <Input
                                  id="thirdLoan-currentBalance"
                                  {...form.register('thirdLoan.currentBalance')}
                                  placeholder="0.00"
                                  className="border-0 bg-transparent px-2 focus-visible:ring-0"
                                  data-testid="input-thirdLoan-currentBalance"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-currentRate">Current Rate</Label>
                              <div className="flex items-center border border-input bg-background px-3 rounded-md">
                                <Input
                                  id="thirdLoan-currentRate"
                                  {...form.register('thirdLoan.currentRate')}
                                  placeholder="0.00"
                                  className="border-0 bg-transparent px-2 focus-visible:ring-0"
                                  data-testid="input-thirdLoan-currentRate"
                                />
                                <span className="text-muted-foreground text-sm">%</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-monthlyPayment">Monthly Payment</Label>
                              <div className="flex items-center border border-input bg-background px-3 rounded-md">
                                <span className="text-muted-foreground text-sm">$</span>
                                <Input
                                  id="thirdLoan-monthlyPayment"
                                  {...form.register('thirdLoan.monthlyPayment')}
                                  placeholder="0.00"
                                  className="border-0 bg-transparent px-2 focus-visible:ring-0"
                                  data-testid="input-thirdLoan-monthlyPayment"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-prepaymentPenalty">Pre-payment Penalty</Label>
                              <Select value={form.watch('thirdLoan.prepaymentPenalty') || ''} onValueChange={(value: 'Yes - see notes' | 'No') => form.setValue('thirdLoan.prepaymentPenalty', value)}>
                                <SelectTrigger data-testid="select-thirdLoan-prepaymentPenalty">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="No">No</SelectItem>
                                  <SelectItem value="Yes - see notes">Yes - see notes</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="thirdLoan-attachedToProperty">Attached to Property</Label>
                              <Select value={form.watch('thirdLoan.attachedToProperty') || ''} onValueChange={(value) => {
                                form.setValue('thirdLoan.attachedToProperty', value as any);
                                if (['Primary Residence', 'Second Home', 'Investment Property'].includes(value)) {
                                  setTimeout(() => autoCopyPropertyAddressToGlobalThirdLoan(), 100);
                                } else if (value === 'Other' || value === '' || value === 'select') {
                                  // Clear address fields for Other, empty, or select
                                  form.setValue('thirdLoan.propertyAddress.street', '');
                                  form.setValue('thirdLoan.propertyAddress.unit', '');
                                  form.setValue('thirdLoan.propertyAddress.city', '');
                                  form.setValue('thirdLoan.propertyAddress.state', '');
                                  form.setValue('thirdLoan.propertyAddress.zipCode', '');
                                  form.setValue('thirdLoan.propertyAddress.county', '');
                                }
                              }}>
                                <SelectTrigger data-testid="select-thirdLoan-attachedToProperty">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="select">Select</SelectItem>
                                  <SelectItem value="Primary Residence">Primary Residence</SelectItem>
                                  <SelectItem value="Second Home">Second Home</SelectItem>
                                  <SelectItem value="Investment Property">Investment Property</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          {/* Conditional Property Address Fields - Show when Attached to Property is selected */}
                          {form.watch('thirdLoan.attachedToProperty') && form.watch('thirdLoan.attachedToProperty') !== '' && ['Primary Residence', 'Second Home', 'Investment Property', 'Other'].includes(form.watch('thirdLoan.attachedToProperty') || '') && (
                            <div className="mt-4 p-4 border-t border-gray-200">
                              <Collapsible open={isThirdLoanPropertyAddressOpen} onOpenChange={setIsThirdLoanPropertyAddressOpen}>
                                <div className="flex items-center justify-between mb-3">
                                  <Label className="text-sm font-medium text-gray-700">
                                    Property Address ({form.watch('thirdLoan.attachedToProperty')})
                                  </Label>
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="hover:bg-orange-500 hover:text-white"
                                      data-testid="button-toggle-property-address-third-loan"
                                      title={isThirdLoanPropertyAddressOpen ? 'Minimize' : 'Expand'}
                                    >
                                      {isThirdLoanPropertyAddressOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                  </CollapsibleTrigger>
                                </div>
                                <CollapsibleContent>
                                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                    <div className="space-y-2 md:col-span-4">
                                      <Label htmlFor="thirdLoan-property-street">Street Address</Label>
                                      <Input
                                        id="thirdLoan-property-street"
                                        {...form.register('thirdLoan.propertyAddress.street')}
                                        data-testid="input-thirdLoan-property-street"
                                        readOnly={form.watch('thirdLoan.attachedToProperty') !== 'Other'}
                                        className={form.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                                      />
                                    </div>
                                    
                                    <div className="space-y-2 md:col-span-2">
                                      <Label htmlFor="thirdLoan-property-unit">Unit/Apt</Label>
                                      <Input
                                        id="thirdLoan-property-unit"
                                        {...form.register('thirdLoan.propertyAddress.unit')}
                                        data-testid="input-thirdLoan-property-unit"
                                        readOnly={form.watch('thirdLoan.attachedToProperty') !== 'Other'}
                                        className={form.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
                                    <div className="space-y-2 md:col-span-2">
                                      <Label htmlFor="thirdLoan-property-city">City</Label>
                                      <Input
                                        id="thirdLoan-property-city"
                                        {...form.register('thirdLoan.propertyAddress.city')}
                                        data-testid="input-thirdLoan-property-city"
                                        readOnly={form.watch('thirdLoan.attachedToProperty') !== 'Other'}
                                        className={form.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                                      />
                                    </div>
                                    
                                    <div className="space-y-2 md:col-span-2">
                                      <Label htmlFor="thirdLoan-property-state">State</Label>
                                      <Select
                                        value={form.watch('thirdLoan.propertyAddress.state') || ''}
                                        onValueChange={(value) => form.setValue('thirdLoan.propertyAddress.state', value)}
                                        disabled={form.watch('thirdLoan.attachedToProperty') !== 'Other'}
                                      >
                                        <SelectTrigger
                                          data-testid="select-thirdLoan-property-state"
                                          className={form.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                                        >
                                          <SelectValue placeholder="State" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {US_STATES.map(state => (
                                            <SelectItem key={state.value} value={state.value}>
                                              {state.value}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="thirdLoan-property-zipCode">ZIP Code</Label>
                                      <Input
                                        id="thirdLoan-property-zipCode"
                                        {...form.register('thirdLoan.propertyAddress.zipCode')}
                                        data-testid="input-thirdLoan-property-zipCode"
                                        readOnly={form.watch('thirdLoan.attachedToProperty') !== 'Other'}
                                        className={form.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="thirdLoan-property-county">County</Label>
                                      <Input
                                        id="thirdLoan-property-county"
                                        {...form.register('thirdLoan.propertyAddress.county')}
                                        data-testid="input-thirdLoan-property-county"
                                        readOnly={form.watch('thirdLoan.attachedToProperty') !== 'Other'}
                                        className={form.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                                      />
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>

                </>
              )}
            </TabsContent>

            {/* Credit Tab */}
            <TabsContent value="credit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Credit functionality will be implemented later.</p>
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
            <DialogTitle>
              {confirmRemovalDialog.type === 'third-loan' ? 'Add Third Loan' : 'Confirm Removal'}
            </DialogTitle>
            <DialogDescription>
              <span className="text-red-600 font-medium">
                {confirmRemovalDialog.type === 'current-loan'
                  ? "Removing the current loan will delete all entered data. Would you like to continue?"
                  : confirmRemovalDialog.type === 'second-loan' && confirmRemovalDialog.itemType === 'third-loan'
                  ? "Removing the third loan will delete all entered data. Would you like to continue?"
                  : confirmRemovalDialog.type === 'second-loan' 
                  ? "Removing the second loan will delete all entered data. Would you like to continue?"
                  : confirmRemovalDialog.type === 'third-loan'
                  ? "Would you like to create a third current loan?"
                  : "Removing this information will delete any corresponding data. Would you like to still continue?"
                }
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
                                {formatCurrency(clientEstimate)}
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
                                {zillowEstimate ? formatCurrency(zillowEstimate) : 'Not available'}
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
                                {realtorEstimate ? formatCurrency(realtorEstimate) : 'Not available'}
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
                                {formatCurrency(redfinEstimate)}
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
                                {formatCurrency(appraisedValue)}
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

      {/* Add Property Confirmation Dialog */}
      <AlertDialog open={addPropertyDialog.isOpen} onOpenChange={(open) => setAddPropertyDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Property</AlertDialogTitle>
            <AlertDialogDescription>
              {addPropertyDialog.propertyType === 'second-home' 
                ? "Would you like to add additional property?"
                : addPropertyDialog.propertyType === 'investment'
                ? "Would you like to add additional investment property?"
                : ""
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAddPropertyDialog({ isOpen: false, propertyType: null })}>
              No
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (addPropertyDialog.propertyType) {
                  addProperty(addPropertyDialog.propertyType);
                }
                setAddPropertyDialog({ isOpen: false, propertyType: null });
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      </div>
    </TooltipProvider>
  );
}