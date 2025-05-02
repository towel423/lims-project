'use client';

import { useState } from 'react';
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import dynamic from 'next/dynamic';
import { useForm, Controller } from 'react-hook-form';
import { getJwtToken } from '@/helpers/helper';
import CustomTextField from '@/@core/components/mui/TextField';
import { MenuItem } from '@mui/material';
import { ReagenType } from '@/types/apps/reagenTypes';

const GeneralInfoCustom = dynamic(() => import('@/views/components/GeneralInfoCustom'));

type TabKeys = 'general-info';

const addReagen = async (data: Partial<ReagenType>) => {
  const token = getJwtToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = token;

  try {
    const response = await fetch('/api/master/reagen', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to add reagen");

    return { status: response.status, message: 'Successfully added new reagen' };
  } catch (error) {
    console.error("Error adding reagen:", error);
  }
};

const AddMasterReagenPage = () => {
    const [dataMasterFormReferensi, setDataMasterFormReferensi] = useState( [
        {
            "createdAt": "2021-06-30T10:29:15.000Z",
            "updatedAt": "2021-06-30T10:29:16.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 14,
            "kode_kategori": "FORM_REAGEN",
            "kode": null,
            "deskripsi1": "Liquid",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:29:24.000Z",
            "updatedAt": "2021-06-30T10:29:24.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 15,
            "kode_kategori": "FORM_REAGEN",
            "kode": null,
            "deskripsi1": "Gas",
            "deskripsi2": null,
            "grouping": null
        }
    ]);
    const [dataMasterSatuanReferensi, setDataMasterSatuanReferensi] = useState( [
        {
            "createdAt": "2021-06-30T10:29:48.000Z",
            "updatedAt": "2021-06-30T10:29:48.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 17,
            "kode_kategori": "SATUAN_REAGEN",
            "kode": null,
            "deskripsi1": "mL",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:29:56.000Z",
            "updatedAt": "2021-06-30T10:29:56.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 18,
            "kode_kategori": "SATUAN_REAGEN",
            "kode": null,
            "deskripsi1": "gr",
            "deskripsi2": null,
            "grouping": null
        }
    ]);
  const [activeTab, setActiveTab] = useState<TabKeys>('general-info');
  const { control, handleSubmit, formState: { errors } } = useForm<Partial<ReagenType>>({
    mode: 'onChange',
    defaultValues: { 
        no_cas: null,
        reagen: null,
        form_referensi_id: null,
        satuan_referensi_id: null,
        stock: null,
        min_stock: null,
        keterangan: null,
    }
  });

  const tabContentLists: Record<TabKeys, JSX.Element> = {
    'general-info': (
      <GeneralInfoCustom 
        formTitle="Add Reagen" 
        actionMethod={addReagen}
        backUrl='/admin/master/reagen'
        successMessage='Successfully add reagen'
        failedMessage='Failed to add reagen'
      >
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='no_cas'
                control={control}
                  rules={{ required: 'No Cas is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            No Cas<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='No Cas ...'
                    value={field.value ?? ''}
                    error={!!errors.no_cas}
                    helperText={errors.no_cas?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='reagen'
                control={control}
                  rules={{ required: 'Reagen is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Reagen<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Reagen ...'
                    value={field.value ?? ''}
                    error={!!errors.reagen}
                    helperText={errors.reagen?.message}
                    />
                )}
                />
            </Grid>
        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="form_referensi_id"
                    control={control}
                    rules={{ required: 'Form Referensi is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Form Referensi<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.form_referensi_id}
                        helperText={errors.form_referensi_id?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Form Referensi</MenuItem>
                        {dataMasterFormReferensi?.map((form_referensi) => (
                        <MenuItem key={form_referensi.id} value={form_referensi.id}>
                            {form_referensi.deskripsi1}
                        </MenuItem>
                        ))}
                    </CustomTextField>
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="satuan_referensi_id"
                    control={control}
                    rules={{ required: 'Satuan Referensi is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Satuan Referensi<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.satuan_referensi_id}
                        helperText={errors.satuan_referensi_id?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Satuan Referensi</MenuItem>
                        {dataMasterSatuanReferensi?.map((satuan_referensi) => (
                        <MenuItem key={satuan_referensi.id} value={satuan_referensi.id}>
                            {satuan_referensi.deskripsi1}
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
                name='stock'
                control={control}
                // rules={{ required: 'Stok is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Stok
                        </>
                        }
                    placeholder='Stok ...'
                    value={field.value ?? ''}
                    // error={!!errors.stock}
                    // helperText={errors.stock?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='min_stock'
                control={control}
                // rules={{ required: 'Min Stock is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Min Stock
                        </>
                        }
                    placeholder='Min Stock ...'
                    value={field.value ?? ''}
                    // error={!!errors.min_stock}
                    // helperText={errors.min_stock?.message}
                    />
                )}
                />
            </Grid>
         
        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='keterangan'
                control={control}
                rules={{ required: 'Keterangan is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Keterangan<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Keterangan ...'
                    value={field.value ?? ''}
                    error={!!errors.keterangan}
                    helperText={errors.keterangan?.message}
                    />
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

export default AddMasterReagenPage;
