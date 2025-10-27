import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star, Settings } from 'lucide-react';
import MonetaryInputRow from './MonetaryInputRow';
import RateBuyDownInfoDialog from './RateBuyDownInfoDialog';
import { type ThirdPartyCategory } from '../hooks/useThirdPartyServices';
import { isVALoan, isFHALoan } from '../utils/loanCategoryHelpers';
import { formatDecimalCurrency } from '../utils/formatters';

interface RateBuyDownCardProps {
  selectedRateIds: number[];
  selectedLoanCategory: string;
  rateBuyDownValues: string[];
  setRateBuyDownValues: (values: string[]) => void;
  vaFundingFeeValues: string[];
  fhaUpfrontMipValue: string;
  thirdPartyServiceValues: { [serviceId: string]: string[] };
  setThirdPartyServiceValues: (values: { [serviceId: string]: string[] }) => void;
  categorySameModes: { [categoryId: string]: boolean };
  setCategorySameModes: (modes: { [categoryId: string]: boolean }) => void;
  currentThirdPartyServices: ThirdPartyCategory[];
  columnWidth: string;
  gridCols: string;
  onVAFundingFeeClick?: () => void;
  onCustomizeClosingCostsClick?: () => void;
}

/**
 * Card component for Rate Buy Down, VA/FHA fees, and Third Party Services
 */
