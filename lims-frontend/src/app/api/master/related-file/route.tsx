
import { DocumentsType } from '@/types/apps/documentTypes';
import { DocumentCategorySelectListType } from '@/types/apps/selectListTypes';
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

    const bearerToken = `Bearer ${token}`;
    const url = new URL(request.url);  // Create a URL object from the request URL
    const documentUuid = url.searchParams.get('uuid'); // Get the query parameter value

    
    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/document-related/control/list/${documentUuid}`;

    // Make the API request
    const response = await axios.get<DocumentsType[]>(api, {
      headers: {
        Authorization: bearerToken,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get master related files",
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