import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, X } from 'lucide-react';
import heroImage from '@assets/generated_images/Bright_white_family_room_4f4419e6.png';

export default function HeroSection() {
  const [loanAmount, setLoanAmount] = useState('400000');
  const [downPayment, setDownPayment] = useState('80000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTerm, setLoanTerm] = useState('30');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showRateTracker, setShowRateTracker] = useState(false);
  const [showPreApproval, setShowPreApproval] = useState(false);
  const [rateTrackerData, setRateTrackerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    propertyType: '',
    propertyUse: '',
    state: '',
    loanType: '',
    loanPurpose: '',
    currentRate: '',
    trackInterestRate: '',
    message: ''
  });
  const [preApprovalData, setPreApprovalData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employmentStatus: '',
    annualIncome: '',
    yearsAtJob: '',
    monthlyDebts: '',
    assets: '',
    desiredLoanAmount: '',
    downPayment: '',
    propertyValue: '',
    propertyType: '',
    intendedUse: '',
    state: '',
    timelineToPurchase: '',
    additionalInfo: '',
    addCoBorrower: 'no'
  });
  const [coBorrowerData, setCoBorrowerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employmentStatus: '',
    annualIncome: '',
    yearsAtJob: '',
    monthlyDebts: '',
    assets: '',
    state: ''
  });

  // Form submission states
  const [rateTrackerSubmitting, setRateTrackerSubmitting] = useState(false);
  const [rateTrackerSubmitted, setRateTrackerSubmitted] = useState(false);
  const [preApprovalSubmitting, setPreApprovalSubmitting] = useState(false);
  const [preApprovalSubmitted, setPreApprovalSubmitted] = useState(false);

  // Form validation states
  const [rateTrackerErrors, setRateTrackerErrors] = useState<{[key: string]: boolean}>({});
  const [preApprovalErrors, setPreApprovalErrors] = useState<{[key: string]: boolean}>({});
  const [coBorrowerErrors, setCoBorrowerErrors] = useState<{[key: string]: boolean}>({});

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (xxx) xxx-xxxx
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return digits;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setRateTrackerData(prev => ({ ...prev, phone: formatted }));
  };

  const handlePreApprovalPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPreApprovalData(prev => ({ ...prev, phone: formatted }));
  };

  const handleCoBorrowerPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setCoBorrowerData(prev => ({ ...prev, phone: formatted }));
  };

  const calculatePayment = () => {
    const principal = parseFloat(loanAmount) - parseFloat(downPayment);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numPayments = parseInt(loanTerm) * 12;
    
    const monthlyPayment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return monthlyPayment.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    });
  };

  // Form validation functions
  const validateRateTracker = () => {
    const errors: {[key: string]: boolean} = {};
    const required = ['fullName', 'email', 'phone', 'propertyType', 'propertyUse', 'state', 'loanType', 'loanPurpose', 'currentRate', 'trackInterestRate'];
    
    required.forEach(field => {
      if (!rateTrackerData[field as keyof typeof rateTrackerData]?.trim()) {
        errors[field] = true;
      }
    });

    setRateTrackerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePreApproval = () => {
    const errors: {[key: string]: boolean} = {};
    const required = ['fullName', 'email', 'phone', 'employmentStatus', 'annualIncome', 'yearsAtJob', 
                     'monthlyDebts', 'assets', 'desiredLoanAmount', 'downPayment', 'propertyValue', 
                     'propertyType', 'intendedUse', 'state', 'timelineToPurchase'];
    
    required.forEach(field => {
      if (!preApprovalData[field as keyof typeof preApprovalData]?.trim()) {
        errors[field] = true;
      }
    });

    setPreApprovalErrors(errors);

    // Validate co-borrower if added
    let coBorrowerValid = true;
    if (preApprovalData.addCoBorrower === 'yes') {
      const coBorrowerErrs: {[key: string]: boolean} = {};
      const coBorrowerRequired = ['fullName', 'email', 'phone', 'employmentStatus', 'annualIncome', 
                                 'yearsAtJob', 'monthlyDebts', 'assets', 'state'];
      
      coBorrowerRequired.forEach(field => {
        if (!coBorrowerData[field as keyof typeof coBorrowerData]?.trim()) {
          coBorrowerErrs[field] = true;
        }
      });

      setCoBorrowerErrors(coBorrowerErrs);
      coBorrowerValid = Object.keys(coBorrowerErrs).length === 0;
    }

    return Object.keys(errors).length === 0 && coBorrowerValid;
  };

  // API submission functions
  const submitRateTracker = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateRateTracker()) {
      return; // Don't submit if validation fails
    }

    setRateTrackerSubmitting(true);

    try {
      const response = await fetch('/api/rate-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rateTrackerData)
      });

      if (response.ok) {
        setRateTrackerSubmitted(true);
        setRateTrackerErrors({}); // Clear errors on success
      } else {
        console.error('Rate tracker submission failed');
      }
    } catch (error) {
      console.error('Rate tracker submission error:', error);
    } finally {
      setRateTrackerSubmitting(false);
    }
  };

  const submitPreApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validatePreApproval()) {
      return; // Don't submit if validation fails
    }

    setPreApprovalSubmitting(true);

    try {
      const response = await fetch('/api/pre-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          preApprovalData, 
          coBorrowerData: preApprovalData.addCoBorrower === 'yes' ? coBorrowerData : null 
        })
      });

      if (response.ok) {
        setPreApprovalSubmitted(true);
        setPreApprovalErrors({}); // Clear errors on success
        setCoBorrowerErrors({}); // Clear co-borrower errors on success
      } else {
        console.error('Pre-approval submission failed');
      }
    } catch (error) {
      console.error('Pre-approval submission error:', error);
    } finally {
      setPreApprovalSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Hero background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Family enjoying their beautiful bright home interior"
          className="w-full h-full object-cover"
          data-testid="img-hero-background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
      </div>

      {/* Top Right Menu Options */}
      <div className="absolute top-6 right-6 z-20 hidden lg:flex gap-3">
        <Button 
          size="sm" 
          className="bg-primary text-white hover:bg-green-800 transition-colors duration-200 no-default-hover-elevate"
          data-testid="button-menu-loan-status"
          onClick={() => console.log('Loan Status clicked')}
        >
          Loan Status
        </Button>
        <Button 
          size="sm" 
          className="bg-primary text-white hover:bg-green-800 transition-colors duration-200 no-default-hover-elevate"
          data-testid="button-menu-rate-tracker"
          onClick={() => setShowRateTracker(true)}
        >
          Rate Tracker
        </Button>
        <Button 
          size="sm" 
          className="bg-primary text-white hover:bg-green-800 transition-colors duration-200 no-default-hover-elevate"
          data-testid="button-menu-mortgage-calculator"
          onClick={() => setShowCalculator(true)}
        >
          Mortgage Calculator
        </Button>
        <Button 
          size="sm" 
          className="bg-primary text-white hover:bg-green-800 transition-colors duration-200 no-default-hover-elevate"
          data-testid="button-menu-get-preapproved"
          onClick={() => setShowPreApproval(true)}
        >
          Get Pre-Approved
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Hero Content */}
        <div className="text-white">
          <div className="mb-6">
            <h1 className="font-black italic mb-4 leading-tight" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }} data-testid="text-hero-title">
              <div className="text-4xl lg:text-6xl">PRIME RATE</div>
              <div className="text-4xl lg:text-6xl">Home Loans</div>
            </h1>
            <p className="text-xl lg:text-2xl mb-4" data-testid="text-hero-subtitle">
              Prime Rates . Lower Payments
            </p>
          </div>
          
          <div className="mb-6">
            <p className="text-3xl lg:text-4xl font-semibold" data-testid="text-hero-phone">
              800-223-5057
            </p>
          </div>

        </div>

        {/* Mortgage Calculator Card */}
        {showCalculator && (
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl" data-testid="card-mortgage-calculator">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Calculator className="w-6 h-6 text-primary mr-3" />
                  <h2 className="text-2xl font-bold font-serif" data-testid="text-calculator-title">
                    Mortgage Calculator
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-close-calculator"
                  onClick={() => setShowCalculator(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Home Price</label>
                  <Input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="400,000"
                    data-testid="input-loan-amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Down Payment</label>
                  <Input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    placeholder="80,000"
                    data-testid="input-down-payment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Interest Rate (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="6.5"
                    data-testid="input-interest-rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Loan Term</label>
                  <Select value={loanTerm} onValueChange={setLoanTerm}>
                    <SelectTrigger data-testid="select-loan-term">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="30">30 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-primary/10 p-4 rounded-md">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Payment</p>
                    <p className="text-3xl font-bold text-primary" data-testid="text-monthly-payment">
                      {calculatePayment()}
                    </p>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  data-testid="button-get-quote"
                  onClick={() => console.log('Get My Quote clicked')}
                >
                  Get My Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rate Tracker Modal */}
        {showRateTracker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto" data-testid="card-rate-tracker">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold font-serif" data-testid="text-rate-tracker-title">
                      Rate Tracker
                    </h2>
                    {rateTrackerSubmitted && (
                      <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded" data-testid="status-rate-tracker-submitted">
                        Request Submitted
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-close-rate-tracker"
                    onClick={() => setShowRateTracker(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                  <form className="space-y-4" onSubmit={submitRateTracker} noValidate>
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      type="text"
                      value={rateTrackerData.fullName}
                      onChange={(e) => setRateTrackerData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                      data-testid="input-rate-tracker-name"
                      aria-invalid={rateTrackerErrors.fullName || false}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={rateTrackerData.email}
                      onChange={(e) => setRateTrackerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      data-testid="input-rate-tracker-email"
                      aria-invalid={rateTrackerErrors.email || false}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      value={rateTrackerData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(xxx) xxx-xxxx"
                      data-testid="input-rate-tracker-phone"
                      aria-invalid={rateTrackerErrors.phone || false}
                      required
                      maxLength={14}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Property Type</label>
                    <Select value={rateTrackerData.propertyType} onValueChange={(value) => setRateTrackerData(prev => ({ ...prev, propertyType: value }))}>
                      <SelectTrigger data-testid="select-rate-tracker-property-type" aria-invalid={rateTrackerErrors.propertyType || false}>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-family">Single Family Home</SelectItem>
                        <SelectItem value="condo">Condominium</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="multi-family">Multi-Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Property Use</label>
                    <Select value={rateTrackerData.propertyUse} onValueChange={(value) => setRateTrackerData(prev => ({ ...prev, propertyUse: value }))}>
                      <SelectTrigger data-testid="select-rate-tracker-property-use" aria-invalid={rateTrackerErrors.propertyUse || false}>
                        <SelectValue placeholder="Select property use" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary-residence">Primary Residence</SelectItem>
                        <SelectItem value="second-home">Second Home</SelectItem>
                        <SelectItem value="investment-property">Investment Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <Select value={rateTrackerData.state} onValueChange={(value) => setRateTrackerData(prev => ({ ...prev, state: value }))}>
                      <SelectTrigger data-testid="select-rate-tracker-state" aria-invalid={rateTrackerErrors.state || false}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AL">Alabama</SelectItem>
                        <SelectItem value="AK">Alaska</SelectItem>
                        <SelectItem value="AZ">Arizona</SelectItem>
                        <SelectItem value="AR">Arkansas</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="CO">Colorado</SelectItem>
                        <SelectItem value="CT">Connecticut</SelectItem>
                        <SelectItem value="DE">Delaware</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="GA">Georgia</SelectItem>
                        <SelectItem value="HI">Hawaii</SelectItem>
                        <SelectItem value="ID">Idaho</SelectItem>
                        <SelectItem value="IL">Illinois</SelectItem>
                        <SelectItem value="IN">Indiana</SelectItem>
                        <SelectItem value="IA">Iowa</SelectItem>
                        <SelectItem value="KS">Kansas</SelectItem>
                        <SelectItem value="KY">Kentucky</SelectItem>
                        <SelectItem value="LA">Louisiana</SelectItem>
                        <SelectItem value="ME">Maine</SelectItem>
                        <SelectItem value="MD">Maryland</SelectItem>
                        <SelectItem value="MA">Massachusetts</SelectItem>
                        <SelectItem value="MI">Michigan</SelectItem>
                        <SelectItem value="MN">Minnesota</SelectItem>
                        <SelectItem value="MS">Mississippi</SelectItem>
                        <SelectItem value="MO">Missouri</SelectItem>
                        <SelectItem value="MT">Montana</SelectItem>
                        <SelectItem value="NE">Nebraska</SelectItem>
                        <SelectItem value="NV">Nevada</SelectItem>
                        <SelectItem value="NH">New Hampshire</SelectItem>
                        <SelectItem value="NJ">New Jersey</SelectItem>
                        <SelectItem value="NM">New Mexico</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="NC">North Carolina</SelectItem>
                        <SelectItem value="ND">North Dakota</SelectItem>
                        <SelectItem value="OH">Ohio</SelectItem>
                        <SelectItem value="OK">Oklahoma</SelectItem>
                        <SelectItem value="OR">Oregon</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                        <SelectItem value="RI">Rhode Island</SelectItem>
                        <SelectItem value="SC">South Carolina</SelectItem>
                        <SelectItem value="SD">South Dakota</SelectItem>
                        <SelectItem value="TN">Tennessee</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="UT">Utah</SelectItem>
                        <SelectItem value="VT">Vermont</SelectItem>
                        <SelectItem value="VA">Virginia</SelectItem>
                        <SelectItem value="WA">Washington</SelectItem>
                        <SelectItem value="WV">West Virginia</SelectItem>
                        <SelectItem value="WI">Wisconsin</SelectItem>
                        <SelectItem value="WY">Wyoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Loan Type</label>
                    <Select value={rateTrackerData.loanType} onValueChange={(value) => setRateTrackerData(prev => ({ ...prev, loanType: value }))}>
                      <SelectTrigger data-testid="select-rate-tracker-loan-type" aria-invalid={rateTrackerErrors.loanType || false}>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conventional">Conventional</SelectItem>
                        <SelectItem value="fha">FHA</SelectItem>
                        <SelectItem value="va">VA</SelectItem>
                        <SelectItem value="jumbo">Jumbo</SelectItem>
                        <SelectItem value="usda">USDA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Loan Purpose</label>
                    <Select value={rateTrackerData.loanPurpose} onValueChange={(value) => setRateTrackerData(prev => ({ ...prev, loanPurpose: value }))}>
                      <SelectTrigger data-testid="select-rate-tracker-loan-purpose" aria-invalid={rateTrackerErrors.loanPurpose || false}>
                        <SelectValue placeholder="Select loan purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home-purchase">Home Purchase</SelectItem>
                        <SelectItem value="refinance">Refinance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Current Rate</label>
                    <Input
                      type="text"
                      value={rateTrackerData.currentRate}
                      onChange={(e) => setRateTrackerData(prev => ({ ...prev, currentRate: e.target.value }))}
                      placeholder="e.g., 6.25%, 7.0%"
                      data-testid="input-rate-tracker-current-rate"
                      aria-invalid={rateTrackerErrors.currentRate || false}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Track Interest Rate Of</label>
                    <Input
                      type="text"
                      value={rateTrackerData.trackInterestRate}
                      onChange={(e) => setRateTrackerData(prev => ({ ...prev, trackInterestRate: e.target.value }))}
                      placeholder="e.g., 30-year fixed, 15-year fixed"
                      data-testid="input-rate-tracker-interest-rate"
                      aria-invalid={rateTrackerErrors.trackInterestRate || false}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      value={rateTrackerData.message}
                      onChange={(e) => setRateTrackerData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Additional details about your rate tracking needs..."
                      rows={4}
                      data-testid="textarea-rate-tracker-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    data-testid="button-submit-rate-tracker"
                    disabled={rateTrackerSubmitting}
                  >
                    {rateTrackerSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pre-Approval Modal */}
        {showPreApproval && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="card-pre-approval">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold font-serif" data-testid="text-pre-approval-title">
                      Get Pre-Approved
                    </h2>
                    {preApprovalSubmitted && (
                      <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded" data-testid="status-pre-approval-submitted">
                        Request Submitted
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-close-pre-approval"
                    onClick={() => setShowPreApproval(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form className="space-y-6" onSubmit={submitPreApproval} noValidate>
                  {/* Borrower Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Borrower Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <Input
                          type="text"
                          value={preApprovalData.fullName}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Enter your full name"
                          data-testid="input-pre-approval-name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                          type="email"
                          value={preApprovalData.email}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                          data-testid="input-pre-approval-email"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <Input
                          type="tel"
                          value={preApprovalData.phone}
                          onChange={(e) => handlePreApprovalPhoneChange(e.target.value)}
                          placeholder="(xxx) xxx-xxxx"
                          data-testid="input-pre-approval-phone"
                          required
                          maxLength={14}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">State</label>
                        <Select value={preApprovalData.state} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, state: value }))}>
                          <SelectTrigger data-testid="select-pre-approval-state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AL">Alabama</SelectItem>
                            <SelectItem value="AK">Alaska</SelectItem>
                            <SelectItem value="AZ">Arizona</SelectItem>
                            <SelectItem value="AR">Arkansas</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="CO">Colorado</SelectItem>
                            <SelectItem value="CT">Connecticut</SelectItem>
                            <SelectItem value="DE">Delaware</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="GA">Georgia</SelectItem>
                            <SelectItem value="HI">Hawaii</SelectItem>
                            <SelectItem value="ID">Idaho</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                            <SelectItem value="IN">Indiana</SelectItem>
                            <SelectItem value="IA">Iowa</SelectItem>
                            <SelectItem value="KS">Kansas</SelectItem>
                            <SelectItem value="KY">Kentucky</SelectItem>
                            <SelectItem value="LA">Louisiana</SelectItem>
                            <SelectItem value="ME">Maine</SelectItem>
                            <SelectItem value="MD">Maryland</SelectItem>
                            <SelectItem value="MA">Massachusetts</SelectItem>
                            <SelectItem value="MI">Michigan</SelectItem>
                            <SelectItem value="MN">Minnesota</SelectItem>
                            <SelectItem value="MS">Mississippi</SelectItem>
                            <SelectItem value="MO">Missouri</SelectItem>
                            <SelectItem value="MT">Montana</SelectItem>
                            <SelectItem value="NE">Nebraska</SelectItem>
                            <SelectItem value="NV">Nevada</SelectItem>
                            <SelectItem value="NH">New Hampshire</SelectItem>
                            <SelectItem value="NJ">New Jersey</SelectItem>
                            <SelectItem value="NM">New Mexico</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="NC">North Carolina</SelectItem>
                            <SelectItem value="ND">North Dakota</SelectItem>
                            <SelectItem value="OH">Ohio</SelectItem>
                            <SelectItem value="OK">Oklahoma</SelectItem>
                            <SelectItem value="OR">Oregon</SelectItem>
                            <SelectItem value="PA">Pennsylvania</SelectItem>
                            <SelectItem value="RI">Rhode Island</SelectItem>
                            <SelectItem value="SC">South Carolina</SelectItem>
                            <SelectItem value="SD">South Dakota</SelectItem>
                            <SelectItem value="TN">Tennessee</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="UT">Utah</SelectItem>
                            <SelectItem value="VT">Vermont</SelectItem>
                            <SelectItem value="VA">Virginia</SelectItem>
                            <SelectItem value="WA">Washington</SelectItem>
                            <SelectItem value="WV">West Virginia</SelectItem>
                            <SelectItem value="WI">Wisconsin</SelectItem>
                            <SelectItem value="WY">Wyoming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Employment & Income */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Employment & Income</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Employment Status</label>
                        <Select value={preApprovalData.employmentStatus} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, employmentStatus: value }))}>
                          <SelectTrigger data-testid="select-employment-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self-employed">Self-Employed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Annual Income</label>
                        <Input
                          type="number"
                          value={preApprovalData.annualIncome}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, annualIncome: e.target.value }))}
                          placeholder="$75,000"
                          data-testid="input-annual-income"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Years at Current Job</label>
                        <Input
                          type="number"
                          value={preApprovalData.yearsAtJob}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, yearsAtJob: e.target.value }))}
                          placeholder="2"
                          data-testid="input-years-at-job"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Financial Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Monthly Debts</label>
                        <Input
                          type="number"
                          value={preApprovalData.monthlyDebts}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, monthlyDebts: e.target.value }))}
                          placeholder="$500"
                          data-testid="input-monthly-debts"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Assets/Savings</label>
                        <Input
                          type="number"
                          value={preApprovalData.assets}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, assets: e.target.value }))}
                          placeholder="$50,000"
                          data-testid="input-assets"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Loan Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Desired Loan Amount</label>
                        <Input
                          type="number"
                          value={preApprovalData.desiredLoanAmount}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, desiredLoanAmount: e.target.value }))}
                          placeholder="$400,000"
                          data-testid="input-loan-amount"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Down Payment</label>
                        <Input
                          type="number"
                          value={preApprovalData.downPayment}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, downPayment: e.target.value }))}
                          placeholder="$80,000"
                          data-testid="input-down-payment"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Property Value</label>
                        <Input
                          type="number"
                          value={preApprovalData.propertyValue}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, propertyValue: e.target.value }))}
                          placeholder="$480,000"
                          data-testid="input-property-value"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Property Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Property Type</label>
                        <Select value={preApprovalData.propertyType} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, propertyType: value }))}>
                          <SelectTrigger data-testid="select-property-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single-family">Single Family Home</SelectItem>
                            <SelectItem value="condo">Condominium</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="multi-family">Multi-Family</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Intended Use</label>
                        <Select value={preApprovalData.intendedUse} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, intendedUse: value }))}>
                          <SelectTrigger data-testid="select-intended-use">
                            <SelectValue placeholder="Select use" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary Residence</SelectItem>
                            <SelectItem value="secondary">Secondary Home</SelectItem>
                            <SelectItem value="investment">Investment Property</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Timeline to Purchase</label>
                        <Select value={preApprovalData.timelineToPurchase} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, timelineToPurchase: value }))}>
                          <SelectTrigger data-testid="select-timeline">
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediately</SelectItem>
                            <SelectItem value="1-3months">1-3 Months</SelectItem>
                            <SelectItem value="3-6months">3-6 Months</SelectItem>
                            <SelectItem value="6-12months">6-12 Months</SelectItem>
                            <SelectItem value="12months+">12+ Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Information</label>
                    <Textarea
                      value={preApprovalData.additionalInfo}
                      onChange={(e) => setPreApprovalData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                      placeholder="Tell us anything else that might be relevant to your pre-approval..."
                      rows={4}
                      data-testid="textarea-additional-info"
                    />
                  </div>

                  {/* Add Co-Borrower Option */}
                  <div>
                    <label className="block text-sm font-medium mb-4">Add a Spouse or Co-Borrower?</label>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="addCoBorrower"
                          value="yes"
                          checked={preApprovalData.addCoBorrower === 'yes'}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, addCoBorrower: e.target.value }))}
                          className="mr-2"
                          data-testid="radio-co-borrower-yes"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="addCoBorrower"
                          value="no"
                          checked={preApprovalData.addCoBorrower === 'no'}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, addCoBorrower: e.target.value }))}
                          className="mr-2"
                          data-testid="radio-co-borrower-no"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  {/* Co-Borrower Information (conditional) */}
                  {preApprovalData.addCoBorrower === 'yes' && (
                    <div className="border-t pt-6">
                      {/* Co-Borrower Personal Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">Co-Borrower Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <Input
                              type="text"
                              value={coBorrowerData.fullName}
                              onChange={(e) => setCoBorrowerData(prev => ({ ...prev, fullName: e.target.value }))}
                              placeholder="Enter co-borrower's full name"
                              data-testid="input-co-borrower-name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <Input
                              type="email"
                              value={coBorrowerData.email}
                              onChange={(e) => setCoBorrowerData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter co-borrower's email"
                              data-testid="input-co-borrower-email"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                            <Input
                              type="tel"
                              value={coBorrowerData.phone}
                              onChange={(e) => handleCoBorrowerPhoneChange(e.target.value)}
                              placeholder="(xxx) xxx-xxxx"
                              data-testid="input-co-borrower-phone"
                              maxLength={14}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <Select value={coBorrowerData.state} onValueChange={(value) => setCoBorrowerData(prev => ({ ...prev, state: value }))}>
                              <SelectTrigger data-testid="select-co-borrower-state">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AL">Alabama</SelectItem>
                                <SelectItem value="AK">Alaska</SelectItem>
                                <SelectItem value="AZ">Arizona</SelectItem>
                                <SelectItem value="AR">Arkansas</SelectItem>
                                <SelectItem value="CA">California</SelectItem>
                                <SelectItem value="CO">Colorado</SelectItem>
                                <SelectItem value="CT">Connecticut</SelectItem>
                                <SelectItem value="DE">Delaware</SelectItem>
                                <SelectItem value="FL">Florida</SelectItem>
                                <SelectItem value="GA">Georgia</SelectItem>
                                <SelectItem value="HI">Hawaii</SelectItem>
                                <SelectItem value="ID">Idaho</SelectItem>
                                <SelectItem value="IL">Illinois</SelectItem>
                                <SelectItem value="IN">Indiana</SelectItem>
                                <SelectItem value="IA">Iowa</SelectItem>
                                <SelectItem value="KS">Kansas</SelectItem>
                                <SelectItem value="KY">Kentucky</SelectItem>
                                <SelectItem value="LA">Louisiana</SelectItem>
                                <SelectItem value="ME">Maine</SelectItem>
                                <SelectItem value="MD">Maryland</SelectItem>
                                <SelectItem value="MA">Massachusetts</SelectItem>
                                <SelectItem value="MI">Michigan</SelectItem>
                                <SelectItem value="MN">Minnesota</SelectItem>
                                <SelectItem value="MS">Mississippi</SelectItem>
                                <SelectItem value="MO">Missouri</SelectItem>
                                <SelectItem value="MT">Montana</SelectItem>
                                <SelectItem value="NE">Nebraska</SelectItem>
                                <SelectItem value="NV">Nevada</SelectItem>
                                <SelectItem value="NH">New Hampshire</SelectItem>
                                <SelectItem value="NJ">New Jersey</SelectItem>
                                <SelectItem value="NM">New Mexico</SelectItem>
                                <SelectItem value="NY">New York</SelectItem>
                                <SelectItem value="NC">North Carolina</SelectItem>
                                <SelectItem value="ND">North Dakota</SelectItem>
                                <SelectItem value="OH">Ohio</SelectItem>
                                <SelectItem value="OK">Oklahoma</SelectItem>
                                <SelectItem value="OR">Oregon</SelectItem>
                                <SelectItem value="PA">Pennsylvania</SelectItem>
                                <SelectItem value="RI">Rhode Island</SelectItem>
                                <SelectItem value="SC">South Carolina</SelectItem>
                                <SelectItem value="SD">South Dakota</SelectItem>
                                <SelectItem value="TN">Tennessee</SelectItem>
                                <SelectItem value="TX">Texas</SelectItem>
                                <SelectItem value="UT">Utah</SelectItem>
                                <SelectItem value="VT">Vermont</SelectItem>
                                <SelectItem value="VA">Virginia</SelectItem>
                                <SelectItem value="WA">Washington</SelectItem>
                                <SelectItem value="WV">West Virginia</SelectItem>
                                <SelectItem value="WI">Wisconsin</SelectItem>
                                <SelectItem value="WY">Wyoming</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Co-Borrower Employment & Income */}
                      <div className="mt-6">
                        <h4 className="text-md font-semibold mb-4 text-primary">Co-Borrower Employment & Income</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Employment Status</label>
                            <Select value={coBorrowerData.employmentStatus} onValueChange={(value) => setCoBorrowerData(prev => ({ ...prev, employmentStatus: value }))}>
                              <SelectTrigger data-testid="select-co-borrower-employment-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="employed">Employed</SelectItem>
                                <SelectItem value="self-employed">Self-Employed</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Annual Income</label>
                            <Input
                              type="number"
                              value={coBorrowerData.annualIncome}
                              onChange={(e) => setCoBorrowerData(prev => ({ ...prev, annualIncome: e.target.value }))}
                              placeholder="$75,000"
                              data-testid="input-co-borrower-annual-income"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Years at Current Job</label>
                            <Input
                              type="number"
                              value={coBorrowerData.yearsAtJob}
                              onChange={(e) => setCoBorrowerData(prev => ({ ...prev, yearsAtJob: e.target.value }))}
                              placeholder="2"
                              data-testid="input-co-borrower-years-at-job"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Co-Borrower Financial Information */}
                      <div className="mt-6">
                        <h4 className="text-md font-semibold mb-4 text-primary">Co-Borrower Financial Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Monthly Debts</label>
                            <Input
                              type="number"
                              value={coBorrowerData.monthlyDebts}
                              onChange={(e) => setCoBorrowerData(prev => ({ ...prev, monthlyDebts: e.target.value }))}
                              placeholder="$500"
                              data-testid="input-co-borrower-monthly-debts"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Assets/Savings</label>
                            <Input
                              type="number"
                              value={coBorrowerData.assets}
                              onChange={(e) => setCoBorrowerData(prev => ({ ...prev, assets: e.target.value }))}
                              placeholder="$50,000"
                              data-testid="input-co-borrower-assets"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    data-testid="button-submit-pre-approval"
                    disabled={preApprovalSubmitting}
                  >
                    {preApprovalSubmitting ? 'Submitting...' : 'Submit Pre-Approval Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}