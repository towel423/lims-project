import { useAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { useCallback } from "react";

/*
 *********************************
 * Save JWT and Abilities to local storage *
 *********************************
 */

// JWT Storage
const storage = createJSONStorage<Jwt>(() => localStorage);

// Ability Storage (for an array of Ability objects)
const storageAbility = createJSONStorage<Ability[]>(() => localStorage);


// Atoms for JWT and Ability storage
const someAtom = atomWithStorage("jwt", { token: "" }, storage);
const abilityAtom = atomWithStorage("ability", [] as Ability[], storageAbility); // Store array of Ability objects

export const useProfileUser = () => {
  const [jwt, setJwt] = useAtom(someAtom);
  const [ability, setAbility] = useAtom(abilityAtom);

  // Function to reset JWT and Abilities
  const resetJwt = useCallback(() => {
    setJwt({ token: "" }); // Reset JWT token
    setAbility([]); // Reset ability to an empty array
  }, [setJwt, setAbility]);

  return {
    jwt,
    setJwt,
    ability,
    setAbility,
    resetJwt,
  };
};

// Interfaces for JWT and Ability
interface Jwt {
  token: string;
}

interface Ability {
  action: string;
  resource: string;
}
