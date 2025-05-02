import { useEffect } from 'react'; // React Imports
import { useForm, Controller } from 'react-hook-form'; // MUI Imports
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CustomTextField from '@core/components/mui/TextField';
import { TypeDocumentsField } from '@/types/apps/typeDocumentTypes';

type Props = {
  open: boolean;
  handleClose: () => void;
  data?: TypeDocumentsField;
  addTypeDocument: (data: TypeDocumentsField) => void;
  updateTypeDocument: (data: TypeDocumentsField) => void;
};

type FormValidateType = {
  name: string;
  prefix: string;
};

const TypeDrawer = (props: Props) => {
  const { open, handleClose, data, addTypeDocument, updateTypeDocument } = props;

  const { control, reset, handleSubmit, formState: { errors } } = useForm<FormValidateType>({
    defaultValues: { name: data?.name ?? '', prefix: data?.prefix ?? '' },
  });

  useEffect(() => {
    if (data) {
      reset({ name: data.name, prefix: data.prefix });
    } else {
      reset({ name: '', prefix: '' });
    }
  }, [data, reset]);

  const onSubmit = (formData: FormValidateType) => {
    if (data) {
      updateTypeDocument({name: formData.name, prefix: formData.prefix});
    } else {
      addTypeDocument({name: formData.name, prefix: formData.prefix});
    }
    handleClose();
  };

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant='h6' className='p-4'>
          {data ? 'Edit Type Document' : 'Add New Type Document'}
        </Typography>
        <Divider />
        <div className='p-4'>
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Type name is required' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                label='Type Name'
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

export default TypeDrawer;
