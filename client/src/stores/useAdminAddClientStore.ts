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

export interface LoanCategory {
  id: string;
  name: string;
  programs: LoanProgram[];
}

export interface LoanProgram {
  id: string;
  name: string;
}

export interface ThirdPartyService {
  id: string;
  serviceName: string;
}

export interface ThirdPartyCategory {
  id: string;
  categoryName: string;
  services: ThirdPartyService[];
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
  isFhaMipDialogOpen: boolean;
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
  // Loan program/category state
  customLoanCategories: LoanCategory[];
  removedBuiltInCategories: string[];
  removedBuiltInPrograms: string[];
  // Lender/Title state
  customLenders: Array<{ id: string; name: string }>;
  removedBuiltInLenders: string[];
  customTitles: Array<{ id: string; name: string }>;
  removedBuiltInTitles: string[];
  // Property Use/Type state
  customPropertyUses: Array<{ id: string; name: string }>;
  removedBuiltInPropertyUses: string[];
  customPropertyTypes: Array<{ id: string; name: string }>;
  removedBuiltInPropertyTypes: string[];
  // Third Party Services state
  thirdPartyServiceCategories: ThirdPartyCategory[];
  // Quote Tab state
  quoteData: {
    // Form Row 1 fields
    selectedLoanCategory: string;
    isVAExempt: boolean;
    isVAJumboExempt: boolean;
    isCustomTerm: boolean;
    loanTerm: string;
    customTerm: string;
    selectedLoanProgram: string;
    selectedPropertyUse: string;
    selectedPropertyType: string;
    // Form Row 2 fields
    selectedRateIds: number[];
    selectedState: string;
    rateBuydown: string;
    escrowReserves: string;
    monthlyEscrow: string;
    // Form Row 3 fields
    isMidFicoEstimateMode: boolean;
    estimatedFicoValue: string;
    isLtvEstimateMode: boolean;
    estimatedLtvValue: string;
    isLenderCreditMode: boolean;
    selectedLender: string;
    lenderCreditAmount: string;
    isTitleSellerCreditMode: boolean;
    selectedTitle: string;
    titleSellerCreditAmount: string;
    isProcessingMode: boolean;
    underwriting: string;
    // Rate details fields
    quoteLoanProgram: string;
    loanProgramFontSize: string;
    loanProgramColor: string;
    rateValues: string[];
    existingLoanBalanceValues: string[];
    isExistingLoanBalanceSameMode: boolean;
    cashOutAmountValues: string[];
    isCashOutSameMode: boolean;
    rateBuyDownValues: string[];
    vaFundingFeeValues: string[];
    thirdPartyServiceValues: { [serviceId: string]: string[] };
    categorySameModes: { [categoryId: string]: boolean };
    payOffInterestValues: string[];
    propertyInsurance: string;
    propertyTax: string;
    statementEscrowBalance: string;
    monthlyInsurance: string;
    monthlyPropertyTax: string;
    newLoanAmountMip: string;
    monthlyFhaMip: string;
    existingMortgagePayment: string;
    monthlyPaymentDebtsPayOff: string;
    monthlyPaymentOtherDebts: string;
    newEstLoanAmountValues: string[];
    newMonthlyPaymentValues: string[];
    totalMonthlySavingsValues: string[];
    isMonthlyPaymentRowExpanded: boolean;
    isSavingsRowExpanded: boolean;
    vaFirstTimeCashOut: string;
    vaSubsequentCashOut: string;
    vaRateTerm: string;
    vaIRRRL: string;
    isVACalculated: boolean;
    selectedVARow: 'firstTime' | 'subsequent' | 'rateTerm' | 'irrrl' | null;
    // FHA Upfront MIP fields
    fhaMipLoanStartMonthYear: string;
    fhaMipStartingLoanBalance: string;
    fhaMipCostFactor: string;
    fhaMipRemainingMonths: string;
    fhaNewLoanAmount: string;
    fhaNewMipCostFactor: string;
  };
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
  setIsFhaMipDialogOpen: (isOpen: boolean) => void;
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
  // Loan program/category actions
  addLoanCategory: (categoryName: string) => void;
  addLoanProgram: (programName: string, categoryId: string) => void;
  removeLoanCategory: (categoryId: string) => void;
  removeLoanProgram: (programId: string, categoryId: string) => void;
  // Lender/Title actions
  addLender: (lenderName: string) => void;
  removeLender: (lenderId: string) => void;
  addTitle: (titleName: string) => void;
  removeTitle: (titleId: string) => void;
  // Property Use/Type actions
  addPropertyUse: (propertyUseName: string) => void;
  removePropertyUse: (propertyUseId: string) => void;
  addPropertyType: (propertyTypeName: string) => void;
  removePropertyType: (propertyTypeId: string) => void;
  // Third Party Services actions
  setThirdPartyServiceCategories: (categories: ThirdPartyCategory[]) => void;
  addThirdPartyCategory: (categoryName: string) => void;
  addThirdPartyService: (categoryId: string, serviceName: string) => void;
  editThirdPartyCategoryName: (categoryId: string, newName: string) => void;
  removeThirdPartyCategory: (categoryId: string) => void;
  removeThirdPartyService: (categoryId: string, serviceId: string) => void;
  // Quote Data actions
  updateQuoteData: (updates: Partial<AddAdminClientStore['quoteData']>) => void;
  resetQuoteData: () => void;
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
      isFhaMipDialogOpen: false,
      
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

