import { useEffect, useState  } from 'react'; // React Imports
import { useForm, Controller } from 'react-hook-form'; // MUI Imports
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CustomTextField from '@core/components/mui/TextField';
import { CategoryDocumentsField } from '@/types/apps/categoryDocumentTypes';

import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import type { SelectChangeEvent } from '@mui/material/Select'
import type { ChangeEvent } from 'react'
import { RoleActionMasterType } from '@/types/apps/roleActionMasterTypes';


const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      width: 250,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder'
]


type Props = {
  open: boolean;
  handleClose: () => void;
  data?: CategoryDocumentsField;
  dataMasterRoleAction: RoleActionMasterType;
  addCategoryDocument: (data: CategoryDocumentsField) => void;
  updateCategoryDocument: (data: CategoryDocumentsField) => void;
};

type FormValidateType = {
  name: string;
  prefix: string;
};

const CategoryDrawer = (props: Props) => {
  const { open, handleClose, data, addCategoryDocument, updateCategoryDocument, dataMasterRoleAction } = props;
  const [role, setRole] = useState<string[]>([]);
  const [dataMaster, setDataMaster] = useState<RoleActionMasterType>({action: [], role: []});
  const [personNameNative, setPersonNameNative] = useState<string[]>([]);

  useEffect(() => {
    setDataMaster(dataMasterRoleAction);
  }, [dataMasterRoleAction])


  const { control, reset, handleSubmit, formState: { errors } } = useForm<FormValidateType>({
    defaultValues: { name: data?.name ?? '', prefix: data?.prefix ?? '' },
  });

  
  const handleChangeRole = (event: SelectChangeEvent<string[]>) => {
    setRole(event.target.value as string[])
  }

  useEffect(() => {
    if (data) {
      reset({ name: data.name, prefix: data.prefix });
    } else {
      reset({ name: '', prefix: '' });
    }
  }, [data, reset]);

  const onSubmit = (formData: FormValidateType) => {
    if (data) {
      updateCategoryDocument({name: formData.name, prefix: formData.prefix});
    } else {
      addCategoryDocument({name: formData.name, prefix: formData.prefix});
    }
    handleClose();
  };

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant='h6' className='p-4'>
          {data ? 'Edit Category Document' : 'Add New Category Document'}
        </Typography>
        <Divider />
        <div className='p-4'>
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Category name is required' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                label='Category Name'
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
              />
            )}
          />
        </div>
        <div className='p-4'>
          <Controller
            name='prefix'
            control={control}
            rules={{ required: 'Prefix is required' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                label='prefix'
                error={!!errors.prefix}
                helperText={errors.prefix ? errors.prefix.message : ''}
              />
            )}
          />
        </div>
        <div className='flex gap-4 flex-col'>
          <div className='p-4'>
            <CustomTextField
              select
              fullWidth
              label='Role'
              value={role}
              inputProps={{ 'aria-label': 'Without label' }}
              SelectProps={{
                MenuProps,
                multiple: true,
                displayEmpty: true,
                // onChange: handleChangeRole,
                renderValue: selected => {
                  if ((selected as unknown as string[]).length === 0) {
                    return <em>Placeholder</em>
                  }

                  let result = (selected as unknown as string[]).join(', ');

                  result = result.length > 19 ? result.slice(0, 19) + '...' : result;
                  
                  return result;
                }
              }}
            >
              <MenuItem disabled value=''>
                <em>Role</em>
              </MenuItem>
              {dataMaster.role?.map(role => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </CustomTextField>
          </div>
        </div>
        <Divider />
        <div className='flex justify-end p-4'>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type='submit' variant='contained' color='primary'>
            {data ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

export default CategoryDrawer;
