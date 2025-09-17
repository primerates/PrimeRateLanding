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
        residenceAddress: '',
        yearsAtAddress: '',
        subjectProperty: '',
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
        propertyAddress: '',
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
      residenceAddress: '',
      yearsAtAddress: '',
      subjectProperty: '',
      leadRef: '',
      callDate: '',
      startDate: '',
    });
  };

  const removeCoBorrower = () => {
    setHasCoBorrower(false);
    form.setValue('coBorrower', undefined);
    form.setValue('coBorrowerIncome', undefined);
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
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
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
                      {...form.register('borrower.phone')}
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
                    <Select onValueChange={(value) => form.setValue('borrower.maritalStatus', value as any)}>
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
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="borrower-residenceAddress">Residence Address *</Label>
                    <Input
                      id="borrower-residenceAddress"
                      {...form.register('borrower.residenceAddress')}
                      data-testid="input-borrower-residenceAddress"
                    />
                    {form.formState.errors.borrower?.residenceAddress && (
                      <p className="text-sm text-destructive">{form.formState.errors.borrower.residenceAddress.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-yearsAtAddress">Years at Address *</Label>
                    <Input
                      id="borrower-yearsAtAddress"
                      {...form.register('borrower.yearsAtAddress')}
                      data-testid="input-borrower-yearsAtAddress"
                    />
                    {form.formState.errors.borrower?.yearsAtAddress && (
                      <p className="text-sm text-destructive">{form.formState.errors.borrower.yearsAtAddress.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borrower-subjectProperty">Subject Property</Label>
                    <Input
                      id="borrower-subjectProperty"
                      {...form.register('borrower.subjectProperty')}
                      data-testid="input-borrower-subjectProperty"
                    />
                  </div>
                  
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
                        {...form.register('coBorrower.phone')}
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
                      <Select onValueChange={(value) => form.setValue('coBorrower.maritalStatus', value as any)}>
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
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="coBorrower-residenceAddress">Residence Address</Label>
                      <Input
                        id="coBorrower-residenceAddress"
                        {...form.register('coBorrower.residenceAddress')}
                        data-testid="input-coborrower-residenceAddress"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coBorrower-yearsAtAddress">Years at Address</Label>
                      <Input
                        id="coBorrower-yearsAtAddress"
                        {...form.register('coBorrower.yearsAtAddress')}
                        data-testid="input-coborrower-yearsAtAddress"
                      />
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
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="property-propertyAddress">Property Address</Label>
                    <Input
                      id="property-propertyAddress"
                      {...form.register('property.propertyAddress')}
                      data-testid="input-property-propertyAddress"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="property-propertyType">Property Type</Label>
                    <Select onValueChange={(value) => form.setValue('property.propertyType', value as any)}>
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
                    <Select onValueChange={(value) => form.setValue('property.propertyUse', value as any)}>
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
                    <Select onValueChange={(value) => form.setValue('newLoan.loanPurpose', value as any)}>
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