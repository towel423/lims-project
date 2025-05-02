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
import OptionMenu from "@/@core/components/option-menu";
import { ReagenType } from "@/types/apps/reagenTypes";

// Function to fetch document categories
async function fetchReagens(page: number, perPage: number) {
    const token = getJwtToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };


    if (token) {
        headers.Authorization = token;
    }

    console.log('masuk fetchReagens', {page, perPage});

    // const response = await fetch(`/api/master/reagen?page=${page}&per_page=${perPage}`, { 
    //     method: 'GET',
    //     headers 
    // });

    // if (!response.ok) {
    //     throw new Error("Failed to fetch reagen");
    // }

    // const responseData = await response.json();
    const responseData = {
        "success": true,
        "message": "Successfully get reagen",
        "data": {
            "data": {
                "data":[
                    {
                        "createdAt": "2022-09-07T08:34:36.000Z",
                        "updatedAt": "2023-03-21T04:16:40.000Z",
                        "createdBy": "Jesica Astriani",
                        "updatedBy": "Dian Komalasari",
                        "id": 8,
                        "no_cas": "7757-82-6",
                        "reagen": "Sodium Sulfate",
                        "stock": 2000,
                        "min_stock": 500,
                        "keterangan": null,
                        "form_referensi_id": null,
                        "satuan_referensi_id": null,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-07T08:31:50.000Z",
                        "updatedAt": "2022-09-07T08:31:50.000Z",
                        "createdBy": "Jesica Astriani",
                        "updatedBy": null,
                        "id": 7,
                        "no_cas": "67-64-1",
                        "reagen": "Acetone",
                        "stock": 20000,
                        "min_stock": 8000,
                        "keterangan": null,
                        "form_referensi_id": null,
                        "satuan_referensi_id": null,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-07T08:31:04.000Z",
                        "updatedAt": "2022-09-07T08:31:04.000Z",
                        "createdBy": "Jesica Astriani",
                        "updatedBy": null,
                        "id": 6,
                        "no_cas": "110-54-3",
                        "reagen": "N-Hexane",
                        "stock": 8000,
                        "min_stock": 1,
                        "keterangan": null,
                        "form_referensi_id": null,
                        "satuan_referensi_id": null,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-07T08:25:31.000Z",
                        "updatedAt": "2022-09-07T08:30:19.000Z",
                        "createdBy": "Jesica Astriani",
                        "updatedBy": "Jesica Astriani",
                        "id": 5,
                        "no_cas": "108-95-2",
                        "reagen": "Phenol",
                        "stock": 0,
                        "min_stock": 1000,
                        "keterangan": null,
                        "form_referensi_id": null,
                        "satuan_referensi_id": null,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-07T08:23:01.000Z",
                        "updatedAt": "2022-09-07T08:23:01.000Z",
                        "createdBy": "Jesica Astriani",
                        "updatedBy": null,
                        "id": 4,
                        "no_cas": "7697-37-2",
                        "reagen": "Nitric Acid",
                        "stock": 15000,
                        "min_stock": 7500,
                        "keterangan": null,
                        "form_referensi_id": null,
                        "satuan_referensi_id": null,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-07T08:22:32.000Z",
                        "updatedAt": "2022-09-07T08:22:32.000Z",
                        "createdBy": "Jesica Astriani",
                        "updatedBy": null,
                        "id": 3,
                        "no_cas": "7664-93-9",
                        "reagen": "Sulfuric Acid",
                        "stock": 15000,
                        "min_stock": 7500,
                        "keterangan": null,
                        "form_referensi_id": null,
                        "satuan_referensi_id": null,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-07T08:21:39.000Z",
                        "updatedAt": "2022-09-07T08:21:39.000Z",
                        "createdBy": "Jesica Astriani",
                        "updatedBy": null,
                        "id": 2,
                        "no_cas": "7647-01-0",
                        "reagen": "Hydrochloric Acid",
                        "stock": 12000,
                        "min_stock": 5000,
                        "keterangan": null,
                        "form_referensi_id": null,
                        "satuan_referensi_id": null,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2022-09-07T08:19:25.000Z",
                        "updatedAt": "2022-09-07T08:23:27.000Z",
                        "createdBy": "Jesica Astriani",
                        "updatedBy": "Jesica Astriani",
                        "id": 1,
                        "no_cas": "67-66-3",
                        "reagen": "Chloroform",
                        "stock": 2500,
                        "min_stock": 5000,
                        "keterangan": null,
                        "form_referensi_id": null,
                        "satuan_referensi_id": null,
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


    const deleteReagen = async (
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
        console.log(data, 'data of delete reagen');

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
            return { status: 200, message: 'Successfully deleted reagen' };
        } else {
            return { status: 500, message: 'Failed to delete reagen' };
        }
        } catch (error) {
        console.error('Error deleting reagen:', error);
        return { status: 500, message: 'An error occurred while deleting the reagen' };
        }
    };
  
    type ReagenTypesTypeWithAction = Partial<ReagenType> & {
        action?: string
     }

export default function MasterReagenPage() {
    const [reagens, setReagens] = useState<ReagenType[]>([]);
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
    
    const columnHelperReagen = createColumnHelper<ReagenTypesTypeWithAction>()

    const dataColumns = useMemo<ColumnDef<ReagenTypesTypeWithAction, any>[]>(() => [
        columnHelperReagen.accessor('no_cas', {
          header: 'No Cas',
          cell: ({ row }) => <Typography>{row.original.no_cas}</Typography>
        }),
        columnHelperReagen.accessor('reagen', {
          header: 'Reagen',
          cell: ({ row }) => <Typography>{row.original.reagen}</Typography>
        }),
        columnHelperReagen.accessor('form_referensi_id', {
          header: 'Form',
          cell: ({ row }) => <Typography>{row.original.form_referensi_id}</Typography>
        }),
        columnHelperReagen.accessor('satuan_referensi_id', {
          header: 'Satuan',
          cell: ({ row }) => <Typography>{row.original.satuan_referensi_id}</Typography>
        }),
        columnHelperReagen.accessor('stock', {
          header: 'Stock',
          cell: ({ row }) => <Typography>{row.original.stock}</Typography>
        }),
        columnHelperReagen.accessor('min_stock', {
          header: 'Min Stock',
          cell: ({ row }) => <Typography>{row.original.min_stock}</Typography>
        }),
        columnHelperReagen.accessor('min_stock', {
          header: 'Status',
          cell: ({ row }) => <Typography>-</Typography>
        }),
        columnHelperReagen.accessor('keterangan', {
            header: 'Keterangan',
            cell: ({ row }) => <Typography>{row.original.keterangan}</Typography>
        }),
        // columnHelperReagen.accessor('jenis_pelanggan_referensi_id.deskripsi1', {
        //   header: 'Jenis Pelanggan',
        //   cell: ({ row }) =>  
        //     <Typography>
        //         {typeof row.original.jenis_pelanggan_referensi_id === 'object'
        //             ? row.original.jenis_pelanggan_referensi_id?.deskripsi1
        //             : '-'}
        //     </Typography>
        // }),
        columnHelperReagen.accessor('action', {
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
                            onClick: () => router.push(`/${locale}/master/reagen/${row.original.uuid}`),
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
      ], [reagens])

    const getMasterReagens = async () => {
        try {
        setIsLoading(true);
        const response = await fetchReagens(pagination.currentPage, pagination.perPage);
        
        const result = response.data.data;
    
        setPagination(prev => ({
            ...prev,
            perPage: result.per_page,
            totalPages: result.total_pages,
            totalRecords: result.total_records,
        }));

        if (result.data == null) {
            setReagens([]);
        } else {
            // const transformedData = transformInternalDocuments(result.data);
            setReagens(result.data);
        }
            
        } catch (error) {
        console.error("Error fetching internal documents:", error);
        } finally {
        setIsLoading(false);
        }
    };
    
    useEffect(() => {
            getMasterReagens();
        }, [
            pagination.currentPage, 
            pagination.perPage,
        ]
    );

    // Check if StatusDocumentTable receives documentCategories as expected
    return (
        <Datatable
            dataColumns={dataColumns} 
            tableData={reagens} 
            isLoading={isLoading} 
            setPagination={setPagination} 
            pagination={pagination} 
            pageTitle="Reagen"
            urlAddPage={`/${locale}/admin/master/reagen/add`}
        />
    );
}
