import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';

// Shared field options constants
export const INCOME_SOURCE_OPTIONS = [
  { value: "employment", label: "Employment" },
  { value: "self-employment", label: "Self-Employment" },
  { value: "retirement", label: "Retirement" },
  { value: "multiple-sources", label: "Multiple Sources" },
  { value: "other", label: "Other" }
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: "single-family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhome", label: "Townhome" },
  { value: "duplex", label: "Duplex" },
  { value: "multi-family", label: "Multi-Family" },
  { value: "other", label: "Other" }
];

export const LOAN_PURPOSE_OPTIONS = [
  { value: "purchase", label: "Purchase" },
  { value: "refinance-reduce-rate", label: "Refinance - Reduce Rate" },
  { value: "refinance-cash-out", label: "Refinance - Cash Out" },
  { value: "refinance-pay-off-2nd", label: "Refinance - Pay Off 2nd Loan" },
  { value: "other", label: "Other" }
];

export const STATES_OPTIONS = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" }
];

// Default state shapes
export const DEFAULT_PRE_APPROVAL_DATA = {
  fullName: '',
  email: '',
  phone: '',
  streetAddress: '',
  unitApt: '',
  city: '',
  state: '',
  zipCode: '',
  incomeSource: '',
  grossAnnualIncome: '',
  loanPurpose: '',
  propertyType: '',
  desiredCashAmount: '',
  desiredLoanAmount: '',
  downPayment: '',
  estimatedPropertyValue: '',
  firstTimeBuyer: '',
  timelineToPurchase: '',
  appraisalCompleted: '',
  additionalInfo: '',
  addCoBorrower: 'no'
};

export const DEFAULT_CO_BORROWER_DATA = {
  fullName: '',
  email: '',
  phone: '',
  streetAddress: '',
  unitApt: '',
  city: '',
  state: '',
  zipCode: '',
  sameAsBorrower: false,
  incomeSource: '',
  grossAnnualIncome: ''
};

interface PreApprovalFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultValues?: Partial<typeof DEFAULT_PRE_APPROVAL_DATA>;
  compactMode?: boolean;
  contextLabel?: string;
}

