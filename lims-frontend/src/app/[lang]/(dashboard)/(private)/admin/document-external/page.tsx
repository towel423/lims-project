"use client";
import React, { useEffect, useState } from "react";
import { getJwtToken } from "@/helpers/helper";
import DocumentTable from "@/views/admin/document/DocumentTable";
import { ExternalDocumentTypeDatatable } from "@/types/apps/externalDocumentTypes";
import { Pagination } from "@/types/apps/paginationTypes";

// Function to fetch document categories
async function fetchExternalDocuments(page: number, documentType: string, documentStatus: string, perPage: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/external-documents?page=${page}&document_type=${documentType}&document_status=${documentStatus}&per_page=${perPage}`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document external");
  }

  const responseData = await response.json();

  return responseData;
}

async function fetchMasterRoleAction(page: number) {
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
    throw new Error("Failed to fetch document categories");
  }

  const responseData = await response.json();

  return responseData;
}

const transformExternalDocuments = (data: any): ExternalDocumentTypeDatatable[] => {
    const formatter = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: '2-digit'
    });
  
    return data.map((doc: any) => ({
      uuid: doc.uuid,
      type_prefix: doc.type_prefix,
      document_number: doc.document_number,
      revision_number: doc.revision_number,
      publish_date: formatter.format(new Date(doc.publish_date)),
      status_name: doc.status_name.toUpperCase()
    }));
  };
  


const deleteCategoryDocument = async (data: string, refetch: () => void): Promise<void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch(`/api/document-categories`, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({uuid: data})
    });
    

    if (!response.ok) {
      throw new Error("Failed to delete document status");
    }

    refetch();
  } catch (error) {
    console.error("Error deleting document status:", error);
  }
};

export default function DocumentCategoryPage() {
  const [externalDocuments, setExternalDocuments] = useState<ExternalDocumentTypeDatatable[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    perPage: '10',
    totalPages: 1,
    totalRecords: 0,
    documentType: '',
    documentStatus: '',
});
  const [isLoading, setIsLoading] = useState(true);

  const getExternalDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetchExternalDocuments(pagination.currentPage, pagination.documentType, pagination.documentStatus, pagination.perPage);
      const result = response.data.data;
  
      setPagination(prev => ({
        ...prev,
        perPage: result.per_page,
        totalPages: result.total_pages,
        totalRecords: result.total_records,
      }));

      if (result.data == null) {
        setExternalDocuments([]);
      } else {
        const transformedData = transformExternalDocuments(result.data);
        setExternalDocuments(transformedData);
      }

    } catch (error) {
      console.error("Error fetching external documents:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const deleteDocumentExternal = async (
    data: string,
    refetch: () => void
  ): Promise<{ status: number; message: string }> => {
    const token = getJwtToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
  
    if (token) {
      headers.Authorization = token;
    }
  
    try {
      const response = await fetch(`/api/document`, {
        method: 'DELETE',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid: data }),
      });
  
      if (response.ok) {
        refetch();
        return { status: 200, message: 'Successfully deleted document' };
      } else {
        return { status: 500, message: 'Failed to delete document' };
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      return { status: 500, message: 'An error occurred while deleting the document' };
    }
  };

  useEffect(() => {
    getExternalDocuments();
  }, [pagination.currentPage, pagination.perPage, pagination.documentType, pagination.documentStatus]);

  // Check if StatusDocumentTable receives documentCategories as expected
  return (
    <DocumentTable
      isLoading={isLoading}
      tableData={externalDocuments}
      docType={'external'}
      deleteDocument={(data: string) => deleteDocumentExternal(data, getExternalDocuments)}
      originPage="2"
      pagination={pagination}
      setPagination={setPagination}
    />
  );
}
