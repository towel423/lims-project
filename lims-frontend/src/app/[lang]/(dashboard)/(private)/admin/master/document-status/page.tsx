"use client";
import React, { useEffect, useState } from "react";
import StatusDocumentTable from "@/views/admin/master/document-status/StatusDocumentTable";
import { getJwtToken } from "@/helpers/helper";
import { StatusDocumentsType } from "@/types/apps/statusDocumentTypes";

// Function to fetch document statuses
async function fetchDocumentStatuses(page: number) {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json', // Set the content type for the request body
  };

  // Add the Authorization header only if the token exists
  if (token) {
    headers.Authorization = token; // Make sure `Bearer` is included
  }

  const response = await fetch(`/api/document-statuses`, { 
    method: 'GET',
    headers 
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document statuses");
  }

  const responseData = await response.json();

  return responseData;
}

// Function to transform status documents
const transformStatusDocuments = (data: any): StatusDocumentsType[] => {
  return data.map((doc: any) => ({
    uuid: doc.uuid,
    name: doc.name,
  }));
};

// Function to add status document
const addStatusDocument = async (data: string, refetch: () => void): Promise<void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json', // Set the content type for the request body
  };

  // Add the Authorization header only if the token exists
  if (token) {
    headers.Authorization = token; // Make sure Bearer is included
  }

  try {
    const response = await fetch('/api/document-statuses', {
      method: 'POST', // Use POST method
      headers: headers,
      body: JSON.stringify({name: data}), // Convert data to JSON format
    });

    if (!response.ok) {
      throw new Error("Failed to add document status");
    }

    // Refetch the document statuses after adding
    refetch();
  } catch (error) {
    console.error("Error adding document status:", error);
  }
};

const deleteStatusDocument = async (uuid: string, refetch: () => void): Promise<void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch(`/api/document-statuses`, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uuid })
    });
    

    if (!response.ok) {
      throw new Error("Failed to delete document status");
    }

    refetch();
  } catch (error) {
    console.error("Error deleting document status:", error);
  }
};

const updateStatusDocument = async (data: StatusDocumentsType, refetch: () => void): Promise<void> => {
  const token = getJwtToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = token;
  }


  try {
    const response = await fetch(`/api/document-statuses`, {
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

export default function DocumentStatusPage() {
  const [documentStatuses, setDocumentStatuses] = useState<StatusDocumentsType[]>([]);
  const [page] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch document statuses
  const getDocumentStatuses = async () => {
    try {
      setIsLoading(true);
      const response = await fetchDocumentStatuses(page);
      const transformedData = transformStatusDocuments(response.data.data.data);
      setDocumentStatuses(transformedData);
    } catch (error) {
      console.error("Error fetching document statuses:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Fetch document statuses when the component mounts
  useEffect(() => {
    getDocumentStatuses();
  }, [page]); // Fetch whenever page changes (if applicable)

  // Check if StatusDocumentTable receives documentStatuses as expected
  return (
    <StatusDocumentTable
      isLoading={isLoading}
      tableData={documentStatuses}
      addStatusDocument={(data: string) => addStatusDocument(data, getDocumentStatuses)}
      deleteStatusDocument={(data: string) => deleteStatusDocument(data, getDocumentStatuses)}
      updateStatusDocument={(data: StatusDocumentsType) => updateStatusDocument(data, getDocumentStatuses)}
    />
  );
}
