import { Children, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from '@mui/material';
import { TypeDocumentsType } from '@/types/apps/typeDocumentTypes';
import { RelatedFileType } from '@/types/apps/relatedFileTypes';

interface ModalDeleteProps {
  modalTitle: string;
  modalBody: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm?: () => void;
  selectedData: Partial<RelatedFileType> | null;
}

const ModalDelete: React.FC<ModalDeleteProps> = ({ open, handleClose, handleConfirm, selectedData, modalTitle, modalBody }) => {
  const [displayedData, setDisplayedData] = useState<Partial<RelatedFileType> | null>(selectedData);

  useEffect(() => {
    if (open && selectedData) {
      setDisplayedData(selectedData);
    }
  }, [open, selectedData]);

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose();
        }
      }}
    >
      <DialogTitle id='alert-dialog-title'>{modalTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          {modalBody}
        </DialogContentText>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={handleClose} color='secondary'>Batal</Button>
        <Button onClick={handleConfirm} color='error'>
          Hapus
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDelete;
