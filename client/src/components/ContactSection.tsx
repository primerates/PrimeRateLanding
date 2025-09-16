import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Clock, X, Send } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    loanType: '',
    message: ''
  });
  
  // Pre-approval form state
  const [showPreApproval, setShowPreApproval] = useState(false);
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
  
  // Schedule call form state
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [scheduleCallData, setScheduleCallData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    timeZone: '',
    callReason: '',
    message: ''
  });

  // Form submission states
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [showPlaneAnimation, setShowPlaneAnimation] = useState(false);
  
  // Create a circular looping path (roundabout effect)
  const circlePath = () => {
    const x = [];
    const y = [];
    const radius = 120;
    const loops = 2; // how many times it circles
    const steps = 40; // smoothness

    for (let i = 0; i <= loops * steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      x.push(Math.cos(angle) * radius);
      y.push(Math.sin(angle) * radius * 0.6 - i * 3); // tilt downward slightly as it circles
    }

    return { x, y };
  };
  
  const [planePath, setPlanePath] = useState(circlePath());
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [preApprovalSubmitting, setPreApprovalSubmitting] = useState(false);
  const [preApprovalSubmitted, setPreApprovalSubmitted] = useState(false);
  const [scheduleCallSubmitting, setScheduleCallSubmitting] = useState(false);
  const [scheduleCallSubmitted, setScheduleCallSubmitted] = useState(false);

  // Form validation states
  const [contactErrors, setContactErrors] = useState<{[key: string]: boolean}>({});
  const [preApprovalErrors, setPreApprovalErrors] = useState<{[key: string]: boolean}>({});
  const [coBorrowerErrors, setCoBorrowerErrors] = useState<{[key: string]: boolean}>({});
  const [scheduleCallErrors, setScheduleCallErrors] = useState<{[key: string]: boolean}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Phone number formatting
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return digits;
    }
  };

  const handleContactPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handlePreApprovalPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPreApprovalData(prev => ({ ...prev, phone: formatted }));
  };

  const handleCoBorrowerPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setCoBorrowerData(prev => ({ ...prev, phone: formatted }));
  };

  const handleScheduleCallPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setScheduleCallData(prev => ({ ...prev, phone: formatted }));
  };

  // Form validation functions
  const validateContactForm = () => {
    const errors: {[key: string]: boolean} = {};
    const required = ['name', 'email', 'phone', 'loanType', 'message'];
    
    required.forEach(field => {
      if (!formData[field as keyof typeof formData]?.trim()) {
        errors[field] = true;
      }
    });

    setContactErrors(errors);
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

  const validateScheduleCall = () => {
    const errors: {[key: string]: boolean} = {};
    const required = ['name', 'email', 'phone', 'preferredDate', 'preferredTime', 'timeZone', 'callReason'];
    
    required.forEach(field => {
      if (!scheduleCallData[field as keyof typeof scheduleCallData]?.trim()) {
        errors[field] = true;
      }
    });

    setScheduleCallErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateContactForm()) {
      return; // Don't submit if validation fails
    }

    setContactSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setContactSubmitted(true);
        setContactErrors({}); // Clear errors on success
      } else {
        console.error('Contact form submission failed');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
    } finally {
      setContactSubmitting(false);
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

  const submitScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateScheduleCall()) {
      return; // Don't submit if validation fails
    }

    setScheduleCallSubmitting(true);

    try {
      const response = await fetch('/api/schedule-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleCallData)
      });

      if (response.ok) {
        setScheduleCallSubmitted(true);
        setScheduleCallErrors({}); // Clear errors on success
      } else {
        console.error('Schedule call submission failed');
      }
    } catch (error) {
      console.error('Schedule call submission error:', error);
    } finally {
      setScheduleCallSubmitting(false);
    }
  };


  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4" data-testid="text-contact-title">
            Say Hello & Save More
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-contact-description">
            Discover your prime rate and save more today
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div>
            
            <div className="space-y-8 flex flex-col justify-between h-full">
              <Card className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" data-testid="text-phone-title">Call Us</h4>
                      <p className="text-2xl font-bold text-primary" data-testid="text-phone-number">
                        800-223-5057
                      </p>
                      <p className="text-sm text-muted-foreground">Mon-Fri 8AM-8PM, Sat 9AM-5PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" data-testid="text-email-title">Email Us</h4>
                      <p className="text-primary font-semibold" data-testid="text-email-address">
                        info@primerateloans.com
                      </p>
                      <p className="text-sm text-muted-foreground">We respond within 2 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full"
                      data-testid="button-schedule-call-card"
                      onClick={() => setShowScheduleCall(true)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule Call
                    </Button>
                    <Button 
                      size="lg" 
                      className="w-full"
                      data-testid="button-apply-now-card"
                      onClick={() => setShowPreApproval(true)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-serif" data-testid="text-form-title">
                  Request Information
                </CardTitle>
                {contactSubmitted && (
                  <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded" data-testid="status-contact-submitted">
                    Request Submitted
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-contact-name"
                      aria-invalid={contactErrors.name || false}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                      data-testid="input-contact-email"
                      aria-invalid={contactErrors.email || false}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleContactPhoneChange(e.target.value)}
                    placeholder="(555) 123-4567"
                    data-testid="input-contact-phone"
                    aria-invalid={contactErrors.phone || false}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Loan Type</label>
                  <Select value={formData.loanType} onValueChange={(value) => handleInputChange('loanType', value)}>
                    <SelectTrigger data-testid="select-loan-type" aria-invalid={contactErrors.loanType || false}>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Purchase Loan</SelectItem>
                      <SelectItem value="refinance">Refinance</SelectItem>
                      <SelectItem value="fha">FHA Loan</SelectItem>
                      <SelectItem value="va">VA Loan</SelectItem>
                      <SelectItem value="jumbo">Jumbo Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your home financing needs..."
                    rows={4}
                    data-testid="textarea-contact-message"
                    aria-invalid={contactErrors.message || false}
                    required
                  />
                </div>

                <div className="relative">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    data-testid="button-submit-contact"
                    disabled={contactSubmitting}
                    onClick={() => {
                      if (!contactSubmitting) {
                        setPlanePath(circlePath());
                        setShowPlaneAnimation(true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {contactSubmitting ? 'Sending...' : 'Send Message'}
                      {!showPlaneAnimation && <Send className="w-4 h-4" />}
                    </div>
                  </Button>

                  {/* Framer Motion Paper Plane Animation */}
                  <AnimatePresence>
                    {showPlaneAnimation && (
                      <>
                        {/* Swoosh trail */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.6, 0.3, 0] }}
                          transition={{ duration: 6, ease: "easeInOut" }}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 200 200"
                            className="w-64 h-64 opacity-40 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M10 150 C 60 100, 140 100, 190 50" />
                          </svg>
                        </motion.div>

                        <motion.div
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{
                            x: planePath.x,
                            y: planePath.y,
                            opacity: [1, 1, 0.9, 0.7, 0],
                            scale: [1, 1, 0.9, 0.8, 0.6],
                          }}
                          transition={{ duration: 6, ease: "easeInOut" }}
                          exit={{ opacity: 0 }}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                          onAnimationComplete={() => setShowPlaneAnimation(false)}
                        >
                          {/* Realistic Paper Plane SVG */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 64 64"
                            fill="currentColor"
                            className="w-16 h-16 text-white drop-shadow-lg"
                          >
                            <path d="M2 30L62 2 38 62 28 38 2 30z" fill="white" stroke="black" strokeWidth="1.5" />
                            <path d="M28 38L62 2 24 34z" fill="#e5e5e5" />
                          </svg>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Pre-Approval Modal */}
        {showPreApproval && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="card-pre-approval-contact">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold font-serif" data-testid="text-pre-approval-contact-title">
                      Get Pre-Approved
                    </h2>
                    {preApprovalSubmitted && (
                      <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded" data-testid="status-pre-approval-contact-submitted">
                        Request Submitted
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-close-pre-approval-contact"
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
                          data-testid="input-contact-pre-approval-name"
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
                          data-testid="input-contact-pre-approval-email"
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
                          data-testid="input-contact-pre-approval-phone"
                          required
                          maxLength={14}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">State</label>
                        <Select value={preApprovalData.state} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, state: value }))}>
                          <SelectTrigger data-testid="select-contact-pre-approval-state">
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
                          <SelectTrigger data-testid="select-contact-employment-status">
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
                          data-testid="input-contact-annual-income"
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
                          data-testid="input-contact-years-at-job"
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
                          data-testid="input-contact-monthly-debts"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Assets/Savings</label>
                        <Input
                          type="number"
                          value={preApprovalData.assets}
                          onChange={(e) => setPreApprovalData(prev => ({ ...prev, assets: e.target.value }))}
                          placeholder="$50,000"
                          data-testid="input-contact-assets"
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
                          data-testid="input-contact-loan-amount"
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
                          data-testid="input-contact-down-payment"
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
                          data-testid="input-contact-property-value"
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
                          <SelectTrigger data-testid="select-contact-property-type">
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
                          <SelectTrigger data-testid="select-contact-intended-use">
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
                          <SelectTrigger data-testid="select-contact-timeline">
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
                      data-testid="textarea-contact-additional-info"
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
                          data-testid="radio-contact-co-borrower-yes"
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
                          data-testid="radio-contact-co-borrower-no"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  {/* Co-Borrower Information (conditional) */}
                  {preApprovalData.addCoBorrower === 'yes' && (
                    <div className="border-t pt-6">
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
                              data-testid="input-contact-co-borrower-name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <Input
                              type="email"
                              value={coBorrowerData.email}
                              onChange={(e) => setCoBorrowerData(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="Enter co-borrower's email"
                              data-testid="input-contact-co-borrower-email"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                            <Input
                              type="tel"
                              value={coBorrowerData.phone}
                              onChange={(e) => handleCoBorrowerPhoneChange(e.target.value)}
                              placeholder="(xxx) xxx-xxxx"
                              data-testid="input-contact-co-borrower-phone"
                              maxLength={14}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <Select value={coBorrowerData.state} onValueChange={(value) => setCoBorrowerData(prev => ({ ...prev, state: value }))}>
                              <SelectTrigger data-testid="select-contact-co-borrower-state">
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
                              <SelectTrigger data-testid="select-contact-co-borrower-employment-status">
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
                              data-testid="input-contact-co-borrower-annual-income"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Years at Current Job</label>
                            <Input
                              type="number"
                              value={coBorrowerData.yearsAtJob}
                              onChange={(e) => setCoBorrowerData(prev => ({ ...prev, yearsAtJob: e.target.value }))}
                              placeholder="2"
                              data-testid="input-contact-co-borrower-years-at-job"
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
                              data-testid="input-contact-co-borrower-monthly-debts"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Assets/Savings</label>
                            <Input
                              type="number"
                              value={coBorrowerData.assets}
                              onChange={(e) => setCoBorrowerData(prev => ({ ...prev, assets: e.target.value }))}
                              placeholder="$50,000"
                              data-testid="input-contact-co-borrower-assets"
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
                    data-testid="button-submit-contact-pre-approval"
                    disabled={preApprovalSubmitting}
                  >
                    {preApprovalSubmitting ? 'Submitting...' : 'Submit Pre-Approval Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Call Modal */}
        {showScheduleCall && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto" data-testid="card-schedule-call">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold font-serif" data-testid="text-schedule-call-title">
                      Schedule Call
                    </h2>
                    {scheduleCallSubmitted && (
                      <span className="text-green-600 font-medium text-sm bg-green-50 px-2 py-1 rounded" data-testid="status-schedule-call-submitted">
                        Request Submitted
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-close-schedule-call"
                    onClick={() => setShowScheduleCall(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form className="space-y-4" onSubmit={submitScheduleCall} noValidate>
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      type="text"
                      value={scheduleCallData.name}
                      onChange={(e) => setScheduleCallData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      data-testid="input-schedule-call-name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={scheduleCallData.email}
                      onChange={(e) => setScheduleCallData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      data-testid="input-schedule-call-email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      value={scheduleCallData.phone}
                      onChange={(e) => handleScheduleCallPhoneChange(e.target.value)}
                      placeholder="(xxx) xxx-xxxx"
                      data-testid="input-schedule-call-phone"
                      required
                      maxLength={14}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Date</label>
                    <Input
                      type="date"
                      value={scheduleCallData.preferredDate}
                      onChange={(e) => setScheduleCallData(prev => ({ ...prev, preferredDate: e.target.value }))}
                      data-testid="input-schedule-call-date"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Time</label>
                    <Select value={scheduleCallData.preferredTime} onValueChange={(value) => setScheduleCallData(prev => ({ ...prev, preferredTime: value }))}>
                      <SelectTrigger data-testid="select-schedule-call-time">
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Time Zone</label>
                    <Select value={scheduleCallData.timeZone} onValueChange={(value) => setScheduleCallData(prev => ({ ...prev, timeZone: value }))}>
                      <SelectTrigger data-testid="select-schedule-call-timezone">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EST">Eastern (EST)</SelectItem>
                        <SelectItem value="CST">Central (CST)</SelectItem>
                        <SelectItem value="MST">Mountain (MST)</SelectItem>
                        <SelectItem value="PST">Pacific (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reason for Call</label>
                    <Select value={scheduleCallData.callReason} onValueChange={(value) => setScheduleCallData(prev => ({ ...prev, callReason: value }))}>
                      <SelectTrigger data-testid="select-schedule-call-reason">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre-approval">Pre-Approval Discussion</SelectItem>
                        <SelectItem value="rates">Rate Information</SelectItem>
                        <SelectItem value="loan-programs">Loan Programs</SelectItem>
                        <SelectItem value="refinance">Refinancing Options</SelectItem>
                        <SelectItem value="general">General Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                    <Textarea
                      value={scheduleCallData.message}
                      onChange={(e) => setScheduleCallData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Any specific topics you'd like to discuss..."
                      rows={4}
                      data-testid="textarea-schedule-call-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    data-testid="button-submit-schedule-call"
                    disabled={scheduleCallSubmitting}
                  >
                    {scheduleCallSubmitting ? 'Scheduling...' : 'Schedule Call'}
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