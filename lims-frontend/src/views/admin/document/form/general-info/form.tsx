'use client'

// React Imports
import { useEffect, useState } from 'react'

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
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { DocumentCategorySelectListType, DocumentTypeSelectListType } from '@/types/apps/selectListTypes'
import { InternalDocumentsField, InternalDocumentsType } from '@/types/apps/internalDocumentTypes'
import { useDocumentStore } from '@/hooks/document/store'
import { ExternalDocumentsField } from '@/types/apps/externalDocumentTypes'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { DocumentsField } from '@/types/apps/documentTypes'
import { toast } from 'react-toastify'

// Vars
const initialData: DocumentsField = {
  uuid: '',
  document_name: '',
  description: '',
  document_number: '',
  clause_number: '',
  revision_number: '',
  publish_date: null,
  page_count: '',
  document_type_id: '',
  document_category_id: '',
  sequence_number: '',
  status_id: '',
  file: null,
}

type Props = {
  formTitle: string;
  dataMasterDocumentCategory: DocumentCategorySelectListType[];
  getSelectListDocumentType: (documentCategoryId: string) => Promise<DocumentTypeSelectListType[]>;
  addDocument: (data: DocumentsField) => Promise<{ status: number; message: string } | undefined>;
};

const GeneralInfoForm = (props: Props) => {
  const { formTitle, dataMasterDocumentCategory, getSelectListDocumentType, addDocument } = props

  const [dataMasterDocumentType, setDataMasterDocumentType] = useState<DocumentTypeSelectListType[]>([])
  // Category Doc
  const [isDocumentCategoryInternal, setIsDocumentCategoryInternal] = useState(false)
  const [isDocumentCategoryExternal, setIsDocumentCategoryExternal] = useState(false)

  // Doc Type
  const [isDocumentTypeFormulir, setIsDocumentTypeFormulir] = useState(false)
  const [isDocumentTypePanduanMutu, setIsDocumentTypePanduanMutu] = useState(false)
  const [isDocumentTypeSOP, setIsDocumentTypeSOP] = useState(false)
  const [isDocumentTypeInstruksiKerja, setIsDocumentTypeInstruksiKerja] = useState(false)
  const [isDocumentTypeLembarKerja, setIsDocumentTypeLembarKerja] = useState(false)

  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  // Zustand store
  const changeDocument = useDocumentStore((state: any) => state.changeDocument)
  const documentData = useDocumentStore((state: any) => state.document)

  const { control, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm<DocumentsField>({
    defaultValues: documentData || initialData
  })

  const router = useRouter()
  const params = useParams()
  const { lang: locale } = params
  const searchParams = useSearchParams(); // Get query parameters
  const category = searchParams.get('category'); // Extract query param

  useEffect(() => {
    reset(documentData)
  }, [documentData, reset, formTitle])  

  const onSubmit = async (formData: Partial<DocumentsField>) => {
    setIsSubmitLoading(true);
  
    const completeData: DocumentsField = {
      ...formData,
      document_name: formData.document_name ?? "",
      description: formData.description ?? "",
      publish_date: formData.publish_date ?? "",
      clause_number: formData.clause_number ?? "",
      revision_number: formData.revision_number ?? "",
      sequence_number: formData.sequence_number ?? "",
      page_count: formData.page_count ?? 0,
      document_type_id: formData.document_type_id ?? 0,
      document_category_id: formData.document_category_id ?? 0,
      file: formData.file ?? null,
    };

    toast.promise(
      addDocument(completeData),
      {
        pending: {
          render() {
            return "Saving your document...";
          },
          icon: <span>⏳</span>,
        },
        success: {
          render({ data }) {
            return "Document added successfully!";
          },
          icon: <span>✅</span>,
          autoClose: 1500,
          onClose: () => {
            if (category === "1") {
              router.push(`/${locale}/admin/document-internal`);
            } else if (category === "2") {
              router.push(`/${locale}/admin/document-external`);
            } else {
              router.push(`/${locale}/admin/document-internal`);
            }
          },
        },
        error: {
          render({ data }: any) {
            return data.message;
          },
          icon: <span>❌</span>,
          autoClose: 1500,
          onClose: () => {
            router.push(`/${locale}/admin/document/add`);
            setIsSubmitLoading(false);
          },
        },
      }
    );    
    
  };
  

  const handleDocumentCategoryChange = async (selectedValue: string) => {
    const response = await getSelectListDocumentType(selectedValue)
    setDataMasterDocumentType(response)

    // Check document category and type
    if (selectedValue == '1') { // Internal Document
      setIsDocumentCategoryInternal(true)
      setIsDocumentCategoryExternal(false)
    } else if (selectedValue == '2') { // External Document
      setIsDocumentCategoryExternal(true)
      setIsDocumentCategoryInternal(false)
    } else {
      setIsDocumentCategoryInternal(false)
      setIsDocumentCategoryExternal(false)
    }
  }

  const handleDocumentTypeChange = (selectedValue: string) => {
    // Check document type
    if (selectedValue == '1') { // Panduan Mutu
      setIsDocumentTypePanduanMutu(true)
      setIsDocumentTypeSOP(false)
      setIsDocumentTypeFormulir(false)
      setIsDocumentTypeInstruksiKerja(false)
      setIsDocumentTypeLembarKerja(false)
    } else if(selectedValue == '2') { // Instruksi Kerja
      setIsDocumentTypeSOP(false)
      setIsDocumentTypePanduanMutu(false)
      setIsDocumentTypeFormulir(false)
      setIsDocumentTypeInstruksiKerja(true)
      setIsDocumentTypeLembarKerja(false)
    } else if (selectedValue == '3') { // SOP
      setIsDocumentTypeSOP(true)
      setIsDocumentTypePanduanMutu(false)
      setIsDocumentTypeFormulir(false)
      setIsDocumentTypeInstruksiKerja(false)
      setIsDocumentTypeLembarKerja(false)
    } else if (selectedValue == '4') { // Formulir
      setIsDocumentTypeFormulir(true)
      setIsDocumentTypePanduanMutu(false)
      setIsDocumentTypeSOP(false)
      setIsDocumentTypeInstruksiKerja(false)
      setIsDocumentTypeLembarKerja(false)
    }  else if(selectedValue == '5') { // Lembar Kerja
      setIsDocumentTypeSOP(false)
      setIsDocumentTypePanduanMutu(false)
      setIsDocumentTypeFormulir(false)
      setIsDocumentTypeInstruksiKerja(false)
      setIsDocumentTypeLembarKerja(true)
    } else {
      setIsDocumentTypeFormulir(false)
      setIsDocumentTypePanduanMutu(false)
      setIsDocumentTypeSOP(false)
      setIsDocumentTypeInstruksiKerja(false)
      setIsDocumentTypeLembarKerja(false)
    }

    const currentValues = getValues();

    reset();
    setValue('document_category_id', currentValues.document_category_id);
    setValue('document_type_id', selectedValue);

  }
  

  const changeDocumentNumber = () => {
    // Get the current values from the form
    const clauseNumber = getValues('clause_number') ?? ''; 
    const documentName = getValues('document_name') ?? ''; 
    const currentYear = new Date().getFullYear();
    const prefix = 'LKAL'; 
  
    // Initialize documentNumber
    let documentNumber = '';
    
    // Generate document number based on document type
    if (isDocumentTypePanduanMutu) {
      documentNumber = `${prefix} ${clauseNumber}/${currentYear} ${documentName}`;
    } else if (isDocumentTypeSOP) {
      documentNumber = `${prefix}-${clauseNumber}/${currentYear} ${documentName}`;
    } else if (isDocumentCategoryExternal) {
      documentNumber = `${prefix} ${clauseNumber}/${currentYear} ${documentName}`;
      // LKAL [PREFIX] [NO KLAUSUL]/[TAHUN] [DOC NAME]
    }
  
    // Update the 'document_number' field in the form
    setValue('document_number', documentNumber);
  }

  useEffect(() => {
    if ((isDocumentTypePanduanMutu || isDocumentTypeSOP) || isDocumentCategoryExternal) {
      changeDocumentNumber()
    }
  }, [isDocumentTypePanduanMutu, isDocumentTypeSOP])

  useEffect(() => {
    if (category && dataMasterDocumentCategory.length > 0) {
      // Cari data yang cocok berdasarkan ID
      const matchedCategory = dataMasterDocumentCategory.find(
        (item) => item.id === Number(category)
      );
  
      if (matchedCategory) {
        handleDocumentCategoryChange(String(matchedCategory.id))
        setValue('document_category_id', matchedCategory.id);
      }
    }
  }, [category, dataMasterDocumentCategory, setValue]);
  
  

  return (
    <Card>
      <CardHeader title={formTitle} subheader="General Info" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>

              <Controller
                name="document_category_id"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label="Document Category"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      handleDocumentCategoryChange(event.target.value);
                    }}
                    error={!!errors.document_category_id}
                    helperText={errors.document_category_id?.message}
                    disabled={true}
                  >
                    {dataMasterDocumentCategory.map((item) => (
                      <MenuItem
                        key={item.id}
                        value={item.id}
                        // disabled={item.id === Number(category)}
                      >
                        {item.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />

            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name="document_type_id"
                control={control}
                rules={{ required: 'Jenis dokumen wajib diisi' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label="Jenis Dokumen"
                    {...field}
                    value={field.value ?? ''}
                    error={!!errors.document_type_id}
                    helperText={errors.document_type_id ? errors.document_type_id.message : ''}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value)
                      handleDocumentTypeChange(value)
                    }}
                  >
                    <MenuItem value="">Pilih jenis dokumen</MenuItem>
                    {dataMasterDocumentType?.map((type, index) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name="document_name"
                control={control}
                rules={{ required: 'Nama dokumen wajib diisi' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Nama Dokumen"
                    placeholder="Nama Dokumen ..."
                    value={field.value ?? ''}
                    error={!!errors.document_name}
                    helperText={errors.document_name ? errors.document_name.message : ''}
                    onChange={(e) => {
                      field.onChange(e);
                      if ((isDocumentTypePanduanMutu || isDocumentTypeSOP) || isDocumentCategoryExternal) {
                        changeDocumentNumber()
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name="publish_date"
                control={control}
                rules={{ required: 'Tanggal terbit wajib diisi' }}
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <AppReactDatepicker
                    selected={value && !isNaN(new Date(value).getTime()) ? new Date(value) : null}
                    showYearDropdown
                    showMonthDropdown
                    onChange={onChange}
                    placeholderText="MM/DD/YYYY"
                    customInput={
                      <CustomTextField
                        fullWidth
                        label="Tanggal Terbit"
                        value={value}
                        onChange={onChange}
                        error={!!error}
                        helperText={error ? error.message : ''}
                      />
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name='page_count'
                control={control}
                rules={{ required: 'Jumlah halaman wajib diisi' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Jumlah Halaman'
                    type="number"
                    placeholder='Jumlah halaman ...'
                    value={field.value ?? ''}
                    error={!!errors.page_count}
                    helperText={errors.page_count ? errors.page_count.message : ''}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault(); 
                      }
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9]/g, '');
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name='revision_number'
                control={control}
                rules={{ required: 'Nomor revisi is required' }}
                disabled={isDocumentTypePanduanMutu || isDocumentTypeSOP || isDocumentTypeInstruksiKerja || isDocumentTypeFormulir || isDocumentTypeLembarKerja ? true : false}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Nomor Revisi'
                    type="number"
                    placeholder='Nomor revisi ...'
                    value={  isDocumentTypePanduanMutu || isDocumentTypeSOP || isDocumentTypeInstruksiKerja || isDocumentTypeFormulir || isDocumentTypeLembarKerja ? '00' : field.value ?? ''}
                    error={!!errors.revision_number}
                    helperText={errors.revision_number ? errors.revision_number.message : ''}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault(); 
                      }
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9]/g, '');
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4} style={{ display: isDocumentCategoryInternal && (isDocumentTypeFormulir || isDocumentTypeInstruksiKerja || isDocumentTypeLembarKerja) ? 'none' : 'block' }}>
              <Controller
                name="sequence_number"
                control={control}
                // rules={{ required: 'Nomor urut wajib diisi' }}
                rules={{
                  required: !(isDocumentCategoryInternal && (isDocumentTypeFormulir || isDocumentTypeInstruksiKerja || isDocumentTypeLembarKerja))
                    ? 'Nomor urut wajib diisi'
                    : false,
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Nomor Urut"
                    type="number"
                    placeholder="Nomor urut"
                    value={field.value ?? ''}
                    error={!!errors.sequence_number}
                    helperText={errors.sequence_number ? errors.sequence_number.message : ''}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault(); 
                      }
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9]/g, '');
                    }}
                  />
                )}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              marginBottom={4}
              style={{
                display:
                  isDocumentCategoryInternal && !isDocumentTypeSOP
                    ? 'none'
                    : 'block',
              }}
            >
              <Controller
                name="clause_number"
                control={control}
                rules={{
                  required: !(isDocumentCategoryInternal && !isDocumentTypeSOP)
                    ? 'Nomor klausul wajib diisi'
                    : false,
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Nomor Klausul"
                    placeholder="Nomor klausul"
                    value={field.value ?? ''}
                    error={!!errors.clause_number}
                    helperText={errors.clause_number ? errors.clause_number.message : ''}
                    onChange={(e) => {
                      field.onChange(e);
                      if ((isDocumentCategoryInternal && (isDocumentTypePanduanMutu || isDocumentTypeSOP))|| isDocumentCategoryExternal) {
                        changeDocumentNumber();
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid 
              item 
              xs={12} 
              sm={6} 
              marginBottom={4}
              style={{
                display:
                  isDocumentTypeInstruksiKerja || isDocumentTypeFormulir || isDocumentTypeLembarKerja
                    ? 'none'
                    : 'block',
              }}
              >
              <Controller
                name="document_number"
                control={control}
                rules={{
                  required: !(isDocumentTypeInstruksiKerja || isDocumentTypeFormulir || isDocumentTypeLembarKerja)
                    ? 'Nomor dokumen wajib diisi'
                    : false,
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Nomor Dokumen"
                    placeholder="Nomor dokumen"
                    value={field.value ?? ''}
                    error={!!errors.document_number}
                    helperText={errors.document_number ? errors.document_number.message : ''}
                    disabled={isDocumentCategoryInternal && (isDocumentTypePanduanMutu || isDocumentTypeSOP) || isDocumentCategoryExternal}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} marginBottom={4}>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Deskripsi wajib diisi' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Deskripsi"
                    placeholder="Deskripsi ..."
                    multiline
                    rows={4}
                    value={field.value ?? ''}
                    error={!!errors.description}
                    helperText={errors.description ? errors.description.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>              
              <Controller
                name="file"
                control={control}
                rules={{ required: 'File upload is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type="file"
                    // inputProps={{ accept: ".pdf" }}
                    error={!!errors.file}
                    helperText={errors.file ? errors.file.message : ''}
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      field.onChange(file); // Update the field value
                    }}
                    inputRef={field.ref} // Bind the ref for react-hook-form
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              {
                isSubmitLoading ? (

                  <Button variant='contained' type='submit' disabled>Save</Button>
                ) : (
                  <Button variant='contained' type='submit'>Save</Button>
                )
                
              }
              <Button variant='outlined' type='reset' color='secondary' 
                onClick={() => {
                  if(category == String(1)){
                    router.push(`/${locale}/admin/document-internal`);
                  }else if(category == String(2)){
                    router.push(`/${locale}/admin/document-external`);
                  }
                }}
              >
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
