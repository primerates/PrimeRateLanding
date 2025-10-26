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
  isCoBorrowerOpen: boolean;
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
  // Loan state
  newRefinanceLoanCards: string[];
  newPurchaseLoanCards: string[];
  currentPrimaryLoans: string[];
  currentSecondLoans: string[];
  currentThirdLoans: string[];
  loanCardStates: Record<string, boolean>;
  setUnsavedChangesDialog: (dialog: { isOpen: boolean }) => void;
  setMaritalStatusDialog: (dialog: { isOpen: boolean }) => void;
  setIsShowingDMBatch: (isShowing: boolean) => void;
  setIsBorrowerOpen: (isOpen: boolean) => void;
  setIsCoBorrowerOpen: (isOpen: boolean) => void;
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
  // Loan actions
  addLoan: (type: 'refinance' | 'purchase' | 'primary' | 'second' | 'third') => string;
  removeLoan: (loanId: string) => void;
  clearLoansOfType: (type: 'refinance' | 'purchase' | 'primary' | 'second' | 'third') => void;
  setLoanCardExpanded: (loanId: string, expanded: boolean) => void;
  expandAllLoans: () => void;
  minimizeAllLoans: () => void;
}

export const useAdminAddClientStore = create<AddAdminClientStore>()(
  devtools(
    (set) => ({
      unsavedChangesDialog: { isOpen: false },
      maritalStatusDialog: { isOpen: false },
      isShowingDMBatch: false,
      isBorrowerOpen: true,
      isCoBorrowerOpen: true,
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

      // Loan state initialization
      newRefinanceLoanCards: [],
      newPurchaseLoanCards: [],
      currentPrimaryLoans: [],
      currentSecondLoans: [],
      currentThirdLoans: [],
      loanCardStates: {},
      
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
      
      setIsCoBorrowerOpen: (isOpen) =>
        set(() => ({
          isCoBorrowerOpen: isOpen,
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

      // Loan actions
      addLoan: (type) => {
        const newLoanId = `${type}-${Date.now()}`;
        set((state) => {
          const newState: Partial<AddAdminClientStore> = {
            loanCardStates: { ...state.loanCardStates, [newLoanId]: true }
          };

          if (type === 'refinance') {
            newState.newRefinanceLoanCards = [...state.newRefinanceLoanCards, newLoanId];
          } else if (type === 'purchase') {
            newState.newPurchaseLoanCards = [...state.newPurchaseLoanCards, newLoanId];
          } else if (type === 'primary') {
            newState.currentPrimaryLoans = [...state.currentPrimaryLoans, newLoanId];
          } else if (type === 'second') {
            newState.currentSecondLoans = [...state.currentSecondLoans, newLoanId];
          } else if (type === 'third') {
            newState.currentThirdLoans = [...state.currentThirdLoans, newLoanId];
          }

          return newState;
        });
        return newLoanId;
      },

      removeLoan: (loanId) =>
        set((state) => {
          const { [loanId]: _, ...restCardStates } = state.loanCardStates;
          const newState: Partial<AddAdminClientStore> = {
            loanCardStates: restCardStates
          };

          if (loanId.startsWith('refinance-')) {
            newState.newRefinanceLoanCards = state.newRefinanceLoanCards.filter(id => id !== loanId);
          } else if (loanId.startsWith('purchase-')) {
            newState.newPurchaseLoanCards = state.newPurchaseLoanCards.filter(id => id !== loanId);
          } else if (loanId.startsWith('primary-')) {
            newState.currentPrimaryLoans = state.currentPrimaryLoans.filter(id => id !== loanId);
          } else if (loanId.startsWith('second-')) {
            newState.currentSecondLoans = state.currentSecondLoans.filter(id => id !== loanId);
          } else if (loanId.startsWith('third-')) {
            newState.currentThirdLoans = state.currentThirdLoans.filter(id => id !== loanId);
          }

          return newState;
        }),

      clearLoansOfType: (type) =>
        set((state) => {
          const newState: Partial<AddAdminClientStore> = {
            loanCardStates: { ...state.loanCardStates }
          };

          if (type === 'refinance') {
            state.newRefinanceLoanCards.forEach(id => delete newState.loanCardStates![id]);
            newState.newRefinanceLoanCards = [];
          } else if (type === 'purchase') {
            state.newPurchaseLoanCards.forEach(id => delete newState.loanCardStates![id]);
            newState.newPurchaseLoanCards = [];
          } else if (type === 'primary') {
            state.currentPrimaryLoans.forEach(id => delete newState.loanCardStates![id]);
            newState.currentPrimaryLoans = [];
          } else if (type === 'second') {
            state.currentSecondLoans.forEach(id => delete newState.loanCardStates![id]);
            newState.currentSecondLoans = [];
          } else if (type === 'third') {
            state.currentThirdLoans.forEach(id => delete newState.loanCardStates![id]);
            newState.currentThirdLoans = [];
          }

          return newState;
        }),

      setLoanCardExpanded: (loanId, expanded) =>
        set((state) => ({
          loanCardStates: { ...state.loanCardStates, [loanId]: expanded }
        })),

      expandAllLoans: () =>
        set((state) => {
          const expandedStates: Record<string, boolean> = {};
          [
            ...state.newRefinanceLoanCards,
            ...state.newPurchaseLoanCards,
            ...state.currentPrimaryLoans,
            ...state.currentSecondLoans,
            ...state.currentThirdLoans
          ].forEach(id => { expandedStates[id] = true; });
          return { loanCardStates: expandedStates };
        }),

      minimizeAllLoans: () =>
        set((state) => {
          const minimizedStates: Record<string, boolean> = {};
          [
            ...state.newRefinanceLoanCards,
            ...state.newPurchaseLoanCards,
            ...state.currentPrimaryLoans,
            ...state.currentSecondLoans,
            ...state.currentThirdLoans
          ].forEach(id => { minimizedStates[id] = false; });
          return { loanCardStates: minimizedStates };
        }),
    }),
    { name: 'add-client-store' }
  )
);