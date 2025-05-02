// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { toast } from 'react-toastify'
import { useParams } from 'next/navigation'
import { Grid, MenuItem } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { RoleType } from '@/types/apps/roleTypes'
import { FilePermissionFormType } from '@/types/apps/filePermissionTypes'

type Props = {
    isOpen: boolean
    setIsOpen: (cond: boolean) => void
    addRole: (data: FilePermissionFormType) => Promise<{ status: number; message: string } | void>
    selectListRoles: RoleType[]
    
}

const initialData: FilePermissionFormType = {
  uuid: '',
  guard_name: '',
}


const ModalFilePermission = (props: Props) => {
  const { isOpen, setIsOpen, addRole, selectListRoles } = props;

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FilePermissionFormType>({
    defaultValues: initialData
  });

  const params = useParams()

  const onSubmit = async (formData: FilePermissionFormType) => {
    if(typeof params.uuid === 'string'){

      let response = await addRole({ guard_name: formData.guard_name, uuid: params.uuid });

      if (response?.status == 200) {
              toast.success("Successfully add file permission", {
                position: "top-right",
                autoClose: 2000,
                // onClose: () => router.push(`/${locale}/admin/document-approval`),
                onClose: () => {
                  setIsOpen(false)
                },
              });
            } else {
              toast.error(response?.message, {
                position: "top-right",
                autoClose: 2000,
                // onClose: () => router.push(`/${locale}/admin/document-approval`),
                onClose: () => {
                  setIsOpen(false)
                },
              });
            }
    }
  };

  const handleClose = () => setIsOpen(false)


  return (
        <Dialog
          open={isOpen}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
          sx={{
            '& .MuiDialog-paper': {
              width: '500px',
              maxWidth: '100%',
            },
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle id="form-dialog-title">Roles</DialogTitle>
            <DialogContent>
              <DialogContentText className="mbe-3">
                {/* To subscribe to this website, please enter your email address here. We will send updates occasionally. */}
              </DialogContentText>

              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <Controller
                    name="guard_name"
                    control={control}
                    rules={{ required: 'Role is required' }}
                    render={({ field }) => (
                      <CustomTextField
                        select
                        fullWidth
                        label="Role"
                        {...field}
                        value={field.value ?? ''} // Ensure an empty string for null/undefined
                        error={!!errors.guard_name} // Display error state
                        helperText={errors.guard_name ? errors.guard_name.message : ''} // Show error message
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              style: {
                                maxHeight: 300, // Set max height for the dropdown
                                overflowY: 'auto', // Enable vertical scrolling
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Role</MenuItem>
                        {selectListRoles?.map((role) => (
                          <MenuItem key={role.guard_name} value={role.guard_name}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions className="dialog-actions-dense">
              <Button variant="contained" type="submit">
                Save
              </Button>
              <Button
                variant="outlined"
                type="reset"
                color="secondary"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </Dialog>
  )
}

export default ModalFilePermission