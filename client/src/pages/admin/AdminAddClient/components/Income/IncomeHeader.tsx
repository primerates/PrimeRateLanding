import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import DTIField from './DTIField';
import { InsertClient } from '@shared/schema';
import { Label } from '@radix-ui/react-label';

interface IncomeHeaderProps {
    animations?: {
        showEntry: boolean;
        showIncome: boolean;
    };
}

const IncomeHeader = ({ animations }: IncomeHeaderProps) => {
    const form = useFormContext<InsertClient>();
    const [isFrontDTIEditing, setIsFrontDTIEditing] = useState(false);
    const [isBackDTIEditing, setIsBackDTIEditing] = useState(false);
    const [isGuidelineDTIEditing, setIsGuidelineDTIEditing] = useState(false);

    const showIncomeAnimation = animations?.showIncome;

    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="household-income-total" className="text-lg font-semibold">Total Household Income</Label>
            </div>
            <DTIField
                control={form.control}
                name="income.frontDTI"
                label="Front DTI"
                isEditing={isFrontDTIEditing}
                setIsEditing={setIsFrontDTIEditing}
                animationClass={showIncomeAnimation ? 'animate-roll-down-dti-1' : ''}
                testId="income-frontDTI"
            />

            <DTIField
                control={form.control}
                name="income.backDTI"
                label="Back DTI"
                isEditing={isBackDTIEditing}
                setIsEditing={setIsBackDTIEditing}
                animationClass={showIncomeAnimation ? 'animate-roll-down-dti-2' : ''}
                testId="income-backDTI"
            />

            <DTIField
                control={form.control}
                name="income.guidelineDTI"
                label="Guideline DTI"
                isEditing={isGuidelineDTIEditing}
                setIsEditing={setIsGuidelineDTIEditing}
                animationClass={showIncomeAnimation ? 'animate-roll-down-dti-3' : ''}
                testId="income-guidelineDTI"
            />
        </>
    );
};

export default IncomeHeader;