import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BorrowerTabProps {
    animations?: {
        showEntry: boolean;
        showBorrower: boolean;
    };
}

const BorrowerTab = ({ animations }: BorrowerTabProps) => {
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (animations?.showEntry || animations?.showBorrower) {
            setHasAnimated(true);
        }
    }, [animations?.showEntry, animations?.showBorrower]);

    const getAnimationClasses = () => {
        if (animations?.showEntry) {
            return 'animate-roll-down-delayed opacity-100 transform translate-y-0';
        }
        if (animations?.showBorrower) {
            return 'animate-roll-down opacity-100 transform translate-y-0';
        }
        // Show if has been animated, otherwise hidden
        return hasAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4';
    };

    return (
        <Card className={`transition-all duration-700 ${getAnimationClasses()}`}>
            <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-6">

            </CardContent>
        </Card>

    );
};

export default BorrowerTab;