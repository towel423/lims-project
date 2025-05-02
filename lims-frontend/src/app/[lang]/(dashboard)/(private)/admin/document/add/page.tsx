'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import axios from 'axios';

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

// Next Imports
import dynamic from 'next/dynamic'
import { getJwtToken } from '@/helpers/helper'
import { InternalDocumentsField } from '@/types/apps/internalDocumentTypes'
import { RoleActionMasterType } from '@/types/apps/roleActionMasterTypes'
import GeneralInfo from '@/views/admin/document/form/general-info'
import { DocumentCategorySelectListType, DocumentTypeSelectListType } from '@/types/apps/selectListTypes'
import { TypeDocumentsField } from '@/types/apps/typeDocumentTypes'
import { DocumentsField } from '@/types/apps/documentTypes'

// Define possible tab keys as a union type
type TabKeys = 'general-info' | 'access-role';

const addDocument = async (data: Partial<DocumentsField>): Promise<{ status: number; message: string } | undefined> => {
    const token = getJwtToken();
    const formData = new FormData();
  
    // Append all necessary data to formData
    formData.append('document_name', data.document_name ?? '');
    formData.append('description', data.description ?? '');
    formData.append('clause_number', data.clause_number ?? '');
    formData.append('revision_number', String(data.revision_number ?? '0'));
    formData.append('sequence_number', String(data.sequence_number ?? '0'));
    if (data.publish_date instanceof Date) {
        // Format date to YYYY-MM-DD
        formData.append('publish_date', data.publish_date.toISOString().split('T')[0]);
    } else {
        formData.append('publish_date', data.publish_date ?? '');
    } // Format date as string (YYYY-MM-DD)
    // Ensure all numeric or mixed-type fields are cast to strings
    formData.append('page_count', String(data.page_count ?? '0'));
    formData.append('document_type_id', String(data.document_type_id ?? '0'));
    formData.append('document_category_id', String(data.document_category_id ?? '0'));
    if (data.file) formData.append('file', data.file);
  
    // Do not manually set Content-Type when sending FormData
    const headers: HeadersInit = {
      'Authorization': `${token}`,
    };
  
    try {
      const response = await axios.post('/api/document', formData, {
        headers: headers, // Axios will handle Content-Type for multipart/form-data
      });

      if (response.status === 201) {
        return { status: 201, message: "Successfully added new document" };
      }
  
    } catch (error: any) {
      throw {
        status: error.response.status,
        message: error.response.data.error,
      };
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

async function fetchSelectListDocumentType(documentCategoryId: string) {
    const token = getJwtToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };


    if (token) {
        headers.Authorization = token;
    }

    const response = await fetch(`/api/master/document-type?document_category_id=${documentCategoryId}`, { 
        method: 'GET',
        headers 
    });

    if (!response.ok) {
        throw new Error("Failed to fetch master document type");
    }

    const responseData = await response.json();

    return responseData;
}


const transformCategoryDocuments = (data: any): DocumentCategorySelectListType[] => {
    return data.map((doc: any) => ({
      id: doc.category_document.id,
      name: doc.category_document.name,
      prefix: doc.category_document.prefix
    }));
  };

const transformTypeDocuments = (data: any): DocumentTypeSelectListType[] => {
    return data.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      prefix: doc.prefix
    }));
  };


const AddMasterDocumentInternalPage = () => {
    // States
    // const currentUrl = window.location.href;
    // const { category } = router; 
    const [selectListDocumentCategory, setSelectListDocumentCategory] = useState<DocumentCategorySelectListType[]>([]);



    const getSelectListDocumentType = async (documentCategoryId: string): Promise<DocumentTypeSelectListType[]> => {
        try {
            // Assuming fetchSelectListDocumentType is the function that makes the API request
            const response = await fetchSelectListDocumentType(documentCategoryId);
            let formattedData = transformTypeDocuments(response.data.data.data);
            return formattedData;
        } catch (error) {
            console.error("Error fetching document categories:", error);
            return []; // Return an empty array in case of an error
        }
    };
    
    
    
    const getSelectListDocumentCategory = async () => {
        try {
          const response = await fetchSelectListDocumentCategory();
          let formattedData = transformCategoryDocuments(response.data.data.data);
          setSelectListDocumentCategory(formattedData);
        } catch (error) {
          console.error("Error fetching document categories:", error);
        }
    };
    
      useEffect(() => {
        getSelectListDocumentCategory();
        // console.log(currentUrl, 'windowlochrepppppp');
        // if (typeof currentUrl == 'string') {
        //   let categoryId = currentUrl.split('?category=').at(-1)
        //   console.log({categoryId}, currentUrl.split('?category='))
        //   if(categoryId){
        //     getSelectListDocumentType(categoryId);
        //   }
        // }
      }, [])

    return (
        <TabContext value={'document-internal'}>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <TabPanel value={'document-internal'} className='p-0'>
                        <GeneralInfo formTitle="Add Document" dataMasterDocumentCategory={selectListDocumentCategory} getSelectListDocumentType={getSelectListDocumentType} addDocument={addDocument} />
                    </TabPanel>
                </Grid>
            </Grid>
        </TabContext>
    );
};

export default AddMasterDocumentInternalPage;
