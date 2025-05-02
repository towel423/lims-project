import { NextResponse } from 'next/server';
import { DocumentsField } from '@/types/apps/documentTypes';
import axios from 'axios';

const changeDocumentNumber = (documentTypeId: string, documentName: string, clauseNumber: string) => {
  // Get current document_name from form data
  const currentYear = new Date().getFullYear();
  const prefix = 'LKAL'; // or fetch from input if needed

  // Initialize documentNumber
  let documentNumber = '';
  
  // Generate document number based on document type
  if (documentTypeId == '1') {
    documentNumber = `${prefix} ${clauseNumber}/${currentYear} ${documentName}`;
  } else if (documentTypeId == '3') {
    documentNumber = `${prefix}-${clauseNumber}/${currentYear} ${documentName}`;
  }

  // Update the 'document_number' field in the form
  return documentNumber;
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization') ?? '';
    if (!token) {
      console.error("Authorization token is missing.");
      return NextResponse.json(
        { error: "Authorization token is missing" },
        { status: 401 }
      );
    }

    const bearerToken = `Bearer ${token}`;
    const formData = await request.formData();

    const documentNumber = changeDocumentNumber(
      formData.get('document_type_id')?.toString() ?? '',
      formData.get('document_name')?.toString() ?? '',
      formData.get('clause_number')?.toString() ?? ''
    );

    // Create FormData for API request
    const apiFormData = new FormData();
    apiFormData.append('document_name', formData.get('document_name')?.toString() ?? '');
    apiFormData.append('description', formData.get('description')?.toString() ?? '');
    apiFormData.append('publish_date', formData.get('publish_date')?.toString()?.split('T')[0] ?? '');
    apiFormData.append('page_count', formData.get('page_count')?.toString() ?? '0');
    apiFormData.append('document_type_id', formData.get('document_type_id')?.toString() ?? '0');
    apiFormData.append('document_category_id', formData.get('document_category_id')?.toString() ?? '0');
    apiFormData.append('file', formData.get('file') as File); // File must be valid
    apiFormData.append('document_number', documentNumber);
    apiFormData.append('clause_number', formData.get('clause_number')?.toString() ?? '');
    apiFormData.append('revision_number', formData.get('revision_number')?.toString() ?? '');
    apiFormData.append('sequence_number', formData.get('sequence_number')?.toString() ?? '');
    apiFormData.append('status_id', formData.get('status_id')?.toString() ?? '');

    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-control`;
    
    // Use axios with FormData
    const response = await axios.post(api, apiFormData, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'multipart/form-data',
      },
    });


    return NextResponse.json(
      {
        success: true,
        message: "Document added successfully",
        data: response.data,
      },
      {
        status: response.status,
      }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        error: error.response.data.message
      },
      {
        status: error.response.data.statusCode || 500,
      }
    );
  }
}


export async function DELETE(request: Request) {
  try {
    // Check token
    const token = request.headers.get('Authorization') ?? '';
    if (!token) {
      console.error("Authorization token is missing.");
      return NextResponse.json(
        { error: "Authorization token is missing" },
        { status: 401 }
      );
    }

    const bearerToken = `Bearer ${token}`;

    // Get the request body (the data to be added)
    const data: { uuid: string } = await request.json();

    // Create API url
    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-control/delete/${data.uuid}`;

    // Make the API request
    const response = await axios.delete(api, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json',
      },
    });

    // Return sucess response
    return NextResponse.json(
      {
        success: true,
        message: "Document deleted successfully",
        data: response.data
      },
      {
        status: response.status
      }
    );

  } catch (error: any) {
    console.error(error.message);

    // Return response
    return NextResponse.json(
      {
        error: error.response?.data?.message,
      },
      {
        status: error.response?.status || 500
      }
    );
  }
}

