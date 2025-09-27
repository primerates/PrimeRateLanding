import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useForm, useWatch, useFormContext, UseFormReturn, Controller, FormProvider } from 'react-hook-form';
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
import { ArrowLeft, Plus, Save, Minus, Home, Building, RefreshCw, Loader2, Monitor, Info, DollarSign, RotateCcw } from 'lucide-react';
import { SiZillow } from 'react-icons/si';
import { MdRealEstateAgent } from 'react-icons/md';
import { FaHome } from 'react-icons/fa';
import { nanoid } from 'nanoid';
import { insertClientSchema, type InsertClient } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

// CurrencyInput component that formats only on blur to prevent typing lag
const CurrencyInput = React.memo<{
  form: any;
  name: string;
  placeholder?: string;
  id?: string;
  'data-testid'?: string;
  shadowColor?: 'green' | 'red' | 'none';
}>(({ form, name, placeholder, id, 'data-testid': dataTestId, shadowColor = 'none' }) => {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Sync local value with form value when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(form.watch(name) || '');
    }
  }, [form.watch(name), isFocused, name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, ''); // Only allow digits and decimal
    setLocalValue(value);
    
    // Update form with raw value for real-time AppraisalIcon updates
    form.setValue(name, value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(localValue) || 0;
    const formatted = num > 0 ? `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '';
    setLocalValue(formatted);
    form.setValue(name, formatted);
  };

  const handleFocus = () => {
    setIsFocused(true);
    const raw = localValue.replace(/[^\d.]/g, ''); // Strip to raw for editing
    setLocalValue(raw);
  };

  // Apply shadow styling based on color - keep border black
  const getShadowClass = () => {
    if (shadowColor === 'green') {
      return 'shadow-lg shadow-green-200';
    } else if (shadowColor === 'red') {
      return 'shadow-lg shadow-red-200';
    }
    return '';
  };

  return (
    <Input
      id={id}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      data-testid={dataTestId}
      className={getShadowClass()}
    />
  );
});

// Helper function to calculate color state based on estimated vs appraised values
const getValueComparisonColor = (estimatedValue: string, appraisedValue: string): { iconClass: string; shadowColor: 'green' | 'red' | 'none' } => {
  const parseValue = (value: string) => {
    if (!value) return 0;
    // Handle both raw numbers and formatted currency
    const cleaned = value.replace(/[^\d.]/g, '');
    return cleaned ? parseFloat(cleaned) : 0;
  };

  const estimatedNum = parseValue(estimatedValue || '');
  const appraisedNum = parseValue(appraisedValue || '');

  if (appraisedNum === 0 || estimatedNum === 0) {
    return { iconClass: 'text-black hover:text-gray-600', shadowColor: 'none' };
  } else if (appraisedNum > estimatedNum) {
    return { iconClass: 'text-green-600 hover:text-green-800', shadowColor: 'green' };
  } else if (appraisedNum < estimatedNum) {
    return { iconClass: 'text-red-600 hover:text-red-800', shadowColor: 'red' };
  } else {
    return { iconClass: 'text-black hover:text-gray-600', shadowColor: 'none' };
  }
};

// Helper function to calculate color state based on Back DTI vs Guideline DTI comparison
const getDTIComparisonColor = (backDTI: string, guidelineDTI: string): { labelClass: string; shadowColor: 'green' | 'red' | 'none' } => {
  const parsePercentage = (value: string) => {
    if (!value) return 0;
    // Handle both raw numbers and formatted percentages
    const cleaned = value.replace(/[^\d.]/g, '');
    return cleaned ? parseFloat(cleaned) : 0;
  };

  const backDTINum = parsePercentage(backDTI || '');
  const guidelineDTINum = parsePercentage(guidelineDTI || '');

  if (backDTINum === 0 || guidelineDTINum === 0) {
    return { labelClass: 'text-black', shadowColor: 'none' };
  } else if (backDTINum > guidelineDTINum) {
    return { labelClass: 'text-red-600', shadowColor: 'red' };
  } else if (backDTINum < guidelineDTINum) {
    return { labelClass: 'text-green-600', shadowColor: 'green' };
  } else {
    return { labelClass: 'text-black', shadowColor: 'none' };
  }
};

// Memoized AppraisalIcon component to prevent typing lag
const AppraisalIcon = React.memo<{ index: number; control: any }>(({ index, control }) => {
  const estimatedValue = useWatch({ 
    control, 
    name: `property.properties.${index}.estimatedValue` as const 
  });
  const appraisedValue = useWatch({ 
    control, 
    name: `property.properties.${index}.appraisedValue` as const 
  });

  const { iconClass } = useMemo(() => {
    return getValueComparisonColor(estimatedValue || '', appraisedValue || '');
  }, [estimatedValue, appraisedValue]);

  return <DollarSign className={`h-4 w-4 ${iconClass}`} />;
});

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


  // Handler for co-borrower employer ZIP code lookup
  const handleCoBorrowerEmployerZipCodeLookup = async (zipCode: string, propertyId: string) => {
    if (!zipCode || zipCode.length < 5) {
      setCoBorrowerEmployerCountyOptions(prev => ({...prev, [propertyId]: []}));
      form.setValue(getCoBorrowerEmployerFieldPath(propertyId, 'employerAddress.county'), '');
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerEmployer: {...prev.coBorrowerEmployer, [propertyId]: true}}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      form.setValue(getCoBorrowerEmployerFieldPath(propertyId, 'employerAddress.county'), counties[0].label, { shouldDirty: true });
      setCoBorrowerEmployerCountyOptions(prev => ({...prev, [propertyId]: []}));
    } else if (counties.length > 1) {
      setCoBorrowerEmployerCountyOptions(prev => ({...prev, [propertyId]: counties}));
    } else {
      setCoBorrowerEmployerCountyOptions(prev => ({...prev, [propertyId]: []}));
    }
    
    setCountyLookupLoading(prev => ({...prev, coBorrowerEmployer: {...prev.coBorrowerEmployer, [propertyId]: false}}));
  };

  // Handler for co-borrower prior employer ZIP code lookup
  const handleCoBorrowerPriorEmployerZipCodeLookup = async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setCoBorrowerPriorEmployerCountyOptions([]);
      form.setValue('coBorrowerIncome.priorEmployerAddress.county', '');
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

  // Handler for co-borrower second employer ZIP code lookup - dynamic per card
  const handleCoBorrowerSecondEmployerZipCodeLookup = async (zipCode: string, cardId: string) => {
    const loadingKey = `coBorrowerSecondEmployer-${cardId}`;
    
    if (!zipCode || zipCode.length < 5) {
      setCoBorrowerSecondEmployerCountyOptions(prev => ({...prev, [cardId]: []}));
      form.setValue(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.county') as any, '');
      return;
    }
    
    setCountyLookupLoading(prev => ({...prev, [loadingKey]: true}));
    const counties = await lookupCountyFromZip(zipCode);
    
    if (counties.length === 1) {
      form.setValue(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.county') as any, counties[0].label, { shouldDirty: true });
      setCoBorrowerSecondEmployerCountyOptions(prev => ({...prev, [cardId]: []}));
    } else if (counties.length > 1) {
      setCoBorrowerSecondEmployerCountyOptions(prev => ({...prev, [cardId]: counties}));
    } else {
      setCoBorrowerSecondEmployerCountyOptions(prev => ({...prev, [cardId]: []}));
    }
    
    setCountyLookupLoading(prev => ({...prev, [loadingKey]: false}));
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
    const propertyId = property.id;
    
    // Check current loan
    const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
    if (currentLoanAttached === propertyId) {
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
    if (secondLoanAttached === propertyId) {
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
    if (thirdLoanAttached === propertyId) {
      form.setValue('thirdLoan.propertyAddress', {
        street: propertyAddress.street || '',
        unit: propertyAddress.unit || '',
        city: propertyAddress.city || '',
        state: propertyAddress.state || '',
        zipCode: propertyAddress.zip || '',
        county: propertyAddress.county || ''
      });
    }
    
    // Check all additional loans (loan3, loan4, loan5, etc.)
    additionalLoans.forEach(loan => {
      const additionalLoanAttached = getDyn(`${loan.id}.attachedToProperty`);
      if (additionalLoanAttached === propertyId) {
        setDyn(`${loan.id}.propertyAddress`, {
          street: propertyAddress.street || '',
          unit: propertyAddress.unit || '',
          city: propertyAddress.city || '',
          state: propertyAddress.state || '',
          zipCode: propertyAddress.zip || '',
          county: propertyAddress.county || ''
        });
      }
    });
  };

  // Animation state for first-time page entry
  const [showEntryAnimation, setShowEntryAnimation] = useState(true);
  // Animation state for Income tab animations
  const [showIncomeAnimation, setShowIncomeAnimation] = useState(false);
  // Animation state for Property tab animations
  const [showPropertyAnimation, setShowPropertyAnimation] = useState(false);
  // Animation state for Borrower tab animations
  const [showBorrowerAnimation, setShowBorrowerAnimation] = useState(false);
  // Animation state for subject property box roll-down
  const [showSubjectPropertyAnimation, setShowSubjectPropertyAnimation] = useState<{[key: string]: boolean}>({});
  // Animation state for income card grey background roll-down
  const [showIncomeCardAnimation, setShowIncomeCardAnimation] = useState<{[key: string]: boolean}>({});
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [showCurrentLoan, setShowCurrentLoan] = useState(false);
  const [isCurrentLoanOpen, setIsCurrentLoanOpen] = useState(true);
  const [isReadOnlyCurrentLoanOpen, setIsReadOnlyCurrentLoanOpen] = useState(true);
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(true);
  const [showSecondLoan, setShowSecondLoan] = useState(false);
  const [isSecondLoanOpen, setIsSecondLoanOpen] = useState(true);
  const [showThirdLoan, setShowThirdLoan] = useState(false);
  const [isThirdLoanOpen, setIsThirdLoanOpen] = useState(true);
  const [additionalLoans, setAdditionalLoans] = useState<Array<{id: string, isOpen: boolean}>>([]);
  const [isThirdLoanPropertyAddressOpen, setIsThirdLoanPropertyAddressOpen] = useState(false);
  
  // State for Current Loan 1 info popup in Property tab
  const [isCurrentLoanPreviewOpen, setIsCurrentLoanPreviewOpen] = useState(false);
  
  // State for Current Loan 2 info popup in Property tab
  const [isCurrentSecondLoanPreviewOpen, setIsCurrentSecondLoanPreviewOpen] = useState(false);
  
  // State for Current Third Loan info popup in Property tab
  const [isCurrentThirdLoanPreviewOpen, setIsCurrentThirdLoanPreviewOpen] = useState(false);
  
  // State for Additional Loan preview modal - generic for any additional loan
  const [additionalLoanPreview, setAdditionalLoanPreview] = useState<{isOpen: boolean, loanId: string | null}>({
    isOpen: false,
    loanId: null
  });
  
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

  // Helper function to handle income type changes with warning
  const handleIncomeTypeChange = (fieldPath: string, checked: boolean, incomeTypeName: string, isCoBorrower = false) => {
    if (!checked) {
      // Special handling for employment - don't allow unchecking if cards already exist
      if (incomeTypeName === 'Employment') {
        const hasCards = isCoBorrower 
          ? (coBorrowerEmployerCards || []).length > 0
          : (borrowerEmployerCards || []).length > 0;
        
        if (hasCards) {
          // Cards already exist, prevent unchecking - all removal must be done through card buttons
          return;
        }
      }
      
      // Special handling for second employment - don't allow unchecking if cards already exist
      if (incomeTypeName === 'Second Employment') {
        const hasCards = isCoBorrower 
          ? (coBorrowerSecondEmployerCards || []).length > 0
          : (borrowerSecondEmployerCards || []).length > 0;
        
        if (hasCards) {
          // Cards already exist, prevent unchecking - all removal must be done through card buttons
          return;
        }
      }
      
      // Special handling for self-employment - don't allow unchecking if cards already exist
      if (incomeTypeName === 'Self-Employment') {
        const hasCards = isCoBorrower 
          ? (coBorrowerSelfEmploymentCards || []).length > 0
          : (borrowerSelfEmploymentCards || []).length > 0;
        
        if (hasCards) {
          // Cards already exist, prevent unchecking - all removal must be done through card buttons
          return;
        }
      }
      
      // Special handling for pension - don't allow unchecking if default card already exists
      if (incomeTypeName === 'Pension') {
        const currentPensions = isCoBorrower 
          ? (form.watch('coBorrowerIncome.pensions') || [])
          : (form.watch('income.pensions') || []);
        const hasDefaultCard = currentPensions.some(p => p.isDefault);
        
        if (hasDefaultCard) {
          // Default pension card already exists, prevent unchecking - keep checkbox checked
          form.setValue(fieldPath as any, true);
          return;
        }
      }
      
      // Show warning when trying to uncheck/remove income type (for non-employment, non-pension with default, or when no cards exist)
      setConfirmRemovalDialog({
        isOpen: true,
        type: 'income',
        itemType: incomeTypeName,
        onConfirm: () => {
          form.setValue(fieldPath as any, false);
          // Clear pension cards when unchecking pension
          if (incomeTypeName === 'Pension') {
            if (isCoBorrower) {
              form.setValue('coBorrowerIncome.pensions', []);
            } else {
              form.setValue('income.pensions', []);
            }
          }
          setConfirmRemovalDialog({ isOpen: false, type: null });
        }
      });
    } else {
      // No warning needed when checking
      form.setValue(fieldPath as any, true);
      
      // Auto-create default employment card when employment is first selected
      if (incomeTypeName === 'Employment') {
        const hasCards = isCoBorrower 
          ? (coBorrowerEmployerCards || []).length > 0
          : (borrowerEmployerCards || []).length > 0;
        
        // Only create default employment card if none exist yet
        if (!hasCards) {
          if (isCoBorrower) {
            setCoBorrowerEmployerCards(['default']);
          } else {
            setBorrowerEmployerCards(['default']);
          }
        }
        
        // Auto-expand the employment card
        const cardId = isCoBorrower ? 'coborrower-template-card' : 'template-card';
        setPropertyCardStates(prev => ({ ...prev, [cardId]: true }));
        
        // Trigger animation for newly created employment card
        setTimeout(() => {
          if (isCoBorrower) {
            setShowIncomeCardAnimation(prev => ({ ...prev, [`co-borrower-employment-${cardId}`]: true }));
            setTimeout(() => {
              setShowIncomeCardAnimation(prev => ({ ...prev, [`co-borrower-employment-${cardId}`]: false }));
            }, 800);
          } else {
            setShowIncomeCardAnimation(prev => ({ ...prev, [`borrower-employment-${cardId}`]: true }));
            setTimeout(() => {
              setShowIncomeCardAnimation(prev => ({ ...prev, [`borrower-employment-${cardId}`]: false }));
            }, 800);
          }
        }, 200);
      }
      
      // Auto-create default second employment card when second employment is first selected
      if (incomeTypeName === 'Second Employment') {
        const hasCards = isCoBorrower 
          ? (coBorrowerSecondEmployerCards || []).length > 0
          : (borrowerSecondEmployerCards || []).length > 0;
        
        // Only create default second employment card if none exist yet
        if (!hasCards) {
          if (isCoBorrower) {
            setCoBorrowerSecondEmployerCards(['default']);
          } else {
            setBorrowerSecondEmployerCards(['default']);
          }
          
          // Auto-expand the second employment card
          const cardId = isCoBorrower ? 'coborrower-second-template-card' : 'second-template-card';
          setPropertyCardStates(prev => ({ ...prev, [cardId]: true }));
          
          // Trigger animation for newly created second employment card
          setTimeout(() => {
            if (isCoBorrower) {
              setShowIncomeCardAnimation(prev => ({ ...prev, 'co-borrower-second-employment': true }));
              setTimeout(() => {
                setShowIncomeCardAnimation(prev => ({ ...prev, 'co-borrower-second-employment': false }));
              }, 800);
            } else {
              setShowIncomeCardAnimation(prev => ({ ...prev, 'borrower-second-employment': true }));
              setTimeout(() => {
                setShowIncomeCardAnimation(prev => ({ ...prev, 'borrower-second-employment': false }));
              }, 800);
            }
          }, 200);
        }
      }
      
      // Auto-create default self-employment card when self-employment is first selected
      if (incomeTypeName === 'Self-Employment') {
        const hasCards = isCoBorrower 
          ? (coBorrowerSelfEmploymentCards || []).length > 0
          : (borrowerSelfEmploymentCards || []).length > 0;
        
        // Only create default self-employment card if none exist yet
        if (!hasCards) {
          if (isCoBorrower) {
            setCoBorrowerSelfEmploymentCards(['default']);
          } else {
            setBorrowerSelfEmploymentCards(['default']);
          }
          
          // Auto-expand the self-employment card
          const cardId = isCoBorrower ? 'coborrower-self-employment-template-card' : 'self-employment-template-card';
          setPropertyCardStates(prev => ({ ...prev, [cardId]: true }));
          
          // Trigger animation for newly created self-employment card
          setTimeout(() => {
            if (isCoBorrower) {
              setShowIncomeCardAnimation(prev => ({ ...prev, 'co-borrower-self-employment': true }));
              setTimeout(() => {
                setShowIncomeCardAnimation(prev => ({ ...prev, 'co-borrower-self-employment': false }));
              }, 800);
            } else {
              setShowIncomeCardAnimation(prev => ({ ...prev, 'borrower-self-employment': true }));
              setTimeout(() => {
                setShowIncomeCardAnimation(prev => ({ ...prev, 'borrower-self-employment': false }));
              }, 800);
            }
          }, 200);
        }
      }
      
      // Auto-create default pension card when pension is first selected
      if (incomeTypeName === 'Pension') {
        const currentPensions = isCoBorrower 
          ? (form.watch('coBorrowerIncome.pensions') || [])
          : (form.watch('income.pensions') || []);
        
        // Only create default pension if none exist yet
        if (currentPensions.length === 0) {
          const defaultPension = {
            id: `pension-default-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            payerName: '',
            monthlyAmount: '',
            isDefault: true // Mark as default card
          };
          
          if (isCoBorrower) {
            form.setValue('coBorrowerIncome.pensions', [defaultPension]);
          } else {
            form.setValue('income.pensions', [defaultPension]);
          }
        }
      }
    }
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

  // Function to remove borrower first prior employer

  // Function to remove co-borrower first prior employer

  // Function to remove co-borrower second prior employer

  
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
  const [isEmploymentIncomeOpen, setIsEmploymentIncomeOpen] = useState(false);
  const [isSecondEmploymentIncomeOpen, setIsSecondEmploymentIncomeOpen] = useState(false);
  const [isSelfEmploymentIncomeOpen, setIsSelfEmploymentIncomeOpen] = useState(false);
  const [isSocialSecurityIncomeOpen, setIsSocialSecurityIncomeOpen] = useState(false);
  const [isVaBenefitsIncomeOpen, setIsVaBenefitsIncomeOpen] = useState(false);
  const [isDisabilityIncomeOpen, setIsDisabilityIncomeOpen] = useState(false);
  const [isOtherIncomeOpen, setIsOtherIncomeOpen] = useState(false);

  // Co-Borrower income collapsible state
  const [isCoBorrowerEmploymentIncomeOpen, setIsCoBorrowerEmploymentIncomeOpen] = useState(false);
  const [isCoBorrowerSelfEmploymentIncomeOpen, setIsCoBorrowerSelfEmploymentIncomeOpen] = useState(false);
  const [isCoBorrowerSocialSecurityIncomeOpen, setIsCoBorrowerSocialSecurityIncomeOpen] = useState(false);
  const [isCoBorrowerVaBenefitsIncomeOpen, setIsCoBorrowerVaBenefitsIncomeOpen] = useState(false);
  const [isCoBorrowerDisabilityIncomeOpen, setIsCoBorrowerDisabilityIncomeOpen] = useState(false);
  const [isCoBorrowerOtherIncomeOpen, setIsCoBorrowerOtherIncomeOpen] = useState(false);

  // Pension income collapsible state
  const [isPensionIncomeOpen, setIsPensionIncomeOpen] = useState(false);
  const [isCoBorrowerPensionIncomeOpen, setIsCoBorrowerPensionIncomeOpen] = useState(false);

  // Address box collapsible states
  const [isBorrowerResidenceOpen, setIsBorrowerResidenceOpen] = useState(false);
  const [isBorrowerPriorResidenceOpen, setIsBorrowerPriorResidenceOpen] = useState(false);
  const [isShowingMonthsAtAddress, setIsShowingMonthsAtAddress] = useState(false);
  const [isShowingMonthsAtPriorAddress, setIsShowingMonthsAtPriorAddress] = useState(false);
  const [isShowingCoBorrowerMonthsAtAddress, setIsShowingCoBorrowerMonthsAtAddress] = useState(false);
  const [isShowingCoBorrowerMonthsAtPriorAddress, setIsShowingCoBorrowerMonthsAtPriorAddress] = useState(false);
  
  // Lead Reference toggle state
  const [isShowingDMBatch, setIsShowingDMBatch] = useState(false);
  const [isCoBorrowerResidenceOpen, setIsCoBorrowerResidenceOpen] = useState(false);
  const [isCoBorrowerPriorResidenceOpen, setIsCoBorrowerPriorResidenceOpen] = useState(false);

  // Employment toggle states - Years/Months Employed
  const [isShowingMonthsEmployed, setIsShowingMonthsEmployed] = useState(false);
  const [isCoBorrowerShowingMonthsEmployed, setIsCoBorrowerShowingMonthsEmployed] = useState(false);
  
  // Guideline DTI toggle state - Guideline DTI / Guideline - Front DTI
  const [isShowingGuidelineFrontDTI, setIsShowingGuidelineFrontDTI] = useState(false);
  
  // DTI inline editing states
  const [isFrontDTIEditing, setIsFrontDTIEditing] = useState(false);
  const [isBackDTIEditing, setIsBackDTIEditing] = useState(false);
  const [isGuidelineDTIEditing, setIsGuidelineDTIEditing] = useState(false);
  
  // Template card toggle state - End Date / Present
  const [isShowingPresent, setIsShowingPresent] = useState(false);

  // Helper function to generate dynamic field paths for main employer cards
  const getEmployerFieldPath = (cardId: string, fieldName: string) => {
    const cleanCardId = cardId === 'default' ? 'default' : cardId;
    return `income.employers.${cleanCardId}.${fieldName}` as const;
  };

  // Helper function to generate dynamic field paths for second employer cards
  const getSecondEmployerFieldPath = (cardId: string, fieldName: string) => {
    const cleanCardId = cardId === 'default' ? 'default' : cardId;
    return `income.secondEmployers.${cleanCardId}.${fieldName}` as const;
  };

  // Helper function to generate dynamic field paths for co-borrower employer cards
  const getCoBorrowerEmployerFieldPath = (cardId: string, fieldName: string) => {
    const cleanCardId = cardId === 'default' ? 'default' : cardId;
    return `coBorrowerIncome.employers.${cleanCardId}.${fieldName}` as const;
  };

  // Helper function to generate dynamic field paths for co-borrower second employer cards
  const getCoBorrowerSecondEmployerFieldPath = (cardId: string, fieldName: string) => {
    const cleanCardId = cardId === 'default' ? 'default' : cardId;
    return `coBorrowerIncome.secondEmployers.${cleanCardId}.${fieldName}` as const;
  };

  // Helper function to generate dynamic field paths for co-borrower self-employment cards
  const getCoBorrowerSelfEmploymentFieldPath = (cardId: string, fieldName: string) => {
    const cleanCardId = cardId === 'default' ? 'default' : cardId;
    return `coBorrowerIncome.selfEmployment.${cleanCardId}.${fieldName}` as const;
  };
  
  // Update employment duration when dates change
  const updateEmploymentDuration = (cardId: string, startDate: string, endDate: string, isPresent: boolean) => {
    const duration = calculateEmploymentDuration(startDate, endDate, isPresent);
    setEmploymentDates(prev => ({
      ...prev,
      [cardId]: {
        startDate,
        endDate,
        isPresent,
        duration
      }
    }));
  };
  
  // Employment toggle states - Monthly/Annual Bonus Income  
  const [isShowingAnnualBonus, setIsShowingAnnualBonus] = useState(false);
  const [isCoBorrowerShowingAnnualBonus, setIsCoBorrowerShowingAnnualBonus] = useState(false);

  // Revenue toggle states for self-employment
  const [isShowingNetRevenue, setIsShowingNetRevenue] = useState(false);
  const [isCoBorrowerShowingNetRevenue, setIsCoBorrowerShowingNetRevenue] = useState(false);

  // Loan details collapsible state (per property)
  const [isLoanDetailsOpen, setIsLoanDetailsOpen] = useState<Record<string, boolean>>({});
  const [isSecondLoanDetailsOpen, setIsSecondLoanDetailsOpen] = useState<Record<string, boolean>>({});

  // Property collapsible state (using object to manage multiple property cards)
  const [propertyCardStates, setPropertyCardStates] = useState<Record<string, boolean>>({});
  
  // Current Primary Loan card collapsible state (per-card state management)
  const [currentLoanCardStates, setCurrentLoanCardStates] = useState<Record<string, boolean>>({});
  
  // Current Second Loan card collapsible state (per-card state management)
  const [secondLoanCardStates, setSecondLoanCardStates] = useState<Record<string, boolean>>({});
  
  // Current Third Loan card collapsible state (per-card state management)
  const [thirdLoanCardStates, setThirdLoanCardStates] = useState<Record<string, boolean>>({});
  
  // Borrower Employer cards state management
  const [borrowerEmployerCards, setBorrowerEmployerCards] = useState<string[]>([]);
  
  // Borrower Second Employer cards state management
  const [borrowerSecondEmployerCards, setBorrowerSecondEmployerCards] = useState<string[]>(['default']);
  
  // Co-borrower Second Employer cards state management
  const [coBorrowerSecondEmployerCards, setCoBorrowerSecondEmployerCards] = useState<string[]>(['default']);
  
  // Borrower Self-Employment cards state management
  const [borrowerSelfEmploymentCards, setBorrowerSelfEmploymentCards] = useState<string[]>(['default']);
  
  // Co-borrower Self-Employment cards state management
  const [coBorrowerSelfEmploymentCards, setCoBorrowerSelfEmploymentCards] = useState<string[]>(['default']);
  
  // Primary Residence cards state management (similar to employer cards)
  const [primaryResidenceCards, setPrimaryResidenceCards] = useState<string[]>([]);
  
  // Primary Residence card data state
  const [primaryResidenceData, setPrimaryResidenceData] = useState<Record<string, {
    isSubjectProperty: boolean | null; // null = not selected, true = yes, false = no
  }>>({});

  // Second Home cards state management (identical to primary residence cards)
  const [secondHomeCards, setSecondHomeCards] = useState<string[]>([]);
  
  // Second Home card data state
  const [secondHomeData, setSecondHomeData] = useState<Record<string, {
    isSubjectProperty: boolean | null; // null = not selected, true = yes, false = no
  }>>({});

  // Investment Property cards state management (identical to second home cards)
  const [investmentCards, setInvestmentCards] = useState<string[]>([]);
  
  // Investment Property card data state
  const [investmentData, setInvestmentData] = useState<Record<string, {
    isSubjectProperty: boolean | null; // null = not selected, true = yes, false = no
  }>>({});

  // Current Primary Loan cards state management (similar to property cards)
  const [currentPrimaryLoanCards, setCurrentPrimaryLoanCards] = useState<string[]>([]);
  
  // Current Primary Loan card data state
  const [currentPrimaryLoanData, setCurrentPrimaryLoanData] = useState<Record<string, {
    isDefaultCard: boolean | null; // null = not selected, true = default card created
  }>>({});

  // Current Second Loan cards state management (similar to property cards and primary loan cards)
  const [currentSecondLoanCards, setCurrentSecondLoanCards] = useState<string[]>([]);
  
  // Current Second Loan card data state
  const [currentSecondLoanData, setCurrentSecondLoanData] = useState<Record<string, {
    isDefaultCard: boolean | null; // null = not selected, true = default card created
  }>>({});

  // Current Third Loan cards state management (similar to property cards and other loan cards)
  const [currentThirdLoanCards, setCurrentThirdLoanCards] = useState<string[]>([]);
  
  // Current Third Loan card data state
  const [currentThirdLoanData, setCurrentThirdLoanData] = useState<Record<string, {
    isDefaultCard: boolean | null; // null = not selected, true = default card created
  }>>({});
  
  // Employment dates state for each card
  const [employmentDates, setEmploymentDates] = useState<Record<string, {
    startDate: string;
    endDate: string;
    isPresent: boolean;
    duration: string;
  }>>({});
  
  // Delete confirmation dialog state for Borrower Employer
  const [deleteEmployerDialog, setDeleteEmployerDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Borrower Second Employer
  const [deleteSecondEmployerDialog, setDeleteSecondEmployerDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Co-borrower Second Employer
  const [deleteCoBorrowerSecondEmployerDialog, setDeleteCoBorrowerSecondEmployerDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Primary Residence cards
  const [deletePrimaryResidenceDialog, setDeletePrimaryResidenceDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Second Home cards
  const [deleteSecondHomeDialog, setDeleteSecondHomeDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Investment Property cards
  const [deleteInvestmentDialog, setDeleteInvestmentDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Current Primary Loan cards
  const [deleteCurrentPrimaryLoanDialog, setDeleteCurrentPrimaryLoanDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Current Second Loan cards
  const [deleteCurrentSecondLoanDialog, setDeleteCurrentSecondLoanDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Current Third Loan cards
  const [deleteCurrentThirdLoanDialog, setDeleteCurrentThirdLoanDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Borrower Self-Employment
  const [deleteSelfEmploymentDialog, setDeleteSelfEmploymentDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Co-borrower Self-Employment
  const [deleteCoBorrowerSelfEmploymentDialog, setDeleteCoBorrowerSelfEmploymentDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Delete confirmation dialog state for Social Security Income
  const [deleteSocialSecurityDialog, setDeleteSocialSecurityDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // Delete confirmation dialog state for VA Disability Income
  const [deleteVaBenefitsDialog, setDeleteVaBenefitsDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // Delete confirmation dialog state for Disability Income
  const [deleteDisabilityDialog, setDeleteDisabilityDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // Delete confirmation dialog state for Co-Borrower Social Security Income
  const [deleteCoBorrowerSocialSecurityDialog, setDeleteCoBorrowerSocialSecurityDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // Delete confirmation dialog state for Co-Borrower VA Disability Income
  const [deleteCoBorrowerVaBenefitsDialog, setDeleteCoBorrowerVaBenefitsDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // Delete confirmation dialog state for Co-Borrower Disability Income
  const [deleteCoBorrowerDisabilityDialog, setDeleteCoBorrowerDisabilityDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // Delete confirmation dialog state for Co-Borrower Other Income
  const [deleteCoBorrowerOtherDialog, setDeleteCoBorrowerOtherDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // Co-Borrower Employer cards state management
  const [coBorrowerEmployerCards, setCoBorrowerEmployerCards] = useState<string[]>([]);
  
  // Delete confirmation dialog state for Co-Borrower Employer
  const [deleteCoBorrowerEmployerDialog, setDeleteCoBorrowerEmployerDialog] = useState<{
    isOpen: boolean;
    cardId: string;
  }>({ isOpen: false, cardId: '' });

  // Employment duration calculation function
  const calculateEmploymentDuration = (startDate: string, endDate: string, isPresent: boolean = false) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = isPresent ? new Date() : new Date(endDate);
    
    if (!endDate && !isPresent) return '';
    if (start > end) return '';
    
    // Calculate difference in months
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const daysDiff = end.getDate() - start.getDate();
    
    // Adjust for partial months
    const totalMonths = monthsDiff + (daysDiff >= 0 ? 0 : -1) + (daysDiff / 30);
    
    if (totalMonths < 1) {
      return `${totalMonths.toFixed(1)} months`;
    } else if (totalMonths < 12) {
      return `${totalMonths.toFixed(1)} months`;
    } else {
      const years = totalMonths / 12;
      return `${years.toFixed(1)} years`;
    }
  };
  
  // Subject property confirmation dialog state
  const [subjectConfirmDialog, setSubjectConfirmDialog] = useState<{
    isOpen: boolean;
    newSubjectPropertyId: string | null;
  }>({ isOpen: false, newSubjectPropertyId: null });

  // Removal confirmation dialog state
  const [confirmRemovalDialog, setConfirmRemovalDialog] = useState<{
    isOpen: boolean;
    type: 'co-borrower' | 'property' | 'property-type' | 'income' | 'prior-address' | 'third-loan' | 'second-loan' | 'current-loan' | 'prior-employer' | null;
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
  
  // Business description popup state
  const [businessDescriptionDialog, setBusinessDescriptionDialog] = useState<{
    isOpen: boolean;
    cardId: string | null;
    currentValue: string;
    type: 'borrower' | 'co-borrower';
  }>({ isOpen: false, cardId: null, currentValue: '', type: 'borrower' });
  
  const [businessDescriptionInput, setBusinessDescriptionInput] = useState('');
  
  // Tax preparer popup state
  const [taxPreparerDialog, setTaxPreparerDialog] = useState<{
    isOpen: boolean;
    cardId: string | null;
    currentValue: string;
    type: 'borrower' | 'co-borrower';
  }>({ isOpen: false, cardId: null, currentValue: '', type: 'borrower' });
  
  const [taxPreparerInput, setTaxPreparerInput] = useState('');

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
  const [coBorrowerEmployerCountyOptions, setCoBorrowerEmployerCountyOptions] = useState<Record<string, Array<{value: string, label: string}>>>({});
  const [coBorrowerPriorEmployerCountyOptions, setCoBorrowerPriorEmployerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [coBorrowerSecondEmployerCountyOptions, setCoBorrowerSecondEmployerCountyOptions] = useState<Record<string, Array<{value: string, label: string}>>>({});
  
  const [countyLookupLoading, setCountyLookupLoading] = useState<{
    borrower: boolean, 
    coBorrower: boolean, 
    borrowerPrior: boolean, 
    coBorrowerPrior: boolean,
    borrowerEmployer: boolean,
    borrowerPriorEmployer: boolean,
    coBorrowerEmployer: Record<string, boolean>,
    coBorrowerPriorEmployer: boolean,
    coBorrowerSecondEmployer: boolean
  }>({
    borrower: false, 
    coBorrower: false, 
    borrowerPrior: false, 
    coBorrowerPrior: false,
    borrowerEmployer: false,
    borrowerPriorEmployer: false,
    coBorrowerEmployer: {},
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

  // Current Primary Loan escrow toggle state (3-state cycle)
  const [currentLoanEscrowType, setCurrentLoanEscrowType] = useState<'tax-insurance' | 'insurance-only' | 'property-tax-only'>('tax-insurance');

  // Helper function to get Current Primary Loan escrow label and handle toggle cycling
  const getCurrentLoanEscrowLabel = () => {
    switch (currentLoanEscrowType) {
      case 'tax-insurance': return 'Tax & Insurance';
      case 'insurance-only': return 'Insurance Only';
      case 'property-tax-only': return 'Property Tax Only';
      default: return 'Tax & Insurance';
    }
  };

  const cycleCurrentLoanEscrowType = () => {
    setCurrentLoanEscrowType(current => {
      switch (current) {
        case 'tax-insurance': return 'insurance-only';
        case 'insurance-only': return 'property-tax-only';
        case 'property-tax-only': return 'tax-insurance';
        default: return 'tax-insurance';
      }
    });
  };

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      borrower: {
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        maritalStatus: 'Select',
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
        source: 'Select',
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
        // Multiple Main Employers (new structure for dynamic cards)
        employers: {
          default: {
            employerName: '',
            jobTitle: '',
            monthlyIncome: '',
            monthlyBonusIncome: '',
            annualBonusIncome: '',
            employmentType: 'Full-Time' as const,
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
            employmentVerificationPhone: '',
            isShowingEmploymentVerification: false,
            employerRemote: ''
          }
        },
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
        guidelineDTI: '',
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
        // Multiple Co-Borrower Employers (new structure for dynamic cards)
        employers: {
          default: {
            employerName: '',
            jobTitle: '',
            monthlyIncome: '',
            monthlyBonusIncome: '',
            annualBonusIncome: '',
            employmentType: 'Full-Time' as const,
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
            employmentVerificationPhone: '',
            isShowingEmploymentVerification: false,
            employerRemote: ''
          }
        },
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
        guidelineDTI: '',
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
      maritalStatus: 'Select',
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

  // Phone number formatting - allows complete erasure
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Allow empty string for complete erasure
    if (phoneNumber.length === 0) {
      return '';
    }
    
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

  // Auto-Sum Payment Fields Component - isolated calculation without parent re-renders
  const AutoSumPaymentFields = React.memo<{ control: any }>(({ control }) => {
    // Watch specific fields for auto-sum calculation - isolated from parent component
    const principalPayment = useWatch({ control, name: 'currentLoan.principalAndInterestPayment' }) || '';
    const escrowPayment = useWatch({ control, name: 'currentLoan.escrowPayment' }) || '';
    
    // Calculate total with useMemo for performance
    const totalPayment = useMemo(() => {
      const principal = parseMonetaryValue(principalPayment);
      const escrow = parseMonetaryValue(escrowPayment);
      return principal + escrow;
    }, [principalPayment, escrowPayment]);
    
    const totalPaymentFormatted = useMemo(() => 
      totalPayment > 0 
        ? `$${totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
        : '$0.00',
      [totalPayment]
    );

    return (
      <div className="space-y-2 md:col-span-2">
        <Label className="text-sm font-medium text-black">Total Monthly Payment</Label>
        <div className="flex items-center border border-input bg-background px-3 rounded-md">
          <span className="text-muted-foreground text-sm">$</span>
          <Input
            value={totalPaymentFormatted.replace('$', '')}
            readOnly
            className="border-0 bg-transparent px-2 focus-visible:ring-0"
            data-testid="text-total-current-loan-payment"
          />
        </div>
      </div>
    );
  });

  // Format percentage value for display only
  const formatPercentageDisplay = (value: string | number | undefined): string => {
    if (!value && value !== 0) return '';
    const numericValue = typeof value === 'string' ? value.replace(/[^0-9.]/g, '') : value.toString();
    if (numericValue === '' || numericValue === '0') return numericValue === '0' ? '0%' : '';
    return `${numericValue}%`;
  };

  // Parse percentage input and return raw numeric value
  const parsePercentageInput = (input: string): string => {
    const numericValue = input.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  // Format dollar value for display only
  const formatDollarDisplay = (value: string | number | undefined): string => {
    if (!value && value !== 0) return '';
    const numericValue = typeof value === 'string' ? value.replace(/[^0-9.]/g, '') : value.toString();
    if (numericValue === '' || numericValue === '0') return numericValue === '0' ? '$0' : '';
    return `$${numericValue}`;
  };

  // Parse dollar input and return raw numeric value
  const parseDollarInput = (input: string): string => {
    const numericValue = input.replace(/[^0-9.]/g, '');
    return numericValue;
  };


  // Sub-component for Current Loan 1 preview modal - read-only display with live updates
  interface CurrentLoanPreviewProps {
    control: any; // Control from parent useForm
  }

  const CurrentLoanPreview: React.FC<CurrentLoanPreviewProps> = ({ control }) => {
    // Use useWatch to get live data updates for preview
    const currentLenderName = useWatch({ control, name: 'currentLoan.currentLender' }) || '';
    const loanNumber = useWatch({ control, name: 'currentLoan.loanNumber' }) || '';
    const loanCategory = useWatch({ control, name: 'currentLoan.loanCategory' }) || '';
    const loanProgram = useWatch({ control, name: 'currentLoan.loanProgram' }) || '';
    const loanTerm = useWatch({ control, name: 'currentLoan.loanTerm' }) || '';
    const loanPurpose = useWatch({ control, name: 'currentLoan.loanPurpose' }) || '';
    const statementBalance = useWatch({ control, name: 'currentLoan.statementBalance.amount' }) || '';
    const currentRate = useWatch({ control, name: 'currentLoan.currentRate' }) || '';
    const principalPayment = useWatch({ control, name: 'currentLoan.principalAndInterestPayment' }) || '';
    const escrowPayment = useWatch({ control, name: 'currentLoan.escrowPayment' }) || '';
    const prepaymentPenalty = useWatch({ control, name: 'currentLoan.prepaymentPenalty' }) || '';
    const attachedToProperty = useWatch({ control, name: 'currentLoan.attachedToProperty' }) || '';
    
    // Get all properties to look up address by ID
    const properties = useWatch({ control, name: 'property.properties' }) || [];
    
    // Function to get property address display from property ID
    const getPropertyAddressDisplay = (propertyId: string) => {
      if (!propertyId || propertyId === 'Other' || propertyId === 'Select') {
        return propertyId || 'Not specified';
      }
      
      const property = properties.find((prop: any) => prop.id === propertyId);
      if (!property) return 'Property not found';
      
      const address = property.address;
      if (!address) return 'Address not specified';
      
      // Build address string from components (street address only)
      let addressParts = [];
      if (address.street) addressParts.push(address.street);
      if (address.unit) addressParts.push(`Unit ${address.unit}`);
      
      return addressParts.length > 0 ? addressParts.join(' ') : 'Address not specified';
    };

    // Format monetary values for display
    const formatCurrency = (value: string) => {
      if (!value || value.trim() === '') return '';
      const cleaned = value.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? value : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
      <Card className="border-l-4 border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500 transition-colors duration-200">
        <CardContent className="space-y-4">
          {/* Row 1: Lender Name, Loan Number, Loan Category, Loan Program */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Lender Name</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{currentLenderName || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Number</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanNumber || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Category</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanCategory || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Program</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanProgram || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Loan Term, Loan Purpose, Statement Balance, Current Rate */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Term</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanTerm || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Purpose</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanPurpose || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Statement Balance</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(statementBalance) || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Rate</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{currentRate ? `${currentRate}%` : 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Row 3: Payment Fields with Total */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Principal & Interest Payment</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(principalPayment) || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Escrow Payment</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(escrowPayment) || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Total Monthly Payment</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(useWatch({ control, name: 'currentLoan.totalMonthlyPayment' }) || '') || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Pre-Payment Penalty</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{prepaymentPenalty || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Attached to Property</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{getPropertyAddressDisplay(attachedToProperty)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Sub-component for Current Loan 2 preview modal - read-only display with live updates
  interface CurrentSecondLoanPreviewProps {
    control: any; // Control from parent useForm
  }

  const CurrentSecondLoanPreview: React.FC<CurrentSecondLoanPreviewProps> = ({ control }) => {
    // Use useWatch to get live data updates for preview
    const lenderName = useWatch({ control, name: 'secondLoan.lenderName' }) || '';
    const loanNumber = useWatch({ control, name: 'secondLoan.loanNumber' }) || '';
    const loanCategory = useWatch({ control, name: 'secondLoan.loanCategory' }) || '';
    const loanProgram = useWatch({ control, name: 'secondLoan.loanProgram' }) || '';
    const loanTerm = useWatch({ control, name: 'secondLoan.loanTerm' }) || '';
    const loanPurpose = useWatch({ control, name: 'secondLoan.loanPurpose' }) || '';
    const statementBalance = useWatch({ control, name: 'secondLoan.statementBalance.amount' }) || '';
    const currentRate = useWatch({ control, name: 'secondLoan.currentRate' }) || '';
    const principalPayment = useWatch({ control, name: 'secondLoan.principalAndInterestPayment' }) || '';
    const escrowPayment = useWatch({ control, name: 'secondLoan.escrowPayment' }) || '';
    const prepaymentPenalty = useWatch({ control, name: 'secondLoan.prepaymentPenalty' }) || '';
    const attachedToProperty = useWatch({ control, name: 'secondLoan.attachedToProperty' }) || '';

    // Format monetary values for display
    const formatCurrency = (value: string) => {
      if (!value || value.trim() === '') return '';
      const cleaned = value.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? value : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Total payment calculation component for second loan
    const TotalSecondLoanPayment = () => {
      const principalAmount = useWatch({ control, name: 'secondLoan.principalAndInterestPayment' }) || '';
      const escrowAmount = useWatch({ control, name: 'secondLoan.escrowPayment' }) || '';
      
      const principal = parseMonetaryValue(principalAmount);
      const escrow = parseMonetaryValue(escrowAmount);
      const total = principal + escrow;
      
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Total Monthly Payment</Label>
          <div className="p-2 bg-orange-50 rounded-md border border-orange-200">
            <span className="text-sm font-semibold text-orange-700">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      );
    };

    // Get all properties to look up address by ID
    const properties = useWatch({ control, name: 'property.properties' }) || [];
    
    // Function to get property address display from property ID
    const getPropertyAddressDisplay = (propertyId: string) => {
      if (!propertyId || propertyId === 'Other' || propertyId === 'Select') {
        return propertyId || 'Not specified';
      }
      
      const property = properties.find((prop: any) => prop.id === propertyId);
      if (!property) return 'Property not found';
      
      const address = property.address;
      if (!address) return 'Address not specified';
      
      // Build address string from components (street address only)
      let addressParts = [];
      if (address.street) addressParts.push(address.street);
      if (address.unit) addressParts.push(`Unit ${address.unit}`);
      
      return addressParts.length > 0 ? addressParts.join(' ') : 'Address not specified';
    };

    return (
      <Card className="border-l-4 border-l-purple-500 hover:border-purple-500 focus-within:border-purple-500 transition-colors duration-200">
        <CardContent className="space-y-4">
          {/* Row 1: Lender Name, Loan Number, Loan Category, Loan Program */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Lender Name</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{lenderName || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Number</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanNumber || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Category</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanCategory || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Program</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanProgram || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Loan Term, Loan Purpose, Statement Balance, Current Rate */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Term</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanTerm || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Purpose</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanPurpose || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Statement Balance</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(statementBalance) || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Rate</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{currentRate ? `${currentRate}%` : 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Row 3: Payment Fields with Total */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Principal & Interest Payment</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(principalPayment) || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Escrow Payment</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(escrowPayment) || 'Not specified'}</span>
              </div>
            </div>
            <div className="col-span-1">
              <TotalSecondLoanPayment />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Pre-Payment Penalty</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{prepaymentPenalty || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Attached to Property</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{getPropertyAddressDisplay(attachedToProperty)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Sub-component for Current Third Loan preview modal - read-only display with live updates
  interface CurrentThirdLoanPreviewProps {
    control: any; // Control from parent useForm
  }

  const CurrentThirdLoanPreview: React.FC<CurrentThirdLoanPreviewProps> = ({ control }) => {
    // Use useWatch to get live data updates for preview
    const lenderName = useWatch({ control, name: 'thirdLoan.lenderName' }) || '';
    const loanNumber = useWatch({ control, name: 'thirdLoan.loanNumber' }) || '';
    const loanCategory = useWatch({ control, name: 'thirdLoan.loanCategory' }) || '';
    const loanProgram = useWatch({ control, name: 'thirdLoan.loanProgram' }) || '';
    const loanTerm = useWatch({ control, name: 'thirdLoan.loanTerm' }) || '';
    const loanPurpose = useWatch({ control, name: 'thirdLoan.loanPurpose' }) || '';
    const statementBalance = useWatch({ control, name: 'thirdLoan.statementBalance.amount' }) || '';
    const currentRate = useWatch({ control, name: 'thirdLoan.currentRate' }) || '';
    const principalPayment = useWatch({ control, name: 'thirdLoan.principalAndInterestPayment' }) || '';
    const escrowPayment = useWatch({ control, name: 'thirdLoan.escrowPayment' }) || '';
    const prepaymentPenalty = useWatch({ control, name: 'thirdLoan.prepaymentPenalty' }) || '';
    const attachedToProperty = useWatch({ control, name: 'thirdLoan.attachedToProperty' }) || '';

    // Format monetary values for display
    const formatCurrency = (value: string) => {
      if (!value || value.trim() === '') return '';
      const cleaned = value.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? value : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Get all properties to look up address by ID
    const properties = useWatch({ control, name: 'property.properties' }) || [];
    
    // Function to get property address display from property ID
    const getPropertyAddressDisplay = (propertyId: string) => {
      if (!propertyId || propertyId === 'Other' || propertyId === 'Select') {
        return propertyId || 'Not specified';
      }
      
      const property = properties.find((prop: any) => prop.id === propertyId);
      if (!property) return 'Property not found';
      
      const address = property.address;
      if (!address) return 'Address not specified';
      
      // Build address string from components (street address only)
      let addressParts = [];
      if (address.street) addressParts.push(address.street);
      if (address.unit) addressParts.push(`Unit ${address.unit}`);
      
      return addressParts.length > 0 ? addressParts.join(' ') : 'Address not specified';
    };

    // Total payment calculation component for third loan
    const TotalThirdLoanPayment = () => {
      const principalAmount = useWatch({ control, name: 'thirdLoan.principalAndInterestPayment' }) || '';
      const escrowAmount = useWatch({ control, name: 'thirdLoan.escrowPayment' }) || '';
      
      const principal = parseMonetaryValue(principalAmount);
      const escrow = parseMonetaryValue(escrowAmount);
      const total = principal + escrow;
      
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Total Monthly Payment</Label>
          <div className="p-2 bg-orange-50 rounded-md border border-orange-200">
            <span className="text-sm font-semibold text-orange-700">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      );
    };

    return (
      <Card className="border-l-4 border-l-orange-500 hover:border-orange-500 focus-within:border-orange-500 transition-colors duration-200">
        <CardContent className="space-y-4">
          {/* Row 1: Lender Name, Loan Number, Loan Category, Loan Program */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Lender Name</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{lenderName || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Number</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanNumber || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Category</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanCategory || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Program</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanProgram || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Loan Term, Loan Purpose, Statement Balance, Current Rate */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Term</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanTerm || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Purpose</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanPurpose || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Statement Balance</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(statementBalance) || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Rate</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{currentRate ? `${currentRate}%` : 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Row 3: Payment Fields with Total */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Principal & Interest Payment</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(principalPayment) || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Escrow Payment</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(escrowPayment) || 'Not specified'}</span>
              </div>
            </div>
            <div className="col-span-1">
              <TotalThirdLoanPayment />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Pre-Payment Penalty</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{prepaymentPenalty || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Attached to Property</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{getPropertyAddressDisplay(attachedToProperty)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Sub-component for Additional Loan preview modal - generic for any additional loan
  interface AdditionalLoanPreviewProps {
    control: any; // Control from parent useForm
    loanId: string; // Dynamic loan ID (loan4, loan5, etc.)
  }

  const AdditionalLoanPreview: React.FC<AdditionalLoanPreviewProps> = ({ control, loanId }) => {
    // Use useWatch to get live data updates for preview
    const lenderName = useWatch({ control, name: `${loanId}.lenderName` }) || '';
    const loanNumber = useWatch({ control, name: `${loanId}.loanNumber` }) || '';
    const loanCategory = useWatch({ control, name: `${loanId}.loanCategory` }) || '';
    const loanProgram = useWatch({ control, name: `${loanId}.loanProgram` }) || '';
    const loanTerm = useWatch({ control, name: `${loanId}.loanTerm` }) || '';
    const loanPurpose = useWatch({ control, name: `${loanId}.loanPurpose` }) || '';
    const statementBalance = useWatch({ control, name: `${loanId}.statementBalance.amount` }) || '';
    const currentRate = useWatch({ control, name: `${loanId}.currentRate` }) || '';
    const principalPayment = useWatch({ control, name: `${loanId}.principalAndInterestPayment` }) || '';
    const escrowPayment = useWatch({ control, name: `${loanId}.escrowPayment` }) || '';
    const prepaymentPenalty = useWatch({ control, name: `${loanId}.prepaymentPenalty` }) || '';
    const attachedToProperty = useWatch({ control, name: `${loanId}.attachedToProperty` }) || '';

    // Format monetary values for display
    const formatCurrency = (value: string) => {
      if (!value || value.trim() === '') return '';
      const cleaned = value.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? value : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Total payment calculation component for additional loan
    const TotalAdditionalLoanPayment = () => {
      const principalAmount = useWatch({ control, name: `${loanId}.principalAndInterestPayment` }) || '';
      const escrowAmount = useWatch({ control, name: `${loanId}.escrowPayment` }) || '';
      
      const principal = parseMonetaryValue(principalAmount);
      const escrow = parseMonetaryValue(escrowAmount);
      const total = principal + escrow;
      
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Total Monthly Payment</Label>
          <div className="p-2 bg-purple-50 rounded-md border border-purple-200">
            <span className="text-sm font-semibold text-purple-700">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      );
    };

    // Generate display name from loan ID
    const displayName = loanId.charAt(0).toUpperCase() + loanId.slice(1).replace(/([A-Z])/g, ' $1');

    return (
      <Card className="border-l-4 border-l-purple-500 hover:border-purple-500 focus-within:border-purple-500 transition-colors duration-200">
        <CardHeader>
          <CardTitle>{displayName} Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Lender Name, Loan Number, Loan Category, Loan Program */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Lender Name</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{lenderName || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Number</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanNumber || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Category</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanCategory || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Program</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanProgram || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Loan Term, Loan Purpose, Statement Balance, Current Rate */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Term</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanTerm || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Purpose</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{loanPurpose || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Statement Balance</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(statementBalance) || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Loan Rate</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{currentRate ? `${currentRate}%` : 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Row 3: Principal & Interest Payment, Escrow Payment, Total Payment, Pre-Payment Penalty */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Principal & Interest Payment</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(principalPayment) || 'Not specified'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Escrow Payment</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{formatCurrency(escrowPayment) || 'Not specified'}</span>
              </div>
            </div>
            <div className="col-span-1">
              <TotalAdditionalLoanPayment />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Pre-Payment Penalty</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{prepaymentPenalty || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Row 4: Attached to Property */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Attached to Property</Label>
              <div className="p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{attachedToProperty || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calculate total monthly income - optimized with useMemo
  const borrowerIncomeData = form.watch('income');
  const borrowerEmployersData = form.watch('income.employers');
  
  // Watch all individual employer income fields dynamically
  const allEmployerIncomes = borrowerEmployerCards.map(cardId => 
    form.watch(getEmployerFieldPath(cardId, 'monthlyIncome'))
  );
  
  const totalBorrowerIncome = useMemo(() => {
    // Calculate total main employment income from all employer cards
    const employmentIncome = borrowerIncomeData?.employers && typeof borrowerIncomeData.employers === 'object'
      ? Object.values(borrowerIncomeData.employers).reduce((total, employer) => {
          return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
        }, 0)
      : parseMonetaryValue(borrowerIncomeData?.monthlyIncome); // fallback for backward compatibility
    
    // Calculate total second employment income from all cards
    const secondEmploymentIncome = borrowerIncomeData?.secondEmployers && typeof borrowerIncomeData.secondEmployers === 'object'
      ? Object.values(borrowerIncomeData.secondEmployers).reduce((total, employer) => {
          return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
        }, 0)
      : parseMonetaryValue(borrowerIncomeData?.secondMonthlyIncome); // fallback for backward compatibility
    
    // Calculate total self-employment income from all cards
    const businessIncome = borrowerIncomeData?.selfEmployers && typeof borrowerIncomeData.selfEmployers === 'object'
      ? Object.values(borrowerIncomeData.selfEmployers).reduce((total, business) => {
          return total + (business && typeof business === 'object' ? parseMonetaryValue(business.businessMonthlyIncome) : 0);
        }, 0)
      : parseMonetaryValue(borrowerIncomeData?.businessMonthlyIncome); // fallback for backward compatibility
    const pensionIncome = borrowerIncomeData?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
    const socialSecurityIncome = parseMonetaryValue(borrowerIncomeData?.socialSecurityMonthlyAmount);
    const vaBenefitsIncome = parseMonetaryValue(borrowerIncomeData?.vaBenefitsMonthlyAmount);
    const disabilityIncome = parseMonetaryValue(borrowerIncomeData?.disabilityMonthlyAmount);
    const otherIncome = parseMonetaryValue(borrowerIncomeData?.otherIncomeMonthlyAmount);
    
    const total = employmentIncome + secondEmploymentIncome + businessIncome + 
                  pensionIncome + socialSecurityIncome + vaBenefitsIncome + 
                  disabilityIncome + otherIncome;
    
    return total;
  }, [borrowerIncomeData, borrowerEmployersData, allEmployerIncomes]);
  
  const totalBorrowerIncomeFormatted = useMemo(() => 
    `$${totalBorrowerIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    [totalBorrowerIncome]
  );


  // Calculate co-borrower income - optimized with useMemo
  const coBorrowerIncomeData = form.watch('coBorrowerIncome');
  const coBorrowerEmployersData = form.watch('coBorrowerIncome.employers');
  
  // Watch all individual co-borrower employer income fields dynamically
  const allCoBorrowerEmployerIncomes = coBorrowerEmployerCards.map(cardId => 
    form.watch(getCoBorrowerEmployerFieldPath(cardId, 'monthlyIncome'))
  );
  
  const totalCoBorrowerIncome = useMemo(() => {
    // Calculate total co-borrower main employment income from all employer cards
    const employmentIncome = coBorrowerIncomeData?.employers && typeof coBorrowerIncomeData.employers === 'object'
      ? Object.values(coBorrowerIncomeData.employers).reduce((total, employer) => {
          return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
        }, 0)
      : parseMonetaryValue(coBorrowerIncomeData?.monthlyIncome); // fallback for backward compatibility
    // Calculate total co-borrower second employment income from all cards
    const secondEmploymentIncome = coBorrowerIncomeData?.secondEmployers && typeof coBorrowerIncomeData.secondEmployers === 'object'
      ? Object.values(coBorrowerIncomeData.secondEmployers).reduce((total, employer) => {
          return total + (employer && typeof employer === 'object' ? parseMonetaryValue(employer.monthlyIncome) : 0);
        }, 0)
      : parseMonetaryValue(coBorrowerIncomeData?.secondMonthlyIncome); // fallback for backward compatibility
    // Calculate total co-borrower self-employment income from all cards
    const businessIncome = coBorrowerIncomeData?.selfEmployers && typeof coBorrowerIncomeData.selfEmployers === 'object'
      ? Object.values(coBorrowerIncomeData.selfEmployers).reduce((total, business) => {
          return total + (business && typeof business === 'object' ? parseMonetaryValue(business.businessMonthlyIncome) : 0);
        }, 0)
      : parseMonetaryValue(coBorrowerIncomeData?.businessMonthlyIncome); // fallback for backward compatibility
    const pensionIncome = coBorrowerIncomeData?.pensions?.reduce((total, pension) => total + parseMonetaryValue(pension.monthlyAmount), 0) || 0;
    const socialSecurityIncome = parseMonetaryValue(coBorrowerIncomeData?.socialSecurityMonthlyAmount);
    const vaBenefitsIncome = parseMonetaryValue(coBorrowerIncomeData?.vaBenefitsMonthlyAmount);
    const disabilityIncome = parseMonetaryValue(coBorrowerIncomeData?.disabilityMonthlyAmount);
    const otherIncome = parseMonetaryValue(coBorrowerIncomeData?.otherIncomeMonthlyAmount);
    
    const total = employmentIncome + secondEmploymentIncome + businessIncome + 
                  pensionIncome + socialSecurityIncome + vaBenefitsIncome + 
                  disabilityIncome + otherIncome;
    
    return total;
  }, [coBorrowerIncomeData, coBorrowerEmployersData, allCoBorrowerEmployerIncomes]);
  
  const totalCoBorrowerIncomeFormatted = useMemo(() => 
    `$${totalCoBorrowerIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    [totalCoBorrowerIncome]
  );

  // Current Loan auto sum now handled by isolated TotalCurrentLoanPayment component

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

  // Animation effect for first-time page entry
  useEffect(() => {
    // Trigger animation on initial component mount
    const timer = setTimeout(() => {
      setShowEntryAnimation(false); // Turn off animation after first load
    }, 1000); // Animation lasts 1 second

    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs only once on mount

  // Bidirectional sync between Property Tab (Primary Residence) and Loan Tab (Current Loan 1)
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
    
    const cardClassName = borderVariant === 'blue' ? 'border-l-4 border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500 transition-colors duration-200' : '';
    
    return (
      <Card className={cardClassName}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Primary Loan</CardTitle>
              <div className="flex items-center gap-2">
                {/* Add Current Loan Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Generate a unique ID for the new loan card
                    const newLoanId = `current-primary-loan-${Date.now()}`;
                    
                    // Add to cards array
                    setCurrentPrimaryLoanCards(prev => [...(prev || []), newLoanId]);
                    
                    // Initialize data state for new card
                    setCurrentPrimaryLoanData(prev => ({ 
                      ...prev, 
                      [newLoanId]: { isDefaultCard: false } 
                    }));
                    
                    // Initialize per-card collapsible state (auto-expand like Property cards)
                    setCurrentLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
                    
                    // Auto-expand the loan card
                    setShowCurrentLoan(true);
                    
                    // Trigger animation for newly created loan card
                    setTimeout(() => {
                      setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: true }));
                      setTimeout(() => {
                        setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: false }));
                      }, 800);
                    }, 200);
                  }}
                  className="hover:bg-blue-500 hover:text-white"
                  data-testid="button-add-current-loan"
                  title="Add Current Loan"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Current Primary Loan
                </Button>
                
                {/* Remove Button */}
                {onRemove && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="hover:bg-red-500 hover:text-white"
                    data-testid="button-remove-current-loan"
                    title="Remove Current Loan"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Remove
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
                  <Label htmlFor={currentLenderBinding.id}>Lender Name</Label>
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
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
                  <Label htmlFor={`${idPrefix}currentLoan-prepaymentPenalty`}>Pre-Payment Penalty</Label>
                  <Select {...prepaymentPenaltyBinding}>
                    <SelectTrigger data-testid={prepaymentPenaltyBinding['data-testid']}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="Yes - see notes">Yes - see notes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
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
              </div>
              
              {/* Row 3: Principal & Interest Payment, Escrow Payment, Total Monthly Payment, Pre-Payment Penalty, Attached to Property */}
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="currentLoan-currentRate">Interest Rate</Label>
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
                
                <div className="space-y-2 md:col-span-2">
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
                
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="currentLoan-monthlyEscrow" className="text-sm">
                      {getCurrentLoanEscrowLabel()}
                    </Label>
                    <Switch
                      checked={currentLoanEscrowType === 'tax-insurance'} // On (blue) when Tax & Insurance is selected
                      onCheckedChange={cycleCurrentLoanEscrowType}
                      data-testid="toggle-currentLoan-escrow-type"
                      className="scale-[0.8]"
                    />
                  </div>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="currentLoan-monthlyEscrow"
                      {...form.register('currentLoan.escrowPayment')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-currentLoan-monthlyEscrow"
                    />
                  </div>
                </div>
                
                <AutoSumPaymentFields control={form.control} />
                
                <div className="space-y-2 md:col-span-3">
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
                      {(() => {
                        const properties = targetForm.watch('property.properties') || [];
                        return properties
                          .filter((property: any) => property.address?.street || property.use === 'primary') // Show properties with street addresses OR primary residence properties
                          .map((property: any, index: number) => {
                            const address = property.address;
                            const streetAddress = address?.street;
                            const city = address?.city;
                            const state = address?.state;
                            const zipCode = address?.zip;
                            
                            // Build display text using address components for uniqueness
                            let displayText;
                            
                            // Special handling for Primary Residence without address
                            if (property.use === 'primary' && !streetAddress) {
                              displayText = 'Primary Residence';
                            } else {
                              displayText = streetAddress || 'Property';
                              if (city && state) {
                                displayText += `, ${city}, ${state}`;
                              } else if (city) {
                                displayText += `, ${city}`;
                              } else if (state) {
                                displayText += `, ${state}`;
                              }
                              if (zipCode) {
                                displayText += ` ${zipCode}`;
                              }
                            }
                            
                            return (
                              <SelectItem key={`property-${property.id}`} value={property.id}>
                                {displayText}
                              </SelectItem>
                            );
                          });
                      })()}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  </div>
                </CardContent>
              </Card>
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
    onAddAdditionalLoan,
    formInstance 
  }: {
    idPrefix?: string;
    borderVariant: 'blue' | 'none';
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onRemove?: () => void;
    onAutoCopyAddress?: () => void;
    onAddAdditionalLoan?: () => void;
    formInstance?: any;
  }) => {
    const contextForm = useFormContext();
    const targetForm = formInstance || contextForm;
    const [isPropertyAddressOpen, setIsPropertyAddressOpen] = useState(false);
    
    const cardClassName = borderVariant === 'blue' ? 'border-l-4 border-l-purple-500 hover:border-purple-500 focus-within:border-purple-500 transition-colors duration-200' : '';
    
    return (
      <Card className={cardClassName}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Second Loan</CardTitle>
              <div className="flex items-center gap-2">
                {/* Add Current Second Loan Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Generate a unique ID for the new loan card
                    const newLoanId = `current-second-loan-${Date.now()}`;
                    
                    // Add to cards array
                    setCurrentSecondLoanCards(prev => [...(prev || []), newLoanId]);
                    
                    // Initialize data state for new card
                    setCurrentSecondLoanData(prev => ({ 
                      ...prev, 
                      [newLoanId]: { isDefaultCard: false } 
                    }));
                    
                    // Initialize per-card collapsible state (auto-expand like Property cards)
                    setSecondLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
                    
                    // Auto-expand the loan card
                    setShowSecondLoan(true);
                    
                    // Trigger animation for newly created loan card
                    setTimeout(() => {
                      setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: true }));
                      setTimeout(() => {
                        setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: false }));
                      }, 800);
                    }, 200);
                  }}
                  className="hover:bg-blue-500 hover:text-white"
                  data-testid="button-add-current-second-loan"
                  title="Add Current Second Loan"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Current Second Loan
                </Button>
                
                {/* Remove Button */}
                {onRemove && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="hover:bg-red-500 hover:text-white"
                    data-testid={`button-remove-second-loan-${idPrefix}`}
                    title="Remove Current Second Loan"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Remove
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
                    if (value && value !== 'Other' && value !== 'select') {
                      setTimeout(() => onAutoCopyAddress?.(), 100);
                    } else if (value === 'Other' || value === 'select') {
                      // Clear address fields for Other or empty
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
                      {(() => {
                        const properties = targetForm.watch('property.properties') || [];
                        return properties
                          .filter((property: any) => property.address?.street || property.use === 'primary') // Show properties with street addresses OR primary residence properties
                          .map((property: any, index: number) => {
                            const address = property.address;
                            const streetAddress = address?.street;
                            const city = address?.city;
                            const state = address?.state;
                            const zipCode = address?.zip;
                            
                            // Build display text using address components for uniqueness
                            let displayText;
                            
                            // Special handling for Primary Residence without address
                            if (property.use === 'primary' && !streetAddress) {
                              displayText = 'Primary Residence';
                            } else {
                              displayText = streetAddress || 'Property';
                              if (city && state) {
                                displayText += `, ${city}, ${state}`;
                              } else if (city) {
                                displayText += `, ${city}`;
                              } else if (state) {
                                displayText += `, ${state}`;
                              }
                              if (zipCode) {
                                displayText += ` ${zipCode}`;
                              }
                            }
                            
                            return (
                              <SelectItem key={`property-${property.id}`} value={property.id}>
                                {displayText}
                              </SelectItem>
                            );
                          });
                      })()}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // CurrentThirdLoanCard component - using Current Third Loan structure with multiple card support
  const CurrentThirdLoanCard = ({ 
    idPrefix = '', 
    borderVariant, 
    isOpen, 
    setIsOpen, 
    onRemove,
    onAutoCopyAddress,
    onAddAdditionalLoan,
    formInstance 
  }: {
    idPrefix?: string;
    borderVariant: 'blue' | 'none';
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onRemove?: () => void;
    onAutoCopyAddress?: () => void;
    onAddAdditionalLoan?: () => void;
    formInstance?: any;
  }) => {
    const contextForm = useFormContext();
    const targetForm = formInstance || contextForm;
    const [isPropertyAddressOpen, setIsPropertyAddressOpen] = useState(false);
    
    const cardClassName = 'border-l-4 border-l-orange-500 hover:border-orange-500 focus-within:border-orange-500 transition-colors duration-200';
    
    return (
      <Card className={cardClassName}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Third Loan</CardTitle>
              <div className="flex items-center gap-2">
                {/* Add Current Loan Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Generate a unique ID for the new loan card
                    const newLoanId = `current-third-loan-${Date.now()}`;
                    
                    // Add to cards array
                    setCurrentThirdLoanCards(prev => [...(prev || []), newLoanId]);
                    
                    // Initialize data state for new card
                    setCurrentThirdLoanData(prev => ({ 
                      ...prev, 
                      [newLoanId]: { isDefaultCard: false } 
                    }));
                    
                    // Initialize per-card collapsible state (auto-expand like Property cards)
                    setThirdLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
                    
                    // Auto-expand the loan card
                    setShowThirdLoan(true);
                    
                    // Trigger animation for newly created loan card
                    setTimeout(() => {
                      setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: true }));
                      setTimeout(() => {
                        setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: false }));
                      }, 800);
                    }, 200);
                  }}
                  className="hover:bg-blue-500 hover:text-white"
                  data-testid="button-add-current-loan"
                  title="Add Current Loan"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Current Primary Loan
                </Button>
                
                {/* Remove Button */}
                {onRemove && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="hover:bg-red-500 hover:text-white"
                    data-testid="button-remove-current-loan"
                    title="Remove Current Loan"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
                
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-orange-500 hover:text-white" 
                    data-testid={`button-toggle-third-loan-${idPrefix}`}
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
                  <Label htmlFor="thirdLoan-lenderName">Lender Name</Label>
                  <Input
                    id="thirdLoan-lenderName"
                    {...targetForm.register('thirdLoan.lenderName')}
                    placeholder="Enter lender name"
                    data-testid="input-thirdLoan-lenderName"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thirdLoan-loanNumber">Loan Number</Label>
                  <Input
                    id="thirdLoan-loanNumber"
                    {...targetForm.register('thirdLoan.loanNumber')}
                    placeholder="Enter loan number"
                    data-testid="input-thirdLoan-loanNumber"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thirdLoan-loanCategory">Loan Category</Label>
                  <Select value={targetForm.watch('thirdLoan.loanCategory') || ''} onValueChange={(value) => targetForm.setValue('thirdLoan.loanCategory', value)}>
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
                  <Select value={targetForm.watch('thirdLoan.loanProgram') || ''} onValueChange={(value) => targetForm.setValue('thirdLoan.loanProgram', value)}>
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
                  <Select value={targetForm.watch('thirdLoan.loanDuration') || ''} onValueChange={(value) => targetForm.setValue('thirdLoan.loanDuration', value)}>
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
              
              {/* Row 2: Current Balance, Current Rate, Monthly Payment, Pre-payment Penalty, Attached to Property */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="thirdLoan-currentBalance">Current Balance</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id="thirdLoan-currentBalance"
                      {...targetForm.register('thirdLoan.currentBalance')}
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
                      {...targetForm.register('thirdLoan.currentRate')}
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
                      {...targetForm.register('thirdLoan.monthlyPayment')}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid="input-thirdLoan-monthlyPayment"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thirdLoan-prepaymentPenalty">Pre-payment Penalty</Label>
                  <Select value={targetForm.watch('thirdLoan.prepaymentPenalty') || ''} onValueChange={(value: 'Yes - see notes' | 'No') => targetForm.setValue('thirdLoan.prepaymentPenalty', value)}>
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
                  <Select value={targetForm.watch('thirdLoan.attachedToProperty') || ''} onValueChange={(value) => {
                    targetForm.setValue('thirdLoan.attachedToProperty', value as any);
                    if (['Home Purchase', 'Primary Residence', 'Second Home', 'Investment Property'].includes(value)) {
                      setTimeout(() => {
                        if (onAutoCopyAddress) onAutoCopyAddress();
                      }, 100);
                    } else if (value === 'Other' || value === '' || value === 'select') {
                      // Clear address fields for Other, empty, or select
                      targetForm.setValue('thirdLoan.propertyAddress.street', '');
                      targetForm.setValue('thirdLoan.propertyAddress.unit', '');
                      targetForm.setValue('thirdLoan.propertyAddress.city', '');
                      targetForm.setValue('thirdLoan.propertyAddress.state', '');
                      targetForm.setValue('thirdLoan.propertyAddress.zipCode', '');
                      targetForm.setValue('thirdLoan.propertyAddress.county', '');
                    }
                  }}>
                    <SelectTrigger data-testid="select-thirdLoan-attachedToProperty">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="Home Purchase">Home Purchase</SelectItem>
                      <SelectItem value="Primary Residence">Primary Residence</SelectItem>
                      <SelectItem value="Second Home">Second Home</SelectItem>
                      <SelectItem value="Investment Property">Investment Property</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Conditional Property Address Fields - Show when Attached to Property is selected */}
              {targetForm.watch('thirdLoan.attachedToProperty') && targetForm.watch('thirdLoan.attachedToProperty') !== '' && ['Home Purchase', 'Primary Residence', 'Second Home', 'Investment Property', 'Other'].includes(targetForm.watch('thirdLoan.attachedToProperty') || '') && (
                <div className="mt-4 p-4 border-t border-gray-200">
                  <Collapsible open={isPropertyAddressOpen} onOpenChange={setIsPropertyAddressOpen}>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Property Address ({targetForm.watch('thirdLoan.attachedToProperty')})
                      </Label>
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="hover:bg-orange-500 hover:text-white"
                          data-testid="button-toggle-property-address-third-loan"
                          title={isPropertyAddressOpen ? 'Minimize' : 'Expand'}
                        >
                          {isPropertyAddressOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="space-y-2 md:col-span-4">
                          <Label htmlFor="thirdLoan-property-street">Street Address</Label>
                          <Input
                            id="thirdLoan-property-street"
                            {...targetForm.register('thirdLoan.propertyAddress.street')}
                            data-testid="input-thirdLoan-property-street"
                            readOnly={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="thirdLoan-property-unit">Unit/Apt</Label>
                          <Input
                            id="thirdLoan-property-unit"
                            {...targetForm.register('thirdLoan.propertyAddress.unit')}
                            data-testid="input-thirdLoan-property-unit"
                            readOnly={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="thirdLoan-property-city">City</Label>
                          <Input
                            id="thirdLoan-property-city"
                            {...targetForm.register('thirdLoan.propertyAddress.city')}
                            data-testid="input-thirdLoan-property-city"
                            readOnly={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="thirdLoan-property-state">State</Label>
                          <Select
                            value={targetForm.watch('thirdLoan.propertyAddress.state') || ''}
                            onValueChange={(value) => targetForm.setValue('thirdLoan.propertyAddress.state', value)}
                            disabled={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other'}
                          >
                            <SelectTrigger
                              data-testid="select-thirdLoan-property-state"
                              className={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                            >
                              <SelectValue placeholder="Select" />
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
                            {...targetForm.register('thirdLoan.propertyAddress.zipCode')}
                            data-testid="input-thirdLoan-property-zipCode"
                            readOnly={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="thirdLoan-property-county">County</Label>
                          <Input
                            id="thirdLoan-property-county"
                            {...targetForm.register('thirdLoan.propertyAddress.county')}
                            data-testid="input-thirdLoan-property-county"
                            readOnly={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other'}
                            className={targetForm.watch('thirdLoan.attachedToProperty') !== 'Other' ? 'bg-gray-50' : ''}
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
    );
  };

  // AdditionalLoanCard component - using Current Loan 2 structure
  const AdditionalLoanCard = ({ 
    loanId,
    loanNumber,
    isOpen, 
    setIsOpen, 
    onRemove,
    onAddAdditionalLoan,
    onAutoCopyAddress,
    formInstance 
  }: {
    loanId: string;
    loanNumber: number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onRemove?: () => void;
    onAddAdditionalLoan?: () => void;
    onAutoCopyAddress?: () => void;
    formInstance?: any;
  }) => {
    const { toast } = useToast();
    const contextForm = useFormContext();
    const targetForm = formInstance || contextForm;
    const [isPropertyAddressOpen, setIsPropertyAddressOpen] = useState(false);
    
    const cardClassName = 'border-l-4 border-l-orange-500 hover:border-orange-500 focus-within:border-orange-500 transition-colors duration-200';
    
    return (
      <Card className={cardClassName}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{loanNumber === 3 ? 'Current Third Loan' : `Current Loan ${loanNumber}`}</CardTitle>
              <div className="flex items-center gap-2">
                {onRemove && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="hover:bg-red-500 hover:text-white"
                    data-testid={`button-remove-additional-loan-${loanId}`}
                    title="Delete"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-orange-500 hover:text-white" 
                    data-testid={`button-toggle-additional-loan-${loanId}`}
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
              {/* Row 1: Lender Name, Loan Number, Loan Category, Loan Program, Loan Duration */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${loanId}-lenderName`}>Lender Name</Label>
                  <Input
                    id={`${loanId}-lenderName`}
                    {...targetForm.register(`${loanId}.lenderName`)}
                    placeholder="Enter lender name"
                    data-testid={`input-${loanId}-lenderName`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${loanId}-loanNumber`}>Loan Number</Label>
                  <Input
                    id={`${loanId}-loanNumber`}
                    {...targetForm.register(`${loanId}.loanNumber`)}
                    placeholder="Enter loan number"
                    data-testid={`input-${loanId}-loanNumber`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${loanId}-loanCategory`}>Loan Category</Label>
                  <Select value={targetForm.watch(`${loanId}.loanCategory`) || ''} onValueChange={(value) => targetForm.setValue(`${loanId}.loanCategory`, value)}>
                    <SelectTrigger data-testid={`select-${loanId}-loanCategory`}>
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
                  <Label htmlFor={`${loanId}-loanProgram`}>Loan Term</Label>
                  <Select value={targetForm.watch(`${loanId}.loanProgram`) || ''} onValueChange={(value) => targetForm.setValue(`${loanId}.loanProgram`, value)}>
                    <SelectTrigger data-testid={`select-${loanId}-loanProgram`}>
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
                  <Label htmlFor={`${loanId}-loanDuration`}>Loan Duration</Label>
                  <Select value={targetForm.watch(`${loanId}.loanDuration`) || ''} onValueChange={(value) => targetForm.setValue(`${loanId}.loanDuration`, value)}>
                    <SelectTrigger data-testid={`select-${loanId}-loanDuration`}>
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
                  <Label htmlFor={`${loanId}-currentBalance`}>Current Balance</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id={`${loanId}-currentBalance`}
                      {...targetForm.register(`${loanId}.currentBalance`)}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid={`input-${loanId}-currentBalance`}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${loanId}-currentRate`}>Current Rate</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <Input
                      id={`${loanId}-currentRate`}
                      {...targetForm.register(`${loanId}.currentRate`)}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid={`input-${loanId}-currentRate`}
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${loanId}-monthlyPayment`}>Monthly Payment</Label>
                  <div className="flex items-center border border-input bg-background px-3 rounded-md">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      id={`${loanId}-monthlyPayment`}
                      {...targetForm.register(`${loanId}.monthlyPayment`)}
                      placeholder="0.00"
                      className="border-0 bg-transparent px-2 focus-visible:ring-0"
                      data-testid={`input-${loanId}-monthlyPayment`}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${loanId}-prepaymentPenalty`}>Pre-payment Penalty</Label>
                  <Select value={targetForm.watch(`${loanId}.prepaymentPenalty`) || ''} onValueChange={(value: 'Yes - see notes' | 'No') => targetForm.setValue(`${loanId}.prepaymentPenalty`, value)}>
                    <SelectTrigger data-testid={`select-${loanId}-prepaymentPenalty`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes - see notes">Yes - see notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${loanId}-attachedToProperty`}>Attached to Property</Label>
                  <Select value={targetForm.watch(`${loanId}.attachedToProperty`) || ''} onValueChange={(value) => {
                    targetForm.setValue(`${loanId}.attachedToProperty`, value as any);
                    if (value && value !== 'Other' && value !== 'select') {
                      setTimeout(() => onAutoCopyAddress?.(), 100);
                    } else if (value === 'Other' || value === 'select') {
                      // Clear address fields for Other or empty
                      targetForm.setValue(`${loanId}.propertyAddress.street`, '');
                      targetForm.setValue(`${loanId}.propertyAddress.unit`, '');
                      targetForm.setValue(`${loanId}.propertyAddress.city`, '');
                      targetForm.setValue(`${loanId}.propertyAddress.state`, '');
                      targetForm.setValue(`${loanId}.propertyAddress.zipCode`, '');
                      targetForm.setValue(`${loanId}.propertyAddress.county`, '');
                    }
                  }}>
                    <SelectTrigger data-testid={`select-${loanId}-attachedToProperty`}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">Select</SelectItem>
                      {(() => {
                        const properties = targetForm.watch('property.properties') || [];
                        return properties
                          .filter((property: any) => property.address?.street || property.use === 'primary') // Show properties with street addresses OR primary residence properties
                          .map((property: any, index: number) => {
                            const address = property.address;
                            const streetAddress = address?.street;
                            const city = address?.city;
                            const state = address?.state;
                            const zipCode = address?.zip;
                            
                            // Build display text using address components for uniqueness
                            let displayText;
                            
                            // Special handling for Primary Residence without address
                            if (property.use === 'primary' && !streetAddress) {
                              displayText = 'Primary Residence';
                            } else {
                              displayText = streetAddress || 'Property';
                              if (city && state) {
                                displayText += `, ${city}, ${state}`;
                              } else if (city) {
                                displayText += `, ${city}`;
                              } else if (state) {
                                displayText += `, ${state}`;
                              }
                              if (zipCode) {
                                displayText += ` ${zipCode}`;
                              }
                            }
                            
                            return (
                              <SelectItem key={`property-${property.id}`} value={property.id}>
                                {displayText}
                              </SelectItem>
                            );
                          });
                      })()}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              
              {/* Conditional Property Address Fields - Show when Attached to Property is selected */}
              {targetForm.watch(`${loanId}.attachedToProperty`) && targetForm.watch(`${loanId}.attachedToProperty`) !== 'select' && (
                <div className="mt-4 p-4 border-t border-gray-200">
                  <Collapsible open={isPropertyAddressOpen} onOpenChange={setIsPropertyAddressOpen}>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Property Address ({(() => {
                          const attachedPropertyId = targetForm.watch(`${loanId}.attachedToProperty`);
                          if (attachedPropertyId === 'Other') return 'Other';
                          const properties = targetForm.watch('property.properties') || [];
                          const selectedProperty = properties.find((p: any) => p.id === attachedPropertyId);
                          return selectedProperty?.address?.street || attachedPropertyId;
                        })()})
                      </Label>
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="hover:bg-orange-500 hover:text-white"
                          data-testid={`button-toggle-property-address-${loanId}`}
                        >
                          {isPropertyAddressOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="space-y-2 md:col-span-3">
                          <Label htmlFor={`${loanId}-property-street`}>Street Address</Label>
                          <Input
                            id={`${loanId}-property-street`}
                            {...targetForm.register(`${loanId}.propertyAddress.street`)}
                            data-testid={`input-${loanId}-property-street`}
                            readOnly={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other'}
                            className={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other' ? 'bg-gray-50' : ''}
                            onClick={(e) => {
                              if (targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other') {
                                e.preventDefault();
                                toast({
                              title: "Address is read-only",
                              description: "Please edit property address information using the Property tab",
                              variant: "default",
                            });
                              }
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor={`${loanId}-property-unit`}>Unit/Apt</Label>
                          <Input
                            id={`${loanId}-property-unit`}
                            {...targetForm.register(`${loanId}.propertyAddress.unit`)}
                            data-testid={`input-${loanId}-property-unit`}
                            readOnly={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other'}
                            className={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other' ? 'bg-gray-50' : ''}
                            onClick={(e) => {
                              if (targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other') {
                                e.preventDefault();
                                toast({
                              title: "Address is read-only",
                              description: "Please edit property address information using the Property tab",
                              variant: "default",
                            });
                              }
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`${loanId}-property-city`}>City</Label>
                          <Input
                            id={`${loanId}-property-city`}
                            {...targetForm.register(`${loanId}.propertyAddress.city`)}
                            data-testid={`input-${loanId}-property-city`}
                            readOnly={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other'}
                            className={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other' ? 'bg-gray-50' : ''}
                            onClick={(e) => {
                              if (targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other') {
                                e.preventDefault();
                                toast({
                              title: "Address is read-only",
                              description: "Please edit property address information using the Property tab",
                              variant: "default",
                            });
                              }
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor={`${loanId}-property-state`}>State</Label>
                          <Select
                            value={targetForm.watch(`${loanId}.propertyAddress.state`) || ''}
                            onValueChange={(value) => targetForm.setValue(`${loanId}.propertyAddress.state`, value)}
                            disabled={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other'}
                          >
                            <SelectTrigger
                              data-testid={`select-${loanId}-property-state`}
                              className={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other' ? 'bg-gray-50' : ''}
                              onClick={(e) => {
                                if (targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other') {
                                  e.preventDefault();
                                  toast({
                              title: "Address is read-only",
                              description: "Please edit property address information using the Property tab",
                              variant: "default",
                            });
                                }
                              }}
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
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor={`${loanId}-property-zipCode`}>ZIP Code</Label>
                          <Input
                            id={`${loanId}-property-zipCode`}
                            {...targetForm.register(`${loanId}.propertyAddress.zipCode`)}
                            data-testid={`input-${loanId}-property-zipCode`}
                            readOnly={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other'}
                            className={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other' ? 'bg-gray-50' : ''}
                            onClick={(e) => {
                              if (targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other') {
                                e.preventDefault();
                                toast({
                              title: "Address is read-only",
                              description: "Please edit property address information using the Property tab",
                              variant: "default",
                            });
                              }
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor={`${loanId}-property-county`}>County</Label>
                          <Input
                            id={`${loanId}-property-county`}
                            {...targetForm.register(`${loanId}.propertyAddress.county`)}
                            data-testid={`input-${loanId}-property-county`}
                            readOnly={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other'}
                            className={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other' ? 'bg-gray-50' : ''}
                            onClick={(e) => {
                              if (targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other') {
                                e.preventDefault();
                                toast({
                              title: "Address is read-only",
                              description: "Please edit property address information using the Property tab",
                              variant: "default",
                            });
                              }
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`${loanId}-property-type`}>Property Type</Label>
                          <Input
                            id={`${loanId}-property-type`}
                            {...targetForm.register(`${loanId}.propertyAddress.propertyType`)}
                            data-testid={`input-${loanId}-property-type`}
                            readOnly={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other'}
                            className={targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other' ? 'bg-gray-50' : ''}
                            onClick={(e) => {
                              if (targetForm.watch(`${loanId}.attachedToProperty`) !== 'Other') {
                                e.preventDefault();
                                toast({
                              title: "Address is read-only",
                              description: "Please edit property address information using the Property tab",
                              variant: "default",
                            });
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
              
              {/* Add Additional Loan Button - positioned at bottom right */}
              {onAddAdditionalLoan && (
                <div className="flex justify-end mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={onAddAdditionalLoan}
                    className="hover:bg-orange-500 hover:text-white hover:border-orange-500 no-default-hover-elevate no-default-active-elevate"
                    data-testid={`button-add-additional-loan-${loanId}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Additional Loan
                  </Button>
                </div>
              )}
              
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
              <CardTitle>Current Loan 1 (Read-only)</CardTitle>
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
                  <Label>Lender Name</Label>
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
    const currentPensions = form.watch('income.pensions') || [];
    const pension = currentPensions.find(p => p.id === pensionId);
    
    // Special handling for default pension card
    if (pension?.isDefault) {
      setConfirmRemovalDialog({
        isOpen: true,
        type: 'income',
        itemId: pensionId,
        itemType: 'default pension',
        onConfirm: () => {
          // Remove ALL pension cards and uncheck the pension checkbox
          form.setValue('income.pensions', []);
          // Uncheck pension checkbox when default card is removed
          form.setValue('income.incomeTypes.pension', false);
          setConfirmRemovalDialog({ isOpen: false, type: null });
        }
      });
    } else {
      // Normal removal for additional pension cards
      setConfirmRemovalDialog({
        isOpen: true,
        type: 'income',
        itemId: pensionId,
        itemType: 'pension',
        onConfirm: () => {
          const updatedPensions = currentPensions.filter(pension => pension.id !== pensionId);
          form.setValue('income.pensions', updatedPensions);
          setConfirmRemovalDialog({ isOpen: false, type: null });
        }
      });
    }
  };

  // Function to handle removal of default pension card from header
  const removeDefaultBorrowerPension = () => {
    const currentPensions = form.watch('income.pensions') || [];
    const hasDefaultCard = currentPensions.some(p => p.isDefault);
    
    if (hasDefaultCard) {
      setConfirmRemovalDialog({
        isOpen: true,
        type: 'income',
        itemType: 'default pension',
        onConfirm: () => {
          // Remove ALL pension cards and uncheck the pension checkbox
          form.setValue('income.pensions', []);
          // Uncheck pension checkbox when default card is removed
          form.setValue('income.incomeTypes.pension', false);
          setConfirmRemovalDialog({ isOpen: false, type: null });
        }
      });
    }
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
    const currentPensions = form.watch('coBorrowerIncome.pensions') || [];
    const pension = currentPensions.find(p => p.id === pensionId);
    
    // Special handling for default pension card
    if (pension?.isDefault) {
      setConfirmRemovalDialog({
        isOpen: true,
        type: 'income',
        itemId: pensionId,
        itemType: 'default co-borrower pension',
        onConfirm: () => {
          // Remove ALL co-borrower pension cards and uncheck the pension checkbox
          form.setValue('coBorrowerIncome.pensions', []);
          // Uncheck pension checkbox when default card is removed
          form.setValue('coBorrowerIncome.incomeTypes.pension', false);
          setConfirmRemovalDialog({ isOpen: false, type: null });
        }
      });
    } else {
      // Normal removal for additional pension cards
      setConfirmRemovalDialog({
        isOpen: true,
        type: 'income',
        itemId: pensionId,
        itemType: 'co-borrower pension',
        onConfirm: () => {
          const updatedPensions = currentPensions.filter(pension => pension.id !== pensionId);
          form.setValue('coBorrowerIncome.pensions', updatedPensions);
          setConfirmRemovalDialog({ isOpen: false, type: null });
        }
      });
    }
  };

  // Function to handle removal of default co-borrower pension card from header
  const removeDefaultCoBorrowerPension = () => {
    const currentPensions = form.watch('coBorrowerIncome.pensions') || [];
    const hasDefaultCard = currentPensions.some(p => p.isDefault);
    
    if (hasDefaultCard) {
      setConfirmRemovalDialog({
        isOpen: true,
        type: 'income',
        itemType: 'default co-borrower pension',
        onConfirm: () => {
          // Remove ALL co-borrower pension cards and uncheck the pension checkbox
          form.setValue('coBorrowerIncome.pensions', []);
          // Uncheck pension checkbox when default card is removed
          form.setValue('coBorrowerIncome.incomeTypes.pension', false);
          setConfirmRemovalDialog({ isOpen: false, type: null });
        }
      });
    }
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

  // Business description popup handlers
  const openBusinessDescriptionDialog = (cardId: string) => {
    const currentValue = form.getValues('income.businessDescription') || '';
    setBusinessDescriptionInput(currentValue);
    setBusinessDescriptionDialog({
      isOpen: true,
      cardId,
      currentValue,
      type: 'borrower'
    });
  };

  const closeBusinessDescriptionDialog = () => {
    setBusinessDescriptionDialog({ isOpen: false, cardId: null, currentValue: '', type: 'borrower' });
    setBusinessDescriptionInput('');
  };

  const saveBusinessDescription = () => {
    if (businessDescriptionDialog.cardId) {
      form.setValue('income.businessDescription', businessDescriptionInput, { shouldDirty: true });
      closeBusinessDescriptionDialog();
    }
  };

  // Co-borrower Business description popup handlers
  const openCoBorrowerBusinessDescriptionDialog = (cardId: string) => {
    const currentValue = form.getValues('coBorrowerIncome.businessDescription') || '';
    setBusinessDescriptionInput(currentValue);
    setBusinessDescriptionDialog({
      isOpen: true,
      cardId,
      currentValue,
      type: 'co-borrower'
    });
  };

  const saveCoBorrowerBusinessDescription = () => {
    if (businessDescriptionDialog.cardId) {
      form.setValue('coBorrowerIncome.businessDescription', businessDescriptionInput, { shouldDirty: true });
      closeBusinessDescriptionDialog();
    }
  };

  // Tax preparer popup handlers
  const openTaxPreparerDialog = (cardId: string) => {
    const currentValue = form.getValues('income.taxesPreparedBy') || '';
    setTaxPreparerInput(currentValue);
    setTaxPreparerDialog({
      isOpen: true,
      cardId,
      currentValue,
      type: 'borrower'
    });
  };

  const closeTaxPreparerDialog = () => {
    setTaxPreparerDialog({ isOpen: false, cardId: null, currentValue: '', type: 'borrower' });
    setTaxPreparerInput('');
  };

  const saveTaxPreparer = () => {
    if (taxPreparerDialog.cardId) {
      // Clear the value if "Select" is chosen, otherwise save the value
      const valueToSave = taxPreparerInput === 'Select' ? '' : taxPreparerInput;
      form.setValue('income.taxesPreparedBy', valueToSave, { shouldDirty: true });
      closeTaxPreparerDialog();
    }
  };

  // Co-borrower Tax preparer popup handlers
  const openCoBorrowerTaxPreparerDialog = (cardId: string) => {
    const currentValue = form.getValues('coBorrowerIncome.taxesPreparedBy') || '';
    setTaxPreparerInput(currentValue);
    setTaxPreparerDialog({
      isOpen: true,
      cardId,
      currentValue,
      type: 'co-borrower'
    });
  };

  const saveCoBorrowerTaxPreparer = () => {
    if (taxPreparerDialog.cardId) {
      // Clear the value if "Select" is chosen, otherwise save the value
      const valueToSave = taxPreparerInput === 'Select' ? '' : taxPreparerInput;
      form.setValue('coBorrowerIncome.taxesPreparedBy', valueToSave, { shouldDirty: true });
      closeTaxPreparerDialog();
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
  const addProperty = (use: 'primary' | 'second-home' | 'investment' | 'home-purchase') => {
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
    // Set initial collapsible state for new property - expand all property types by default
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

  // Helper function to handle property type changes with card management (similar to handleIncomeTypeChange)
  const handlePropertyTypeChange = (checked: boolean, type: 'primary' | 'second-home' | 'investment' | 'home-purchase') => {
    if (!checked) {
      // Special handling for primary residence and second home - don't allow unchecking if cards already exist
      if (type === 'primary') {
        const hasCards = (primaryResidenceCards || []).length > 0;
        
        if (hasCards) {
          // Cards already exist, prevent unchecking - all removal must be done through card buttons
          return;
        }
      } else if (type === 'second-home') {
        const hasCards = (secondHomeCards || []).length > 0;
        
        if (hasCards) {
          // Cards already exist, prevent unchecking - all removal must be done through card buttons
          return;
        }
      } else if (type === 'investment') {
        const hasCards = (investmentCards || []).length > 0;
        
        if (hasCards) {
          // Cards already exist, prevent unchecking - all removal must be done through card buttons
          return;
        }
      }
      
      // For now, still allow unchecking other property types through the old system
      removePropertyType(type);
    } else {
      // When checking, auto-create default property card
      if (type === 'primary') {
        const hasCards = (primaryResidenceCards || []).length > 0;
        
        // Only create default property card if none exist yet
        if (!hasCards) {
          // Create entry in main form's property array
          addProperty('primary');
          
          // Get the ID of the newly created property
          setTimeout(() => {
            const currentProperties = form.watch('property.properties') || [];
            const newProperty = currentProperties.find(p => p.use === 'primary');
            const newPropertyId = newProperty?.id;
            
            if (newPropertyId) {
              setPrimaryResidenceCards([newPropertyId]);
              
              // Initialize data state for default card
              setPrimaryResidenceData(prev => ({ 
                ...prev, 
                [newPropertyId]: { isSubjectProperty: null } 
              }));
              
              // Auto-expand the property card
              setPropertyCardStates(prev => ({ ...prev, [newPropertyId]: true }));
              
              // Trigger animation for newly created property card
              setTimeout(() => {
                setShowSubjectPropertyAnimation(prev => ({ ...prev, [newPropertyId]: true }));
                setTimeout(() => {
                  setShowSubjectPropertyAnimation(prev => ({ ...prev, [newPropertyId]: false }));
                }, 800);
              }, 200);
            }
          }, 50); // Small delay to ensure form state is updated
        }
      } else if (type === 'second-home') {
        const hasCards = (secondHomeCards || []).length > 0;
        
        // Only create default property card if none exist yet
        if (!hasCards) {
          // Create entry in main form's property array
          addProperty('second-home');
          
          // Get the ID of the newly created property
          setTimeout(() => {
            const currentProperties = form.watch('property.properties') || [];
            const newProperty = currentProperties.find(p => p.use === 'second-home');
            const newPropertyId = newProperty?.id;
            
            if (newPropertyId) {
              setSecondHomeCards([newPropertyId]);
              
              // Initialize data state for default card
              setSecondHomeData(prev => ({ 
                ...prev, 
                [newPropertyId]: { isSubjectProperty: null } 
              }));
              
              // Auto-expand the property card
              setPropertyCardStates(prev => ({ ...prev, [newPropertyId]: true }));
              
              // Trigger animation for newly created property card
              setTimeout(() => {
                setShowSubjectPropertyAnimation(prev => ({ ...prev, [newPropertyId]: true }));
                setTimeout(() => {
                  setShowSubjectPropertyAnimation(prev => ({ ...prev, [newPropertyId]: false }));
                }, 800);
              }, 200);
            }
          }, 50); // Small delay to ensure form state is updated
        }
      } else if (type === 'investment') {
        const hasCards = (investmentCards || []).length > 0;
        
        // Only create default property card if none exist yet
        if (!hasCards) {
          // Create entry in main form's property array
          addProperty('investment');
          
          // Get the ID of the newly created property
          setTimeout(() => {
            const currentProperties = form.watch('property.properties') || [];
            const newProperty = currentProperties.find(p => p.use === 'investment');
            const newPropertyId = newProperty?.id;
            
            if (newPropertyId) {
              setInvestmentCards([newPropertyId]);
              
              // Initialize data state for default card
              setInvestmentData(prev => ({ 
                ...prev, 
                [newPropertyId]: { isSubjectProperty: null } 
              }));
              
              // Auto-expand the property card
              setPropertyCardStates(prev => ({ ...prev, [newPropertyId]: true }));
              
              // Trigger animation for newly created property card
              setTimeout(() => {
                setShowSubjectPropertyAnimation(prev => ({ ...prev, [newPropertyId]: true }));
                setTimeout(() => {
                  setShowSubjectPropertyAnimation(prev => ({ ...prev, [newPropertyId]: false }));
                }, 800);
              }, 200);
            }
          }, 50); // Small delay to ensure form state is updated
        }
      } else {
        // For other property types, use the old system for now
        addPropertyType(type);
      }
    }
  };

  // Helper function to handle Current Primary Loan type changes with card management (similar to handlePropertyTypeChange)
  const handleCurrentPrimaryLoanTypeChange = (checked: boolean) => {
    if (!checked) {
      // Special handling for Current Primary Loan - don't allow unchecking if cards already exist
      const hasCards = (currentPrimaryLoanCards || []).length > 0;
      
      if (hasCards) {
        // Cards already exist, prevent unchecking - all removal must be done through card buttons
        return;
      }
    } else {
      // When checking, auto-create default loan card
      const hasCards = (currentPrimaryLoanCards || []).length > 0;
      
      // Only create default loan card if none exist yet
      if (!hasCards) {
        // Generate a unique ID for the new loan card
        const newLoanId = `current-primary-loan-${Date.now()}`;
        
        // Set the loan cards state
        setCurrentPrimaryLoanCards([newLoanId]);
        
        // Initialize data state for default card
        setCurrentPrimaryLoanData(prev => ({ 
          ...prev, 
          [newLoanId]: { isDefaultCard: true } 
        }));
        
        // Initialize per-card collapsible state (auto-expand like Property cards)
        setCurrentLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
        
        // Auto-expand the loan card
        setShowCurrentLoan(true);
        
        // Trigger animation for newly created loan card
        setTimeout(() => {
          setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: true }));
          setTimeout(() => {
            setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: false }));
          }, 800);
        }, 200);
      }
    }
  };

  // Handle removing current primary loan cards (new system)
  const removeCurrentPrimaryLoanCard = (cardId: string) => {
    // Remove the specific card from cards array
    setCurrentPrimaryLoanCards(prev => prev.filter(id => id !== cardId));
    
    // Remove data state for this card
    setCurrentPrimaryLoanData(prev => {
      const { [cardId]: _, ...rest } = prev;
      return rest;
    });
    
    // Remove per-card collapsible state
    setCurrentLoanCardStates(prev => {
      const { [cardId]: _, ...rest } = prev;
      return rest;
    });
    
    // If no cards remain, hide the current loan section
    const remainingCards = currentPrimaryLoanCards.filter(id => id !== cardId);
    if (remainingCards.length === 0) {
      setShowCurrentLoan(false);
    }
    
    // Close the dialog
    setDeleteCurrentPrimaryLoanDialog({ isOpen: false, cardId: '' });
  };

  // Helper function to handle Current Second Loan type changes with card management (similar to Current Primary Loan)
  const handleCurrentSecondLoanTypeChange = (checked: boolean) => {
    if (!checked) {
      // Special handling for Current Second Loan - don't allow unchecking if cards already exist
      const hasCards = (currentSecondLoanCards || []).length > 0;
      
      if (hasCards) {
        // Cards already exist, prevent unchecking - all removal must be done through card buttons
        return;
      }
    } else {
      // When checking, auto-create default loan card
      const hasCards = (currentSecondLoanCards || []).length > 0;
      
      // Only create default loan card if none exist yet
      if (!hasCards) {
        // Generate a unique ID for the default loan card
        const newLoanId = `current-second-loan-${Date.now()}`;
        
        // Add to cards array
        setCurrentSecondLoanCards(prev => [...(prev || []), newLoanId]);
        
        // Initialize data state for new card  
        setCurrentSecondLoanData(prev => ({ 
          ...prev, 
          [newLoanId]: { isDefaultCard: true } 
        }));
        
        // Initialize per-card collapsible state (auto-expand like Property cards)
        setSecondLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
        
        // Auto-expand the loan card
        setShowSecondLoan(true);
        
        // Trigger animation for newly created loan card
        setTimeout(() => {
          setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: true }));
          setTimeout(() => {
            setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: false }));
          }, 800);
        }, 200);
      }
    }
  };

  // Handle removing current second loan cards (new system)
  const removeCurrentSecondLoanCard = (cardId: string) => {
    // Remove the specific card from cards array
    setCurrentSecondLoanCards(prev => prev.filter(id => id !== cardId));
    
    // Remove data state for this card
    setCurrentSecondLoanData(prev => {
      const { [cardId]: _, ...rest } = prev;
      return rest;
    });
    
    // Remove per-card collapsible state
    setSecondLoanCardStates(prev => {
      const { [cardId]: _, ...rest } = prev;
      return rest;
    });
    
    // If no cards remain, hide the second loan section
    const remainingCards = currentSecondLoanCards.filter(id => id !== cardId);
    if (remainingCards.length === 0) {
      setShowSecondLoan(false);
    }
    
    // Close the dialog
    setDeleteCurrentSecondLoanDialog({ isOpen: false, cardId: '' });
  };

  // Helper function to handle Current Third Loan type changes with card management (similar to Current Primary and Second Loan)
  const handleCurrentThirdLoanTypeChange = (checked: boolean) => {
    if (!checked) {
      // Special handling for Current Third Loan - don't allow unchecking if cards already exist
      const hasCards = (currentThirdLoanCards || []).length > 0;
      
      if (hasCards) {
        // Cards already exist, prevent unchecking - all removal must be done through card buttons
        return;
      }
    } else {
      // When checking, auto-create default loan card
      const hasCards = (currentThirdLoanCards || []).length > 0;
      
      // Only create default loan card if none exist yet
      if (!hasCards) {
        // Generate a unique ID for the default loan card
        const newLoanId = `current-third-loan-${Date.now()}`;
        
        // Add to cards array
        setCurrentThirdLoanCards(prev => [...(prev || []), newLoanId]);
        
        // Initialize data state for new card  
        setCurrentThirdLoanData(prev => ({ 
          ...prev, 
          [newLoanId]: { isDefaultCard: true } 
        }));
        
        // Initialize per-card collapsible state (auto-expand like Property cards)
        setThirdLoanCardStates(prev => ({ ...prev, [newLoanId]: true }));
        
        // Auto-expand the loan card
        setShowThirdLoan(true);
        
        // Trigger animation for newly created loan card
        setTimeout(() => {
          setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: true }));
          setTimeout(() => {
            setShowSubjectPropertyAnimation(prev => ({ ...prev, [newLoanId]: false }));
          }, 800);
        }, 200);
      }
    }
  };

  // Handle removing current third loan cards (new system)
  const removeCurrentThirdLoanCard = (cardId: string) => {
    // Remove the specific card from cards array
    setCurrentThirdLoanCards(prev => prev.filter(id => id !== cardId));
    
    // Remove data state for this card
    setCurrentThirdLoanData(prev => {
      const { [cardId]: _, ...rest } = prev;
      return rest;
    });
    
    // Remove per-card collapsible state
    setThirdLoanCardStates(prev => {
      const { [cardId]: _, ...rest } = prev;
      return rest;
    });
    
    // If no cards remain, hide the third loan section
    const remainingCards = currentThirdLoanCards.filter(id => id !== cardId);
    if (remainingCards.length === 0) {
      setShowThirdLoan(false);
    }
    
    // Close the dialog
    setDeleteCurrentThirdLoanDialog({ isOpen: false, cardId: '' });
  };

  // Property type management functions
  const addPropertyType = (type: 'primary' | 'second-home' | 'investment' | 'home-purchase') => {
    const currentProperties = form.watch('property.properties') || [];
    
    // For primary residence, ensure only one exists
    if (type === 'primary') {
      const hasExistingPrimary = currentProperties.some(p => p.use === 'primary');
      if (hasExistingPrimary) return;
    }
    
    addProperty(type);
    
    // Trigger subject property box animation for all property types
    setTimeout(() => {
      const currentProperties = form.watch('property.properties') || [];
      const newProperty = currentProperties.find(p => p.use === type);
      if (newProperty?.id) {
        setShowSubjectPropertyAnimation(prev => ({ ...prev, [newProperty.id!]: true }));
        // Reset animation after it completes
        setTimeout(() => {
          setShowSubjectPropertyAnimation(prev => ({ ...prev, [newProperty.id!]: false }));
        }, 800);
      }
    }, 200); // Small delay to ensure card is expanded first
    
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

  const removePropertyType = (type: 'primary' | 'second-home' | 'investment' | 'home-purchase') => {
    const typeLabels = {
      'primary': 'Primary Residence',
      'second-home': 'Second Home',
      'investment': 'Investment Property',
      'home-purchase': 'Home Purchase'
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

  const hasPropertyType = (type: 'primary' | 'second-home' | 'investment' | 'home-purchase'): boolean => {
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

  // Handle adding additional loans
  const handleAddAdditionalLoan = () => {
    // Generate a unique ID based on timestamp to avoid conflicts
    const newLoanId = `loan-${Date.now()}`;
    setAdditionalLoans(prev => [...prev, { id: newLoanId, isOpen: true }]);
  };

  // Handle removing additional loan
  const removeAdditionalLoan = (loanId: string) => {
    setAdditionalLoans(prev => prev.filter(loan => loan.id !== loanId));
  };

  // Toggle additional loan collapsible state
  const toggleAdditionalLoanOpen = (loanId: string) => {
    setAdditionalLoans(prev =>
      prev.map(loan =>
        loan.id === loanId ? { ...loan, isOpen: !loan.isOpen } : loan
      )
    );
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
  
  // Auto-copy property address to Current Loan 1 based on Attached to Property selection
  const autoCopyPropertyAddressToCurrentLoan = () => {
    const attachedPropertyId = form.getValues('currentLoan.attachedToProperty') as string;
    
    if (attachedPropertyId && attachedPropertyId !== 'Other' && attachedPropertyId !== 'select') {
      // Find property by ID since attachedToProperty now contains the property ID
      const properties = form.getValues('property.properties') || [];
      const selectedProperty = properties.find((p: any) => p.id === attachedPropertyId);
      
      if (selectedProperty?.address) {
        // Copy address from the selected property
        form.setValue('currentLoan.propertyAddress.street', selectedProperty.address.street || '');
        form.setValue('currentLoan.propertyAddress.unit', selectedProperty.address.unit || '');
        form.setValue('currentLoan.propertyAddress.city', selectedProperty.address.city || '');
        form.setValue('currentLoan.propertyAddress.state', selectedProperty.address.state || '');
        form.setValue('currentLoan.propertyAddress.zipCode', selectedProperty.address.zip || '');
        form.setValue('currentLoan.propertyAddress.county', selectedProperty.address.county || '');
      }
    } else if (attachedPropertyId === 'Other' || attachedPropertyId === 'select') {
      // Clear fields for manual entry or when no selection
      form.setValue('currentLoan.propertyAddress.street', '');
      form.setValue('currentLoan.propertyAddress.unit', '');
      form.setValue('currentLoan.propertyAddress.city', '');
      form.setValue('currentLoan.propertyAddress.state', '');
      form.setValue('currentLoan.propertyAddress.zipCode', '');
      form.setValue('currentLoan.propertyAddress.county', '');
    }
  };

  // Auto-copy property address to Loan tab Second Loan based on Attached to Property selection
  const autoCopyPropertyAddressToLoanTabSecondLoan = () => {
    const attachedPropertyId = form.getValues('secondLoan.attachedToProperty') as string;
    
    if (attachedPropertyId && attachedPropertyId !== 'Other' && attachedPropertyId !== 'select') {
      // Find property by ID since attachedToProperty now contains the property ID
      const properties = form.getValues('property.properties') || [];
      const selectedProperty = properties.find((p: any) => p.id === attachedPropertyId);
      
      if (selectedProperty?.address) {
        // Copy address from the selected property
        form.setValue('secondLoan.propertyAddress.street', selectedProperty.address.street || '');
        form.setValue('secondLoan.propertyAddress.unit', selectedProperty.address.unit || '');
        form.setValue('secondLoan.propertyAddress.city', selectedProperty.address.city || '');
        form.setValue('secondLoan.propertyAddress.state', selectedProperty.address.state || '');
        form.setValue('secondLoan.propertyAddress.zipCode', selectedProperty.address.zip || '');
        form.setValue('secondLoan.propertyAddress.county', selectedProperty.address.county || '');
      }
    } else if (attachedPropertyId === 'Other' || attachedPropertyId === 'select') {
      // Clear fields for manual entry or when no selection
      form.setValue('secondLoan.propertyAddress.street', '');
      form.setValue('secondLoan.propertyAddress.unit', '');
      form.setValue('secondLoan.propertyAddress.city', '');
      form.setValue('secondLoan.propertyAddress.state', '');
      form.setValue('secondLoan.propertyAddress.zipCode', '');
      form.setValue('secondLoan.propertyAddress.county', '');
    }
  };

  // Type-erased wrappers for dynamic field paths (additional loans)
  const setDyn = (name: string, v: any, opts?: any) => (form as unknown as UseFormReturn<any>).setValue(name as any, v, opts);
  const getDyn = (name: string) => (form as unknown as UseFormReturn<any>).getValues(name as any);

  // Generic auto-copy function for additional loans
  const createAutoCopyAddressFunction = (loanId: string) => () => {
    const attachedPropertyId = getDyn(`${loanId}.attachedToProperty`) as string;
    
    if (attachedPropertyId && attachedPropertyId !== 'Other' && attachedPropertyId !== 'select') {
      // Find property by ID since attachedToProperty now contains the property ID
      const properties = form.getValues('property.properties') || [];
      const selectedProperty = properties.find((p: any) => p.id === attachedPropertyId);
      
      if (selectedProperty?.address) {
        // Copy address from the selected property
        setDyn(`${loanId}.propertyAddress.street`, selectedProperty.address.street || '');
        setDyn(`${loanId}.propertyAddress.unit`, selectedProperty.address.unit || '');
        setDyn(`${loanId}.propertyAddress.city`, selectedProperty.address.city || '');
        setDyn(`${loanId}.propertyAddress.state`, selectedProperty.address.state || '');
        setDyn(`${loanId}.propertyAddress.zipCode`, selectedProperty.address.zip || '');
        setDyn(`${loanId}.propertyAddress.county`, selectedProperty.address.county || '');
      }
    } else if (attachedPropertyId === 'Other' || attachedPropertyId === 'select') {
      // Clear fields for manual entry or when no selection
      setDyn(`${loanId}.propertyAddress.street`, '');
      setDyn(`${loanId}.propertyAddress.unit`, '');
      setDyn(`${loanId}.propertyAddress.city`, '');
      setDyn(`${loanId}.propertyAddress.state`, '');
      setDyn(`${loanId}.propertyAddress.zipCode`, '');
      setDyn(`${loanId}.propertyAddress.county`, '');
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
    } else if (attachedProperty === 'Home Purchase') {
      const homePurchaseProperty = properties.find(property => property.use === 'home-purchase');
      if (homePurchaseProperty?.address) {
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.street`, homePurchaseProperty.address.street || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.unit`, homePurchaseProperty.address.unit || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.city`, homePurchaseProperty.address.city || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.state`, homePurchaseProperty.address.state || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.zipCode`, homePurchaseProperty.address.zip || '');
        form.setValue(`property.properties.${propertyIndex}.secondLoan.propertyAddress.county`, homePurchaseProperty.address.county || '');
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
    } else if (attachedProperty === 'Home Purchase') {
      const homePurchaseProperty = properties.find(property => property.use === 'home-purchase');
      if (homePurchaseProperty?.address) {
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.street`, homePurchaseProperty.address.street || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.unit`, homePurchaseProperty.address.unit || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.city`, homePurchaseProperty.address.city || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.state`, homePurchaseProperty.address.state || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.zipCode`, homePurchaseProperty.address.zip || '');
        form.setValue(`property.properties.${propertyIndex}.thirdLoan.propertyAddress.county`, homePurchaseProperty.address.county || '');
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
    } else if (attachedProperty === 'Home Purchase') {
      const properties = form.getValues('property.properties') || [];
      const homePurchaseProperty = properties.find(property => property.use === 'home-purchase');
      if (homePurchaseProperty?.address) {
        form.setValue('secondLoan.propertyAddress.street', homePurchaseProperty.address.street || '');
        form.setValue('secondLoan.propertyAddress.unit', homePurchaseProperty.address.unit || '');
        form.setValue('secondLoan.propertyAddress.city', homePurchaseProperty.address.city || '');
        form.setValue('secondLoan.propertyAddress.state', homePurchaseProperty.address.state || '');
        form.setValue('secondLoan.propertyAddress.zipCode', homePurchaseProperty.address.zip || '');
        form.setValue('secondLoan.propertyAddress.county', homePurchaseProperty.address.county || '');
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
    } else if (attachedProperty === 'Home Purchase') {
      const properties = form.getValues('property.properties') || [];
      const homePurchaseProperty = properties.find(property => property.use === 'home-purchase');
      if (homePurchaseProperty?.address) {
        form.setValue('thirdLoan.propertyAddress.street', homePurchaseProperty.address.street || '');
        form.setValue('thirdLoan.propertyAddress.unit', homePurchaseProperty.address.unit || '');
        form.setValue('thirdLoan.propertyAddress.city', homePurchaseProperty.address.city || '');
        form.setValue('thirdLoan.propertyAddress.state', homePurchaseProperty.address.state || '');
        form.setValue('thirdLoan.propertyAddress.zipCode', homePurchaseProperty.address.zip || '');
        form.setValue('thirdLoan.propertyAddress.county', homePurchaseProperty.address.county || '');
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

  // Sort properties by hierarchy: Home Purchase, Primary Residence, Second Homes, Investment Properties
  const sortPropertiesByHierarchy = (properties: any[]) => {
    const hierarchyOrder = { 'home-purchase': 1, 'primary': 2, 'second-home': 3, 'investment': 4 };
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
      <header className="bg-primary text-primary-foreground shadow-lg border-b transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-black italic" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
                Add New Client
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Always show unsaved changes dialog when navigating away from Add Client page
                      setUnsavedChangesDialog({ isOpen: true });
                    }}
                    className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10 p-2"
                    data-testid="button-back-to-dashboard"
                  >
                    <RotateCcw className="h-6 w-6" />
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
                onClick={form.handleSubmit(onSubmit)}
                disabled={addClientMutation.isPending}
                size="sm"
                className={`bg-white text-primary border hover:bg-green-600 hover:text-white transition-all duration-500 ${
                  showEntryAnimation ? 'animate-roll-down' : ''
                }`}
                data-testid="button-save-client"
              >
                <Save className={`h-3 w-3 mr-2 transition-transform duration-500 ${addClientMutation.isPending ? 'rotate-180' : ''}`} />
                {addClientMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="client" className="space-y-6" onValueChange={(value) => {
            if (value === 'client' && !showEntryAnimation) {
              // Only trigger borrower animation if not on initial page load
              // Reset to false first to ensure animation can retrigger
              setShowBorrowerAnimation(false);
              requestAnimationFrame(() => {
                setShowBorrowerAnimation(true);
                // Reset animation after it completes so it can trigger again if needed
                setTimeout(() => setShowBorrowerAnimation(false), 1000);
              });
            }
            if (value === 'income') {
              setShowIncomeAnimation(true);
              // Reset animation after it completes so it can trigger again if needed
              setTimeout(() => setShowIncomeAnimation(false), 1000);
            }
            if (value === 'property') {
              setShowPropertyAnimation(true);
              // Reset animation after it completes so it can trigger again if needed
              setTimeout(() => setShowPropertyAnimation(false), 1000);
            }
          }}>
            <TabsList className="grid w-full grid-cols-9 bg-transparent h-auto p-0 relative border-b border-gray-200 group">
              <TabsTrigger value="client" data-testid="tab-client" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Borrower</TabsTrigger>
              <TabsTrigger value="income" data-testid="tab-income" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Income</TabsTrigger>
              <TabsTrigger value="property" data-testid="tab-property" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Property</TabsTrigger>
              <TabsTrigger value="loan" data-testid="tab-loan" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Loan</TabsTrigger>
              <TabsTrigger value="credit" data-testid="tab-credit" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Credit</TabsTrigger>
              <TabsTrigger value="status" data-testid="tab-status" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Status</TabsTrigger>
              <TabsTrigger value="vendors" data-testid="tab-vendors" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Vendors</TabsTrigger>
              <TabsTrigger value="quote" data-testid="tab-quote" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Quote</TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes" className="relative bg-transparent text-gray-700 hover:text-black data-[state=active]:text-blue-900 data-[state=active]:hover:text-blue-900 data-[state=active]:bg-transparent border-0 rounded-none py-3 px-4 font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px hover:after:bg-green-500 data-[state=active]:after:bg-blue-900 data-[state=active]:hover:after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-1/2 data-[state=active]:after:w-1/2 data-[state=active]:group-hover:after:w-0">Notes</TabsTrigger>
            </TabsList>

            {/* Client Tab */}
            <TabsContent value="client" className="space-y-6">
              {/* Lead Information Fields */}
              <Card className={`transition-all duration-700 ${
                showEntryAnimation ? 'animate-roll-down-delayed' : (showBorrowerAnimation ? 'animate-roll-down' : '')
              }`}>
                <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="borrower-leadRef" className="text-sm">
                        {isShowingDMBatch ? 'DM Batch' : 'Lead Reference'}
                      </Label>
                      <Switch
                        checked={isShowingDMBatch}
                        onCheckedChange={setIsShowingDMBatch}
                        data-testid="toggle-borrower-leadref"
                        className="scale-[0.8]"
                      />
                    </div>
                    <Input
                      id="borrower-leadRef"
                      {...form.register(isShowingDMBatch ? 'borrower.dmBatch' : 'borrower.leadRef')}
                      placeholder=""
                      data-testid="input-borrower-leadRef"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-source">Source</Label>
                    <Select
                      value={form.watch('borrower.source') || 'Select'}
                      onValueChange={(value) => form.setValue('borrower.source', value as any)}
                    >
                      <SelectTrigger data-testid="select-borrower-source">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select">Select</SelectItem>
                        <SelectItem value="Direct Mail">Direct Mail</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Client Referral">Client Referral</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-callDate">Initial Call Date</Label>
                    <Input
                      id="borrower-callDate"
                      type="date"
                      {...form.register('borrower.callDate')}
                      data-testid="input-borrower-callDate"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-startDate">Loan Start Date</Label>
                    <Input
                      id="borrower-startDate"
                      type="date"
                      {...form.register('borrower.startDate')}
                      data-testid="input-borrower-startDate"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-loanDuration">Loan Duration</Label>
                    <Input
                      id="borrower-loanDuration"
                      {...form.register('borrower.loanDuration')}
                      placeholder=""
                      data-testid="input-borrower-loanDuration"
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
                      <Label htmlFor="borrower-firstName">First Name</Label>
                      <Input
                        id="borrower-firstName"
                        {...form.register('borrower.firstName')}
                        data-testid="input-borrower-firstName"
                      />
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
                      <Label htmlFor="borrower-lastName">Last Name</Label>
                      <Input
                        id="borrower-lastName"
                        {...form.register('borrower.lastName')}
                        data-testid="input-borrower-lastName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="borrower-dateOfBirth">Date of Birth</Label>
                      <Input
                        id="borrower-dateOfBirth"
                        type="date"
                        {...form.register('borrower.dateOfBirth')}
                        data-testid="input-borrower-dateOfBirth"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="borrower-ssn">SSN</Label>
                      <Input
                        id="borrower-ssn"
                        {...form.register('borrower.ssn')}
                        placeholder="XXX-XX-XXXX"
                        data-testid="input-borrower-ssn"
                      />
                    </div>
                  </div>
                  
                  {/* Row 2: Marital Status, Relationship to Co-Borrower, Phone, Email, Preferred Contact Time */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="borrower-maritalStatus">Marital Status</Label>
                      <Select 
                        value={form.watch('borrower.maritalStatus') || 'Select'}
                        onValueChange={(value) => {
                          form.setValue('borrower.maritalStatus', value as any);
                          // Trigger co-borrower popup when married is selected
                          if (value === 'married' && !hasCoBorrower) {
                            setMaritalStatusDialog({ isOpen: true });
                          }
                        }}
                      >
                        <SelectTrigger data-testid="select-borrower-maritalStatus">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Select">Select</SelectItem>
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
                        value={form.watch('borrower.relationshipToBorrower') || 'N/A'}
                        onValueChange={(value) => form.setValue('borrower.relationshipToBorrower', value as any)}
                      >
                        <SelectTrigger data-testid="select-borrower-relationshipToBorrower">
                          <SelectValue placeholder="N/A" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
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
                      <Label htmlFor="borrower-phone">Phone</Label>
                      <Input
                        id="borrower-phone"
                        value={form.watch('borrower.phone') || ''}
                        onChange={(e) => handlePhoneChange('borrower.phone', e.target.value)}
                        placeholder="(XXX) XXX-XXXX"
                        data-testid="input-borrower-phone"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="borrower-email">Email</Label>
                      <Input
                        id="borrower-email"
                        type="email"
                        {...form.register('borrower.email')}
                        data-testid="input-borrower-email"
                      />
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
                <div className="flex justify-end p-4 pt-0">
                  {!hasCoBorrower ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCoBorrower}
                      className="hover:bg-orange-500 hover:text-white"
                      data-testid="button-add-coborrower-from-borrower"
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
                      data-testid="button-remove-coborrower-from-borrower"
                    >
                      Remove Co-Borrower
                    </Button>
                  )}
                </div>
              </Card>

              {/* Residence Address */}
              <Card>
                <Collapsible open={isBorrowerResidenceOpen} onOpenChange={setIsBorrowerResidenceOpen}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Borrower Residence</CardTitle>
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
                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor="borrower-residence-street">Street Address</Label>
                      <Input
                        id="borrower-residence-street"
                        {...form.register('borrower.residenceAddress.street', {
                          onChange: () => setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100)
                        })}
                        data-testid="input-borrower-residence-street"
                      />
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
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="borrower-residence-city">City</Label>
                      <Input
                        id="borrower-residence-city"
                        {...form.register('borrower.residenceAddress.city', {
                          onChange: () => setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100)
                        })}
                        data-testid="input-borrower-residence-city"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="borrower-residence-state">State</Label>
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
                    </div>
                    
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="borrower-residence-zip">ZIP Code</Label>
                      <Input
                        id="borrower-residence-zip"
                        {...form.register('borrower.residenceAddress.zip', {
                          onChange: () => setTimeout(() => autoCopyBorrowerAddressToPrimaryProperty(), 100)
                        })}
                        onBlur={(e) => handleBorrowerZipCodeLookup(e.target.value)}
                        data-testid="input-borrower-residence-zip"
                      />
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
                          placeholder={countyLookupLoading.borrower ? "Looking up counties..." : ""}
                          disabled={countyLookupLoading.borrower}
                          data-testid="input-borrower-residence-county"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="borrower-time-address" className="text-sm">
                          {isShowingMonthsAtAddress ? 'Months at this Address' : 'Years at this Address'}
                        </Label>
                        <Switch
                          checked={isShowingMonthsAtAddress}
                          onCheckedChange={setIsShowingMonthsAtAddress}
                          data-testid="toggle-borrower-time-address"
                          className="scale-[0.8]"
                        />
                      </div>
                      <Input
                        id="borrower-time-address"
                        type="number"
                        min="0"
                        max={isShowingMonthsAtAddress ? 11 : 99}
                        placeholder={isShowingMonthsAtAddress ? "Enter months" : "Enter years"}
                        {...form.register(isShowingMonthsAtAddress ? 'borrower.monthsAtAddress' : 'borrower.yearsAtAddress')}
                        data-testid="input-borrower-time-address"
                      />
                    </div>
                  </div>
                  
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Prior Borrower Residence Address - Show if less than 2 years at current address */}
              {(() => {
                const yearsValue = form.watch('borrower.yearsAtAddress');
                const monthsValue = form.watch('borrower.monthsAtAddress');
                
                // Check if any time value has been entered
                const hasYears = yearsValue && String(yearsValue).trim() !== '';
                const hasMonths = monthsValue && String(monthsValue).trim() !== '';
                
                if (!hasYears && !hasMonths) {
                  return false; // No time values entered, hide card
                }
                
                // Calculate total months at current address
                const years = hasYears ? parseInt(String(yearsValue)) : 0;
                const months = hasMonths ? parseInt(String(monthsValue)) : 0;
                const totalMonths = (isNaN(years) ? 0 : years) * 12 + (isNaN(months) ? 0 : months);
                
                return totalMonths < 24; // Show if less than 2 years (24 months) total
              })() && (
                <Card>
                  <Collapsible open={isBorrowerPriorResidenceOpen} onOpenChange={setIsBorrowerPriorResidenceOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Borrower - Prior Residence</CardTitle>
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
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="space-y-2 md:col-span-3">
                          <Label htmlFor="borrower-prior-street">Street Address</Label>
                          <Input
                            id="borrower-prior-street"
                            {...form.register('borrower.priorResidenceAddress.street')}
                            data-testid="input-borrower-prior-street"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="borrower-prior-unit">Unit/Apt</Label>
                          <Input
                            id="borrower-prior-unit"
                            {...form.register('borrower.priorResidenceAddress.unit')}
                            data-testid="input-borrower-prior-unit"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="borrower-prior-city">City</Label>
                          <Input
                            id="borrower-prior-city"
                            {...form.register('borrower.priorResidenceAddress.city')}
                            data-testid="input-borrower-prior-city"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
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
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="borrower-prior-zip">ZIP Code</Label>
                          <Input
                            id="borrower-prior-zip"
                            {...form.register('borrower.priorResidenceAddress.zip')}
                            onBlur={(e) => handleBorrowerPriorZipCodeLookup(e.target.value)}
                            data-testid="input-borrower-prior-zip"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
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
                              placeholder={countyLookupLoading.borrowerPrior ? "Looking up counties..." : ""}
                              disabled={countyLookupLoading.borrowerPrior}
                              data-testid="input-borrower-prior-county"
                            />
                          )}
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="borrower-prior-time-address" className="text-sm">
                              {isShowingMonthsAtPriorAddress ? 'Months at this Address' : 'Years at this Address'}
                            </Label>
                            <Switch
                              checked={isShowingMonthsAtPriorAddress}
                              onCheckedChange={setIsShowingMonthsAtPriorAddress}
                              data-testid="toggle-borrower-prior-time-address"
                              className="scale-[0.8]"
                            />
                          </div>
                          <Input
                            id="borrower-prior-time-address"
                            type="number"
                            min="0"
                            max={isShowingMonthsAtPriorAddress ? 11 : 99}
                            placeholder="0"
                            {...form.register(isShowingMonthsAtPriorAddress ? 'borrower.priorMonthsAtAddress' : 'borrower.priorYearsAtAddress')}
                            data-testid="input-borrower-prior-time-address"
                          />
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
                    <CardTitle>Borrower - Prior Residence {index + 2}</CardTitle>
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
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor={`borrower-prior-street-${address.id}`}>Street Address</Label>
                        <Input
                          id={`borrower-prior-street-${address.id}`}
                          placeholder="Street Address"
                          data-testid={`input-borrower-prior-street-${address.id}`}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor={`borrower-prior-unit-${address.id}`}>Unit/Apt</Label>
                        <Input
                          id={`borrower-prior-unit-${address.id}`}
                          placeholder="Unit/Apt"
                          data-testid={`input-borrower-prior-unit-${address.id}`}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`borrower-prior-city-${address.id}`}>City</Label>
                        <Input
                          id={`borrower-prior-city-${address.id}`}
                          placeholder="City"
                          data-testid={`input-borrower-prior-city-${address.id}`}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-1">
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
                      
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor={`borrower-prior-zip-${address.id}`}>ZIP Code</Label>
                        <Input
                          id={`borrower-prior-zip-${address.id}`}
                          placeholder="ZIP Code"
                          data-testid={`input-borrower-prior-zip-${address.id}`}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`borrower-prior-county-${address.id}`}>County</Label>
                        <Input
                          id={`borrower-prior-county-${address.id}`}
                          placeholder=""
                          data-testid={`input-borrower-prior-county-${address.id}`}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor={`borrower-prior-time-address-${address.id}`} className="text-sm">
                            Years at this Address
                          </Label>
                        </div>
                        <Input
                          id={`borrower-prior-time-address-${address.id}`}
                          type="number"
                          min="0"
                          max="99"
                          placeholder="0"
                          data-testid={`input-borrower-prior-time-address-${address.id}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Co-Borrower Section - Only show when co-borrower is added */}
              {hasCoBorrower && (
                <>
                <Card className="mt-16 border-l-4 border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500 transition-colors duration-200">
                  <CardHeader>
                    <CardTitle>Co-Borrower</CardTitle>
                  </CardHeader>
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
                          value={form.watch('coBorrower.maritalStatus') || 'Select'}
                          onValueChange={(value) => form.setValue('coBorrower.maritalStatus', value as any)}
                        >
                          <SelectTrigger data-testid="select-coborrower-maritalStatus">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Select">Select</SelectItem>
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
                          value={form.watch('coBorrower.relationshipToBorrower') || 'N/A'}
                          onValueChange={(value) => form.setValue('coBorrower.relationshipToBorrower', value as any)}
                        >
                          <SelectTrigger data-testid="select-coborrower-relationshipToBorrower">
                            <SelectValue placeholder="N/A" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
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
                </Card>

                {/* Co-Borrower Residence Address */}
                <Card>
                  <Collapsible open={isCoBorrowerResidenceOpen} onOpenChange={setIsCoBorrowerResidenceOpen}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Co-Borrower Residence</CardTitle>
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
                                className="hover:bg-orange-500 hover:text-black"
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
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="coBorrower-residence-street">Street Address *</Label>
                        <Input
                          id="coBorrower-residence-street"
                          {...form.register('coBorrower.residenceAddress.street', {
                            onChange: () => setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100)
                          })}
                          data-testid="input-coborrower-residence-street"
                        />
                        {form.formState.errors.coBorrower?.residenceAddress?.street && (
                          <p className="text-sm text-destructive">{form.formState.errors.coBorrower.residenceAddress.street.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 md:col-span-1">
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
                        <Label htmlFor="coBorrower-residence-city">City *</Label>
                        <Input
                          id="coBorrower-residence-city"
                          {...form.register('coBorrower.residenceAddress.city', {
                            onChange: () => setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100)
                          })}
                          data-testid="input-coborrower-residence-city"
                        />
                        {form.formState.errors.coBorrower?.residenceAddress?.city && (
                          <p className="text-sm text-destructive">{form.formState.errors.coBorrower.residenceAddress.city.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="coBorrower-residence-state">State *</Label>
                        <Select
                          value={form.watch('coBorrower.residenceAddress.state') || ''}
                          onValueChange={(value) => {
                            form.setValue('coBorrower.residenceAddress.state', value);
                            setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100);
                          }}
                        >
                          <SelectTrigger data-testid="select-coborrower-residence-state">
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
                        {form.formState.errors.coBorrower?.residenceAddress?.state && (
                          <p className="text-sm text-destructive">{form.formState.errors.coBorrower.residenceAddress.state.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="coBorrower-residence-zip">ZIP Code *</Label>
                        <Input
                          id="coBorrower-residence-zip"
                          {...form.register('coBorrower.residenceAddress.zip', {
                            onChange: () => setTimeout(() => autoCopyCoBorrowerAddressToProperty(), 100)
                          })}
                          onBlur={(e) => handleCoBorrowerZipCodeLookup(e.target.value)}
                          data-testid="input-coborrower-residence-zip"
                        />
                        {form.formState.errors.coBorrower?.residenceAddress?.zip && (
                          <p className="text-sm text-destructive">{form.formState.errors.coBorrower.residenceAddress.zip.message}</p>
                        )}
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
                                // Find the selected county to get its label for display
                                const selectedCounty = coBorrowerCountyOptions.find(county => county.value === value);
                                form.setValue('coBorrower.residenceAddress.county', selectedCounty?.label || value, { shouldDirty: true });
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
                            placeholder={countyLookupLoading.coBorrower ? "Looking up counties..." : ""}
                            disabled={countyLookupLoading.coBorrower}
                            data-testid="input-coborrower-residence-county"
                          />
                        )}
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="coBorrower-time-address" className="text-sm">
                            {isShowingCoBorrowerMonthsAtAddress ? 'Months at this Address' : 'Years at this Address'}
                          </Label>
                          <Switch
                            checked={isShowingCoBorrowerMonthsAtAddress}
                            onCheckedChange={setIsShowingCoBorrowerMonthsAtAddress}
                            data-testid="toggle-coborrower-time-address"
                            className="scale-[0.8]"
                          />
                        </div>
                        <Input
                          id="coBorrower-time-address"
                          type="number"
                          min="0"
                          max={isShowingCoBorrowerMonthsAtAddress ? 11 : 99}
                          placeholder={isShowingCoBorrowerMonthsAtAddress ? "Enter months" : "Enter years"}
                          {...form.register(isShowingCoBorrowerMonthsAtAddress ? 'coBorrower.monthsAtAddress' : 'coBorrower.yearsAtAddress')}
                          data-testid="input-coborrower-time-address"
                        />
                      </div>
                    </div>
                    
                    {/* Error handling for time at address field */}
                    {form.formState.errors.coBorrower?.yearsAtAddress && !isShowingCoBorrowerMonthsAtAddress && (
                      <p className="text-sm text-destructive">{form.formState.errors.coBorrower.yearsAtAddress.message}</p>
                    )}
                    {form.formState.errors.coBorrower?.monthsAtAddress && isShowingCoBorrowerMonthsAtAddress && (
                      <p className="text-sm text-destructive">{form.formState.errors.coBorrower.monthsAtAddress.message}</p>
                    )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Prior Co-Borrower Residence Address - Show if less than 2 years at current address */}
                {(() => {
                  // Make sure co-borrower object exists before checking time values
                  const coBorrower = form.watch('coBorrower');
                  if (!coBorrower) {
                    return false; // No co-borrower object, hide card
                  }
                  
                  const yearsValue = coBorrower.yearsAtAddress;
                  const monthsValue = coBorrower.monthsAtAddress;
                  
                  // Check if any time value has been entered (handle numeric zero properly)
                  const hasYears = yearsValue !== undefined && yearsValue !== null && String(yearsValue).trim() !== '';
                  const hasMonths = monthsValue !== undefined && monthsValue !== null && String(monthsValue).trim() !== '';
                  
                  if (!hasYears && !hasMonths) {
                    return false; // No time values entered, hide card
                  }
                  
                  // Calculate total months at current address
                  const years = hasYears ? parseInt(String(yearsValue)) : 0;
                  const months = hasMonths ? parseInt(String(monthsValue)) : 0;
                  const totalMonths = (isNaN(years) ? 0 : years) * 12 + (isNaN(months) ? 0 : months);
                  
                  return totalMonths < 24; // Show if less than 2 years (24 months) total
                })() && (
                  <>
                    <Card>
                      <Collapsible open={isCoBorrowerPriorResidenceOpen} onOpenChange={setIsCoBorrowerPriorResidenceOpen}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Co-Borrower - Prior Residence</CardTitle>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CollapsibleTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="hover:bg-orange-500 hover:text-black"
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
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="space-y-2 md:col-span-3">
                              <Label htmlFor="coBorrower-prior-street">Street Address *</Label>
                              <Input
                                id="coBorrower-prior-street"
                                {...form.register('coBorrower.priorResidenceAddress.street')}
                                data-testid="input-coborrower-prior-street"
                              />
                              {form.formState.errors.coBorrower?.priorResidenceAddress?.street && (
                                <p className="text-sm text-destructive">{form.formState.errors.coBorrower.priorResidenceAddress.street.message}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2 md:col-span-1">
                              <Label htmlFor="coBorrower-prior-unit">Unit/Apt</Label>
                              <Input
                                id="coBorrower-prior-unit"
                                {...form.register('coBorrower.priorResidenceAddress.unit')}
                                data-testid="input-coborrower-prior-unit"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrower-prior-city">City *</Label>
                              <Input
                                id="coBorrower-prior-city"
                                {...form.register('coBorrower.priorResidenceAddress.city')}
                                data-testid="input-coborrower-prior-city"
                              />
                              {form.formState.errors.coBorrower?.priorResidenceAddress?.city && (
                                <p className="text-sm text-destructive">{form.formState.errors.coBorrower.priorResidenceAddress.city.message}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2 md:col-span-1">
                              <Label htmlFor="coBorrower-prior-state">State *</Label>
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
                              {form.formState.errors.coBorrower?.priorResidenceAddress?.state && (
                                <p className="text-sm text-destructive">{form.formState.errors.coBorrower.priorResidenceAddress.state.message}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2 md:col-span-1">
                              <Label htmlFor="coBorrower-prior-zip">ZIP Code *</Label>
                              <Input
                                id="coBorrower-prior-zip"
                                {...form.register('coBorrower.priorResidenceAddress.zip')}
                                onBlur={(e) => handleCoBorrowerPriorZipCodeLookup(e.target.value)}
                                data-testid="input-coborrower-prior-zip"
                              />
                              {form.formState.errors.coBorrower?.priorResidenceAddress?.zip && (
                                <p className="text-sm text-destructive">{form.formState.errors.coBorrower.priorResidenceAddress.zip.message}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
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
                                  placeholder={countyLookupLoading.coBorrowerPrior ? "Looking up counties..." : ""}
                                  disabled={countyLookupLoading.coBorrowerPrior}
                                  data-testid="input-coborrower-prior-county"
                                />
                              )}
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="coBorrower-prior-time-address" className="text-sm">
                                  {isShowingCoBorrowerMonthsAtPriorAddress ? 'Months at this Address' : 'Years at this Address'}
                                </Label>
                                <Switch
                                  checked={isShowingCoBorrowerMonthsAtPriorAddress}
                                  onCheckedChange={setIsShowingCoBorrowerMonthsAtPriorAddress}
                                  data-testid="toggle-coborrower-prior-time-address"
                                  className="scale-[0.8]"
                                />
                              </div>
                              <Input
                                id="coBorrower-prior-time-address"
                                type="number"
                                min="0"
                                max={isShowingCoBorrowerMonthsAtPriorAddress ? 11 : 99}
                                placeholder="0"
                                {...form.register(isShowingCoBorrowerMonthsAtPriorAddress ? 'coBorrower.priorMonthsAtAddress' : 'coBorrower.priorYearsAtAddress')}
                                data-testid="input-coborrower-prior-time-address"
                              />
                            </div>
                          </div>
                          
                          {/* Error handling for time at address field */}
                          {form.formState.errors.coBorrower?.priorYearsAtAddress && !isShowingCoBorrowerMonthsAtPriorAddress && (
                            <p className="text-sm text-destructive">{form.formState.errors.coBorrower.priorYearsAtAddress.message}</p>
                          )}
                          {form.formState.errors.coBorrower?.priorMonthsAtAddress && isShowingCoBorrowerMonthsAtPriorAddress && (
                            <p className="text-sm text-destructive">{form.formState.errors.coBorrower.priorMonthsAtAddress.message}</p>
                          )}
                          
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
                        <CardTitle>Co-Borrower - Prior Residence {index + 2}</CardTitle>
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
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="space-y-2 md:col-span-3">
                            <Label htmlFor={`coBorrower-prior-street-${address.id}`}>Street Address *</Label>
                            <Input
                              id={`coBorrower-prior-street-${address.id}`}
                              placeholder="Street Address"
                              data-testid={`input-coborrower-prior-street-${address.id}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-1">
                            <Label htmlFor={`coBorrower-prior-unit-${address.id}`}>Unit/Apt</Label>
                            <Input
                              id={`coBorrower-prior-unit-${address.id}`}
                              placeholder="Unit/Apt"
                              data-testid={`input-coborrower-prior-unit-${address.id}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`coBorrower-prior-city-${address.id}`}>City *</Label>
                            <Input
                              id={`coBorrower-prior-city-${address.id}`}
                              placeholder="City"
                              data-testid={`input-coborrower-prior-city-${address.id}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-1">
                            <Label htmlFor={`coBorrower-prior-state-${address.id}`}>State *</Label>
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
                          
                          <div className="space-y-2 md:col-span-1">
                            <Label htmlFor={`coBorrower-prior-zip-${address.id}`}>ZIP Code *</Label>
                            <Input
                              id={`coBorrower-prior-zip-${address.id}`}
                              placeholder="ZIP Code"
                              data-testid={`input-coborrower-prior-zip-${address.id}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`coBorrower-prior-county-${address.id}`}>County</Label>
                            <Input
                              id={`coBorrower-prior-county-${address.id}`}
                              placeholder=""
                              data-testid={`input-coborrower-prior-county-${address.id}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <Label htmlFor={`coBorrower-prior-time-address-${address.id}`} className="text-sm">
                                Years at this Address
                              </Label>
                            </div>
                            <Input
                              id={`coBorrower-prior-time-address-${address.id}`}
                              type="number"
                              min="0"
                              max="99"
                              placeholder="0"
                              data-testid={`input-coborrower-prior-time-address-${address.id}`}
                            />
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
              <Card className={`transition-all duration-700 ${
                showIncomeAnimation ? 'animate-roll-down' : ''
              }`}>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="household-income-total" className="text-lg font-semibold">Total Household Income</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="income-frontDTI" className={`text-lg font-semibold ${
                      showIncomeAnimation ? 'animate-roll-down-dti-1' : ''
                    }`}>Front DTI</Label>
                    <Controller
                      control={form.control}
                      name="income.frontDTI"
                      render={({ field }) => {
                        const displayValue = formatPercentageDisplay(field.value);
                        const hasValue = field.value && field.value.trim() !== '';
                        
                        return (
                          <div className="min-h-[40px] flex items-center">
                            {!isFrontDTIEditing && hasValue ? (
                              <div
                                onClick={() => setIsFrontDTIEditing(true)}
                                className="cursor-pointer bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                                style={{
                                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                  fontSize: '36px',
                                  fontWeight: 600,
                                  backgroundColor: '#1a3373',
                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                                }}
                                data-testid="display-income-frontDTI"
                              >
                                <span>
                                  {displayValue.replace('%', '')}
                                  <span style={{ fontSize: '28px' }}>%</span>
                                </span>
                              </div>
                            ) : (
                              <Input
                                id="income-frontDTI"
                                value={displayValue}
                                onChange={(e) => {
                                  const rawValue = parsePercentageInput(e.target.value);
                                  field.onChange(rawValue);
                                }}
                                onBlur={() => {
                                  if (hasValue) {
                                    setIsFrontDTIEditing(false);
                                  }
                                }}
                                onFocus={() => setIsFrontDTIEditing(true)}
                                placeholder="%"
                                autoFocus={isFrontDTIEditing && hasValue}
                                className="w-1/2"
                                data-testid="input-income-frontDTI"
                              />
                            )}
                          </div>
                        );
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="income-backDTI" className={`text-lg font-semibold ${
                      showIncomeAnimation ? 'animate-roll-down-dti-2' : ''
                    }`}>Back DTI</Label>
                    <Controller
                      control={form.control}
                      name="income.backDTI"
                      render={({ field }) => {
                        const displayValue = formatPercentageDisplay(field.value);
                        const hasValue = field.value && field.value.trim() !== '';
                        
                        return (
                          <div className="min-h-[40px] flex items-center">
                            {!isBackDTIEditing && hasValue ? (
                              <div
                                onClick={() => setIsBackDTIEditing(true)}
                                className="cursor-pointer bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                                style={{
                                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                  fontSize: '36px',
                                  fontWeight: 600,
                                  backgroundColor: '#1a3373',
                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                                }}
                                data-testid="display-income-backDTI"
                              >
                                <span>
                                  {displayValue.replace('%', '')}
                                  <span style={{ fontSize: '28px' }}>%</span>
                                </span>
                              </div>
                            ) : (
                              <Input
                                id="income-backDTI"
                                value={displayValue}
                                onChange={(e) => {
                                  const rawValue = parsePercentageInput(e.target.value);
                                  field.onChange(rawValue);
                                }}
                                onBlur={() => {
                                  if (hasValue) {
                                    setIsBackDTIEditing(false);
                                  }
                                }}
                                onFocus={() => setIsBackDTIEditing(true)}
                                placeholder="%"
                                autoFocus={isBackDTIEditing && hasValue}
                                className="w-1/2"
                                data-testid="input-income-backDTI"
                              />
                            )}
                          </div>
                        );
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label 
                      htmlFor="income-guidelineDTI" 
                      className={`text-lg font-semibold ${
                        showIncomeAnimation ? 'animate-roll-down-dti-3' : ''
                      }`}
                    >
                      Guideline DTI
                    </Label>
                    <Controller
                      control={form.control}
                      name="income.guidelineDTI"
                      render={({ field }) => {
                        const displayValue = formatPercentageDisplay(field.value);
                        const hasValue = field.value && field.value.trim() !== '';
                        
                        return (
                          <div className="min-h-[40px] flex items-center">
                            {!isGuidelineDTIEditing && hasValue ? (
                              <div
                                onClick={() => setIsGuidelineDTIEditing(true)}
                                className="cursor-pointer bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                                style={{
                                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                  fontSize: '36px',
                                  fontWeight: 600,
                                  backgroundColor: '#1a3373',
                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                                }}
                                data-testid="display-income-guidelineDTI"
                              >
                                <span>
                                  {displayValue.replace('%', '')}
                                  <span style={{ fontSize: '28px' }}>%</span>
                                </span>
                              </div>
                            ) : (
                              <Input
                                id="income-guidelineDTI"
                                value={displayValue}
                                onChange={(e) => {
                                  const rawValue = parsePercentageInput(e.target.value);
                                  field.onChange(rawValue);
                                }}
                                onBlur={() => {
                                  if (hasValue) {
                                    setIsGuidelineDTIEditing(false);
                                  }
                                }}
                                onFocus={() => setIsGuidelineDTIEditing(true)}
                                placeholder="%"
                                autoFocus={isGuidelineDTIEditing && hasValue}
                                data-testid="input-income-guidelineDTI"
                                className={(() => {
                                  const backDTI = form.watch('income.backDTI') || '';
                                  const guidelineDTI = form.watch('income.guidelineDTI') || '';
                                  const shadowColor = getDTIComparisonColor(backDTI, guidelineDTI).shadowColor;
                                  let classes = 'w-1/2';
                                  if (shadowColor === 'green') {
                                    classes += ' shadow-lg shadow-green-200';
                                  } else if (shadowColor === 'red') {
                                    classes += ' shadow-lg shadow-red-200';
                                  }
                                  return classes;
                                })()}
                              />
                            )}
                          </div>
                        );
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Income Type Selection */}
              <Card className="border-l-4 border-l-green-500 hover:border-green-500 focus-within:border-green-500 transition-colors duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    Borrower Income
                    <span className="text-lg font-semibold" data-testid="text-total-borrower-income">
                      {totalBorrowerIncomeFormatted}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-employment"
                          checked={form.watch('income.incomeTypes.employment') || false}
                          onCheckedChange={(checked) => handleIncomeTypeChange('income.incomeTypes.employment', !!checked, 'Employment')}
                          data-testid="checkbox-employment"
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        />
                        <Label htmlFor="income-type-employment">Employment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-secondEmployment"
                          checked={form.watch('income.incomeTypes.secondEmployment') || false}
                          onCheckedChange={(checked) => handleIncomeTypeChange('income.incomeTypes.secondEmployment', !!checked, 'Second Employment')}
                          data-testid="checkbox-secondEmployment"
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        />
                        <Label htmlFor="income-type-secondEmployment">Second Employment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-selfEmployment"
                          checked={form.watch('income.incomeTypes.selfEmployment') || false}
                          onCheckedChange={(checked) => {
                            // Prevent unchecking - once checked, can only be removed via Remove button
                            if (!checked && form.watch('income.incomeTypes.selfEmployment')) {
                              return; // Do nothing - prevent unchecking
                            }
                            handleIncomeTypeChange('income.incomeTypes.selfEmployment', !!checked, 'Self-Employment');
                          }}
                          data-testid="checkbox-selfEmployment"
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        />
                        <Label htmlFor="income-type-selfEmployment">Self-Employment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-pension"
                          checked={form.watch('income.incomeTypes.pension') || false}
                          onCheckedChange={(checked) => handleIncomeTypeChange('income.incomeTypes.pension', !!checked, 'Pension')}
                          data-testid="checkbox-pension"
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        />
                        <Label htmlFor="income-type-pension">Pension</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-socialSecurity"
                          checked={form.watch('income.incomeTypes.socialSecurity') || false}
                          onCheckedChange={(checked) => {
                            // Prevent unchecking - once checked, can only be removed via Remove button
                            if (!checked && form.watch('income.incomeTypes.socialSecurity')) {
                              return; // Do nothing - prevent unchecking
                            }
                            handleIncomeTypeChange('income.incomeTypes.socialSecurity', !!checked, 'Social Security');
                          }}
                          data-testid="checkbox-socialSecurity"
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        />
                        <Label htmlFor="income-type-socialSecurity">Social Security</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-vaBenefits"
                          checked={form.watch('income.incomeTypes.vaBenefits') || false}
                          onCheckedChange={(checked) => {
                            // Prevent unchecking - once checked, can only be removed via Remove button
                            if (!checked && form.watch('income.incomeTypes.vaBenefits')) {
                              return; // Do nothing - prevent unchecking
                            }
                            handleIncomeTypeChange('income.incomeTypes.vaBenefits', !!checked, 'VA Disability');
                          }}
                          data-testid="checkbox-vaBenefits"
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        />
                        <Label htmlFor="income-type-vaBenefits">VA Disability</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="income-type-disability"
                          checked={form.watch('income.incomeTypes.disability') || false}
                          onCheckedChange={(checked) => {
                            // Prevent unchecking - once checked, can only be removed via Remove button
                            if (!checked && form.watch('income.incomeTypes.disability')) {
                              return; // Do nothing - prevent unchecking
                            }
                            handleIncomeTypeChange('income.incomeTypes.disability', !!checked, 'Disability');
                          }}
                          data-testid="checkbox-disability"
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
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
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                        />
                        <Label htmlFor="income-type-property-rental">Rental Property</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Borrower - Self-Employment Cards */}
              {form.watch('income.incomeTypes.selfEmployment') && (borrowerSelfEmploymentCards || ['default']).map((cardId, index) => {
                const propertyId = cardId === 'default' ? 'self-employment-template-card' : cardId;
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                return (
                  <Card key={cardId} className="transition-colors duration-200">
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className="flex items-center gap-2">
                              Borrower - Self-Employment
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Add Self-Employment Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newId = `self-employment-${Date.now()}`;
                                setBorrowerSelfEmploymentCards(prev => [...(prev || ['default']), newId]);
                              }}
                              className="hover:bg-blue-500 hover:text-white"
                              data-testid="button-add-self-employment"
                              title="Add New Self-Employment"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Self-Employment
                            </Button>
                            
                            {/* Delete Self-Employment Button - always show for default card, conditionally for additional cards */}
                            {(cardId === 'default' || (borrowerSelfEmploymentCards || []).length > 1) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteSelfEmploymentDialog({ isOpen: true, cardId: propertyId })}
                                className="hover:bg-red-500 hover:text-white"
                                data-testid={`button-delete-self-employment-${cardId}`}
                                title="Delete Self-Employment"
                              >
                                <Minus className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                            
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-self-employment-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`self-employment-${propertyId}-${isOpen}`}
                              >
                                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      {/* Employment Type Selection */}
                      <Card className={`bg-muted ${
                        showIncomeCardAnimation['borrower-self-employment'] ? 'animate-roll-down-subject-property' : ''
                      }`}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="self-employment-current"
                                  name="self-employment-type"
                                  data-testid="radio-self-employment-current"
                                />
                                <Label htmlFor="self-employment-current">Current</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="self-employment-prior"
                                  name="self-employment-type"
                                  data-testid="radio-self-employment-prior"
                                />
                                <Label htmlFor="self-employment-prior">Prior</Label>
                                <button
                                  type="button"
                                  onClick={() => openBusinessDescriptionDialog(cardId)}
                                  className={`transition-colors ml-6 flex items-center justify-center w-4 h-4 rounded-full border ${
                                    form.watch('income.businessDescription') 
                                      ? 'bg-purple-500 border-purple-500 text-white hover:bg-purple-600' 
                                      : 'text-blue-600 hover:text-blue-800 border-blue-600 hover:border-blue-800'
                                  }`}
                                  data-testid="button-business-description-info"
                                  title="Add business description"
                                >
                                  <span className="text-[10px] font-bold">D</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openTaxPreparerDialog(cardId)}
                                  className={`transition-colors ml-2 flex items-center justify-center w-4 h-4 rounded-full border ${
                                    form.watch('income.taxesPreparedBy') 
                                      ? 'bg-purple-500 border-purple-500 text-white hover:bg-purple-600' 
                                      : 'text-blue-600 hover:text-blue-800 border-blue-600 hover:border-blue-800'
                                  }`}
                                  data-testid="button-tax-preparer-info"
                                  title="Tax preparer information"
                                >
                                  <span className="text-[10px] font-bold">T</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* First row with business details */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="income-businessName">Business / DBA Name</Label>
                          <Input
                            id="income-businessName"
                            {...form.register('income.businessName')}
                            data-testid="input-income-businessName"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="income-businessPhone">Phone</Label>
                          <Input
                            id="income-businessPhone"
                            placeholder="(XXX) XXX-XXXX"
                            value={form.watch('income.businessPhone') || ''}
                            onChange={(e) => handlePhoneChange('income.businessPhone', e.target.value)}
                            data-testid="input-income-businessPhone"
                          />
                        </div>
                        
                        
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="income-annualRevenue" className="text-sm">
                              {isShowingNetRevenue ? 'Net Monthly Income' : 'Gross Monthly Income'}
                            </Label>
                            <Switch
                              checked={isShowingNetRevenue}
                              onCheckedChange={setIsShowingNetRevenue}
                              data-testid="toggle-income-annual-revenue"
                              className="scale-[0.8]"
                            />
                          </div>
                          <Input
                            id="income-annualRevenue"
                            type="text"
                            placeholder="$0"
                            value={(() => {
                              const fieldName = isShowingNetRevenue ? 'income.netAnnualRevenue' : 'income.grossAnnualRevenue';
                              const val = form.watch(fieldName as any);
                              if (!val) return '';
                              const numVal = val.replace(/[^\d]/g, '');
                              return numVal ? `$${numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
                            })()}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d]/g, '');
                              const fieldName = isShowingNetRevenue ? 'income.netAnnualRevenue' : 'income.grossAnnualRevenue';
                              form.setValue(fieldName as any, value, { shouldDirty: true, shouldTouch: true });
                            }}
                            data-testid="input-income-annualRevenue"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="income-self-employment-startDate">Start Date</Label>
                          <Input
                            id="income-self-employment-startDate"
                            type="date"
                            value={employmentDates['self-employment']?.startDate || ''}
                            onChange={(e) => {
                              const startDate = e.target.value;
                              const currentData = employmentDates['self-employment'] || { endDate: '', isPresent: false, duration: '' };
                              updateEmploymentDuration('self-employment', startDate, currentData.endDate, currentData.isPresent);
                            }}
                            placeholder="MM/DD/YYYY"
                            data-testid="input-income-self-employment-startDate"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="income-self-employment-endDate" className="text-sm">
                              {employmentDates['self-employment']?.isPresent ? 'Present' : 'End Date'}
                            </Label>
                            <Switch
                              checked={employmentDates['self-employment']?.isPresent ?? true}
                              onCheckedChange={(checked) => {
                                const currentData = employmentDates['self-employment'] || { startDate: '', endDate: '', duration: '' };
                                updateEmploymentDuration('self-employment', currentData.startDate, currentData.endDate, checked);
                              }}
                              data-testid="toggle-self-employment-present"
                              className="scale-[0.8]"
                            />
                          </div>
                          <Input
                            id="income-self-employment-endDate"
                            type={employmentDates['self-employment']?.isPresent ? 'text' : 'date'}
                            value={employmentDates['self-employment']?.isPresent ? 'present' : (employmentDates['self-employment']?.endDate || '')}
                            onChange={(e) => {
                              if (!employmentDates['self-employment']?.isPresent) {
                                const endDate = e.target.value;
                                const currentData = employmentDates['self-employment'] || { startDate: '', isPresent: false, duration: '' };
                                updateEmploymentDuration('self-employment', currentData.startDate, endDate, currentData.isPresent);
                              }
                            }}
                            placeholder={employmentDates['self-employment']?.isPresent ? 'Present' : 'MM/DD/YYYY'}
                            readOnly={employmentDates['self-employment']?.isPresent}
                            className={employmentDates['self-employment']?.isPresent ? 'bg-muted' : ''}
                            data-testid="input-income-self-employment-endDate"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="income-self-employment-duration">Duration</Label>
                          <Input
                            id="income-self-employment-duration"
                            value={employmentDates['self-employment']?.duration || ''}
                            placeholder={employmentDates['self-employment']?.isPresent ? 'Enter' : '0'}
                            readOnly={!employmentDates['self-employment']?.isPresent}
                            className={!employmentDates['self-employment']?.isPresent ? 'bg-muted' : ''}
                            onChange={(e) => {
                              if (employmentDates['self-employment']?.isPresent) {
                                const currentData = employmentDates['self-employment'] || { startDate: '', endDate: '', isPresent: false };
                                setEmploymentDates(prev => ({
                                  ...prev,
                                  'self-employment': {
                                    ...currentData,
                                    duration: e.target.value
                                  }
                                }));
                              }
                            }}
                            data-testid="input-income-self-employment-duration"
                          />
                        </div>
                      </div>
                        
                        {/* Business Address Row (copied from borrower residence address) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="space-y-2 md:col-span-3">
                            <Label htmlFor="income-business-street">Street Address</Label>
                            <Input
                              id="income-business-street"
                              {...form.register('income.businessAddress.street')}
                              data-testid="input-income-business-street"
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-1">
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
                          
                          <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="income-business-state">State</Label>
                            <Select
                              value={form.watch('income.businessAddress.state') || ''}
                              onValueChange={(value) => form.setValue('income.businessAddress.state', value)}
                            >
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
                          
                          <div className="space-y-2 md:col-span-1">
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
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="income-formation">Formation</Label>
                            <Select onValueChange={(value) => form.setValue('income.formation', value)} value={form.watch('income.formation') || ''}>
                              <SelectTrigger data-testid="select-income-formation">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sole Proprietorship" data-testid="select-item-sole-proprietorship">Sole Proprietorship</SelectItem>
                                <SelectItem value="General Partnership (GP)" data-testid="select-item-general-partnership">General Partnership (GP)</SelectItem>
                                <SelectItem value="Limited Partnership (LP)" data-testid="select-item-limited-partnership">Limited Partnership (LP)</SelectItem>
                                <SelectItem value="Limited Liability Partnership (LLP)" data-testid="select-item-llp">Limited Liability Partnership (LLP)</SelectItem>
                                <SelectItem value="LLC taxed as S-Corp" data-testid="select-item-llc-s-corp">LLC taxed as S-Corp</SelectItem>
                                <SelectItem value="LLC taxed as C-Corp" data-testid="select-item-llc-c-corp">LLC taxed as C-Corp</SelectItem>
                                <SelectItem value="C Corporation (C-Corp)" data-testid="select-item-c-corporation">C Corporation (C-Corp)</SelectItem>
                                <SelectItem value="S Corporation (S-Corp)" data-testid="select-item-s-corporation">S Corporation (S-Corp)</SelectItem>
                                <SelectItem value="Benefit Corporation (B-Corp)" data-testid="select-item-benefit-corporation">Benefit Corporation (B-Corp)</SelectItem>
                                <SelectItem value="Close Corporation" data-testid="select-item-close-corporation">Close Corporation</SelectItem>
                                <SelectItem value="Non-Profit Corporation" data-testid="select-item-non-profit-corporation">Non-Profit Corporation</SelectItem>
                                <SelectItem value="Professional Corporation (PC)" data-testid="select-item-professional-corporation">Professional Corporation (PC)</SelectItem>
                                <SelectItem value="Professional LLC (PLLC)" data-testid="select-item-professional-llc">Professional LLC (PLLC)</SelectItem>
                                <SelectItem value="Joint Venture" data-testid="select-item-joint-venture">Joint Venture</SelectItem>
                                <SelectItem value="CPA" data-testid="select-item-cpa">CPA</SelectItem>
                                <SelectItem value="Other" data-testid="select-item-other-tax">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
                );
              })}

              {/* Pension Income Card */}
              {form.watch('income.incomeTypes.pension') && (
                <Card>
                  <Collapsible open={isPensionIncomeOpen} onOpenChange={(open) => {
                    setIsPensionIncomeOpen(open);
                    if (open && !showIncomeCardAnimation['pension']) {
                      setTimeout(() => {
                        setShowIncomeCardAnimation(prev => ({ ...prev, 'pension': true }));
                        setTimeout(() => {
                          setShowIncomeCardAnimation(prev => ({ ...prev, 'pension': false }));
                        }, 800);
                      }, 200);
                    }
                  }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Borrower - Pension Income</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addBorrowerPension}
                            className="hover:bg-blue-500 hover:text-white"
                            data-testid="button-add-borrower-pension-header"
                            title="Add New Pension"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Pension
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeDefaultBorrowerPension}
                            className="hover:bg-red-500 hover:text-white"
                            data-testid="button-remove-default-pension"
                            title="Delete Pension"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        
                        {(form.watch('income.pensions') || []).map((pension, index) => (
                          <Card key={pension.id || index} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium">Pension {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBorrowerPension(pension.id!)}
                                className="hover:bg-orange-500 hover:text-white"
                                data-testid={`button-remove-borrower-pension-${index}`}
                                title="Delete Pension"
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
                                <Label htmlFor={`income-pension-${index}-monthlyAmount`}>Gross Monthly Income</Label>
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
                        <CardTitle>Borrower - Social Security</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteSocialSecurityDialog({ isOpen: true })}
                            className="hover:bg-red-500 hover:text-white"
                            data-testid="button-delete-social-security"
                            title="Delete Social Security Income"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="income-socialSecurityMonthlyAmount">Gross Monthly Income</Label>
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
                        <CardTitle>Borrower - VA Disability</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteVaBenefitsDialog({ isOpen: true })}
                            className="hover:bg-red-500 hover:text-white"
                            data-testid="button-delete-va-benefits"
                            title="Delete VA Disability Income"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="income-vaBenefitsMonthlyAmount">Gross Monthly Income</Label>
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
                        <CardTitle>Borrower - Disability</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDisabilityDialog({ isOpen: true })}
                            className="hover:bg-red-500 hover:text-white"
                            data-testid="button-delete-disability"
                            title="Delete Disability Income"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                          <Label htmlFor="income-disabilityMonthlyAmount">Gross Monthly Income</Label>
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

              {/* Borrower Employer Cards */}
              {form.watch('income.incomeTypes.employment') && (borrowerEmployerCards || ['default']).map((cardId, index) => {
                const propertyId = cardId === 'default' ? 'template-card' : cardId;
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                return (
                  <Card key={cardId} className="transition-colors duration-200">
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className="flex items-center gap-2">
                              Borrower Employer
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Add Employer Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newId = `employer-${Date.now()}`;
                                setBorrowerEmployerCards(prev => [...(prev || ['default']), newId]);
                              }}
                              className="hover:bg-blue-500 hover:text-white"
                              data-testid="button-add-employer"
                              title="Add New Employer"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Employer
                            </Button>
                            
                            {/* Delete Employer Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteEmployerDialog({ isOpen: true, cardId: propertyId })}
                              className="hover:bg-red-500 hover:text-white"
                              data-testid="button-delete-employer"
                              title="Delete Employer"
                            >
                              <Minus className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                            
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-income-property-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`income-property-toggle-${propertyId}-${isOpen}`}
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
                            {/* Employment Type Selection */}
                            <Card className={`bg-muted ${
                              showIncomeCardAnimation[`borrower-employment-${propertyId}`] ? 'animate-roll-down-subject-property' : ''
                            }`}>
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`employment-current-${propertyId}`}
                                        name={`employment-type-${propertyId}`}
                                        data-testid={`radio-employment-current-${propertyId}`}
                                      />
                                      <Label htmlFor={`employment-current-${propertyId}`}>Current Employer</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`employment-prior-${propertyId}`}
                                        name={`employment-type-${propertyId}`}
                                        data-testid={`radio-employment-prior-${propertyId}`}
                                      />
                                      <Label htmlFor={`employment-prior-${propertyId}`}>Prior Employer</Label>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Employment Information - Single Row */}
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-employerName`}>Employer Name</Label>
                                <Controller
                                  control={form.control}
                                  name={getEmployerFieldPath(cardId, 'employerName')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-employerName`}
                                      {...field}
                                      data-testid={`input-${propertyId}-employerName`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                  <Label htmlFor={`${propertyId}-employer-phone`} className="text-xs">
                                    {form.watch('income.isShowingEmploymentVerification') ? 'Job Verification' : 'Employer Phone'}
                                  </Label>
                                  <Switch
                                    checked={form.watch('income.isShowingEmploymentVerification') || false}
                                    onCheckedChange={(checked) => form.setValue('income.isShowingEmploymentVerification', checked)}
                                    data-testid={`toggle-${propertyId}-employment-verification`}
                                    className="scale-[0.8]"
                                  />
                                </div>
                                <Input
                                  id={`${propertyId}-employer-phone`}
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
                                  data-testid={`input-${propertyId}-employer-phone`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-jobTitle`}>Job Title</Label>
                                <Controller
                                  control={form.control}
                                  name={getEmployerFieldPath(cardId, 'jobTitle')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-jobTitle`}
                                      {...field}
                                      data-testid={`input-${propertyId}-jobTitle`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-monthlyIncome`}>Gross Monthly Income</Label>
                                <Controller
                                  control={form.control}
                                  name={getEmployerFieldPath(cardId, 'monthlyIncome')}
                                  defaultValue=""
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-monthlyIncome`}
                                      value={formatDollarDisplay(field.value || '')}
                                      onChange={(e) => {
                                        const rawValue = parseDollarInput(e.target.value);
                                        field.onChange(rawValue);
                                      }}
                                      placeholder="$0.00"
                                      data-testid={`input-${propertyId}-monthlyIncome`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-startDate`}>Start Date</Label>
                                <Input
                                  id={`${propertyId}-startDate`}
                                  type="date"
                                  value={employmentDates[propertyId]?.startDate || ''}
                                  onChange={(e) => {
                                    const startDate = e.target.value;
                                    const currentData = employmentDates[propertyId] || { endDate: '', isPresent: false, duration: '' };
                                    updateEmploymentDuration(propertyId, startDate, currentData.endDate, currentData.isPresent);
                                  }}
                                  placeholder="MM/DD/YYYY"
                                  data-testid={`input-${propertyId}-startDate`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                  <Label htmlFor={`${propertyId}-endDate`} className="text-sm">
                                    {employmentDates[propertyId]?.isPresent ? 'Present' : 'End Date'}
                                  </Label>
                                  <Switch
                                    checked={employmentDates[propertyId]?.isPresent ?? true}
                                    onCheckedChange={(checked) => {
                                      const currentData = employmentDates[propertyId] || { startDate: '', endDate: '', duration: '' };
                                      updateEmploymentDuration(propertyId, currentData.startDate, currentData.endDate, checked);
                                    }}
                                    data-testid={`toggle-${propertyId}-present`}
                                    className="scale-[0.8]"
                                  />
                                </div>
                                <Input
                                  id={`${propertyId}-endDate`}
                                  type={employmentDates[propertyId]?.isPresent ? 'text' : 'date'}
                                  value={employmentDates[propertyId]?.isPresent ? 'present' : (employmentDates[propertyId]?.endDate || '')}
                                  onChange={(e) => {
                                    if (!employmentDates[propertyId]?.isPresent) {
                                      const endDate = e.target.value;
                                      const currentData = employmentDates[propertyId] || { startDate: '', isPresent: false, duration: '' };
                                      updateEmploymentDuration(propertyId, currentData.startDate, endDate, currentData.isPresent);
                                    }
                                  }}
                                  placeholder={employmentDates[propertyId]?.isPresent ? 'Present' : 'MM/DD/YYYY'}
                                  readOnly={employmentDates[propertyId]?.isPresent}
                                  className={employmentDates[propertyId]?.isPresent ? 'bg-muted' : ''}
                                  data-testid={`input-${propertyId}-endDate`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-employment-duration`}>Employment Duration</Label>
                                <Input
                                  id={`${propertyId}-employment-duration`}
                                  value={employmentDates[propertyId]?.duration || ''}
                                  placeholder={employmentDates[propertyId]?.isPresent ? 'Enter' : '0'}
                                  readOnly={!employmentDates[propertyId]?.isPresent}
                                  className={!employmentDates[propertyId]?.isPresent ? 'bg-muted' : ''}
                                  onChange={(e) => {
                                    if (employmentDates[propertyId]?.isPresent) {
                                      const currentData = employmentDates[propertyId] || { startDate: '', endDate: '', isPresent: false };
                                      setEmploymentDates(prev => ({
                                        ...prev,
                                        [propertyId]: {
                                          ...currentData,
                                          duration: e.target.value
                                        }
                                      }));
                                    }
                                  }}
                                  data-testid={`input-${propertyId}-employment-duration`}
                                />
                              </div>
                            </div>

                            {/* Employer Address Row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="space-y-2 md:col-span-3">
                                <Label htmlFor="template-employer-street">Street Address</Label>
                                <Input
                                  id="template-employer-street"
                                  data-testid="input-template-employer-street"
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor="template-employer-unit">Unit/Suite</Label>
                                <Input
                                  id="template-employer-unit"
                                  data-testid="input-template-employer-unit"
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="template-employer-city">City</Label>
                                <Input
                                  id="template-employer-city"
                                  data-testid="input-template-employer-city"
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor="template-employer-state">State</Label>
                                <Select
                                  value=""
                                  onValueChange={() => {}}
                                >
                                  <SelectTrigger data-testid="select-template-employer-state">
                                    <SelectValue placeholder="Select" />
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
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor="template-employer-zip">ZIP Code</Label>
                                <Input
                                  id="template-employer-zip"
                                  data-testid="input-template-employer-zip"
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="template-employer-county">County</Label>
                                <Input
                                  id="template-employer-county"
                                  data-testid="input-template-employer-county"
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="template-employer-employment-type">Full-Time / Part-Time</Label>
                                <Select
                                  value=""
                                  onValueChange={() => {}}
                                >
                                  <SelectTrigger data-testid="select-template-employer-employment-type">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Full-Time">Full-Time</SelectItem>
                                    <SelectItem value="Part-Time">Part-Time</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}

              {/* Borrower Second Employment Cards */}
              {form.watch('income.incomeTypes.secondEmployment') && (borrowerSecondEmployerCards || ['default']).map((cardId, index) => {
                const propertyId = cardId === 'default' ? 'second-template-card' : cardId;
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                return (
                  <Card key={cardId} className="transition-colors duration-200">
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className="flex items-center gap-2">
                              Borrower - Second Employer
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Add Employer Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newId = `second-employer-${Date.now()}`;
                                setBorrowerSecondEmployerCards(prev => [...(prev || ['default']), newId]);
                              }}
                              className="hover:bg-blue-500 hover:text-white"
                              data-testid="button-add-second-employer"
                              title="Add New Employer"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Employer
                            </Button>
                            
                            {/* Delete Employer Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteSecondEmployerDialog({ isOpen: true, cardId: propertyId })}
                              className="hover:bg-red-500 hover:text-white"
                              data-testid="button-delete-second-employer"
                              title="Delete Employer"
                            >
                              <Minus className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                            
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-second-employment-income-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`second-employment-income-${propertyId}-${isOpen}`}
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
                          {/* Employment Type Selection */}
                          <Card className={`bg-muted ${
                            showIncomeCardAnimation['borrower-second-employment'] ? 'animate-roll-down-subject-property' : ''
                          }`}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex gap-4">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="second-employment-current"
                                      name="second-employment-type"
                                      data-testid="radio-second-employment-current"
                                    />
                                    <Label htmlFor="second-employment-current">Current Employer</Label>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="second-employment-prior"
                                      name="second-employment-type"
                                      data-testid="radio-second-employment-prior"
                                    />
                                    <Label htmlFor="second-employment-prior">Prior Employer</Label>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Employment Information - Single Row */}
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`income-secondEmployerName-${cardId}`}>Employer Name</Label>
                              <Input
                                id={`income-secondEmployerName-${cardId}`}
                                {...form.register(getSecondEmployerFieldPath(cardId, 'employerName'))}
                                data-testid={`input-income-secondEmployerName-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor={`income-second-employer-phone-${cardId}`} className="text-xs">
                                  {form.watch(getSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) ? 'Job Verification' : 'Employer Phone'}
                                </Label>
                                <Switch
                                  checked={form.watch(getSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) || false}
                                  onCheckedChange={(checked) => form.setValue(getSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification') as any, checked)}
                                  data-testid={`toggle-second-employment-verification-${cardId}`}
                                  className="scale-[0.8]"
                                />
                              </div>
                              <Input
                                id={`income-second-employer-phone-${cardId}`}
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch(getSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) 
                                  ? (form.watch(getSecondEmployerFieldPath(cardId, 'employmentVerificationPhone')) || '')
                                  : (form.watch(getSecondEmployerFieldPath(cardId, 'employerPhone')) || '')}
                                onChange={(e) => {
                                  const fieldName = form.watch(getSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) 
                                    ? getSecondEmployerFieldPath(cardId, 'employmentVerificationPhone')
                                    : getSecondEmployerFieldPath(cardId, 'employerPhone');
                                  handlePhoneChange(fieldName, e.target.value);
                                }}
                                data-testid={`input-income-second-employer-phone-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`income-secondJobTitle-${cardId}`}>Job Title</Label>
                              <Input
                                id={`income-secondJobTitle-${cardId}`}
                                {...form.register(getSecondEmployerFieldPath(cardId, 'jobTitle'))}
                                data-testid={`input-income-secondJobTitle-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`income-secondMonthlyIncome-${cardId}`}>Gross Monthly Income</Label>
                              <Controller
                                control={form.control}
                                name={getSecondEmployerFieldPath(cardId, 'monthlyIncome')}
                                render={({ field }) => (
                                  <Input
                                    id={`income-secondMonthlyIncome-${cardId}`}
                                    value={formatDollarDisplay(field.value)}
                                    onChange={(e) => {
                                      const rawValue = parseDollarInput(e.target.value);
                                      field.onChange(rawValue);
                                    }}
                                    placeholder="$0.00"
                                    data-testid={`input-income-secondMonthlyIncome-${cardId}`}
                                  />
                                )}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`income-second-startDate-${cardId}`}>Start Date</Label>
                              <Input
                                id={`income-second-startDate-${cardId}`}
                                type="date"
                                value={employmentDates[`second-employment-${cardId}`]?.startDate || ''}
                                onChange={(e) => {
                                  const startDate = e.target.value;
                                  const currentData = employmentDates[`second-employment-${cardId}`] || { endDate: '', isPresent: false, duration: '' };
                                  updateEmploymentDuration(`second-employment-${cardId}`, startDate, currentData.endDate, currentData.isPresent);
                                }}
                                placeholder="MM/DD/YYYY"
                                data-testid={`input-income-second-startDate-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor={`income-second-endDate-${cardId}`} className="text-sm">
                                  {employmentDates[`second-employment-${cardId}`]?.isPresent ? 'Present' : 'End Date'}
                                </Label>
                                <Switch
                                  checked={employmentDates[`second-employment-${cardId}`]?.isPresent ?? true}
                                  onCheckedChange={(checked) => {
                                    const currentData = employmentDates[`second-employment-${cardId}`] || { startDate: '', endDate: '', duration: '' };
                                    updateEmploymentDuration(`second-employment-${cardId}`, currentData.startDate, currentData.endDate, checked);
                                  }}
                                  data-testid="toggle-second-employment-present"
                                  className="scale-[0.8]"
                                />
                              </div>
                              <Input
                                id={`income-second-endDate-${cardId}`}
                                type={employmentDates[`second-employment-${cardId}`]?.isPresent ? 'text' : 'date'}
                                value={employmentDates[`second-employment-${cardId}`]?.isPresent ? 'present' : (employmentDates[`second-employment-${cardId}`]?.endDate || '')}
                                onChange={(e) => {
                                  if (!employmentDates[`second-employment-${cardId}`]?.isPresent) {
                                    const endDate = e.target.value;
                                    const currentData = employmentDates[`second-employment-${cardId}`] || { startDate: '', isPresent: false, duration: '' };
                                    updateEmploymentDuration(`second-employment-${cardId}`, currentData.startDate, endDate, currentData.isPresent);
                                  }
                                }}
                                placeholder={employmentDates[`second-employment-${cardId}`]?.isPresent ? 'Enter' : 'MM/DD/YYYY'}
                                readOnly={employmentDates[`second-employment-${cardId}`]?.isPresent}
                                className={employmentDates[`second-employment-${cardId}`]?.isPresent ? 'bg-muted' : ''}
                                data-testid={`input-income-second-endDate-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-second-employment-duration">Employment Duration</Label>
                              <Input
                                id="income-second-employment-duration"
                                value={employmentDates['second-employment']?.duration || ''}
                                placeholder={employmentDates['second-employment']?.isPresent ? 'Enter' : '0'}
                                readOnly={!employmentDates['second-employment']?.isPresent}
                                className={!employmentDates['second-employment']?.isPresent ? 'bg-muted' : ''}
                                onChange={(e) => {
                                  if (employmentDates['second-employment']?.isPresent) {
                                    const currentData = employmentDates['second-employment'] || { startDate: '', endDate: '', isPresent: false };
                                    setEmploymentDates(prev => ({
                                      ...prev,
                                      'second-employment': {
                                        ...currentData,
                                        duration: e.target.value
                                      }
                                    }));
                                  }
                                }}
                                data-testid="input-income-second-employment-duration"
                              />
                            </div>
                          </div>

                          {/* Employer Address Row */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="space-y-2 md:col-span-3">
                              <Label htmlFor={`income-secondEmployerAddress-street-${cardId}`}>Street Address</Label>
                              <Input
                                id={`income-secondEmployerAddress-street-${cardId}`}
                                {...form.register(getSecondEmployerFieldPath(cardId, 'employerAddress.street'))}
                                data-testid={`input-income-secondEmployerAddress-street-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-1">
                              <Label htmlFor={`income-secondEmployerAddress-unit-${cardId}`}>Unit/Suite</Label>
                              <Input
                                id={`income-secondEmployerAddress-unit-${cardId}`}
                                {...form.register(getSecondEmployerFieldPath(cardId, 'employerAddress.unit'))}
                                data-testid={`input-income-secondEmployerAddress-unit-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-secondEmployerAddress-city">City</Label>
                              <Input
                                id={`income-secondEmployerAddress-city-${cardId}`}
                                {...form.register(getSecondEmployerFieldPath(cardId, 'employerAddress.city'))}
                                data-testid={`input-income-secondEmployerAddress-city-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-1">
                              <Label htmlFor="income-secondEmployerAddress-state">State</Label>
                              <Select
                                value={form.watch(getSecondEmployerFieldPath(cardId, 'employerAddress.state')) || ''}
                                onValueChange={(value) => form.setValue(getSecondEmployerFieldPath(cardId, 'employerAddress.state') as any, value)}
                              >
                                <SelectTrigger data-testid="select-income-secondEmployerAddress-state">
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
                            
                            <div className="space-y-2 md:col-span-1">
                              <Label htmlFor="income-secondEmployerAddress-zip">ZIP Code</Label>
                              <Input
                                id={`income-secondEmployerAddress-zip-${cardId}`}
                                {...form.register(getSecondEmployerFieldPath(cardId, 'employerAddress.zip'))}
                                data-testid={`input-income-secondEmployerAddress-zip-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-secondEmployerAddress-county">County</Label>
                              <Input
                                id={`income-secondEmployerAddress-county-${cardId}`}
                                {...form.register(getSecondEmployerFieldPath(cardId, 'employerAddress.county'))}
                                data-testid={`input-income-secondEmployerAddress-county-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-secondEmploymentType">Full-Time / Part-Time</Label>
                              <Select
                                value={form.watch(getSecondEmployerFieldPath(cardId, 'employmentType')) || ''}
                                onValueChange={(value) => form.setValue(getSecondEmployerFieldPath(cardId, 'employmentType') as any, value)}
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
                          </div>

                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
                );
              })}

              {/* Co-Borrower Income */}
              {hasCoBorrower && (
                <Card className="border-l-4 border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500 transition-colors duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      Co-Borrower Income
                      <span className="text-lg font-semibold" data-testid="text-total-coborrower-income">
                        {totalCoBorrowerIncomeFormatted}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-employment"
                            checked={form.watch('coBorrowerIncome.incomeTypes.employment') || false}
                            onCheckedChange={(checked) => handleIncomeTypeChange('coBorrowerIncome.incomeTypes.employment', !!checked, 'Employment', true)}
                            data-testid="checkbox-coborrower-employment"
                            className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          />
                          <Label htmlFor="coBorrowerIncome-type-employment">Employment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-secondEmployment"
                            checked={form.watch('coBorrowerIncome.incomeTypes.secondEmployment') || false}
                            onCheckedChange={(checked) => handleIncomeTypeChange('coBorrowerIncome.incomeTypes.secondEmployment', !!checked, 'Second Employment', true)}
                            data-testid="checkbox-coborrower-secondEmployment"
                            className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          />
                          <Label htmlFor="coBorrowerIncome-type-secondEmployment">Second Employment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-selfEmployment"
                            checked={form.watch('coBorrowerIncome.incomeTypes.selfEmployment') || false}
                            onCheckedChange={(checked) => {
                            // Prevent unchecking - once checked, can only be removed via Remove button
                            if (!checked && form.watch('coBorrowerIncome.incomeTypes.selfEmployment')) {
                              return; // Do nothing - prevent unchecking
                            }
                            handleIncomeTypeChange('coBorrowerIncome.incomeTypes.selfEmployment', !!checked, 'Self-Employment', true);
                          }}
                            data-testid="checkbox-coborrower-selfEmployment"
                            className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          />
                          <Label htmlFor="coBorrowerIncome-type-selfEmployment">Self-Employment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-pension"
                            checked={form.watch('coBorrowerIncome.incomeTypes.pension') || false}
                            onCheckedChange={(checked) => handleIncomeTypeChange('coBorrowerIncome.incomeTypes.pension', !!checked, 'Pension', true)}
                            data-testid="checkbox-coborrower-pension"
                            className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          />
                          <Label htmlFor="coBorrowerIncome-type-pension">Pension</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-socialSecurity"
                            checked={form.watch('coBorrowerIncome.incomeTypes.socialSecurity') || false}
                            onCheckedChange={(checked) => {
                              // Prevent unchecking - once checked, can only be removed via Remove button
                              if (!checked && form.watch('coBorrowerIncome.incomeTypes.socialSecurity')) {
                                return; // Do nothing - prevent unchecking
                              }
                              handleIncomeTypeChange('coBorrowerIncome.incomeTypes.socialSecurity', !!checked, 'Social Security', true);
                            }}
                            data-testid="checkbox-coborrower-socialSecurity"
                            className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          />
                          <Label htmlFor="coBorrowerIncome-type-socialSecurity">Social Security</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-vaBenefits"
                            checked={form.watch('coBorrowerIncome.incomeTypes.vaBenefits') || false}
                            onCheckedChange={(checked) => {
                              // Prevent unchecking - once checked, can only be removed via Remove button
                              if (!checked && form.watch('coBorrowerIncome.incomeTypes.vaBenefits')) {
                                return; // Do nothing - prevent unchecking
                              }
                              handleIncomeTypeChange('coBorrowerIncome.incomeTypes.vaBenefits', !!checked, 'VA Disability', true);
                            }}
                            data-testid="checkbox-coborrower-vaBenefits"
                            className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          />
                          <Label htmlFor="coBorrowerIncome-type-vaBenefits">VA Disability</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-disability"
                            checked={form.watch('coBorrowerIncome.incomeTypes.disability') || false}
                            onCheckedChange={(checked) => {
                              // Prevent unchecking - once checked, can only be removed via Remove button
                              if (!checked && form.watch('coBorrowerIncome.incomeTypes.disability')) {
                                return; // Do nothing - prevent unchecking
                              }
                              handleIncomeTypeChange('coBorrowerIncome.incomeTypes.disability', !!checked, 'Disability', true);
                            }}
                            data-testid="checkbox-coborrower-disability"
                            className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          />
                          <Label htmlFor="coBorrowerIncome-type-disability">Disability</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="coBorrowerIncome-type-other"
                            checked={form.watch('coBorrowerIncome.incomeTypes.other') || false}
                            onCheckedChange={(checked) => handleIncomeTypeChange('coBorrowerIncome.incomeTypes.other', !!checked, 'Other', true)}
                            data-testid="checkbox-coborrower-other"
                            className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          />
                          <Label htmlFor="coBorrowerIncome-type-other">Other</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Co-Borrower Employment Income Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.employment') && (coBorrowerEmployerCards || ['default']).map((cardId, index) => {
                const propertyId = cardId === 'default' ? 'coborrower-template-card' : cardId;
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                return (
                  <Card key={cardId} className="transition-colors duration-200">
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className="flex items-center gap-2">
                              Co-Borrower Employer
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Add Employer Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newId = `coborrower-employer-${Date.now()}`;
                                setCoBorrowerEmployerCards(prev => [...(prev || ['default']), newId]);
                                setPropertyCardStates(prev => ({ ...prev, [newId]: true }));
                              }}
                              className="hover:bg-blue-500 hover:text-white"
                              data-testid="button-add-coborrower-employer"
                              title="Add New Employer"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Employer
                            </Button>
                            
                            {/* Delete Employer Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteCoBorrowerEmployerDialog({ isOpen: true, cardId: propertyId })}
                              className="hover:bg-red-500 hover:text-white"
                              data-testid="button-delete-coborrower-employer"
                              title="Delete Employer"
                            >
                              <Minus className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                            
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-coborrower-income-property-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`coborrower-income-property-toggle-${propertyId}-${isOpen}`}
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
                            {/* Employment Type Selection */}
                            <Card className={`bg-muted ${
                              showIncomeCardAnimation[`co-borrower-employment-${propertyId}`] ? 'animate-roll-down-subject-property' : ''
                            }`}>
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`coborrower-employment-current-${propertyId}`}
                                        name={`coborrower-employment-type-${propertyId}`}
                                        data-testid={`radio-coborrower-employment-current-${propertyId}`}
                                      />
                                      <Label htmlFor={`coborrower-employment-current-${propertyId}`}>Current Employer</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`coborrower-employment-prior-${propertyId}`}
                                        name={`coborrower-employment-type-${propertyId}`}
                                        data-testid={`radio-coborrower-employment-prior-${propertyId}`}
                                      />
                                      <Label htmlFor={`coborrower-employment-prior-${propertyId}`}>Prior Employer</Label>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Employment Information - Single Row */}
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-coborrower-employerName`}>Employer Name</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'employerName')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-coborrower-employerName`}
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                      data-testid={`input-${propertyId}-coborrower-employerName`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                  <Label htmlFor={`${propertyId}-coborrower-employer-phone`} className="text-xs">
                                    {form.watch(getCoBorrowerEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) ? 'Job Verification' : 'Employer Phone'}
                                  </Label>
                                  <Switch
                                    checked={form.watch(getCoBorrowerEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) || false}
                                    onCheckedChange={(checked) => form.setValue(getCoBorrowerEmployerFieldPath(cardId, 'isShowingEmploymentVerification'), checked)}
                                    data-testid={`toggle-${propertyId}-coborrower-employment-verification`}
                                    className="scale-[0.8]"
                                  />
                                </div>
                                <Controller
                                  control={form.control}
                                  name={form.watch(getCoBorrowerEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) 
                                    ? getCoBorrowerEmployerFieldPath(cardId, 'employmentVerificationPhone')
                                    : getCoBorrowerEmployerFieldPath(cardId, 'employerPhone')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-coborrower-employer-phone`}
                                      placeholder="(XXX) XXX-XXXX"
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        const formattedValue = formatPhoneNumber(e.target.value);
                                        field.onChange(formattedValue);
                                      }}
                                      data-testid={`input-${propertyId}-coborrower-employer-phone`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-coborrower-jobTitle`}>Job Title</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'jobTitle')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-coborrower-jobTitle`}
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                      data-testid={`input-${propertyId}-coborrower-jobTitle`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-coborrower-monthlyIncome`}>Gross Monthly Income</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'monthlyIncome')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-coborrower-monthlyIncome`}
                                      value={formatDollarDisplay(field.value)}
                                      onChange={(e) => {
                                        const rawValue = parseDollarInput(e.target.value);
                                        field.onChange(rawValue);
                                      }}
                                      placeholder="$0.00"
                                      data-testid={`input-${propertyId}-coborrower-monthlyIncome`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-coborrower-startDate`}>Start Date</Label>
                                <Input
                                  id={`${propertyId}-coborrower-startDate`}
                                  type="date"
                                  value={employmentDates[propertyId]?.startDate || ''}
                                  onChange={(e) => {
                                    const startDate = e.target.value;
                                    const currentData = employmentDates[propertyId] || { endDate: '', isPresent: false, duration: '' };
                                    updateEmploymentDuration(propertyId, startDate, currentData.endDate, currentData.isPresent);
                                  }}
                                  placeholder="MM/DD/YYYY"
                                  data-testid={`input-${propertyId}-coborrower-startDate`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                  <Label htmlFor={`${propertyId}-coborrower-endDate`} className="text-sm">
                                    {employmentDates[propertyId]?.isPresent ? 'Present' : 'End Date'}
                                  </Label>
                                  <Switch
                                    checked={employmentDates[propertyId]?.isPresent ?? true}
                                    onCheckedChange={(checked) => {
                                      const currentData = employmentDates[propertyId] || { startDate: '', endDate: '', duration: '' };
                                      updateEmploymentDuration(propertyId, currentData.startDate, currentData.endDate, checked);
                                    }}
                                    data-testid={`toggle-${propertyId}-coborrower-present`}
                                    className="scale-[0.8]"
                                  />
                                </div>
                                <Input
                                  id={`${propertyId}-coborrower-endDate`}
                                  type={employmentDates[propertyId]?.isPresent ? 'text' : 'date'}
                                  value={employmentDates[propertyId]?.isPresent ? 'present' : (employmentDates[propertyId]?.endDate || '')}
                                  onChange={(e) => {
                                    if (!employmentDates[propertyId]?.isPresent) {
                                      const endDate = e.target.value;
                                      const currentData = employmentDates[propertyId] || { startDate: '', isPresent: false, duration: '' };
                                      updateEmploymentDuration(propertyId, currentData.startDate, endDate, currentData.isPresent);
                                    }
                                  }}
                                  placeholder={employmentDates[propertyId]?.isPresent ? 'Present' : 'MM/DD/YYYY'}
                                  readOnly={employmentDates[propertyId]?.isPresent}
                                  className={employmentDates[propertyId]?.isPresent ? 'bg-muted' : ''}
                                  data-testid={`input-${propertyId}-coborrower-endDate`}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`${propertyId}-coborrower-employment-duration`}>Employment Duration</Label>
                                <Input
                                  id={`${propertyId}-coborrower-employment-duration`}
                                  value={employmentDates[propertyId]?.duration || ''}
                                  placeholder={employmentDates[propertyId]?.isPresent ? 'Enter' : '0'}
                                  readOnly={!employmentDates[propertyId]?.isPresent}
                                  className={!employmentDates[propertyId]?.isPresent ? 'bg-muted' : ''}
                                  onChange={(e) => {
                                    if (employmentDates[propertyId]?.isPresent) {
                                      const currentData = employmentDates[propertyId] || { startDate: '', endDate: '', isPresent: false };
                                      setEmploymentDates(prev => ({
                                        ...prev,
                                        [propertyId]: {
                                          ...currentData,
                                          duration: e.target.value
                                        }
                                      }));
                                    }
                                  }}
                                  data-testid={`input-${propertyId}-coborrower-employment-duration`}
                                />
                              </div>
                            </div>

                            {/* Employer Address Row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="space-y-2 md:col-span-3">
                                <Label htmlFor={`${propertyId}-coborrower-employer-street`}>Street Address</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'employerAddress.street')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-coborrower-employer-street`}
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                      data-testid={`input-${propertyId}-coborrower-employer-street`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`${propertyId}-coborrower-employer-unit`}>Unit/Suite</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'employerAddress.unit')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-coborrower-employer-unit`}
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                      data-testid={`input-${propertyId}-coborrower-employer-unit`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`${propertyId}-coborrower-employer-city`}>City</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'employerAddress.city')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-coborrower-employer-city`}
                                      value={field.value || ''}
                                      onChange={field.onChange}
                                      data-testid={`input-${propertyId}-coborrower-employer-city`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`${propertyId}-coborrower-employer-state`}>State</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'employerAddress.state')}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value || ''}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger data-testid={`select-${propertyId}-coborrower-employer-state`}>
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {US_STATES.map((state) => (
                                          <SelectItem key={state.value} value={state.value}>
                                            {state.value}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`${propertyId}-coborrower-employer-zip`}>ZIP Code</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'employerAddress.zip')}
                                  render={({ field }) => (
                                    <Input
                                      id={`${propertyId}-coborrower-employer-zip`}
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        handleCoBorrowerEmployerZipCodeLookup(e.target.value, propertyId);
                                      }}
                                      data-testid={`input-${propertyId}-coborrower-employer-zip`}
                                    />
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`${propertyId}-coborrower-employer-county`}>County</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'employerAddress.county')}
                                  render={({ field }) => (
                                    <>
                                      {coBorrowerEmployerCountyOptions[propertyId]?.length > 0 ? (
                                        <Select
                                          value={field.value || ''}
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            setCoBorrowerEmployerCountyOptions(prev => ({...prev, [propertyId]: []}));
                                          }}
                                        >
                                          <SelectTrigger data-testid={`select-${propertyId}-coborrower-employer-county`}>
                                            <SelectValue placeholder={countyLookupLoading.coBorrowerEmployer[propertyId] ? "Looking up counties..." : "Select county"} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {coBorrowerEmployerCountyOptions[propertyId]?.map((option) => (
                                              <SelectItem key={option.value} value={option.label}>
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Input
                                          id={`${propertyId}-coborrower-employer-county`}
                                          value={field.value || ''}
                                          onChange={field.onChange}
                                          placeholder={countyLookupLoading.coBorrowerEmployer[propertyId] ? "Looking up counties..." : ""}
                                          disabled={countyLookupLoading.coBorrowerEmployer[propertyId]}
                                          data-testid={`input-${propertyId}-coborrower-employer-county`}
                                        />
                                      )}
                                    </>
                                  )}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`${propertyId}-coborrower-employer-employment-type`}>Full-Time / Part-Time</Label>
                                <Controller
                                  control={form.control}
                                  name={getCoBorrowerEmployerFieldPath(cardId, 'employmentType')}
                                  render={({ field }) => (
                                    <Select
                                      value={field.value || ''}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger data-testid={`select-${propertyId}-coborrower-employer-employment-type`}>
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Full-Time">Full-Time</SelectItem>
                                        <SelectItem value="Part-Time">Part-Time</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}

              {/* Co-borrower Second Employment Cards */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.secondEmployment') && (coBorrowerSecondEmployerCards || ['default']).map((cardId, index) => {
                const propertyId = cardId === 'default' ? 'coborrower-second-template-card' : cardId;
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                return (
                  <Card key={cardId} className="transition-colors duration-200">
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className="flex items-center gap-2">
                              Co-borrower - Second Employer
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Add Employer Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newId = `coborrower-second-employer-${Date.now()}`;
                                setCoBorrowerSecondEmployerCards(prev => [...(prev || ['default']), newId]);
                              }}
                              className="hover:bg-blue-500 hover:text-white"
                              data-testid="button-add-coborrower-second-employer"
                              title="Add New Employer"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Employer
                            </Button>
                            
                            {/* Delete Employer Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteCoBorrowerSecondEmployerDialog({ isOpen: true, cardId: propertyId })}
                              className="hover:bg-red-500 hover:text-white"
                              data-testid="button-delete-coborrower-second-employer"
                              title="Delete Employer"
                            >
                              <Minus className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                            
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-coborrower-second-employment-income-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`coborrower-second-employment-income-${propertyId}-${isOpen}`}
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
                          {/* Employment Type Selection */}
                          <Card className={`bg-muted ${
                            showIncomeCardAnimation['co-borrower-second-employment'] ? 'animate-roll-down-subject-property' : ''
                          }`}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex gap-4">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="coborrower-second-employment-current"
                                      name="coborrower-second-employment-type"
                                      data-testid="radio-coborrower-second-employment-current"
                                    />
                                    <Label htmlFor="coborrower-second-employment-current">Current Employer</Label>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="coborrower-second-employment-prior"
                                      name="coborrower-second-employment-type"
                                      data-testid="radio-coborrower-second-employment-prior"
                                    />
                                    <Label htmlFor="coborrower-second-employment-prior">Prior Employer</Label>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Employment Information - Single Row */}
                          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`coBorrowerIncome-secondEmployerName-${cardId}`}>Employer Name</Label>
                              <Input
                                id={`coBorrowerIncome-secondEmployerName-${cardId}`}
                                {...form.register(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerName'))}
                                data-testid={`input-coBorrowerIncome-secondEmployerName-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor={`coBorrowerIncome-second-employer-phone-${cardId}`} className="text-xs">
                                  {form.watch(getCoBorrowerSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) ? 'Job Verification' : 'Employer Phone'}
                                </Label>
                                <Switch
                                  checked={form.watch(getCoBorrowerSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) || false}
                                  onCheckedChange={(checked) => form.setValue(getCoBorrowerSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification') as any, checked)}
                                  data-testid={`toggle-coborrower-second-employment-verification-${cardId}`}
                                  className="scale-[0.8]"
                                />
                              </div>
                              <Input
                                id={`coBorrowerIncome-second-employer-phone-${cardId}`}
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch(getCoBorrowerSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) 
                                  ? (form.watch(getCoBorrowerSecondEmployerFieldPath(cardId, 'employmentVerificationPhone')) || '')
                                  : (form.watch(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerPhone')) || '')}
                                onChange={(e) => {
                                  const fieldName = form.watch(getCoBorrowerSecondEmployerFieldPath(cardId, 'isShowingEmploymentVerification')) 
                                    ? getCoBorrowerSecondEmployerFieldPath(cardId, 'employmentVerificationPhone')
                                    : getCoBorrowerSecondEmployerFieldPath(cardId, 'employerPhone');
                                  handlePhoneChange(fieldName, e.target.value);
                                }}
                                data-testid={`input-coBorrowerIncome-second-employer-phone-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`coBorrowerIncome-secondJobTitle-${cardId}`}>Job Title</Label>
                              <Input
                                id={`coBorrowerIncome-secondJobTitle-${cardId}`}
                                {...form.register(getCoBorrowerSecondEmployerFieldPath(cardId, 'jobTitle'))}
                                data-testid={`input-coBorrowerIncome-secondJobTitle-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`coBorrowerIncome-secondMonthlyIncome-${cardId}`}>Gross Monthly Income</Label>
                              <Controller
                                control={form.control}
                                name={getCoBorrowerSecondEmployerFieldPath(cardId, 'monthlyIncome')}
                                render={({ field }) => (
                                  <Input
                                    id={`coBorrowerIncome-secondMonthlyIncome-${cardId}`}
                                    value={formatDollarDisplay(field.value)}
                                    onChange={(e) => {
                                      const rawValue = parseDollarInput(e.target.value);
                                      field.onChange(rawValue);
                                    }}
                                    placeholder="$0.00"
                                    data-testid={`input-coBorrowerIncome-secondMonthlyIncome-${cardId}`}
                                  />
                                )}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`coBorrowerIncome-second-startDate-${cardId}`}>Start Date</Label>
                              <Input
                                id={`coBorrowerIncome-second-startDate-${cardId}`}
                                type="date"
                                value={employmentDates[`coborrower-second-employment-${cardId}`]?.startDate || ''}
                                onChange={(e) => {
                                  const startDate = e.target.value;
                                  const currentData = employmentDates[`coborrower-second-employment-${cardId}`] || { endDate: '', isPresent: false, duration: '' };
                                  updateEmploymentDuration(`coborrower-second-employment-${cardId}`, startDate, currentData.endDate, currentData.isPresent);
                                }}
                                placeholder="MM/DD/YYYY"
                                data-testid={`input-coBorrowerIncome-second-startDate-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between mb-2">
                                <Label htmlFor={`coBorrowerIncome-second-endDate-${cardId}`} className="text-sm">
                                  {employmentDates[`coborrower-second-employment-${cardId}`]?.isPresent ? 'Present' : 'End Date'}
                                </Label>
                                <Switch
                                  checked={employmentDates[`coborrower-second-employment-${cardId}`]?.isPresent ?? true}
                                  onCheckedChange={(checked) => {
                                    const currentData = employmentDates[`coborrower-second-employment-${cardId}`] || { startDate: '', endDate: '', duration: '' };
                                    updateEmploymentDuration(`coborrower-second-employment-${cardId}`, currentData.startDate, currentData.endDate, checked);
                                  }}
                                  data-testid="toggle-coborrower-second-employment-present"
                                  className="scale-[0.8]"
                                />
                              </div>
                              <Input
                                id={`coBorrowerIncome-second-endDate-${cardId}`}
                                type={employmentDates[`coborrower-second-employment-${cardId}`]?.isPresent ? 'text' : 'date'}
                                value={employmentDates[`coborrower-second-employment-${cardId}`]?.isPresent ? 'present' : (employmentDates[`coborrower-second-employment-${cardId}`]?.endDate || '')}
                                onChange={(e) => {
                                  if (!employmentDates[`coborrower-second-employment-${cardId}`]?.isPresent) {
                                    const endDate = e.target.value;
                                    const currentData = employmentDates[`coborrower-second-employment-${cardId}`] || { startDate: '', isPresent: false, duration: '' };
                                    updateEmploymentDuration(`coborrower-second-employment-${cardId}`, currentData.startDate, endDate, currentData.isPresent);
                                  }
                                }}
                                placeholder={employmentDates[`coborrower-second-employment-${cardId}`]?.isPresent ? 'Enter' : 'MM/DD/YYYY'}
                                readOnly={employmentDates[`coborrower-second-employment-${cardId}`]?.isPresent}
                                className={employmentDates[`coborrower-second-employment-${cardId}`]?.isPresent ? 'bg-muted' : ''}
                                data-testid={`input-coBorrowerIncome-second-endDate-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-second-employment-duration">Employment Duration</Label>
                              <Input
                                id="coBorrowerIncome-second-employment-duration"
                                value={employmentDates['coborrower-second-employment']?.duration || ''}
                                placeholder={employmentDates['coborrower-second-employment']?.isPresent ? 'Enter' : '0'}
                                readOnly={!employmentDates['coborrower-second-employment']?.isPresent}
                                className={!employmentDates['coborrower-second-employment']?.isPresent ? 'bg-muted' : ''}
                                onChange={(e) => {
                                  if (employmentDates['coborrower-second-employment']?.isPresent) {
                                    const currentData = employmentDates['coborrower-second-employment'] || { startDate: '', endDate: '', isPresent: false };
                                    setEmploymentDates(prev => ({
                                      ...prev,
                                      'coborrower-second-employment': {
                                        ...currentData,
                                        duration: e.target.value
                                      }
                                    }));
                                  }
                                }}
                                data-testid="input-coBorrowerIncome-second-employment-duration"
                              />
                            </div>
                          </div>

                          {/* Employer Address Row */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="space-y-2 md:col-span-3">
                              <Label htmlFor={`coBorrowerIncome-secondEmployerAddress-street-${cardId}`}>Street Address</Label>
                              <Input
                                id={`coBorrowerIncome-secondEmployerAddress-street-${cardId}`}
                                {...form.register(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.street'))}
                                data-testid={`input-coBorrowerIncome-secondEmployerAddress-street-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-1">
                              <Label htmlFor={`coBorrowerIncome-secondEmployerAddress-unit-${cardId}`}>Unit/Suite</Label>
                              <Input
                                id={`coBorrowerIncome-secondEmployerAddress-unit-${cardId}`}
                                {...form.register(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.unit'))}
                                data-testid={`input-coBorrowerIncome-secondEmployerAddress-unit-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-secondEmployerAddress-city">City</Label>
                              <Input
                                id={`coBorrowerIncome-secondEmployerAddress-city-${cardId}`}
                                {...form.register(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.city'))}
                                data-testid={`input-coBorrowerIncome-secondEmployerAddress-city-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-1">
                              <Label htmlFor="coBorrowerIncome-secondEmployerAddress-state">State</Label>
                              <Select
                                value={form.watch(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.state')) || ''}
                                onValueChange={(value) => form.setValue(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.state') as any, value)}
                              >
                                <SelectTrigger data-testid="select-coBorrowerIncome-secondEmployerAddress-state">
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
                            
                            <div className="space-y-2 md:col-span-1">
                              <Label htmlFor="coBorrowerIncome-secondEmployerAddress-zip">ZIP Code</Label>
                              <Input
                                id={`coBorrowerIncome-secondEmployerAddress-zip-${cardId}`}
                                {...form.register(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.zip'))}
                                onChange={(e) => {
                                  form.setValue(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.zip') as any, e.target.value);
                                  handleCoBorrowerSecondEmployerZipCodeLookup(e.target.value, cardId);
                                }}
                                data-testid={`input-coBorrowerIncome-secondEmployerAddress-zip-${cardId}`}
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-secondEmployerAddress-county">County</Label>
                              {(coBorrowerSecondEmployerCountyOptions[cardId] || []).length > 0 ? (
                                <Select
                                  value={form.watch(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.county')) || ''}
                                  onValueChange={(value) => form.setValue(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.county') as any, value)}
                                >
                                  <SelectTrigger data-testid={`select-coBorrowerIncome-secondEmployerAddress-county-${cardId}`}>
                                    <SelectValue placeholder="Select county" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(coBorrowerSecondEmployerCountyOptions[cardId] || []).map((county) => (
                                      <SelectItem key={county.value} value={county.label}>
                                        {county.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  id={`coBorrowerIncome-secondEmployerAddress-county-${cardId}`}
                                  {...form.register(getCoBorrowerSecondEmployerFieldPath(cardId, 'employerAddress.county'))}
                                  data-testid={`input-coBorrowerIncome-secondEmployerAddress-county-${cardId}`}
                                />
                              )}
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-secondEmploymentType">Full-Time / Part-Time</Label>
                              <Select
                                value={form.watch(getCoBorrowerSecondEmployerFieldPath(cardId, 'employmentType')) || ''}
                                onValueChange={(value) => form.setValue(getCoBorrowerSecondEmployerFieldPath(cardId, 'employmentType') as any, value)}
                              >
                                <SelectTrigger data-testid="select-coBorrowerIncome-secondEmploymentType">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Full-Time">Full-Time</SelectItem>
                                  <SelectItem value="Part-Time">Part-Time</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
                );
              })}

              {/* Co-Borrower - Self-Employment Cards */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.selfEmployment') && (coBorrowerSelfEmploymentCards || ['default']).map((cardId, index) => {
                const propertyId = cardId === 'default' ? 'co-borrower-self-employment-template-card' : cardId;
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                return (
                  <Card key={cardId} className="transition-colors duration-200">
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className="flex items-center gap-2">
                              Co-Borrower - Self-Employment
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Add Self-Employment Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newId = `co-borrower-self-employment-${Date.now()}`;
                                setCoBorrowerSelfEmploymentCards(prev => [...(prev || ['default']), newId]);
                              }}
                              className="hover:bg-blue-500 hover:text-white"
                              data-testid="button-add-co-borrower-self-employment"
                              title="Add New Co-Borrower Self-Employment"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Self-Employment
                            </Button>
                            
                            {/* Delete Self-Employment Button - always show for default card, conditionally for additional cards */}
                            {(cardId === 'default' || (coBorrowerSelfEmploymentCards || []).length > 1) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteCoBorrowerSelfEmploymentDialog({ isOpen: true, cardId: propertyId })}
                                className="hover:bg-red-500 hover:text-white"
                                data-testid={`button-delete-co-borrower-self-employment-${cardId}`}
                                title="Delete Co-Borrower Self-Employment"
                              >
                                <Minus className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                            
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-co-borrower-self-employment-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`co-borrower-self-employment-${propertyId}-${isOpen}`}
                              >
                                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      {/* Employment Type Selection */}
                      <Card className={`bg-muted ${
                        showIncomeCardAnimation['co-borrower-self-employment'] ? 'animate-roll-down-subject-property' : ''
                      }`}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`co-borrower-self-employment-current-${cardId}`}
                                  name={`co-borrower-self-employment-type-${cardId}`}
                                  data-testid="radio-co-borrower-self-employment-current"
                                />
                                <Label htmlFor={`co-borrower-self-employment-current-${cardId}`}>Current</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`co-borrower-self-employment-prior-${cardId}`}
                                  name={`co-borrower-self-employment-type-${cardId}`}
                                  data-testid="radio-co-borrower-self-employment-prior"
                                />
                                <Label htmlFor={`co-borrower-self-employment-prior-${cardId}`}>Prior</Label>
                                <button
                                  type="button"
                                  onClick={() => openCoBorrowerBusinessDescriptionDialog(cardId)}
                                  className={`transition-colors ml-6 flex items-center justify-center w-4 h-4 rounded-full border ${
                                    form.watch('coBorrowerIncome.businessDescription') 
                                      ? 'bg-purple-500 border-purple-500 text-white hover:bg-purple-600' 
                                      : 'text-blue-600 hover:text-blue-800 border-blue-600 hover:border-blue-800'
                                  }`}
                                  data-testid="button-co-borrower-business-description-info"
                                  title="Add business description"
                                >
                                  <span className="text-[10px] font-bold">D</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openCoBorrowerTaxPreparerDialog(cardId)}
                                  className={`transition-colors ml-2 flex items-center justify-center w-4 h-4 rounded-full border ${
                                    form.watch('coBorrowerIncome.taxesPreparedBy') 
                                      ? 'bg-purple-500 border-purple-500 text-white hover:bg-purple-600' 
                                      : 'text-blue-600 hover:text-blue-800 border-blue-600 hover:border-blue-800'
                                  }`}
                                  data-testid="button-co-borrower-tax-preparer-info"
                                  title="Tax preparer information"
                                >
                                  <span className="text-[10px] font-bold">T</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* First row with business details */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`coBorrowerIncome-businessName-${cardId}`}>Business / DBA Name</Label>
                          <Input
                            id={`coBorrowerIncome-businessName-${cardId}`}
                            {...form.register(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessName') as any)}
                            data-testid={`input-coBorrowerIncome-businessName-${cardId}`}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`coBorrowerIncome-businessPhone-${cardId}`}>Phone</Label>
                          <Input
                            id={`coBorrowerIncome-businessPhone-${cardId}`}
                            placeholder="(XXX) XXX-XXXX"
                            value={form.watch(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessPhone') as any) || ''}
                            onChange={(e) => handlePhoneChange(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessPhone') as any, e.target.value)}
                            data-testid={`input-coBorrowerIncome-businessPhone-${cardId}`}
                          />
                        </div>
                        
                        
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={`coBorrowerIncome-annualRevenue-${cardId}`} className="text-sm">
                              {isCoBorrowerShowingNetRevenue ? 'Net Monthly Income' : 'Gross Monthly Income'}
                            </Label>
                            <Switch
                              checked={isCoBorrowerShowingNetRevenue}
                              onCheckedChange={setIsCoBorrowerShowingNetRevenue}
                              data-testid={`toggle-coBorrowerIncome-annual-revenue-${cardId}`}
                              className="scale-[0.8]"
                            />
                          </div>
                          <Input
                            id={`coBorrowerIncome-annualRevenue-${cardId}`}
                            type="text"
                            placeholder="$0"
                            value={(() => {
                              const fieldName = isCoBorrowerShowingNetRevenue ? getCoBorrowerSelfEmploymentFieldPath(cardId, 'netAnnualRevenue') : getCoBorrowerSelfEmploymentFieldPath(cardId, 'grossAnnualRevenue');
                              const val = form.watch(fieldName as any);
                              if (!val) return '';
                              const numVal = val.replace(/[^\d]/g, '');
                              return numVal ? `$${numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '';
                            })()}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^\d]/g, '');
                              const fieldName = isCoBorrowerShowingNetRevenue ? getCoBorrowerSelfEmploymentFieldPath(cardId, 'netAnnualRevenue') : getCoBorrowerSelfEmploymentFieldPath(cardId, 'grossAnnualRevenue');
                              form.setValue(fieldName as any, value, { shouldDirty: true, shouldTouch: true });
                            }}
                            data-testid={`input-coBorrowerIncome-annualRevenue-${cardId}`}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`coBorrowerIncome-self-employment-startDate-${cardId}`}>Start Date</Label>
                          <Input
                            id={`coBorrowerIncome-self-employment-startDate-${cardId}`}
                            type="date"
                            value={employmentDates[`co-borrower-self-employment-${cardId}`]?.startDate || ''}
                            onChange={(e) => {
                              const startDate = e.target.value;
                              const currentData = employmentDates[`co-borrower-self-employment-${cardId}`] || { endDate: '', isPresent: false, duration: '' };
                              updateEmploymentDuration(`co-borrower-self-employment-${cardId}`, startDate, currentData.endDate, currentData.isPresent);
                            }}
                            placeholder="MM/DD/YYYY"
                            data-testid={`input-coBorrowerIncome-self-employment-startDate-${cardId}`}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={`coBorrowerIncome-self-employment-endDate-${cardId}`} className="text-sm">
                              {employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent ? 'Present' : 'End Date'}
                            </Label>
                            <Switch
                              checked={employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent ?? true}
                              onCheckedChange={(checked) => {
                                const currentData = employmentDates[`co-borrower-self-employment-${cardId}`] || { startDate: '', endDate: '', duration: '' };
                                updateEmploymentDuration(`co-borrower-self-employment-${cardId}`, currentData.startDate, currentData.endDate, checked);
                              }}
                              data-testid={`toggle-co-borrower-self-employment-present-${cardId}`}
                              className="scale-[0.8]"
                            />
                          </div>
                          <Input
                            id={`coBorrowerIncome-self-employment-endDate-${cardId}`}
                            type={employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent ? 'text' : 'date'}
                            value={employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent ? 'present' : (employmentDates[`co-borrower-self-employment-${cardId}`]?.endDate || '')}
                            onChange={(e) => {
                              if (!employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent) {
                                const endDate = e.target.value;
                                const currentData = employmentDates[`co-borrower-self-employment-${cardId}`] || { startDate: '', isPresent: false, duration: '' };
                                updateEmploymentDuration(`co-borrower-self-employment-${cardId}`, currentData.startDate, endDate, currentData.isPresent);
                              }
                            }}
                            placeholder={employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent ? 'Present' : 'MM/DD/YYYY'}
                            readOnly={employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent}
                            className={employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent ? 'bg-muted' : ''}
                            data-testid={`input-coBorrowerIncome-self-employment-endDate-${cardId}`}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`coBorrowerIncome-self-employment-duration-${cardId}`}>Duration</Label>
                          <Input
                            id={`coBorrowerIncome-self-employment-duration-${cardId}`}
                            value={employmentDates[`co-borrower-self-employment-${cardId}`]?.duration || ''}
                            placeholder={employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent ? 'Enter' : '0'}
                            readOnly={!employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent}
                            className={!employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent ? 'bg-muted' : ''}
                            onChange={(e) => {
                              if (employmentDates[`co-borrower-self-employment-${cardId}`]?.isPresent) {
                                const currentData = employmentDates[`co-borrower-self-employment-${cardId}`] || { startDate: '', endDate: '', isPresent: false };
                                setEmploymentDates(prev => ({
                                  ...prev,
                                  [`co-borrower-self-employment-${cardId}`]: {
                                    ...currentData,
                                    duration: e.target.value
                                  }
                                }));
                              }
                            }}
                            data-testid={`input-coBorrowerIncome-self-employment-duration-${cardId}`}
                          />
                        </div>
                      </div>
                        
                        {/* Business Address Row (copied from borrower residence address) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="space-y-2 md:col-span-3">
                            <Label htmlFor={`coBorrowerIncome-business-street-${cardId}`}>Street Address</Label>
                            <Input
                              id={`coBorrowerIncome-business-street-${cardId}`}
                              {...form.register(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessAddress.street') as any)}
                              data-testid={`input-coBorrowerIncome-business-street-${cardId}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-1">
                            <Label htmlFor={`coBorrowerIncome-business-unit-${cardId}`}>Unit/Suite</Label>
                            <Input
                              id={`coBorrowerIncome-business-unit-${cardId}`}
                              {...form.register(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessAddress.unit') as any)}
                              data-testid={`input-coBorrowerIncome-business-unit-${cardId}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`coBorrowerIncome-business-city-${cardId}`}>City</Label>
                            <Input
                              id={`coBorrowerIncome-business-city-${cardId}`}
                              {...form.register(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessAddress.city') as any)}
                              data-testid={`input-coBorrowerIncome-business-city-${cardId}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-1">
                            <Label htmlFor={`coBorrowerIncome-business-state-${cardId}`}>State</Label>
                            <Select
                              value={form.watch(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessAddress.state') as any) || ''}
                              onValueChange={(value) => form.setValue(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessAddress.state') as any, value)}
                            >
                              <SelectTrigger data-testid={`select-coBorrowerIncome-business-state-${cardId}`}>
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
                          
                          <div className="space-y-2 md:col-span-1">
                            <Label htmlFor={`coBorrowerIncome-business-zip-${cardId}`}>ZIP Code</Label>
                            <Input
                              id={`coBorrowerIncome-business-zip-${cardId}`}
                              {...form.register(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessAddress.zip') as any)}
                              data-testid={`input-coBorrowerIncome-business-zip-${cardId}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`coBorrowerIncome-business-county-${cardId}`}>County</Label>
                            <Input
                              id={`coBorrowerIncome-business-county-${cardId}`}
                              {...form.register(getCoBorrowerSelfEmploymentFieldPath(cardId, 'businessAddress.county') as any)}
                              data-testid={`input-coBorrowerIncome-business-county-${cardId}`}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`coBorrowerIncome-formation-${cardId}`}>Formation</Label>
                            <Select onValueChange={(value) => form.setValue(getCoBorrowerSelfEmploymentFieldPath(cardId, 'formation') as any, value)} value={form.watch(getCoBorrowerSelfEmploymentFieldPath(cardId, 'formation') as any) || ''}>
                              <SelectTrigger data-testid={`select-coBorrowerIncome-formation-${cardId}`}>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sole Proprietorship" data-testid="select-item-sole-proprietorship">Sole Proprietorship</SelectItem>
                                <SelectItem value="General Partnership (GP)" data-testid="select-item-general-partnership">General Partnership (GP)</SelectItem>
                                <SelectItem value="Limited Partnership (LP)" data-testid="select-item-limited-partnership">Limited Partnership (LP)</SelectItem>
                                <SelectItem value="Limited Liability Partnership (LLP)" data-testid="select-item-llp">Limited Liability Partnership (LLP)</SelectItem>
                                <SelectItem value="LLC taxed as S-Corp" data-testid="select-item-llc-s-corp">LLC taxed as S-Corp</SelectItem>
                                <SelectItem value="LLC taxed as C-Corp" data-testid="select-item-llc-c-corp">LLC taxed as C-Corp</SelectItem>
                                <SelectItem value="C Corporation (C-Corp)" data-testid="select-item-c-corporation">C Corporation (C-Corp)</SelectItem>
                                <SelectItem value="S Corporation (S-Corp)" data-testid="select-item-s-corporation">S Corporation (S-Corp)</SelectItem>
                                <SelectItem value="Benefit Corporation (B-Corp)" data-testid="select-item-benefit-corporation">Benefit Corporation (B-Corp)</SelectItem>
                                <SelectItem value="Close Corporation" data-testid="select-item-close-corporation">Close Corporation</SelectItem>
                                <SelectItem value="Non-Profit Corporation" data-testid="select-item-non-profit-corporation">Non-Profit Corporation</SelectItem>
                                <SelectItem value="Professional Corporation (PC)" data-testid="select-item-professional-corporation">Professional Corporation (PC)</SelectItem>
                                <SelectItem value="Professional LLC (PLLC)" data-testid="select-item-professional-llc">Professional LLC (PLLC)</SelectItem>
                                <SelectItem value="Joint Venture" data-testid="select-item-joint-venture">Joint Venture</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
                );
              })}

              {/* Co-Borrower Pension Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.pension') && (
                <Card>
                  <Collapsible open={isCoBorrowerPensionIncomeOpen} onOpenChange={(open) => {
                    setIsCoBorrowerPensionIncomeOpen(open);
                    if (open && !showIncomeCardAnimation['co-borrower-pension']) {
                      setTimeout(() => {
                        setShowIncomeCardAnimation(prev => ({ ...prev, 'co-borrower-pension': true }));
                        setTimeout(() => {
                          setShowIncomeCardAnimation(prev => ({ ...prev, 'co-borrower-pension': false }));
                        }, 800);
                      }, 200);
                    }
                  }}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower Pension</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addCoBorrowerPension}
                            className="hover:bg-blue-500 hover:text-white"
                            data-testid="button-add-coborrower-pension-header"
                            title="Add New Pension"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Pension
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeDefaultCoBorrowerPension}
                            className="hover:bg-red-500 hover:text-white"
                            data-testid="button-remove-default-coborrower-pension"
                            title="Delete Pension"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        
                        {(form.watch('coBorrowerIncome.pensions') || []).map((pension, index) => (
                          <Card key={pension.id || index} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium">Pension {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCoBorrowerPension(pension.id!)}
                                className="hover:bg-orange-500 hover:text-white"
                                data-testid={`button-remove-coborrower-pension-${index}`}
                                title="Delete Pension"
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
                                <Label htmlFor={`coBorrowerIncome-pension-${index}-monthlyAmount`}>Gross Monthly Income</Label>
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

              {/* Co-Borrower Social Security Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.socialSecurity') && (
                <Card>
                  <Collapsible open={isCoBorrowerSocialSecurityIncomeOpen} onOpenChange={setIsCoBorrowerSocialSecurityIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower - Social Security</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteCoBorrowerSocialSecurityDialog({ isOpen: true })}
                            className="hover:bg-red-500 hover:text-white"
                            data-testid="button-delete-coborrower-social-security"
                            title="Delete Co-Borrower Social Security Income"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-socialSecurityMonthlyAmount">Gross Monthly Income</Label>
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
                        <CardTitle>Co-Borrower - VA Disability</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteCoBorrowerVaBenefitsDialog({ isOpen: true })}
                            className="hover:bg-red-500 hover:text-white"
                            data-testid="button-delete-coborrower-va-benefits"
                            title="Delete Co-Borrower VA Disability Income"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-vaBenefitsMonthlyAmount">Gross Monthly Income</Label>
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

              {/* Co-Borrower Disability Card */}
              {hasCoBorrower && form.watch('coBorrowerIncome.incomeTypes.disability') && (
                <Card>
                  <Collapsible open={isCoBorrowerDisabilityIncomeOpen} onOpenChange={setIsCoBorrowerDisabilityIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Co-Borrower - Disability</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteCoBorrowerDisabilityDialog({ isOpen: true })}
                            className="hover:bg-red-500 hover:text-white"
                            data-testid="button-delete-coborrower-disability"
                            title="Delete Co-Borrower Disability Income"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                          <Label htmlFor="coBorrowerIncome-disabilityMonthlyAmount">Gross Monthly Income</Label>
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
                        <CardTitle>Co-Borrower - Other Income</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteCoBorrowerOtherDialog({ isOpen: true })}
                            className="hover:bg-red-500 hover:text-white"
                            data-testid="button-delete-coborrower-other"
                            title="Delete Co-Borrower Other Income"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-otherIncomeDescription">Income Description</Label>
                          <Input
                            id="coBorrowerIncome-otherIncomeDescription"
                            {...form.register('coBorrowerIncome.otherIncomeDescription')}
                            placeholder=""
                            data-testid="input-coborrowerIncome-otherIncomeDescription"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-otherIncomeMonthlyAmount">Gross Monthly Income</Label>
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
              {/* Property Summary Card - Matching Income Tab Structure */}
              <Card className="transition-all duration-700">
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Property Summary</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Property Count</Label>
                    <div className="min-h-[40px] flex items-center">
                      <div
                        className="bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                        style={{
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          fontSize: '36px',
                          fontWeight: 600,
                          backgroundColor: '#1a3373',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                        }}
                        data-testid="text-property-count"
                      >
                        <span className={`${showPropertyAnimation ? 'animate-roll-down' : ''}`}>
                          {(() => {
                            // Count all active property cards
                            const primaryCards = (primaryResidenceCards || []).length;
                            const secondHomeCardsCount = (secondHomeCards || []).length;
                            const formProperties = (form.watch('property.properties') || []);
                            const investmentCards = formProperties.filter(p => p.use === 'investment').length;
                            const homePurchaseCards = formProperties.filter(p => p.use === 'home-purchase').length;
                            
                            return primaryCards + secondHomeCardsCount + investmentCards + homePurchaseCards;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Estimated LTV</Label>
                    <div className="min-h-[40px] flex items-center">
                      <div
                        className="bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                        style={{
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          fontSize: '36px',
                          fontWeight: 600,
                          backgroundColor: '#1a3373',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                        }}
                        data-testid="text-estimated-ltv"
                      >
                        <span className={`${showPropertyAnimation ? 'animate-roll-down' : ''}`}>
                          {(() => {
                            // Find the subject property
                            const properties = form.watch('property.properties') || [];
                            const subjectProperty = properties.find(p => p.isSubject === true);
                            
                            // Get the New Loan amount
                            const loanAmount = form.watch('newLoan.loanAmount') || '';
                            
                            // If no subject property or loan amount, return default %
                            if (!subjectProperty || !loanAmount || loanAmount.trim() === '') {
                              return <span style={{ fontSize: '28px' }}>%</span>;
                            }
                            
                            // Get estimated value from subject property
                            const estimatedValue = subjectProperty.estimatedValue || '';
                            
                            if (!estimatedValue || estimatedValue.trim() === '') {
                              return <span style={{ fontSize: '28px' }}>%</span>;
                            }
                            
                            // Parse values (handle currency formatting)
                            const parseValue = (value: string) => {
                              const cleaned = value.replace(/[$,]/g, '');
                              return cleaned ? parseFloat(cleaned) : 0;
                            };
                            
                            const loanNum = parseValue(loanAmount);
                            const valueNum = parseValue(estimatedValue);
                            
                            if (loanNum === 0 || valueNum === 0) {
                              return <span style={{ fontSize: '28px' }}>%</span>;
                            }
                            
                            // Calculate LTV percentage
                            const ltv = (loanNum / valueNum) * 100;
                            return (
                              <span>
                                {Math.round(ltv)}
                                <span style={{ fontSize: '28px' }}>%</span>
                              </span>
                            );
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Final LTV</Label>
                    <div className="min-h-[40px] flex items-center">
                      <div
                        className="bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                        style={{
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          fontSize: '36px',
                          fontWeight: 600,
                          backgroundColor: '#1a3373',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                        }}
                        data-testid="text-final-ltv"
                      >
                        <span className={`${showPropertyAnimation ? 'animate-roll-down' : ''}`}>
                          {(() => {
                            // Find the subject property
                            const properties = form.watch('property.properties') || [];
                            const subjectProperty = properties.find(p => p.isSubject === true);
                            
                            // Get the New Loan amount
                            const loanAmount = form.watch('newLoan.loanAmount') || '';
                            
                            // If no subject property or loan amount, return default %
                            if (!subjectProperty || !loanAmount || loanAmount.trim() === '') {
                              return <span style={{ fontSize: '28px' }}>%</span>;
                            }
                            
                            // Get appraised value from subject property
                            const appraisedValue = subjectProperty.appraisedValue || '';
                            
                            if (!appraisedValue || appraisedValue.trim() === '') {
                              return <span style={{ fontSize: '28px' }}>%</span>;
                            }
                            
                            // Parse values (handle currency formatting)
                            const parseValue = (value: string) => {
                              const cleaned = value.replace(/[$,]/g, '');
                              return cleaned ? parseFloat(cleaned) : 0;
                            };
                            
                            const loanNum = parseValue(loanAmount);
                            const valueNum = parseValue(appraisedValue);
                            
                            if (loanNum === 0 || valueNum === 0) {
                              return <span style={{ fontSize: '28px' }}>%</span>;
                            }
                            
                            // Calculate LTV percentage
                            const ltv = (loanNum / valueNum) * 100;
                            return (
                              <span>
                                {Math.round(ltv)}
                                <span style={{ fontSize: '28px' }}>%</span>
                              </span>
                            );
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* Property List Card */}
              <Card className="transition-all duration-700">
                <CardHeader>
                  <CardTitle>Property List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-primary"
                          checked={hasPropertyType('primary') || (primaryResidenceCards || []).length > 0}
                          onCheckedChange={(checked) => handlePropertyTypeChange(checked, 'primary')}
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          data-testid="checkbox-property-primary"
                        />
                        <Label htmlFor="property-type-primary" className="font-medium">
                          Primary Residence
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-second-home"
                          checked={hasPropertyType('second-home') || (secondHomeCards || []).length > 0}
                          onCheckedChange={(checked) => handlePropertyTypeChange(checked, 'second-home')}
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          data-testid="checkbox-property-second-home"
                        />
                        <Label htmlFor="property-type-second-home" className="font-medium">
                          Second Home
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-investment"
                          checked={hasPropertyType('investment') || (investmentCards || []).length > 0}
                          onCheckedChange={(checked) => handlePropertyTypeChange(checked, 'investment')}
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg]"
                          data-testid="checkbox-property-investment"
                        />
                        <Label htmlFor="property-type-investment" className="font-medium">
                          Investment Property
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-home-purchase"
                          checked={hasPropertyType('home-purchase')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addPropertyType('home-purchase');
                            } else {
                              removePropertyType('home-purchase');
                            }
                          }}
                          data-testid="checkbox-property-home-purchase"
                        />
                        <Label htmlFor="property-type-home-purchase" className="font-medium">
                          Home Purchase
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Primary Residence Cards */}
              {(primaryResidenceCards || []).length > 0 && (primaryResidenceCards || ['default']).map((cardId, index) => {
                // Get the actual property from the properties array
                const properties = form.watch('property.properties') || [];
                const property = properties.find(p => p.id === cardId);
                const propertyId = property?.id || cardId;
                const propertyIndex = properties.findIndex(p => p.id === cardId);
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                return (
                  <Card key={cardId} className="border-l-4 border-l-green-500 hover:border-green-500 focus-within:border-green-500 transition-colors duration-200">
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className={`flex items-center gap-2 ${property?.isSubject ? 'text-green-600' : ''}`}>
                              Primary Residence
                              {property?.isSubject && (
                                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  Subject Property
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Delete Property Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletePrimaryResidenceDialog({ isOpen: true, cardId: propertyId })}
                              className="hover:bg-red-500 hover:text-white"
                              data-testid="button-delete-primary-property"
                              title="Delete Primary Residence"
                            >
                              <Minus className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                            
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-primary-property-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`primary-property-toggle-${propertyId}-${isOpen}`}
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
                            <Card className={`bg-muted ${
                              showSubjectPropertyAnimation[propertyId] ? 'animate-roll-down-subject-property' : ''
                            }`}>
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <Label className="text-base font-semibold">Is the loan transaction for this property?</Label>
                                  <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`subject-yes-${propertyId}`}
                                        name={`subject-${propertyId}`}
                                        checked={primaryResidenceData[propertyId]?.isSubjectProperty === true}
                                        onChange={() => {
                                          setPrimaryResidenceData(prev => ({
                                            ...prev,
                                            [propertyId]: { 
                                              ...prev[propertyId],
                                              purpose: prev[propertyId]?.purpose ?? 'primary',
                                              isSubjectProperty: true
                                            }
                                          }));
                                          // Trigger same green animation as Second Home
                                          setSubjectProperty(propertyId);
                                        }}
                                        data-testid={`radio-subject-yes-${propertyId}`}
                                      />
                                      <Label htmlFor={`subject-yes-${propertyId}`}>Yes</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`subject-no-${propertyId}`}
                                        name={`subject-${propertyId}`}
                                        checked={primaryResidenceData[propertyId]?.isSubjectProperty === false}
                                        onChange={() => {
                                          setPrimaryResidenceData(prev => ({
                                            ...prev,
                                            [propertyId]: { 
                                              ...prev[propertyId],
                                              purpose: prev[propertyId]?.purpose ?? 'primary',
                                              isSubjectProperty: false
                                            }
                                          }));
                                          // Update global form state to reverse green animation (same as Second Home)
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

                            {/* Property Address - Row 1: Street Address, Unit/Apt, City, State, ZIP Code, County, Property Type */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="space-y-2 md:col-span-3">
                                <Label htmlFor={`property-address-street-${propertyId}`}>Street Address *</Label>
                                <Input
                                  id={`property-address-street-${propertyId}`}
                                  {...form.register(`property.properties.${propertyIndex >= 0 ? propertyIndex : 0}.address.street` as any)}
                                  data-testid={`input-property-street-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`property-address-unit-${propertyId}`}>Unit/Apt</Label>
                                <Input
                                  id={`property-address-unit-${propertyId}`}
                                  {...form.register(`property.properties.${propertyIndex >= 0 ? propertyIndex : 0}.address.unit` as any)}
                                  data-testid={`input-property-unit-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`property-address-city-${propertyId}`}>City *</Label>
                                <Input
                                  id={`property-address-city-${propertyId}`}
                                  {...form.register(`property.properties.${propertyIndex >= 0 ? propertyIndex : 0}.address.city` as any)}
                                  data-testid={`input-property-city-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`property-address-state-${propertyId}`}>State *</Label>
                                <Select 
                                  value={propertyIndex >= 0 ? form.watch(`property.properties.${propertyIndex}.address.state`) : ''}
                                  onValueChange={(value) => propertyIndex >= 0 && form.setValue(`property.properties.${propertyIndex}.address.state` as any, value)}
                                >
                                  <SelectTrigger data-testid={`select-property-state-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
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
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`property-address-zip-${propertyId}`}>ZIP Code *</Label>
                                <Input
                                  id={`property-address-zip-${propertyId}`}
                                  {...form.register(`property.properties.${propertyIndex >= 0 ? propertyIndex : 0}.address.zip` as any)}
                                  data-testid={`input-property-zip-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`property-address-county-${propertyId}`}>County</Label>
                                <Input
                                  id={`property-address-county-${propertyId}`}
                                  {...form.register(`property.properties.${propertyIndex >= 0 ? propertyIndex : 0}.address.county` as any)}
                                  data-testid={`input-property-county-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`property-type-${propertyId}`}>Property Type</Label>
                                <Select 
                                  value={propertyIndex >= 0 ? form.watch(`property.properties.${propertyIndex}.propertyType`) : ''}
                                  onValueChange={(value) => propertyIndex >= 0 && form.setValue(`property.properties.${propertyIndex}.propertyType` as any, value)}
                                >
                                  <SelectTrigger data-testid={`select-property-type-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
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
                            </div>

                            {/* Property Details - Row 2: Purchase Price, Owned Since, Title Held By, Estimated Property Value */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`property-purchase-price-${propertyId}`}>Purchase Price</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto text-black hover:text-gray-600"
                                    title="Purchase Property Value"
                                    data-testid={`button-purchase-price-info-${propertyId}`}
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                    return `property.properties.${primaryIndex >= 0 ? primaryIndex : 0}.purchasePrice` as const;
                                  })()}
                                  id={`property-purchase-price-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-property-purchase-price-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <div className="min-h-5 flex items-center gap-2">
                                  <Label htmlFor={`property-owned-since-${propertyId}`}>Purchased</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          toast({
                                            title: "Purchase Information",
                                            description: "Please see purchase and record dates in title report located in vendor page.",
                                            duration: 5000,
                                          });
                                        }}
                                        data-testid={`button-purchased-info-${propertyId}`}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={15} className="text-sm">
                                      Purchase Information
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Input
                                  id={`property-owned-since-${propertyId}`}
                                  placeholder="MM/YYYY"
                                  data-testid={`input-property-owned-since-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="min-h-5 flex items-center gap-2">
                                  <Label htmlFor={`property-title-held-by-${propertyId}`}>Title Held By</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          toast({
                                            title: "Title Information",
                                            description: "Please see title report in vendor page.",
                                            duration: 5000,
                                          });
                                        }}
                                        data-testid={`button-title-held-info-${propertyId}`}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={15} className="text-sm">
                                      Title Information
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Select>
                                  <SelectTrigger data-testid={`select-property-title-held-by-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="borrower">Borrower</SelectItem>
                                    <SelectItem value="borrowers">Borrowers</SelectItem>
                                    <SelectItem value="co-borrower">Co-Borrower</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2 md:col-span-3">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`property-estimated-value-${propertyId}`}>Estimated Value</Label>
                                  <div className="flex items-center gap-1">
                                    {/* Zillow */}
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800 no-default-hover-elevate no-default-active-elevate"
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                          openValuationDialog('zillow', primaryIndex >= 0 ? primaryIndex : 0);
                                        }}
                                        onMouseEnter={(e) => {
                                          const properties = form.watch('property.properties') || [];
                                          const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                          handleValuationHover('zillow', primaryIndex >= 0 ? primaryIndex : 0, e);
                                        }}
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
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                          openValuationDialog('realtor', primaryIndex >= 0 ? primaryIndex : 0);
                                        }}
                                        onMouseEnter={(e) => {
                                          const properties = form.watch('property.properties') || [];
                                          const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                          handleValuationHover('realtor', primaryIndex >= 0 ? primaryIndex : 0, e);
                                        }}
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
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                          openValuationDialog('redfin', primaryIndex >= 0 ? primaryIndex : 0);
                                        }}
                                        onMouseEnter={(e) => {
                                          const properties = form.watch('property.properties') || [];
                                          const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                          handleValuationHover('redfin', primaryIndex >= 0 ? primaryIndex : 0, e);
                                        }}
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
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                          openValuationSummary(primaryIndex >= 0 ? primaryIndex : 0);
                                        }}
                                        data-testid={`button-valuation-info-${propertyId}`}
                                        title="View all valuation estimates"
                                      >
                                        <Info className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                    return `property.properties.${primaryIndex >= 0 ? primaryIndex : 0}.estimatedValue` as const;
                                  })()}
                                  id={`property-estimated-value-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-property-estimated-value-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2 min-h-8">
                                  <Label htmlFor={`property-appraised-value-${propertyId}`}>Appraised Value</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto"
                                    title="Appraised Property Value"
                                    data-testid={`button-appraised-value-info-${propertyId}`}
                                  >
                                    {(() => {
                                      const properties = form.watch('property.properties') || [];
                                      const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                      return <AppraisalIcon index={primaryIndex >= 0 ? primaryIndex : 0} control={form.control} />;
                                    })()}
                                  </Button>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                    return `property.properties.${primaryIndex >= 0 ? primaryIndex : 0}.appraisedValue` as const;
                                  })()}
                                  id={`property-appraised-value-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-property-appraised-value-${propertyId}`}
                                  shadowColor={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                    const estimatedValue = form.watch(`property.properties.${primaryIndex >= 0 ? primaryIndex : 0}.estimatedValue` as const) || '';
                                    const appraisedValue = form.watch(`property.properties.${primaryIndex >= 0 ? primaryIndex : 0}.appraisedValue` as const) || '';
                                    return getValueComparisonColor(estimatedValue, appraisedValue).shadowColor;
                                  })()}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2 min-h-8">
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`property-active-secured-loan-${propertyId}`}>Secured Loan</Label>
                                    {(() => {
                                      // Check ALL loans for attachment to this property
                                      const properties = form.watch('property.properties') || [];
                                      const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                      const currentProperty = primaryIndex >= 0 ? properties[primaryIndex] : null;
                                      
                                      // Check current loan
                                      const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                      const isCurrentLoanAttached = Boolean(currentLoanAttached && currentProperty?.id && currentLoanAttached === currentProperty.id);
                                      
                                      // Check second loan
                                      const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                      const isSecondLoanAttached = Boolean(secondLoanAttached && currentProperty?.id && secondLoanAttached === currentProperty.id);
                                      
                                      // Check third loan (first additional loan - Current Third Loan)
                                      const additionalLoansData = additionalLoans || [];
                                      const firstAdditionalLoan = additionalLoansData[0]; // This is "Current Third Loan"
                                      const isThirdLoanAttached = firstAdditionalLoan ? (() => {
                                        const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                        return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                      })() : false;
                                      
                                      // Check other additional loans (loan4, loan5, etc.)
                                      const isOtherAdditionalLoanAttached = additionalLoansData.slice(1).some(loan => {
                                        const attachedPropertyId = getDyn(`${loan.id}.attachedToProperty`);
                                        return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                      });
                                      
                                      const hasAnyLoanAttached = isCurrentLoanAttached || isSecondLoanAttached || isThirdLoanAttached || isOtherAdditionalLoanAttached;
                                      
                                      return (
                                        <div className="flex items-center gap-1">
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isCurrentLoanAttached
                                                ? 'bg-blue-500 border-blue-500 hover:bg-blue-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isCurrentLoanAttached ? '#3b82f6' : '#e5e7eb',
                                              borderColor: isCurrentLoanAttached ? '#3b82f6' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isCurrentLoanAttached) {
                                                setIsCurrentLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isCurrentLoanAttached ? "View Current Loan Details" : ""}
                                            data-testid={`indicator-secured-loan-1-${propertyId}`}
                                          />
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isSecondLoanAttached
                                                ? 'bg-purple-500 border-purple-500 hover:bg-purple-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isSecondLoanAttached ? '#8b5cf6' : '#e5e7eb',
                                              borderColor: isSecondLoanAttached ? '#8b5cf6' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isSecondLoanAttached) {
                                                setIsCurrentSecondLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isSecondLoanAttached ? "View Current Loan 2 Details" : ""}
                                            data-testid={`indicator-secured-loan-2-${propertyId}`}
                                          />
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isThirdLoanAttached
                                                ? 'bg-orange-500 border-orange-500 hover:bg-orange-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isThirdLoanAttached ? '#f97316' : '#e5e7eb',
                                              borderColor: isThirdLoanAttached ? '#f97316' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isThirdLoanAttached) {
                                                setIsCurrentThirdLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isThirdLoanAttached ? "View Current Third Loan Details" : ""}
                                            data-testid={`indicator-secured-loan-3-${propertyId}`}
                                          />
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  {(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                    const currentProperty = primaryIndex >= 0 ? properties[primaryIndex] : null;
                                    
                                    // Check which loans are attached to this property for counter
                                    const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                    const isCurrentLoanAttached = Boolean(currentLoanAttached && currentProperty?.id && currentLoanAttached === currentProperty.id);
                                    
                                    const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                    const isSecondLoanAttached = Boolean(secondLoanAttached && currentProperty?.id && secondLoanAttached === currentProperty.id);
                                    
                                    // Check third loan (first additional loan - Current Loan 3)
                                    const additionalLoansData = additionalLoans || [];
                                    const firstAdditionalLoan = additionalLoansData[0];
                                    const isThirdLoanAttached = firstAdditionalLoan ? (() => {
                                      const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                      return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                    })() : false;
                                    
                                    // Count active loans
                                    let activeLoansCount = 0;
                                    if (isCurrentLoanAttached) activeLoansCount++;
                                    if (isSecondLoanAttached) activeLoansCount++;
                                    if (isThirdLoanAttached) activeLoansCount++;
                                    
                                    return (
                                      <div 
                                        className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-600"
                                        data-testid={`loan-counter-${propertyId}`}
                                        title={`${activeLoansCount} loan(s) connected`}
                                      >
                                        {activeLoansCount}
                                      </div>
                                    );
                                  })()}
                                </div>
                                {(() => {
                                  // Automatic loan detection logic
                                  const properties = form.watch('property.properties') || [];
                                  const primaryIndex = properties.findIndex(p => p.use === 'primary');
                                  const currentProperty = primaryIndex >= 0 ? properties[primaryIndex] : null;
                                  
                                  if (!currentProperty?.id) return (
                                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-default">
                                      <span className="text-muted-foreground">Attach</span>
                                    </div>
                                  );
                                  
                                  // Check all loans for attachment to this property
                                  const attachedLoans = [];
                                  
                                  // Check current loan
                                  const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                  if (currentLoanAttached && currentLoanAttached === currentProperty.id) {
                                    attachedLoans.push('Current Primary Loan');
                                  }
                                  
                                  // Check second loan
                                  const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                  if (secondLoanAttached && secondLoanAttached === currentProperty.id) {
                                    attachedLoans.push('Current Second Loan');
                                  }
                                  
                                  // Check third loan (first additional loan)
                                  const additionalLoansData = additionalLoans || [];
                                  const firstAdditionalLoan = additionalLoansData[0];
                                  if (firstAdditionalLoan) {
                                    const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                    if (attachedPropertyId && attachedPropertyId === currentProperty.id) {
                                      attachedLoans.push('Current Third Loan');
                                    }
                                  }
                                  
                                  // Check other additional loans
                                  additionalLoansData.slice(1).forEach((loan, index) => {
                                    const attachedPropertyId = getDyn(`${loan.id}.attachedToProperty`);
                                    if (attachedPropertyId && attachedPropertyId === currentProperty.id) {
                                      attachedLoans.push(`Current Loan ${index + 4}`);
                                    }
                                  });
                                  
                                  // Determine display text
                                  let displayText = 'Attach';
                                  if (attachedLoans.length === 1) {
                                    displayText = attachedLoans[0];
                                  } else if (attachedLoans.length === 2) {
                                    displayText = '1st & 2nd Loan';
                                  } else if (attachedLoans.length === 3) {
                                    displayText = 'Three Loans';
                                  } else if (attachedLoans.length > 3) {
                                    displayText = `${attachedLoans.length} Loans`;
                                  }
                                  
                                  const hasLoansAttached = attachedLoans.length > 0;
                                  
                                  return (
                                    <Select>
                                      <SelectTrigger data-testid={`select-property-secured-loan-${propertyId}`}>
                                        <SelectValue placeholder={displayText} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="paid-off">Paid Off</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}

              {/* Second Home Cards */}
              {(secondHomeCards || []).length > 0 && (secondHomeCards || ['default']).map((cardId, index) => {
                // Get the actual property from the properties array
                const properties = form.watch('property.properties') || [];
                const property = properties.find(p => p.id === cardId);
                const propertyId = property?.id || cardId;
                const propertyIndex = properties.findIndex(p => p.id === cardId);
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                return (
                  <Card key={cardId} className="border-l-4 border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500 transition-colors duration-200">
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className={`flex items-center gap-2 ${property?.isSubject ? 'text-green-600' : ''}`}>
                              Second Home
                              {property?.isSubject && (
                                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  Subject Property
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Add Property Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Create entry in main form's property array first
                                addProperty('second-home');
                                
                                // Get the ID of the newly created property
                                const currentProperties = form.watch('property.properties') || [];
                                const newProperty = currentProperties[currentProperties.length - 1];
                                const newPropertyId = newProperty?.id;
                                
                                if (newPropertyId) {
                                  setSecondHomeCards(prev => [...(prev || ['default']), newPropertyId]);
                                  // Initialize data state for new card
                                  setSecondHomeData(prev => ({ 
                                    ...prev, 
                                    [newPropertyId]: { isSubjectProperty: null } 
                                  }));
                                  
                                  // Auto-expand the new property card
                                  setPropertyCardStates(prev => ({ ...prev, [newPropertyId]: true }));
                                }
                              }}
                              className="hover:bg-blue-500 hover:text-white"
                              data-testid="button-add-second-home-property"
                              title="Add New Second Home"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Property
                            </Button>
                            
                            {/* Delete Property Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteSecondHomeDialog({ isOpen: true, cardId: propertyId })}
                              className="hover:bg-red-500 hover:text-white"
                              data-testid="button-delete-second-home-property"
                              title="Delete Second Home"
                            >
                              <Minus className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                            
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-second-home-property-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`second-home-property-toggle-${propertyId}-${isOpen}`}
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
                            <Card className={`bg-muted ${
                              showSubjectPropertyAnimation[propertyId] ? 'animate-roll-down-subject-property' : ''
                            }`}>
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <Label className="text-base font-semibold">Is the loan transaction for this property?</Label>
                                  <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`second-home-subject-yes-${propertyId}`}
                                        name={`second-home-subject-${propertyId}`}
                                        checked={secondHomeData[propertyId]?.isSubjectProperty === true}
                                        onChange={() => {
                                          setSecondHomeData(prev => ({
                                            ...prev,
                                            [propertyId]: { 
                                              ...prev[propertyId],
                                              isSubjectProperty: true
                                            }
                                          }));
                                          // Trigger same green animation as Primary Residence
                                          setSubjectProperty(propertyId);
                                        }}
                                        data-testid={`radio-second-home-subject-yes-${propertyId}`}
                                      />
                                      <Label htmlFor={`second-home-subject-yes-${propertyId}`}>Yes</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`second-home-subject-no-${propertyId}`}
                                        name={`second-home-subject-${propertyId}`}
                                        checked={secondHomeData[propertyId]?.isSubjectProperty === false}
                                        onChange={() => {
                                          setSecondHomeData(prev => ({
                                            ...prev,
                                            [propertyId]: { 
                                              ...prev[propertyId],
                                              isSubjectProperty: false
                                            }
                                          }));
                                          // Update global form state to reverse green animation (same as Primary Residence)
                                          const properties = form.watch('property.properties') || [];
                                          const updatedProperties = properties.map(p => 
                                            p.id === propertyId ? { ...p, isSubject: false } : p
                                          );
                                          form.setValue('property.properties', updatedProperties);
                                        }}
                                        data-testid={`radio-second-home-subject-no-${propertyId}`}
                                      />
                                      <Label htmlFor={`second-home-subject-no-${propertyId}`}>No</Label>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Property Address - Row 1: Street Address, Unit/Apt, City, State, ZIP Code, County, Property Type */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="space-y-2 md:col-span-3">
                                <Label htmlFor={`second-home-property-address-street-${propertyId}`}>Street Address *</Label>
                                <Input
                                  id={`second-home-property-address-street-${propertyId}`}

                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.street` as any) : {})}
                                  data-testid={`input-second-home-property-street-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`second-home-property-address-unit-${propertyId}`}>Unit/Apt</Label>
                                <Input
                                  id={`second-home-property-address-unit-${propertyId}`}
                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.unit` as any) : {})}
                                  data-testid={`input-second-home-property-unit-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`second-home-property-address-city-${propertyId}`}>City *</Label>
                                <Input
                                  id={`second-home-property-address-city-${propertyId}`}

                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.city` as any) : {})}
                                  data-testid={`input-second-home-property-city-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`second-home-property-address-state-${propertyId}`}>State *</Label>
                                <Select {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.state` as any) : {})} 
                                        value={form.watch(`property.properties.${propertyIndex}` as any)?.address?.state || ''} 
                                        onValueChange={(value) => form.setValue(`property.properties.${propertyIndex}.address.state` as any, value)}>
                                  <SelectTrigger data-testid={`select-second-home-property-state-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
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
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`second-home-property-address-zip-${propertyId}`}>ZIP Code *</Label>
                                <Input
                                  id={`second-home-property-address-zip-${propertyId}`}
                                  placeholder="94103"
                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.zip` as any) : {})}
                                  data-testid={`input-second-home-property-zip-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`second-home-property-address-county-${propertyId}`}>County</Label>
                                <Input
                                  id={`second-home-property-address-county-${propertyId}`}

                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.county` as any) : {})}
                                  data-testid={`input-second-home-property-county-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`second-home-property-type-${propertyId}`}>Property Type</Label>
                                <Select {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.propertyType` as any) : {})} 
                                        value={form.watch(`property.properties.${propertyIndex}` as any)?.propertyType || ''} 
                                        onValueChange={(value) => form.setValue(`property.properties.${propertyIndex}.propertyType` as any, value)}>
                                  <SelectTrigger data-testid={`select-second-home-property-type-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="single-family">Single Family Home</SelectItem>
                                    <SelectItem value="condo">Condominium</SelectItem>
                                    <SelectItem value="townhouse">Townhouse</SelectItem>
                                    <SelectItem value="duplex">Duplex</SelectItem>
                                    <SelectItem value="multi-family">Multi-Family</SelectItem>
                                    <SelectItem value="manufactured">Manufactured Home</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Property Details - Row 2: Purchase Price, Owned Since, Title Held By, Estimated Property Value */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`second-home-purchase-price-${propertyId}`}>Purchase Price</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto text-black hover:text-gray-600"
                                    title="Purchase Property Value"
                                    data-testid={`button-second-home-purchase-price-info-${propertyId}`}
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                    return `property.properties.${secondHomeIndex >= 0 ? secondHomeIndex : 0}.purchasePrice` as const;
                                  })()}
                                  id={`second-home-purchase-price-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-second-home-purchase-price-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <div className="min-h-5 flex items-center gap-2">
                                  <Label htmlFor={`second-home-owned-since-${propertyId}`}>Purchased</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          toast({
                                            title: "Purchase Information",
                                            description: "Please see purchase and record dates in title report located in vendor page.",
                                            duration: 5000,
                                          });
                                        }}
                                        data-testid={`button-second-home-purchased-info-${propertyId}`}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={15} className="text-sm">
                                      Purchase Information
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Input
                                  id={`second-home-owned-since-${propertyId}`}
                                  placeholder="MM/YYYY"
                                  data-testid={`input-second-home-owned-since-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="min-h-5 flex items-center gap-2">
                                  <Label htmlFor={`second-home-title-held-by-${propertyId}`}>Title Held By</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          toast({
                                            title: "Title Information",
                                            description: "Please see title report in vendor page.",
                                            duration: 5000,
                                          });
                                        }}
                                        data-testid={`button-second-home-title-held-info-${propertyId}`}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={15} className="text-sm">
                                      Title Information
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Select>
                                  <SelectTrigger data-testid={`select-second-home-title-held-by-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="borrower">Borrower</SelectItem>
                                    <SelectItem value="borrowers">Borrowers</SelectItem>
                                    <SelectItem value="co-borrower">Co-Borrower</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2 md:col-span-3">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`second-home-estimated-value-${propertyId}`}>Estimated Value</Label>
                                  <div className="flex items-center gap-1">
                                    {/* Zillow */}
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800 no-default-hover-elevate no-default-active-elevate"
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                          openValuationDialog('zillow', secondHomeIndex >= 0 ? secondHomeIndex : 0);
                                        }}
                                        onMouseEnter={(e) => {
                                          const properties = form.watch('property.properties') || [];
                                          const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                          handleValuationHover('zillow', secondHomeIndex >= 0 ? secondHomeIndex : 0, e);
                                        }}
                                        onMouseLeave={handleValuationHoverLeave}
                                        data-testid={`button-second-home-zillow-valuation-${propertyId}`}
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
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                          openValuationDialog('realtor', secondHomeIndex >= 0 ? secondHomeIndex : 0);
                                        }}
                                        onMouseEnter={(e) => {
                                          const properties = form.watch('property.properties') || [];
                                          const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                          handleValuationHover('realtor', secondHomeIndex >= 0 ? secondHomeIndex : 0, e);
                                        }}
                                        onMouseLeave={handleValuationHoverLeave}
                                        data-testid={`button-second-home-realtor-valuation-${propertyId}`}
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
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                          openValuationDialog('redfin', secondHomeIndex >= 0 ? secondHomeIndex : 0);
                                        }}
                                        onMouseEnter={(e) => {
                                          const properties = form.watch('property.properties') || [];
                                          const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                          handleValuationHover('redfin', secondHomeIndex >= 0 ? secondHomeIndex : 0, e);
                                        }}
                                        onMouseLeave={handleValuationHoverLeave}
                                        data-testid={`button-second-home-redfin-valuation-${propertyId}`}
                                        title="Enter Redfin valuation manually"
                                      >
                                        <FaHome className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                          openValuationSummary(secondHomeIndex >= 0 ? secondHomeIndex : 0);
                                        }}
                                        data-testid={`button-second-home-valuation-info-${propertyId}`}
                                        title="View all valuation estimates"
                                      >
                                        <Info className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                    return `property.properties.${secondHomeIndex >= 0 ? secondHomeIndex : 0}.estimatedValue` as const;
                                  })()}
                                  id={`second-home-estimated-value-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-second-home-estimated-value-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2 min-h-8">
                                  <Label htmlFor={`second-home-appraised-value-${propertyId}`}>Appraised Value</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto"
                                    title="Appraised Property Value"
                                    data-testid={`button-second-home-appraised-value-info-${propertyId}`}
                                  >
                                    {(() => {
                                      const properties = form.watch('property.properties') || [];
                                      const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                      return <AppraisalIcon index={secondHomeIndex >= 0 ? secondHomeIndex : 0} control={form.control} />;
                                    })()}
                                  </Button>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                    return `property.properties.${secondHomeIndex >= 0 ? secondHomeIndex : 0}.appraisedValue` as const;
                                  })()}
                                  id={`second-home-appraised-value-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-second-home-appraised-value-${propertyId}`}
                                  shadowColor={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                    const estimatedValue = form.watch(`property.properties.${secondHomeIndex >= 0 ? secondHomeIndex : 0}.estimatedValue` as const) || '';
                                    const appraisedValue = form.watch(`property.properties.${secondHomeIndex >= 0 ? secondHomeIndex : 0}.appraisedValue` as const) || '';
                                    return getValueComparisonColor(estimatedValue, appraisedValue).shadowColor;
                                  })()}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2 min-h-8">
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`second-home-active-secured-loan-${propertyId}`}>Secured Loan</Label>
                                    {(() => {
                                      // Check ALL loans for attachment to this property
                                      const properties = form.watch('property.properties') || [];
                                      const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                      const currentProperty = secondHomeIndex >= 0 ? properties[secondHomeIndex] : null;
                                      
                                      // Check current loan
                                      const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                      const isCurrentLoanAttached = Boolean(currentLoanAttached && currentProperty?.id && currentLoanAttached === currentProperty.id);
                                      
                                      // Check second loan
                                      const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                      const isSecondLoanAttached = Boolean(secondLoanAttached && currentProperty?.id && secondLoanAttached === currentProperty.id);
                                      
                                      // Check third loan (first additional loan - Current Third Loan)
                                      const additionalLoansData = additionalLoans || [];
                                      const firstAdditionalLoan = additionalLoansData[0]; // This is "Current Third Loan"
                                      const isThirdLoanAttached = firstAdditionalLoan ? (() => {
                                        const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                        return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                      })() : false;
                                      
                                      // Check other additional loans (loan4, loan5, etc.)
                                      const isOtherAdditionalLoanAttached = additionalLoansData.slice(1).some(loan => {
                                        const attachedPropertyId = getDyn(`${loan.id}.attachedToProperty`);
                                        return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                      });
                                      
                                      const hasAnyLoanAttached = isCurrentLoanAttached || isSecondLoanAttached || isThirdLoanAttached || isOtherAdditionalLoanAttached;
                                      
                                      return (
                                        <div className="flex items-center gap-1">
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isCurrentLoanAttached
                                                ? 'bg-blue-500 border-blue-500 hover:bg-blue-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isCurrentLoanAttached ? '#3b82f6' : '#e5e7eb',
                                              borderColor: isCurrentLoanAttached ? '#3b82f6' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isCurrentLoanAttached) {
                                                setIsCurrentLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isCurrentLoanAttached ? "View Current Loan Details" : ""}
                                            data-testid={`indicator-second-home-secured-loan-1-${propertyId}`}
                                          />
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isSecondLoanAttached
                                                ? 'bg-purple-500 border-purple-500 hover:bg-purple-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isSecondLoanAttached ? '#8b5cf6' : '#e5e7eb',
                                              borderColor: isSecondLoanAttached ? '#8b5cf6' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isSecondLoanAttached) {
                                                setIsCurrentSecondLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isSecondLoanAttached ? "View Current Loan 2 Details" : ""}
                                            data-testid={`indicator-second-home-secured-loan-2-${propertyId}`}
                                          />
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isThirdLoanAttached
                                                ? 'bg-orange-500 border-orange-500 hover:bg-orange-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isThirdLoanAttached ? '#f97316' : '#e5e7eb',
                                              borderColor: isThirdLoanAttached ? '#f97316' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isThirdLoanAttached) {
                                                setIsCurrentThirdLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isThirdLoanAttached ? "View Current Third Loan Details" : ""}
                                            data-testid={`indicator-second-home-secured-loan-3-${propertyId}`}
                                          />
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  {(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                    const currentProperty = secondHomeIndex >= 0 ? properties[secondHomeIndex] : null;
                                    
                                    // Check which loans are attached to this property for counter
                                    const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                    const isCurrentLoanAttached = Boolean(currentLoanAttached && currentProperty?.id && currentLoanAttached === currentProperty.id);
                                    
                                    const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                    const isSecondLoanAttached = Boolean(secondLoanAttached && currentProperty?.id && secondLoanAttached === currentProperty.id);
                                    
                                    // Check third loan (first additional loan - Current Loan 3)
                                    const additionalLoansData = additionalLoans || [];
                                    const firstAdditionalLoan = additionalLoansData[0];
                                    const isThirdLoanAttached = firstAdditionalLoan ? (() => {
                                      const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                      return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                    })() : false;
                                    
                                    // Count active loans
                                    let activeLoansCount = 0;
                                    if (isCurrentLoanAttached) activeLoansCount++;
                                    if (isSecondLoanAttached) activeLoansCount++;
                                    if (isThirdLoanAttached) activeLoansCount++;
                                    
                                    return (
                                      <div 
                                        className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-600"
                                        data-testid={`second-home-loan-counter-${propertyId}`}
                                        title={`${activeLoansCount} loan(s) connected`}
                                      >
                                        {activeLoansCount}
                                      </div>
                                    );
                                  })()}
                                </div>
                                {(() => {
                                  // Automatic loan detection logic for Second Home
                                  const properties = form.watch('property.properties') || [];
                                  const secondHomeIndex = properties.findIndex(p => p.use === 'second-home' && p.id === propertyId);
                                  const currentProperty = secondHomeIndex >= 0 ? properties[secondHomeIndex] : null;
                                  
                                  if (!currentProperty?.id) return (
                                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-default">
                                      <span className="text-muted-foreground">Attach</span>
                                    </div>
                                  );
                                  
                                  // Check all loans for attachment to this property
                                  const attachedLoans = [];
                                  
                                  // Check current loan
                                  const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                  if (currentLoanAttached && currentLoanAttached === currentProperty.id) {
                                    attachedLoans.push('Current Primary Loan');
                                  }
                                  
                                  // Check second loan
                                  const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                  if (secondLoanAttached && secondLoanAttached === currentProperty.id) {
                                    attachedLoans.push('Current Second Loan');
                                  }
                                  
                                  // Check third loan (first additional loan)
                                  const additionalLoansData = additionalLoans || [];
                                  const firstAdditionalLoan = additionalLoansData[0];
                                  if (firstAdditionalLoan) {
                                    const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                    if (attachedPropertyId && attachedPropertyId === currentProperty.id) {
                                      attachedLoans.push('Current Third Loan');
                                    }
                                  }
                                  
                                  // Check other additional loans
                                  additionalLoansData.slice(1).forEach((loan, index) => {
                                    const attachedPropertyId = getDyn(`${loan.id}.attachedToProperty`);
                                    if (attachedPropertyId && attachedPropertyId === currentProperty.id) {
                                      attachedLoans.push(`Current Loan ${index + 4}`);
                                    }
                                  });
                                  
                                  // Determine display text
                                  let displayText = 'Attach';
                                  if (attachedLoans.length === 1) {
                                    displayText = attachedLoans[0];
                                  } else if (attachedLoans.length === 2) {
                                    displayText = '1st & 2nd Loan';
                                  } else if (attachedLoans.length === 3) {
                                    displayText = 'Three Loans';
                                  } else if (attachedLoans.length > 3) {
                                    displayText = `${attachedLoans.length} Loans`;
                                  }
                                  
                                  const hasLoansAttached = attachedLoans.length > 0;
                                  
                                  return (
                                    <Select>
                                      <SelectTrigger data-testid={`select-second-home-secured-loan-${propertyId}`}>
                                        <SelectValue placeholder={displayText} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="paid-off">Paid Off</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  );
                                })()}
                              </div>
                            </div>

                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}

              {/* Investment Property Cards */}
              {(investmentCards || []).length > 0 && (investmentCards || ['default']).map((cardId, index) => {
                // Get the actual property from the properties array
                const properties = form.watch('property.properties') || [];
                const property = properties.find(p => p.id === cardId);
                const propertyId = property?.id || cardId;
                const propertyIndex = properties.findIndex(p => p.id === cardId);
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                return (
                  <Card key={cardId} className="border-l-4 border-l-purple-500 hover:border-purple-500 focus-within:border-purple-500 transition-colors duration-200">
                    <Collapsible 
                      open={isOpen} 
                      onOpenChange={(open) => setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }))}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-8">
                            <CardTitle className={`flex items-center gap-2 ${property?.isSubject ? 'text-green-600' : ''}`}>
                              Investment Property
                              {property?.isSubject && (
                                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  Subject Property
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Add Property Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Create entry in main form's property array first
                                addProperty('investment');
                                
                                // Get the ID of the newly created property
                                const currentProperties = form.watch('property.properties') || [];
                                const newProperty = currentProperties[currentProperties.length - 1];
                                const newPropertyId = newProperty?.id;
                                
                                if (newPropertyId) {
                                  setInvestmentCards(prev => [...(prev || ['default']), newPropertyId]);
                                  // Initialize data state for new card
                                  setInvestmentData(prev => ({ 
                                    ...prev, 
                                    [newPropertyId]: { isSubjectProperty: null } 
                                  }));
                                  
                                  // Auto-expand the new property card
                                  setPropertyCardStates(prev => ({ ...prev, [newPropertyId]: true }));
                                }
                              }}
                              className="hover:bg-blue-500 hover:text-white"
                              data-testid="button-add-investment-property"
                              title="Add New Investment Property"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Property
                            </Button>
                            
                            {/* Delete Property Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteInvestmentDialog({ isOpen: true, cardId: propertyId })}
                              className="hover:bg-red-500 hover:text-white"
                              data-testid="button-delete-investment-property"
                              title="Delete Investment Property"
                            >
                              <Minus className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                            
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-orange-500 hover:text-white" 
                                data-testid={`button-toggle-investment-property-${propertyId}`}
                                title={isOpen ? 'Minimize' : 'Expand'}
                                key={`investment-property-toggle-${propertyId}-${isOpen}`}
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
                            <Card className={`bg-muted ${
                              showSubjectPropertyAnimation[propertyId] ? 'animate-roll-down-subject-property' : ''
                            }`}>
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <Label className="text-base font-semibold">Is the loan transaction for this property?</Label>
                                  <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`investment-property-subject-yes-${propertyId}`}
                                        name={`investment-property-subject-${propertyId}`}
                                        checked={investmentData[propertyId]?.isSubjectProperty === true}
                                        onChange={() => {
                                          setInvestmentData(prev => ({
                                            ...prev,
                                            [propertyId]: { 
                                              ...prev[propertyId],
                                              isSubjectProperty: true
                                            }
                                          }));
                                          // Trigger same green animation as Primary Residence
                                          setSubjectProperty(propertyId);
                                        }}
                                        data-testid={`radio-investment-property-subject-yes-${propertyId}`}
                                      />
                                      <Label htmlFor={`investment-property-subject-yes-${propertyId}`}>Yes</Label>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`investment-property-subject-no-${propertyId}`}
                                        name={`investment-property-subject-${propertyId}`}
                                        checked={investmentData[propertyId]?.isSubjectProperty === false}
                                        onChange={() => {
                                          setInvestmentData(prev => ({
                                            ...prev,
                                            [propertyId]: { 
                                              ...prev[propertyId],
                                              isSubjectProperty: false
                                            }
                                          }));
                                          // Update global form state to reverse green animation (same as Primary Residence)
                                          const properties = form.watch('property.properties') || [];
                                          const updatedProperties = properties.map(p => 
                                            p.id === propertyId ? { ...p, isSubject: false } : p
                                          );
                                          form.setValue('property.properties', updatedProperties);
                                        }}
                                        data-testid={`radio-investment-property-subject-no-${propertyId}`}
                                      />
                                      <Label htmlFor={`investment-property-subject-no-${propertyId}`}>No</Label>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Property Address - Row 1: Street Address, Unit/Apt, City, State, ZIP Code, County, Property Type */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="space-y-2 md:col-span-3">
                                <Label htmlFor={`investment-property-address-street-${propertyId}`}>Street Address *</Label>
                                <Input
                                  id={`investment-property-address-street-${propertyId}`}
                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.street` as any) : {})}
                                  data-testid={`input-investment-property-street-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`investment-property-address-unit-${propertyId}`}>Unit/Apt</Label>
                                <Input
                                  id={`investment-property-address-unit-${propertyId}`}
                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.unit` as any) : {})}
                                  data-testid={`input-investment-property-unit-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`investment-property-address-city-${propertyId}`}>City *</Label>
                                <Input
                                  id={`investment-property-address-city-${propertyId}`}
                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.city` as any) : {})}
                                  data-testid={`input-investment-property-city-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`investment-property-address-state-${propertyId}`}>State *</Label>
                                <Select {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.state` as any) : {})} 
                                        value={form.watch(`property.properties.${propertyIndex}` as any)?.address?.state || ''} 
                                        onValueChange={(value) => form.setValue(`property.properties.${propertyIndex}.address.state` as any, value)}>
                                  <SelectTrigger data-testid={`select-investment-property-state-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
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
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`investment-property-address-zip-${propertyId}`}>ZIP Code *</Label>
                                <Input
                                  id={`investment-property-address-zip-${propertyId}`}
                                  placeholder="94103"
                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.zip` as any) : {})}
                                  data-testid={`input-investment-property-zip-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`investment-property-address-county-${propertyId}`}>County</Label>
                                <Input
                                  id={`investment-property-address-county-${propertyId}`}
                                  {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.address.county` as any) : {})}
                                  data-testid={`input-investment-property-county-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`investment-property-type-${propertyId}`}>Property Type</Label>
                                <Select {...(propertyIndex >= 0 ? form.register(`property.properties.${propertyIndex}.propertyType` as any) : {})} 
                                        value={form.watch(`property.properties.${propertyIndex}` as any)?.propertyType || ''} 
                                        onValueChange={(value) => form.setValue(`property.properties.${propertyIndex}.propertyType` as any, value)}>
                                  <SelectTrigger data-testid={`select-investment-property-type-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="single-family">Single Family Home</SelectItem>
                                    <SelectItem value="condo">Condominium</SelectItem>
                                    <SelectItem value="townhouse">Townhouse</SelectItem>
                                    <SelectItem value="duplex">Duplex</SelectItem>
                                    <SelectItem value="multi-family">Multi-Family</SelectItem>
                                    <SelectItem value="manufactured">Manufactured Home</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Property Details - Row 2: Purchase Price, Owned Since, Title Held By, Estimated Property Value */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`investment-property-purchase-price-${propertyId}`}>Purchase Price</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto text-black hover:text-gray-600"
                                    title="Purchase Property Value"
                                    data-testid={`button-investment-property-purchase-price-info-${propertyId}`}
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                    return `property.properties.${investmentIndex >= 0 ? investmentIndex : 0}.purchasePrice` as const;
                                  })()}
                                  id={`investment-property-purchase-price-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-investment-property-purchase-price-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <div className="min-h-5 flex items-center gap-2">
                                  <Label htmlFor={`investment-property-owned-since-${propertyId}`}>Purchased</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          toast({
                                            title: "Purchase Information",
                                            description: "Please see purchase and record dates in title report located in vendor page.",
                                            duration: 5000,
                                          });
                                        }}
                                        data-testid={`button-investment-property-purchased-info-${propertyId}`}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={15} className="text-sm">
                                      Purchase Information
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Input
                                  id={`investment-property-owned-since-${propertyId}`}
                                  placeholder="MM/YYYY"
                                  data-testid={`input-investment-property-owned-since-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="min-h-5 flex items-center gap-2">
                                  <Label htmlFor={`investment-property-title-held-by-${propertyId}`}>Title Held By</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          toast({
                                            title: "Title Information",
                                            description: "Please see title report in vendor page.",
                                            duration: 5000,
                                          });
                                        }}
                                        data-testid={`button-investment-property-title-held-info-${propertyId}`}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={15} className="text-sm">
                                      Title Information
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Select>
                                  <SelectTrigger data-testid={`select-investment-property-title-held-by-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="borrower">Borrower</SelectItem>
                                    <SelectItem value="borrowers">Borrowers</SelectItem>
                                    <SelectItem value="co-borrower">Co-Borrower</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2 md:col-span-3">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`investment-property-estimated-value-${propertyId}`}>Estimated Value</Label>
                                  <div className="flex items-center gap-1">
                                    {/* Zillow */}
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800 no-default-hover-elevate no-default-active-elevate"
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                          openValuationDialog('zillow', investmentIndex >= 0 ? investmentIndex : 0);
                                        }}
                                        onMouseEnter={(e) => {
                                          const properties = form.watch('property.properties') || [];
                                          const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                          handleValuationHover('zillow', investmentIndex >= 0 ? investmentIndex : 0, e);
                                        }}
                                        onMouseLeave={handleValuationHoverLeave}
                                        data-testid={`button-investment-property-zillow-valuation-${propertyId}`}
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
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                          openValuationDialog('realtor', investmentIndex >= 0 ? investmentIndex : 0);
                                        }}
                                        onMouseEnter={(e) => {
                                          const properties = form.watch('property.properties') || [];
                                          const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                          handleValuationHover('realtor', investmentIndex >= 0 ? investmentIndex : 0, e);
                                        }}
                                        onMouseLeave={handleValuationHoverLeave}
                                        data-testid={`button-investment-property-realtor-valuation-${propertyId}`}
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
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                          openValuationDialog('redfin', investmentIndex >= 0 ? investmentIndex : 0);
                                        }}
                                        onMouseEnter={(e) => {
                                          const properties = form.watch('property.properties') || [];
                                          const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                          handleValuationHover('redfin', investmentIndex >= 0 ? investmentIndex : 0, e);
                                        }}
                                        onMouseLeave={handleValuationHoverLeave}
                                        data-testid={`button-investment-property-redfin-valuation-${propertyId}`}
                                        title="Enter Redfin valuation manually"
                                      >
                                        <FaHome className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          const properties = form.watch('property.properties') || [];
                                          const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                          openValuationSummary(investmentIndex >= 0 ? investmentIndex : 0);
                                        }}
                                        data-testid={`button-investment-property-valuation-info-${propertyId}`}
                                        title="View all valuation estimates"
                                      >
                                        <Info className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                    return `property.properties.${investmentIndex >= 0 ? investmentIndex : 0}.estimatedValue` as const;
                                  })()}
                                  id={`investment-property-estimated-value-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-investment-property-estimated-value-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2 min-h-8">
                                  <Label htmlFor={`investment-property-appraised-value-${propertyId}`}>Appraised Value</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto"
                                    title="Appraised Property Value"
                                    data-testid={`button-investment-property-appraised-value-info-${propertyId}`}
                                  >
                                    {(() => {
                                      const properties = form.watch('property.properties') || [];
                                      const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                      return <AppraisalIcon index={investmentIndex >= 0 ? investmentIndex : 0} control={form.control} />;
                                    })()}
                                  </Button>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                    return `property.properties.${investmentIndex >= 0 ? investmentIndex : 0}.appraisedValue` as const;
                                  })()}
                                  id={`investment-property-appraised-value-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-investment-property-appraised-value-${propertyId}`}
                                  shadowColor={(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                    const estimatedValue = form.watch(`property.properties.${investmentIndex >= 0 ? investmentIndex : 0}.estimatedValue` as const) || '';
                                    const appraisedValue = form.watch(`property.properties.${investmentIndex >= 0 ? investmentIndex : 0}.appraisedValue` as const) || '';
                                    return getValueComparisonColor(estimatedValue, appraisedValue).shadowColor;
                                  })()}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2 min-h-8">
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`investment-property-active-secured-loan-${propertyId}`}>Secured Loan</Label>
                                    {(() => {
                                      // Check ALL loans for attachment to this property
                                      const properties = form.watch('property.properties') || [];
                                      const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                      const currentProperty = investmentIndex >= 0 ? properties[investmentIndex] : null;
                                      
                                      // Check current loan
                                      const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                      const isCurrentLoanAttached = Boolean(currentLoanAttached && currentProperty?.id && currentLoanAttached === currentProperty.id);
                                      
                                      // Check second loan
                                      const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                      const isSecondLoanAttached = Boolean(secondLoanAttached && currentProperty?.id && secondLoanAttached === currentProperty.id);
                                      
                                      // Check third loan (first additional loan - Current Third Loan)
                                      const additionalLoansData = additionalLoans || [];
                                      const firstAdditionalLoan = additionalLoansData[0]; // This is "Current Third Loan"
                                      const isThirdLoanAttached = firstAdditionalLoan ? (() => {
                                        const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                        return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                      })() : false;
                                      
                                      // Check other additional loans (loan4, loan5, etc.)
                                      const isOtherAdditionalLoanAttached = additionalLoansData.slice(1).some(loan => {
                                        const attachedPropertyId = getDyn(`${loan.id}.attachedToProperty`);
                                        return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                      });
                                      
                                      const hasAnyLoanAttached = isCurrentLoanAttached || isSecondLoanAttached || isThirdLoanAttached || isOtherAdditionalLoanAttached;
                                      
                                      return (
                                        <div className="flex items-center gap-1">
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isCurrentLoanAttached
                                                ? 'bg-blue-500 border-blue-500 hover:bg-blue-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isCurrentLoanAttached ? '#3b82f6' : '#e5e7eb',
                                              borderColor: isCurrentLoanAttached ? '#3b82f6' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isCurrentLoanAttached) {
                                                setIsCurrentLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isCurrentLoanAttached ? "View Current Loan Details" : ""}
                                            data-testid={`indicator-investment-property-secured-loan-1-${propertyId}`}
                                          />
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isSecondLoanAttached
                                                ? 'bg-purple-500 border-purple-500 hover:bg-purple-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isSecondLoanAttached ? '#8b5cf6' : '#e5e7eb',
                                              borderColor: isSecondLoanAttached ? '#8b5cf6' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isSecondLoanAttached) {
                                                setIsCurrentSecondLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isSecondLoanAttached ? "View Current Loan 2 Details" : ""}
                                            data-testid={`indicator-investment-property-secured-loan-2-${propertyId}`}
                                          />
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isThirdLoanAttached
                                                ? 'bg-orange-500 border-orange-500 hover:bg-orange-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isThirdLoanAttached ? '#f97316' : '#e5e7eb',
                                              borderColor: isThirdLoanAttached ? '#f97316' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isThirdLoanAttached) {
                                                setIsCurrentThirdLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isThirdLoanAttached ? "View Current Third Loan Details" : ""}
                                            data-testid={`indicator-investment-property-secured-loan-3-${propertyId}`}
                                          />
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  {(() => {
                                    const properties = form.watch('property.properties') || [];
                                    const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                    const currentProperty = investmentIndex >= 0 ? properties[investmentIndex] : null;
                                    
                                    // Check which loans are attached to this property for counter
                                    const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                    const isCurrentLoanAttached = Boolean(currentLoanAttached && currentProperty?.id && currentLoanAttached === currentProperty.id);
                                    
                                    const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                    const isSecondLoanAttached = Boolean(secondLoanAttached && currentProperty?.id && secondLoanAttached === currentProperty.id);
                                    
                                    // Check third loan (first additional loan - Current Loan 3)
                                    const additionalLoansData = additionalLoans || [];
                                    const firstAdditionalLoan = additionalLoansData[0];
                                    const isThirdLoanAttached = firstAdditionalLoan ? (() => {
                                      const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                      return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                    })() : false;
                                    
                                    // Count active loans
                                    let activeLoansCount = 0;
                                    if (isCurrentLoanAttached) activeLoansCount++;
                                    if (isSecondLoanAttached) activeLoansCount++;
                                    if (isThirdLoanAttached) activeLoansCount++;
                                    
                                    return (
                                      <div 
                                        className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-600"
                                        data-testid={`investment-property-loan-counter-${propertyId}`}
                                        title={`${activeLoansCount} loan(s) connected`}
                                      >
                                        {activeLoansCount}
                                      </div>
                                    );
                                  })()}
                                </div>
                                {(() => {
                                  // Automatic loan detection logic for Investment Property
                                  const properties = form.watch('property.properties') || [];
                                  const investmentIndex = properties.findIndex(p => p.use === 'investment' && p.id === propertyId);
                                  const currentProperty = investmentIndex >= 0 ? properties[investmentIndex] : null;
                                  
                                  if (!currentProperty?.id) return (
                                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-default">
                                      <span className="text-muted-foreground">Attach</span>
                                    </div>
                                  );
                                  
                                  // Check all loans for attachment to this property
                                  const attachedLoans = [];
                                  
                                  // Check current loan
                                  const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                  if (currentLoanAttached && currentLoanAttached === currentProperty.id) {
                                    attachedLoans.push('Current Primary Loan');
                                  }
                                  
                                  // Check second loan
                                  const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                  if (secondLoanAttached && secondLoanAttached === currentProperty.id) {
                                    attachedLoans.push('Current Second Loan');
                                  }
                                  
                                  // Check third loan (first additional loan)
                                  const additionalLoansData = additionalLoans || [];
                                  const firstAdditionalLoan = additionalLoansData[0];
                                  if (firstAdditionalLoan) {
                                    const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                    if (attachedPropertyId && attachedPropertyId === currentProperty.id) {
                                      attachedLoans.push('Current Third Loan');
                                    }
                                  }
                                  
                                  // Check other additional loans
                                  additionalLoansData.slice(1).forEach((loan, index) => {
                                    const attachedPropertyId = getDyn(`${loan.id}.attachedToProperty`);
                                    if (attachedPropertyId && attachedPropertyId === currentProperty.id) {
                                      attachedLoans.push(`Current Loan ${index + 4}`);
                                    }
                                  });
                                  
                                  // Determine display text
                                  let displayText = 'Attach';
                                  if (attachedLoans.length === 1) {
                                    displayText = attachedLoans[0];
                                  } else if (attachedLoans.length === 2) {
                                    displayText = '1st & 2nd Loan';
                                  } else if (attachedLoans.length === 3) {
                                    displayText = 'Three Loans';
                                  } else if (attachedLoans.length > 3) {
                                    displayText = `${attachedLoans.length} Loans`;
                                  }
                                  
                                  const hasLoansAttached = attachedLoans.length > 0;
                                  
                                  return (
                                    <Select>
                                      <SelectTrigger data-testid={`select-investment-property-secured-loan-${propertyId}`}>
                                        <SelectValue placeholder={displayText} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="paid-off">Paid Off</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  );
                                })()}
                              </div>
                            </div>

                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}

              {/* Dynamic Property Cards */}
              {sortPropertiesByHierarchy(form.watch('property.properties') || [])
                .filter(property => property.use !== 'primary' && property.use !== 'second-home' && property.use !== 'investment') // Exclude Primary Residence, Second Home, and Investment Property - now handled by new systems above
                .map((property, index) => {
                const propertyId = property.id || `property-${index}`;
                const isOpen = propertyCardStates[propertyId] ?? true;
                
                const getPropertyTitle = () => {
                  const typeLabels = {
                    'home-purchase': 'Home Purchase',
                    'primary': 'Primary Residence',
                    'second-home': 'Second Home',
                    'investment': 'Investment Property'
                  };
                  const baseTitle = typeLabels[property.use as keyof typeof typeLabels] || 'Property';
                  const sameTypeCount = (form.watch('property.properties') || [])
                    .filter(p => p.use === property.use)
                    .findIndex(p => p.id === property.id) + 1;
                  return (property.use === 'primary' || property.use === 'home-purchase' || property.use === 'second-home' || property.use === 'investment') ? baseTitle : `${baseTitle} ${sameTypeCount}`;
                };

                return (
                  <Card key={propertyId} className={`border-l-4 transition-colors duration-200 ${
                    property.use === 'home-purchase' ? 'border-l-cyan-500 hover:border-cyan-500 focus-within:border-cyan-500' :
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
                                  Subject Property
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
                                  title="add"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeProperty(propertyId)}
                                  data-testid={`button-remove-${property.use}-${propertyId}`}
                                  title="Delete"
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
                            <Card className={`bg-muted ${
                              showSubjectPropertyAnimation[propertyId] ? 'animate-roll-down-subject-property' : ''
                            }`}>
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <Label className="text-base font-semibold">Is the loan transaction for this property?</Label>
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

                            {/* Property Address - Row 1: Street Address, Unit/Apt, City, State, ZIP Code, County, Property Type */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="space-y-2 md:col-span-3">
                                <Label htmlFor={`property-address-street-${propertyId}`}>Street Address *</Label>
                                <Input
                                  id={`property-address-street-${propertyId}`}
                                  {...form.register(`property.properties.${index}.address.street` as const)}

                                  data-testid={`input-property-street-${propertyId}`}
                                  onBlur={() => {
                                    // Trigger auto-fetch after a delay to allow other fields to be filled
                                    setTimeout(() => handleAddressChange(index), 1000);
                                  }}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`property-address-unit-${propertyId}`}>Unit/Apt</Label>
                                <Input
                                  id={`property-address-unit-${propertyId}`}
                                  {...form.register(`property.properties.${index}.address.unit` as const)}
                                  data-testid={`input-property-unit-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`property-address-city-${propertyId}`}>City *</Label>
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
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`property-address-state-${propertyId}`}>State *</Label>
                                <Select
                                  value={form.watch(`property.properties.${index}.address.state` as const) || ''}
                                  onValueChange={(value) => form.setValue(`property.properties.${index}.address.state` as const, value)}
                                >
                                  <SelectTrigger data-testid={`select-property-state-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
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
                              
                              <div className="space-y-2 md:col-span-1">
                                <Label htmlFor={`property-address-zip-${propertyId}`}>ZIP Code *</Label>
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
                              
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`property-type-${propertyId}`}>Property Type</Label>
                                <Select
                                  value={form.watch(`property.properties.${index}.propertyType` as const) || ''}
                                  onValueChange={(value) => form.setValue(`property.properties.${index}.propertyType` as const, value)}
                                >
                                  <SelectTrigger data-testid={`select-property-type-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
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
                            </div>

                            {/* Property Details - Row 2: Purchase Price, Owned Since, Title Held By, Estimated Property Value, Appraised Value, Secured First Loan, Secured Second Loan */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`property-purchase-price-${propertyId}`}>Purchase Price</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto text-black hover:text-gray-600"
                                    title="Purchase Property Value"
                                    data-testid={`button-purchase-price-info-${propertyId}`}
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Input
                                  id={`property-purchase-price-${propertyId}`}
                                  value={form.watch(`property.properties.${index}.purchasePrice` as const) || ''}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(/[^\d.]/g, '');
                                    if (value) {
                                      const numValue = parseFloat(value);
                                      if (!isNaN(numValue)) {
                                        value = `$${numValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                                      }
                                    }
                                    form.setValue(`property.properties.${index}.purchasePrice` as const, value);
                                  }}
                                  placeholder="$0.00"
                                  data-testid={`input-property-purchase-price-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-1">
                                <div className="min-h-5 flex items-center gap-2">
                                  <Label htmlFor={`property-owned-since-${propertyId}`}>Purchased</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          toast({
                                            title: "Purchase Information",
                                            description: "Please see purchase and record dates in title report located in vendor page.",
                                            duration: 5000,
                                          });
                                        }}
                                        data-testid={`button-purchased-info-${propertyId}`}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={15} className="text-sm">
                                      Purchase Information
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Input
                                  id={`property-owned-since-${propertyId}`}
                                  {...form.register(`property.properties.${index}.ownedSince` as const)}
                                  placeholder="MM/YYYY"
                                  data-testid={`input-property-owned-since-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="min-h-5 flex items-center gap-2">
                                  <Label htmlFor={`property-title-held-by-${propertyId}`}>Title Held By</Label>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => {
                                          toast({
                                            title: "Title Information",
                                            description: "Please see title report in vendor page.",
                                            duration: 5000,
                                          });
                                        }}
                                        data-testid={`button-title-held-info-${propertyId}`}
                                      >
                                        <Info className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={15} className="text-sm">
                                      Title Information
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Select
                                  value={form.watch(`property.properties.${index}.ownedHeldBy` as const) || ''}
                                  onValueChange={(value: string) => {
                                    form.setValue(`property.properties.${index}.ownedHeldBy` as const, value as any);
                                  }}
                                >
                                  <SelectTrigger data-testid={`select-property-title-held-by-${propertyId}`}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="borrower">Borrower</SelectItem>
                                    <SelectItem value="borrowers">Borrowers</SelectItem>
                                    <SelectItem value="co-borrower">Co-Borrower</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2 md:col-span-3">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`property-estimated-value-${propertyId}`}>Estimated Value</Label>
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
                                        className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => openValuationSummary(index)}
                                        data-testid={`button-valuation-info-${propertyId}`}
                                        title="View all valuation estimates"
                                      >
                                        <Info className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={`property.properties.${index}.estimatedValue` as const}
                                  id={`property-estimated-value-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-property-estimated-value-${propertyId}`}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2 min-h-8">
                                  <Label htmlFor={`property-appraised-value-${propertyId}`}>Appraised Value</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto"
                                    title="Appraised Property Value"
                                    data-testid={`button-appraised-value-info-${propertyId}`}
                                  >
                                    <AppraisalIcon index={index} control={form.control} />
                                  </Button>
                                </div>
                                <CurrencyInput
                                  form={form}
                                  name={`property.properties.${index}.appraisedValue` as const}
                                  id={`property-appraised-value-${propertyId}`}
                                  placeholder="$0.00"
                                  data-testid={`input-property-appraised-value-${propertyId}`}
                                  shadowColor={(() => {
                                    const estimatedValue = form.watch(`property.properties.${index}.estimatedValue` as const) || '';
                                    const appraisedValue = form.watch(`property.properties.${index}.appraisedValue` as const) || '';
                                    return getValueComparisonColor(estimatedValue, appraisedValue).shadowColor;
                                  })()}
                                />
                              </div>
                              
                              <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center gap-2 min-h-8">
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`property-active-secured-loan-${propertyId}`}>Secured Loan</Label>
                                    {(() => {
                                      // Check ALL loans for attachment to this property
                                      const currentProperty = property;
                                      
                                      // Check current loan
                                      const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                      const isCurrentLoanAttached = Boolean(currentLoanAttached && currentProperty?.id && currentLoanAttached === currentProperty.id);
                                      
                                      // Check second loan
                                      const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                      const isSecondLoanAttached = Boolean(secondLoanAttached && currentProperty?.id && secondLoanAttached === currentProperty.id);
                                      
                                      // Check third loan (first additional loan - Current Third Loan)
                                      const additionalLoansData = additionalLoans || [];
                                      const firstAdditionalLoan = additionalLoansData[0]; // This is "Current Third Loan"
                                      const isThirdLoanAttached = firstAdditionalLoan ? (() => {
                                        const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                        return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                      })() : false;
                                      
                                      // Check other additional loans (loan4, loan5, etc.)
                                      const isOtherAdditionalLoanAttached = additionalLoansData.slice(1).some(loan => {
                                        const attachedPropertyId = getDyn(`${loan.id}.attachedToProperty`);
                                        return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                      });
                                      
                                      const hasAnyLoanAttached = isCurrentLoanAttached || isSecondLoanAttached || isThirdLoanAttached || isOtherAdditionalLoanAttached;
                                      
                                      return (
                                        <div className="flex items-center gap-1">
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isCurrentLoanAttached
                                                ? 'bg-blue-500 border-blue-500 hover:bg-blue-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isCurrentLoanAttached ? '#3b82f6' : '#e5e7eb',
                                              borderColor: isCurrentLoanAttached ? '#3b82f6' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isCurrentLoanAttached) {
                                                setIsCurrentLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isCurrentLoanAttached ? "View Current Loan Details" : ""}
                                            data-testid={`indicator-secured-loan-1-${property.id}`}
                                          />
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isSecondLoanAttached
                                                ? 'bg-purple-500 border-purple-500 hover:bg-purple-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isSecondLoanAttached ? '#8b5cf6' : '#e5e7eb',
                                              borderColor: isSecondLoanAttached ? '#8b5cf6' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isSecondLoanAttached) {
                                                setIsCurrentSecondLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isSecondLoanAttached ? "View Current Loan 2 Details" : ""}
                                            data-testid={`indicator-secured-loan-2-${property.id}`}
                                          />
                                          <div 
                                            className={`w-3 h-3 rounded-full border-2 cursor-pointer ${
                                              isThirdLoanAttached
                                                ? 'bg-orange-500 border-orange-500 hover:bg-orange-600'
                                                : 'bg-gray-200 border-gray-300'
                                            }`}
                                            style={{
                                              backgroundColor: isThirdLoanAttached ? '#f97316' : '#e5e7eb',
                                              borderColor: isThirdLoanAttached ? '#f97316' : '#d1d5db'
                                            }}
                                            onClick={() => {
                                              if (isThirdLoanAttached) {
                                                setIsCurrentThirdLoanPreviewOpen(true);
                                              }
                                            }}
                                            title={isThirdLoanAttached ? "View Current Third Loan Details" : ""}
                                            data-testid={`indicator-secured-loan-3-${property.id}`}
                                          />
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  {(() => {
                                    const currentProperty = property;
                                    
                                    // Check which loans are attached to this property for counter
                                    const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                    const isCurrentLoanAttached = Boolean(currentLoanAttached && currentProperty?.id && currentLoanAttached === currentProperty.id);
                                    
                                    const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                    const isSecondLoanAttached = Boolean(secondLoanAttached && currentProperty?.id && secondLoanAttached === currentProperty.id);
                                    
                                    // Check third loan (first additional loan - Current Loan 3)
                                    const additionalLoansData = additionalLoans || [];
                                    const firstAdditionalLoan = additionalLoansData[0];
                                    const isThirdLoanAttached = firstAdditionalLoan ? (() => {
                                      const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                      return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                    })() : false;
                                    
                                    // Count active loans
                                    let activeLoansCount = 0;
                                    if (isCurrentLoanAttached) activeLoansCount++;
                                    if (isSecondLoanAttached) activeLoansCount++;
                                    if (isThirdLoanAttached) activeLoansCount++;
                                    
                                    return (
                                      <div 
                                        className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border border-gray-300 text-xs font-semibold text-gray-600"
                                        data-testid={`loan-counter-${property.id}`}
                                        title={`${activeLoansCount} loan(s) connected`}
                                      >
                                        {activeLoansCount}
                                      </div>
                                    );
                                  })()}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                      toast({
                                        title: "Loan Information",
                                        description: "Please complete loans associated with this property using the loan menu option",
                                        duration: 5000,
                                      });
                                    }}
                                    title="Loan completion instructions"
                                    data-testid={`button-secured-loan-info-${propertyId}`}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </div>
{(() => {
                                  // Dynamic connection display field - checks ALL loans
                                  const currentProperty = property;
                                  
                                  // Check current loan
                                  const currentLoanAttached = form.watch('currentLoan.attachedToProperty');
                                  const isCurrentLoanAttached = Boolean(currentLoanAttached && currentProperty?.id && currentLoanAttached === currentProperty.id);
                                  
                                  // Check second loan
                                  const secondLoanAttached = form.watch('secondLoan.attachedToProperty');
                                  const isSecondLoanAttached = Boolean(secondLoanAttached && currentProperty?.id && secondLoanAttached === currentProperty.id);
                                  
                                  // Check third loan (first additional loan - Current Loan 3)
                                  const additionalLoansData = additionalLoans || [];
                                  const firstAdditionalLoan = additionalLoansData[0]; // This is "Current Loan 3"
                                  const isThirdLoanAttached = firstAdditionalLoan ? (() => {
                                    const attachedPropertyId = getDyn(`${firstAdditionalLoan.id}.attachedToProperty`);
                                    return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                  })() : false;
                                  
                                  // Check other additional loans (loan4, loan5, etc.)
                                  const isOtherAdditionalLoanAttached = additionalLoansData.slice(1).some(loan => {
                                    const attachedPropertyId = getDyn(`${loan.id}.attachedToProperty`);
                                    return Boolean(attachedPropertyId && currentProperty?.id && attachedPropertyId === currentProperty.id);
                                  });
                                  
                                  const hasAnyLoanAttached = isCurrentLoanAttached || isSecondLoanAttached || isThirdLoanAttached || isOtherAdditionalLoanAttached;
                                  const displayValue = hasAnyLoanAttached ? 'Yes' : 'connect';
                                  
                                  return (
                                    <div 
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-default"
                                      data-testid={`display-property-active-secured-loan-${propertyId}`}
                                    >
                                      <span className={hasAnyLoanAttached ? 'text-foreground' : 'text-muted-foreground'}>
                                        {displayValue}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>






                            {/* Third Loan Details Box - Only show when activeThirdLoan is 'yes' and property is primary/second-home */}
                            {(property.use === 'home-purchase' || property.use === 'primary' || property.use === 'second-home') && form.watch(`property.properties.${index}.activeThirdLoan` as const) === 'yes' && (
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
              
              {/* Transaction Card - Matching Income Tab Structure */}
              <Card className="transition-all duration-700">
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Transaction</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">New Loans</Label>
                    <div className="min-h-[40px] flex items-center">
                      <div
                        className="bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                        style={{
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          fontSize: '36px',
                          fontWeight: 600,
                          backgroundColor: '#1a3373',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                        }}
                        data-testid="circle-1"
                      >
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">New Loan Type</Label>
                    <div className="min-h-[40px] flex items-center">
                      <div
                        className="bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                        style={{
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          fontSize: '36px',
                          fontWeight: 600,
                          backgroundColor: '#1a3373',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                        }}
                        data-testid="circle-2"
                      >
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Current Loans</Label>
                    <div className="min-h-[40px] flex items-center">
                      <div
                        className="bg-navy-900 hover:bg-navy-800 text-white rounded-full w-20 h-20 flex items-center justify-center transition-colors duration-200"
                        style={{
                          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                          fontSize: '36px',
                          fontWeight: 600,
                          backgroundColor: '#1a3373',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                        }}
                        data-testid="circle-3"
                      >
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loan List Card - Visual Copy (No Functionality) */}
              <Card className="transition-all duration-700">
                <CardHeader>
                  <CardTitle>Loan List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-primary-loan-tab"
                          disabled
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg] border-black"
                          data-testid="checkbox-property-primary-loan-tab"
                        />
                        <Label htmlFor="property-type-primary-loan-tab" className="font-medium text-black">
                          New Primary Loan
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-second-home-loan-tab"
                          disabled
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg] border-black"
                          data-testid="checkbox-property-second-home-loan-tab"
                        />
                        <Label htmlFor="property-type-second-home-loan-tab" className="font-medium text-black">
                          New Second Loan (HELOC)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-investment-loan-tab"
                          disabled
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg] border-black"
                          data-testid="checkbox-property-investment-loan-tab"
                        />
                        <Label htmlFor="property-type-investment-loan-tab" className="font-medium text-black">
                          New Second Loan (Fixed)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="property-type-home-purchase-loan-tab"
                          disabled
                          className="border-black"
                          data-testid="checkbox-property-home-purchase-loan-tab"
                        />
                        <Label htmlFor="property-type-home-purchase-loan-tab" className="font-medium text-black">
                          New Loan (Other)
                        </Label>
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="current-primary-loan-tab"
                          checked={(currentPrimaryLoanCards || []).length > 0}
                          onCheckedChange={(checked) => {
                            if (typeof checked === 'boolean') {
                              handleCurrentPrimaryLoanTypeChange(checked);
                            }
                          }}
                          className={`transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg] border-black ${
                            (currentPrimaryLoanCards || []).length > 0 ? 'pointer-events-none opacity-75' : ''
                          }`}
                          data-testid="checkbox-current-primary-loan-tab"
                        />
                        <Label 
                          htmlFor="current-primary-loan-tab" 
                          className={`font-medium text-black ${
                            (currentPrimaryLoanCards || []).length > 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer'
                          }`}
                        >
                          Current Primary Loan
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="current-second-loan-tab"
                          checked={(currentSecondLoanCards || []).length > 0}
                          onCheckedChange={(checked) => {
                            if (typeof checked === 'boolean') {
                              handleCurrentSecondLoanTypeChange(checked);
                            }
                          }}
                          className={`transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg] border-black ${
                            (currentSecondLoanCards || []).length > 0 ? 'pointer-events-none opacity-75' : ''
                          }`}
                          data-testid="checkbox-current-second-loan-tab"
                        />
                        <Label 
                          htmlFor="current-second-loan-tab" 
                          className={`font-medium text-black ${
                            (currentSecondLoanCards || []).length > 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer'
                          }`}
                        >
                          Current Second Loan
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="current-third-loan-tab"
                          checked={(currentThirdLoanCards || []).length > 0}
                          onCheckedChange={(checked) => {
                            if (typeof checked === 'boolean') {
                              handleCurrentThirdLoanTypeChange(checked);
                            }
                          }}
                          className={`transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg] border-black ${
                            (currentThirdLoanCards || []).length > 0 ? 'pointer-events-none opacity-75' : ''
                          }`}
                          data-testid="checkbox-current-third-loan-tab"
                        />
                        <Label 
                          htmlFor="current-third-loan-tab" 
                          className={`font-medium text-black ${
                            (currentThirdLoanCards || []).length > 0 ? 'pointer-events-none opacity-75' : 'cursor-pointer'
                          }`}
                        >
                          Current Third Loan
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="other-loan-tab"
                          disabled
                          className="transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg] border-black"
                          data-testid="checkbox-other-loan-tab"
                        />
                        <Label htmlFor="other-loan-tab" className="font-medium text-black">
                          Other
                        </Label>
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>

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

              {/* Current Primary Loan Cards - Render multiple cards like Property cards */}
              {(currentPrimaryLoanCards || []).map((cardId, index) => {
                const isOpen = currentLoanCardStates[cardId] ?? true; // Per-card state like Property cards
                
                return (
                  <CurrentLoanCard
                    key={cardId}
                    idPrefix={`card-${index}-`}
                    borderVariant="blue"
                    isOpen={isOpen}
                    setIsOpen={(open) => setCurrentLoanCardStates(prev => ({ ...prev, [cardId]: open }))}
                    onRemove={() => {
                      setDeleteCurrentPrimaryLoanDialog({
                        isOpen: true,
                        cardId: cardId
                      });
                    }}
                    onAutoCopyAddress={autoCopyPropertyAddressToCurrentLoan}
                    formInstance={form}
                  />
                );
              })}

              {/* Current Second Loan Cards - Render multiple cards like Property cards and Primary Loan cards */}
              {(currentSecondLoanCards || []).map((cardId, index) => {
                const isOpen = secondLoanCardStates[cardId] ?? true; // Per-card state like Property cards
                
                return (
                  <CurrentSecondLoanCard
                    key={cardId}
                    idPrefix={`second-card-${index}-`}
                    borderVariant="blue"
                    isOpen={isOpen}
                    setIsOpen={(open) => setSecondLoanCardStates(prev => ({ ...prev, [cardId]: open }))}
                    onRemove={() => {
                      setDeleteCurrentSecondLoanDialog({
                        isOpen: true,
                        cardId: cardId
                      });
                    }}
                    onAutoCopyAddress={autoCopyPropertyAddressToLoanTabSecondLoan}
                    onAddAdditionalLoan={handleAddAdditionalLoan}
                    formInstance={form}
                  />
                );
              })}

              {/* Additional Loan Cards - Render all additional loans with sequential numbering: 3, 4, 5, etc. */}
              {additionalLoans.map((loan, index) => (
                <AdditionalLoanCard
                  key={loan.id}
                  loanId={loan.id}
                  loanNumber={3 + index}
                  isOpen={loan.isOpen}
                  setIsOpen={(open) => toggleAdditionalLoanOpen(loan.id)}
                  onRemove={() => removeAdditionalLoan(loan.id)}
                  onAddAdditionalLoan={handleAddAdditionalLoan}
                  onAutoCopyAddress={createAutoCopyAddressFunction(loan.id)}
                  formInstance={form}
                />
              ))}

              {/* Current Third Loan Cards - Dynamic multiple card system like Primary and Second Loan */}
              {(currentThirdLoanCards || []).map((cardId, index) => {
                const isOpen = thirdLoanCardStates[cardId] ?? true; // Per-card state like Property cards
                
                return (
                  <CurrentThirdLoanCard
                    key={cardId}
                    idPrefix={`third-card-${index}-`}
                    borderVariant="blue"
                    isOpen={isOpen}
                    setIsOpen={(open) => setThirdLoanCardStates(prev => ({ ...prev, [cardId]: open }))}
                    onRemove={() => {
                      setDeleteCurrentThirdLoanDialog({
                        isOpen: true,
                        cardId: cardId
                      });
                    }}
                    onAutoCopyAddress={autoCopyPropertyAddressToGlobalThirdLoan}
                    onAddAdditionalLoan={handleAddAdditionalLoan}
                    formInstance={form}
                  />
                );
              })}
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
                  : confirmRemovalDialog.type === 'prior-employer'
                  ? "Removing the prior employer will delete all entered data. Would you like to continue?"
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

      {/* Business Description Dialog */}
      <Dialog open={businessDescriptionDialog.isOpen} onOpenChange={(open) => !open && closeBusinessDescriptionDialog()}>
        <DialogContent data-testid="dialog-business-description">
          <DialogHeader>
            <DialogTitle>Description</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <textarea
                id="business-description-input"
                value={businessDescriptionInput}
                onChange={(e) => setBusinessDescriptionInput(e.target.value)}
                placeholder="Describe the nature of the business, services offered, products sold, etc."
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
                data-testid="textarea-business-description"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeBusinessDescriptionDialog}
              data-testid="button-business-description-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={businessDescriptionDialog.type === 'co-borrower' ? saveCoBorrowerBusinessDescription : saveBusinessDescription}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-business-description-save"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tax Preparer Dialog */}
      <Dialog open={taxPreparerDialog.isOpen} onOpenChange={(open) => !open && closeTaxPreparerDialog()}>
        <DialogContent data-testid="dialog-tax-preparer">
          <DialogHeader>
            <DialogTitle>Tax Preparer Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tax-preparer-select">Business tax returns are prepared and filed by</Label>
              <Select
                value={taxPreparerInput}
                onValueChange={(value) => setTaxPreparerInput(value)}
              >
                <SelectTrigger data-testid="select-tax-preparer">
                  <SelectValue placeholder="Select who prepares tax returns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Select">Select</SelectItem>
                  <SelectItem value="Borrower(s)">Borrower(s)</SelectItem>
                  <SelectItem value="Tax Preparer">Tax Preparer</SelectItem>
                  <SelectItem value="CPA">CPA</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeTaxPreparerDialog}
              data-testid="button-tax-preparer-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={taxPreparerDialog.type === 'co-borrower' ? saveCoBorrowerTaxPreparer : saveTaxPreparer}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-tax-preparer-save"
            >
              Save
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
                      <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-muted-foreground">APPRAISAL</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                {formatCurrency(appraisedValue)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm text-muted-foreground">CLIENT ESTIMATE</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">
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
                              <p className="font-semibold text-sm text-muted-foreground">ZILLOW.COM</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
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
                              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
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
                              <p className="font-semibold text-sm text-muted-foreground">REDFIN.COM</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(redfinEstimate)}
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

      {/* Delete Borrower Employer Confirmation Dialog */}
      <AlertDialog open={deleteEmployerDialog.isOpen} onOpenChange={(open) => !open && setDeleteEmployerDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-employer">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employer Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this employer card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteEmployerDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-employer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteEmployerDialog.cardId;
                
                // If removing the default card, clear the checkbox and related fields
                if (cardToDelete === 'template-card') {
                  form.setValue('income.incomeTypes.employment', false);
                  // Clear the employer card list (empty array removes all cards)
                  setBorrowerEmployerCards([]);
                  // Clear all employer form fields
                  const currentCards = borrowerEmployerCards || ['default'];
                  currentCards.forEach(cardId => {
                    const cleanCardId = cardId === 'default' ? 'default' : cardId;
                    const basePath = `income.employers.${cleanCardId}` as const;
                    // Clear employer info
                    form.setValue(`${basePath}.employerName`, '');
                    form.setValue(`${basePath}.jobTitle`, '');
                    form.setValue(`${basePath}.monthlyIncome`, '');
                    form.setValue(`${basePath}.monthlyBonusIncome`, '');
                    form.setValue(`${basePath}.annualBonusIncome`, '');
                    form.setValue(`${basePath}.employmentType`, 'Full-Time');
                    form.setValue(`${basePath}.yearsEmployedYears`, '');
                    form.setValue(`${basePath}.yearsEmployedMonths`, '');
                    form.setValue(`${basePath}.employerAddress.street`, '');
                    form.setValue(`${basePath}.employerAddress.unit`, '');
                    form.setValue(`${basePath}.employerAddress.city`, '');
                    form.setValue(`${basePath}.employerAddress.state`, '');
                    form.setValue(`${basePath}.employerAddress.zip`, '');
                    form.setValue(`${basePath}.employerAddress.county`, '');
                    form.setValue(`${basePath}.employerPhone`, '');
                    form.setValue(`${basePath}.employmentVerificationPhone`, '');
                    form.setValue(`${basePath}.employerRemote`, '');
                  });
                } else {
                  // Remove the specific card
                  setBorrowerEmployerCards(prev => prev.filter(id => id !== cardToDelete));
                  // Clear form fields for this specific card
                  const cleanCardId = cardToDelete;
                  const basePath = `income.employers.${cleanCardId}` as const;
                  form.setValue(`${basePath}.employerName`, '');
                  form.setValue(`${basePath}.jobTitle`, '');
                  form.setValue(`${basePath}.monthlyIncome`, '');
                  form.setValue(`${basePath}.monthlyBonusIncome`, '');
                  form.setValue(`${basePath}.annualBonusIncome`, '');
                  form.setValue(`${basePath}.employmentType`, 'Full-Time');
                  form.setValue(`${basePath}.yearsEmployedYears`, '');
                  form.setValue(`${basePath}.yearsEmployedMonths`, '');
                  form.setValue(`${basePath}.employerAddress.street`, '');
                  form.setValue(`${basePath}.employerAddress.unit`, '');
                  form.setValue(`${basePath}.employerAddress.city`, '');
                  form.setValue(`${basePath}.employerAddress.state`, '');
                  form.setValue(`${basePath}.employerAddress.zip`, '');
                  form.setValue(`${basePath}.employerAddress.county`, '');
                  form.setValue(`${basePath}.employerPhone`, '');
                  form.setValue(`${basePath}.employmentVerificationPhone`, '');
                  form.setValue(`${basePath}.employerRemote`, '');
                }
                
                setDeleteEmployerDialog({ isOpen: false, cardId: '' });
              }}
              data-testid="button-confirm-delete-employer"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Borrower Second Employer Confirmation Dialog */}
      <AlertDialog open={deleteSecondEmployerDialog.isOpen} onOpenChange={(open) => !open && setDeleteSecondEmployerDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-second-employer">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Second Employer Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this second employer card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteSecondEmployerDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-second-employer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteSecondEmployerDialog.cardId;
                
                // If removing the default card, clear the checkbox and related fields
                if (cardToDelete === 'second-template-card') {
                  form.setValue('income.incomeTypes.secondEmployment', false);
                  // Clear the second employment card list (empty array removes all cards)
                  setBorrowerSecondEmployerCards([]);
                  // Clear all second employment form fields
                  const currentCards = borrowerSecondEmployerCards || ['default'];
                  currentCards.forEach(cardId => {
                    const cleanCardId = cardId === 'default' ? 'default' : cardId;
                    // Clear employer info
                    form.setValue(`income.secondEmployment.${cleanCardId}.employerName` as any, '');
                    form.setValue(`income.secondEmployment.${cleanCardId}.address` as any, '');
                    form.setValue(`income.secondEmployment.${cleanCardId}.phone` as any, '');
                    form.setValue(`income.secondEmployment.${cleanCardId}.position` as any, '');
                    form.setValue(`income.secondEmployment.${cleanCardId}.monthlySalary` as any, '');
                    // Clear duration info
                    form.setValue(`income.secondEmployment.${cleanCardId}.duration` as any, '');
                  });
                } else {
                  // Remove the specific card
                  setBorrowerSecondEmployerCards(prev => prev.filter(id => id !== cardToDelete));
                  // Clear form fields for this specific card
                  const cleanCardId = cardToDelete;
                  form.setValue(`income.secondEmployment.${cleanCardId}.employerName` as any, '');
                  form.setValue(`income.secondEmployment.${cleanCardId}.address` as any, '');
                  form.setValue(`income.secondEmployment.${cleanCardId}.phone` as any, '');
                  form.setValue(`income.secondEmployment.${cleanCardId}.position` as any, '');
                  form.setValue(`income.secondEmployment.${cleanCardId}.monthlySalary` as any, '');
                  form.setValue(`income.secondEmployment.${cleanCardId}.duration` as any, '');
                }
                
                setDeleteSecondEmployerDialog({ isOpen: false, cardId: '' });
              }}
              data-testid="button-confirm-delete-second-employer"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Co-Borrower Second Employer Confirmation Dialog */}
      <AlertDialog open={deleteCoBorrowerSecondEmployerDialog.isOpen} onOpenChange={(open) => !open && setDeleteCoBorrowerSecondEmployerDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-coborrower-second-employer">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Co-borrower Second Employer Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this co-borrower second employer card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCoBorrowerSecondEmployerDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-coborrower-second-employer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteCoBorrowerSecondEmployerDialog.cardId;
                
                // If removing the default card, clear the checkbox and related fields
                if (cardToDelete === 'coborrower-second-template-card') {
                  form.setValue('coBorrowerIncome.incomeTypes.secondEmployment', false);
                  // Clear the co-borrower second employment card list (empty array removes all cards)
                  setCoBorrowerSecondEmployerCards([]);
                  // Clear all co-borrower second employment form fields
                  const currentCards = coBorrowerSecondEmployerCards || ['default'];
                  currentCards.forEach(cardId => {
                    const cleanCardId = cardId === 'default' ? 'default' : cardId;
                    // Clear employer info
                    form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.employerName` as any, '');
                    form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.address` as any, '');
                    form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.phone` as any, '');
                    form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.position` as any, '');
                    form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.monthlySalary` as any, '');
                    // Clear duration info
                    form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.duration` as any, '');
                  });
                } else {
                  // Remove the specific card
                  setCoBorrowerSecondEmployerCards(prev => prev.filter(id => id !== cardToDelete));
                  // Clear form fields for this specific card
                  const cleanCardId = cardToDelete;
                  form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.employerName` as any, '');
                  form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.address` as any, '');
                  form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.phone` as any, '');
                  form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.position` as any, '');
                  form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.monthlySalary` as any, '');
                  form.setValue(`coBorrowerIncome.secondEmployment.${cleanCardId}.duration` as any, '');
                }
                
                setDeleteCoBorrowerSecondEmployerDialog({ isOpen: false, cardId: '' });
              }}
              data-testid="button-confirm-delete-coborrower-second-employer"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Borrower - Self-Employment Confirmation Dialog */}
      <AlertDialog open={deleteSelfEmploymentDialog.isOpen} onOpenChange={(open) => !open && setDeleteSelfEmploymentDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-self-employment">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Borrower - Self-Employment Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this self-employment card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteSelfEmploymentDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-self-employment"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteSelfEmploymentDialog.cardId;
                
                // If removing the default card, clear the checkbox and related fields
                if (cardToDelete === 'self-employment-template-card') {
                  form.setValue('income.incomeTypes.selfEmployment', false);
                  // Clear the self-employment card list (empty array removes all cards)
                  setBorrowerSelfEmploymentCards([]);
                  // Clear all self-employment form fields
                  const currentCards = borrowerSelfEmploymentCards || ['default'];
                  currentCards.forEach(cardId => {
                    const cleanCardId = cardId === 'default' ? 'default' : cardId;
                    // Clear business info
                    form.setValue(`income.selfEmployment.${cleanCardId}.businessName` as any, '');
                    form.setValue(`income.selfEmployment.${cleanCardId}.businessType` as any, '');
                    form.setValue(`income.selfEmployment.${cleanCardId}.businessAddress` as any, '');
                    form.setValue(`income.selfEmployment.${cleanCardId}.yearEstablished` as any, '');
                    form.setValue(`income.selfEmployment.${cleanCardId}.netIncome` as any, '');
                    // Clear duration info
                    form.setValue(`income.selfEmployment.${cleanCardId}.duration` as any, '');
                  });
                } else {
                  // Remove the specific card
                  setBorrowerSelfEmploymentCards(prev => prev.filter(id => id !== cardToDelete));
                  // Clear form fields for this specific card
                  const cleanCardId = cardToDelete;
                  form.setValue(`income.selfEmployment.${cleanCardId}.businessName` as any, '');
                  form.setValue(`income.selfEmployment.${cleanCardId}.businessType` as any, '');
                  form.setValue(`income.selfEmployment.${cleanCardId}.businessAddress` as any, '');
                  form.setValue(`income.selfEmployment.${cleanCardId}.yearEstablished` as any, '');
                  form.setValue(`income.selfEmployment.${cleanCardId}.netIncome` as any, '');
                  form.setValue(`income.selfEmployment.${cleanCardId}.duration` as any, '');
                }
                
                setDeleteSelfEmploymentDialog({ isOpen: false, cardId: '' });
              }}
              data-testid="button-confirm-delete-self-employment"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Co-Borrower - Self-Employment Confirmation Dialog */}
      <AlertDialog open={deleteCoBorrowerSelfEmploymentDialog.isOpen} onOpenChange={(open) => !open && setDeleteCoBorrowerSelfEmploymentDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-co-borrower-self-employment">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Co-Borrower - Self-Employment Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this co-borrower self-employment card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCoBorrowerSelfEmploymentDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-co-borrower-self-employment"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteCoBorrowerSelfEmploymentDialog.cardId;
                
                // If removing the default card, clear the checkbox and related fields
                if (cardToDelete === 'co-borrower-self-employment-template-card') {
                  form.setValue('coBorrowerIncome.incomeTypes.selfEmployment', false);
                  // Clear the self-employment card list (empty array removes all cards)
                  setCoBorrowerSelfEmploymentCards([]);
                  // Clear all self-employment form fields
                  const currentCards = coBorrowerSelfEmploymentCards || ['default'];
                  currentCards.forEach(cardId => {
                    const cleanCardId = cardId === 'default' ? 'default' : cardId;
                    // Clear business info
                    form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.businessName` as any, '');
                    form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.businessType` as any, '');
                    form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.businessAddress` as any, '');
                    form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.yearEstablished` as any, '');
                    form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.netIncome` as any, '');
                    // Clear duration info
                    form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.duration` as any, '');
                  });
                } else {
                  // Remove the specific card
                  setCoBorrowerSelfEmploymentCards(prev => prev.filter(id => id !== cardToDelete));
                  // Clear form fields for this specific card
                  const cleanCardId = cardToDelete;
                  form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.businessName` as any, '');
                  form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.businessType` as any, '');
                  form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.businessAddress` as any, '');
                  form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.yearEstablished` as any, '');
                  form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.netIncome` as any, '');
                  form.setValue(`coBorrowerIncome.selfEmployment.${cleanCardId}.duration` as any, '');
                }
                
                setDeleteCoBorrowerSelfEmploymentDialog({ isOpen: false, cardId: '' });
              }}
              data-testid="button-confirm-delete-co-borrower-self-employment"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Co-Borrower Employer Confirmation Dialog */}
      <AlertDialog open={deleteCoBorrowerEmployerDialog.isOpen} onOpenChange={(open) => !open && setDeleteCoBorrowerEmployerDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-coborrower-employer">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Co-Borrower Employer Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this co-borrower employer card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCoBorrowerEmployerDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-coborrower-employer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteCoBorrowerEmployerDialog.cardId;
                const currentCards = coBorrowerEmployerCards || ['default'];
                
                // Clear form data for the deleted card
                const cleanCardId = cardToDelete === 'coborrower-template-card' ? 'default' : cardToDelete;
                const basePath = `coBorrowerIncome.employers.${cleanCardId}` as const;
                
                form.setValue(`${basePath}.employerName`, '');
                form.setValue(`${basePath}.jobTitle`, '');
                form.setValue(`${basePath}.monthlyIncome`, '');
                form.setValue(`${basePath}.monthlyBonusIncome`, '');
                form.setValue(`${basePath}.annualBonusIncome`, '');
                form.setValue(`${basePath}.employmentType`, 'Full-Time');
                form.setValue(`${basePath}.yearsEmployedYears`, '');
                form.setValue(`${basePath}.yearsEmployedMonths`, '');
                form.setValue(`${basePath}.employerAddress.street`, '');
                form.setValue(`${basePath}.employerAddress.unit`, '');
                form.setValue(`${basePath}.employerAddress.city`, '');
                form.setValue(`${basePath}.employerAddress.state`, '');
                form.setValue(`${basePath}.employerAddress.zip`, '');
                form.setValue(`${basePath}.employerAddress.county`, '');
                form.setValue(`${basePath}.employerPhone`, '');
                form.setValue(`${basePath}.employmentVerificationPhone`, '');
                form.setValue(`${basePath}.employerRemote`, '');
                
                // Remove the specific card from state
                const updatedCards = currentCards.filter(id => 
                  cardToDelete === 'coborrower-template-card' ? id !== 'default' : id !== cardToDelete
                );
                setCoBorrowerEmployerCards(updatedCards);
                
                // If no cards remain, uncheck the employment checkbox
                if (updatedCards.length === 0) {
                  form.setValue('coBorrowerIncome.incomeTypes.employment', false);
                }
                
                setDeleteCoBorrowerEmployerDialog({ isOpen: false, cardId: '' });
              }}
              data-testid="button-confirm-delete-coborrower-employer"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Primary Residence Confirmation Dialog */}
      <AlertDialog open={deletePrimaryResidenceDialog.isOpen} onOpenChange={(open) => !open && setDeletePrimaryResidenceDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-primary-residence">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Primary Residence Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this primary residence card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeletePrimaryResidenceDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-primary-residence"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deletePrimaryResidenceDialog.cardId;
                
                // If removing the default card, clear the checkbox and related fields
                if (cardToDelete === 'primary-template-card') {
                  // Clear the primary residence card list (empty array removes all cards)
                  setPrimaryResidenceCards([]);
                  // Clear all data state
                  setPrimaryResidenceData({});
                } else {
                  // Remove the specific card
                  setPrimaryResidenceCards(prev => prev.filter(id => id !== cardToDelete));
                  // Remove data state for this card
                  setPrimaryResidenceData(prev => {
                    const newData = { ...prev };
                    delete newData[cardToDelete];
                    return newData;
                  });
                }
                
                // If no cards remain, uncheck the checkbox to allow new card creation
                const remainingCards = primaryResidenceCards.filter(id => id !== cardToDelete);
                if (remainingCards.length === 0) {
                  // Clear the property form fields and remove from property array
                  const currentProperties = form.watch('property.properties') || [];
                  const updatedProperties = currentProperties.filter(p => p.use !== 'primary');
                  form.setValue('property.properties', updatedProperties);
                }
                
                setDeletePrimaryResidenceDialog({ isOpen: false, cardId: '' });
              }}
              data-testid="button-confirm-delete-primary-residence"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Second Home Confirmation Dialog */}
      <AlertDialog open={deleteSecondHomeDialog.isOpen} onOpenChange={(open) => !open && setDeleteSecondHomeDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-second-home">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Second Home Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this second home card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteSecondHomeDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-second-home"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteSecondHomeDialog.cardId;
                
                // If removing the default card, clear the checkbox and related fields
                if (cardToDelete === 'second-home-template-card') {
                  // Clear the second home card list (empty array removes all cards)
                  setSecondHomeCards([]);
                  // Clear all data state
                  setSecondHomeData({});
                } else {
                  // Remove the specific card
                  setSecondHomeCards(prev => prev.filter(id => id !== cardToDelete));
                  
                  // Clean up data state for this card
                  setSecondHomeData(prev => {
                    const { [cardToDelete]: _, ...rest } = prev;
                    return rest;
                  });

                  // Remove from form data
                  const currentProperties = form.watch('property.properties') || [];
                  const updatedProperties = currentProperties.filter(property => property.id !== cardToDelete);
                  form.setValue('property.properties', updatedProperties);

                  // Remove collapsible state for removed property
                  setPropertyCardStates(prev => {
                    const { [cardToDelete]: _, ...rest } = prev;
                    return rest;
                  });
                }
                
                setDeleteSecondHomeDialog({ isOpen: false, cardId: '' });
              }}
              data-testid="button-confirm-delete-second-home"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Current Primary Loan Confirmation Dialog */}
      <AlertDialog open={deleteCurrentPrimaryLoanDialog.isOpen} onOpenChange={(open) => !open && setDeleteCurrentPrimaryLoanDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-current-primary-loan">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Current Primary Loan Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this current primary loan card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCurrentPrimaryLoanDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-current-primary-loan"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteCurrentPrimaryLoanDialog.cardId;
                removeCurrentPrimaryLoanCard(cardToDelete);
              }}
              data-testid="button-confirm-delete-current-primary-loan"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Current Second Loan Confirmation Dialog */}
      <AlertDialog open={deleteCurrentSecondLoanDialog.isOpen} onOpenChange={(open) => !open && setDeleteCurrentSecondLoanDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-current-second-loan">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Current Second Loan Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this current second loan card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCurrentSecondLoanDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-current-second-loan"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteCurrentSecondLoanDialog.cardId;
                removeCurrentSecondLoanCard(cardToDelete);
              }}
              data-testid="button-confirm-delete-current-second-loan"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Investment Property Confirmation Dialog */}
      <AlertDialog open={deleteInvestmentDialog.isOpen} onOpenChange={(open) => !open && setDeleteInvestmentDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-investment-property">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment Property Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this investment property card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteInvestmentDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-investment-property"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const cardToDelete = deleteInvestmentDialog.cardId;
                
                // If removing the default card, clear the checkbox and related fields
                if (cardToDelete === 'investment-property-template-card') {
                  // Clear the investment property card list (empty array removes all cards)
                  setInvestmentCards([]);
                  // Clear all data state
                  setInvestmentData({});
                } else {
                  // Remove the specific card
                  setInvestmentCards(prev => prev.filter(id => id !== cardToDelete));
                  
                  // Clean up data state for this card
                  setInvestmentData(prev => {
                    const { [cardToDelete]: _, ...rest } = prev;
                    return rest;
                  });

                  // Remove from form data
                  const currentProperties = form.watch('property.properties') || [];
                  const updatedProperties = currentProperties.filter(property => property.id !== cardToDelete);
                  form.setValue('property.properties', updatedProperties);

                  // Remove collapsible state for removed property
                  setPropertyCardStates(prev => {
                    const { [cardToDelete]: _, ...rest } = prev;
                    return rest;
                  });
                }
                
                setDeleteInvestmentDialog({ isOpen: false, cardId: '' });
              }}
              data-testid="button-confirm-delete-investment-property"
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Social Security Income Confirmation Dialog */}
      <AlertDialog open={deleteSocialSecurityDialog.isOpen} onOpenChange={(open) => !open && setDeleteSocialSecurityDialog({ isOpen: false })}>
        <AlertDialogContent data-testid="dialog-delete-social-security">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Social Security Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the Social Security income section? This will clear all entered data and hide the section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteSocialSecurityDialog({ isOpen: false })}
              data-testid="button-cancel-delete-social-security"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Clear the income type checkbox and close the section
                form.setValue('income.incomeTypes.socialSecurity', false);
                form.setValue('income.socialSecurityMonthlyAmount', '');
                setIsSocialSecurityIncomeOpen(false);
                setDeleteSocialSecurityDialog({ isOpen: false });
              }}
              data-testid="button-confirm-delete-social-security"
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete VA Benefits Income Confirmation Dialog */}
      <AlertDialog open={deleteVaBenefitsDialog.isOpen} onOpenChange={(open) => !open && setDeleteVaBenefitsDialog({ isOpen: false })}>
        <AlertDialogContent data-testid="dialog-delete-va-benefits">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove VA Disability Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the VA Disability income section? This will clear all entered data and hide the section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteVaBenefitsDialog({ isOpen: false })}
              data-testid="button-cancel-delete-va-benefits"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Clear the income type checkbox and close the section
                form.setValue('income.incomeTypes.vaBenefits', false);
                form.setValue('income.vaBenefitsMonthlyAmount', '');
                setIsVaBenefitsIncomeOpen(false);
                setDeleteVaBenefitsDialog({ isOpen: false });
              }}
              data-testid="button-confirm-delete-va-benefits"
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Disability Income Confirmation Dialog */}
      <AlertDialog open={deleteDisabilityDialog.isOpen} onOpenChange={(open) => !open && setDeleteDisabilityDialog({ isOpen: false })}>
        <AlertDialogContent data-testid="dialog-delete-disability">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Disability Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the Disability income section? This will clear all entered data and hide the section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteDisabilityDialog({ isOpen: false })}
              data-testid="button-cancel-delete-disability"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Clear the income type checkbox and close the section
                form.setValue('income.incomeTypes.disability', false);
                form.setValue('income.disabilityPayerName', '');
                form.setValue('income.disabilityMonthlyAmount', '');
                setIsDisabilityIncomeOpen(false);
                setDeleteDisabilityDialog({ isOpen: false });
              }}
              data-testid="button-confirm-delete-disability"
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Co-Borrower Social Security Income Confirmation Dialog */}
      <AlertDialog open={deleteCoBorrowerSocialSecurityDialog.isOpen} onOpenChange={(open) => !open && setDeleteCoBorrowerSocialSecurityDialog({ isOpen: false })}>
        <AlertDialogContent data-testid="dialog-delete-coborrower-social-security">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Co-Borrower Social Security Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the Co-Borrower Social Security income section? This will clear all entered data and hide the section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCoBorrowerSocialSecurityDialog({ isOpen: false })}
              data-testid="button-cancel-delete-coborrower-social-security"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Clear the income type checkbox and close the section
                form.setValue('coBorrowerIncome.incomeTypes.socialSecurity', false);
                form.setValue('coBorrowerIncome.socialSecurityMonthlyAmount', '');
                setIsCoBorrowerSocialSecurityIncomeOpen(false);
                setDeleteCoBorrowerSocialSecurityDialog({ isOpen: false });
              }}
              data-testid="button-confirm-delete-coborrower-social-security"
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Co-Borrower VA Benefits Income Confirmation Dialog */}
      <AlertDialog open={deleteCoBorrowerVaBenefitsDialog.isOpen} onOpenChange={(open) => !open && setDeleteCoBorrowerVaBenefitsDialog({ isOpen: false })}>
        <AlertDialogContent data-testid="dialog-delete-coborrower-va-benefits">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Co-Borrower VA Disability Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the Co-Borrower VA Disability income section? This will clear all entered data and hide the section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCoBorrowerVaBenefitsDialog({ isOpen: false })}
              data-testid="button-cancel-delete-coborrower-va-benefits"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Clear the income type checkbox and close the section
                form.setValue('coBorrowerIncome.incomeTypes.vaBenefits', false);
                form.setValue('coBorrowerIncome.vaBenefitsMonthlyAmount', '');
                setIsCoBorrowerVaBenefitsIncomeOpen(false);
                setDeleteCoBorrowerVaBenefitsDialog({ isOpen: false });
              }}
              data-testid="button-confirm-delete-coborrower-va-benefits"
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Co-Borrower Disability Income Confirmation Dialog */}
      <AlertDialog open={deleteCoBorrowerDisabilityDialog.isOpen} onOpenChange={(open) => !open && setDeleteCoBorrowerDisabilityDialog({ isOpen: false })}>
        <AlertDialogContent data-testid="dialog-delete-coborrower-disability">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Co-Borrower Disability Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the Co-Borrower Disability income section? This will clear all entered data and hide the section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCoBorrowerDisabilityDialog({ isOpen: false })}
              data-testid="button-cancel-delete-coborrower-disability"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Clear the income type checkbox and close the section
                form.setValue('coBorrowerIncome.incomeTypes.disability', false);
                form.setValue('coBorrowerIncome.disabilityPayerName', '');
                form.setValue('coBorrowerIncome.disabilityMonthlyAmount', '');
                setIsCoBorrowerDisabilityIncomeOpen(false);
                setDeleteCoBorrowerDisabilityDialog({ isOpen: false });
              }}
              data-testid="button-confirm-delete-coborrower-disability"
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Co-Borrower Other Income Confirmation Dialog */}
      <AlertDialog open={deleteCoBorrowerOtherDialog.isOpen} onOpenChange={(open) => !open && setDeleteCoBorrowerOtherDialog({ isOpen: false })}>
        <AlertDialogContent data-testid="dialog-delete-coborrower-other">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Co-Borrower Other Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the Co-Borrower Other income section? This will clear all entered data and hide the section. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCoBorrowerOtherDialog({ isOpen: false })}
              data-testid="button-cancel-delete-coborrower-other"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                // Clear the income type checkbox and close the section
                form.setValue('coBorrowerIncome.incomeTypes.other', false);
                form.setValue('coBorrowerIncome.otherIncomeDescription', '');
                form.setValue('coBorrowerIncome.otherIncomeMonthlyAmount', '');
                setIsCoBorrowerOtherIncomeOpen(false);
                setDeleteCoBorrowerOtherDialog({ isOpen: false });
              }}
              data-testid="button-confirm-delete-coborrower-other"
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Current Third Loan Card Confirmation Dialog */}
      <AlertDialog open={deleteCurrentThirdLoanDialog.isOpen} onOpenChange={(open) => !open && setDeleteCurrentThirdLoanDialog({ isOpen: false, cardId: '' })}>
        <AlertDialogContent data-testid="dialog-delete-current-third-loan">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Current Third Loan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this Current Third Loan card? This will clear all entered data for this loan. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteCurrentThirdLoanDialog({ isOpen: false, cardId: '' })}
              data-testid="button-cancel-delete-current-third-loan"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => removeCurrentThirdLoanCard(deleteCurrentThirdLoanDialog.cardId)}
              data-testid="button-confirm-delete-current-third-loan"
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Current Loan 1 Preview Modal */}
      <Dialog open={isCurrentLoanPreviewOpen} onOpenChange={setIsCurrentLoanPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="dialog-current-loan-preview">
          <DialogHeader>
            <DialogTitle>Current Primary Loan</DialogTitle>
          </DialogHeader>
          <CurrentLoanPreview control={form.control} />
          <DialogFooter>
            <Button
              onClick={() => setIsCurrentLoanPreviewOpen(false)}
              data-testid="button-current-loan-preview-close"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Current Loan 2 Preview Modal */}
      <Dialog open={isCurrentSecondLoanPreviewOpen} onOpenChange={setIsCurrentSecondLoanPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="dialog-current-second-loan-preview">
          <DialogHeader>
            <DialogTitle>Current Second Loan</DialogTitle>
          </DialogHeader>
          <CurrentSecondLoanPreview control={form.control} />
          <DialogFooter>
            <Button
              onClick={() => setIsCurrentSecondLoanPreviewOpen(false)}
              data-testid="button-current-second-loan-preview-close"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Current Third Loan Preview Modal */}
      <Dialog open={isCurrentThirdLoanPreviewOpen} onOpenChange={setIsCurrentThirdLoanPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="dialog-current-third-loan-preview">
          <DialogHeader>
            <DialogTitle>Current Third Loan</DialogTitle>
          </DialogHeader>
          <CurrentThirdLoanPreview control={form.control} />
          <DialogFooter>
            <Button
              onClick={() => setIsCurrentThirdLoanPreviewOpen(false)}
              data-testid="button-current-third-loan-preview-close"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Additional Loan Preview Modal - Generic for any additional loan */}
      {additionalLoanPreview.isOpen && additionalLoanPreview.loanId && (
        <Dialog open={additionalLoanPreview.isOpen} onOpenChange={(open) => setAdditionalLoanPreview({isOpen: open, loanId: open ? additionalLoanPreview.loanId : null})}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid={`dialog-additional-loan-preview-${additionalLoanPreview.loanId}`}>
            <DialogHeader>
              <DialogTitle>
                {additionalLoanPreview.loanId ? 
                  `${additionalLoanPreview.loanId.charAt(0).toUpperCase() + additionalLoanPreview.loanId.slice(1)} Details` : 
                  'Additional Loan Details'
                }
              </DialogTitle>
            </DialogHeader>
            <AdditionalLoanPreview control={form.control} loanId={additionalLoanPreview.loanId} />
            <DialogFooter>
              <Button
                onClick={() => setAdditionalLoanPreview({isOpen: false, loanId: null})}
                data-testid={`button-additional-loan-preview-close-${additionalLoanPreview.loanId}`}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      </div>
    </TooltipProvider>
  );
}