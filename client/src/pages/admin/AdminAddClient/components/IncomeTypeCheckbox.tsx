import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { InsertClient } from '@shared/schema';

interface IncomeTypeCheckboxProps {
    id: string;
    fieldPath: string;
    label: string;
    testId: string;
    disabled?: boolean;
    preventUncheck?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    title?: string;
    className?: string;
}

const IncomeTypeCheckbox: React.FC<IncomeTypeCheckboxProps> = ({
    id,
    fieldPath,
    label,
    testId,
    disabled = false,
    preventUncheck = false,
    onCheckedChange,
    title,
    className = "cursor-not-allowed opacity-50"
}) => {
    const form = useFormContext<InsertClient>();
    const isChecked = form.watch(fieldPath as any) || false;

    const handleChange = (checked: boolean | string) => {
        const checkedBool = !!checked;
        
        if (preventUncheck && !checkedBool && isChecked) {
            return; // Prevent unchecking
        }
        
        if (onCheckedChange) {
            onCheckedChange(checkedBool);
        } else {
            form.setValue(fieldPath as any, checkedBool);
        }
    };

    return (
        <div className="flex items-center space-x-2" title={title}>
            <Checkbox
                id={id}
                checked={isChecked}
                onCheckedChange={handleChange}
                disabled={disabled}
                data-testid={testId}
                className={`transition-transform duration-500 hover:scale-105 data-[state=checked]:rotate-[360deg] ${
                    disabled ? className : ''
                }`}
            />
            <Label 
                htmlFor={id} 
                className={disabled ? className : ''}
            >
                {label}
            </Label>
        </div>
    );
};

export default IncomeTypeCheckbox;