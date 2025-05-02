'use client';

import CustomTabList from '@/@core/components/mui/TabList';
import { getJwtToken } from '@/helpers/helper';
import { useDocumentCategoryStore } from '@/hooks/document-category/store';
import { CategoryDocumentsType } from '@/types/apps/categoryDocumentTypes';
import { RoleActionMasterType } from '@/types/apps/roleActionMasterTypes';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { Grid, Tab } from '@mui/material';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';

// Define possible tab keys as a union type
type TabKeys = 'general-info' | 'access-role';

const GeneralInfoTab = dynamic(() => import('@/views/admin/master/document-category/form/general-info'))
const AccessRoleTab = dynamic(() => import('@/views/admin/master/document-category/form/access-role'))

async function fetchDocumentCategoryByUuid(uuid: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/document-categories/${uuid}`, { 
    method: 'GET',
    headers 
  });

  

  if (!response.ok) {
    throw new Error("Failed to fetch document categories");
  }

  const responseData = await response.json();

  return responseData;
}

const updateCategoryDocument = async (data: CategoryDocumentsType):  Promise<{ status: number; message: string } | undefined> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }


  try {
    const response = await fetch(`/api/document-categories`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    

    if (!response.ok) {
      throw new Error("Failed to update document status");
    }

    return {
      status: response.status,
      message: 'Successfully update document status',
    };

  } catch (error) {
    console.error("Error updating document status:", error);
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

const UpdateDocumentCategoryPage = () => {
  // States
  const [activeTab, setActiveTab] = useState<TabKeys>('general-info');  
  const [dataMasterRoleAction, setDataMasterRoleActions] = useState<RoleActionMasterType>({ action: [], role: [] });

  // Zustand store
  const changeDocumentCategory = useDocumentCategoryStore((state: any) => state.changeDocumentCategory);
  const documentCategoryData = useDocumentCategoryStore((state: any) => state.documentCategory);

  const params = useParams();
  const { uuid } = params;

  const handleChange = (event: SyntheticEvent, value: TabKeys): void => {
    setActiveTab(value);
  };
  

  // Tab content list with keys matching `TabKeys`
  const tabContentLists: Record<TabKeys, ReactElement> = {
    "general-info": <GeneralInfoTab formTitle="Update Document Category" handleChangeTab={handleChange} />,
    "access-role": <AccessRoleTab formTitle="Update Document Category" handleChangeTab={handleChange} dataMasterRoleAction={dataMasterRoleAction} updateCategoryDocument={updateCategoryDocument}/>,
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
  

  const getDocumentCategory = async () => {
    try {
      // Ensure `uuid` is a string before passing it to the function
      if (typeof uuid === 'string') {
        const response = await fetchDocumentCategoryByUuid(uuid);
        
        if (response.data.statusCode == 200) {        
          const { uuid, name, prefix, role_has_rules } = response.data.data;
          
          await changeDocumentCategory({ uuid, name, prefix, role_has_rules });

        } else {
          console.error("Error fetching document category");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error fetching document category:", error);
    }
  };
  

  useEffect(() => {
    getDocumentCategory();
  }, [uuid]); 

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab label='General Info' icon={<i className='tabler-file-info' />} iconPosition='start' value='general-info' disabled={true} />
            <Tab label='Access Role' icon={<i className='tabler-lock' />} iconPosition='start' value='access-role' disabled={true} />
            {/* Additional tabs can be added here */}
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

export default UpdateDocumentCategoryPage;
