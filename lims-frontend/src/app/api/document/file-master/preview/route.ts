import { FileMasterType } from '@/types/apps/documentControlTypes';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Extract URL query parameter
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url'); // Fetch the `url` from query parameters

    if (!url) {
      return NextResponse.json(
        { error: "The 'url' query parameter is required." },
        { status: 400 }
      );
    }

    // Check Authorization token
    const token = request.headers.get('Authorization') ?? '';
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is missing." },
        { status: 401 }
      );
    }

    const bearerToken = `Bearer ${token}`;

    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-control/preview/file-master`;

    console.log(api, url, 'from preview')

    // Make the GET request with axios
    const response = await axios.get<FileMasterType>(api, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json',
      },
      data: {
        url
      }
    });

    console.log(response.data, 'reset preview')


    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully generated file master preview",
        data: response.data,
      },
      {
        status: response.status,
      }
    );
  } catch (error: any) {
    console.error("Error:", error.message);

    // Return error response
    return NextResponse.json(
      {
        error: error.response?.data?.message,
      },
      {
        status: error.response?.status || 500,
      }
    );
  }
}
