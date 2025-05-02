"use client";
import React, { ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useAtom } from "jotai";
import { alertAtom, alertOpenAtom } from "./alertAtoms"; // Import your Atoms

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useAtom(alertAtom); // Access the alert state
  const [open, setOpen] = useAtom(alertOpenAtom); // Access the alert open state
  console.log("🚀 ~ AlertProvider ~ open:", open);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    setOpen(false); // Close the alert
    console.log("🚀 ~ AlertProvider ~ open:", open);
  };

  return (
    <>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000} // Auto-hide duration
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Position of the alert
      >
        {alert ? ( // Ensure that Snackbar children is not null
          <Alert
            onClose={handleClose}
            severity={alert.severity}
            variant="filled"
          >
            {alert.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};
