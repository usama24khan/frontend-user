import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  language: "en" | "ur";
  sidebarOpen: boolean;
  modalOpen: boolean;
}

const initialState: UIState = {
  language: "en",
  sidebarOpen: false,
  modalOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<"en" | "ur">) => {
      state.language = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload;
    },
  },
});

export const { setLanguage, toggleSidebar, setSidebarOpen, setModalOpen } =
  uiSlice.actions;
export default uiSlice.reducer;
