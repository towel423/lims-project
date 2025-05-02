
import { CategoryDocumentsType } from '@/types/apps/categoryDocumentTypes';
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
    const uuid = url.pathname.split('/').pop(); // Get the last segment, i.e., [uuid]

    if (!uuid) {
      console.error("UUID is missing from the URL.");
      return NextResponse.json(
        { error: "UUID is missing from the URL" },
        { status: 400 }
      );
    }

    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/category-document/${uuid}`;

    // Make the API request
    const response = await axios.get<CategoryDocumentsType[]>(api, {
      headers: {
        Authorization: bearerToken,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get document category",
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
