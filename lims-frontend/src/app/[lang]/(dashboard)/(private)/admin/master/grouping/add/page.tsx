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
import { GroupingType } from '@/types/apps/groupingTypes';

const GeneralInfoCustom = dynamic(() => import('@/views/components/GeneralInfoCustom'));

type TabKeys = 'general-info';

const addGrouping = async (data: Partial<GroupingType>) => {
  const token = getJwtToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = token;

  try {
    const response = await fetch('/api/master/global-reference', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to add grouping");

    return { status: response.status, message: 'Successfully added new grouping' };
  } catch (error) {
    console.error("Error adding grouping:", error);
  }
};

const AddMasterGroupingPage = () => {
  const [activeTab, setActiveTab] = useState<TabKeys>('general-info');
  const { control, handleSubmit, formState: { errors } } = useForm<Partial<GroupingType>>({
    mode: 'onChange',
    defaultValues: { 
        nama_grouping: null
    }
  });

  const tabContentLists: Record<TabKeys, JSX.Element> = {
    'general-info': (
      <GeneralInfoCustom 
        formTitle="Add Matriks" 
        actionMethod={addGrouping}
        backUrl='/admin/master/grouping'
        successMessage='Successfully add grouping'
        failedMessage='Failed to add grouping'
      >
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='nama_grouping'
                control={control}
                //   rules={{ required: 'Kode is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label='Grouping'
                    placeholder='Grouping ...'
                    value={field.value ?? ''}
                    //   error={!!errors.kode}
                    //   helperText={errors.kode?.message}
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

export default AddMasterGroupingPage;
