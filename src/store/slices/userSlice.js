import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  role: "buyer",
  preferences: {}
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      // CRITICAL: Always use deep cloning to avoid reference issues
      // This prevents potential issues with object mutations
      state.user = JSON.parse(JSON.stringify(action.payload));
      state.isAuthenticated = !!action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    login: (state, action) => {
      const { email, password } = action.payload;
      
      // Admin credentials validation
      if (email === "ramvidalgmail.com" && password === "Elevation1010$") {
        state.profile = { email, name: "Admin User" };
        state.role = "admin";
        state.isAuthenticated = true;
        return;
      }
      // Could add other user types here
      throw new Error("Credenciales inválidas");
    },
    logout: (state) => {
      state.profile = null;
      state.isAuthenticated = false;
      state.role = "buyer";
    },
    clearUser: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.role = "buyer";
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const { setUser, setRole, login, logout, clearUser, updatePreferences } = userSlice.actions;
export default userSlice.reducer;