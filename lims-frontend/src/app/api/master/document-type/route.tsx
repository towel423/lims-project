
import { TypeDocumentsType } from '@/types/apps/typeDocumentTypes';
import axios from 'axios';
import { NextResponse } from 'next/server';


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

    const url = new URL(request.url);  // Create a URL object from the request URL
    const documentCategoryId = url.searchParams.get('document_category_id'); // Get the query parameter value

    const bearerToken = `Bearer ${token}`;

    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/document-type?showAll=true&document_category_id=${documentCategoryId}`;

    // Make the API request
    const response = await axios.get<TypeDocumentsType[]>(api, {
      headers: {
        Authorization: bearerToken,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get document types",
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
