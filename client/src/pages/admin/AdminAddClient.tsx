import { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Save, Minus } from 'lucide-react';
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

  // Utility function to lookup county from zip code using free APIs
  const lookupCountyFromZip = async (zipCode: string): Promise<Array<{value: string, label: string}>> => {
    if (!zipCode || zipCode.length < 5) return [];
    
    try {
      // First, use OpenStreetMap Nominatim API (completely free, no API key needed)
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&countrycodes=us&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'PrimeRateHomeLoans/1.0 (contact@primerateloans.com)'
          }
        }
      );
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        if (nominatimData && nominatimData.length > 0) {
          const { lat, lon } = nominatimData[0];
          
          // Now use FCC Area API to get county information
          const fccResponse = await fetch(`https://geo.fcc.gov/api/census/area?lat=${lat}&lon=${lon}&format=json`);
          
          if (fccResponse.ok) {
            const countyData = await fccResponse.json();
            if (countyData.results && countyData.results.length > 0) {
              const result = countyData.results[0];
              if (result.county_name) {
                return [{
                  value: result.county_name,
                  label: result.county_name
                }];
              }
            }
          }
        }
      }
      
      // Fallback: try FCC API directly with ZIP (sometimes works)
      try {
        const directResponse = await fetch(`https://geo.fcc.gov/api/census/area?zip=${zipCode}&format=json`);
        if (directResponse.ok) {
          const directData = await directResponse.json();
          if (directData.results && directData.results.length > 0) {
            const result = directData.results[0];
            if (result.county_name) {
              return [{
                value: result.county_name,
                label: result.county_name
              }];
            }
          }
        }
      } catch (fallbackError) {
        console.warn('FCC direct lookup failed:', fallbackError);
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
    setBorrowerCountyOptions(counties);
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
    setCoBorrowerCountyOptions(counties);
    setCountyLookupLoading(prev => ({...prev, coBorrower: false}));
  };
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [isCurrentLoanOpen, setIsCurrentLoanOpen] = useState(true);
  
  // Borrower income section collapsible states
  const [isEmploymentIncomeOpen, setIsEmploymentIncomeOpen] = useState(true);
  const [isSecondEmploymentIncomeOpen, setIsSecondEmploymentIncomeOpen] = useState(true);
  const [isSelfEmploymentIncomeOpen, setIsSelfEmploymentIncomeOpen] = useState(true);
  const [isSocialSecurityIncomeOpen, setIsSocialSecurityIncomeOpen] = useState(true);
  const [isVaBenefitsIncomeOpen, setIsVaBenefitsIncomeOpen] = useState(true);
  const [isDisabilityIncomeOpen, setIsDisabilityIncomeOpen] = useState(true);
  const [isOtherIncomeOpen, setIsOtherIncomeOpen] = useState(true);

  // Co-Borrower income collapsible state
  const [isCoBorrowerEmploymentIncomeOpen, setIsCoBorrowerEmploymentIncomeOpen] = useState(true);
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
    type: 'co-borrower' | 'property' | 'property-type' | 'income' | null;
    itemId?: string;
    itemType?: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: null });

  // Unsaved changes warning dialog state
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });

  // County lookup state
  const [borrowerCountyOptions, setBorrowerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [coBorrowerCountyOptions, setCoBorrowerCountyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [countyLookupLoading, setCountyLookupLoading] = useState<{borrower: boolean, coBorrower: boolean}>({borrower: false, coBorrower: false});

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
                  if (form.formState.isDirty) {
                    setUnsavedChangesDialog({ isOpen: true });
                  } else {
                    setLocation('/admin/dashboard');
                  }
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
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={addClientMutation.isPending}
              className="bg-primary-foreground text-primary hover:bg-orange-500 hover:text-white"
              data-testid="button-save-client"
            >
              <Save className="h-4 w-4 mr-2" />
              {addClientMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="client" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="client" data-testid="tab-client">Client</TabsTrigger>
              <TabsTrigger value="income" data-testid="tab-income">Income</TabsTrigger>
              <TabsTrigger value="property" data-testid="tab-property">Property</TabsTrigger>
              <TabsTrigger value="loan" data-testid="tab-loan">Loan</TabsTrigger>
              <TabsTrigger value="status" data-testid="tab-status">Status</TabsTrigger>
              <TabsTrigger value="vendors" data-testid="tab-vendors">Vendors</TabsTrigger>
              <TabsTrigger value="notes" data-testid="tab-notes">Notes</TabsTrigger>
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
              <Card>
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
                      onValueChange={(value) => form.setValue('borrower.maritalStatus', value as any)}
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
                        {...form.register('borrower.residenceAddress.street')}
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
                        {...form.register('borrower.residenceAddress.unit')}
                        data-testid="input-borrower-residence-unit"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="borrower-residence-city">City *</Label>
                      <Input
                        id="borrower-residence-city"
                        {...form.register('borrower.residenceAddress.city')}
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
                        onValueChange={(value) => form.setValue('borrower.residenceAddress.state', value)}
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
                        {...form.register('borrower.residenceAddress.zip')}
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
                              form.setValue('borrower.residenceAddress.county', value, { shouldDirty: true });
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
                              ✏️ Enter county manually
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
                        <Label htmlFor="borrower-years">Years at Address</Label>
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
                        <Label htmlFor="borrower-months">Months at Address</Label>
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


              {/* Co-Borrower Section */}
              <Card>
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
                          {...form.register('coBorrower.residenceAddress.street')}
                          data-testid="input-coborrower-residence-street"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="coBorrower-residence-unit">Unit/Apt</Label>
                        <Input
                          id="coBorrower-residence-unit"
                          {...form.register('coBorrower.residenceAddress.unit')}
                          data-testid="input-coborrower-residence-unit"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="coBorrower-residence-city">City</Label>
                        <Input
                          id="coBorrower-residence-city"
                          {...form.register('coBorrower.residenceAddress.city')}
                          data-testid="input-coborrower-residence-city"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="coBorrower-residence-state">State</Label>
                        <Select
                          value={form.watch('coBorrower.residenceAddress.state') || ''}
                          onValueChange={(value) => form.setValue('coBorrower.residenceAddress.state', value)}
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
                          {...form.register('coBorrower.residenceAddress.zip')}
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
                                ✏️ Enter county manually
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
                          <Label htmlFor="coBorrower-years">Years at Address</Label>
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
                          <Label htmlFor="coBorrower-months">Months at Address</Label>
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
              <Card>
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
                        <CardTitle>Employment Income</CardTitle>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              <Label htmlFor="income-monthlyIncome">Monthly Income</Label>
                              <Input
                                id="income-monthlyIncome"
                                {...form.register('income.monthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-income-monthlyIncome"
                              />
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
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-employer-phone">Employer Phone</Label>
                              <Input
                                id="income-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('income.employerPhone') || ''}
                                onChange={(e) => handlePhoneChange('income.employerPhone', e.target.value)}
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
                                data-testid="input-income-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-employer-county">County</Label>
                              <Input
                                id="income-employer-county"
                                {...form.register('income.employerAddress.county')}
                                data-testid="input-income-employer-county"
                              />
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              <Label htmlFor="income-secondMonthlyIncome">Monthly Income</Label>
                              <Input
                                id="income-secondMonthlyIncome"
                                {...form.register('income.secondMonthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-income-secondMonthlyIncome"
                              />
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
                            
                            <div className="space-y-2">
                              <Label htmlFor="income-second-employer-phone">Employer Phone</Label>
                              <Input
                                id="income-second-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('income.secondEmployerPhone') || ''}
                                onChange={(e) => handlePhoneChange('income.secondEmployerPhone', e.target.value)}
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
                                data-testid="input-income-second-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="income-second-employer-county">County</Label>
                              <Input
                                id="income-second-employer-county"
                                {...form.register('income.secondEmployerAddress.county')}
                                data-testid="input-income-second-employer-county"
                              />
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Card>
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
                        <CardTitle>Co-Borrower Employment Income</CardTitle>
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              <Label htmlFor="coBorrowerIncome-monthlyIncome">Monthly Income</Label>
                              <Input
                                id="coBorrowerIncome-monthlyIncome"
                                {...form.register('coBorrowerIncome.monthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-coborrowerIncome-monthlyIncome"
                              />
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
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-employer-phone">Employer Phone</Label>
                              <Input
                                id="coBorrowerIncome-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('coBorrowerIncome.employerPhone') || ''}
                                onChange={(e) => handlePhoneChange('coBorrowerIncome.employerPhone', e.target.value)}
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
                                data-testid="input-coborrowerIncome-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-employer-county">County</Label>
                              <Input
                                id="coBorrowerIncome-employer-county"
                                {...form.register('coBorrowerIncome.employerAddress.county')}
                                data-testid="input-coborrowerIncome-employer-county"
                              />
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                              <Label htmlFor="coBorrowerIncome-secondMonthlyIncome">Monthly Income</Label>
                              <Input
                                id="coBorrowerIncome-secondMonthlyIncome"
                                {...form.register('coBorrowerIncome.secondMonthlyIncome')}
                                placeholder="$0.00"
                                data-testid="input-coborrowerIncome-secondMonthlyIncome"
                              />
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
                            
                            <div className="space-y-2">
                              <Label htmlFor="coBorrowerIncome-second-employer-phone">Employer Phone</Label>
                              <Input
                                id="coBorrowerIncome-second-employer-phone"
                                placeholder="(XXX) XXX-XXXX"
                                value={form.watch('coBorrowerIncome.secondEmployerPhone') || ''}
                                onChange={(e) => handlePhoneChange('coBorrowerIncome.secondEmployerPhone', e.target.value)}
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
                                data-testid="input-coborrowerIncome-second-employer-zip"
                              />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="coBorrowerIncome-second-employer-county">County</Label>
                              <Input
                                id="coBorrowerIncome-second-employer-county"
                                {...form.register('coBorrowerIncome.secondEmployerAddress.county')}
                                data-testid="input-coborrowerIncome-second-employer-county"
                              />
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Property Summary
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
                          <span>Primary Residence:</span>
                          <span className="font-medium" data-testid="text-primary-count">
                            {(form.watch('property.properties') || []).filter(p => p.use === 'primary').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Second Home:</span>
                          <span className="font-medium" data-testid="text-second-home-count">
                            {(form.watch('property.properties') || []).filter(p => p.use === 'second-home').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Investment Property:</span>
                          <span className="font-medium" data-testid="text-investment-count">
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
                  <Card key={propertyId}>
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
                                <Label htmlFor={`property-estimated-value-${propertyId}`}>Estimated Property Value</Label>
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
                              
                              {/* Active Secured Loan for Primary Residence and Second Home */}
                              {(property.use === 'primary' || property.use === 'second-home') && (
                                <div className="space-y-2">
                                  <Label htmlFor={`property-active-secured-loan-${propertyId}`}>Active Secured Loan?</Label>
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
                              )}
                            </div>

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
            <DialogDescription>
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
    </div>
  );
}