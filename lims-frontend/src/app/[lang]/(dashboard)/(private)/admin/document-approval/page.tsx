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
import { DocumentTypeDatatable } from "@/types/apps/documentTypes";
import { ApprovalDocumentFormType } from "@/types/apps/documentApprovalType";
import { Pagination } from "@/types/apps/paginationTypes";

// Function to fetch document categories
async function fetchApprovalDocuments(page: number, documentType: string, documentStatus: string, perPage: string) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/approval-documents?page=${page}&document_type=${documentType}&document_status=${documentStatus}&per_page=${perPage}`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch approval document");
  }

  const responseData = await response.json();

  return responseData;
}

const addApprovalDocument = async (
  data: ApprovalDocumentFormType,
  refetch: () => void
): Promise<{ status: number; message: string } | void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch(`/api/approval-documents/${data.uuid}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw {
        status: response.status,
        message: errorResponse.error || 'An error occurred',
      };
    }

    // Parse successful response
    const jsonResponse = await response.json();
    let msg = 'Successfully approved document';
    if (data.approvalType === 'reject') {
      msg = 'Successfully rejected document';
    }

    refetch();

    return {
      status: response.status,
      message: msg,
    };
  } catch (error: any) {
    console.error('Error occurred:', error);

    if (error.status) {
      throw error;
    } else {
      throw {
        status: 500,
        message: 'Unexpected error occurred while approving/rejecting document',
      };
    }
  }
};



const transformDraftDocuments = (data: any): DocumentTypeDatatable[] => {
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
      created_at: formatter.format(new Date(doc.created_at)),
      status_name: doc.status_name.toUpperCase()
    }));
  };


export default function DocumentApprovalPage() {
  const [approvalDocuments, setApprovalDocuments] = useState<DocumentTypeDatatable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    perPage: '10',
    totalPages: 1,
    totalRecords: 0,
    documentType: '',
    documentStatus: '',
  });

  const getApprovalDocuments = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetchApprovalDocuments(pagination.currentPage, pagination.documentType, pagination.documentStatus, pagination.perPage);
      const result = response.data.data;
  
      setPagination(prev => ({
        ...prev,
        perPage: result.per_page,
        totalPages: result.total_pages,
        totalRecords: result.total_records,
      }));

      if (result.data == null) {
        setApprovalDocuments([]);
      } else {
        const transformedData = transformDraftDocuments(result.data);
        setApprovalDocuments(transformedData);
      }
      
    } catch (error) {
      console.error("Error fetching approval documents:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Fetch document categories when the component mounts
  useEffect(() => {
    getApprovalDocuments();
  }, [pagination.currentPage, pagination.perPage, pagination.documentType, pagination.documentStatus]); // Fetch whenever page changes (if applicable)
  

  // Check if StatusDocumentTable receives documentCategories as expected
  return (
    <DocumentTable
      isLoading={isLoading}
      tableData={approvalDocuments}
      docType={'draft'}
      addApprovalDocument={(data: ApprovalDocumentFormType) => addApprovalDocument(data, getApprovalDocuments)}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
}
