import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface RentalInfoData {
  landlordName: string;
  email: string;
  phone: string;
  propertyType: string;
  monthlyRent: string;
  notes: string;
}

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
  isResidenceInfoDialogOpen: boolean;
  residenceInfoText: string;
  activeResidenceSection: string;
  isRentalInfoDialogOpen: boolean;
  rentalInfoData: RentalInfoData;
  activeRentalSection: string;
  setUnsavedChangesDialog: (dialog: { isOpen: boolean }) => void;
  setMaritalStatusDialog: (dialog: { isOpen: boolean }) => void;
  setIsShowingDMBatch: (isShowing: boolean) => void;
  setIsBorrowerOpen: (isOpen: boolean) => void;
  setHasCoBorrower: (hasCoBorrower: boolean) => void;
  addCoBorrower: () => void;
  removeCoBorrower: () => void;
  setIsResidenceInfoDialogOpen: (isOpen: boolean) => void;
  setResidenceInfoText: (text: string) => void;
  setActiveResidenceSection: (section: string) => void;
  setIsRentalInfoDialogOpen: (isOpen: boolean) => void;
  setRentalInfoData: (data: RentalInfoData) => void;
  setActiveRentalSection: (section: string) => void;
}

export const useAdminAddClientStore = create<AddAdminClientStore>()(
  devtools(
    (set) => ({
      unsavedChangesDialog: { isOpen: false },
      maritalStatusDialog: { isOpen: false },
      isShowingDMBatch: false,
      isBorrowerOpen: true,
      hasCoBorrower: false,
      isResidenceInfoDialogOpen: false,
      residenceInfoText: '',
      activeResidenceSection: '',
      isRentalInfoDialogOpen: false,
      rentalInfoData: {
        landlordName: '',
        email: '',
        phone: '',
        propertyType: '',
        monthlyRent: '',
        notes: ''
      },
      activeRentalSection: '',
      
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
      
      setIsResidenceInfoDialogOpen: (isOpen) =>
        set(() => ({
          isResidenceInfoDialogOpen: isOpen,
        })),
      
      setResidenceInfoText: (text) =>
        set(() => ({
          residenceInfoText: text,
        })),
      
      setActiveResidenceSection: (section) =>
        set(() => ({
          activeResidenceSection: section,
        })),
      
      setIsRentalInfoDialogOpen: (isOpen) =>
        set(() => ({
          isRentalInfoDialogOpen: isOpen,
        })),
      
      setRentalInfoData: (data) =>
        set(() => ({
          rentalInfoData: data,
        })),
      
      setActiveRentalSection: (section) =>
        set(() => ({
          activeRentalSection: section,
        })),
    }),
    { name: 'add-client-store' }
  )
);