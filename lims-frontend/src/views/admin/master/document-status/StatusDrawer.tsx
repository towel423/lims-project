import { useEffect } from 'react'; // React Imports
import { useForm, Controller } from 'react-hook-form'; // MUI Imports
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CustomTextField from '@core/components/mui/TextField';

type Props = {
  open: boolean;
  handleClose: () => void;
  data?: string;
  addStatusDocument: (data: string) => void;
  updateStatusDocument: (data: string) => void;
};

type FormValidateType = {
  name: string;
};

const StatusDrawer = (props: Props) => {
  const { open, handleClose, data, addStatusDocument, updateStatusDocument } = props;

  const { control, reset, handleSubmit, formState: { errors } } = useForm<FormValidateType>({
    defaultValues: { name: data ?? '' },
  });

  useEffect(() => {
    if (data) {
      reset({ name: data });
    } else {
      reset({ name: '' });
    }
  }, [data, reset]);

  const onSubmit = (formData: FormValidateType) => {
    if (data) {
      updateStatusDocument(formData.name);
    } else {
      addStatusDocument(formData.name);
    }
    handleClose();
  };

  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant='h6' className='p-4'>
          {data ? 'Edit Status Document' : 'Add New Status Document'}
        </Typography>
        <Divider />
        <div className='p-4'>
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Status name is required' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                label='Status Name'
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
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

export default StatusDrawer;
