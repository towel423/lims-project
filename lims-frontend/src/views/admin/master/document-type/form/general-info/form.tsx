'use client'

// React Imports
import { useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { useForm, Controller } from 'react-hook-form'
import { CardHeader, MenuItem } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { TypeDocumentsField, TypeDocumentsType } from '@/types/apps/typeDocumentTypes'
import { useParams, useRouter } from 'next/navigation'
import { useDocumentTypeStore } from '@/hooks/document-type/store'
import { DocumentCategorySelectListType } from '@/types/apps/selectListTypes'

// Vars
const initialData: TypeDocumentsField = {
  name: '',
  prefix: '',
  document_category_id: ''
}

type TabKeys = 'general-info' | 'access-role';

type Props = {
  formTitle: string;
  handleChangeTab: (event: any, data: TabKeys) => void;
  changeFirstSave?: () => void;
  isFirstSave?: boolean;
  dataMasterDocumentCategory: DocumentCategorySelectListType[];
};

const GeneralInfoForm = (props: Props) => {
  const { formTitle, handleChangeTab, dataMasterDocumentCategory, changeFirstSave, isFirstSave } = props;

  // Zustand store
  const changeDocumentType = useDocumentTypeStore((state: any) => state.changeDocumentType);
  const documentTypeData = useDocumentTypeStore((state: any) => state.documentType);
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm<TypeDocumentsField>({
    defaultValues: formTitle.toLowerCase().includes('add') && isFirstSave === false ? initialData : documentTypeData
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
      reset(documentTypeData);
    }
  }, [documentTypeData, reset, formTitle, isFirstSave]);  

  const onSubmit = async (formData: Partial<TypeDocumentsType>) => {
    await changeDocumentType(formData);
    if (changeFirstSave) {
      changeFirstSave();
    }
    handleChangeTab(null, 'access-role'); // Move to the next tab after submission
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
                rules={{ required: 'Document type name is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Name'
                    placeholder='Document type name ...'
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
            <Grid item xs={12}>
              <Controller
                name="document_category_id"
                control={control}
                rules={{ required: 'Document category is required' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label="Document Category"
                    {...field}
                    value={field.value ?? ''} // Ensure an empty string for null/undefined
                    error={!!errors.document_category_id} // Display error state
                    helperText={errors.document_category_id ? errors.document_category_id.message : ''} // Show error message
                  >
                    <MenuItem value="">Select Document Category</MenuItem>
                    {dataMasterDocumentCategory?.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit'>Next</Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={() => router.push(`/${locale}/admin/master/document-type`)}>
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
