import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import PropertyHeader from '../components/PropertyHeader';
import PropertyManagement from '../components/PropertyManagement';
import PropertyForm from '../components/PropertyForm';
import DeleteConfirmationDialog from '../dialogs/DeleteConfirmationDialog';
import ChangeSubjectPropertyDialog from '../dialogs/ChangeSubjectPropertyDialog';

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
    const [deletePropertyDialog, setDeletePropertyDialog] = useState<{
        isOpen: boolean;
        propertyIndex?: number;
        propertyTitle?: string;
    }>({ isOpen: false });
    
    const [subjectConfirmDialog, setSubjectConfirmDialog] = useState<{
        isOpen: boolean;
        newSubjectPropertyIndex: number | null;
    }>({ isOpen: false, newSubjectPropertyIndex: null });

    // Check if a property type exists in form data
    const hasPropertyType = (type: 'primary' | 'second-home' | 'investment' | 'home-purchase'): boolean => {
        const currentProperties = form.watch('property.properties') || [];
        return currentProperties.some(property => property.use === type);
    };

    // Handle property type checkbox changes
    const handlePropertyTypeChange = (checked: boolean, type: 'primary' | 'second-home' | 'investment' | 'home-purchase') => {
        if (!checked) {
            // Prevent unchecking - checkboxes can only be unchecked by removing properties via the remove button
            return;
        } else {
            // Add a new property of this type only if it doesn't already exist
            const currentProperties = form.watch('property.properties') || [];
            const hasExistingProperty = currentProperties.some(p => p.use === type);
            
            if (!hasExistingProperty) {
                const newProperty = {
                    id: `property-${type}-${Date.now()}`,
                    use: type,
                    propertyType: '',
                    isSubject: false
                };
                form.setValue('property.properties', [...currentProperties, newProperty]);
            }
        }
    };

    // Handle property deletion with confirmation
    const handleDeleteProperty = (index: number, propertyTitle: string) => {
        setDeletePropertyDialog({
            isOpen: true,
            propertyIndex: index,
            propertyTitle
        });
    };

    const confirmDeleteProperty = () => {
        if (deletePropertyDialog.propertyIndex !== undefined) {
            const currentProperties = form.watch('property.properties') || [];
            const filteredProperties = currentProperties.filter((_, i) => i !== deletePropertyDialog.propertyIndex);
            form.setValue('property.properties', filteredProperties);
            
            // Also remove from card states
            const propertyId = currentProperties[deletePropertyDialog.propertyIndex]?.id || 
                              `property-${currentProperties[deletePropertyDialog.propertyIndex]?.use}-${deletePropertyDialog.propertyIndex}`;
            setPropertyCardStates(prev => {
                const newState = { ...prev };
                delete newState[propertyId];
                return newState;
            });
        }
        setDeletePropertyDialog({ isOpen: false });
    };

    // Handle subject property setting with confirmation
    const setSubjectProperty = (propertyIndex: number) => {
        const currentProperties = form.watch('property.properties') || [];
        
        // Check if another property is already selected as subject
        const currentSubjectPropertyIndex = currentProperties.findIndex(property => property.isSubject === true);
        
        if (currentSubjectPropertyIndex !== -1 && currentSubjectPropertyIndex !== propertyIndex) {
            // Show confirmation dialog
            setSubjectConfirmDialog({
                isOpen: true,
                newSubjectPropertyIndex: propertyIndex
            });
            return;
        }
        
        // No existing subject property or same property selected, proceed with change
        const updatedProperties = currentProperties.map((property, index) => ({
            ...property,
            isSubject: index === propertyIndex,
        }));
        form.setValue('property.properties', updatedProperties);
    };

    // Handle subject property confirmation
    const handleSubjectPropertyConfirmation = (confirmed: boolean) => {
        if (confirmed && subjectConfirmDialog.newSubjectPropertyIndex !== null) {
            const currentProperties = form.watch('property.properties') || [];
            const updatedProperties = currentProperties.map((property, index) => ({
                ...property,
                isSubject: index === subjectConfirmDialog.newSubjectPropertyIndex,
            }));
            form.setValue('property.properties', updatedProperties);
        }
        // Close dialog
        setSubjectConfirmDialog({ isOpen: false, newSubjectPropertyIndex: null });
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
            
            {/* Property Forms - Show when property types are selected */}
            {(() => {
                const currentProperties = form.watch('property.properties') || [];
                
                // Sort properties to put Home Purchase first, then Primary, Second Home, Investment
                const sortedProperties = [...currentProperties].sort((a, b) => {
                    const order = { 'home-purchase': 0, 'primary': 1, 'second-home': 2, 'investment': 3 };
                    return (order[a.use] ?? 4) - (order[b.use] ?? 4);
                });
                
                return sortedProperties.map((property, index) => {
                    // Find the original index in currentProperties for proper field paths
                    const originalIndex = currentProperties.findIndex(p => p.id === property.id || 
                        (p.use === property.use && JSON.stringify(p) === JSON.stringify(property)));
                    
                    const propertyId = property.id || `property-${property.use}-${index}`;
                    const isOpen = propertyCardStates[propertyId] ?? false;
                    
                    return (
                        <PropertyForm
                            key={propertyId}
                            propertyId={propertyId}
                            propertyIndex={originalIndex}
                            isOpen={isOpen}
                            onOpenChange={(open) => {
                                setPropertyCardStates(prev => ({ ...prev, [propertyId]: open }));
                            }}
                            onDeleteProperty={() => {
                                const propertyTitle = property.use === 'primary' ? 'Primary Residence' : 
                                                    `${property.use ? property.use.charAt(0).toUpperCase() + property.use.slice(1).replace('-', ' ') : 'Unknown'}`;
                                handleDeleteProperty(originalIndex, propertyTitle);
                            }}
                            showAnimation={showPropertyAnimation}
                            getValueComparisonColor={() => ({ shadowColor: 'none' as const })}
                            openValuationDialog={() => {}}
                            handleValuationHover={() => {}}
                            handleValuationHoverLeave={() => {}}
                            openValuationSummary={() => {}}
                            additionalLoans={[]}
                            getDyn={() => undefined}
                            setIsCurrentLoanPreviewOpen={() => {}}
                            setIsCurrentSecondLoanPreviewOpen={() => {}}
                            setIsCurrentThirdLoanPreviewOpen={() => {}}
                            title={property.use === 'primary' ? 'Primary Residence' : 
                                `${property.use ? property.use.charAt(0).toUpperCase() + property.use.slice(1).replace('-', ' ') : 'Unknown'}`}
                            setSubjectProperty={setSubjectProperty}
                        />
                    );
                });
            })()}
            
            <DeleteConfirmationDialog
                isOpen={deletePropertyDialog.isOpen}
                onClose={() => setDeletePropertyDialog({ isOpen: false })}
                onConfirm={confirmDeleteProperty}
                title="Remove Property"
                description={`Are you sure you want to remove the ${deletePropertyDialog.propertyTitle} property? This action cannot be undone and will remove all associated property information.`}
                confirmButtonText="Remove"
                testId="dialog-delete-property"
                confirmButtonTestId="button-confirm-delete-property"
                cancelButtonTestId="button-cancel-delete-property"
            />
            
            <ChangeSubjectPropertyDialog
                isOpen={subjectConfirmDialog.isOpen}
                onClose={() => handleSubjectPropertyConfirmation(false)}
                onConfirm={() => handleSubjectPropertyConfirmation(true)}
            />
        </div>
    );
};

export default PropertyTab;