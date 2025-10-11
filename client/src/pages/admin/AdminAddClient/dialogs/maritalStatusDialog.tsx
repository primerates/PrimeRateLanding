import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';

const MaritalStatusDialog = () => {
  const { maritalStatusDialog, setMaritalStatusDialog, addCoBorrower } = useAdminAddClientStore();

  return (
    <AlertDialog 
      open={maritalStatusDialog.isOpen} 
      onOpenChange={(open) => !open && setMaritalStatusDialog({ isOpen: false })}
    >
      <AlertDialogContent data-testid="dialog-marital-status-coborrower">
        <AlertDialogHeader>
          <AlertDialogTitle>Add Co-Borrower?</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to add a Co-Borrower?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setMaritalStatusDialog({ isOpen: false })}
            data-testid="button-marital-status-not-yet"
          >
            Not Yet
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              setMaritalStatusDialog({ isOpen: false });
              addCoBorrower();
            }}
            data-testid="button-marital-status-yes"
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MaritalStatusDialog;