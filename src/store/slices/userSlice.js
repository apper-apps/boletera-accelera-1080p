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

export const { setUser, setRole, clearUser, updatePreferences } = userSlice.actions;
export default userSlice.reducer;