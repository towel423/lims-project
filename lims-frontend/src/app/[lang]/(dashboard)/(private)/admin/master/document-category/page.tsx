"use client";
import React, { useEffect, useState } from "react";
import StatusDocumentTable from "@/views/admin/master/document-status/StatusDocumentTable";
import { getJwtToken } from "@/helpers/helper";
import { StatusDocumentsType } from "@/types/apps/statusDocumentTypes";
import { CategoryDocumentsField, CategoryDocumentsType } from "@/types/apps/categoryDocumentTypes";
import CategoryDocumentTable from "@/views/admin/master/document-category/CategoryDocumentTable";
import { RoleActionMasterType } from "@/types/apps/roleActionMasterTypes";
import { useDocumentTypeStore } from '@/hooks/document-type/store'

// Function to fetch document categories
async function fetchDocumentCategories(page: number) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/document-categories`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document categories");
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

const transformStatusDocuments = (data: any): CategoryDocumentsType[] => {
  return data.map((doc: any) => ({
    uuid: doc.category_document.uuid,
    name: doc.category_document.name,
    prefix: doc.category_document.prefix,
    role_has_rules: doc.role_has_rules,
  }));
};

const addCategoryDocument = async (data: CategoryDocumentsField, refetch: () => void): Promise<void> => {
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

    refetch();
  } catch (error) {
    console.error("Error adding document status:", error);
  }
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

const updateCategoryDocument = async (data: CategoryDocumentsType, refetch: () => void): Promise<void> => {
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

    refetch();
  } catch (error) {
    console.error("Error updating document status:", error);
  }
};

export default function DocumentCategoryPage() {
  const [documentCategories, setDocumentCategories] = useState<CategoryDocumentsType[]>([]);
  const [page] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const getDocumentCategories = async () => {
    try {
      setIsLoading(true); // Set loading to true before the fetch
      const response = await fetchDocumentCategories(page);
      const transformedData = transformStatusDocuments(response.data.data.data);
      setDocumentCategories(transformedData);
    } catch (error) {
      console.error("Error fetching document categories:", error);
    } finally {
      setIsLoading(false); // Ensure loading is set to false after fetch
    }
  };
  
  // Fetch document categories when the component mounts
  useEffect(() => {
    getDocumentCategories();
  }, [page]); // Fetch whenever page changes (if applicable)

  // Check if StatusDocumentTable receives documentCategories as expected
  return (
    <CategoryDocumentTable
      isLoading={isLoading}
      tableData={documentCategories}
      addCategoryDocument={(data: CategoryDocumentsField) => addCategoryDocument(data, getDocumentCategories)}
      deleteCategoryDocument={(data: string) => deleteCategoryDocument(data, getDocumentCategories)}
      updateCategoryDocument={(data: CategoryDocumentsType) => updateCategoryDocument(data, getDocumentCategories)}
    />
  );
}
