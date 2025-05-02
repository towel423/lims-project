import React, { useEffect, useState } from "react";
import { useGalleryForm } from "@/hooks/forms/admin/useGalleryForm";
import { useCreateGallery } from "@/hooks/mutation/admin/gallery/useCreateGallery";
import { useUpdateGallery } from "@/hooks/mutation/admin/gallery/useUpdateGallery";
import { useGalleryTable } from "@/hooks/data/useGalleryData";
import { IGallery, IUpdateGallery } from "@/interface/admin/gallery";
import { AdminGalleryValues } from "@/schema/admin/gallery";
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

export default function AdminGalleryForm() {
  const { form, selected, setOpen, data } = useGalleryForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutateAsync: addGallery } = useCreateGallery();
  const { mutateAsync: updateGallery } = useUpdateGallery();
  const { refetch } = useGalleryTable();

  const { errors } = form.formState; // Get errors from form state

  // States
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [activeCheck, setActiveCheck] = useState<string>("");

  useEffect(() => {
    setImageUrl(data?.image_url);
    setActiveCheck(data?.active);
  }, [selected, data]);

  // Hooks
  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setImageUrl("");
    setActiveCheck("");
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
  });

  const onSubmit = async (values: AdminGalleryValues) => {
    setIsLoading(true);

    try {
      const updatedValues = {
        ...values,
        image_url: file,
      };

      if (!selected) {
        await addGallery(updatedValues); // Panggil API dengan data yang telah diubah
      } else {
        await updateGallery(updatedValues);
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
      <CardHeader title={selected ? "Edit Gallery" : "Add Gallery"} />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <form onSubmit={form.handleSubmit(onSubmit)} {...form}>
            {/* Title Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="year"
                control={form.control}
                rules={{ required: "Year is required" }} // Add validation rule
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Year"
                    placeholder="Please input a year of gallery"
                    error={!!errors.year} // Show error state
                    helperText={errors.year?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            {/* Subtitle Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="category"
                control={form.control}
                rules={{ required: "Category is required" }} // Add validation rule
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Category"
                    placeholder="Please input a category of gallery"
                    error={!!errors.category} // Show error state
                    helperText={errors.category?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            {/* Image Upload with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              {imageUrl && !file && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%", // Adjust based on container height
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Existing"
                    style={{
                      width: "450px",
                      height: "300px",
                      marginBottom: "10px",
                    }}
                  />
                </div>
              )}
              <Controller
                name="image_url"
                control={form.control}
                rules={{ required: "Image is required" }} // Add validation rule
                render={({ field }) => (
                  <>
                    <Box
                      {...getRootProps({ className: "dropzone" })}
                      {...(file && { sx: { height: 450 } })}
                      sx={{
                        borderRadius: "1px",
                        border: `1px dashed ${errors.image_url ? "red" : "white"}`,
                      }}
                    >
                      <input {...getInputProps()} />
                      {file ? (
                        <img
                          key={file.name}
                          alt={file.name}
                          className="single-file-image"
                          src={URL.createObjectURL(file)}
                        />
                      ) : (
                        <div className="flex items-center flex-col">
                          <Avatar
                            variant="rounded"
                            className="bs-12 is-12 mbe-9"
                          >
                            <i className="tabler-upload" />
                          </Avatar>
                          <Typography variant="h4" className="mbe-2.5">
                            Drop files here or click to upload.
                          </Typography>
                          <Typography>
                            Drop files here or click{" "}
                            <a
                              href="/"
                              onClick={e => e.preventDefault()}
                              className="text-textPrimary no-underline"
                            >
                              browse
                            </a>{" "}
                            through your machine
                          </Typography>
                        </div>
                      )}
                    </Box>
                    <Typography variant="h5">
                      {errors.image_url && `${errors.image_url.message}`}
                    </Typography>
                  </>
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
                {!selected ? "Create Gallery" : "Update Gallery"}
              </Button>
            </Box>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
}