      // Loan program/category state initialization
      customLoanCategories: [],
      removedBuiltInCategories: [],
      removedBuiltInPrograms: [],

      // Lender/Title state initialization
      customLenders: [],
      removedBuiltInLenders: [],
      customTitles: [],
      removedBuiltInTitles: [],

      // Property Use/Type state initialization
      customPropertyUses: [],
      removedBuiltInPropertyUses: [],
      customPropertyTypes: [],
      removedBuiltInPropertyTypes: [],

      // Third Party Services state initialization
      thirdPartyServiceCategories: [
        {
          id: '1',
          categoryName: 'Third Party Services',
          services: [
            { id: 's1', serviceName: 'VA Funding Fee' },
            { id: 's4', serviceName: 'VA Underwriting Services' },
            { id: 's8', serviceName: 'Processing Services' },
            { id: 's9', serviceName: 'Credit Report Services' },
            { id: 's5', serviceName: 'Title & Escrow Services' },
            { id: 's7', serviceName: 'State Tax & Recording' },
          ]
        }
      ],

      // Quote Data state initialization
      quoteData: {
        // Form Row 1 fields
        selectedLoanCategory: '',
        isVAExempt: false,
        isVAJumboExempt: false,
        isCustomTerm: false,
        loanTerm: 'select',
        customTerm: '',
        selectedLoanProgram: 'select',
        selectedPropertyUse: 'select',
        selectedPropertyType: 'select',
        // Form Row 2 fields
        selectedRateIds: [],
        selectedState: 'select',
        rateBuydown: 'yes',
        escrowReserves: 'new-escrow-reserves',
        monthlyEscrow: 'includes-tax-insurance',
        // Form Row 3 fields
        isMidFicoEstimateMode: false,
        estimatedFicoValue: '',
        isLtvEstimateMode: false,
        estimatedLtvValue: '',
        isLenderCreditMode: false,
        selectedLender: 'select',
        lenderCreditAmount: '',
        isTitleSellerCreditMode: false,
        selectedTitle: 'select',
        titleSellerCreditAmount: '',
        isProcessingMode: false,
        underwriting: 'financed',
        // Rate details fields
        quoteLoanProgram: '',
        loanProgramFontSize: 'text-2xl',
        loanProgramColor: 'text-foreground',
        rateValues: Array(4).fill(''),
        existingLoanBalanceValues: Array(4).fill(''),
        isExistingLoanBalanceSameMode: false,
        cashOutAmountValues: Array(4).fill(''),
        isCashOutSameMode: false,
        rateBuyDownValues: Array(4).fill(''),
        vaFundingFeeValues: Array(4).fill(''),
        thirdPartyServiceValues: {
          's1': Array(4).fill(''),
          's4': Array(4).fill(''),
          's8': Array(4).fill(''),
          's9': Array(4).fill(''),
          's5': Array(4).fill(''),
          's6': Array(4).fill(''),
          's7': Array(4).fill(''),
        },
        categorySameModes: { '1': false },
        payOffInterestValues: Array(4).fill(''),
        propertyInsurance: '',
        propertyTax: '',
        statementEscrowBalance: '',
        monthlyInsurance: '',
        monthlyPropertyTax: '',
        newLoanAmountMip: '',
        monthlyFhaMip: '',
        existingMortgagePayment: '',
        monthlyPaymentDebtsPayOff: '',
        monthlyPaymentOtherDebts: '',
        newEstLoanAmountValues: Array(4).fill(''),
        newMonthlyPaymentValues: Array(4).fill(''),
        totalMonthlySavingsValues: Array(4).fill(''),
        isMonthlyPaymentRowExpanded: true,
        isSavingsRowExpanded: true,
        vaFirstTimeCashOut: '',
        vaSubsequentCashOut: '',
        vaRateTerm: '',
        vaIRRRL: '',
        isVACalculated: false,
        selectedVARow: null,
        // FHA Upfront MIP fields
        fhaMipLoanStartMonthYear: '',
        fhaMipStartingLoanBalance: '',
        fhaMipCostFactor: '1.75',
        fhaMipRemainingMonths: '',
        fhaNewLoanAmount: '',
        fhaNewMipCostFactor: '1.75',
      },

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

