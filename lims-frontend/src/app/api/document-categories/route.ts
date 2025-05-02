import { CategoryDocumentsField, CategoryDocumentsType } from '@/types/apps/categoryDocumentTypes';
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

    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/category-document?showAll=true`;

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
        message: "Successfully get document categories",
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
    const data: CategoryDocumentsField = await request.json();

    // Create API url
    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/category-document`;

    // Make the API request
    const response = await axios.post(api, data, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json',
      },
    });

    // Return sucess response
    return NextResponse.json(
      {
        success: true,
        message: "Document Category added successfully",
        data: response.data
      },
      {
        status: response.status
      }
    );

  } catch (error: any) {
    console.error(error, 'errr');

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
    const data: { uuid: string } = await request.json();

    // Create API url
    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/category-document/delete/${data.uuid}`;

    // Make the API request
    const response = await axios.delete(api, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json',
      },
    });

    // Return sucess response
    return NextResponse.json(
      {
        success: true,
        message: "Document Category deleted successfully",
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
        error: error.response.data.message
      },
      {
        status: error.response.data.statusCode || 500,
      }
    );
  }
}

export async function PUT(request: Request) {
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
    const data: CategoryDocumentsType = await request.json();

    // create API Url
    const api = `${process.env.NEXT_PUBLIC_API_URL}admin/category-document/update/${data.uuid}`;

    // Make the API request
    const response = await axios.put(api, {name : data.name, prefix: data.prefix, role_has_rules: data.role_has_rules}, {
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json',
      },
    });

    // Return sucess response
    return NextResponse.json(
      {
        success: true,
        message: "Document Category updated successfully",
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
        error: error.response.data.message
      },
      {
        status: error.response.data.statusCode || 500,
      }
    );
  }
}
