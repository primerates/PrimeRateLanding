import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Minus, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// Dashboard shortcuts menu items
const dashboardMenuItems = [
  // Row 1
  { label: 'Lead', path: '/admin/add-client' },
  { label: 'Quote', path: '/admin/quotes' },
  { label: 'Loan Prep', path: '/admin/loan-prep' },
  { label: 'Loan', path: '/admin/pipeline' },
  { label: 'Funded', path: '/admin/funded' },
  // Row 2
  { label: 'Closed', path: '/admin/records' },
  { label: 'Dashboard', path: '/admin/reports' },
  // Row 3
  { label: 'Library', path: '/admin/library' },
  { label: 'Settings', path: '/admin/add-comment' },
];

export default function AdminLibrary() {
  const [, setLocation] = useLocation();
  const [isBorrowerOpen, setIsBorrowerOpen] = useState(true);
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [shortcutDropdownOpen, setShortcutDropdownOpen] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ssn, setSsn] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Select');
  const [relationshipToCoBorrower, setRelationshipToCoBorrower] = useState('N/A');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContactTime, setPreferredContactTime] = useState('Select');
  
  // Current Residence fields
  const [currentResidenceType, setCurrentResidenceType] = useState<'owned' | 'rental' | 'other'>('owned');
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [county, setCounty] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isPresent, setIsPresent] = useState(false);

  const formatDateOfBirth = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted = digitsOnly.substring(0, 2);
      if (digitsOnly.length > 2) {
        formatted += '/' + digitsOnly.substring(2, 4);
        if (digitsOnly.length > 4) {
          formatted += '/' + digitsOnly.substring(4, 8);
        }
      }
    }
    return formatted;
  };

  const formatSSN = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted = digitsOnly.substring(0, 3);
      if (digitsOnly.length > 3) {
        formatted += '-' + digitsOnly.substring(3, 5);
        if (digitsOnly.length > 5) {
          formatted += '-' + digitsOnly.substring(5, 9);
        }
      }
    }
    return formatted;
  };

  const formatDate = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted = digitsOnly.substring(0, 2);
      if (digitsOnly.length > 2) {
        formatted += '/' + digitsOnly.substring(2, 4);
        if (digitsOnly.length > 4) {
          formatted += '/' + digitsOnly.substring(4, 8);
        }
      }
    }
    return formatted;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black italic text-white" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }} data-testid="heading-library">LOANVIEW GPT</h1>
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
                    {(index === 4 || index === 6) && <DropdownMenuSeparator className="bg-purple-500/30" />}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/dashboard')}
              className="flex items-center gap-2 text-purple-200 hover:text-white hover:bg-purple-500/20"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Main Content - Borrower Card with Dashboard Theme */}
        <div className="max-w-7xl mx-auto">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-l-4 border-l-purple-500 hover:border-purple-400 focus-within:border-purple-400 transition-all duration-200 shadow-2xl">
            <Collapsible open={isBorrowerOpen} onOpenChange={setIsBorrowerOpen}>
              <CardHeader className="border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Borrower
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!hasCoBorrower ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setHasCoBorrower(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-lg hover:shadow-purple-500/50"
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
                        onClick={() => setHasCoBorrower(false)}
                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                        data-testid="button-remove-coborrower"
                      >
                        Remove Co-Borrower
                      </Button>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 hover:text-white transition-all"
                            data-testid="button-toggle-borrower"
                          >
                            {isBorrowerOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
                        <p className="text-purple-200">{isBorrowerOpen ? 'Minimize' : 'Expand'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-6">
                  {/* Row 1: First Name, Middle Name, Last Name, Date of Birth, SSN */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-purple-200">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                        data-testid="input-firstName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="middleName" className="text-purple-200">Middle Name</Label>
                      <Input
                        id="middleName"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                        data-testid="input-middleName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-purple-200">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                        data-testid="input-lastName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-purple-200">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(formatDateOfBirth(e.target.value))}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                        data-testid="input-dateOfBirth"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ssn" className="text-purple-200">SSN</Label>
                      <Input
                        id="ssn"
                        value={ssn}
                        onChange={(e) => setSsn(formatSSN(e.target.value))}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                        data-testid="input-ssn"
                      />
                    </div>
                  </div>
                  
                  {/* Row 2: Marital Status, Relationship to Co-Borrower, Phone, Email, Preferred Contact Time */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus" className="text-purple-200">Marital Status</Label>
                      <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                        <SelectTrigger 
                          className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                          data-testid="select-maritalStatus"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
                          <SelectItem value="Select" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Select</SelectItem>
                          <SelectItem value="single" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Single</SelectItem>
                          <SelectItem value="married" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Married</SelectItem>
                          <SelectItem value="divorced" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Divorced</SelectItem>
                          <SelectItem value="widowed" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relationshipToCoBorrower" className="text-purple-200">Relationship to Co-borrower</Label>
                      <Select value={relationshipToCoBorrower} onValueChange={setRelationshipToCoBorrower}>
                        <SelectTrigger 
                          className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                          data-testid="select-relationshipToCoBorrower"
                        >
                          <SelectValue placeholder="N/A" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
                          <SelectItem value="N/A" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">N/A</SelectItem>
                          <SelectItem value="spouse" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Spouse</SelectItem>
                          <SelectItem value="partner" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Partner</SelectItem>
                          <SelectItem value="sibling" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Sibling</SelectItem>
                          <SelectItem value="parent" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Parent</SelectItem>
                          <SelectItem value="child" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Child</SelectItem>
                          <SelectItem value="other" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-purple-200">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(XXX) XXX-XXXX"
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                        data-testid="input-phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-purple-200">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                        data-testid="input-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredContactTime" className="text-purple-200">Preferred Contact Time</Label>
                      <Select value={preferredContactTime} onValueChange={setPreferredContactTime}>
                        <SelectTrigger 
                          className="bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500"
                          data-testid="select-preferredContactTime"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
                          <SelectItem value="Select" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Select</SelectItem>
                          <SelectItem value="morning" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Morning</SelectItem>
                          <SelectItem value="afternoon" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Afternoon</SelectItem>
                          <SelectItem value="evening" className="text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white">Evening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Current Residence Section */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-10">
                    <div className="space-y-2 flex items-center gap-2">
                      <Label className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Current Residence</Label>
                    </div>
                    <div className="flex items-center gap-4 ml-1">
                      <button
                        type="button"
                        onClick={() => setCurrentResidenceType('owned')}
                        className="flex items-center gap-1.5 group"
                        data-testid="button-residence-owned"
                      >
                        <div className={`w-3 h-3 rounded-full transition-colors ${
                          currentResidenceType === 'owned' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                            : 'border-2 border-purple-400/50 bg-slate-700/50 hover:border-purple-400'
                        }`}>
                        </div>
                        <span className="text-sm font-medium text-purple-200">Owned</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentResidenceType('rental')}
                        className="flex items-center gap-1.5 group"
                        data-testid="button-residence-rental"
                      >
                        <div className={`w-3 h-3 rounded-full transition-colors ${
                          currentResidenceType === 'rental' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                            : 'border-2 border-purple-400/50 bg-slate-700/50 hover:border-purple-400'
                        }`}>
                        </div>
                        <span className="text-sm font-medium text-purple-200">Rental</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentResidenceType('other')}
                        className="flex items-center gap-1.5 group"
                        data-testid="button-residence-other"
                      >
                        <div className={`w-3 h-3 rounded-full transition-colors ${
                          currentResidenceType === 'other' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                            : 'border-2 border-purple-400/50 bg-slate-700/50 hover:border-purple-400'
                        }`}>
                        </div>
                        <span className="text-sm font-medium text-purple-200">Other</span>
                      </button>
                    </div>
                  </div>

                  {/* Address Card with Dashboard Theme */}
                  <Card className="bg-gradient-to-br from-teal-700 to-cyan-800 border-teal-600/50 hover:border-teal-500/70 mt-6">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="space-y-2 md:col-span-3">
                          <Label htmlFor="street" className="text-teal-200 font-semibold">Street Address</Label>
                          <Input
                            id="street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className="bg-teal-800/50 text-white border-teal-500/30 focus:border-teal-400 placeholder:text-teal-300/50"
                            data-testid="input-street"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="unit" className="text-teal-200 font-semibold">Unit/Apt</Label>
                          <Input
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="bg-teal-800/50 text-white border-teal-500/30 focus:border-teal-400 placeholder:text-teal-300/50"
                            data-testid="input-unit"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="city" className="text-teal-200 font-semibold">City</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="bg-teal-800/50 text-white border-teal-500/30 focus:border-teal-400 placeholder:text-teal-300/50"
                            data-testid="input-city"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="state" className="text-teal-200 font-semibold">State</Label>
                          <Input
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="CA"
                            maxLength={2}
                            className="bg-teal-800/50 text-white border-teal-500/30 focus:border-teal-400 placeholder:text-teal-300/50"
                            data-testid="input-state"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="zipCode" className="text-teal-200 font-semibold">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="12345"
                            maxLength={5}
                            className="bg-teal-800/50 text-white border-teal-500/30 focus:border-teal-400 placeholder:text-teal-300/50"
                            data-testid="input-zipCode"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="county" className="text-teal-200 font-semibold">County</Label>
                          <Input
                            id="county"
                            value={county}
                            onChange={(e) => setCounty(e.target.value)}
                            className="bg-teal-800/50 text-white border-teal-500/30 focus:border-teal-400 placeholder:text-teal-300/50"
                            data-testid="input-county"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="fromDate" className="text-teal-200 font-semibold">From</Label>
                          <Input
                            id="fromDate"
                            value={fromDate}
                            onChange={(e) => setFromDate(formatDate(e.target.value))}
                            placeholder="mm/dd/yyyy"
                            maxLength={10}
                            className="bg-teal-800/50 text-white border-teal-500/30 focus:border-teal-400 placeholder:text-teal-300/50 !text-[13px] placeholder:text-[10px]"
                            data-testid="input-fromDate"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="toDate" className="text-sm text-teal-200 font-semibold">
                              {isPresent ? 'Present' : 'To'}
                            </Label>
                            <Switch
                              checked={isPresent}
                              onCheckedChange={(checked) => {
                                setIsPresent(checked);
                                if (checked) {
                                  setToDate('Present');
                                } else {
                                  setToDate('');
                                }
                              }}
                              data-testid="toggle-present"
                              className="scale-[0.8] data-[state=checked]:bg-teal-500"
                            />
                          </div>
                          <Input
                            id="toDate"
                            value={isPresent ? 'Present' : toDate}
                            onChange={(e) => !isPresent && setToDate(formatDate(e.target.value))}
                            placeholder="mm/dd/yyyy"
                            maxLength={10}
                            readOnly={isPresent}
                            className="bg-teal-800/50 text-white border-teal-500/30 focus:border-teal-400 placeholder:text-teal-300/50 !text-[13px] placeholder:text-[10px]"
                            data-testid="input-toDate"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="duration" className="text-sm text-teal-200 font-semibold">Duration</Label>
                          <Input
                            id="duration"
                            value="0 Yrs 0 Mos"
                            readOnly
                            className="bg-teal-800/50 text-teal-300 border-teal-500/30 cursor-not-allowed !text-[13px]"
                            data-testid="input-duration"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </div>
  );
}