export default function PreApprovalForm({
  onSuccess,
  onCancel,
  defaultValues = {},
  compactMode = false,
  contextLabel = 'default'
}: PreApprovalFormProps) {
  const [preApprovalData, setPreApprovalData] = useState({
    ...DEFAULT_PRE_APPROVAL_DATA,
    ...defaultValues
  });
  
  const [coBorrowerData, setCoBorrowerData] = useState(DEFAULT_CO_BORROWER_DATA);
  const [preApprovalSubmitting, setPreApprovalSubmitting] = useState(false);
  const [preApprovalErrors, setPreApprovalErrors] = useState<{[key: string]: boolean}>({});
  const [coBorrowerErrors, setCoBorrowerErrors] = useState<{[key: string]: boolean}>({});

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

  const handleSameAsBorrowerChange = (checked: boolean) => {
    setCoBorrowerData(prev => {
      if (checked) {
        return {
          ...prev,
          sameAsBorrower: true,
          streetAddress: preApprovalData.streetAddress,
          unitApt: preApprovalData.unitApt,
          city: preApprovalData.city,
          state: preApprovalData.state,
          zipCode: preApprovalData.zipCode
        };
      } else {
        return {
          ...prev,
          sameAsBorrower: false,
          streetAddress: '',
          unitApt: '',
          city: '',
          state: '',
          zipCode: ''
        };
      }
    });
  };

  const validatePreApproval = () => {
    const errors: {[key: string]: boolean} = {};
    
    // Base required fields (excluding conditional ones)
    const required = ['fullName', 'email', 'phone', 'streetAddress', 'city', 'state', 'zipCode',
                     'incomeSource', 'grossAnnualIncome', 'loanPurpose', 'propertyType', 
                     'desiredLoanAmount', 'estimatedPropertyValue'];
    
    required.forEach(field => {
      if (!preApprovalData[field as keyof typeof preApprovalData]?.trim()) {
        errors[field] = true;
      }
    });

    // Conditional validation based on loan purpose
    if (preApprovalData.loanPurpose === 'purchase') {
      // Down payment is only required for purchase
      if (!preApprovalData.downPayment?.trim()) {
        errors.downPayment = true;
      }
      if (!preApprovalData.firstTimeBuyer?.trim()) {
        errors.firstTimeBuyer = true;
      }
      if (!preApprovalData.timelineToPurchase?.trim()) {
        errors.timelineToPurchase = true;
      }
    }

    if (preApprovalData.loanPurpose === 'refinance-cash-out') {
      // Desired cash amount is only required for cash-out refinance
      if (!preApprovalData.desiredCashAmount?.trim()) {
        errors.desiredCashAmount = true;
      }
    }

    if (preApprovalData.loanPurpose?.startsWith('refinance')) {
      if (!preApprovalData.appraisalCompleted?.trim()) {
        errors.appraisalCompleted = true;
      }
    }

    // Co-borrower validation
    let coBorrowerRequired: string[] = [];
    if (preApprovalData.addCoBorrower === 'yes') {
      coBorrowerRequired = ['fullName', 'email', 'phone', 'incomeSource', 'grossAnnualIncome'];
      if (!coBorrowerData.sameAsBorrower) {
        coBorrowerRequired.push('streetAddress', 'city', 'state', 'zipCode');
      }
    }

    const coBorrowerErr: {[key: string]: boolean} = {};
    coBorrowerRequired.forEach(field => {
      if (!coBorrowerData[field as keyof typeof coBorrowerData]?.trim()) {
        coBorrowerErr[field] = true;
      }
    });

    setPreApprovalErrors(errors);
    setCoBorrowerErrors(coBorrowerErr);
    
    return Object.keys(errors).length === 0 && Object.keys(coBorrowerErr).length === 0;
  };

  const submitPreApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePreApproval()) {
      return;
    }

    try {
      setPreApprovalSubmitting(true);
      const payload = {
        preApprovalData: preApprovalData,
        ...(preApprovalData.addCoBorrower === 'yes' ? { coBorrowerData: coBorrowerData } : {})
      };

      const response = await fetch('/api/pre-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit pre-approval');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting pre-approval:', error);
      alert('There was an error submitting your pre-approval. Please try again.');
    } finally {
      setPreApprovalSubmitting(false);
    }
  };

  // Helper function to get error styling for inputs
  const getInputClassName = (fieldName: string, isSelect = false) => {
    const hasError = preApprovalErrors[fieldName];
    const baseClass = isSelect ? "" : "";
    return hasError ? `${baseClass} border-red-500 border-2` : baseClass;
  };

  // Helper function to get error styling for co-borrower inputs
  const getCoBorrowerInputClassName = (fieldName: string, isSelect = false) => {
    const hasError = coBorrowerErrors[fieldName];
    const baseClass = isSelect ? "" : "";
    return hasError ? `${baseClass} border-red-500 border-2` : baseClass;
  };

  const testIdPrefix = contextLabel === 'hero' ? 'hero-' : 'contact-';

  return (
    <form className={`space-y-6 ${compactMode ? 'p-4' : 'p-6'}`} onSubmit={submitPreApproval} noValidate>
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
              data-testid={`input-${testIdPrefix}full-name`}
              className={getInputClassName('fullName')}
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
              data-testid={`input-${testIdPrefix}email`}
              className={getInputClassName('email')}
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
              data-testid={`input-${testIdPrefix}phone`}
              className={getInputClassName('phone')}
              required
              maxLength={14}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Street Address</label>
            <Input
              type="text"
              value={preApprovalData.streetAddress}
              onChange={(e) => setPreApprovalData(prev => ({ ...prev, streetAddress: e.target.value }))}
              placeholder="Enter street address"
              data-testid={`input-${testIdPrefix}street-address`}
              className={getInputClassName('streetAddress')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Unit/Apt</label>
            <Input
              type="text"
              value={preApprovalData.unitApt}
              onChange={(e) => setPreApprovalData(prev => ({ ...prev, unitApt: e.target.value }))}
              placeholder="Unit or apartment number"
              data-testid={`input-${testIdPrefix}unit-apt`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <Input
              type="text"
              value={preApprovalData.city}
              onChange={(e) => setPreApprovalData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Enter city"
              data-testid={`input-${testIdPrefix}city`}
              className={getInputClassName('city')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">State</label>
            <Select value={preApprovalData.state} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, state: value }))}>
              <SelectTrigger data-testid={`select-${testIdPrefix}state`} className={getInputClassName('state', true)}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {STATES_OPTIONS.map(state => (
                  <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Zip Code</label>
            <Input
              type="text"
              value={preApprovalData.zipCode}
              onChange={(e) => setPreApprovalData(prev => ({ ...prev, zipCode: e.target.value }))}
              placeholder="Enter zip code"
              data-testid={`input-${testIdPrefix}zip-code`}
              className={getInputClassName('zipCode')}
              required
            />
          </div>
        </div>
      </div>

      {/* Borrower Income */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Borrower Income</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Income Source</label>
            <Select value={preApprovalData.incomeSource} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, incomeSource: value }))}>
              <SelectTrigger data-testid={`select-${testIdPrefix}income-source`} className={getInputClassName('incomeSource', true)}>
                <SelectValue placeholder="Select income source" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_SOURCE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gross Annual Income</label>
            <Input
              type="number"
              value={preApprovalData.grossAnnualIncome}
              onChange={(e) => setPreApprovalData(prev => ({ ...prev, grossAnnualIncome: e.target.value }))}
              placeholder="$75,000"
              data-testid={`input-${testIdPrefix}gross-annual-income`}
              className={getInputClassName('grossAnnualIncome')}
              required
            />
          </div>
        </div>
      </div>

      {/* Loan Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Loan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loan Purpose</label>
            <Select value={preApprovalData.loanPurpose} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, loanPurpose: value }))}>
              <SelectTrigger data-testid={`select-${testIdPrefix}loan-purpose`} className={getInputClassName('loanPurpose', true)}>
                <SelectValue placeholder="Select loan purpose" />
              </SelectTrigger>
              <SelectContent>
                {LOAN_PURPOSE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Property Type</label>
            <Select value={preApprovalData.propertyType} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, propertyType: value }))}>
              <SelectTrigger data-testid={`select-${testIdPrefix}property-type`} className={getInputClassName('propertyType', true)}>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Desired Loan Amount</label>
            <Input
              type="number"
              value={preApprovalData.desiredLoanAmount}
              onChange={(e) => setPreApprovalData(prev => ({ ...prev, desiredLoanAmount: e.target.value }))}
              placeholder="$400,000"
              data-testid={`input-${testIdPrefix}loan-amount`}
              className={getInputClassName('desiredLoanAmount')}
              required
            />
          </div>

          {/* Conditional Down Payment Field - only show for purchase */}
          {preApprovalData.loanPurpose === 'purchase' && (
            <div>
              <label className="block text-sm font-medium mb-2">Down Payment</label>
              <Input
                type="number"
                value={preApprovalData.downPayment}
                onChange={(e) => setPreApprovalData(prev => ({ ...prev, downPayment: e.target.value }))}
                placeholder="$80,000"
                data-testid={`input-${testIdPrefix}down-payment`}
                className={getInputClassName('downPayment')}
                required
              />
            </div>
          )}

          {/* Conditional Desired Cash Amount Field - only show for cash-out refinance */}
          {preApprovalData.loanPurpose === 'refinance-cash-out' && (
            <div>
              <label className="block text-sm font-medium mb-2">Desired Cash Amount</label>
              <Input
                type="number"
                value={preApprovalData.desiredCashAmount}
                onChange={(e) => setPreApprovalData(prev => ({ ...prev, desiredCashAmount: e.target.value }))}
                placeholder="$50,000"
                data-testid={`input-${testIdPrefix}desired-cash-amount`}
                className={getInputClassName('desiredCashAmount')}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Estimated Property Value</label>
            <Input
              type="number"
              value={preApprovalData.estimatedPropertyValue}
              onChange={(e) => setPreApprovalData(prev => ({ ...prev, estimatedPropertyValue: e.target.value }))}
              placeholder="$480,000"
              data-testid={`input-${testIdPrefix}estimated-property-value`}
              className={getInputClassName('estimatedPropertyValue')}
              required
            />
          </div>
        </div>

        {/* Conditional fields for Purchase */}
        {preApprovalData.loanPurpose === 'purchase' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Time Home Buyer?</label>
              <Select value={preApprovalData.firstTimeBuyer} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, firstTimeBuyer: value }))}>
                <SelectTrigger data-testid={`select-${testIdPrefix}first-time-buyer`} className={getInputClassName('firstTimeBuyer', true)}>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Timeline to Purchase</label>
              <Select value={preApprovalData.timelineToPurchase} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, timelineToPurchase: value }))}>
                <SelectTrigger data-testid={`select-${testIdPrefix}timeline-purchase`} className={getInputClassName('timelineToPurchase', true)}>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="within-7-days">Within 7 days</SelectItem>
                  <SelectItem value="2-weeks">2 weeks</SelectItem>
                  <SelectItem value="30-days">30 days</SelectItem>
                  <SelectItem value="3-months">3 months</SelectItem>
                  <SelectItem value="6-months">6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Conditional field for Refinance */}
        {preApprovalData.loanPurpose?.startsWith('refinance') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Have you completed an appraisal?</label>
              <Select value={preApprovalData.appraisalCompleted} onValueChange={(value) => setPreApprovalData(prev => ({ ...prev, appraisalCompleted: value }))}>
                <SelectTrigger data-testid={`select-${testIdPrefix}appraisal-completed`} className={getInputClassName('appraisalCompleted', true)}>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Additional Information / How did you hear from us</label>
        <Textarea
          value={preApprovalData.additionalInfo}
          onChange={(e) => setPreApprovalData(prev => ({ ...prev, additionalInfo: e.target.value }))}
          placeholder="Tell us anything else that might be relevant to your pre-approval..."
          rows={4}
          data-testid={`textarea-${testIdPrefix}additional-info`}
        />
      </div>

      {/* Add Co-Borrower Option */}
      <div>
        <label className="block text-sm font-medium mb-4">Add a Spouse or Co-Borrower?</label>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="radio"
              name={`addCoBorrower-${contextLabel}`}
              value="yes"
              checked={preApprovalData.addCoBorrower === 'yes'}
              onChange={(e) => setPreApprovalData(prev => ({ ...prev, addCoBorrower: e.target.value }))}
              className="mr-2"
              data-testid={`radio-${testIdPrefix}co-borrower-yes`}
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={`addCoBorrower-${contextLabel}`}
              value="no"
              checked={preApprovalData.addCoBorrower === 'no'}
              onChange={(e) => setPreApprovalData(prev => ({ ...prev, addCoBorrower: e.target.value }))}
              className="mr-2"
              data-testid={`radio-${testIdPrefix}co-borrower-no`}
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
                  data-testid={`input-${testIdPrefix}co-borrower-name`}
                  className={getCoBorrowerInputClassName('fullName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={coBorrowerData.email}
                  onChange={(e) => setCoBorrowerData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter co-borrower's email"
                  data-testid={`input-${testIdPrefix}co-borrower-email`}
                  className={getCoBorrowerInputClassName('email')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  value={coBorrowerData.phone}
                  onChange={(e) => handleCoBorrowerPhoneChange(e.target.value)}
                  placeholder="(xxx) xxx-xxxx"
                  data-testid={`input-${testIdPrefix}co-borrower-phone`}
                  className={getCoBorrowerInputClassName('phone')}
                  maxLength={14}
                />
              </div>
            </div>

            {/* Co-borrower Address Section */}
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-3">Address Information</h4>
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={coBorrowerData.sameAsBorrower}
                    onChange={(e) => handleSameAsBorrowerChange(e.target.checked)}
                    className="mr-2"
                    data-testid={`checkbox-${testIdPrefix}same-as-borrower`}
                  />
                  Same as Borrower
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Street Address</label>
                  <Input
                    type="text"
                    value={coBorrowerData.streetAddress}
                    onChange={(e) => setCoBorrowerData(prev => ({ ...prev, streetAddress: e.target.value }))}
                    placeholder="Enter street address"
                    data-testid={`input-${testIdPrefix}co-borrower-street-address`}
                    className={getCoBorrowerInputClassName('streetAddress')}
                    disabled={coBorrowerData.sameAsBorrower}
                    required={!coBorrowerData.sameAsBorrower}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Unit/Apt</label>
                  <Input
                    type="text"
                    value={coBorrowerData.unitApt}
                    onChange={(e) => setCoBorrowerData(prev => ({ ...prev, unitApt: e.target.value }))}
                    placeholder="Unit or apartment number"
                    data-testid={`input-${testIdPrefix}co-borrower-unit-apt`}
                    disabled={coBorrowerData.sameAsBorrower}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    type="text"
                    value={coBorrowerData.city}
                    onChange={(e) => setCoBorrowerData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                    data-testid={`input-${testIdPrefix}co-borrower-city`}
                    className={getCoBorrowerInputClassName('city')}
                    disabled={coBorrowerData.sameAsBorrower}
                    required={!coBorrowerData.sameAsBorrower}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <Select 
                    value={coBorrowerData.state} 
                    onValueChange={(value) => setCoBorrowerData(prev => ({ ...prev, state: value }))}
                    disabled={coBorrowerData.sameAsBorrower}
                  >
                    <SelectTrigger data-testid={`select-${testIdPrefix}co-borrower-state`} className={getCoBorrowerInputClassName('state', true)}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES_OPTIONS.map(state => (
                        <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Zip Code</label>
                  <Input
                    type="text"
                    value={coBorrowerData.zipCode}
                    onChange={(e) => setCoBorrowerData(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="Enter zip code"
                    data-testid={`input-${testIdPrefix}co-borrower-zip-code`}
                    className={getCoBorrowerInputClassName('zipCode')}
                    disabled={coBorrowerData.sameAsBorrower}
                    required={!coBorrowerData.sameAsBorrower}
                  />
                </div>
              </div>
            </div>

            {/* Co-Borrower Income */}
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-4 text-primary">Co-Borrower Income</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Income Source</label>
                  <Select value={coBorrowerData.incomeSource} onValueChange={(value) => setCoBorrowerData(prev => ({ ...prev, incomeSource: value }))}>
                    <SelectTrigger data-testid={`select-${testIdPrefix}co-borrower-income-source`} className={getCoBorrowerInputClassName('incomeSource', true)}>
                      <SelectValue placeholder="Select income source" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_SOURCE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gross Annual Income</label>
                  <Input
                    type="number"
                    value={coBorrowerData.grossAnnualIncome}
                    onChange={(e) => setCoBorrowerData(prev => ({ ...prev, grossAnnualIncome: e.target.value }))}
                    placeholder="$75,000"
                    data-testid={`input-${testIdPrefix}co-borrower-gross-annual-income`}
                    className={getCoBorrowerInputClassName('grossAnnualIncome')}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full relative overflow-hidden" 
        size="lg"
        data-testid={`button-submit-${testIdPrefix}pre-approval`}
        disabled={preApprovalSubmitting}
      >
        <Send className="w-4 h-4 mr-2" />
        {preApprovalSubmitting ? 'Submitting...' : 'Submit Pre-Approval Request'}
      </Button>

    </form>
  );
}