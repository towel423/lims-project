import { atom, useAtom } from "jotai";
import { AlertColor } from "@mui/material";

// Define the type for the alert
type AlertType = {
  message: string;
  severity: AlertColor;
};

// Atom to hold alert state
export const alertAtom = atom<AlertType | null>(null);

// Atom to control visibility of the alert
export const alertOpenAtom = atom(false);
