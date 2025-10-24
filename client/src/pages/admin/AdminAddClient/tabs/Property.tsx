import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import PropertyHeader from '../components/Property/PropertyHeader';
import PropertyManagement from '../components/Property/PropertyManagement';
import PropertyForm from '../components/Property/PropertyForm';
import DeleteConfirmationDialog from '../dialogs/DeleteConfirmationDialog';
import ChangeSubjectPropertyDialog from '../dialogs/ChangeSubjectPropertyDialog';
import ValuationDialog from '../dialogs/ValuationDialog';
import ValuationSummaryDialog from '../dialogs/ValuationSummaryDialog';

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
    
    // Valuation hover tooltip state
    const [valuationHover, setValuationHover] = useState<{
        isVisible: boolean;
        service: 'zillow' | 'redfin' | 'realtor' | null;
        propertyIndex: number | null;
        value: string;
        position: { x: number; y: number };
    }>({ isVisible: false, service: null, propertyIndex: null, value: '', position: { x: 0, y: 0 } });
    
    // Valuation dialog state
    const [valuationDialog, setValuationDialog] = useState<{
        isOpen: boolean;
        service: 'zillow' | 'redfin' | 'realtor' | null;
        propertyIndex: number | null;
        currentValue: string;
    }>({ isOpen: false, service: null, propertyIndex: null, currentValue: '' });

    // Valuation summary dialog state
    const [valuationSummaryDialog, setValuationSummaryDialog] = useState<{
        isOpen: boolean;
        propertyIndex: number | null;
    }>({ isOpen: false, propertyIndex: null });

    // Check if a property type exists in form data
    const hasPropertyType = (type: 'primary' | 'second-home' | 'investment' | 'home-purchase'): boolean => {
        const currentProperties = form.watch('property.properties') || [];
        return currentProperties.some(property => property.use === type);
    };

    // Auto-copy borrower residence address to primary residence property
    const autoCopyBorrowerAddressToPrimaryProperty = () => {
        const borrowerAddress = form.getValues('borrower.residenceAddress');
        const properties = form.watch('property.properties') || [];
        const primaryPropertyIndex = properties.findIndex(p => p.use === 'primary');
        
        if (primaryPropertyIndex >= 0 && borrowerAddress) {
            form.setValue(`property.properties.${primaryPropertyIndex}.address`, {
                street: borrowerAddress.street || '',
                unit: borrowerAddress.unit || '',
                city: borrowerAddress.city || '',
                state: borrowerAddress.state || '',
                zip: borrowerAddress.zip || '',
                county: borrowerAddress.county || ''
            });
        }
    };

    // Auto-copy co-borrower residence address to co-borrower property
    const autoCopyCoBorrowerAddressToProperty = () => {
        const coBorrowerAddress = form.getValues('coBorrower.residenceAddress');
        const properties = form.watch('property.properties') || [];
        // Find a non-primary property for co-borrower (second home or investment)
        const coBorrowerPropertyIndex = properties.findIndex(p => p.use !== 'primary');
        
        if (coBorrowerPropertyIndex >= 0 && coBorrowerAddress) {
            form.setValue(`property.properties.${coBorrowerPropertyIndex}.address`, {
                street: coBorrowerAddress.street || '',
                unit: coBorrowerAddress.unit || '',
                city: coBorrowerAddress.city || '',
                state: coBorrowerAddress.state || '',
                zip: coBorrowerAddress.zip || '',
                county: coBorrowerAddress.county || ''
            });
        }
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
                    isSubject: false,
                    address: {
                        street: '',
                        unit: '',
                        city: '',
                        state: '',
                        zip: '',
                        county: ''
                    },
                    purchasePrice: '',
                    ownedSince: '',
                    ownedHeldBy: undefined,
                    estimatedValue: '',
                    appraisedValue: ''
                };
                form.setValue('property.properties', [...currentProperties, newProperty]);

                // Auto-expand the newly created property card
                setPropertyCardStates(prev => ({ ...prev, [newProperty.id]: true }));

                // Auto-copy address data when properties are selected
                if (type === 'primary') {
                    setTimeout(() => {
                        const borrowerAddress = form.getValues('borrower.residenceAddress');
                        if (borrowerAddress && (borrowerAddress.street || borrowerAddress.city || borrowerAddress.state)) {
                            autoCopyBorrowerAddressToPrimaryProperty();
                        }
                    }, 100);
                } else if (type === 'second-home' || type === 'investment') {
                    setTimeout(() => {
                        const coBorrowerAddress = form.getValues('coBorrower.residenceAddress');
                        if (coBorrowerAddress && (coBorrowerAddress.street || coBorrowerAddress.city || coBorrowerAddress.state)) {
                            autoCopyCoBorrowerAddressToProperty();
                        }
                    }, 100);
                }
            }
        }
    };

    // Handle adding additional properties (for Second Home and Investment)
    const handleAddProperty = (type: 'primary' | 'second-home' | 'investment' | 'home-purchase') => {
        const MAX_SECOND_HOME = 3;
        const MAX_INVESTMENT = 6;

        const currentProperties = form.watch('property.properties') || [];
        const propertiesOfType = currentProperties.filter(p => p.use === type);

        // Enforce max limits
        if (type === 'second-home' && propertiesOfType.length >= MAX_SECOND_HOME) {
            return; // Max second homes reached
        }
        if (type === 'investment' && propertiesOfType.length >= MAX_INVESTMENT) {
            return; // Max investment properties reached
        }

        // Create new property
        const newProperty = {
            id: `property-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            use: type,
            propertyType: '',
            isSubject: false,
            address: {
                street: '',
                unit: '',
                city: '',
                state: '',
                zip: '',
                county: ''
            },
            purchasePrice: '',
            ownedSince: '',
            ownedHeldBy: undefined,
            estimatedValue: '',
            appraisedValue: ''
        };

        form.setValue('property.properties', [...currentProperties, newProperty]);

        // Auto-expand the newly created property card
        setPropertyCardStates(prev => ({ ...prev, [newProperty.id]: true }));

        // Auto-copy address data for second-home or investment
        if (type === 'second-home' || type === 'investment') {
            setTimeout(() => {
                const coBorrowerAddress = form.getValues('coBorrower.residenceAddress');
                if (coBorrowerAddress && (coBorrowerAddress.street || coBorrowerAddress.city || coBorrowerAddress.state)) {
                    autoCopyCoBorrowerAddressToProperty();
                }
            }, 100);
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

    // Valuation hover handlers
    const handleValuationHover = (service: string, propertyIndex: number, event: React.MouseEvent) => {
        if (service !== 'zillow' && service !== 'redfin' && service !== 'realtor') return;
        const savedValue = form.watch(`property.properties.${propertyIndex}.valuations.${service}`) || '';
        const rect = event.currentTarget.getBoundingClientRect();
        // Position tooltip well above the button to avoid mouse interference
        const tooltipHeight = 150;
        const extraSpacing = 100; // Increased spacing to prevent flickering
        setValuationHover({
            isVisible: true,
            service: service as 'zillow' | 'redfin' | 'realtor',
            propertyIndex,
            value: savedValue,
            position: { 
                x: rect.left + window.scrollX - 50, // Offset slightly left to avoid cursor
                y: rect.top + window.scrollY - tooltipHeight - extraSpacing 
            }
        });
    };

    const handleValuationHoverLeave = () => {
        setValuationHover({ isVisible: false, service: null, propertyIndex: null, value: '', position: { x: 0, y: 0 } });
    };

    // Valuation dialog handlers
    const openValuationDialog = (service: string, propertyIndex: number) => {
        if (service !== 'zillow' && service !== 'redfin' && service !== 'realtor') return;
        
        const currentValue = form.watch(`property.properties.${propertyIndex}.valuations.${service}`) || '';
        setValuationDialog({
            isOpen: true,
            service: service as 'zillow' | 'redfin' | 'realtor',
            propertyIndex,
            currentValue
        });
    };

    const closeValuationDialog = () => {
        setValuationDialog({ isOpen: false, service: null, propertyIndex: null, currentValue: '' });
    };

    const saveValuation = (value: string) => {
        if (valuationDialog.propertyIndex !== null && valuationDialog.service) {
            form.setValue(`property.properties.${valuationDialog.propertyIndex}.valuations.${valuationDialog.service}`, value);
            closeValuationDialog();
        }
    };

    const saveAndApplyValuation = (value: string) => {
        if (valuationDialog.propertyIndex !== null && valuationDialog.service) {
            form.setValue(`property.properties.${valuationDialog.propertyIndex}.valuations.${valuationDialog.service}`, value);
            form.setValue(`property.properties.${valuationDialog.propertyIndex}.estimatedValue`, value);
            closeValuationDialog();
        }
    };

    // Valuation summary dialog handlers
    const openValuationSummary = (propertyIndex: number) => {
        setValuationSummaryDialog({ isOpen: true, propertyIndex });
    };

    const closeValuationSummary = () => {
        setValuationSummaryDialog({ isOpen: false, propertyIndex: null });
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

                    // Determine if we should show the "Add" button for this property
                    const MAX_SECOND_HOME = 3;
                    const MAX_INVESTMENT = 6;
                    const propertiesOfType = currentProperties.filter(p => p.use === property.use);
                    const showAddButton =
                        (property.use === 'second-home' && propertiesOfType.length < MAX_SECOND_HOME) ||
                        (property.use === 'investment' && propertiesOfType.length < MAX_INVESTMENT);

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
                            getValueComparisonColor={() => ({ iconClass: 'text-black hover:text-gray-600', shadowColor: 'none' as const })}
                            openValuationDialog={openValuationDialog}
                            handleValuationHover={handleValuationHover}
                            handleValuationHoverLeave={handleValuationHoverLeave}
                            openValuationSummary={() => openValuationSummary(originalIndex)}
                            additionalLoans={[]}
                            getDyn={() => undefined}
                            setIsCurrentLoanPreviewOpen={() => {}}
                            setIsCurrentSecondLoanPreviewOpen={() => {}}
                            setIsCurrentThirdLoanPreviewOpen={() => {}}
                            title={property.use === 'primary' ? 'Primary Residence' :
                                `${property.use ? property.use.charAt(0).toUpperCase() + property.use.slice(1).replace('-', ' ') : 'Unknown'}`}
                            setSubjectProperty={setSubjectProperty}
                            onAddProperty={() => handleAddProperty(property.use!)}
                            showAddButton={showAddButton}
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
            
            <ValuationDialog
                isOpen={valuationDialog.isOpen}
                service={valuationDialog.service}
                currentValue={valuationDialog.currentValue}
                onClose={closeValuationDialog}
                onSave={saveValuation}
                onSaveAndApply={saveAndApplyValuation}
            />

            <ValuationSummaryDialog
                isOpen={valuationSummaryDialog.isOpen}
                propertyIndex={valuationSummaryDialog.propertyIndex}
                onClose={closeValuationSummary}
            />
            
            {/* Valuation Hover Tooltip */}
            {valuationHover.isVisible && (
                <div
                    className="fixed z-50 bg-white dark:bg-gray-800 border-2 border-orange-500 rounded-md shadow-lg p-6 max-w-md w-80"
                    style={{
                        left: valuationHover.position.x,
                        top: valuationHover.position.y,
                        pointerEvents: 'none' // Prevent tooltip from interfering with mouse events
                    }}
                    data-testid="tooltip-valuation-hover"
                >
                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {valuationHover.service === 'zillow' && 'Zillow Valuation'}
                        {valuationHover.service === 'redfin' && 'Redfin Valuation'}
                        {valuationHover.service === 'realtor' && 'Realtor.com Valuation'}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-400 mt-2">
                        {valuationHover.value ? (
                            <span className="font-mono text-green-600 dark:text-green-400">{valuationHover.value}</span>
                        ) : (
                            <span className="italic text-gray-500">No value saved</span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                        Click to open full editor
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyTab;