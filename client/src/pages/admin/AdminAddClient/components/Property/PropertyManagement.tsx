import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import PropertyTypes from './PropertyTypes';

type PropertyType = 'primary' | 'second-home' | 'investment' | 'home-purchase';

interface PropertyManagementProps {
  hasPropertyType: (type: PropertyType) => boolean;
  handlePropertyTypeChange: (checked: boolean, type: PropertyType) => void;
  setPropertyCardStates: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  primaryResidenceCards?: string[];
  secondHomeCards?: string[];
  investmentCards?: string[];
}

const PropertyManagement = ({
  hasPropertyType,
  handlePropertyTypeChange,
  setPropertyCardStates,
  primaryResidenceCards = [],
  secondHomeCards = [],
  investmentCards = []
}: PropertyManagementProps) => {
  const form = useFormContext<InsertClient>();

  const handleExpandAll = () => {
    const updates: Record<string, boolean> = {};
    
    // Get all properties
    const allProperties = form.watch('property.properties') || [];
    
    // Update all property cards that are checked/active
    allProperties.forEach(property => {
      const propertyId = property.id || `property-${property.use}`;
      // Only expand if the property type is checked
      if (property.use === 'home-purchase' && hasPropertyType('home-purchase')) {
        updates[propertyId] = true;
      } else if (property.use === 'primary' && (hasPropertyType('primary') || primaryResidenceCards.length > 0)) {
        updates[propertyId] = true;
      } else if (property.use === 'second-home' && (hasPropertyType('second-home') || secondHomeCards.length > 0)) {
        updates[propertyId] = true;
      } else if (property.use === 'investment' && (hasPropertyType('investment') || investmentCards.length > 0)) {
        updates[propertyId] = true;
      }
    });
    
    setPropertyCardStates(prev => ({ ...prev, ...updates }));
  };

  const handleMinimizeAll = () => {
    const updates: Record<string, boolean> = {};
    
    // Get all properties
    const allProperties = form.watch('property.properties') || [];
    
    // Update all property cards that are checked/active
    allProperties.forEach(property => {
      const propertyId = property.id || `property-${property.use}`;
      // Only minimize if the property type is checked
      if (property.use === 'home-purchase' && hasPropertyType('home-purchase')) {
        updates[propertyId] = false;
      } else if (property.use === 'primary' && (hasPropertyType('primary') || primaryResidenceCards.length > 0)) {
        updates[propertyId] = false;
      } else if (property.use === 'second-home' && (hasPropertyType('second-home') || secondHomeCards.length > 0)) {
        updates[propertyId] = false;
      } else if (property.use === 'investment' && (hasPropertyType('investment') || investmentCards.length > 0)) {
        updates[propertyId] = false;
      }
    });
    
    setPropertyCardStates(prev => ({ ...prev, ...updates }));
  };

  return (
    <Card className="transition-all duration-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Properties</CardTitle>
          <div className="flex items-center gap-2">
            {/* Expand All Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleExpandAll}
              className="hover:bg-blue-500 hover:text-white"
              title="Expand All Property Tiles"
              data-testid="button-expand-all-properties"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {/* Minimize All Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMinimizeAll}
              className="hover:bg-orange-500 hover:text-white"
              title="Minimize All Property Tiles"
              data-testid="button-minimize-all-properties"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <PropertyTypes
        hasPropertyType={hasPropertyType}
        handlePropertyTypeChange={handlePropertyTypeChange}
        primaryResidenceCards={primaryResidenceCards}
        secondHomeCards={secondHomeCards}
        investmentCards={investmentCards}
      />
    </Card>
  );
};

export default PropertyManagement;