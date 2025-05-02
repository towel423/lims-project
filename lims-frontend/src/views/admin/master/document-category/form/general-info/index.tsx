// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import GeneralInfoForm from './form'

type TabKeys = 'general-info' | 'access-role';

type Props = {
  formTitle: string;
  handleChangeTab: (event: any, data: TabKeys) => void;
  changeFirstSave?: () => void;
  isFirstSave?: boolean;
};

const GeneralInfo = (props: Props) => {
  const {formTitle, handleChangeTab, isFirstSave, changeFirstSave} = props;

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <GeneralInfoForm formTitle={formTitle} handleChangeTab={handleChangeTab} changeFirstSave={changeFirstSave} isFirstSave={isFirstSave} />
      </Grid>
    </Grid>
  )
}

export default GeneralInfo
