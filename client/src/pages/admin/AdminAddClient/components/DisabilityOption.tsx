import React from 'react';
import { Label } from '@/components/ui/label';

interface DisabilityOptionProps {
    id: string;
    label: string;
    selected: boolean;
    onToggle: () => void;
    testId: string;
}

const DisabilityOption = ({ id, label, selected, onToggle, testId }: DisabilityOptionProps) => {
    return (
        <div className="flex items-center space-x-2">
            <div
                onClick={onToggle}
                className={`w-4 h-4 rounded-full border-2 cursor-pointer flex items-center justify-center transition-colors ${
                    selected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                }`}
                data-testid={testId}
            >
                {selected && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            <Label 
                htmlFor={id}
                className="cursor-pointer"
                onClick={onToggle}
            >
                {label}
            </Label>
        </div>
    );
};

export default DisabilityOption;