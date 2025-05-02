"use client";
import React, { useEffect, useState } from "react";
import StatusDocumentTable from "@/views/admin/master/document-status/StatusDocumentTable";
import { getJwtToken } from "@/helpers/helper";
import { StatusDocumentsType } from "@/types/apps/statusDocumentTypes";
import { CategoryDocumentsField, CategoryDocumentsType } from "@/types/apps/categoryDocumentTypes";
import CategoryDocumentTable from "@/views/admin/master/document-category/CategoryDocumentTable";
import { RoleActionMasterType } from "@/types/apps/roleActionMasterTypes";
import { useDocumentTypeStore } from '@/hooks/document-type/store'
import DocumentTable from "@/views/admin/document/DocumentTable";
import { InternalDocumentTypeDatatable } from "@/types/apps/internalDocumentTypes";
import { Pagination } from "@/types/apps/paginationTypes";

// Function to fetch document categories
async function fetchInternalDocuments(page: number, documentType: string, documentStatus: string, perPage: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/internal-documents?page=${page}&document_type=${documentType}&document_status=${documentStatus}&per_page=${perPage}`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document internal");
  }

  const responseData = await response.json();

  return responseData;
}

  const transformInternalDocuments = (data: any): InternalDocumentTypeDatatable[] => {
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
  

  const deleteDocumentInternal = async (
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
  

export default function DocumentCategoryPage() {
  const [internalDocuments, setInternalDocuments] = useState<InternalDocumentTypeDatatable[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    perPage: '10',
    totalPages: 1,
    totalRecords: 0,
    documentType: '',
    documentStatus: '3',
  });
  const [isLoading, setIsLoading] = useState(true);

  const getInternalDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetchInternalDocuments(pagination.currentPage, pagination.documentType, pagination.documentStatus, pagination.perPage);
      const result = response.data.data;
  
      setPagination(prev => ({
        ...prev,
        perPage: result.per_page,
        totalPages: result.total_pages,
        totalRecords: result.total_records,
      }));

      if (result.data == null) {
        setInternalDocuments([]);
      } else {
        const transformedData = transformInternalDocuments(result.data);
        setInternalDocuments(transformedData);
      }
        
    } catch (error) {
      console.error("Error fetching internal documents:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
      getInternalDocuments();
  }, [
      pagination.currentPage, 
      pagination.perPage, 
      pagination.documentType, 
      pagination.documentStatus
    ]);

  // Check if StatusDocumentTable receives documentCategories as expected
  return (
    <DocumentTable
      isLoading={isLoading}
      tableData={internalDocuments}
      docType={'internal'}
      deleteDocument={(data: string) => deleteDocumentInternal(data, getInternalDocuments)}
      originPage="1"
      pagination={pagination}
      setPagination={setPagination}
    />
  );
}
