import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Clock, X, Send, Check } from 'lucide-react';
import PreApprovalForm from '@/components/PreApprovalForm';

export default function ContactSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Animate both ways - slide down when entering, slide up when leaving
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: '-100px 0px' // Start animation 100px before the section comes into view
      }
    );

    const section = document.getElementById('contact-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    loanType: '',
    message: ''
  });
  
  // Pre-approval form state
  const [showPreApproval, setShowPreApproval] = useState(false);
  const [preApprovalSubmitted, setPreApprovalSubmitted] = useState(false);
  
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
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [scheduleCallSubmitting, setScheduleCallSubmitting] = useState(false);
  const [scheduleCallSubmitted, setScheduleCallSubmitted] = useState(false);

  // Form validation states
  const [contactErrors, setContactErrors] = useState<{[key: string]: boolean}>({});
  const [scheduleCallErrors, setScheduleCallErrors] = useState<{[key: string]: boolean}>({});
  
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

  // Pre-approval form handlers for shared component
  const handlePreApprovalSuccess = () => {
    setPreApprovalSubmitted(true);
  };

  return (
    <section id="contact-section" className="py-16 bg-primary/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 
            className={`text-3xl lg:text-4xl font-bold font-serif mb-4 transition-all duration-1000 ease-out ${
              isVisible 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-12 opacity-0'
            }`}
            data-testid="text-contact-title"
          >
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
                      if (!contactSubmitting && validateContactForm()) {
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
            <Card className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border-t-4 border-primary" data-testid="card-pre-approval-contact">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-2xl font-bold font-serif tracking-tight" data-testid="text-pre-approval-contact-title">
                          Get Pre-Approved
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Start your home financing journey today</p>
                      </div>
                      {preApprovalSubmitted && (
                        <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-sm bg-green-50 px-3 py-1.5 rounded-full border border-green-200" data-testid="status-pre-approval-contact-submitted">
                          <Check className="w-4 h-4" />
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
                </div>

                <div className="p-6 pt-4">
                  <PreApprovalForm
                    onSuccess={handlePreApprovalSuccess}
                    onCancel={() => setShowPreApproval(false)}
                    compactMode={false}
                    contextLabel="contact"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Call Modal */}
        {showScheduleCall && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border-t-4 border-primary" data-testid="card-schedule-call">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="text-2xl font-bold font-serif tracking-tight" data-testid="text-schedule-call-title">
                          Schedule Call
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Book a time to speak with our team</p>
                      </div>
                      {scheduleCallSubmitted && (
                        <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-sm bg-green-50 px-3 py-1.5 rounded-full border border-green-200" data-testid="status-schedule-call-submitted">
                          <Check className="w-4 h-4" />
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
                </div>

                <div className="p-6 pt-4">
                  <form className="space-y-6" onSubmit={submitScheduleCall} noValidate>
                    <div className="bg-muted/40 rounded-lg p-4 space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h3>
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <Input
                          type="text"
                          value={scheduleCallData.name}
                          onChange={(e) => setScheduleCallData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          data-testid="input-schedule-call-name"
                          className="transition-all focus:ring-2 focus:ring-primary/20"
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
                          className="transition-all focus:ring-2 focus:ring-primary/20"
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
                          className="transition-all focus:ring-2 focus:ring-primary/20"
                          required
                          maxLength={14}
                        />
                      </div>
                    </div>

                    <div className="bg-muted/40 rounded-lg p-4 space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Schedule Preferences</h3>
                      <div>
                        <label className="block text-sm font-medium mb-2">Preferred Date</label>
                        <Input
                          type="date"
                          value={scheduleCallData.preferredDate}
                          onChange={(e) => setScheduleCallData(prev => ({ ...prev, preferredDate: e.target.value }))}
                          data-testid="input-schedule-call-date"
                          className="transition-all focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Preferred Time</label>
                        <Select value={scheduleCallData.preferredTime} onValueChange={(value) => setScheduleCallData(prev => ({ ...prev, preferredTime: value }))}>
                          <SelectTrigger data-testid="select-schedule-call-time">
                            <SelectValue placeholder="Select preferred time" />
                          </SelectTrigger>
                          <SelectContent sideOffset={4}>
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
                          <SelectContent sideOffset={4}>
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
                          <SelectContent sideOffset={4}>
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
                          className="transition-all focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
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
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}