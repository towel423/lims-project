
import { RelatedFileType } from '@/types/apps/relatedFileTypes';
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

    // Parse the UUID from the URL
    const url = new URL(request.url);
    const uuid = url.pathname.split('/').pop();

    // const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-revision/published?perPage=10&page=1&sortBy=id&sortDesc=true&showAll=true&document_control_uuid=491d831b-8983-4370-9c5d-ab319c8c2b14`;
    const api = `${process.env.NEXT_PUBLIC_API_URL}user/document-control/logs/${uuid}`;

    // Make the API request
    const response = await axios.get<RelatedFileType[]>(api, {
      headers: {
        Authorization: bearerToken,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Successfully get document log",
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
//     const data: CategoryDocumentsField = await request.json();

//     // Create API url
//     const api = `${process.env.NEXT_PUBLIC_API_URL}admin/category-document`;

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
//         message: "Document Category added successfully",
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
//     const api = `${process.env.NEXT_PUBLIC_API_URL}admin/category-document/delete/${data.uuid}`;

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
//         message: "Document Category deleted successfully",
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
//     const data: RelatedFileType = await request.json();

//     // create API Url
//     const api = `${process.env.NEXT_PUBLIC_API_URL}admin/category-document/update/${data.uuid}`;

//     // Make the API request
//     const response = await axios.put(api, {name : data.name, prefix: data.prefix, role_has_rules: data.role_has_rules}, {
//       headers: {
//         Authorization: bearerToken,
//         'Content-Type': 'application/json',
//       },
//     });

//     // Return sucess response
//     return NextResponse.json(
//       {
//         success: true,
//         message: "Document Category updated successfully",
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
