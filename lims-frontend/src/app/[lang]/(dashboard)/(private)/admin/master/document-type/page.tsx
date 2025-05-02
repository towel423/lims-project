"use client";
import React, { useEffect, useState } from "react";
import { getJwtToken } from "@/helpers/helper";
import { TypeDocumentsField, TypeDocumentsType } from "@/types/apps/typeDocumentTypes";
import TypeDocumentTable from "@/views/admin/master/document-type/TypeDocumentTable";

// Function to fetch document types
async function fetchDocumentTypes(page: number) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };


  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`/api/document-types`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document types");
  }

  const responseData = await response.json();

  return responseData;
}

const transformStatusDocuments = (data: any): TypeDocumentsType[] => {
  return data.map((doc: any) => ({
    uuid: doc.uuid,
    name: doc.name,
    prefix: doc.prefix,
  }));
};

const addTypeDocument = async (data: TypeDocumentsField, refetch: () => void): Promise<void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch('/api/document-types', {
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

const deleteTypeDocument = async (data: string, refetch: () => void): Promise<void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch(`/api/document-types`, {
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

const updateTypeDocument = async (data: TypeDocumentsType, refetch: () => void): Promise<void> => {
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

    refetch();
  } catch (error) {
    console.error("Error updating document status:", error);
  }
};

export default function DocumentTypePage() {
  const [documentTypes, setDocumentTypes] = useState<TypeDocumentsType[]>([]);
  const [page] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const getDocumentTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetchDocumentTypes(page);
      const transformedData = transformStatusDocuments(response.data.data.data);
      setDocumentTypes(transformedData);
    } catch (error) {
      console.error("Error fetching document types:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch document types when the component mounts
  useEffect(() => {
    getDocumentTypes();
  }, [page]); // Fetch whenever page changes (if applicable)

  // Check if StatusDocumentTable receives documentTypes as expected
  return (
    <TypeDocumentTable
      isLoading={isLoading}
      tableData={documentTypes}
      addTypeDocument={(data: TypeDocumentsField) => addTypeDocument(data, getDocumentTypes)}
      deleteTypeDocument={(data: string) => deleteTypeDocument(data, getDocumentTypes)}
      updateTypeDocument={(data: TypeDocumentsType) => updateTypeDocument(data, getDocumentTypes)}
    />
  );
}
