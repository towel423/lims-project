'use client';

import { useState } from 'react';
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import dynamic from 'next/dynamic';
import { useForm, Controller } from 'react-hook-form';
import { ProvinceType } from '@/types/apps/provinceTypes';
import { getJwtToken } from '@/helpers/helper';
import CustomTextField from '@/@core/components/mui/TextField';

const GeneralInfoCustom = dynamic(() => import('@/views/components/GeneralInfoCustom'));

type TabKeys = 'general-info';

const addProvince = async (data: Partial<ProvinceType>) => {
  const token = getJwtToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = token;

  try {
    const response = await fetch('/api/master/province', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to add province");

    return { status: response.status, message: 'Successfully added new province' };
  } catch (error) {
    console.error("Error adding province:", error);
  }
};

const AddMasterProvincePage = () => {
  const [activeTab, setActiveTab] = useState<TabKeys>('general-info');
  const { control, handleSubmit, formState: { errors } } = useForm<Partial<ProvinceType>>({
    mode: 'onChange',
    defaultValues: { nama_propinsi: '' }
  });

  const tabContentLists: Record<TabKeys, JSX.Element> = {
    'general-info': (
      <GeneralInfoCustom 
        formTitle="Add Province" 
        actionMethod={addProvince}
        backUrl='/admin/master/provinsi'
        successMessage='Successfully add province'
        failedMessage='Failed to add province'
      >
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6} marginBottom={4}>
            <Controller
              name='nama_propinsi'
              control={control}
              rules={{ required: 'Nama provinsi is required' }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Nama Provinsi'
                  placeholder='Nama provinsi ...'
                  value={field.value ?? ''}
                  error={!!errors.nama_propinsi}
                  helperText={errors.nama_propinsi?.message}
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

export default AddMasterProvincePage;
