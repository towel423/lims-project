'use client';

import CustomTabList from '@/@core/components/mui/TabList';
import { getJwtToken } from '@/helpers/helper';
import { useDocumentTypeStore } from '@/hooks/document-type/store';
import { RoleActionMasterType } from '@/types/apps/roleActionMasterTypes';
import { DocumentCategorySelectListType } from '@/types/apps/selectListTypes';
import { TypeDocumentsType } from '@/types/apps/typeDocumentTypes';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { Grid, Tab } from '@mui/material';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react';

// Define possible tab keys as a union type
type TabKeys = 'general-info' | 'access-role';

const GeneralInfoTab = dynamic(() => import('@/views/admin/master/document-type/form/general-info'))
const AccessRoleTab = dynamic(() => import('@/views/admin/master/document-type/form/access-role'))

async function fetchDocumentTypeByUuid(uuid: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/document-types/${uuid}`, { 
    method: 'GET',
    headers 
  });

  

  if (!response.ok) {
    throw new Error("Failed to fetch document types");
  }

  const responseData = await response.json();

  return responseData;
}

const updateTypeDocument = async (data: TypeDocumentsType):  Promise<{ status: number; message: string } | undefined> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch(`/api/document-types`, {
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


async function fetchSelectListDocumentCategory(page?: number) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/master/document-category`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master document category");
  }

  const responseData = await response.json();

  return responseData;
}

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

const transformStatusDocuments = (data: any): DocumentCategorySelectListType[] => {
  return data.map((doc: any) => ({
    id: doc.category_document.id,
    name: doc.category_document.name,
    prefix: doc.category_document.prefix
  }));
};

const UpdateDocumentTypePage = () => {
  // States
  const [activeTab, setActiveTab] = useState<TabKeys>('general-info');  
  const [dataMasterRoleAction, setDataMasterRoleActions] = useState<RoleActionMasterType>({ action: [], role: [] });
  const [selectListDocumentCategory, setSelectListDocumentCategory] = useState<DocumentCategorySelectListType[]>([]);

  // Zustand store
  const changeDocumentType = useDocumentTypeStore((state: any) => state.changeDocumentType);
  const documentTypeData = useDocumentTypeStore((state: any) => state.documentType);

  // const [documentType, setDocumentType] = useState<TypeDocumentsType>({ uuid: null, name: null, prefix: null, role_has_rules: [] });
  const params = useParams();
  const { uuid } = params;

  const handleChange = (event: SyntheticEvent, value: TabKeys): void => {
    setActiveTab(value);
  };
  

  // Tab content list with keys matching `TabKeys`
  const tabContentLists: Record<TabKeys, ReactElement> = {
    "general-info": <GeneralInfoTab formTitle="Update Document Type" handleChangeTab={handleChange} dataMasterDocumentCategory={selectListDocumentCategory}/>,
    "access-role": <AccessRoleTab formTitle="Update Document Type" handleChangeTab={handleChange} dataMasterRoleAction={dataMasterRoleAction} updateTypeDocument={updateTypeDocument}/>,
  };

  const getMasterRoleAction = async () => {
    try {
      const response = await fetchMasterRoleAction();
      setDataMasterRoleActions(response.data.data);
    } catch (error) {
      console.error("Error fetching document categories:", error);
    }
  };

  const getSelectListDocumentCategory = async () => {
    try {
      const response = await fetchSelectListDocumentCategory();
      let formattedData = transformStatusDocuments(response.data.data.data);
      setSelectListDocumentCategory(formattedData);
    } catch (error) {
      console.error("Error fetching document categories:", error);
    }
  };

  useEffect(() => {
    getMasterRoleAction();
    getSelectListDocumentCategory();
  }, [])
  

  const getDocumentType = async () => {
    try {
      // Ensure `uuid` is a string before passing it to the function
      if (typeof uuid === 'string') {
        const response = await fetchDocumentTypeByUuid(uuid);
        
        if (response.data.statusCode == 200) {        
          const { uuid, name, prefix, role_has_rules, document_category_id } = response.data.data;
          
          await changeDocumentType({ uuid, name, prefix, role_has_rules, document_category_id });

        } else {
          console.error("Error fetching document type");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error fetching document type:", error);
    }
  };
  

  useEffect(() => {
    getDocumentType();
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

export default UpdateDocumentTypePage;
