import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  year: number;
  block: string;
  phase: number | null;
  monthFrom: string;
  monthTo: string;
  searchQuery: string;
  sortBy: string;
}

const initialState: FiltersState = {
  year: new Date().getFullYear(),
  block: '',
  phase: null,
  monthFrom: 'jan',
  monthTo: 'dec',
  searchQuery: '',
  sortBy: 'plotNumber',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setYear: (state, action: PayloadAction<number>) => { state.year = action.payload; },
    setBlock: (state, action: PayloadAction<string>) => { state.block = action.payload; },
    setPhase: (state, action: PayloadAction<number | null>) => { state.phase = action.payload; },
    setMonthFrom: (state, action: PayloadAction<string>) => { state.monthFrom = action.payload; },
    setMonthTo: (state, action: PayloadAction<string>) => { state.monthTo = action.payload; },
    setSearchQuery: (state, action: PayloadAction<string>) => { state.searchQuery = action.payload; },
    setSortBy: (state, action: PayloadAction<string>) => { state.sortBy = action.payload; },
    resetFilters: () => initialState,
  },
});

export const { setYear, setBlock, setPhase, setMonthFrom, setMonthTo, setSearchQuery, setSortBy, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
