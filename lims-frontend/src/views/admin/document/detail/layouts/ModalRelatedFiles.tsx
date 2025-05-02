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
import { DocumentsType, DocumentTypeDatatable } from '@/types/apps/documentTypes'
import { InternalDocumentTypeDatatable } from '@/types/apps/internalDocumentTypes'
import { ExternalDocumentTypeDatatable } from '@/types/apps/externalDocumentTypes'
import { ApprovalDocumentFormType } from '@/types/apps/documentApprovalType'
import { toast } from 'react-toastify'
import { useParams, useRouter } from 'next/navigation'
import { Autocomplete, Grid, MenuItem, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { RelatedFileFormType } from '@/types/apps/relatedFileTypes'

type Props = {
    isOpen: boolean
    setIsOpen: (cond: boolean) => void
    addRelatedFile: (data: RelatedFileFormType) => Promise<{ status: number; message: string } | void>
    selectListRelatedFiles: DocumentsType[]
}

const initialData: RelatedFileFormType = {
  uuid: '',
  document_control_uuid_target: '',
}

const ModalRelatedFiles = (props: Props) => {
  const { isOpen, setIsOpen, addRelatedFile, selectListRelatedFiles } = props;
  const [isLoading, setIsLoading] = useState(false)

  const { control, handleSubmit, formState: { errors }, reset } = useForm<RelatedFileFormType>({
    defaultValues: initialData
  });

  const router = useRouter()
  const params = useParams()
  const { lang: locale } = params

  const onSubmit = async (formData: RelatedFileFormType) => {
    if(typeof params.uuid === 'string'){
      setIsLoading(true);

      let response = await addRelatedFile({ document_control_uuid_target: formData.document_control_uuid_target, uuid: params.uuid });

      if (response?.status == 201) {
        toast.success("Successfully add related file", {
          position: "top-right",
          autoClose: 2000,
          // onClose: () => router.push(`/${locale}/admin/document-approval`),
          onClose: () => {
            setIsOpen(false)
            setIsLoading(false)
            reset();
          },
        });
      } else {
        
        toast.error(response?.message, {
          position: "top-right",
          autoClose: 2000,
          // onClose: () => router.push(`/${locale}/admin/document-approval`),
          onClose: () => {
            setIsOpen(false)
            setIsLoading(false)
            reset();
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
        aria-labelledby='form-dialog-title'
        sx={{ 
          '& .MuiDialog-paper': { 
            width: '500px',
            maxWidth: '100%'
          } 
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle id='form-dialog-title'>File Terkait</DialogTitle>
        <DialogContent>
          {/* <form onSubmit={handleSubmit(onSubmit)}> */}
            <DialogContentText className='mbe-3'>
              {/* To subscribe to this website, please enter your email address here. We will send updates occasionally. */}
            </DialogContentText>

            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Controller
                  name="document_control_uuid_target"
                  control={control}
                  rules={{ required: 'Document related is required' }}
                  render={({ field }) => (
                    <Autocomplete
                      options={selectListRelatedFiles} // List of documents
                      getOptionLabel={(option: any) => option.document_number} // Display document_number in options
                      isOptionEqualToValue={(option: any, value: any) => option.uuid === value.uuid} // Compare by uuid
                      onChange={(_, newValue: any) => field.onChange(newValue?.uuid || '')} // Update the field value
                      renderInput={(params: any) => (
                        <TextField
                          {...params}
                          label="Document Related"
                          error={!!errors.document_control_uuid_target} // Show error state
                          helperText={
                            errors.document_control_uuid_target
                              ? (errors.document_control_uuid_target.message as string)
                              : ''
                          }
                        />
                      )}
                      value={
                        selectListRelatedFiles.find((doc) => doc.uuid === field.value) || null
                      } // Match current value to the option
                    />
                  )}
                />
              </Grid>
            </Grid>

            
          {/* </form> */}
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
              <Button variant='contained' type='submit' disabled={isLoading} >Save</Button>
              <Button variant='outlined' type='reset' color='secondary' disabled={isLoading} onClick={() => {
                setIsOpen(false);
              }}>
                Cancel
              </Button>
        </DialogActions>
        </form>
      </Dialog>
  )
}

export default ModalRelatedFiles
