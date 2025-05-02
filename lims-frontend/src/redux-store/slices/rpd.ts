import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of the RPD data
interface RPD {
  v1: string;
  v2: string;
  v3: string;
  v4: string;
  v5: string;
}

export interface RPDState {
  rpd: RPD[];
}

// Initial state for the RPD slice
const initialState: RPDState = {
  rpd: [],
};

const RPDSlice = createSlice({
  name: "rpd",
  initialState,
  reducers: {
    setrpd: (state, action: PayloadAction<RPD[]>) => {
      state.rpd = action.payload;
    },
    clearrpd: state => {
      state.rpd = [];
    },
  },
});

// Export the actions
export const { setrpd, clearrpd } = RPDSlice.actions;

// Export the reducer
export default RPDSlice.reducer;
