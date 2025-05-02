'use client'

// React Imports
import { useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { useForm, Controller } from 'react-hook-form'
import { CardHeader } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { useParams, useRouter } from 'next/navigation'
import { CategoryDocumentsField, CategoryDocumentsType } from '@/types/apps/categoryDocumentTypes'
import { useDocumentCategoryStore } from '@/hooks/document-category/store'

const initialData: CategoryDocumentsField = {
  name: '',
  prefix: '',
}

type TabKeys = 'general-info' | 'access-role';

type Props = {
  formTitle: string;
  handleChangeTab: (event: any, data: TabKeys) => void;
  changeFirstSave?: () => void;
  isFirstSave?: boolean;
};

const GeneralInfoForm = (props: Props) => {
  const { formTitle, handleChangeTab, changeFirstSave, isFirstSave } = props;

  // Zustand store
  const changeDocumentCategory = useDocumentCategoryStore((state: any) => state.changeDocumentCategory);
  const documentCategoryData = useDocumentCategoryStore((state: any) => state.documentCategory);
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm<CategoryDocumentsField>({
    defaultValues: formTitle.toLowerCase().includes('add') && isFirstSave === false ? initialData : documentCategoryData
  });
  const router = useRouter();
  const params = useParams();
  const { lang: locale } = params;

  useEffect(() => {
    if (formTitle.toLowerCase().includes('add')) {
      if (isFirstSave === false) {
        reset(initialData);
      }
      
    } else {
      reset(documentCategoryData);
    }
  }, [documentCategoryData, reset, formTitle, isFirstSave]);  

  const onSubmit = async (formData: Partial<CategoryDocumentsType>) => {
    await changeDocumentCategory(formData);
    if (changeFirstSave) {
      changeFirstSave();
    }
    handleChangeTab(null, 'access-role');
  };
  

  return (
    <Card>
      <CardHeader title={formTitle} subheader="General Info" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Document category name is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Name'
                    placeholder='Document category name ...'
                    value={field.value ?? ''} // Ensure empty string if null
                    error={!!errors.name}
                    helperText={errors.name ? errors.name.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='prefix'
                control={control}
                rules={{ required: 'Prefix is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Prefix'
                    placeholder='Prefix ...'
                    value={field.value ?? ''} // Ensure empty string if null
                    error={!!errors.prefix}
                    helperText={errors.prefix ? errors.prefix.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>Next</Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={() => router.push(`/${locale}/admin/master/document-category`)}>
                Back
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default GeneralInfoForm;
