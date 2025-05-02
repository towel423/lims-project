import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Extract Authorization token from headers
    const authHeader = request.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Invalid Authorization header format' },
        { status: 401 }
      );
    }

    // Use the token as is
    const bearerToken = authHeader;

    // Parse request body
    const { uuid, note } = await request.json();
    if (!uuid || !note) {
      return NextResponse.json(
        { error: 'Missing required fields: uuid and note' },
        { status: 400 }
      );
    }

    // Construct API URL
    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/document-control/approve/${uuid}`;

    // Make the API call
    const response = await axios.post(
      api,
      { note },
      {
        headers: {
          Authorization: bearerToken, // Use the valid Authorization header
          'Content-Type': 'application/json',
        },
      }
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Document approved successfully',
        data: response.data,
      },
      {
        status: response.status,
      }
    );
  } catch (error: any) {
    console.error('Error in approval:', error.message);

    // Return error response
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
