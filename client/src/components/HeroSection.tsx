import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, X } from 'lucide-react';
import heroImage from '@assets/generated_images/Bright_white_family_room_4f4419e6.png';
import PreApprovalForm from './PreApprovalForm';

export default function HeroSection() {
  const [location, setLocation] = useLocation();
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

  // Form submission states
  const [rateTrackerSubmitting, setRateTrackerSubmitting] = useState(false);
  const [rateTrackerSubmitted, setRateTrackerSubmitted] = useState(false);
  const [preApprovalSubmitted, setPreApprovalSubmitted] = useState(false);

  // Form validation states
  const [rateTrackerErrors, setRateTrackerErrors] = useState<{[key: string]: boolean}>({});

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

  const handlePreApprovalSuccess = () => {
    setPreApprovalSubmitted(true);
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
        {/* Top shadow for menu visibility - darkens on menu hover */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent transition-all duration-300 group-hover:from-black/60"></div>
      </div>

      {/* Top Right Menu Options - Sleek White Menu Bar */}
      <div className="absolute top-6 right-6 z-20 hidden lg:block">
        <nav className="group">
          <div className="flex items-center">
            <button 
              className="relative px-4 py-2 text-sm text-white hover:text-white hover:font-semibold font-medium transition-all duration-200 drop-shadow-lg hover:drop-shadow-xl after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-px after:bg-green-600 after:transition-all after:duration-300 hover:after:w-3/4"
              data-testid="button-menu-loan-status"
              onClick={() => setLocation('/admin/login')}
            >
              Loan Status
            </button>
            <button 
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 drop-shadow-lg hover:drop-shadow-xl after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-px after:bg-green-600 after:transition-all after:duration-300 ${
                showRateTracker 
                  ? 'text-green-400 hover:text-green-400 hover:font-semibold after:w-3/4' 
                  : 'text-white hover:text-white hover:font-semibold after:w-0 hover:after:w-3/4'
              }`}
              data-testid="button-menu-rate-tracker"
              onClick={() => setShowRateTracker(true)}
            >
              Rate Tracker
            </button>
            <button 
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 drop-shadow-lg hover:drop-shadow-xl after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-px after:bg-green-600 after:transition-all after:duration-300 ${
                showCalculator 
                  ? 'text-green-400 hover:text-green-400 hover:font-semibold after:w-3/4' 
                  : 'text-white hover:text-white hover:font-semibold after:w-0 hover:after:w-3/4'
              }`}
              data-testid="button-menu-mortgage-calculator"
              onClick={() => setShowCalculator(true)}
            >
              Mortgage Calculator
            </button>
            <button 
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 drop-shadow-lg hover:drop-shadow-xl after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-px after:bg-green-600 after:transition-all after:duration-300 ${
                showPreApproval 
                  ? 'text-green-400 hover:text-green-400 hover:font-semibold after:w-3/4' 
                  : 'text-white hover:text-white hover:font-semibold after:w-0 hover:after:w-3/4'
              }`}
              data-testid="button-menu-get-preapproved"
              onClick={() => setShowPreApproval(true)}
            >
              Get Pre-Approved
            </button>
          </div>
        </nav>
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

        {/* Mortgage Calculator Modal */}
        {showCalculator && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="card-mortgage-calculator">
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
          </div>
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
                    <label className="block text-sm font-medium mb-2">Name</label>
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
                    <label className="block text-sm font-medium mb-2">Phone</label>
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
                    <label className="block text-sm font-medium mb-2">Target Interest Rate</label>
                    <Input
                      type="text"
                      value={rateTrackerData.trackInterestRate}
                      onChange={(e) => setRateTrackerData(prev => ({ ...prev, trackInterestRate: e.target.value }))}
                      placeholder="e.g., 5.5%, 6.0%"
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

                <PreApprovalForm
                  onSuccess={handlePreApprovalSuccess}
                  onCancel={() => setShowPreApproval(false)}
                  compactMode={true}
                  contextLabel="hero"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
