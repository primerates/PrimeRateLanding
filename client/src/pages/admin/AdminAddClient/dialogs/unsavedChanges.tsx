import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminAddClientStore } from '@/stores/useAdminAddClientStore';
import { useLocation } from 'wouter';

const UnSavedChangesDialog = () => {
    const { unsavedChangesDialog, setUnsavedChangesDialog } = useAdminAddClientStore();
    const [, setLocation] = useLocation();

    return (
        <Dialog open={unsavedChangesDialog.isOpen} onOpenChange={(open) => !open && setUnsavedChangesDialog({ isOpen: false })}>
            <DialogContent data-testid="dialog-unsaved-changes-warning">
                <DialogHeader>
                    <DialogTitle>Unsaved Changes</DialogTitle>
                    <DialogDescription className="text-destructive">
                        By returning to dashboard now, unsaved changes will be lost. Do you want to continue?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setUnsavedChangesDialog({ isOpen: false })}
                        data-testid="button-unsaved-changes-no"
                    >
                        No
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            setUnsavedChangesDialog({ isOpen: false });
                            setLocation('/admin/dashboard');
                        }}
                        data-testid="button-unsaved-changes-yes"
                    >
                        Yes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UnSavedChangesDialog;