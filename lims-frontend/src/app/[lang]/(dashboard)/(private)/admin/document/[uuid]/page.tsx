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
import { useParams } from 'next/navigation'
import { useDetailDocumentControlStore } from '@/hooks/document/store'
import { DocumentDetailField, DocumentHistoryType, DocumentLogType, DocumentsType } from '@/types/apps/documentTypes'
import { RelatedFileFormType, RelatedFileType } from '@/types/apps/relatedFileTypes'
import axios from 'axios';
import { FilePermissionFormType, FilePermissionType } from '@/types/apps/filePermissionTypes'
import { RoleType } from '@/types/apps/roleTypes'
import { Box, CircularProgress } from '@mui/material'

const DocumentInfoTab = dynamic(() => import('@/views/admin/document/detail/DocumentInfo'))
const FileMasterTab = dynamic(() => import('@/views/admin/document/detail/FileMaster'))
const RelatedDocumentTab = dynamic(() => import('@/views/admin/document/detail/RelatedDocumentTable'))
const DocumentHistoryTab = dynamic(() => import('@/views/admin/document/detail/DocumentHistoryTable'))
const DocumentLogTab = dynamic(() => import('@/views/admin/document/detail/DocumentLogTable'))
const FilePermissionTab = dynamic(() => import('@/views/admin/document/detail/FilePermissionTable'))

// Define possible tab keys as a union type
type TabKeys = 'document-info' | 'file-master' | 'related-document' | 'document-history' | 'file-permission' | 'document-log';


const addRevision = async (data: Partial<DocumentDetailField>): Promise<{ status: number; message: string } | undefined> => {
  const token = getJwtToken();

  const { uuid, description, page_count, file, document_number } = data;


  const formData = new FormData();

  formData.append('document_number', document_number ?? '');
  formData.append('description', description ?? '');
  formData.append('page_count', String(page_count ?? '0'));
  if (file) formData.append('file', file);

  const headers: HeadersInit = {
    'Authorization': `${token}`,
  };

  try {
    const response = await axios.post(`/api/document/document-info/${uuid}`, formData, {
      headers: headers,
    });

    if (response.status === 201) {
      return {
        status: response.status,
        message: 'Successfully added new revision',
      };
    }

  } catch (error: any) {
    throw {
      status: error.response.status,
      message: error.response.data.error,
    };
  }
};


const addRole = async (data: FilePermissionFormType, refetch: () => void): Promise<{ status: number; message: string } | void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch('/api/document/file-permission', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ role: data.guard_name, uuid: data.uuid }),
    });

      refetch();
  
      return {
        status: response.status,
        message: "Successfully add file permission",
      };
    } catch (error: any) {
      throw {
        status: error.response.status,
        message: error.response.data.error,
      };
    }
};


const addRelatedFile = async (data: RelatedFileFormType,  refetch: () => void): Promise<{ status: number; message: string } | void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch(`/api/document/related-files`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ document_control_uuid_target: data.document_control_uuid_target, uuid: data.uuid }),
    });

    
      if (!response.ok) {
        const responseData = await response.json();
        return {
          status: response.status || 500,
          message: responseData.error || "Failed to add related file",
        };
      };
  
      refetch();
      return {
        status: response.status,
        message: "Successfully add related file",
      };
    } catch (error: any) {
      throw {
        status: error.response.status,
        message: error.response.data.error,
      };
    }
};


async function fetchSelectListRelatedFiles(uuid: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/master/related-file?uuid=${uuid}`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master related files");
  }

  const responseData = await response.json();

  return responseData;
}

async function fetchSelectListRoles(page?: number) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/master/role`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch master roles");
  }

  const responseData = await response.json();

  return responseData;
}


async function fetchDocumentControlByUuid(uuid: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/document/document-info/${uuid}`, { 
    method: 'GET',
    headers 
  });

  

  if (!response.ok) {
    throw new Error("Failed to fetch document info");
  }

  const responseData = await response.json();

  return responseData;
}

async function fetchFileMasterByUuid(uuid: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/document/file-master/${uuid}`, { 
    method: 'GET',
    headers 
  });

  

  if (!response.ok) {
    throw new Error("Failed to fetch file master");
  }

  const responseData = await response.json();

  return responseData;
}

