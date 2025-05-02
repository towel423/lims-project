// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import GeneralInfoForm from './form'
import { DocumentCategorySelectListType, DocumentTypeSelectListType } from '@/types/apps/selectListTypes';
import { DocumentsField } from '@/types/apps/documentTypes';

type TabKeys = 'general-info';

type Props = {
  formTitle: string;
  dataMasterDocumentCategory: DocumentCategorySelectListType[];
  getSelectListDocumentType: (documentCategoryId: string) => Promise<DocumentTypeSelectListType[]>;
  addDocument: (data: DocumentsField) => Promise<{ status: number; message: string } | undefined>;
};

const GeneralInfo = (props: Props) => {
  const {formTitle, dataMasterDocumentCategory, getSelectListDocumentType, addDocument} = props;

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <GeneralInfoForm formTitle={formTitle} dataMasterDocumentCategory={dataMasterDocumentCategory} getSelectListDocumentType={getSelectListDocumentType} addDocument={addDocument} />
      </Grid>
    </Grid>
  )
}

export default GeneralInfo
