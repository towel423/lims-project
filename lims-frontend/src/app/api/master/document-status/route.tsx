

import { StatusDocumentsType } from '@/types/apps/statusDocumentTypes';
import axios from 'axios';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  // try {
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

    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/status-document`;
    console.log(api);
    // Make the API request
    const response = await axios.get<StatusDocumentsType[]>(api, {
      headers: {
        Authorization: bearerToken,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get document status",
        data: response.data
      },
      {
        status: response.status
      }
    );

  // } catch (error: any) {
  //   console.error(error.message);

  //   // Return response
  //   return NextResponse.json(
  //     {
  //       error: error.response?.data?.message || "Internal Server Error",
  //     },
  //     {
  //       status: error.response?.status || 500
  //     }
  //   );
  // }
}
