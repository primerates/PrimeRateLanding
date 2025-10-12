import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import IncomeTypeCheckbox from './IncomeTypeCheckbox';

interface IncomeTypesProps {
    prefix?: string; // 'income' or 'coBorrowerIncome'
    isCoBorrower?: boolean;
    onPropertyRentalChange?: (checked: boolean) => void;
    title?: string;
    totalIncome?: string;
    onExpandAll?: () => void;
    onMinimizeAll?: () => void;
    borderColor?: string;
}

const IncomeTypes = ({ 
    prefix = 'income', 
    isCoBorrower = false,
    onPropertyRentalChange,
    title = 'Borrower Income',
    totalIncome = '$0',
    onExpandAll,
    onMinimizeAll,
    borderColor = 'green'
}: IncomeTypesProps) => {
    const borderColorClass = `border-l-${borderColor}-500 hover:border-${borderColor}-500 focus-within:border-${borderColor}-500`;

    return (
        <Card className={`border-l-4 ${borderColorClass} transition-colors duration-200`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        {title}
                        <span className="text-lg font-semibold" data-testid={`text-total-${isCoBorrower ? 'coborrower-' : ''}income`}>
                            {totalIncome}
                        </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {/* Expand All Button */}
                        {onExpandAll && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onExpandAll}
                                className="hover:bg-blue-500 hover:text-white"
                                title="Expand All Income Tiles"
                                data-testid={`button-expand-all-${isCoBorrower ? 'coborrower-' : ''}income`}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                        
                        {/* Minimize All Button */}
                        {onMinimizeAll && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onMinimizeAll}
                                className="hover:bg-orange-500 hover:text-white"
                                title="Minimize All Income Tiles"
                                data-testid={`button-minimize-all-${isCoBorrower ? 'coborrower-' : ''}income`}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <IncomeTypeCheckbox
                            id={`${prefix}-type-employment`}
                            fieldPath={`${prefix}.incomeTypes.employment`}
                            label="Employment"
                            testId={`checkbox-${isCoBorrower ? 'coborrower-' : ''}employment`}
                        />
                        
                        <IncomeTypeCheckbox
                            id={`${prefix}-type-secondEmployment`}
                            fieldPath={`${prefix}.incomeTypes.secondEmployment`}
                            label="Second Employment"
                            testId={`checkbox-${isCoBorrower ? 'coborrower-' : ''}secondEmployment`}
                        />
                        
                        <IncomeTypeCheckbox
                            id={`${prefix}-type-selfEmployment`}
                            fieldPath={`${prefix}.incomeTypes.selfEmployment`}
                            label="Self-Employment"
                            testId={`checkbox-${isCoBorrower ? 'coborrower-' : ''}selfEmployment`}
                            preventUncheck={true}
                        />
                        
                        <IncomeTypeCheckbox
                            id={`${prefix}-type-pension`}
                            fieldPath={`${prefix}.incomeTypes.pension`}
                            label="Pension"
                            testId={`checkbox-${isCoBorrower ? 'coborrower-' : ''}pension`}
                        />
                        
                        <IncomeTypeCheckbox
                            id={`${prefix}-type-socialSecurity`}
                            fieldPath={`${prefix}.incomeTypes.socialSecurity`}
                            label="Social Security"
                            testId={`checkbox-${isCoBorrower ? 'coborrower-' : ''}socialSecurity`}
                            preventUncheck={true}
                        />
                        
                        <IncomeTypeCheckbox
                            id={`${prefix}-type-vaBenefits`}
                            fieldPath={`${prefix}.incomeTypes.vaBenefits`}
                            label="Disability"
                            testId={`checkbox-${isCoBorrower ? 'coborrower-' : ''}vaBenefits`}
                            preventUncheck={true}
                        />
                        
                        <IncomeTypeCheckbox
                            id={`${prefix}-type-disability`}
                            fieldPath={`${prefix}.incomeTypes.disability`}
                            label="Other"
                            testId={`checkbox-${isCoBorrower ? 'coborrower-' : ''}disability`}
                            disabled={true}
                            title="Alimony / Child Support"
                            onCheckedChange={() => {
                                // Disabled - will be designed later
                                return;
                            }}
                        />
                        
                        <IncomeTypeCheckbox
                            id={`${prefix}-type-property-rental`}
                            fieldPath={`${prefix}.incomeTypes.other`}
                            label="Rental Property"
                            testId={`checkbox-${isCoBorrower ? 'coborrower-' : ''}property-rental`}
                            onCheckedChange={onPropertyRentalChange}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default IncomeTypes;