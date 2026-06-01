import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ResidentProfile {
  id: string;
  plotNumber: string;
  block: string;
  phase: string;
  plotBlock: string;
  plotCode: string;
  ownerName: string;
}

interface AuthState {
  resident: ResidentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const initialState: AuthState = {
  resident: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
};

const STORAGE_KEY = "kkb4_resident_auth";

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ resident: ResidentProfile; token: string }>,
    ) => {
      state.resident = action.payload.resident;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.hydrated = true;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ resident: action.payload.resident, token: action.payload.token }),
          );
        } catch { /* quota or privacy mode — ignore */ }
      }
    },
    logout: (state) => {
      state.resident = null;
      state.token = null;
      state.isAuthenticated = false;
      state.hydrated = true;
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    initializeAuth: (state) => {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.token && parsed?.resident) {
            state.resident = parsed.resident;
            state.token = parsed.token;
            state.isAuthenticated = true;
          }
        }
      } catch { /* corrupted storage — ignore */ }
      state.hydrated = true;
    },
  },
});

export const { setCredentials, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