async function fetchFilePermissionByUuid(uuid: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/document/file-permission?uuid=${uuid}&page=1`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch file permission");
  }

  const responseData = await response.json();

  return responseData;
}

async function fetchRelatedFileByDocumentControlUuid(page: number, uuid: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  // Corrected query string with '&' to separate parameters
  const response = await fetch(`/api/document/related-files?uuid=${uuid}&page=${page}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch related files");
  }

  const responseData = await response.json();

  return responseData;
}

async function fetchDocumentHistoryByDocumentControlUuid(page: number, uuid: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/document/document-history/${uuid}?page=${page}`, { 
    method: 'GET',
    headers 
  });

  

  if (!response.ok) {
    throw new Error("Failed to fetch document history");
  }

  const responseData = await response.json();

  return responseData;
}

async function fetchDocumentLogByDocumentControlUuid(page: number, uuid: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/document/document-log/${uuid}?page=${page}`, { 
    method: 'GET',
    headers 
  });

  

  if (!response.ok) {
    throw new Error("Failed to fetch document log");
  }

  const responseData = await response.json();

  return responseData;
}

async function generateDocumentPreviewLink(url: string) {
  const token = getJwtToken(); 
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: token }), 
  };

  try {
    const response = await axios.get('/api/document/file-master/preview', {
      headers,
      params: { url },
    });

    return response.data;
  } catch (error) {
    console.error("Error generating file master preview:", error);
    throw new Error("Failed to generate file master preview");
  }
}

async function generateDocumentControlledLink(url: string) {
  const token = getJwtToken(); 
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: token }), 
  };

  try {
    const response = await axios.get('/api/document/watermark/controlled', {
      headers,
      params: { url },
    });

    return response.data;
  } catch (error) {
    console.error("Error generating file master controlled:", error);
    throw new Error("Failed to generate file controlled");
  }
}

async function generateDocumentUncontrolledLink(url: string) {
  const token = getJwtToken(); 
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: token }), 
  };

  try {
    const response = await axios.get('/api/document/watermark/uncontrolled', {
      headers,
      params: { url },
    });

    return response.data;
  } catch (error) {
    console.error("Error generating file master uncontrolled:", error);
    throw new Error("Failed to generate file master uncontrolled");
  }
}

const deleteRelatedFile = async (data: Partial<RelatedFileType>, refetch: () => void): Promise<{ status: number; message: string } | void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }


  try {
    const response = await fetch(`/api/document/related-files`, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({uuid: data.uuid, document_control_uuid: data.document_control_uuid})
    });
    

    if (!response.ok) {
      throw new Error("Failed to delete related file");
    }

    refetch();
  } catch (error) {
    console.error("Error deleting related file:", error);
  }
};

const deleteFilePermission = async (data: Partial<FilePermissionFormType>, refetch: () => void): Promise<{ status: number; message: string } | void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch(`/api/document/file-permission`, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({uuid: data.uuid, role: data.guard_name})
    });
    

    if (!response.ok) {
      throw new Error("Failed to delete file permission");
    }

    refetch();
  } catch (error) {
    console.error("Error deleting file permission:", error);
  }
};

