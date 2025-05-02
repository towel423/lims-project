"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getJwtToken } from "@/helpers/helper";
import { InternalDocumentTypeDatatable } from "@/types/apps/internalDocumentTypes";
import { Pagination } from "@/types/apps/paginationTypes";
import { ProvinceType } from "@/types/apps/provinceTypes";
import { Typography } from "@mui/material";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getPaginationRowModel,
    getSortedRowModel
  } from '@tanstack/react-table'
  import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import Datatable from "@/views/components/Datatable";
import { PaginationCustom } from "@/types/apps/paginationCustomTypes";
import { useParams, useRouter } from "next/navigation";

// Function to fetch document categories
async function fetchProvinces(page: number, perPage: number) {
    const token = getJwtToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };


    if (token) {
        headers.Authorization = token;
    }

    console.log('masuk fetchProvinces', {page, perPage});

    // const response = await fetch(`/api/master/province?page=${page}&per_page=${perPage}`, { 
    //     method: 'GET',
    //     headers 
    // });

    // if (!response.ok) {
    //     throw new Error("Failed to fetch province");
    // }

    // const responseData = await response.json();
    const responseData = {
        "success": true,
        "message": "Successfully get province",
        "data": {
            "data": {
                "data": [
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 93,
                        "nama_propinsi": "LAINNYA",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 92,
                        "nama_propinsi": "PAPUA BARAT",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 91,
                        "nama_propinsi": "PAPUA",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 82,
                        "nama_propinsi": "MALUKU UTARA",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 81,
                        "nama_propinsi": "MALUKU",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 76,
                        "nama_propinsi": "SULAWESI BARAT",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 75,
                        "nama_propinsi": "GORONTALO",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 74,
                        "nama_propinsi": "SULAWESI TENGGARA",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 73,
                        "nama_propinsi": "SULAWESI SELATAN",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2021-04-25T14:39:25.000Z",
                        "updatedAt": "2021-04-25T14:39:41.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 72,
                        "nama_propinsi": "SULAWESI TENGAH",
                        "uuid": "111"
                    }
                ],
                "current_page": 1,
                "per_page": 10,
                "total_pages": 2,
                "total_records": 15
            },
            "message": "Success",
            "statusCode": 200
        }
    };

    return responseData;
}


    const deleteProvice = async (
        data: string,
        refetch: () => void
    ): Promise<{ status: number; message: string }> => {
        const token = getJwtToken();
        const headers: HeadersInit = {
        'Content-Type': 'application/json',
        };
    
        if (token) {
            headers.Authorization = token;
        }
        console.log(data, 'data of delete province');

        // return;
    
        try {
        const response = await fetch(`/api/document`, {
            method: 'DELETE',
            headers: {
            ...headers,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uuid: data }),
        });
    
        if (response.ok) {
            refetch();
            return { status: 200, message: 'Successfully deleted province' };
        } else {
            return { status: 500, message: 'Failed to delete province' };
        }
        } catch (error) {
        console.error('Error deleting province:', error);
        return { status: 500, message: 'An error occurred while deleting the province' };
        }
    };
  
    type ProvinceTypesTypeWithAction = Partial<ProvinceType> & {
        action?: string
     }

export default function MasterProvincePage() {
    const [provinces, setProvinces] = useState<ProvinceType[]>([]);
    const [pagination, setPagination] = useState<PaginationCustom>({
        currentPage: 1,
        perPage: 10,
        totalPages: 1,
        totalRecords: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter()
    const params = useParams()
    const { lang: locale } = params
    
    const columnHelperProvince = createColumnHelper<ProvinceTypesTypeWithAction>()

    const dataColumns = useMemo<ColumnDef<ProvinceTypesTypeWithAction, any>[]>(() => [
        columnHelperProvince.accessor('nama_propinsi', {
          header: 'Provinsi',
          cell: ({ row }) => <Typography>{row.original.nama_propinsi}</Typography>
        }),
        columnHelperProvince.accessor('action', {
          header: 'Action',
          cell: ({ row }) => {
            // const isDraft = row.original.status_name.toLowerCase() === 'draft';
            return (
            //   <div className="flex items-center">
            //     <OptionMenu
            //       iconButtonProps={{ size: 'medium' }}
            //       iconClassName="text-textSecondary"
            //       options={[
            //         ...(can("document-control", "read") ? [
            //           {
            //             text: 'Detail',
            //             icon: 'tabler-eye',
            //             menuItemProps: {
            //               className: 'flex items-center gap-2 text-textSecondary',
            //               onClick: () => router.push(`/${locale}/admin/document/${row.original.uuid}`),
            //             },
            //           },
            //         ] : []),
            //         ...(can("document-control", "delete") ? [
            //           ...(isDraft
            //             ? [
            //                 {
            //                   text: 'Delete',
            //                   icon: 'tabler-trash',
            //                   menuItemProps: {
            //                     className: 'flex items-center gap-2 text-red-600',
            //                     onClick: () => handleOpenModalDelete({ uuid: row.original.uuid, document_number: row.original.document_number }),
            //                   },
            //                 },
            //               ]
            //             : []),
            //         ] : [])
            //       ]}
            //     />
            //   </div>
            <>-</>
            );
          },
          enableSorting: false,
        }),
      ], [provinces])

    const getMasterProvinces = async () => {
        try {
        setIsLoading(true);
        console.log('masuk getMasterProvinces')
        const response = await fetchProvinces(pagination.currentPage, pagination.perPage);
        
        const result = response.data.data;
    
        setPagination(prev => ({
            ...prev,
            perPage: result.per_page,
            totalPages: result.total_pages,
            totalRecords: result.total_records,
        }));

        if (result.data == null) {
            setProvinces([]);
        } else {
            // const transformedData = transformInternalDocuments(result.data);
            setProvinces(result.data);
        }
            
        } catch (error) {
        console.error("Error fetching internal documents:", error);
        } finally {
        setIsLoading(false);
        }
    };
    
    useEffect(() => {
            getMasterProvinces();
        }, [
            pagination.currentPage, 
            pagination.perPage,
        ]
    );

    // Check if StatusDocumentTable receives documentCategories as expected
    return (
        <Datatable
            dataColumns={dataColumns} 
            tableData={provinces} 
            isLoading={isLoading} 
            setPagination={setPagination} 
            pagination={pagination} 
            pageTitle="Provinsi"
            urlAddPage={`/${locale}/admin/master/provinsi/add`}
        />
    );
}
