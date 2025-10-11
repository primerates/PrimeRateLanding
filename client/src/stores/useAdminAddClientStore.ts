import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AddAdminClientStore {
  unsavedChangesDialog: {
    isOpen: boolean;
  };
  maritalStatusDialog: {
    isOpen: boolean;
  };
  isShowingDMBatch: boolean;
  isBorrowerOpen: boolean;
  hasCoBorrower: boolean;
  setUnsavedChangesDialog: (dialog: { isOpen: boolean }) => void;
  setMaritalStatusDialog: (dialog: { isOpen: boolean }) => void;
  setIsShowingDMBatch: (isShowing: boolean) => void;
  setIsBorrowerOpen: (isOpen: boolean) => void;
  setHasCoBorrower: (hasCoBorrower: boolean) => void;
  addCoBorrower: () => void;
  removeCoBorrower: () => void;
}

export const useAdminAddClientStore = create<AddAdminClientStore>()(
  devtools(
    (set) => ({
      unsavedChangesDialog: { isOpen: false },
      maritalStatusDialog: { isOpen: false },
      isShowingDMBatch: false,
      isBorrowerOpen: true,
      hasCoBorrower: false,
      
      setUnsavedChangesDialog: (dialog) =>
        set(() => ({
          unsavedChangesDialog: dialog,
        })),
      
      setMaritalStatusDialog: (dialog) =>
        set(() => ({
          maritalStatusDialog: dialog,
        })),
      
      setIsShowingDMBatch: (isShowing) =>
        set(() => ({
          isShowingDMBatch: isShowing,
        })),
      
      setIsBorrowerOpen: (isOpen) =>
        set(() => ({
          isBorrowerOpen: isOpen,
        })),
      
      setHasCoBorrower: (hasCoBorrower) =>
        set(() => ({
          hasCoBorrower,
        })),
      
      addCoBorrower: () =>
        set(() => ({
          hasCoBorrower: true,
        })),
      
      removeCoBorrower: () =>
        set(() => ({
          hasCoBorrower: false,
        })),
    }),
    { name: 'add-client-store' }
  )
);