'use client';

import { useState } from 'react';
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import dynamic from 'next/dynamic';
import { useForm, Controller } from 'react-hook-form';
import { getJwtToken } from '@/helpers/helper';
import CustomTextField from '@/@core/components/mui/TextField';
import { Button, MenuItem, Typography } from '@mui/material';
import { MethodType } from '@/types/apps/methodTypes';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const GeneralInfoCustom = dynamic(() => import('@/views/components/GeneralInfoCustom'));

type TabKeys = 'general-info';

const addMethod = async (data: Partial<MethodType>) => {
  const token = getJwtToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = token;

  try {
    const response = await fetch('/api/master/global-reference', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to add global reference");

    return { status: response.status, message: 'Successfully added new global reference' };
  } catch (error) {
    console.error("Error adding global reference:", error);
  }
};

const AddMasterMethodPage = () => {
    const [dataMasterKategoriMetode, setDataMasterKategoriMetode] = useState( [
        {
            "createdAt": "2021-12-19T23:04:52.000Z",
            "updatedAt": "2022-09-06T06:35:49.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 457,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "Udara Lingkungan Kerja",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-09T06:22:53.000Z",
            "updatedAt": "2022-09-06T06:35:30.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 476,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "Udara Ambien dan Emisi",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-19T19:52:49.000Z",
            "updatedAt": "2022-09-06T06:35:05.000Z",
            "createdBy": "Indah",
            "updatedBy": "Admin",
            "id": 494,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "B3 dan Limbah Padat",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-19T20:06:31.000Z",
            "updatedAt": "2022-01-19T20:06:32.000Z",
            "createdBy": "Indah",
            "updatedBy": null,
            "id": 495,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "Tanah",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:40:43.000Z",
            "updatedAt": "2021-07-08T19:40:43.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 542,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "Metoda Sampling",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-09-06T06:37:10.000Z",
            "updatedAt": "2022-09-24T09:52:29.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 552,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "Air",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-12-24T23:06:27.000Z",
            "updatedAt": "2022-12-24T23:06:28.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 739,
            "kode_kategori": "KATEGORI_SNI",
            "kode": null,
            "deskripsi1": "Lainnya",
            "deskripsi2": null,
            "grouping": null
        }
    ]);

  const [activeTab, setActiveTab] = useState<TabKeys>('general-info');
//   const { control, handleSubmit, formState: { errors } } = useForm<Partial<MethodType>>({
//     mode: 'onChange',
//     defaultValues: { 
//         kode_sni: null,
//         judul: null,
//         kategori_referensi_id: null,
//         lampiran: null
//     }
//   });
const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Partial<MethodType>>({
    mode: "onChange",
    defaultValues: {
      kode_sni: null,
      judul: null,
      kategori_referensi_id: null,
      lampiran: null,
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const tabContentLists: Record<TabKeys, JSX.Element> = {
    'general-info': (
      <GeneralInfoCustom 
        formTitle="Add metode" 
        actionMethod={addMethod}
        backUrl='/admin/master/metode'
        successMessage='Successfully add metode'
        failedMessage='Failed to add metode'
      >
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='kode_sni'
                control={control}
                rules={{ required: 'Kode metode is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Kode metode<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Kode metode ...'
                    value={field.value ?? ''}
                    error={!!errors.kode_sni}
                    helperText={errors.kode_sni?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='judul'
                control={control}
                rules={{ required: 'Judul is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Judul<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Judul ...'
                    value={field.value ?? ''}
                    error={!!errors.judul}
                    helperText={errors.judul?.message}
                    />
                )}
                />
            </Grid>
    

        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="kategori_referensi_id"
                    control={control}
                    rules={{ required: 'Kategori metode is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Kategori metode<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.kategori_referensi_id}
                        helperText={errors.kategori_referensi_id?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Kategori metode</MenuItem>
                        {dataMasterKategoriMetode?.map((kategori) => (
                        <MenuItem key={kategori.id} value={kategori.id}>
                            {kategori.deskripsi1}
                        </MenuItem>
                        ))}
                    </CustomTextField>
                    )}
                />
            </Grid>
        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name="lampiran"
                control={control}
                rules={{ required: "Lampiran is required" }}
                render={({ field }) => (
                    <>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        hidden
                        id="file-upload"
                        onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        setValue("lampiran", file); // Update react-hook-form state
                        }}
                    />
                    <label htmlFor="file-upload">
                        <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ textTransform: "none" }}
                        >
                        Upload Lampiran
                        </Button>
                    </label>
                    {selectedFile && (
                        <Typography sx={{ marginTop: 1, fontSize: 14 }}>
                        {selectedFile.name}
                        </Typography>
                    )}
                    {errors.lampiran && (
                        <Typography sx={{ color: "red", fontSize: 12, marginTop: 1 }}>
                        {errors.lampiran.message}
                        </Typography>
                    )}
                    </>
                )}
                />
            </Grid>
        </Grid>
      </GeneralInfoCustom>
    )
  };

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className="p-0">
            {tabContentLists[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  );
};

export default AddMasterMethodPage;
