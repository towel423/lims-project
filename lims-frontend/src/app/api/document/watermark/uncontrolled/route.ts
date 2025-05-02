
import { FileMasterType } from '@/types/apps/documentControlTypes';
import axios from 'axios';
import { NextResponse } from 'next/server';
import { URL } from 'url';

export async function GET(request: Request) {
  try {
    // Ambil Authorization header
    const token = request.headers.get('Authorization') ?? '';
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token is missing" },
        { status: 401 }
      );
    }

    const bearerToken = `Bearer ${token}`;

    // Ambil parameter `url` dari query
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    if (!fileUrl) {
      return NextResponse.json(
        { error: "URL parameter is missing" },
        { status: 400 }
      );
    }

    // URL API
    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-control/download/watermark/uncontrolled`;

    // Lakukan permintaan GET dengan body
    const response = await axios({
      method: 'GET',
      url: api,
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json',
      },
      data: {
        url: fileUrl, // Kirimkan body seperti pada cURL
      },
    });

    // Kembalikan respons API
    return NextResponse.json(
      {
        success: true,
        message: "Request processed successfully",
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Error Response:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: error.response?.data?.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}






