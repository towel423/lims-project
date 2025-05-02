
import { InternalDocumentsType } from '@/types/apps/internalDocumentTypes';
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

    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-control/list/internal?perPage=${per_page}&page=${page}&sortBy=id&sortDesc=true&document_type_id=${document_type}&status_document_id=${document_status}`;

    console.log(api);
    // Make the API request
    const response = await axios.get<InternalDocumentsType[]>(api, {
      headers: {
        Authorization: bearerToken,
      },
    });


    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get document internal",
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


// export async function POST(request: Request) {

//   try {
//     // Check token
//     const token = request.headers.get('Authorization') ?? '';
//     if (!token) {
//       console.error("Authorization token is missing.");
//       return NextResponse.json(
//         { error: "Authorization token is missing" },
//         { status: 401 }
//       );
//     }

//     const bearerToken = `Bearer ${token}`;

//     // Get the request body (the data to be added)
//     const data: TypeDocumentsField = await request.json();

//     // Create API url
//     const api = `${process.env.NEXT_PUBLIC_API_URL}admin/document-type`;

//     // Make the API request
//     const response = await axios.post(api, data, {
//       headers: {
//         Authorization: bearerToken,
//         'Content-Type': 'application/json',
//       },
//     });

//     // Return sucess response
//     return NextResponse.json(
//       {
//         success: true,
//         message: "Document Type added successfully",
//         data: response.data
//       },
//       {
//         status: response.status
//       }
//     );

//   } catch (error: any) {
//     console.error(error, 'errr');

//     // Return response
//     return NextResponse.json(
//       {
//         error: error.response?.data?.message,
//       },
//       {
//         status: error.response?.status || 500
//       }
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   try {
//     // Check token
//     const token = request.headers.get('Authorization') ?? '';
//     if (!token) {
//       console.error("Authorization token is missing.");
//       return NextResponse.json(
//         { error: "Authorization token is missing" },
//         { status: 401 }
//       );
//     }

//     const bearerToken = `Bearer ${token}`;

//     // Get the request body (the data to be added)
//     const data: { uuid: string } = await request.json();

//     // Create API url
//     const api = `${process.env.NEXT_PUBLIC_API_URL}admin/document-type/delete/${data.uuid}`;

//     // Make the API request
//     const response = await axios.delete(api, {
//       headers: {
//         Authorization: bearerToken,
//         'Content-Type': 'application/json',
//       },
//     });

//     // Return sucess response
//     return NextResponse.json(
//       {
//         success: true,
//         message: "Document Type deleted successfully",
//         data: response.data
//       },
//       {
//         status: response.status
//       }
//     );

//   } catch (error: any) {
//     console.error(error.message);

//     // Return response
//     return NextResponse.json(
//       {
//         error: error.response?.data?.message,
//       },
//       {
//         status: error.response?.status || 500
//       }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     // Check token
//     const token = request.headers.get('Authorization') ?? '';
//     if (!token) {
//       console.error("Authorization token is missing.");
//       return NextResponse.json(
//         { error: "Authorization token is missing" },
//         { status: 401 }
//       );
//     }

//     const bearerToken = `Bearer ${token}`;

//     // Get the request body (the data to be added)
//     const data: TypeDocumentsType = await request.json();

//     // create API Url
//     const api = `${process.env.NEXT_PUBLIC_API_URL}admin/document-type/update/${data.uuid}`;

//     // Make the API request
//     const response = await axios.put(api, {name : data.name, prefix: data.prefix}, {
//       headers: {
//         Authorization: bearerToken,
//         'Content-Type': 'application/json',
//       },
//     });

//     // Return sucess response
//     return NextResponse.json(
//       {
//         success: true,
//         message: "Document Type updated successfully",
//         data: response.data
//       },
//       {
//         status: response.status
//       }
//     );

//   } catch (error: any) {
//     console.error(error.message);

//     // Return response
//     return NextResponse.json(
//       {
//         error: error.response?.data?.message,
//       },
//       {
//         status: error.response?.status || 500
//       }
//     );
//   }
// }
