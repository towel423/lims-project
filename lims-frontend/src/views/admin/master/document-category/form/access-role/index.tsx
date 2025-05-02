// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import AccessRoleForm from './form'
import { RoleActionMasterType } from '@/types/apps/roleActionMasterTypes';
import { CategoryDocumentsField, CategoryDocumentsType } from '@/types/apps/categoryDocumentTypes';

type TabKeys = 'general-info' | 'access-role';
type Props = {
  formTitle: string;
  handleChangeTab: (event: any, data: TabKeys) => void;
  // data?: CategoryDocumentsField;
  addCategoryDocument?: (data: CategoryDocumentsField) => Promise<{ status: number; message: string } | undefined>;
  dataMasterRoleAction: RoleActionMasterType;
  updateCategoryDocument?: (data: CategoryDocumentsType) => Promise<{ status: number; message: string } | undefined>;
};

const AccessRole = (props: Props) => {
  const { formTitle, handleChangeTab, addCategoryDocument, updateCategoryDocument, dataMasterRoleAction } = props;

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AccessRoleForm formTitle={formTitle} handleChangeTab={handleChangeTab} addCategoryDocument={addCategoryDocument} updateCategoryDocument={updateCategoryDocument} dataMasterRoleAction={dataMasterRoleAction} />
      </Grid>
    </Grid>
  )
}

export default AccessRole;