const DetailDocumentControlPage = () => {
  // States
  const [activeTab, setActiveTab] = useState<TabKeys>('document-info');  
  const [relatedFilesData, setRelatedFilesData] = useState<RelatedFileType[]>([]);  
  const [documentHistoryData, setDocumentHistoryData] = useState<DocumentHistoryType[]>([]);  
  const [documentLogData, setDocumentLogData] = useState<DocumentLogType[]>([]);  
  const [filePermission, setFilePermission] = useState<FilePermissionType[]>([]);
  const [selectListRelatedFiles, setSelectListRelatedFiles] = useState<DocumentsType[]>([]);
  const [DocumentInfoDetail, setDocumentInfoDetail] = useState<DocumentsType>();
  const [selectListRoles, setSelectListRoles] = useState<RoleType[]>([]);
  const [loadingStatus, setLoadingStatus] = useState({
    documentInfo: true,
    fileMaster: true,
    relatedDocument: true,
    documentHistory: true,
    filePermission: true,
    documentLog: true,
  });  
  const changeDocumentControl = useDetailDocumentControlStore((state: any) => state.changeDetailDocumentControl);

  const params = useParams();
  const { uuid } = params;

  const handleChange = (event: SyntheticEvent, value: TabKeys): void => {
    setActiveTab(value);
  };

  const previewFileMaster = async (url: string) => {
    try {
      if (typeof uuid === 'string') {
        const response = await generateDocumentPreviewLink(url);
        
        if (response.data.statusCode == 200) { 

          return response.data.data;

        } else {
          console.error("Error get preview file master");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error get preview file master:", error);
    }
  };

  const controlledFileMaster = async (url: string) => {
    try {
      if (typeof uuid === 'string') {
        const response = await generateDocumentControlledLink(url);
        if (response.data.statusCode == 200) { 

          return response.data.data;

        } else {
          console.error("Error get controlled file");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error get controlled file:", error);
    }
  };

  const uncontrolledFileMaster = async (url: string) => {
    try {
      if (typeof uuid === 'string') {
        const response = await generateDocumentUncontrolledLink(url);
        
        if (response.data.statusCode == 200) { 

          return response.data.data;

        } else {
          console.error("Error get uncontrolled file");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error get uncontrolled file:", error);
    }
  };

  const tabContentLists: Record<TabKeys, ReactElement> = {
    "document-info": <DocumentInfoTab formTitle="Add Document Category" addRevision={addRevision} previewFileMaster={previewFileMaster}/>,
    "file-master": <FileMasterTab previewFileMaster={previewFileMaster} controlledFileMaster={controlledFileMaster} uncontrolledFileMaster={uncontrolledFileMaster} />,
    "related-document": <RelatedDocumentTab RelatedDocumentData={relatedFilesData} selectListRelatedFiles={selectListRelatedFiles} addRelatedFile={(data: RelatedFileFormType) => addRelatedFile(data, getRelatedFiles)} deleteRelatedFile={(data: Partial<RelatedFileType>) => deleteRelatedFile(data, getRelatedFiles)} isLoading={loadingStatus.fileMaster} previewFileMaster={previewFileMaster} DocumentInfoDetail={DocumentInfoDetail} />,
    "document-history": <DocumentHistoryTab DocumentHistoryData={documentHistoryData} isLoading={loadingStatus.fileMaster} previewFileMaster={previewFileMaster} />,
    "file-permission": <FilePermissionTab FilePermissionData={filePermission} selectListRoles={selectListRoles} addRole={(data: FilePermissionFormType) => addRole(data, getFilePermission)} deleteFilePermission={(data: Partial<RelatedFileType>) => deleteFilePermission(data, getFilePermission)} isLoading={loadingStatus.filePermission} />,
    "document-log": <DocumentLogTab DocumentLogData={documentLogData} isLoading={loadingStatus.documentLog} />,
  };

  const getDocumentControl = async () => {
    try {
      setLoadingStatus((prev) => ({ ...prev, documentInfo: true }));
      // Ensure `uuid` is a string before passing it to the function
      if (typeof uuid === 'string') {
        const response = await fetchDocumentControlByUuid(uuid);
        
        if (response.data.statusCode == 200) {        
          const { document_control, document_versions } = response.data.data;
          setDocumentInfoDetail(document_control)
          await changeDocumentControl({ documentControl: document_control, documentVersions: document_versions });

        } else {
          console.error("Error fetching document type");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error fetching document type:", error);
    } finally {
      setLoadingStatus((prev) => ({ ...prev, documentInfo: false }));
    }
  };

  const getFileMaster = async () => {
    try {
      setLoadingStatus((prev) => ({ ...prev, fileMaster: true }));
      // Ensure `uuid` is a string before passing it to the function
      if (typeof uuid === 'string') {
        const response = await fetchFileMasterByUuid(uuid);
        
        if (response.data.statusCode == 200) {        
          const { document_name, url_file, casbin_check } = response.data.data;
          
          await changeDocumentControl({ fileMaster: { document_name, url_file, casbin_check }} );

        } else {
          console.error("Error fetching document type");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error fetching document type:", error);
    } finally {
      setLoadingStatus((prev) => ({ ...prev, fileMaster: false }));
    }
  };

  const getFilePermission = async () => {
    try {
      setLoadingStatus((prev) => ({ ...prev, filePermission: true }));
      // Ensure `uuid` is a string before passing it to the function
      if (typeof uuid === 'string') {
        const response = await fetchFilePermissionByUuid(uuid);
        
        if (response.data.statusCode == 200) {        
          setFilePermission(response.data.data.data);
        } else {
          console.error("Error fetching document type");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error fetching document type:", error);
    } finally {
      setLoadingStatus((prev) => ({ ...prev, filePermission: false }));
    }
  };

  const getRelatedFiles = async (page?: number) => {
    try {
      setLoadingStatus((prev) => ({ ...prev, relatedDocument: true }));
      // Ensure `uuid` is a string before passing it to the function
      if (typeof uuid === 'string') {
        const response = await fetchRelatedFileByDocumentControlUuid(page ?? 1, uuid);
        
        if (response.data.statusCode == 200) {        
          let result = response.data.data.data;
          // console.log(response)
          setRelatedFilesData(result !== null ? result : []);

        } else {
          console.error("Error fetching related files");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error fetching related files:", error);
    } finally {
      setLoadingStatus((prev) => ({ ...prev, relatedDocument: false }));
    }
  };

  const getDocumentHistory = async (page: number) => {
    try {
      setLoadingStatus((prev) => ({ ...prev, documentHistory: false }));
      // Ensure `uuid` is a string before passing it to the function
      if (typeof uuid === 'string') {
        const response = await fetchDocumentHistoryByDocumentControlUuid(page, uuid);
        
        if (response.data.statusCode == 200) {

          let result = response.data.data.data;
          setDocumentHistoryData(result !== null ? result : []);

        } else {
          console.error("Error fetching related files");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error fetching related files:", error);
    } finally {
      setLoadingStatus((prev) => ({ ...prev, documentHistory: false }));
    }
  };
  
  const getDocumentLog = async (page: number) => {
    try {
      setLoadingStatus((prev) => ({ ...prev, documentLog: true }));
      // Ensure `uuid` is a string before passing it to the function
      if (typeof uuid === 'string') {
        const response = await fetchDocumentLogByDocumentControlUuid(page, uuid);
        
        if (response.data.statusCode == 200) {  
          
          let result = response.data.data;
          setDocumentLogData(result !== null ? result : []);

        } else {
          console.error("Error fetching related files");
        }
      } else {
        console.error("UUID is not a string:", uuid);
      }
    } catch (error) {
      console.error("Error fetching related files:", error);
    } finally {
      setLoadingStatus((prev) => ({ ...prev, documentLog: false }));
    }
  };

  const getSelectListRelatedFiles = async (uuid: string) => {
    try {
      const response = await fetchSelectListRelatedFiles(uuid);

      // let formattedData = transformCategoryDocuments(response.data.data.data);
      setSelectListRelatedFiles(response.data.data.data);
    } catch (error) {
      console.error("Error fetching document categories:", error);
    } 
  };
  
  const getSelectListRoles = async () => {
    try {
      const response = await fetchSelectListRoles();

      // let formattedData = transformCategoryDocuments(response.data.data.data);
      setSelectListRoles(response.data.data);
    } catch (error) {
      console.error("Error fetching document categories:", error);
    }
  };
  


  useEffect(() => {
    getDocumentControl();
    getFileMaster();
    getRelatedFiles(1);
    getDocumentHistory(1);
    getDocumentLog(1);
    getFilePermission();
    getSelectListRoles();
    if(typeof uuid == 'string'){
      getSelectListRelatedFiles(uuid);
    }
  }, [uuid])

  return  (
            // isLoading ? 
            // (
            //   <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            //     <CircularProgress />
            //   </Box>
            // ) : (
            <TabContext value={activeTab}>
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
                    <Tab label='Document Information' icon={<i className='tabler-file-info' />} iconPosition='start' value='document-info' />
                    <Tab label='File Master' icon={<i className='tabler-file-check' />} iconPosition='start' value='file-master' />
                    <Tab label='File Terkait' icon={<i className='tabler-topology-ring-2' />} iconPosition='start' value='related-document' />
                    <Tab label='Riwayat Dokumen' icon={<i className='tabler-file-time' />} iconPosition='start' value='document-history' />
                    <Tab label='File Permission' icon={<i className='tabler-lock' />} iconPosition='start' value='file-permission' />
                    <Tab label='Log Dokumen' icon={<i className='tabler-history' />} iconPosition='start' value='document-log' />
                  </CustomTabList>
                </Grid>
                <Grid item xs={12}>
                  <TabPanel value={activeTab} className='p-0'>
                      {Object.values(loadingStatus).some((status) => status) ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                          <CircularProgress />
                        </Box>
                      ) : (
                        tabContentLists[activeTab]
                      )}
                  </TabPanel>
                </Grid>
              </Grid>
            </TabContext>
          // )
        );
};

export default DetailDocumentControlPage;
