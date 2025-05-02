import React, { useEffect, useState } from "react";
import { usePublicationForm } from "@/hooks/forms/admin/usePublicationForm";
import { useCreatePublication } from "@/hooks/mutation/admin/publication/useCreatePublication";
import { useUpdatePublication } from "@/hooks/mutation/admin/publication/useUpdatePublication";
import { usePublicationTable } from "@/hooks/data/usePublicationData";
import {
  IPublication,
  IPublicationCategory,
  IUpdatePublication,
} from "@/interface/admin/publication";
import { AdminPublicationValues } from "@/schema/admin/publication";
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
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useDropzone } from "react-dropzone";
import { Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import style Quill
import CustomTextField from "../../../@core/components/mui/TextField";
import { usePublicCategory } from "../../../hooks/query/admin/usePublicationCategory";
import { textToSlug } from "../../../utils/string";

export default function AdminPublicationForm() {
  const { form, selected, setOpen, data } = usePublicationForm();
  // console.log("🚀 ~ AdminPublicationForm ~ data:", data);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutateAsync: addPublication } = useCreatePublication();
  const { mutateAsync: updatePublication } = useUpdatePublication();
  const { refetch } = usePublicationTable();

  const { errors } = form.formState; // Get errors from form state

  const { data: publicCategoryData } = usePublicCategory();

  // States
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  // console.log("🚀 ~ AdminPublicationForm ~ imageUrl:", imageUrl);
  useEffect(() => {
    // Check if the form data is loaded
    if (data) {
      setIsLoading(false); // Set loading to false when data is available
    }
  }, [data]);

  useEffect(() => {
    setImageUrl(data?.img);
  }, [selected, data]);

  // Hooks
  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    form.setValue("img", acceptedFiles[0]); // Set the file in the form state
    setImageUrl("");
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
  });

  const onSubmit = async (values: AdminPublicationValues) => {
    console.log('Data update', values);

    setIsLoading(true);
    try {
      const updatedValues = {
        ...values,
        img: file,
        category_id: parseInt(values.CategoryID),
        slug: textToSlug(values.title),
      };

      if (!selected) {
        await addPublication(updatedValues); // Panggil API dengan data yang telah diubah
      } else {
        await updatePublication(updatedValues);
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
      <CardHeader title={selected ? "Edit Publication" : "Add Publication"} />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Title Field with Error Handling */}
            <Box sx={{ marginBottom: "1rem" }}>
              <Controller
                name="CategoryID"
                control={form.control}
                render={({ field }) => (
                  <Box
                    sx={{
                      display: "flex",
                      gap: "10px",
                      flexDirection: "column",
                    }}
                  >
                    <InputLabel required>Type Publication</InputLabel>
                    <TextField
                      select
                      {...field}
                      value={field?.value} // Ensure value is never undefined
                      onChange={(e) => field.onChange(e)}
                      placeholder="Please Select the category of new publication"
                      error={
                        form?.formState.errors.CategoryID &&
                        Boolean(form?.formState?.errors?.CategoryID)
                      }
                      helperText={
                        form?.formState.errors
                          ? form?.formState?.errors?.CategoryID?.message
                          : null
                      }
                    >
                      <MenuItem value="">Select a category</MenuItem> {/* Default Option */}
                      {publicCategoryData?.data?.data?.map((row: IPublicationCategory) => (
                        <MenuItem key={row.id} value={row.id}>
                          {row.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                )}
              />
            </Box>

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
                    placeholder="Please input a title of publication"
                    error={!!errors.title} // Show error state
                    helperText={errors.title?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            {/* Link Field with Error Handling */}
            <Box sx={{ marginBottom: "2rem" }}>
              <Controller
                name="caption"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Caption"
                    placeholder="Please input a caption of publication"
                    error={!!errors.caption} // Show error state
                    helperText={errors.caption?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>
            <Box sx={{ marginBottom: "2rem" }}>
              <Controller
                name="description"
                control={form.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <ReactQuill
                    {...field}
                    placeholder="Write something here..."
                    theme="snow" // Tema editor React Quill
                  />
                )}
              />
            </Box>

            {/* Image Upload with Error Handling */}
            <Box sx={{ marginBottom: "1rem", marginTop: "1.5rem" }}>
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
                name="img"
                control={form.control}
                rules={{ required: "Image is required" }} // Add validation rule
                render={({ field }) => (
                  <>
                    <Box
                      {...getRootProps({ className: "dropzone" })}
                      {...(file && { sx: { height: 450 } })}
                      sx={{
                        borderRadius: "1px",
                        border: `1px dashed ${errors.img ? "red" : "white"}`,
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
                              onClick={(e) => e.preventDefault()}
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
                      {errors.img && `${errors.img.message}`}
                    </Typography>
                  </>
                )}
              />
            </Box>

            <Box sx={{ marginBottom: "2rem" }}>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <>
                    <InputLabel>Active</InputLabel>
                    <FormControlLabel
                      label="Status"
                      control={
                        <Checkbox
                          checked={parseInt(field?.value || "0", 10) === 1}  // Mengonversi nilai menjadi boolean untuk Checkbox
                          onChange={(e) =>
                            field.onChange(e.target.checked ? "1" : "0")
                          } // Ubah boolean menjadi 1 atau 0
                        />
                      }
                    />
                    {errors.status && (
                      <FormHelperText>{errors.status.message}</FormHelperText>
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
                {!selected ? "Create Publication" : "Update Publication"}
              </Button>
            </Box>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
}
