"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getJwtToken } from "@/helpers/helper";
import { InternalDocumentTypeDatatable } from "@/types/apps/internalDocumentTypes";
import { Pagination } from "@/types/apps/paginationTypes";
import { Button, Typography } from "@mui/material";
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
import OptionMenu from "@/@core/components/option-menu";
import { GroupingType } from "@/types/apps/groupingTypes";
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

// Function to fetch document categories
async function fetchGroupings(page: number, perPage: number) {
    const token = getJwtToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };


    if (token) {
        headers.Authorization = token;
    }

    console.log('masuk fetchGroupings', {page, perPage});

    // const response = await fetch(`/api/master/grouping?page=${page}&per_page=${perPage}`, { 
    //     grouping: 'GET',
    //     headers 
    // });

    // if (!response.ok) {
    //     throw new Error("Failed to fetch matriks");
    // }

    // const responseData = await response.json();
    const responseData = {
        "success": true,
        "message": "Successfully get matriks",
        "data": {
            "data": {
                "data":[
                    {
                        "createdAt": "2022-12-29T13:54:14.000Z",
                        "updatedAt": "2022-12-29T13:54:14.000Z",
                        "createdBy": "Admin",
                        "updatedBy": null,
                        "id": 24,
                        "nama_grouping": "LB3",
                        "air": false,
                        "perencanaan_sampling": 3,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-06T06:27:47.000Z",
                        "updatedAt": "2022-09-06T06:27:47.000Z",
                        "createdBy": "Admin",
                        "updatedBy": null,
                        "id": 23,
                        "nama_grouping": "Tanah",
                        "air": false,
                        "perencanaan_sampling": 0,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-06T06:26:45.000Z",
                        "updatedAt": "2022-09-06T06:27:22.000Z",
                        "createdBy": "Admin",
                        "updatedBy": "Admin",
                        "id": 22,
                        "nama_grouping": "B3 dan Limbah Padat",
                        "air": false,
                        "perencanaan_sampling": 0,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-06T06:20:33.000Z",
                        "updatedAt": "2022-09-06T06:22:30.000Z",
                        "createdBy": "Admin",
                        "updatedBy": "Admin",
                        "id": 21,
                        "nama_grouping": "Udara Ambien dan Emisi",
                        "air": false,
                        "perencanaan_sampling": 2,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-06T06:11:47.000Z",
                        "updatedAt": "2022-09-06T06:11:48.000Z",
                        "createdBy": "Admin",
                        "updatedBy": null,
                        "id": 19,
                        "nama_grouping": "Udara Lingkungan Kerja",
                        "air": false,
                        "perencanaan_sampling": 2,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-06T06:07:41.000Z",
                        "updatedAt": "2022-09-06T06:07:42.000Z",
                        "createdBy": "Admin",
                        "updatedBy": null,
                        "id": 18,
                        "nama_grouping": "Air",
                        "air": false,
                        "perencanaan_sampling": null,
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


    const deleteGrouping = async (
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
        console.log(data, 'data of delete matriks');

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
            return { status: 200, message: 'Successfully deleted matriks' };
        } else {
            return { status: 500, message: 'Failed to delete matriks' };
        }
        } catch (error) {
        console.error('Error deleting matriks:', error);
        return { status: 500, message: 'An error occurred while deleting the matriks' };
        }
    };
  
    type GroupingTypesTypeWithAction = Partial<GroupingType> & {
        action?: string
     }

export default function MasterGroupingPage() {
    const [groupings, setGroupings] = useState<GroupingType[]>([]);
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
    
    const columnHelperGrouping = createColumnHelper<GroupingTypesTypeWithAction>()

    const dataColumns = useMemo<ColumnDef<GroupingTypesTypeWithAction, any>[]>(() => [
        columnHelperGrouping.accessor('nama_grouping', {
            header: 'Grouping',
            cell: ({ row }) => <Typography>{row.original.nama_grouping}</Typography>
        }),
        columnHelperGrouping.accessor('uuid', {
            header: 'Kategori',
            cell: ({ row }) =>  
                <Button variant="contained" className="bg-blue-500" startIcon={<RequestQuoteIcon />}>
            Jenis Pengukuran
          </Button>
        }),
        
        columnHelperGrouping.accessor('action', {
          header: 'Action',
          cell: ({ row }) => {
            return (
              <div className="flex items-center">
                <OptionMenu
                  iconButtonProps={{ size: 'medium' }}
                  iconClassName="text-textSecondary"
                  options={[
                    
                    // {
                    //     text: 'Detail',
                    //     icon: 'tabler-eye',
                    //     menuItemProps: {
                    //         className: 'flex items-center gap-2 text-textSecondary',
                    //         onClick: () => router.push(`/${locale}/admin/document/${row.original.uuid}`),
                    //     },
                    // },
                    {
                        text: 'Edit',
                        icon: 'tabler-edit',
                        menuItemProps: {
                            className: 'flex items-center gap-2 text-textSecondary',
                            onClick: () => router.push(`/${locale}/master/grouping/${row.original.uuid}`),
                        },
                    },
                    
                    {
                        text: 'Delete',
                        icon: 'tabler-trash',
                        menuItemProps: {
                        className: 'flex items-center gap-2 text-red-600',
                        // onClick: () => handleOpenModalDelete({ uuid: row.original.uuid, document_number: row.original.document_number }),
                        },
                    },
                         
                  ]}
                />
              </div>
            );
          },
          enableSorting: false,
        }),
      ], [groupings])

    const getMasterGroupings = async () => {
        try {
        setIsLoading(true);
        const response = await fetchGroupings(pagination.currentPage, pagination.perPage);
        
        const result = response.data.data;
    
        setPagination(prev => ({
            ...prev,
            perPage: result.per_page,
            totalPages: result.total_pages,
            totalRecords: result.total_records,
        }));

        if (result.data == null) {
            setGroupings([]);
        } else {
            // const transformedData = transformInternalDocuments(result.data);
            setGroupings(result.data);
        }
            
        } catch (error) {
        console.error("Error fetching internal documents:", error);
        } finally {
        setIsLoading(false);
        }
    };
    
    useEffect(() => {
            getMasterGroupings();
        }, [
            pagination.currentPage, 
            pagination.perPage,
        ]
    );

    // Check if StatusDocumentTable receives documentCategories as expected
    return (
        <Datatable
            dataColumns={dataColumns} 
            tableData={groupings} 
            isLoading={isLoading} 
            setPagination={setPagination} 
            pagination={pagination} 
            pageTitle="Matriks"
            urlAddPage={`/${locale}/admin/master/matriks/add`}
        />
    );
}
