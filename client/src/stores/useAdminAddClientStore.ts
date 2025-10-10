import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AddAdminClientStore {
  unsavedChangesDialog: {
    isOpen: boolean;
  };
  setUnsavedChangesDialog: (dialog: { isOpen: boolean }) => void;
}

export const useAdminAddClientStore = create<AddAdminClientStore>()(
  devtools(
    (set) => ({
      unsavedChangesDialog: { isOpen: false },
      
      setUnsavedChangesDialog: (dialog) =>
        set(() => ({
          unsavedChangesDialog: dialog,
        })),
    }),
    { name: 'add-client-store' }
  )
);