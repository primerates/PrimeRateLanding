import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    loanType: '',
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

  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4" data-testid="text-contact-title">
            Say Hello & Save More
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-contact-description">
            Contact us today for a personalized consultation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div>
            
            <div className="space-y-6">
              <Card className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2" data-testid="text-phone-title">Call Us</h4>
                      <p className="text-2xl font-bold text-primary" data-testid="text-phone-number">
                        (555) 123-LOAN
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
                      className="w-full"
                      data-testid="button-apply-now-card"
                      onClick={() => console.log('Apply Now clicked')}
                    >
                      Apply Now
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full"
                      data-testid="button-schedule-call-card"
                      onClick={() => console.log('Schedule Call clicked')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Button 
                size="lg" 
                className="w-full"
                data-testid="button-apply-now"
                onClick={() => console.log('Apply Now clicked')}
              >
                Apply Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full"
                data-testid="button-schedule-call"
                onClick={() => console.log('Schedule Call clicked')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Schedule Call
              </Button>
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
      </div>
    </section>
  );
}