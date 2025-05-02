// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import AccessRoleForm from './form'
import { TypeDocumentsField, TypeDocumentsType } from '@/types/apps/typeDocumentTypes';
import { RoleActionMasterType } from '@/types/apps/roleActionMasterTypes';

type TabKeys = 'general-info' | 'access-role';
type Props = {
  formTitle: string;
  handleChangeTab: (event: any, data: TabKeys) => void;
  // data?: TypeDocumentsField;
  addTypeDocument?: (data: TypeDocumentsField) => Promise<{ status: number; message: string } | undefined>;
  dataMasterRoleAction: RoleActionMasterType;
  updateTypeDocument?: (data: TypeDocumentsType) => Promise<{ status: number; message: string } | undefined>;
};

const AccessRole = (props: Props) => {
  const { formTitle, handleChangeTab, addTypeDocument, updateTypeDocument, dataMasterRoleAction } = props;

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AccessRoleForm formTitle={formTitle} handleChangeTab={handleChangeTab} addTypeDocument={addTypeDocument} updateTypeDocument={updateTypeDocument} dataMasterRoleAction={dataMasterRoleAction} />
      </Grid>
    </Grid>
  )
}

export default AccessRole;
