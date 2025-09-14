import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Clock, X } from 'lucide-react';

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // todo: remove mock functionality - implement real form submission
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
              <CardTitle className="text-2xl font-serif" data-testid="text-form-title">
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-contact-name"
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
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    data-testid="input-contact-phone"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Loan Type</label>
                  <Select value={formData.loanType} onValueChange={(value) => handleInputChange('loanType', value)}>
                    <SelectTrigger data-testid="select-loan-type">
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
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  data-testid="button-submit-contact"
                >
                  Send Message
                </Button>
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
                  <h2 className="text-2xl font-bold font-serif" data-testid="text-pre-approval-contact-title">
                    Get Pre-Approved
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-close-pre-approval-contact"
                    onClick={() => setShowPreApproval(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); console.log('Pre-Approval submitted:', { preApprovalData, coBorrowerData }); }}>
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
                  >
                    Submit Pre-Approval Application
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
                  <h2 className="text-2xl font-bold font-serif" data-testid="text-schedule-call-title">
                    Schedule Call
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="button-close-schedule-call"
                    onClick={() => setShowScheduleCall(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); console.log('Schedule Call submitted:', scheduleCallData); }}>
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
                  >
                    Schedule Call
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