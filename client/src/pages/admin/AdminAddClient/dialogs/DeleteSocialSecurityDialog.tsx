import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DeleteSocialSecurityDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteSocialSecurityDialog = ({ isOpen, onClose, onConfirm }: DeleteSocialSecurityDialogProps) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent data-testid="dialog-delete-social-security">
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove Social Security Income</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove the Social Security income section? This will clear all entered data and hide the section. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel 
                        onClick={onClose}
                        data-testid="button-cancel-delete-social-security"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm}
                        data-testid="button-confirm-delete-social-security"
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Remove
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteSocialSecurityDialog;