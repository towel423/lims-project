
import axios from 'axios';
import { NextResponse } from 'next/server';
import { URL } from 'url';

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
      const data: {uuid: string, note: string, approvalType: string} = await request.json();
      const { uuid, note, approvalType } = data;

  
      // Create API url
      let api = `${process.env.NEXT_PUBLIC_API_URL}admin/document-control/approve/${uuid}`;
      let msg = "Document successfully approved"

      if (approvalType === 'reject') {
        api = `${process.env.NEXT_PUBLIC_API_URL}admin/document-control/reject/${uuid}`
        msg = 'Document successfully rejected'
      }

      console.log(api, { note }, 'POST IN APPROVAL');
  
      // Make the API request
      const response = await axios.post(api, { note }, {
        headers: {
          Authorization: bearerToken,
          'Content-Type': 'application/json',
        },
      });
  
      // Return sucess response
      return NextResponse.json(
        {
          success: true,
          message: msg,
          data: response.data
        },
        {
          status: response.status
        }
      );
  
    } catch (error: any) {
      console.log(error, 'error')
      console.log(error.response, 'error.response')
      console.log(error.response.data, 'error.response.data')
  
      return NextResponse.json(
        {
          error: error.response.data.message
        },
        {
          status: error.response.data.statusCode.code || 500,
        }
      );
    }
  }
  