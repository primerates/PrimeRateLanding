import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import PropertyHeader from '../components/PropertyHeader';
import PropertyManagement from '../components/PropertyManagement';

interface PropertyTabProps {
  showPropertyAnimation?: boolean;
  newRefinanceLoanCards?: string[];
  newPurchaseLoanCards?: string[];
  primaryResidenceCards?: string[];
  secondHomeCards?: string[];
  investmentCards?: string[];
}

const PropertyTab = ({
  showPropertyAnimation = false,
  newRefinanceLoanCards = [],
  newPurchaseLoanCards = [],
  primaryResidenceCards = [],
  secondHomeCards = [],
  investmentCards = []
}: PropertyTabProps) => {
    const form = useFormContext<InsertClient>();
    const [propertyCardStates, setPropertyCardStates] = useState<Record<string, boolean>>({});

    // Check if a property type exists in form data
    const hasPropertyType = (type: 'primary' | 'second-home' | 'investment' | 'home-purchase'): boolean => {
        const currentProperties = form.watch('property.properties') || [];
        return currentProperties.some(property => property.use === type);
    };

    // Handle property type checkbox changes
    const handlePropertyTypeChange = (checked: boolean, type: 'primary' | 'second-home' | 'investment' | 'home-purchase') => {
        if (!checked) {
            // Prevent unchecking if cards already exist for that type
            if (type === 'primary' && primaryResidenceCards.length > 0) return;
            if (type === 'second-home' && secondHomeCards.length > 0) return;  
            if (type === 'investment' && investmentCards.length > 0) return;
            if (type === 'home-purchase' && hasPropertyType('home-purchase')) return;
            
            // Remove properties of this type from form data
            const currentProperties = form.watch('property.properties') || [];
            const filteredProperties = currentProperties.filter(p => p.use !== type);
            form.setValue('property.properties', filteredProperties);
        } else {
            // Add a new property of this type
            const currentProperties = form.watch('property.properties') || [];
            const newProperty = {
                id: `property-${type}-${Date.now()}`,
                use: type,
                propertyType: '',
                isSubject: false
            };
            form.setValue('property.properties', [...currentProperties, newProperty]);
        }
    };

    return (
        <div className="space-y-6">
            <PropertyHeader
                showPropertyAnimation={showPropertyAnimation}
                newRefinanceLoanCards={newRefinanceLoanCards}
                newPurchaseLoanCards={newPurchaseLoanCards}
                primaryResidenceCards={primaryResidenceCards}
                secondHomeCards={secondHomeCards}
            />
            
            <PropertyManagement
                hasPropertyType={hasPropertyType}
                handlePropertyTypeChange={handlePropertyTypeChange}
                setPropertyCardStates={setPropertyCardStates}
                primaryResidenceCards={primaryResidenceCards}
                secondHomeCards={secondHomeCards}
                investmentCards={investmentCards}
            />
            
            <Card>
                <CardHeader>
                    <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Additional property functionality will be implemented here.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default PropertyTab;