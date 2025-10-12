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

interface CountyOptions {
  value: string;
  label: string;
}

interface CountyLookupLoading {
  borrower: boolean;
  coBorrower: boolean;
  borrowerPrior: boolean;
  coBorrowerPrior: boolean;
  borrowerPrior2: boolean;
  coBorrowerPrior2: boolean;
  borrowerEmployer: boolean;
  borrowerPriorEmployer: boolean;
  coBorrowerEmployer: Record<string, boolean>;
  coBorrowerPriorEmployer: boolean;
  coBorrowerSecondEmployer: boolean;
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
  // County lookup state
  borrowerCountyOptions: CountyOptions[];
  coBorrowerCountyOptions: CountyOptions[];
  borrowerPriorCountyOptions: CountyOptions[];
  coBorrowerPriorCountyOptions: CountyOptions[];
  borrowerPrior2CountyOptions: CountyOptions[];
  coBorrowerPrior2CountyOptions: CountyOptions[];
  borrowerEmployerCountyOptions: CountyOptions[];
  borrowerPriorEmployerCountyOptions: CountyOptions[];
  coBorrowerEmployerCountyOptions: Record<string, CountyOptions[]>;
  coBorrowerPriorEmployerCountyOptions: CountyOptions[];
  coBorrowerSecondEmployerCountyOptions: Record<string, CountyOptions[]>;
  countyLookupLoading: CountyLookupLoading;
  isBorrowerCurrentResidencePresent: boolean;
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
  // County lookup setters
  setBorrowerCountyOptions: (options: CountyOptions[]) => void;
  setCoBorrowerCountyOptions: (options: CountyOptions[]) => void;
  setBorrowerPriorCountyOptions: (options: CountyOptions[]) => void;
  setCoBorrowerPriorCountyOptions: (options: CountyOptions[]) => void;
  setBorrowerPrior2CountyOptions: (options: CountyOptions[]) => void;
  setCoBorrowerPrior2CountyOptions: (options: CountyOptions[]) => void;
  setBorrowerEmployerCountyOptions: (options: CountyOptions[]) => void;
  setBorrowerPriorEmployerCountyOptions: (options: CountyOptions[]) => void;
  setCoBorrowerEmployerCountyOptions: (options: Record<string, CountyOptions[]>) => void;
  setCoBorrowerPriorEmployerCountyOptions: (options: CountyOptions[]) => void;
  setCoBorrowerSecondEmployerCountyOptions: (options: Record<string, CountyOptions[]>) => void;
  setCountyLookupLoading: (loading: (prev: CountyLookupLoading) => CountyLookupLoading) => void;
  setIsBorrowerCurrentResidencePresent: (isPresent: boolean) => void;
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
      
      // County lookup state initialization
      borrowerCountyOptions: [],
      coBorrowerCountyOptions: [],
      borrowerPriorCountyOptions: [],
      coBorrowerPriorCountyOptions: [],
      borrowerPrior2CountyOptions: [],
      coBorrowerPrior2CountyOptions: [],
      borrowerEmployerCountyOptions: [],
      borrowerPriorEmployerCountyOptions: [],
      coBorrowerEmployerCountyOptions: {},
      coBorrowerPriorEmployerCountyOptions: [],
      coBorrowerSecondEmployerCountyOptions: {},
      countyLookupLoading: {
        borrower: false,
        coBorrower: false,
        borrowerPrior: false,
        coBorrowerPrior: false,
        borrowerPrior2: false,
        coBorrowerPrior2: false,
        borrowerEmployer: false,
        borrowerPriorEmployer: false,
        coBorrowerEmployer: {},
        coBorrowerPriorEmployer: false,
        coBorrowerSecondEmployer: false
      },
      isBorrowerCurrentResidencePresent: false,
      
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
      
      // County lookup setters
      setBorrowerCountyOptions: (options) =>
        set(() => ({
          borrowerCountyOptions: options,
        })),
      
      setCoBorrowerCountyOptions: (options) =>
        set(() => ({
          coBorrowerCountyOptions: options,
        })),
      
      setBorrowerPriorCountyOptions: (options) =>
        set(() => ({
          borrowerPriorCountyOptions: options,
        })),
      
      setCoBorrowerPriorCountyOptions: (options) =>
        set(() => ({
          coBorrowerPriorCountyOptions: options,
        })),
      
      setBorrowerPrior2CountyOptions: (options) =>
        set(() => ({
          borrowerPrior2CountyOptions: options,
        })),
      
      setCoBorrowerPrior2CountyOptions: (options) =>
        set(() => ({
          coBorrowerPrior2CountyOptions: options,
        })),
      
      setBorrowerEmployerCountyOptions: (options) =>
        set(() => ({
          borrowerEmployerCountyOptions: options,
        })),
      
      setBorrowerPriorEmployerCountyOptions: (options) =>
        set(() => ({
          borrowerPriorEmployerCountyOptions: options,
        })),
      
      setCoBorrowerEmployerCountyOptions: (options) =>
        set(() => ({
          coBorrowerEmployerCountyOptions: options,
        })),
      
      setCoBorrowerPriorEmployerCountyOptions: (options) =>
        set(() => ({
          coBorrowerPriorEmployerCountyOptions: options,
        })),
      
      setCoBorrowerSecondEmployerCountyOptions: (options) =>
        set(() => ({
          coBorrowerSecondEmployerCountyOptions: options,
        })),
      
      setCountyLookupLoading: (loadingUpdater) =>
        set((state) => ({
          countyLookupLoading: loadingUpdater(state.countyLookupLoading),
        })),
      
      setIsBorrowerCurrentResidencePresent: (isPresent) =>
        set(() => ({
          isBorrowerCurrentResidencePresent: isPresent,
        })),
    }),
    { name: 'add-client-store' }
  )
);