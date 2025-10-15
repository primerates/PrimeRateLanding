import { useState, useEffect } from 'react';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import BorrowerHeaderForm from '../components/Borrower/BorrowerHeaderForm';
import BorrowerForm from '../components/Borrower/BorrowerForm';
interface BorrowerTabProps {
    animations?: {
        showEntry: boolean;
        showBorrower: boolean;
    };
}

const BorrowerTab = ({ animations }: BorrowerTabProps) => {
    const [hasAnimated, setHasAnimated] = useState<boolean>(false);
    const { hasCoBorrower } = useAdminAddClientStore();

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
        <>
            <div className={`transition-all duration-700 ${getAnimationClasses()}`}>
                <BorrowerHeaderForm />
            </div>

            <BorrowerForm isPrimary={true} />
            
            {hasCoBorrower && (
                <BorrowerForm isPrimary={false} />
            )}
        </>
    );
};

export default BorrowerTab;