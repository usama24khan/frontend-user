import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * The portal has one shared account for the whole society — there is no
 * per-resident identity, so the only thing we hold is the signed-in email.
 */
export interface PortalUser {
  email: string;
}

interface AuthState {
  user: PortalUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
};

const STORAGE_KEY = "kkb4_user_auth";

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: PortalUser; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.hydrated = true;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ user: action.payload.user, token: action.payload.token }),
          );
        } catch { /* quota or privacy mode — ignore */ }
      }
    },
    logout: (state) => {
      state.user = null;
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
          if (parsed?.token && parsed?.user) {
            state.user = parsed.user;
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
