import React, { useEffect, useState } from "react";
import { useTeamForm } from "@/hooks/forms/admin/useTeamForm";
import { useCreateTeam } from "@/hooks/mutation/admin/team/useCreateTeam";
import { useUpdateTeam } from "@/hooks/mutation/admin/team/useUpdateTeam";
import { useTeamTable } from "@/hooks/data/useTeamData";
import {
  ITeam,
  IUpdateTeam,
} from "@/interface/admin/team";
import { AdminTeamValues } from "@/schema/admin/team";
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
import { textToSlug } from "../../../utils/string";

export default function AdminTeamForm() {
  const { form, selected, setOpen, data } = useTeamForm();
  console.log("🚀 ~ AdminTeamForm ~ data:", data);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutateAsync: addTeam } = useCreateTeam();
  const { mutateAsync: updateTeam } = useUpdateTeam();
  const { refetch } = useTeamTable();

  const { errors } = form.formState; // Get errors from form state

  // States
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    setImageUrl(data?.photo);
  }, [selected, data]);

  // Hooks
  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    form.setValue("photo", acceptedFiles[0]); // Set the file in the form state
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

  const onSubmit = async (values: AdminTeamValues) => {
    setIsLoading(true);
    try {
      const updatedValues = {
        ...values,
        photo: file,
      };

      if (!selected) {
        await addTeam(updatedValues); // Panggil API dengan data yang telah diubah
      } else {
        await updateTeam(updatedValues);
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
      <CardHeader name={selected ? "Edit Team" : "Add Team"} />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <form onSubmit={form.handleSubmit(onSubmit)} {...form}>
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
                    placeholder="Please input a name of team"
                    error={!!errors.name} // Show error state
                    helperText={errors.name?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>

            {/* Link Field with Error Handling */}
            <Box sx={{ marginBottom: "2rem" }}>
              <Controller
                name="position"
                control={form.control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="text"
                    label="Position"
                    placeholder="Please input a position of team"
                    error={!!errors.position} // Show error state
                    helperText={errors.position?.message} // Display error message
                    {...field}
                  />
                )}
              />
            </Box>
            <Box sx={{ marginBottom: "2rem" }}>
              <Controller
                name="content"
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
                name="photo"
                control={form.control}
                rules={{ required: "Image is required" }} // Add validation rule
                render={({ field }) => (
                  <>
                    <Box
                      {...getRootProps({ className: "dropzone" })}
                      {...(file && { sx: { height: 450 } })}
                      sx={{
                        borderRadius: "1px",
                        border: `1px dashed ${errors.photo ? "red" : "white"}`,
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
                      {errors.photo && `${errors.photo.message}`}
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
                {!selected ? "Create Team" : "Update Team"}
              </Button>
            </Box>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
}
