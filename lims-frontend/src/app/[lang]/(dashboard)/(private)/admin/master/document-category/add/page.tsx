'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

// Next Imports
import dynamic from 'next/dynamic'
import { getJwtToken } from '@/helpers/helper'
import { CategoryDocumentsField } from '@/types/apps/categoryDocumentTypes'
import { RoleActionMasterType } from '@/types/apps/roleActionMasterTypes'

const GeneralInfoTab = dynamic(() => import('@/views/admin/master/document-category/form/general-info'))
const AccessRoleTab = dynamic(() => import('@/views/admin/master/document-category/form/access-role'))

// Define possible tab keys as a union type
type TabKeys = 'general-info' | 'access-role';

const addCategoryDocument = async (data: CategoryDocumentsField): Promise<{ status: number; message: string } | undefined> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch('/api/document-categories', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to add document status");
    }

    // const jsonResponse = await response.json(); // Parse JSON response

    return {
      status: response.status,
      message: 'Successfully added new document status',
    };
  } catch (error) {
    console.error("Error adding document status:", error);
  }
};

async function fetchMasterRoleAction(page?: number) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/master/action-role`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master action role");
  }

  const responseData = await response.json();

  return responseData;
}


const AddMasterDocumentCategoryPage = () => {
  // States
  const [activeTab, setActiveTab] = useState<TabKeys>('general-info');  
  const [dataMasterRoleAction, setDataMasterRoleActions] = useState<RoleActionMasterType>({ action: [], role: [] });
  const [isFirstSave, setIsFirstSave] = useState(false);

  const changeFirstSave = (): void => {
    setIsFirstSave(!isFirstSave);
  }

  const handleChange = (event: SyntheticEvent, value: TabKeys): void => {
    setActiveTab(value);
  };

  const tabContentLists: Record<TabKeys, ReactElement> = {
    "general-info": <GeneralInfoTab formTitle="Add Document Category" handleChangeTab={handleChange}  changeFirstSave={changeFirstSave} isFirstSave={isFirstSave} />,
    "access-role": <AccessRoleTab formTitle="Add Document Category" handleChangeTab={handleChange} addCategoryDocument={addCategoryDocument} dataMasterRoleAction={dataMasterRoleAction} />,
  };

  const getMasterRoleAction = async () => {
    try {
      const response = await fetchMasterRoleAction();
      setDataMasterRoleActions(response.data.data);
    } catch (error) {
      console.error("Error fetching document categories:", error);
    }
  };

  useEffect(() => {
    getMasterRoleAction();
  }, [])

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab label='General Info' icon={<i className='tabler-file-info' />} iconPosition='start' value='general-info' disabled={true} />
            <Tab label='Access Role' icon={<i className='tabler-lock' />} iconPosition='start' value='access-role' disabled={true} />
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentLists[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  );
};

export default AddMasterDocumentCategoryPage;
