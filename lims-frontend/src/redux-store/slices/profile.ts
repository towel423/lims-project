import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of the profile data
export interface Profile {
  username: string;
  fullname: string;
  email?: string; // Add any additional fields as needed
}

interface ProfileState {
  profile: Profile | null;
}

// Initial state for the profile slice
const initialState: ProfileState = {
  profile: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Profile>) => {
      state.profile = action.payload;
    },
    clearProfile: state => {
      state.profile = null;
    },
  },
});

// Export the actions
export const { setProfile, clearProfile } = profileSlice.actions;

// Export the reducer
export default profileSlice.reducer;
