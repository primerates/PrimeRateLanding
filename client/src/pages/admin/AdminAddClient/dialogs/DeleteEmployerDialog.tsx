import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteEmployerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteEmployerDialog = ({ isOpen, onClose, onConfirm }: DeleteEmployerDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent data-testid="dialog-delete-employer">
                <DialogHeader>
                    <DialogTitle>
                        Delete Employer
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this employer? This action cannot be undone and will remove all associated employment information.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        data-testid="button-delete-employer-cancel"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        data-testid="button-delete-employer-confirm"
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteEmployerDialog;