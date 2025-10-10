import { ComponentType } from 'react';
import BorrowerTab from '../tabs/Borrower';
import IncomeTab from '../tabs/Income';
import PropertyTab from '../tabs/Property';
import LoanTab from '../tabs/Loan';
import CreditTab from '../tabs/Credit';
import StatusTab from '../tabs/Status';
import VendorsTab from '../tabs/Vendors';
import QuoteTab from '../tabs/Quote';
import NotesTab from '../tabs/Notes';

export interface TabData {
  value: string;
  label: string;
  testId: string;
  component: ComponentType;
}

export const TABS_DATA: TabData[] = [
  {
    value: 'client',
    label: 'Borrower',
    testId: 'tab-client',
    component: BorrowerTab
  },
  {
    value: 'income',
    label: 'Income',
    testId: 'tab-income',
    component: IncomeTab
  },
  {
    value: 'property',
    label: 'Property',
    testId: 'tab-property',
    component: PropertyTab
  },
  {
    value: 'loan',
    label: 'Loan',
    testId: 'tab-loan',
    component: LoanTab
  },
  {
    value: 'credit',
    label: 'Credit',
    testId: 'tab-credit',
    component: CreditTab
  },
  {
    value: 'status',
    label: 'Status',
    testId: 'tab-status',
    component: StatusTab
  },
  {
    value: 'vendors',
    label: 'Vendors',
    testId: 'tab-vendors',
    component: VendorsTab
  },
  {
    value: 'quote',
    label: 'Quote',
    testId: 'tab-quote',
    component: QuoteTab
  },
  {
    value: 'notes',
    label: 'Notes',
    testId: 'tab-notes',
    component: NotesTab
  }
];