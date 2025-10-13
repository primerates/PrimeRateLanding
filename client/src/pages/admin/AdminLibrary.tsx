import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Plus, Minus, User, Sun } from 'lucide-react';
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
  const [isLightMode, setIsLightMode] = useState(false);
  const [pageBrightness, setPageBrightness] = useState(50); // 0-100 scale for page
  const [cardBrightness, setCardBrightness] = useState(50); // 0-100 scale for cards
  const [activeControl, setActiveControl] = useState<'page' | 'card'>('page'); // Which element to control

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

  // Load saved brightness settings when switching to light mode
  useEffect(() => {
    if (isLightMode) {
      const savedPageBrightness = localStorage.getItem('library-page-brightness');
      const savedCardBrightness = localStorage.getItem('library-card-brightness');
      if (savedPageBrightness) setPageBrightness(Number(savedPageBrightness));
      if (savedCardBrightness) setCardBrightness(Number(savedCardBrightness));
    }
  }, [isLightMode]);

  // Save brightness settings
  const handleKeepSettings = () => {
    localStorage.setItem('library-page-brightness', pageBrightness.toString());
    localStorage.setItem('library-card-brightness', cardBrightness.toString());
    // Visual feedback
    const button = document.querySelector('[data-keep-settings]');
    if (button) {
      button.textContent = '✓ Saved';
      setTimeout(() => {
        button.textContent = 'Keep';
      }, 1500);
    }
  };

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

  // Calculate background colors based on PAGE brightness (0=darkest, 100=brightest)
  const getBackgroundGradient = () => {
    if (!isLightMode) return 'from-slate-900 via-purple-900 to-slate-900';
    
    // Map brightness to appropriate slate shades with smoother transitions
    if (pageBrightness >= 80) return 'from-slate-50 via-purple-50 to-slate-100';
    if (pageBrightness >= 60) return 'from-slate-100 via-purple-100 to-slate-200';
    if (pageBrightness >= 40) return 'from-slate-200 via-purple-150 to-slate-300';
    if (pageBrightness >= 25) return 'from-slate-300 via-purple-200 to-slate-400';
    if (pageBrightness >= 15) return 'from-slate-400 via-purple-300 to-slate-500';
    if (pageBrightness >= 8) return 'from-slate-500 via-purple-400 to-slate-600';
    if (pageBrightness >= 3) return 'from-slate-600 via-purple-500 to-slate-700';
    return 'from-slate-700 via-purple-600 to-slate-800';
  };

  // Calculate text colors based on PAGE brightness
  const getTextColor = () => {
    if (!isLightMode) return 'text-white';
    return pageBrightness >= 50 ? 'text-slate-900' : 'text-white';
  };

  // Calculate label colors based on CARD brightness
  const getLabelColor = () => {
    if (!isLightMode) return 'text-purple-200';
    return cardBrightness >= 50 ? 'text-slate-700 font-medium' : 'text-slate-200 font-medium';
  };

  // Calculate card background based on CARD brightness
  const getCardBackground = () => {
    if (!isLightMode) return 'bg-slate-800/50';
    if (cardBrightness >= 80) return 'bg-white/80';
    if (cardBrightness >= 60) return 'bg-slate-50/80';
    if (cardBrightness >= 40) return 'bg-slate-100/80';
    if (cardBrightness >= 25) return 'bg-slate-200/80';
    if (cardBrightness >= 15) return 'bg-slate-300/80';
    if (cardBrightness >= 8) return 'bg-slate-400/80';
    if (cardBrightness >= 3) return 'bg-slate-500/80';
    return 'bg-slate-600/80';
  };

  // Calculate input background based on CARD brightness
  const getInputBackground = () => {
    if (!isLightMode) return 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500';
    if (cardBrightness >= 80) return 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500';
    if (cardBrightness >= 60) return 'bg-white text-slate-900 border-purple-300 focus:border-purple-500';
    if (cardBrightness >= 40) return 'bg-slate-50 text-slate-900 border-purple-400 focus:border-purple-500';
    if (cardBrightness >= 25) return 'bg-slate-100 text-slate-900 border-purple-400 focus:border-purple-500';
    if (cardBrightness >= 15) return 'bg-slate-200 text-slate-900 border-purple-400 focus:border-purple-500';
    if (cardBrightness >= 8) return 'bg-slate-300 text-slate-900 border-purple-500 focus:border-purple-600';
    if (cardBrightness >= 3) return 'bg-slate-400 text-white border-purple-500 focus:border-purple-600';
    return 'bg-slate-500 text-white border-purple-600 focus:border-purple-700';
  };

  return (
    <div className={`min-h-screen p-6 transition-all duration-300 bg-gradient-to-br ${getBackgroundGradient()}`}>
      <div className="container mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className={`text-xl font-black italic transition-colors ${getTextColor()}`} style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }} data-testid="heading-library">LOANVIEW GPT</h1>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors ${isLightMode ? (pageBrightness >= 50 ? 'text-slate-600' : 'text-slate-300') : 'text-purple-300'}`}>Dark</span>
              <Switch
                checked={isLightMode}
                onCheckedChange={setIsLightMode}
                className="data-[state=checked]:bg-purple-600"
                data-testid="switch-theme-toggle"
              />
              <span className={`text-sm font-medium ${isLightMode ? 'text-purple-600' : 'text-slate-400'}`}>Light</span>
            </div>
            
            {/* Brightness Slider - Only visible in light mode */}
            {isLightMode && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-purple-100/50 border border-purple-300">
                <Sun className="h-4 w-4 text-purple-600" />
                
                {/* Picker Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveControl('page')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                      activeControl === 'page'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-white text-slate-600 hover:bg-purple-50'
                    }`}
                    data-testid="button-page-picker"
                  >
                    Page
                  </button>
                  <button
                    onClick={() => setActiveControl('card')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                      activeControl === 'card'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-white text-slate-600 hover:bg-purple-50'
                    }`}
                    data-testid="button-card-picker"
                  >
                    Card
                  </button>
                  <button
                    onClick={handleKeepSettings}
                    className="px-2 py-1 text-xs font-medium rounded transition-all bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md ml-1"
                    data-testid="button-keep-settings"
                    data-keep-settings
                  >
                    Keep
                  </button>
                </div>
                
                <Slider
                  value={[activeControl === 'page' ? pageBrightness : cardBrightness]}
                  onValueChange={(values) => {
                    if (activeControl === 'page') {
                      setPageBrightness(values[0]);
                    } else {
                      setCardBrightness(values[0]);
                    }
                  }}
                  min={0}
                  max={100}
                  step={1}
                  className="w-32"
                  data-testid="slider-brightness"
                />
                <span className="text-sm font-medium text-purple-600 min-w-[35px] text-right">
                  {activeControl === 'page' ? pageBrightness : cardBrightness}%
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu open={shortcutDropdownOpen} onOpenChange={setShortcutDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`p-2 rounded-lg border transition-all ${
                    isLightMode
                      ? 'bg-purple-100 hover:bg-purple-200 border-purple-300 hover:border-purple-400'
                      : 'bg-purple-500/20 hover:bg-purple-500/40 border-purple-500/30 hover:border-purple-500/50'
                  }`}
                  data-testid="button-shortcut"
                >
                  <User className={`h-5 w-5 ${isLightMode ? 'text-purple-700' : 'text-purple-300'}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-48 backdrop-blur-xl ${
                isLightMode
                  ? 'bg-white/95 border-purple-300'
                  : 'bg-slate-800/95 border-purple-500/30'
              }`}>
                {dashboardMenuItems.map((item, index) => (
                  <div key={item.path}>
                    <DropdownMenuItem
                      onClick={() => setLocation(item.path)}
                      className={`cursor-pointer transition-all ${
                        isLightMode
                          ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white'
                          : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white'
                      }`}
                      data-testid={`shortcut-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.label}
                    </DropdownMenuItem>
                    {(index === 4 || index === 6) && <DropdownMenuSeparator className={isLightMode ? 'bg-purple-300' : 'bg-purple-500/30'} />}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/dashboard')}
              className={`flex items-center gap-2 ${
                isLightMode
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-purple-100'
                  : 'text-purple-200 hover:text-white hover:bg-purple-500/20'
              }`}
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Main Content - Borrower Card with Dashboard Theme */}
        <Card className={`backdrop-blur-xl border-l-4 hover:border-purple-400 focus-within:border-purple-400 transition-all duration-300 shadow-2xl ${getCardBackground()} ${
          isLightMode
            ? 'border-l-purple-600'
            : 'border-l-purple-500'
        }`}>
            <Collapsible open={isBorrowerOpen} onOpenChange={setIsBorrowerOpen}>
              <CardHeader className={`border-b ${isLightMode ? 'border-purple-200' : 'border-purple-500/20'}`}>
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
                            className={`transition-all ${
                              isLightMode
                                ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-900'
                                : 'bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 hover:text-white'
                            }`}
                            data-testid="button-toggle-borrower"
                          >
                            {isBorrowerOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      <TooltipContent className={`backdrop-blur-xl ${
                        isLightMode
                          ? 'bg-white/95 border-purple-300'
                          : 'bg-slate-800/95 border-purple-500/30'
                      }`}>
                        <p className={isLightMode ? 'text-purple-700' : 'text-purple-200'}>{isBorrowerOpen ? 'Minimize' : 'Expand'}</p>
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
                      <Label htmlFor="firstName" className={`transition-colors ${getLabelColor()}`}>First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`transition-all placeholder:text-slate-400 ${getInputBackground()}`}
                        data-testid="input-firstName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="middleName" className={`transition-colors ${getLabelColor()}`}>Middle Name</Label>
                      <Input
                        id="middleName"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        className={isLightMode 
                          ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                          : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                        }
                        data-testid="input-middleName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className={`transition-colors ${getLabelColor()}`}>Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={isLightMode 
                          ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                          : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                        }
                        data-testid="input-lastName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className={`transition-colors ${getLabelColor()}`}>Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(formatDateOfBirth(e.target.value))}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        className={isLightMode 
                          ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                          : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                        }
                        data-testid="input-dateOfBirth"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ssn" className={`transition-colors ${getLabelColor()}`}>SSN</Label>
                      <Input
                        id="ssn"
                        value={ssn}
                        onChange={(e) => setSsn(formatSSN(e.target.value))}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                        className={isLightMode 
                          ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                          : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                        }
                        data-testid="input-ssn"
                      />
                    </div>
                  </div>
                  
                  {/* Row 2: Marital Status, Relationship to Co-Borrower, Phone, Email, Preferred Contact Time */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus" className={`transition-colors ${getLabelColor()}`}>Marital Status</Label>
                      <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                        <SelectTrigger 
                          className={isLightMode 
                            ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500'
                            : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500'
                          }
                          data-testid="select-maritalStatus"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className={`backdrop-blur-xl ${
                          isLightMode
                            ? 'bg-white/95 border-purple-300'
                            : 'bg-slate-800/95 border-purple-500/30'
                        }`}>
                          <SelectItem value="Select" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Select</SelectItem>
                          <SelectItem value="single" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Single</SelectItem>
                          <SelectItem value="married" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Married</SelectItem>
                          <SelectItem value="divorced" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Divorced</SelectItem>
                          <SelectItem value="widowed" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relationshipToCoBorrower" className={`transition-colors ${getLabelColor()}`}>Relationship to Co-borrower</Label>
                      <Select value={relationshipToCoBorrower} onValueChange={setRelationshipToCoBorrower}>
                        <SelectTrigger 
                          className={isLightMode 
                            ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500'
                            : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500'
                          }
                          data-testid="select-relationshipToCoBorrower"
                        >
                          <SelectValue placeholder="N/A" />
                        </SelectTrigger>
                        <SelectContent className={`backdrop-blur-xl ${
                          isLightMode
                            ? 'bg-white/95 border-purple-300'
                            : 'bg-slate-800/95 border-purple-500/30'
                        }`}>
                          <SelectItem value="N/A" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>N/A</SelectItem>
                          <SelectItem value="spouse" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Spouse</SelectItem>
                          <SelectItem value="partner" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Partner</SelectItem>
                          <SelectItem value="sibling" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Sibling</SelectItem>
                          <SelectItem value="parent" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Parent</SelectItem>
                          <SelectItem value="child" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Child</SelectItem>
                          <SelectItem value="other" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className={`transition-colors ${getLabelColor()}`}>Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(XXX) XXX-XXXX"
                        className={isLightMode 
                          ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                          : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                        }
                        data-testid="input-phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className={`transition-colors ${getLabelColor()}`}>Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className={isLightMode 
                          ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                          : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                        }
                        data-testid="input-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredContactTime" className={`transition-colors ${getLabelColor()}`}>Preferred Contact Time</Label>
                      <Select value={preferredContactTime} onValueChange={setPreferredContactTime}>
                        <SelectTrigger 
                          className={isLightMode 
                            ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500'
                            : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500'
                          }
                          data-testid="select-preferredContactTime"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className={`backdrop-blur-xl ${
                          isLightMode
                            ? 'bg-white/95 border-purple-300'
                            : 'bg-slate-800/95 border-purple-500/30'
                        }`}>
                          <SelectItem value="Select" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Select</SelectItem>
                          <SelectItem value="morning" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Morning</SelectItem>
                          <SelectItem value="afternoon" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Afternoon</SelectItem>
                          <SelectItem value="evening" className={isLightMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Evening</SelectItem>
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
                            : isLightMode
                              ? 'border-2 border-purple-400 bg-slate-50 hover:border-purple-500'
                              : 'border-2 border-purple-400/50 bg-slate-700/50 hover:border-purple-400'
                        }`}>
                        </div>
                        <span className={`text-sm font-medium ${isLightMode ? 'text-slate-700' : 'text-purple-200'}`}>Owned</span>
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
                            : isLightMode
                              ? 'border-2 border-purple-400 bg-slate-50 hover:border-purple-500'
                              : 'border-2 border-purple-400/50 bg-slate-700/50 hover:border-purple-400'
                        }`}>
                        </div>
                        <span className={`text-sm font-medium ${isLightMode ? 'text-slate-700' : 'text-purple-200'}`}>Rental</span>
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
                            : isLightMode
                              ? 'border-2 border-purple-400 bg-slate-50 hover:border-purple-500'
                              : 'border-2 border-purple-400/50 bg-slate-700/50 hover:border-purple-400'
                        }`}>
                        </div>
                        <span className={`text-sm font-medium ${isLightMode ? 'text-slate-700' : 'text-purple-200'}`}>Other</span>
                      </button>
                    </div>
                  </div>

                  {/* Address Card with Dashboard Theme */}
                  <Card className={`backdrop-blur-xl shadow-2xl mt-6 ${
                    isLightMode
                      ? 'bg-slate-50/80 border-purple-200'
                      : 'bg-slate-800/50 border-purple-500/20'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="space-y-2 md:col-span-3">
                          <Label htmlFor="street" className={`font-semibold transition-colors ${getLabelColor()}`}>Street Address</Label>
                          <Input
                            id="street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className={isLightMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-street"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="unit" className={`font-semibold transition-colors ${getLabelColor()}`}>Unit/Apt</Label>
                          <Input
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className={isLightMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-unit"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="city" className={`font-semibold transition-colors ${getLabelColor()}`}>City</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={isLightMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-city"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="state" className={`font-semibold transition-colors ${getLabelColor()}`}>State</Label>
                          <Input
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="CA"
                            maxLength={2}
                            className={isLightMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-state"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="zipCode" className={`font-semibold transition-colors ${getLabelColor()}`}>ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="12345"
                            maxLength={5}
                            className={isLightMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-zipCode"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="county" className={`font-semibold transition-colors ${getLabelColor()}`}>County</Label>
                          <Input
                            id="county"
                            value={county}
                            onChange={(e) => setCounty(e.target.value)}
                            className={isLightMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-county"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="fromDate" className={`font-semibold transition-colors ${getLabelColor()}`}>From</Label>
                          <Input
                            id="fromDate"
                            value={fromDate}
                            onChange={(e) => setFromDate(formatDate(e.target.value))}
                            placeholder="mm/dd/yyyy"
                            maxLength={10}
                            className={`!text-[13px] placeholder:text-[10px] ${
                              isLightMode 
                                ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                                : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }`}
                            data-testid="input-fromDate"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="toDate" className={`text-sm font-semibold transition-colors ${getLabelColor()}`}>
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
                              className="scale-[0.8] data-[state=checked]:bg-purple-500"
                            />
                          </div>
                          <Input
                            id="toDate"
                            value={isPresent ? 'Present' : toDate}
                            onChange={(e) => !isPresent && setToDate(formatDate(e.target.value))}
                            placeholder="mm/dd/yyyy"
                            maxLength={10}
                            readOnly={isPresent}
                            className={`!text-[13px] placeholder:text-[10px] ${
                              isLightMode 
                                ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                                : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }`}
                            data-testid="input-toDate"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="duration" className={`text-sm font-semibold transition-colors ${getLabelColor()}`}>Duration</Label>
                          <Input
                            id="duration"
                            value="0 Yrs 0 Mos"
                            readOnly
                            className={`cursor-not-allowed !text-[13px] ${
                              isLightMode
                                ? 'bg-purple-50 text-purple-700 border-purple-300'
                                : 'bg-slate-700/50 text-purple-300 border-purple-500/30'
                            }`}
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
  );
}
