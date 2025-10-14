import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { type InsertClient } from '@shared/schema';
import CircularMetric from './CircularMetric';

interface PropertyHeaderProps {
  showPropertyAnimation?: boolean;
  newRefinanceLoanCards?: string[];
  newPurchaseLoanCards?: string[];
  primaryResidenceCards?: string[];
  secondHomeCards?: string[];
}

const PropertyHeader = ({
  showPropertyAnimation = false,
  newRefinanceLoanCards = [],
  newPurchaseLoanCards = [],
  primaryResidenceCards = [],
  secondHomeCards = []
}: PropertyHeaderProps) => {
  const form = useFormContext<InsertClient>();

  // Subject Property calculation
  const getSubjectPropertyDisplay = () => {
    const properties = form.watch('property.properties') || [];
    const subjectProperty = properties.find(p => p.isSubject === true);
    
    if (!subjectProperty) {
      return 'TBD';
    }
    
    const propertyType = subjectProperty.propertyType || '';
    
    if (!propertyType || propertyType.trim() === '') {
      return 'TBD';
    }
    
    // Apply mapping rules
    if (propertyType === 'mobile-home-sw') {
      return 'SW';
    } else if (propertyType === 'mobile-home-dw') {
      return 'DW';
    } else if (propertyType === 'other') {
      return 'TBD';
    } else {
      // For other values, display them as-is with proper formatting
      return propertyType
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  };

  // LTV calculation utility
  const calculateLTV = (valueField: 'estimatedValue' | 'appraisedValue') => {
    // Check which new loan card is open
    const hasRefinanceCards = newRefinanceLoanCards.length > 0;
    const hasPurchaseCards = newPurchaseLoanCards.length > 0;
    
    // Get the New Loan Amount from whichever card is open
    let newLoanAmount = '';
    if (hasRefinanceCards) {
      newLoanAmount = form.watch('abc.loanBalance') || '';
    } else if (hasPurchaseCards) {
      newLoanAmount = form.watch('bbb.loanBalance') || '';
    }
    
    // Find the Primary Residence property
    const properties = form.watch('property.properties') || [];
    const primaryResidence = properties.find(p => p.use === 'primary');
    
    // If no primary residence or new loan amount, return default %
    if (!primaryResidence || !newLoanAmount || newLoanAmount.trim() === '') {
      return <span style={{ fontSize: '28px' }}>%</span>;
    }
    
    // Get value from primary residence
    const propertyValue = primaryResidence[valueField] || '';
    
    if (!propertyValue || propertyValue.trim() === '') {
      return <span style={{ fontSize: '28px' }}>%</span>;
    }
    
    // Parse values (handle currency formatting)
    const parseValue = (value: string) => {
      const cleaned = value.replace(/[$,]/g, '');
      return cleaned ? parseFloat(cleaned) : 0;
    };
    
    const loanNum = parseValue(newLoanAmount);
    const valueNum = parseValue(propertyValue);
    
    if (loanNum === 0 || valueNum === 0) {
      return <span style={{ fontSize: '28px' }}>%</span>;
    }
    
    // Calculate LTV percentage
    const ltv = (loanNum / valueNum) * 100;
    return (
      <span>
        {Math.round(ltv)}
        <span style={{ fontSize: '28px' }}>%</span>
      </span>
    );
  };

  // Property count calculation
  const getPropertyCount = () => {
    const primaryCards = primaryResidenceCards.length;
    const secondHomeCardsCount = secondHomeCards.length;
    const formProperties = form.watch('property.properties') || [];
    const investmentCards = formProperties.filter(p => p.use === 'investment').length;
    
    return primaryCards + secondHomeCardsCount + investmentCards;
  };

  return (
    <Card className="transition-all duration-700">
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Subject Property</Label>
          <div className="mt-24">
            <span 
              className="text-muted-foreground" 
              style={{ 
                fontSize: '28px', 
                color: '#1a3373', 
                fontWeight: 'bold' 
              }}
            >
              {getSubjectPropertyDisplay()}
            </span>
          </div>
        </div>
        
        <CircularMetric
          label="Estimated LTV"
          value={calculateLTV('estimatedValue')}
          showAnimation={showPropertyAnimation}
          testId="text-estimated-ltv"
        />
        
        <CircularMetric
          label="Final LTV"
          value={calculateLTV('appraisedValue')}
          showAnimation={showPropertyAnimation}
          testId="text-final-ltv"
        />
        
        <CircularMetric
          label="Property Count"
          value={getPropertyCount()}
          showAnimation={showPropertyAnimation}
          testId="text-property-count"
        />
      </CardContent>
    </Card>
  );
};

export default PropertyHeader;