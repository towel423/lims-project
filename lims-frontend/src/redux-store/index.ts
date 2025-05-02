import { configureStore } from "@reduxjs/toolkit";
import jwtReducer, { JwtState } from "./slices/jwt";
import abilityReducer, { AbilityState } from "./slices/ability";
import profileReducer, { Profile } from "./slices/profile";
import { RPDState } from "./slices/rpd";

export const store = configureStore({
  reducer: {
    jwt: jwtReducer,
    ability: abilityReducer,
    profile: profileReducer,
  },
});
export interface ProfileState {
  profile: Profile;
}
// Define RootState type
export type RootState = {
  jwt: JwtState; // Assuming you have a JwtState interface defined for JWT slice
  ability: AbilityState;
  profile: ProfileState;
  rpd: RPDState;
};
export type AppDispatch = typeof store.dispatch;
