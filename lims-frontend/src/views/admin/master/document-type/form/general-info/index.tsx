// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import GeneralInfoForm from './form'
import { DocumentCategorySelectListType } from '@/types/apps/selectListTypes';

type TabKeys = 'general-info' | 'access-role';

type Props = {
  formTitle: string;
  handleChangeTab: (event: any, data: TabKeys) => void;
  dataMasterDocumentCategory: DocumentCategorySelectListType[];
  changeFirstSave?: () => void;
  isFirstSave?: boolean;
};

const GeneralInfo = (props: Props) => {
  const {formTitle, handleChangeTab, dataMasterDocumentCategory, changeFirstSave, isFirstSave} = props;

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <GeneralInfoForm formTitle={formTitle} handleChangeTab={handleChangeTab} dataMasterDocumentCategory={dataMasterDocumentCategory} changeFirstSave={changeFirstSave} isFirstSave={isFirstSave} />
      </Grid>
    </Grid>
  )
}

export default GeneralInfo
