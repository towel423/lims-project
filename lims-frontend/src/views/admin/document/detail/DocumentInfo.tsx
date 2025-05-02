'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { useForm, Controller } from 'react-hook-form'
import { Box, CardHeader, MenuItem, Typography } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { useParams, useRouter } from 'next/navigation'
import { DocumentCategorySelectListType, DocumentTypeSelectListType } from '@/types/apps/selectListTypes'
import { useDetailDocumentControlStore, useDocumentStore } from '@/hooks/document/store'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { DocumentDetailField } from '@/types/apps/documentTypes'
import { toast } from 'react-toastify'
import { formattedFileName, indonesiaFormattedDate } from '@/helpers/helper'

// Vars
const initialData: DocumentDetailField = {
  uuid: '',
  document_name: '',
  description: '',
  document_number: '',
  clause_number: '',
  revision_number: '',
  publish_date: null,
  page_count: '',
  document_type_name: '',
  document_category_name: '',
  sequence_number: '',
  status_id: '',
  file: null,
  id: '',
}

type TabKeys = 'document-info';

type Props = {
  formTitle: string;
  // dataMasterDocumentCategory: DocumentCategorySelectListType[];
  // getSelectListDocumentType: (documentCategoryId: string) => Promise<DocumentTypeSelectListType[]>;
  addRevision: (data: Partial<DocumentDetailField>) => Promise<{ status: number; message: string } | void>;
  previewFileMaster: (url: string) => any
};

const DocumentInfo = (props: Props) => {
  const { addRevision, previewFileMaster } = props

  const [dataMasterDocumentType, setDataMasterDocumentType] = useState<DocumentTypeSelectListType[]>([])
  const [isDocumentCategoryInternal, setIsDocumentCategoryInternal] = useState(false)
  const [isDocumentTypeFormulir, setIsDocumentTypeFormulir] = useState(false)
  const [isDocumentTypePanduanMutu, setIsDocumentTypePanduanMutu] = useState(false)
  const [isDocumentTypeSOP, setIsDocumentTypeSOP] = useState(false)
  const [isDocumentCategoryExternal, setIsDocumentCategoryExternal] = useState(false)
  const [isRevision, setIsRevision] = useState<boolean>(false)

  const documentControlData = useDetailDocumentControlStore((state: any) => state.documentControl);
  const documentRevisionData = useDetailDocumentControlStore((state: any) => state.documentVersions);
  const fileMasterData = useDetailDocumentControlStore((state: any) => state.fileMaster);

  // Zustand store
  const changeDocument = useDocumentStore((state: any) => state.changeDocument)

  const { control, handleSubmit, formState: { errors }, reset, setValue, getValues } = useForm<DocumentDetailField>({
    defaultValues: documentControlData
  })

  const router = useRouter()
  const params = useParams()
  const { lang: locale } = params

  const onSubmit = async (formData: Partial<DocumentDetailField>) => {

    const { uuid } = params;

    if(typeof uuid === 'string') {
      const revisionData: Partial<DocumentDetailField> = {
        description: formData.description,
        page_count: formData.page_count,
        file: formData.file,
        document_number: formData.document_number,
        uuid: uuid ?? formData.uuid,
      };


      let response = await addRevision(revisionData);
  
      if (response?.status == 201) {
        toast.success("Successfully add document revision!", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => setIsRevision(false),
        });
      } else {
        toast.error("Failed to add document revision!", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => setIsRevision(false),
        });
      }
    }


  };

  const [fileName, setFileName] = useState<string | null>(null);
  
  useEffect(() => {
    // reset(documentControlData);
    setValue("document_name", documentControlData.document_name);
    setValue("document_number", documentControlData.document_number);
    setValue("document_category_name", documentControlData.document_category_name);
    setValue("document_type_name", documentControlData.document_type_name);
    setValue("publish_date", indonesiaFormattedDate(documentControlData.publish_date));
    setValue("page_count", documentControlData.page_count);
    setValue("revision_number", documentControlData.revision_number);
    setValue("sequence_number", documentControlData.sequence_number);
    setValue("clause_number", documentControlData.clause_number);
    setValue("description", documentControlData.description);
    setValue("uuid", documentControlData.uuid);
  }, [documentControlData]); 

  const previewFile = async (url: string) => {
    try {
        let response = await previewFileMaster(url);
        if (response) {
            window.open(response, '_blank');
        } else {
            toast.error("Failed to preview file master!", {
                position: "top-right",
                autoClose: 2000
            });
        }
    } catch (error) {
        toast.error("Failed to preview file master!", {
            position: "top-right",
            autoClose: 2000
        });
    }
}

