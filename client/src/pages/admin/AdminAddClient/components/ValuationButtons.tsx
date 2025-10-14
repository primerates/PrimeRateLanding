import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { SiZillow } from 'react-icons/si';
import { MdRealEstateAgent } from 'react-icons/md';
import { FaHome } from 'react-icons/fa';

interface ValuationButtonsProps {
  propertyId: string;
  propertyIndex: number;
  openValuationDialog: (type: string, index: number) => void;
  handleValuationHover: (type: string, index: number, e: React.MouseEvent) => void;
  handleValuationHoverLeave: () => void;
  openValuationSummary: (index: number) => void;
}

const ValuationButtons = ({
  propertyId,
  propertyIndex,
  openValuationDialog,
  handleValuationHover,
  handleValuationHoverLeave,
  openValuationSummary
}: ValuationButtonsProps) => {
  return (
    <div className="flex items-center gap-1">
      {/* Zillow */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="p-1 h-auto text-blue-600 hover:text-blue-800 no-default-hover-elevate no-default-active-elevate"
        onClick={() => openValuationDialog('zillow', propertyIndex)}
        onMouseEnter={(e) => handleValuationHover('zillow', propertyIndex, e)}
        onMouseLeave={handleValuationHoverLeave}
        data-testid={`button-zillow-valuation-${propertyId}`}
        title="Enter Zillow valuation manually"
      >
        <SiZillow className="h-4 w-4" />
      </Button>

      {/* Realtor */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="p-1 h-auto text-purple-600 hover:text-purple-800 no-default-hover-elevate no-default-active-elevate"
        onClick={() => openValuationDialog('realtor', propertyIndex)}
        onMouseEnter={(e) => handleValuationHover('realtor', propertyIndex, e)}
        onMouseLeave={handleValuationHoverLeave}
        data-testid={`button-realtor-valuation-${propertyId}`}
        title="Enter Realtor.com valuation manually"
      >
        <MdRealEstateAgent className="h-4 w-4" />
      </Button>

      {/* Redfin */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="p-1 h-auto text-red-600 hover:text-red-800 no-default-hover-elevate no-default-active-elevate"
        onClick={() => openValuationDialog('redfin', propertyIndex)}
        onMouseEnter={(e) => handleValuationHover('redfin', propertyIndex, e)}
        onMouseLeave={handleValuationHoverLeave}
        data-testid={`button-redfin-valuation-${propertyId}`}
        title="Enter Redfin valuation manually"
      >
        <FaHome className="h-4 w-4" />
      </Button>

      {/* Info Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="p-1 h-auto text-blue-600 hover:text-blue-800"
        onClick={() => openValuationSummary(propertyIndex)}
        data-testid={`button-valuation-info-${propertyId}`}
        title="View all valuation estimates"
      >
        <Info className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ValuationButtons;