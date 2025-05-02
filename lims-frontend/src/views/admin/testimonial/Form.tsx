import React, { useEffect, useState } from "react";
import { useTestimonialForm } from "@/hooks/forms/admin/useTestimonialForm";
import { useCreateTestimonial } from "@/hooks/mutation/admin/testimonial/useCreateTestimonial";
import { useUpdateTestimonial } from "@/hooks/mutation/admin/testimonial/useUpdateTestimonial";
import { useTestimonialTable } from "@/hooks/data/useTestimonialData";
import { ITestimonial, IUpdateTestimonial } from "@/interface/admin/testimonial";
import { AdminTestimonialValues } from "@/schema/admin/testimonial";
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

export default function AdminTestimonialForm() {
  const { form, selected, setOpen, data } = useTestimonialForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutateAsync: addTestimonial } = useCreateTestimonial();
  const { mutateAsync: updateTestimonial } = useUpdateTestimonial();
  const { refetch } = useTestimonialTable();

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

  const onSubmit = async (values: AdminTestimonialValues) => {
    setIsLoading(true);

    try {
      const updatedValues = {
        ...values,
        // active: values.active === "1",
        image_url: file,
      };

      if (!selected) {
        await addTestimonial(updatedValues); // Panggil API dengan data yang telah diubah
      } else {
        await updateTestimonial(updatedValues);
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
      <CardHeader title={selected ? "Edit Testimonial" : "Add Testimonial"} />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <form onSubmit={form.handleSubmit(onSubmit)} {...form}>
            {/* Title Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="name"
                control={form.control}
                rules={{ required: "Name is required" }} // Add validation rule
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Name"
                    placeholder="Please input a name of testimonial"
                    error={!!errors.name} // Show error state
                    helperText={errors.name?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            {/* Subtitle Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="content"
                control={form.control}
                rules={{ required: "Content is required" }} // Add validation rule
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Content"
                    placeholder="Please input a content of testimonial"
                    error={!!errors.content} // Show error state
                    helperText={errors.content?.message} // Display error message
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
                          width="50%"
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
                {!selected ? "Create Testimonial" : "Update Testimonial"}
              </Button>
            </Box>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
}
