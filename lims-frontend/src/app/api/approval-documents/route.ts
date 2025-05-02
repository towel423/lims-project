
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
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ?? '1';
    const document_type = url.searchParams.get('document_type') ?? '';
    const document_status = url.searchParams.get('document_status') ?? '';
    const per_page = url.searchParams.get('per_page') ?? 10;


    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/document-control/approval/list?perPage=${per_page}&page=${page}&sortBy=id&sortDesc=true&document_type_id=${document_type}&status_document_id=${document_status}`;

    // Make the API request
    const response = await axios.get<DocumentType[]>(api, {
      headers: {
        Authorization: bearerToken,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get approval documents",
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
