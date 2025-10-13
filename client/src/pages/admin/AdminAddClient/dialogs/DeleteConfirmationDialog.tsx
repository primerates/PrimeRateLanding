import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    testId?: string;
    confirmButtonTestId?: string;
    cancelButtonTestId?: string;
}

const DeleteConfirmationDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    description,
    confirmButtonText = "Delete",
    cancelButtonText = "Cancel",
    testId,
    confirmButtonTestId,
    cancelButtonTestId
}: DeleteConfirmationDialogProps) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent data-testid={testId}>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel 
                        onClick={onClose}
                        data-testid={cancelButtonTestId}
                    >
                        {cancelButtonText}
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm}
                        data-testid={confirmButtonTestId}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {confirmButtonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteConfirmationDialog;