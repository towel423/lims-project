import React, { useEffect, useState } from "react";
import { useBannerForm } from "@/hooks/forms/admin/useBannerForm";
import { useCreateBanner } from "@/hooks/mutation/admin/banner/useCreateBanner";
import { useUpdateBanner } from "@/hooks/mutation/admin/banner/useUpdateBanner";
import { useBannerTable } from "@/hooks/data/useBannerData";
import { IBanner, IUpdateBanner } from "@/interface/admin/banner";
import { AdminBannerValues } from "@/schema/admin/banner";
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

export default function AdminBannerForm() {
  const { form, selected, setOpen, data } = useBannerForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutateAsync: addBanner } = useCreateBanner();
  const { mutateAsync: updateBanner } = useUpdateBanner();
  const { refetch } = useBannerTable();

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

  const onSubmit = async (values: AdminBannerValues) => {
    setIsLoading(true);

    try {
      const updatedValues = {
        ...values,
        active: values.active === 1,
        image_url: file,
      };

      if (!selected) {
        await addBanner(updatedValues); // Panggil API dengan data yang telah diubah
      } else {
        await updateBanner(updatedValues);
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
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader title={selected ? "Edit Banner" : "Add Banner"} />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <form onSubmit={form.handleSubmit(onSubmit)} {...form}>
            {/* Title Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="title"
                control={form.control}
                rules={{ required: "Title is required" }} // Add validation rule
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Title"
                    placeholder="Please input a title of banner"
                    error={!!errors.title} // Show error state
                    helperText={errors.title?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            {/* Subtitle Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="subtitle"
                control={form.control}
                rules={{ required: "Subtitle is required" }} // Add validation rule
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Sub Title"
                    placeholder="Please input a subtitle of banner"
                    error={!!errors.subtitle} // Show error state
                    helperText={errors.subtitle?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            {/* Link Field with Error Handling */}
            <Box sx={{ marginBottom: "2rem" }}>
              <Controller
                name="link"
                control={form.control}
                rules={{
                  required: "Link is required",
                  pattern: {
                    value: /^https?:\/\/.*$/,
                    message: "Please enter a valid URL", // Validate URL
                  },
                }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="url"
                    label="Link"
                    placeholder="Please input a link of banner"
                    error={!!errors.link} // Show error state
                    helperText={errors.link?.message} // Display error message
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
            {/* <Box sx={{ marginBottom: "2rem" }}>
              <Controller
                name="active"
                control={form.control}
                render={({ field }) => (
                  <>
                    <InputLabel>Active{activeCheck}</InputLabel>
                    <FormControlLabel
                      label="Active"
                      control={<Checkbox checked={data?.active} {...field} />}
                    />
                    {errors.active && (
                      <FormHelperText>{errors.active.message}</FormHelperText>
                    )}
                  </>
                )}
              />
            </Box> */}
            <Box sx={{ marginBottom: "2rem" }}>
              <Controller
                name="active"
                control={form.control}
                render={({ field }) => (
                  <>
                    <InputLabel>Active</InputLabel>
                    <FormControlLabel
                      label="Status"
                      control={
                        <Checkbox
                          checked={field.value === 1}
                          onChange={e =>
                            field.onChange(e.target.checked ? 1 : 0)
                          } // Ubah boolean menjadi 1 atau 0
                        />
                      }
                    />
                    {errors.active && (
                      <FormHelperText>{errors.active.message}</FormHelperText>
                    )}
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
                {!selected ? "Create Banner" : "Update Banner"}
              </Button>
            </Box>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
}
