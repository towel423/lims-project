import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from '@mui/material';
import { DocumentsType } from '@/types/apps/documentTypes';

interface ModalDeleteDocumentProps {
  open: boolean;
  handleClose: () => void
  handleConfirm:  () => void
  selectedData: Partial<DocumentsType> | null;
}

const ModalDeleteDocument: React.FC<ModalDeleteDocumentProps> = ({ open, handleClose, handleConfirm, selectedData }) => {
  const [displayedData, setDisplayedData] = useState<Partial<DocumentsType> | null>(selectedData);

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
      <DialogTitle id='alert-dialog-title'>Hapus Dokumen?</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          Apakah Anda yakin ingin menghapus dokumen dengan nomor "{displayedData?.document_number ?? 'Data tidak tersedia'}"? Tindakan ini tidak dapat dibatalkan.
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

export default ModalDeleteDocument;
