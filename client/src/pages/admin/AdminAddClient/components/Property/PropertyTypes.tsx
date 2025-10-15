import { CardContent } from '@/components/ui/card';
import PropertyCheckbox from './PropertyCheckbox';

type PropertyType = 'primary' | 'second-home' | 'investment' | 'home-purchase';

interface PropertyTypesProps {
  hasPropertyType: (type: PropertyType) => boolean;
  handlePropertyTypeChange: (checked: boolean, type: PropertyType) => void;
  primaryResidenceCards?: string[];
  secondHomeCards?: string[];
  investmentCards?: string[];
}

const PropertyTypes = ({
  hasPropertyType,
  handlePropertyTypeChange,
  primaryResidenceCards = [],
  secondHomeCards = [],
  investmentCards = []
}: PropertyTypesProps) => {
  return (
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PropertyCheckbox
            id="property-type-primary"
            label="Primary Residence"
            checked={hasPropertyType('primary') || primaryResidenceCards.length > 0}
            onCheckedChange={(checked) => handlePropertyTypeChange(checked, 'primary')}
            testId="checkbox-property-primary"
          />

          <PropertyCheckbox
            id="property-type-second-home"
            label="Second Home"
            checked={hasPropertyType('second-home') || secondHomeCards.length > 0}
            onCheckedChange={(checked) => handlePropertyTypeChange(checked, 'second-home')}
            testId="checkbox-property-second-home"
          />

          <PropertyCheckbox
            id="property-type-investment"
            label="Investment Property"
            checked={hasPropertyType('investment') || investmentCards.length > 0}
            onCheckedChange={(checked) => handlePropertyTypeChange(checked, 'investment')}
            testId="checkbox-property-investment"
          />

          <PropertyCheckbox
            id="property-type-home-purchase"
            label="Home Purchase"
            checked={hasPropertyType('home-purchase')}
            onCheckedChange={(checked) => handlePropertyTypeChange(checked, 'home-purchase')}
            testId="checkbox-property-home-purchase"
          />
        </div>
      </div>
    </CardContent>
  );
};

export default PropertyTypes;