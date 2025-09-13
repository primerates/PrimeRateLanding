import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Phone, X } from 'lucide-react';
import heroImage from '@assets/generated_images/Bright_white_family_room_4f4419e6.png';

export default function HeroSection() {
  const [loanAmount, setLoanAmount] = useState('400000');
  const [downPayment, setDownPayment] = useState('80000');
  const [interestRate, setInterestRate] = useState('6.5');
  const [loanTerm, setLoanTerm] = useState('30');
  const [showCalculator, setShowCalculator] = useState(false);

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

      <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Hero Content */}
        <div className="text-white">
          <div className="mb-6">
            <h1 className="text-4xl lg:text-6xl font-bold font-serif mb-4" data-testid="text-hero-title">
              Prime Rate Home Loans
            </h1>
            <p className="text-xl lg:text-2xl mb-2" data-testid="text-hero-subtitle">
              Prime Rates . Lower Payments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              size="lg" 
              variant="default"
              className="bg-primary hover-elevate"
              data-testid="button-get-preapproved"
              onClick={() => console.log('Get Pre-Approved clicked')}
            >
              Get Pre-Approved Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white bg-white/10 backdrop-blur-sm hover-elevate"
              data-testid="button-call-now"
              onClick={() => console.log('Call Now clicked')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call (555) 123-LOAN
            </Button>
          </div>

          {/* Calculator Toggle Button */}
          {!showCalculator && (
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white bg-white/10 backdrop-blur-sm hover-elevate"
              data-testid="button-show-calculator"
              onClick={() => setShowCalculator(true)}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Open Mortgage Calculator
            </Button>
          )}
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
      </div>
    </section>
  );
}