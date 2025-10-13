import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PropertyRentalDialogProps {
    isOpen: boolean;
    type: 'add' | 'remove' | null;
    onClose: () => void;
}

const PropertyRentalDialog = ({ isOpen, type, onClose }: PropertyRentalDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent data-testid="dialog-property-rental">
                <DialogHeader>
                    <DialogTitle>
                        {type === 'add' ? 'Rental Income' : 'Remove Property Rental'}
                    </DialogTitle>
                    <DialogDescription>
                        {type === 'add' 
                            ? 'Please add property details using property menu option. This area will update automatically.'
                            : 'Please remove property rental using property menu option.'
                        }
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        onClick={onClose}
                        data-testid="button-property-rental-ok"
                    >
                        Ok
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PropertyRentalDialog;