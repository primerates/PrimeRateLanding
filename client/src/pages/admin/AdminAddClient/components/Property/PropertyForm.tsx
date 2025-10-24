import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { type InsertClient } from '@shared/schema';
import SubjectPropertyQuestion from './SubjectPropertyQuestion';
import PropertyAddress from './PropertyAddress';
import PropertyDetails from './PropertyDetails';

interface PropertyFormProps {
  propertyId: string;
  propertyIndex: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteProperty: () => void;
  showAnimation?: boolean;
  getValueComparisonColor: (estimatedValue: string, appraisedValue: string) => {
    iconClass: string;
    shadowColor: 'none' | 'red' | 'green' | 'yellow';
  };
  openValuationDialog: (type: string, index: number) => void;
  handleValuationHover: (type: string, index: number, e: React.MouseEvent) => void;
  handleValuationHoverLeave: () => void;
  openValuationSummary: (index: number) => void;
  additionalLoans: any[];
  getDyn: (path: string) => any;
  setIsCurrentLoanPreviewOpen: (open: boolean) => void;
  setIsCurrentSecondLoanPreviewOpen: (open: boolean) => void;
  setIsCurrentThirdLoanPreviewOpen: (open: boolean) => void;
  title: string;
  setSubjectProperty: (propertyIndex: number) => void;
  onAddProperty?: () => void;
  showAddButton?: boolean;
}

const PropertyForm = ({
  propertyId,
  propertyIndex,
  isOpen,
  onOpenChange,
  onDeleteProperty,
  showAnimation = false,
  getValueComparisonColor,
  openValuationDialog,
  handleValuationHover,
  handleValuationHoverLeave,
  openValuationSummary,
  additionalLoans,
  getDyn,
  setIsCurrentLoanPreviewOpen,
  setIsCurrentSecondLoanPreviewOpen,
  setIsCurrentThirdLoanPreviewOpen,
  title,
  setSubjectProperty,
  onAddProperty,
  showAddButton = false
}: PropertyFormProps) => {
  const form = useFormContext<InsertClient>();

  // Get property use to determine border color
  const propertyUse = form.watch(`property.properties.${propertyIndex}.use`);
  const getBorderColor = () => {
    switch (propertyUse) {
      case 'primary':
        return 'border-l-green-500 hover:border-green-500 focus-within:border-green-500';
      case 'second-home':
        return 'border-l-blue-500 hover:border-blue-500 focus-within:border-blue-500';
      case 'investment':
        return 'border-l-yellow-500 hover:border-yellow-500 focus-within:border-yellow-500';
      case 'home-purchase':
        return 'border-l-purple-500 hover:border-purple-500 focus-within:border-purple-500';
      default:
        return 'border-l-gray-500 hover:border-gray-500 focus-within:border-gray-500';
    }
  };

  return (
    <Card className={`border-l-4 ${getBorderColor()} transition-all duration-700 ${showAnimation ? 'animate-roll-down-property' : ''}`}>
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                {title}
                {form.watch(`property.properties.${propertyIndex}.isSubject`) && (
                  <span
                    className="text-white px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: '#1a3373' }}
                  >
                    Subject Property
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Add Property Button - Only for Second Home and Investment */}
                {showAddButton && onAddProperty && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddProperty();
                    }}
                    className="hover:bg-blue-500 hover:text-white"
                    data-testid={`button-add-${propertyUse}`}
                    title={`Add ${propertyUse === 'second-home' ? 'Second Home' : 'Investment Property'}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {propertyUse === 'second-home' ? 'Second Home' : 'Investment'}
                  </Button>
                )}

                {/* Remove Property Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="hover:bg-red-500 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProperty();
                  }}
                  data-testid={`button-delete-property-${propertyId}`}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Remove
                </Button>

                {/* Toggle Icon */}
                {isOpen ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-6">
              {/* Subject Property Question */}
              <SubjectPropertyQuestion
                propertyId={propertyId}
                propertyIndex={propertyIndex}
                showAnimation={showAnimation}
                setSubjectProperty={setSubjectProperty}
              />

              {/* Property Address */}
              <PropertyAddress
                propertyId={propertyId}
                propertyIndex={propertyIndex}
              />

              {/* Property Details */}
              <PropertyDetails
                propertyId={propertyId}
                propertyIndex={propertyIndex}
                openValuationDialog={openValuationDialog}
                handleValuationHover={handleValuationHover}
                handleValuationHoverLeave={handleValuationHoverLeave}
                openValuationSummary={openValuationSummary}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default PropertyForm;