      setIsFhaMipDialogOpen: (isOpen) =>
        set(() => ({
          isFhaMipDialogOpen: isOpen,
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

      // Loan program/category actions
      addLoanCategory: (categoryName) =>
        set((state) => {
          const newCategory: LoanCategory = {
            id: categoryName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            name: categoryName,
            programs: []
          };
          return {
            customLoanCategories: [...state.customLoanCategories, newCategory]
          };
        }),

      addLoanProgram: (programName, categoryId) =>
        set((state) => {
          const newProgram: LoanProgram = {
            id: programName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            name: programName
          };

          // Check if it's a built-in category (fixed-rate or adjustable-rate)
          const BUILT_IN_CATEGORY_IDS = ['fixed-rate', 'adjustable-rate'];

          if (BUILT_IN_CATEGORY_IDS.includes(categoryId)) {
            // Find existing custom copy or create new one
            const existingCustomCopy = state.customLoanCategories.find(cat => cat.id === categoryId);

            if (existingCustomCopy) {
              // Add program to existing custom copy
              return {
                customLoanCategories: state.customLoanCategories.map(cat =>
                  cat.id === categoryId
                    ? { ...cat, programs: [...cat.programs, newProgram] }
                    : cat
                )
              };
            } else {
              // Create custom copy of built-in category with new program
              // Note: We only store the new program, built-in programs are managed separately
              const newCategoryCopy: LoanCategory = {
                id: categoryId,
                name: categoryId === 'fixed-rate' ? 'Fixed Rate' : 'Adjustable Rate',
                programs: [newProgram]
              };
              return {
                customLoanCategories: [...state.customLoanCategories, newCategoryCopy]
              };
            }
          } else {
            // Add to custom category
            return {
              customLoanCategories: state.customLoanCategories.map(cat =>
                cat.id === categoryId
                  ? { ...cat, programs: [...cat.programs, newProgram] }
                  : cat
              )
            };
          }
        }),

      removeLoanCategory: (categoryId) =>
        set((state) => {
          const BUILT_IN_CATEGORY_IDS = ['fixed-rate', 'adjustable-rate'];

          if (BUILT_IN_CATEGORY_IDS.includes(categoryId)) {
            // Mark built-in category as removed
            return {
              removedBuiltInCategories: [...state.removedBuiltInCategories, categoryId]
            };
          } else {
            // Remove custom category
            return {
              customLoanCategories: state.customLoanCategories.filter(cat => cat.id !== categoryId)
            };
          }
        }),

      removeLoanProgram: (programId, categoryId) =>
        set((state) => {
          // Check if it's a built-in program
          const BUILT_IN_PROGRAMS = [
            '30-year-fixed', '25-year-fixed', '20-year-fixed', '15-year-fixed', '10-year-fixed',
            '10-1-arm', '7-1-arm', '5-1-arm', '3-1-arm', '1-1-arm'
          ];

          if (BUILT_IN_PROGRAMS.includes(programId)) {
            // Mark built-in program as removed
            return {
              removedBuiltInPrograms: [...state.removedBuiltInPrograms, programId]
            };
          } else {
            // Remove from custom category
            return {
              customLoanCategories: state.customLoanCategories.map(cat =>
                cat.id === categoryId
                  ? { ...cat, programs: cat.programs.filter(prog => prog.id !== programId) }
                  : cat
              )
            };
          }
        }),

      // Lender/Title actions
      addLender: (lenderName) =>
        set((state) => {
          const lenderId = lenderName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
          return {
            customLenders: [...state.customLenders, { id: lenderId, name: lenderName }]
          };
        }),

      removeLender: (lenderId) =>
        set((state) => {
          // Check if it's a built-in lender
          const BUILT_IN_LENDERS = ['uwm', 'pennymac', 'rocket-mortgage', 'wells-fargo', 'quicken-loans'];

          if (BUILT_IN_LENDERS.includes(lenderId)) {
            // Mark built-in lender as removed
            return {
              removedBuiltInLenders: [...state.removedBuiltInLenders, lenderId]
            };
          } else {
            // Remove custom lender
            return {
              customLenders: state.customLenders.filter(lender => lender.id !== lenderId)
            };
          }
        }),

      addTitle: (titleName) =>
        set((state) => {
          const titleId = titleName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
          return {
            customTitles: [...state.customTitles, { id: titleId, name: titleName }]
          };
        }),

      removeTitle: (titleId) =>
        set((state) => {
          // Check if it's a built-in title
          const BUILT_IN_TITLES = ['first-american-title', 'reltco', 'chicago-title', 'fidelity-national', 'old-republic'];

          if (BUILT_IN_TITLES.includes(titleId)) {
            // Mark built-in title as removed
            return {
              removedBuiltInTitles: [...state.removedBuiltInTitles, titleId]
            };
          } else {
            // Remove custom title
            return {
              customTitles: state.customTitles.filter(title => title.id !== titleId)
            };
          }
        }),

      // Property Use/Type actions
      addPropertyUse: (propertyUseName) =>
        set((state) => {
          const propertyUseId = propertyUseName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
          return {
            customPropertyUses: [...state.customPropertyUses, { id: propertyUseId, name: propertyUseName }]
          };
        }),

      removePropertyUse: (propertyUseId) =>
        set((state) => {
          // Check if it's a built-in property use
          const BUILT_IN_PROPERTY_USES = ['primary-residence', 'second-home', 'investment-property', 'home-purchase', 'duplex', 'multi-family'];

          if (BUILT_IN_PROPERTY_USES.includes(propertyUseId)) {
            // Mark built-in property use as removed
            return {
              removedBuiltInPropertyUses: [...state.removedBuiltInPropertyUses, propertyUseId]
            };
          } else {
            // Remove custom property use
            return {
              customPropertyUses: state.customPropertyUses.filter(propertyUse => propertyUse.id !== propertyUseId)
            };
          }
        }),

      addPropertyType: (propertyTypeName) =>
        set((state) => {
          const propertyTypeId = propertyTypeName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
          return {
            customPropertyTypes: [...state.customPropertyTypes, { id: propertyTypeId, name: propertyTypeName }]
          };
        }),

      removePropertyType: (propertyTypeId) =>
        set((state) => {
          // Check if it's a built-in property type
          const BUILT_IN_PROPERTY_TYPES = ['single-family', 'condo', 'townhouse', 'duplex', 'multi-family', 'other'];

          if (BUILT_IN_PROPERTY_TYPES.includes(propertyTypeId)) {
            // Mark built-in property type as removed
            return {
              removedBuiltInPropertyTypes: [...state.removedBuiltInPropertyTypes, propertyTypeId]
            };
          } else {
            // Remove custom property type
            return {
              customPropertyTypes: state.customPropertyTypes.filter(propertyType => propertyType.id !== propertyTypeId)
            };
          }
        }),

      // Third Party Services actions
      setThirdPartyServiceCategories: (categories) =>
        set(() => ({
          thirdPartyServiceCategories: categories
        })),

      addThirdPartyCategory: (categoryName) =>
        set((state) => {
          const newCategory: ThirdPartyCategory = {
            id: `custom-cat-${Date.now()}`,
            categoryName,
            services: []
          };
          return {
            thirdPartyServiceCategories: [...state.thirdPartyServiceCategories, newCategory]
          };
        }),

      addThirdPartyService: (categoryId, serviceName) =>
        set((state) => {
          const newService: ThirdPartyService = {
            id: `custom-service-${Date.now()}`,
            serviceName
          };
          return {
            thirdPartyServiceCategories: state.thirdPartyServiceCategories.map(category =>
              category.id === categoryId
                ? { ...category, services: [...category.services, newService] }
                : category
            )
          };
        }),

      editThirdPartyCategoryName: (categoryId, newName) =>
        set((state) => ({
          thirdPartyServiceCategories: state.thirdPartyServiceCategories.map(category =>
            category.id === categoryId
              ? { ...category, categoryName: newName }
              : category
          )
        })),

      removeThirdPartyCategory: (categoryId) =>
        set((state) => ({
          thirdPartyServiceCategories: state.thirdPartyServiceCategories.filter(
            category => category.id !== categoryId
          )
        })),

      removeThirdPartyService: (categoryId, serviceId) =>
        set((state) => ({
          thirdPartyServiceCategories: state.thirdPartyServiceCategories.map(category =>
            category.id === categoryId
              ? { ...category, services: category.services.filter(service => service.id !== serviceId) }
              : category
          )
        })),

      // Quote Data actions
      updateQuoteData: (updates) =>
        set((state) => ({
          quoteData: { ...state.quoteData, ...updates }
        })),

      resetQuoteData: () =>
        set(() => ({
          quoteData: {
            // Form Row 1 fields
            selectedLoanCategory: '',
            isVAExempt: false,
            isVAJumboExempt: false,
            isCustomTerm: false,
            loanTerm: 'select',
            customTerm: '',
            selectedLoanProgram: 'select',
            selectedPropertyUse: 'select',
            selectedPropertyType: 'select',
            // Form Row 2 fields
            selectedRateIds: [],
            selectedState: 'select',
            rateBuydown: 'yes',
            escrowReserves: 'new-escrow-reserves',
            monthlyEscrow: 'includes-tax-insurance',
            // Form Row 3 fields
            isMidFicoEstimateMode: false,
            estimatedFicoValue: '',
            isLtvEstimateMode: false,
            estimatedLtvValue: '',
            isLenderCreditMode: false,
            selectedLender: 'select',
            lenderCreditAmount: '',
            isTitleSellerCreditMode: false,
            selectedTitle: 'select',
            titleSellerCreditAmount: '',
            isProcessingMode: false,
            underwriting: 'financed',
            // Rate details fields
            quoteLoanProgram: '',
            loanProgramFontSize: 'text-2xl',
            loanProgramColor: 'text-foreground',
            rateValues: Array(4).fill(''),
            existingLoanBalanceValues: Array(4).fill(''),
            isExistingLoanBalanceSameMode: false,
            cashOutAmountValues: Array(4).fill(''),
            isCashOutSameMode: false,
            rateBuyDownValues: Array(4).fill(''),
            vaFundingFeeValues: Array(4).fill(''),
            thirdPartyServiceValues: {
              's1': Array(4).fill(''),
              's4': Array(4).fill(''),
              's8': Array(4).fill(''),
              's9': Array(4).fill(''),
              's5': Array(4).fill(''),
              's6': Array(4).fill(''),
              's7': Array(4).fill(''),
            },
            categorySameModes: { '1': false },
            payOffInterestValues: Array(4).fill(''),
            propertyInsurance: '',
            propertyTax: '',
            statementEscrowBalance: '',
            monthlyInsurance: '',
            monthlyPropertyTax: '',
            newLoanAmountMip: '',
            monthlyFhaMip: '',
            existingMortgagePayment: '',
            monthlyPaymentDebtsPayOff: '',
            monthlyPaymentOtherDebts: '',
            newEstLoanAmountValues: Array(4).fill(''),
            newMonthlyPaymentValues: Array(4).fill(''),
            totalMonthlySavingsValues: Array(4).fill(''),
            isMonthlyPaymentRowExpanded: true,
            isSavingsRowExpanded: true,
            vaFirstTimeCashOut: '',
            vaSubsequentCashOut: '',
            vaRateTerm: '',
            vaIRRRL: '',
            isVACalculated: false,
            selectedVARow: null,
            // FHA Upfront MIP fields
            fhaMipLoanStartMonthYear: '',
            fhaMipStartingLoanBalance: '',
            fhaMipCostFactor: '1.75',
            fhaMipRemainingMonths: '',
            fhaNewLoanAmount: '',
            fhaNewMipCostFactor: '1.75',
          }
        })),
    }),
    { name: 'add-client-store' }
  )
);