import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import IncomeHeader from '../components/IncomeHeader';
import IncomeTypes from '../components/IncomeTypes';
import { InsertClient } from '@shared/schema';

interface IncomeTabProps {
    animations?: {
        showEntry: boolean;
        showIncome: boolean;
    };
}

const IncomeTab = ({ animations }: IncomeTabProps) => {
    const form = useFormContext<InsertClient>();
    
    // Calculate total borrower income - simplified version
    const totalBorrowerIncome = useMemo(() => {
        const borrowerIncomeData = form.watch('income');
        let total = 0;
        
        // This is a simplified calculation - you might need to expand this
        // based on the actual income calculation logic from the main component
        if (borrowerIncomeData?.employers && typeof borrowerIncomeData.employers === 'object') {
            total += Object.values(borrowerIncomeData.employers).reduce((sum, employer: any) => {
                const monthlyIncome = parseFloat(employer?.monthlyIncome || '0');
                return sum + (isNaN(monthlyIncome) ? 0 : monthlyIncome);
            }, 0);
        }
        
        return total;
    }, [form.watch('income')]);
    
    const totalBorrowerIncomeFormatted = useMemo(() => 
        `$${totalBorrowerIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        [totalBorrowerIncome]
    );

    const handlePropertyRentalChange = (checked: boolean) => {
        // Handle property rental dialog logic here
        console.log('Property rental changed:', checked);
    };

    const handleExpandAll = () => {
        // Handle expand all logic
        console.log('Expand all income cards');
    };

    const handleMinimizeAll = () => {
        // Handle minimize all logic
        console.log('Minimize all income cards');
    };

    return (
        <>
            <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
                    <IncomeHeader animations={animations} />
                </CardContent>
            </Card>

            <IncomeTypes
                prefix="income"
                title="Borrower Income"
                totalIncome={totalBorrowerIncomeFormatted}
                onPropertyRentalChange={handlePropertyRentalChange}
                onExpandAll={handleExpandAll}
                onMinimizeAll={handleMinimizeAll}
                borderColor="green"
            />
        </>
    );
};

export default IncomeTab;