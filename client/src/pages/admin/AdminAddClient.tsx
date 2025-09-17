import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Save, Minus } from 'lucide-react';
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
        propertyAddress: undefined,
        propertyType: '',
        propertyValue: '',
        propertyUse: '',
        downPayment: '',
        purchasePrice: '',
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
    setHasCoBorrower(false);
    form.setValue('coBorrower', undefined);
    form.setValue('coBorrowerIncome', undefined);
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
    const updatedPensions = currentPensions.filter(pension => pension.id !== pensionId);
    form.setValue('income.pensions', updatedPensions);
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
    const updatedPensions = currentPensions.filter(pension => pension.id !== pensionId);
    form.setValue('coBorrowerIncome.pensions', updatedPensions);
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
                onClick={() => setLocation('/admin/dashboard')}
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
              className="bg-primary-foreground text-primary hover:bg-yellow-500"
              data-testid="button-save-client"
            >
              <Save className="h-4 w-4 mr-2" />
              {addClientMutation.isPending ? 'Saving...' : 'Save Client'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="client" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="client" data-testid="tab-client">Client</TabsTrigger>
              <TabsTrigger value="income" data-testid="tab-income">Income</TabsTrigger>
              <TabsTrigger value="property" data-testid="tab-property">Property</TabsTrigger>
              <TabsTrigger value="loan" data-testid="tab-loan">Loan</TabsTrigger>
              <TabsTrigger value="vendors" data-testid="tab-vendors">Vendors</TabsTrigger>
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
                  <CardTitle>Residence Address</CardTitle>
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
                        data-testid="input-borrower-residence-zip"
                      />
                      {form.formState.errors.borrower?.residenceAddress?.zip && (
                        <p className="text-sm text-destructive">{form.formState.errors.borrower.residenceAddress.zip.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="borrower-residence-county">County</Label>
                      <Input
                        id="borrower-residence-county"
                        {...form.register('borrower.residenceAddress.county')}
                        data-testid="input-borrower-residence-county"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
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
                      className="hover:bg-yellow-500"
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
                      className="hover:bg-yellow-500"
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
                          data-testid="input-coborrower-residence-zip"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="coBorrower-residence-county">County</Label>
                        <Input
                          id="coBorrower-residence-county"
                          {...form.register('coBorrower.residenceAddress.county')}
                          data-testid="input-coborrower-residence-county"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
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
                    <div className="text-2xl font-bold text-primary" data-testid="text-household-income-total">
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
                  <CardTitle>Borrower Income {calculateTotalBorrowerIncome()}</CardTitle>
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
                        <Label htmlFor="income-type-vaBenefits">VA Benefits</Label>
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
                          id="income-type-other"
                          checked={form.watch('income.incomeTypes.other') || false}
                          onCheckedChange={(checked) => form.setValue('income.incomeTypes.other', !!checked)}
                          data-testid="checkbox-other"
                        />
                        <Label htmlFor="income-type-other">Other</Label>
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-employment-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-second-employment-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-self-employment-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-pension-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-social-security-income">
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
                        <CardTitle>VA Benefits Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid="button-toggle-va-benefits-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-disability-income">
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

              {/* Other Income Card */}
              {form.watch('income.incomeTypes.other') && (
                <Card>
                  <Collapsible open={isOtherIncomeOpen} onOpenChange={setIsOtherIncomeOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Other Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid="button-toggle-other-income">
                            {isOtherIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="income-otherIncomeDescription">Description</Label>
                          <Input
                            id="income-otherIncomeDescription"
                            {...form.register('income.otherIncomeDescription')}
                            placeholder="e.g., Investment income, rental income"
                            data-testid="input-income-otherIncomeDescription"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="income-otherIncomeMonthlyAmount">Monthly Amount</Label>
                          <Input
                            id="income-otherIncomeMonthlyAmount"
                            {...form.register('income.otherIncomeMonthlyAmount')}
                            placeholder="$0.00"
                            data-testid="input-income-otherIncomeMonthlyAmount"
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
                    <CardTitle>Co-Borrower Income {calculateTotalCoBorrowerIncome()}</CardTitle>
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
                          <Label htmlFor="coBorrowerIncome-type-vaBenefits">VA Benefits</Label>
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-coborrower-employment-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-coborrower-second-employment-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-coborrower-self-employment-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-coborrower-pension-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-coborrower-social-security-income">
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
                        <CardTitle>Co-Borrower VA Benefits Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid="button-toggle-coborrower-va-benefits-income">
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
                          <Button variant="ghost" size="sm" data-testid="button-toggle-coborrower-disability-income">
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
                        <CardTitle>Co-Borrower Other Income</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid="button-toggle-coborrower-other-income">
                            {isCoBorrowerOtherIncomeOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coBorrowerIncome-otherIncomeDescription">Description</Label>
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
              {/* Subject Property Address */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Subject Property Address</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyResidenceToSubjectProperty}
                      className="hover:bg-yellow-500"
                      data-testid="button-same-address"
                    >
                      Same
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="space-y-2 md:col-span-4">
                      <Label htmlFor="borrower-subject-street">Street Address</Label>
                      <Input
                        id="borrower-subject-street"
                        {...form.register('borrower.subjectProperty.street')}
                        data-testid="input-borrower-subject-street"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="borrower-subject-unit">Unit/Apt</Label>
                      <Input
                        id="borrower-subject-unit"
                        {...form.register('borrower.subjectProperty.unit')}
                        data-testid="input-borrower-subject-unit"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="borrower-subject-city">City</Label>
                      <Input
                        id="borrower-subject-city"
                        {...form.register('borrower.subjectProperty.city')}
                        data-testid="input-borrower-subject-city"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="borrower-subject-state">State</Label>
                      <Select
                        value={form.watch('borrower.subjectProperty.state') || ''}
                        onValueChange={(value) => form.setValue('borrower.subjectProperty.state', value)}
                      >
                        <SelectTrigger data-testid="select-borrower-subject-state">
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
                      <Label htmlFor="borrower-subject-zip">ZIP Code</Label>
                      <Input
                        id="borrower-subject-zip"
                        {...form.register('borrower.subjectProperty.zip')}
                        data-testid="input-borrower-subject-zip"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="borrower-subject-county">County</Label>
                      <Input
                        id="borrower-subject-county"
                        {...form.register('borrower.subjectProperty.county')}
                        data-testid="input-borrower-subject-county"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Property Address Fields */}
                  <div className="md:col-span-3 space-y-4">
                    <Label className="text-base font-semibold">Property Address</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="property-street">Street Address</Label>
                        <Input
                          id="property-street"
                          {...form.register('property.propertyAddress.street')}
                          data-testid="input-property-street"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="property-unit">Unit/Apt</Label>
                        <Input
                          id="property-unit"
                          {...form.register('property.propertyAddress.unit')}
                          data-testid="input-property-unit"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="property-city">City</Label>
                        <Input
                          id="property-city"
                          {...form.register('property.propertyAddress.city')}
                          data-testid="input-property-city"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="property-state">State</Label>
                        <Input
                          id="property-state"
                          {...form.register('property.propertyAddress.state')}
                          data-testid="input-property-state"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="property-zip">ZIP Code</Label>
                        <Input
                          id="property-zip"
                          {...form.register('property.propertyAddress.zip')}
                          data-testid="input-property-zip"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="property-propertyType">Property Type</Label>
                    <Select 
                      value={form.watch('property.propertyType') || ''}
                      onValueChange={(value) => form.setValue('property.propertyType', value as any)}
                    >
                      <SelectTrigger data-testid="select-property-propertyType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-family">Single Family</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="multi-family">Multi-Family</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="property-propertyValue">Property Value</Label>
                    <Input
                      id="property-propertyValue"
                      {...form.register('property.propertyValue')}
                      placeholder="$0.00"
                      data-testid="input-property-propertyValue"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="property-propertyUse">Property Use</Label>
                    <Select 
                      value={form.watch('property.propertyUse') || ''}
                      onValueChange={(value) => form.setValue('property.propertyUse', value as any)}
                    >
                      <SelectTrigger data-testid="select-property-propertyUse">
                        <SelectValue placeholder="Select use" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary Residence</SelectItem>
                        <SelectItem value="secondary">Secondary Home</SelectItem>
                        <SelectItem value="investment">Investment Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="property-downPayment">Down Payment</Label>
                    <Input
                      id="property-downPayment"
                      {...form.register('property.downPayment')}
                      placeholder="$0.00"
                      data-testid="input-property-downPayment"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="property-purchasePrice">Purchase Price</Label>
                    <Input
                      id="property-purchasePrice"
                      {...form.register('property.purchasePrice')}
                      placeholder="$0.00"
                      data-testid="input-property-purchasePrice"
                    />
                  </div>
                </CardContent>
              </Card>
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
                        <Button variant="ghost" size="sm" data-testid="button-toggle-current-loan">
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
          </Tabs>
        </form>
      </div>
    </div>
  );
}