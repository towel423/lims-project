// React Imports
import { useEffect, useState } from 'react'


// MUI Imports
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { DocumentTypeDatatable } from '@/types/apps/documentTypes'
import { InternalDocumentTypeDatatable } from '@/types/apps/internalDocumentTypes'
import { ExternalDocumentTypeDatatable } from '@/types/apps/externalDocumentTypes'
import { ApprovalDocumentFormType } from '@/types/apps/documentApprovalType'
import { toast } from 'react-toastify'
import { useParams, useRouter } from 'next/navigation'
import { CircularProgress } from '@mui/material';

type Props = {
    isOpen: boolean
    setIsOpen: (cond: boolean) => void
    selectedData: ApprovalDocumentFormType | null
    addApprovalDocument?: (data: ApprovalDocumentFormType) => Promise<{status: number, message: string} | void>
}
const ModalApprovalDocument = (props: Props) => {
  // States
  const { isOpen, setIsOpen, selectedData, addApprovalDocument } = props;
//   const [open, setOpen] = useState<boolean>(false)

//   const handleClickOpen = () => setOpen(true)
  // const [approvalForm, setapprovalForm] = useState<ApprovalDocumentFormType>(selectedData);
  const [approvalForm, setApprovalForm] = useState<ApprovalDocumentFormType>({uuid: '', note: '', approvalType: ''});
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  

  const router = useRouter()
  const params = useParams()
  const { lang: locale } = params

  useEffect(() => {
    if (isOpen && selectedData) {
      setApprovalForm(selectedData);
    }
  }, [isOpen, selectedData]);

  const handleSubmit = async (approvalType: string) => {
    if (addApprovalDocument) {
      setIsSubmitLoading(true);

      toast.promise(
        addApprovalDocument({
              uuid: approvalForm.uuid,
              note: approvalForm.note,
              approvalType,
            }),
        {
          pending: {
            render() {
              return "Saving your approval...";
            },
            icon: <span>⏳</span>,
          },
          success: {
            render({ data }: any) {
              return data.message;
            },
            icon: <span>✅</span>,
            autoClose: 1500,
            onClose: () => {
              setIsSubmitLoading(false);
              setIsOpen(false);
              router.push(`/${locale}/admin/document-approval`)}
            },
          error: {
            render({ data }: any) {
              return data.message;
            },
            icon: <span>❌</span>,
            autoClose: 1500,
            onClose: () => {
              setIsOpen(false);
              setIsSubmitLoading(false);
            },
          },
        }
      );
      
      // let response = await addApprovalDocument({
      //   uuid: approvalForm.uuid,
      //   note: approvalForm.note,
      //   approvalType,
      // });
      
      // let successMsg = `Document successfully approved!`;
      // let failedMsg = `Document failed to approve!`;

      // if (approvalType == 'reject') {
      //   successMsg = `Document successfully rejected!`
      //   failedMsg = `Document failed to reject!`
      // }

      // if (response?.status == 200) {
      //   toast.success(successMsg, {
      //     position: "top-right",
      //     autoClose: 2000,
      //     // onClose: () => router.push(`/${locale}/admin/document-approval`),
      //     onClose: () => {
      //       setApprovalForm({uuid: '', note: '', approvalType: ''})
      //       setIsOpen(false)
      //     },
      //   });
      // } else {
      //   toast.error(failedMsg, {
      //     position: "top-right",
      //     autoClose: 2000,
      //     // onClose: () => router.push(`/${locale}/admin/document-approval`),
      //     onClose: () => {
      //       setApprovalForm({uuid: '', note: '', approvalType: ''})
      //       setIsOpen(false)
      //     },
      //   });
      // }
    }
  };
  

  const handleClose = () => setIsOpen(false);

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
        <DialogTitle id='form-dialog-title'>Approval</DialogTitle>
        <DialogContent>
          {/* <form onSubmit={handleSubmit(onSubmit)}> */}
            <DialogContentText className='mbe-3'>
              {/* To subscribe to this website, please enter your email address here. We will send updates occasionally. */}
            </DialogContentText>
            <CustomTextField id='documentNumber' autoFocus fullWidth type='text' label='No. Dokumen' className='mb-4' disabled={true} value={approvalForm?.document_number} />
            <CustomTextField id='revisionNumber' autoFocus fullWidth type='text' label='No. Revisi' className='mb-4' disabled={true} value={approvalForm?.revision_number} />
            <CustomTextField
              rows={4}
              multiline
              label="Catatan"
              id="textarea-outlined-static"
              className="w-full"
              name="note"
              onChange={(e) => {
                setApprovalForm({ ...approvalForm, note: e.target.value });
              }}
            />
          {/* </form> */}
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
        <Button
          variant="contained"
          color="success"
          onClick={() => handleSubmit('approve')}
          className="text-white"
          disabled={isSubmitLoading} // Correctly apply the disabled attribute
        >
          {
            isSubmitLoading && (
              <CircularProgress 
                sx={{ color: 'white' }} 
                size={18} // Optional: Adjust the size of the spinner
                className='mr-2'
                hidden={true}
              />
            )
          }

          Approve
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => handleSubmit('reject')}
          className="text-white"
          disabled={isSubmitLoading} // Correctly apply the disabled attribute
        >
          {
            isSubmitLoading && (
              <CircularProgress 
                sx={{ color: 'white' }} 
                size={18} // Optional: Adjust the size of the spinner
                className='mr-2'
                hidden={true}
              />
            )
          }
          Reject
        </Button>

          {/* <Button variant="contained"  color="error" onClick={() => handleSubmit('reject')} className='text-white'>Reject</Button> */}
        </DialogActions>
      </Dialog>
  )
}

export default ModalApprovalDocument;
