import { RelatedFileFormType, RelatedFileType } from '@/types/apps/relatedFileTypes';
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

    // Parse the query parameters from the URL
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');
    const page = searchParams.get('page');

    if (!uuid || !page) {
      return NextResponse.json(
        { error: "Missing 'uuid' or 'page' query parameter" },
        { status: 400 }
      );
    }

    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-related?perPage=10&page=${page}&sortBy=id&sortDesc=true&showAll=true&document_control_uuid=${uuid}`;

    // Make the API request
    const response = await axios.get(api, {
      headers: {
        Authorization: bearerToken,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully fetched related files",
        data: response.data,
      },
      {
        status: response.status,
      }
    );
  } catch (error: any) {
    console.error(error.message);

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


export async function POST(request: Request) {

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
    const data: RelatedFileFormType = await request.json();

    // Create API url
    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-related/link/${data.uuid}`;

    // Make the API request
    const response = await axios.post(api, { document_control_uuid_target : data.document_control_uuid_target }, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json',
      },
    });

    // Return sucess response
    return NextResponse.json(
      {
        success: true,
        message: "File related added successfully",
        data: response.data
      },
      {
        status: response.status
      }
    );

  } catch (error: any) {
    console.error(error, 'errr related file');

    // Return response
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
    const data: { uuid: string, document_control_uuid: string } = await request.json();

    // Create API url
    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-related/unlink/${data.document_control_uuid}`;

    // Make the API request
    const response = await axios.post(api, { document_control_uuid_target : data.uuid }, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json',
      },
    });

    // Return sucess response
    return NextResponse.json(
      {
        success: true,
        message: "File related deleted successfully",
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
  