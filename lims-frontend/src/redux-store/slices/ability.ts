import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of the ability data
interface Ability {
  action: string;
  resource: string;
}

export interface AbilityState {
  abilities: Ability[];
}

// Initial state for the ability slice
const initialState: AbilityState = {
  abilities: [] ,
};

const abilitySlice = createSlice({
  name: "ability",
  initialState,
  reducers: {
    setAbilities: (state, action: PayloadAction<Ability[]>) => {
      state.abilities = action.payload;
    },
    clearAbilities: state => {
      state.abilities = [];
    },
  },
});

// Export the actions
export const { setAbilities, clearAbilities } = abilitySlice.actions;

// Export the reducer
export default abilitySlice.reducer;
