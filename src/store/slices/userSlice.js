import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  role: "buyer", // buyer, admin, staff
  isAuthenticated: false,
  preferences: {
    theme: "light",
    language: "es",
  },
};

const userSlice = createSlice({
name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.profile = action.payload;
      state.isAuthenticated = true;
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