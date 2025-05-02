"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getJwtToken } from "@/helpers/helper";
import { InternalDocumentTypeDatatable } from "@/types/apps/internalDocumentTypes";
import { Pagination } from "@/types/apps/paginationTypes";
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
import { CityType } from "@/types/apps/cityTypes";

// Function to fetch document categories
async function fetchCities(page: number, perPage: number) {
    const token = getJwtToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };


    if (token) {
        headers.Authorization = token;
    }

    console.log('masuk fetchCities', {page, perPage});

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
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9272,
                        "nama_kota": "LAINNYA",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 93,
                            "nama_propinsi": "LAINNYA",
                            "uuid": '111'
                        }
                    },
                    {
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9271,
                        "nama_kota": "KOTA SORONG",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 92,
                            "nama_propinsi": "PAPUA BARAT",
                            "uuid": '111'
                        }
                    },
                    {
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9212,
                        "nama_kota": "KAB. PEGUNUNGAN ARFAK",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 92,
                            "nama_propinsi": "PAPUA BARAT",
                            "uuid": '111'
                        }
                    },
                    {
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9211,
                        "nama_kota": "KAB. MANOKWARI SELATAN",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 92,
                            "nama_propinsi": "PAPUA BARAT",
                            "uuid": '111'
                        }
                    },
                    {
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9210,
                        "nama_kota": "KAB. MAYBRAT",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 92,
                            "nama_propinsi": "PAPUA BARAT",
                            "uuid": '111'
                        }
                    },
                    {
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9209,
                        "nama_kota": "KAB. TAMBRAUW",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 92,
                            "nama_propinsi": "PAPUA BARAT",
                            "uuid": '111'
                        }
                    },
                    {
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9208,
                        "nama_kota": "KAB. KAIMANA",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 92,
                            "nama_propinsi": "PAPUA BARAT",
                            "uuid": '111'
                        }
                    },
                    {
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9207,
                        "nama_kota": "KAB. TELUK WONDAMA",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 92,
                            "nama_propinsi": "PAPUA BARAT",
                            "uuid": '111'
                        }
                    },
                    {
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9206,
                        "nama_kota": "KAB. TELUK BINTUNI",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 92,
                            "nama_propinsi": "PAPUA BARAT",
                            "uuid": '111'
                        }
                    },
                    {
                        "createdAt": "2021-04-27T11:07:05.000Z",
                        "updatedAt": "2021-04-27T11:07:21.000Z",
                        "createdBy": 1,
                        "updatedBy": 1,
                        "id": 9205,
                        "nama_kota": "KAB. RAJA AMPAT",
                        "uuid": '111',
                        "kode_propinsi": {
                            "createdAt": "2021-04-25T14:39:25.000Z",
                            "updatedAt": "2021-04-25T14:39:41.000Z",
                            "createdBy": 1,
                            "updatedBy": 1,
                            "id": 92,
                            "nama_propinsi": "PAPUA BARAT",
                            "uuid": '111'
                        }
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


    const deleteCity = async (
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
        console.log(data, 'data of delete city');

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
            return { status: 200, message: 'Successfully deleted city' };
        } else {
            return { status: 500, message: 'Failed to delete city' };
        }
        } catch (error) {
        console.error('Error deleting city:', error);
        return { status: 500, message: 'An error occurred while deleting the city' };
        }
    };
  
    type CityTypesTypeWithAction = Partial<CityType> & {
        action?: string
     }

export default function MasterCityPage() {
    const [city, setCities] = useState<CityType[]>([]);
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
    
    const columnHelperCity = createColumnHelper<CityTypesTypeWithAction>()

    const dataColumns = useMemo<ColumnDef<CityTypesTypeWithAction, any>[]>(() => [
        columnHelperCity.accessor('nama_kota', {
          header: 'Kota',
          cell: ({ row }) => <Typography>{row.original.nama_kota}</Typography>
        }),
        columnHelperCity.accessor('kode_propinsi.nama_propinsi', {
          header: 'Propinsi',
          cell: ({ row }) => <Typography>{row.original.kode_propinsi?.nama_propinsi}</Typography>
        }),
        columnHelperCity.accessor('action', {
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
      ], [city])

    const getMasterCities = async () => {
        try {
        setIsLoading(true);
        console.log('masuk getMasterCities')
        const response = await fetchCities(pagination.currentPage, pagination.perPage);
        
        const result = response.data.data;
    
        setPagination(prev => ({
            ...prev,
            perPage: result.per_page,
            totalPages: result.total_pages,
            totalRecords: result.total_records,
        }));

        if (result.data == null) {
            setCities([]);
        } else {
            // const transformedData = transformInternalDocuments(result.data);
            setCities(result.data);
        }
            
        } catch (error) {
        console.error("Error fetching internal documents:", error);
        } finally {
        setIsLoading(false);
        }
    };
    
    useEffect(() => {
            getMasterCities();
        }, [
            pagination.currentPage, 
            pagination.perPage,
        ]
    );

    // Check if StatusDocumentTable receives documentCategories as expected
    return (
        <Datatable
            dataColumns={dataColumns} 
            tableData={city} 
            isLoading={isLoading} 
            setPagination={setPagination} 
            pagination={pagination} 
            pageTitle="Kota"
            // urlAddPage={`/${locale}/admin/master/kota/add`}
        />
    );
}
