import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of the ability data
interface Rules {
  action: string;
  resource: string;
}

export interface RulesState {
  rules: Rules[];
}

// Initial state for the ability slice
const initialState: RulesState = {
  rules: [],
};

const rulesSlice = createSlice({
  name: "rules",
  initialState,
  reducers: {
    setRules: (state, action: PayloadAction<Rules[]>) => {
      state.rules = action.payload;
    },
    clearRules: state => {
      state.rules = [];
    },
  },
});

// Export the actions
export const { setRules, clearRules } = rulesSlice.actions;

// Export the reducer
export default rulesSlice.reducer;
