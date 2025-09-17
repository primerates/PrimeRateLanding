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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Save } from 'lucide-react';
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
        employerName: '',
        jobTitle: '',
        monthlyIncome: '',
        yearsEmployed: '',
        additionalIncome: '',
        incomeSource: '',
      },
      coBorrowerIncome: {
        employerName: '',
        jobTitle: '',
        monthlyIncome: '',
        yearsEmployed: '',
        additionalIncome: '',
        incomeSource: '',
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="client" data-testid="tab-client">Client</TabsTrigger>
              <TabsTrigger value="income" data-testid="tab-income">Income</TabsTrigger>
              <TabsTrigger value="property" data-testid="tab-property">Property</TabsTrigger>
              <TabsTrigger value="current-loan" data-testid="tab-current-loan">Current Loan</TabsTrigger>
              <TabsTrigger value="new-loan" data-testid="tab-new-loan">New Loan</TabsTrigger>
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
                  <CardTitle>Primary Borrower Information</CardTitle>
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
                  
                  {/* Residence Address Fields */}
                  <div className="md:col-span-3 space-y-4">
                    <Label className="text-base font-semibold">Residence Address *</Label>
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
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Years at Address *</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="borrower-years">Years</Label>
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
                        <Label htmlFor="borrower-months">Months</Label>
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
                  
                  {/* Subject Property Address Fields */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Subject Property Address</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyResidenceToSubjectProperty}
                        data-testid="button-same-address"
                      >
                        Same
                      </Button>
                    </div>
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
                    
                    {/* Co-Borrower Residence Address Fields */}
                    <div className="md:col-span-3 space-y-4">
                      <Label className="text-base font-semibold">Residence Address</Label>
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
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Years at Address</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="coBorrower-years">Years</Label>
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
                          <Label htmlFor="coBorrower-months">Months</Label>
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
                )}
              </Card>
            </TabsContent>

            {/* Income Tab */}
            <TabsContent value="income" className="space-y-6">
              {/* Primary Borrower Income */}
              <Card>
                <CardHeader>
                  <CardTitle>Primary Borrower Income</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="income-yearsEmployed">Years Employed</Label>
                    <Input
                      id="income-yearsEmployed"
                      {...form.register('income.yearsEmployed')}
                      data-testid="input-income-yearsEmployed"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="income-additionalIncome">Additional Income</Label>
                    <Input
                      id="income-additionalIncome"
                      {...form.register('income.additionalIncome')}
                      placeholder="$0.00"
                      data-testid="input-income-additionalIncome"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="income-incomeSource">Income Source</Label>
                    <Input
                      id="income-incomeSource"
                      {...form.register('income.incomeSource')}
                      data-testid="input-income-incomeSource"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Co-Borrower Income */}
              {hasCoBorrower && (
                <Card>
                  <CardHeader>
                    <CardTitle>Co-Borrower Income</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrowerIncome-yearsEmployed">Years Employed</Label>
                      <Input
                        id="coBorrowerIncome-yearsEmployed"
                        {...form.register('coBorrowerIncome.yearsEmployed')}
                        data-testid="input-coborrowerIncome-yearsEmployed"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrowerIncome-additionalIncome">Additional Income</Label>
                      <Input
                        id="coBorrowerIncome-additionalIncome"
                        {...form.register('coBorrowerIncome.additionalIncome')}
                        placeholder="$0.00"
                        data-testid="input-coborrowerIncome-additionalIncome"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrowerIncome-incomeSource">Income Source</Label>
                      <Input
                        id="coBorrowerIncome-incomeSource"
                        {...form.register('coBorrowerIncome.incomeSource')}
                        data-testid="input-coborrowerIncome-incomeSource"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Property Tab */}
            <TabsContent value="property" className="space-y-6">
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

            {/* Current Loan Tab */}
            <TabsContent value="current-loan" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Loan Information</CardTitle>
                </CardHeader>
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
              </Card>
            </TabsContent>

            {/* New Loan Tab */}
            <TabsContent value="new-loan" className="space-y-6">
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