useEffect(() => {
    reset(fileMasterData);
}, [fileMasterData, reset]); 

  return (
    <Card>
      <CardHeader title={"Document Information"}/>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name="id"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    value={field.value ?? ''}
                    label="ID Dokumen"
                  />
                )}
                disabled={true}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name="document_category_name"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    value={field.value ?? ''}
                    label="Kategori Dokumen"
                  />
                )}
                disabled={true}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name="document_type_name"
                control={control}
                disabled={true}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    value={field.value ?? ''}
                    label="Jenis Dokumen"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name="document_name"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    value={field.value ?? ''}
                    disabled={true}
                    label="Nama Dokumen"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
            <Controller
                name="publish_date"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    value={field.value ? indonesiaFormattedDate(field.value) : ''}
                    disabled={true}
                    label="Tanggal Terbit"
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
                    disabled={!isRevision}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name='revision_number'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Nomor Revisi'
                    value={field.value ?? ''}
                    disabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4} style={{ display: isDocumentCategoryInternal && isDocumentTypeFormulir ? 'none' : 'block' }}>
              <Controller
                name="sequence_number"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    value={field.value ?? ''}
                    label="Nomor Urut"
                    disabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4} style={{ display: isDocumentCategoryInternal && !(isDocumentTypeSOP || isDocumentTypePanduanMutu)? 'none' : 'block' }}>
              <Controller
                name="clause_number"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Nomor Klausul"
                    value={field.value ?? ''}
                    disabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
              <Controller
                name="document_number"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Nomor Dokumen"
                    value={field.value ?? ''}
                    disabled={!isRevision}
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
                    disabled={!isRevision}
                  />
                )}
              />
            </Grid>
            
            {
              !isRevision ? (
                <>
                
                <Grid item xs={12} sm={6}  marginBottom={4}>
                    <CustomTextField
                        fullWidth
                        value={isRevision ? fileName : formattedFileName(fileMasterData.url_file)}
                        label={isRevision ? "Selected File" : "File"}
                        disabled={true}
                      />
                  </Grid> 
                <Grid item xs={12} sm={6} marginTop={5}>  
                  <Button 
                    variant="contained" 
                    startIcon={<i className='tabler-download' />}
                    onClick={() => {
                      if (fileMasterData.url_file) {
                      previewFile(fileMasterData.url_file);
                      }
                    }}
                  >
                    Download File
                  </Button>            
                </Grid>
                </>
              ) : (
              
                  
                
                  <Grid item xs={12} sm={6} marginTop={5}>
                    {/* <Button
                      variant="outlined"
                      component="label"
                      startIcon={<i className="tabler-upload" />}
                    >
                      Upload File
                      <Controller
                        name="file"
                        control={control}
                        rules={{ required: 'File upload is required' }}
                        render={({ field }) => (
                          <input
                                name="file"
                                type="file"
                                hidden
                                onChange={handleFileChange} // Trigger file change handler
                              />
                        )}
                      />


                      
                    </Button> */}
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
                            label="File"
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
                
                
                
              )
            }


            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              {(() => {
                if (isRevision) {
                  return <>
                    <Button variant="contained" type="submit">Simpan</Button>
                    <Button
                      variant="outlined"
                      type="reset"
                      color="secondary"
                      onClick={() => {
                        const descriptionValue = getValues("description");
                        const pageCountValue = getValues("page_count");

                        // Jika deskripsi kosong, isi dengan nilai dari documentData.description
                        if (!descriptionValue) {
                          setValue("description", documentControlData.description || "", { shouldValidate: true });
                        }

                        // Jika jumlah halaman kosong, isi dengan nilai dari documentControlData.page_count
                        if (!pageCountValue) {
                          setValue("page_count", documentControlData.page_count || "", { shouldValidate: true });
                        }

                        // Jika semua field valid (sudah terisi), ubah state isRevision
                        // if (descriptionValue && pageCountValue) {
                          setIsRevision(false);
                        // }indonesiaFormattedDate
                      }}
                    >
                      Batal
                    </Button>


                  </>
                } else {
                  return (
                    <>
                      {documentControlData.status_document_id > 2 && (
                        <Button 
                          variant="contained" 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            setIsRevision(true);
                          }}
                        >
                          Revisi
                        </Button>
                      )}
                    </>
                  );                  
                }
              })()}
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentInfo;