const RateBuyDownCard = ({
  selectedRateIds,
  selectedLoanCategory,
  rateBuyDownValues,
  setRateBuyDownValues,
  vaFundingFeeValues,
  fhaUpfrontMipValue,
  thirdPartyServiceValues,
  setThirdPartyServiceValues,
  categorySameModes,
  setCategorySameModes,
  currentThirdPartyServices,
  columnWidth,
  gridCols,
  onVAFundingFeeClick,
  onCustomizeClosingCostsClick
}: RateBuyDownCardProps) => {
  const isVA = isVALoan(selectedLoanCategory);
  const isFHA = isFHALoan(selectedLoanCategory);
  const showVAFHASection = isVA || isFHA;

  // State for Rate Buy Down Info dialog
  const [isRateBuyDownInfoOpen, setIsRateBuyDownInfoOpen] = useState(false);

  const handleRateBuyDownChange = (rateId: number, value: string) => {
    const newValues = [...rateBuyDownValues];
    newValues[rateId] = value;
    setRateBuyDownValues(newValues);
  };

  const handleCategoryToggle = (categoryId: string, category: ThirdPartyCategory) => {
    const isInSameMode = categorySameModes[categoryId];
    if (isInSameMode) {
      // Copy first field value to all fields for ALL services in this category
      category.services.forEach(service => {
        const firstValue = thirdPartyServiceValues[service.id]?.[selectedRateIds[0]] || '';
        const newValues = [...thirdPartyServiceValues[service.id]];
        selectedRateIds.forEach(id => newValues[id] = firstValue);
        setThirdPartyServiceValues(prev => ({
          ...prev,
          [service.id]: newValues
        }));
      });
    }
    // Toggle the mode
    setCategorySameModes(prev => ({
      ...prev,
      [categoryId]: !isInSameMode
    }));
  };

  return (
    <Card
      className="mt-8 transition-all duration-700 animate-roll-down border-l-4 border-l-cyan-500 hover:border-2 hover:border-cyan-500 transition-colors flex-none"
      style={{ width: columnWidth, maxWidth: '100%' }}
    >
      <CardContent className="pt-6 space-y-6">
        {/* Rate Buy Down Row */}
        <MonetaryInputRow
          label="Rate Buy Down"
          values={rateBuyDownValues}
          selectedRateIds={selectedRateIds}
          onChange={handleRateBuyDownChange}
          testIdPrefix="input-rate-buy-down"
          gridCols={gridCols}
          showInfoIcon={true}
          onInfoClick={() => setIsRateBuyDownInfoOpen(true)}
        />

        {/* VA Funding Fee / FHA Upfront MIP Section */}
        {showVAFHASection && (
          <div className="border-t pt-6">
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: gridCols }}>
              <div className="flex items-center justify-end pr-4 gap-2">
                {/* Star icon for VA loans only */}
                {isVA && onVAFundingFeeClick && (() => {
                  // Determine star color based on VA Funding Fee values
                  const vaFeeValues = thirdPartyServiceValues['s1'] || ['', '', '', ''];
                  const hasAnyValue = vaFeeValues.some(val => val && val.trim() !== '');
                  const allZero = vaFeeValues.every(val => !val || val.trim() === '' || val === '0' || val === '0.00');

                  let starColor = '';
                  if (!hasAnyValue) {
                    // Red: No values entered
                    starColor = 'text-red-600 fill-red-600';
                  } else if (allZero) {
                    // Green: All values are $0
                    starColor = 'text-green-600 fill-green-600';
                  } else {
                    // Grey: Values entered (non-zero)
                    starColor = 'text-gray-500 fill-gray-500';
                  }

                  return (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-amber-500 hover:text-white"
                      onClick={onVAFundingFeeClick}
                      data-testid="button-va-funding-fee"
                    >
                      <Star className={`h-4 w-4 ${starColor}`} />
                    </Button>
                  );
                })()}
                <Label className="text-base font-semibold text-right">
                  {isFHA ? 'New FHA Upfront MIP' : 'VA Funding Fee'}
                </Label>
              </div>
              {selectedRateIds.map((rateId) => {
                if (isVA) {
                  // VA Loan: display-only input showing calculated values
                  const displayValue = formatDecimalCurrency(vaFundingFeeValues[rateId] || '');

                  return (
                    <div key={rateId} className="flex justify-center">
                      <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                        <span className="text-muted-foreground text-sm">$</span>
                        <Input
                          type="text"
                          placeholder=""
                          value={displayValue}
                          disabled
                          className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100"
                          data-testid={`input-va-funding-fee-${rateId}`}
                        />
                      </div>
                    </div>
                  );
                }

                // FHA Loan: disabled input showing calculated value
                const displayValue = fhaUpfrontMipValue || '0';

                return (
                  <div key={rateId} className="flex justify-center">
                    <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                      <span className="text-muted-foreground text-sm">$</span>
                      <Input
                        type="text"
                        placeholder="0"
                        value={displayValue}
                        disabled
                        className="border-0 bg-transparent text-center font-medium text-xl focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-100"
                        data-testid={`input-fha-upfront-mip-${rateId}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Third Party Services Section */}
        <div className="border-t pt-6">
          {currentThirdPartyServices.map((category, categoryIndex) => (
            <div key={category.id} className={categoryIndex > 0 ? 'mt-6 pt-6 border-t border-border' : ''}>
              {/* Category Header */}
              <div className="grid gap-4 mb-2" style={{ gridTemplateColumns: gridCols }}>
                <div className="flex items-center justify-end pr-4 gap-2">
                  {/* Settings icon for first category only (Third Party Services) */}
                  {categoryIndex === 0 && onCustomizeClosingCostsClick && (() => {
                    // Determine settings icon color based on whether all values are empty or zero
                    const allValuesEmpty = Object.values(thirdPartyServiceValues).every(arr =>
                      arr.every(val => !val || val === '0')
                    );

                    return (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onCustomizeClosingCostsClick}
                        data-testid="button-customize-third-party-services"
                      >
                        <Settings className={`h-4 w-4 ${allValuesEmpty ? 'text-red-500' : ''}`} />
                      </Button>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(category.id, category)}
                    className="text-base font-semibold text-right hover:text-blue-600 cursor-pointer"
                    data-testid={`button-category-toggle-${category.id}`}
                  >
                    {categorySameModes[category.id] ? 'Same' : category.categoryName}
                  </button>
                </div>
                {selectedRateIds.map((rateId) => (
                  <div key={rateId} className="flex justify-center">
                    <div className="w-3/4"></div>
                  </div>
                ))}
              </div>

              {/* Services under this category */}
              {category.services.map((service, serviceIndex) => {
                // Filter logic for services based on loan category
                // Hide VA Funding Fee (s1) - it has its own section
                if (service.id === 's1') return null;

                // Hide Appraisal Inspection (s2) when VA Rate & Term or IRRRL is selected
                if (service.id === 's2' &&
                  (selectedLoanCategory?.includes('Rate & Term') || selectedLoanCategory?.includes('IRRRL'))) {
                  return null;
                }

                // Hide Appraisal Inspection (s2) when FHA Rate & Term or Streamline is selected
                if (service.id === 's2' && isFHA &&
                  (selectedLoanCategory?.includes('Rate & Term') || selectedLoanCategory?.includes('Streamline'))) {
                  return null;
                }

                // Hide Pay Off Interest (s6) - it has its own section
                if (service.id === 's6') return null;

                return (
                  <div
                    key={service.id}
                    className={`grid gap-4 ${serviceIndex < category.services.length - 1 ? 'mb-2' : ''}`}
                    style={{ gridTemplateColumns: gridCols }}
                  >
                    <div className="flex items-center justify-end pr-4">
                      <Label className="text-sm text-right text-muted-foreground">• {service.serviceName}</Label>
                    </div>
                    {selectedRateIds.map((rateId) => {
                      const numVal = thirdPartyServiceValues[service.id]?.[rateId]
                        ? thirdPartyServiceValues[service.id][rateId].replace(/[^\d]/g, '')
                        : '';
                      const displayValue = numVal ? numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

                      return (
                        <div key={rateId} className="flex justify-center">
                          <div className="flex items-center border border-input bg-background px-3 rounded-md w-3/4">
                            <span className="text-muted-foreground text-sm">$</span>
                            <Input
                              type="text"
                              placeholder=""
                              value={displayValue}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^\d]/g, '');
                                setThirdPartyServiceValues(prev => {
                                  const newValues = { ...prev };
                                  if (!newValues[service.id]) {
                                    newValues[service.id] = Array(4).fill('');
                                  }
                                  const updatedArray = [...newValues[service.id]];
                                  updatedArray[rateId] = value;
                                  newValues[service.id] = updatedArray;
                                  return newValues;
                                });
                              }}
                              className="border-0 bg-transparent text-center text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                              data-testid={`input-service-${service.id}-${rateId}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Rate Buy Down Info Dialog */}
      <RateBuyDownInfoDialog
        isOpen={isRateBuyDownInfoOpen}
        onClose={() => setIsRateBuyDownInfoOpen(false)}
      />
    </Card>
  );
};

export default RateBuyDownCard;
