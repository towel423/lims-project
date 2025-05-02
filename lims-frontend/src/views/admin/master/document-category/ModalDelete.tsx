import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from '@mui/material';
import { CategoryDocumentsType } from '@/types/apps/categoryDocumentTypes';

interface DialogsConfirmationProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  selectedData: CategoryDocumentsType | null;
}

const DialogsConfirmation: React.FC<DialogsConfirmationProps> = ({ open, handleClose, handleConfirm, selectedData }) => {
  const [displayedData, setDisplayedData] = useState<CategoryDocumentsType | null>(selectedData);

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
      <DialogTitle id='alert-dialog-title'>Hapus Kategori Dokumen?</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          Apakah Anda yakin ingin menghapus kategori dokumen dengan nama "{displayedData?.name ?? 'Data tidak tersedia'}"? Tindakan ini tidak dapat dibatalkan.
        </DialogContentText>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={handleClose}>Batal</Button>
        <Button onClick={handleConfirm} color='error'>
          Hapus
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogsConfirmation;
