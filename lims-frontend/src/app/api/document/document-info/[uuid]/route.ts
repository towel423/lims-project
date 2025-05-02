
import { DetailDocumentControlType, DocumentControlType } from '@/types/apps/documentControlTypes';
import axios from 'axios';
import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
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

    // Parse the UUID from the URL
    const url = new URL(request.url);
    const uuid = url.pathname.split('/').pop();

    if (!uuid) {
      console.error("UUID is missing from the URL.");
      return NextResponse.json(
        { error: "UUID is missing from the URL" },
        { status: 400 }
      );
    }

    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-control/${uuid}`;

    // Make the API request
    const response = await axios.get<DetailDocumentControlType>(api, {
      headers: {
        Authorization: bearerToken,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get detail document control",
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

    // Create FormData for API request
    const apiFormData = new FormData();
    
    apiFormData.append('document_number', formData.get('document_number')?.toString() ?? '');
    apiFormData.append('description', formData.get('description')?.toString() ?? '');
    apiFormData.append('page_count', formData.get('page_count')?.toString() ?? '0');
    apiFormData.append('file', formData.get('file') as File);

    
    const url = new URL(request.url);
    const uuid = url.pathname.split('/').pop();

    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-revision/${uuid}`;


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
        message: "Document Revision added successfully",
        data: response.data,
      },
      {
        status: response.status,
      }
    );
  } catch (error: any) {
    console.error(error, 'error');
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
