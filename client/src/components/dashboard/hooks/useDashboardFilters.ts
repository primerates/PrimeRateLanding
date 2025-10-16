import { useState } from 'react';

export type EntityFilter = 'prime-rate' | string;
export type CategoryFilter = 'select' | 'financials' | 'marketing' | 'staff' | 'vendor';
export type TeamFilter = 'show-all' | 'expense-add' | 'revenue-add' | 'mlo' | string;
export type TimeFilter = 'today' | 'mtd' | 'ytd' | 'custom';

export interface DashboardFiltersState {
  entityFilter: EntityFilter;
  categoryFilter: CategoryFilter;
  teamFilter: TeamFilter;
  timeFilter: TimeFilter;
  timeFilterFromDate: string;
  timeFilterToDate: string;
}

export interface DashboardFiltersActions {
  setEntityFilter: (value: EntityFilter) => void;
  setCategoryFilter: (value: CategoryFilter) => void;
  setTeamFilter: (value: TeamFilter) => void;
  setTimeFilter: (value: TimeFilter) => void;
  setTimeFilterFromDate: (value: string) => void;
  setTimeFilterToDate: (value: string) => void;
  handleTimeFilterDateInput: (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => void;
}

/**
 * Custom hook for managing dashboard filter state
 * Centralizes all filter-related state and handlers
 */
export function useDashboardFilters() {
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('prime-rate');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('select');
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('show-all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [timeFilterFromDate, setTimeFilterFromDate] = useState('');
  const [timeFilterToDate, setTimeFilterToDate] = useState('');

  // Date input handler with auto-formatting (MM/DD/YYYY)
  const handleTimeFilterDateInput = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    if (field === 'from') {
      setTimeFilterFromDate(value);
    } else {
      setTimeFilterToDate(value);
    }
  };

  const state: DashboardFiltersState = {
    entityFilter,
    categoryFilter,
    teamFilter,
    timeFilter,
    timeFilterFromDate,
    timeFilterToDate
  };

  const actions: DashboardFiltersActions = {
    setEntityFilter,
    setCategoryFilter,
    setTeamFilter,
    setTimeFilter,
    setTimeFilterFromDate,
    setTimeFilterToDate,
    handleTimeFilterDateInput
  };

  return {
    ...state,
    ...actions
  };
}
