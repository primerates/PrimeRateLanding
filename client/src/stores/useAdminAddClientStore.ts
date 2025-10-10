import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AddAdminClientStore {
  unsavedChangesDialog: {
    isOpen: boolean;
  };
  isShowingDMBatch: boolean;
  setUnsavedChangesDialog: (dialog: { isOpen: boolean }) => void;
  setIsShowingDMBatch: (isShowing: boolean) => void;
}

export const useAdminAddClientStore = create<AddAdminClientStore>()(
  devtools(
    (set) => ({
      unsavedChangesDialog: { isOpen: false },
      isShowingDMBatch: false,
      
      setUnsavedChangesDialog: (dialog) =>
        set(() => ({
          unsavedChangesDialog: dialog,
        })),
      
      setIsShowingDMBatch: (isShowing) =>
        set(() => ({
          isShowingDMBatch: isShowing,
        })),
    }),
    { name: 'add-client-store' }
  )
);