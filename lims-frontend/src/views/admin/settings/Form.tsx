import React, { useEffect, useState } from "react";
import { useSettingsForm } from "@/hooks/forms/admin/useSettingsForm";
import { useCreateSettings } from "@/hooks/mutation/admin/settings/useCreateSettings";
import { useUpdateSettings } from "@/hooks/mutation/admin/settings/useUpdateSettings";
import { useSettingsTable } from "@/hooks/data/useSettingsData";
import { ISettings, IUpdateSettings } from "@/interface/admin/settings";
import { AdminSettingsValues } from "@/schema/admin/settings";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import CustomTextField from "../../../@core/components/mui/TextField";
import { useDropzone } from "react-dropzone";
import { useAtom } from "jotai";
import { alertOpenAtom } from "../../../components/alert/alertAtoms";

export default function AdminSettingsForm() {
  const { form, selected, setOpen, data } = useSettingsForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutateAsync: addSettings } = useCreateSettings();
  const { mutateAsync: updateSettings } = useUpdateSettings();
  const { refetch } = useSettingsTable();

  const { errors } = form.formState; // Get errors from form state

  // States
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [activeCheck, setActiveCheck] = useState<string>("");

  useEffect(() => {
  }, [selected, data]);

  // Hooks
  const onDrop = (acceptedFiles: File[]) => {
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
  });

  const onSubmit = async (values: AdminSettingsValues) => {
    setIsLoading(true);

    try {
      const updatedValues = {
        ...values,
      };

      if (!selected) {
        await addSettings(updatedValues); // Panggil API dengan data yang telah diubah
      } else {
        await updateSettings(updatedValues);
      }

      form.reset(); // Reset setelah mutasi berhasil
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

    refetch();
    setFile(null);
    form.reset(); // Reset form setelah submit
  };

  return (
    <Card>
      <CardHeader title={selected ? "Edit Settings" : "Add Settings"} />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <form onSubmit={form.handleSubmit(onSubmit)} {...form}>
            {/* Title Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="key"
                control={form.control}
                rules={{ required: "Key is required" }} // Add validation rule
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Key"
                    placeholder="Please input a key of settings"
                    error={!!errors.key} // Show error state
                    helperText={errors.key?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            {/* Subtitle Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="value"
                control={form.control}
                rules={{ required: "Value is required" }} // Add validation rule
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Value"
                    placeholder="Please input a value of settings"
                    error={!!errors.value} // Show error state
                    helperText={errors.value?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            <Divider sx={{ my: "20px" }} />
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                color="error"
                sx={{ marginRight: "1.5rem" }}
                type="button"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "primary.800" }}
                type="submit"
                disabled={isLoading}
              >
                {!selected ? "Create Settings" : "Update Settings"}
              </Button>
            </Box>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
}
