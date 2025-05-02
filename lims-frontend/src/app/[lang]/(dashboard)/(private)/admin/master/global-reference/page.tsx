"use client";
import React, { useEffect, useMemo, useState } from "react";
import { getJwtToken } from "@/helpers/helper";
import { InternalDocumentTypeDatatable } from "@/types/apps/internalDocumentTypes";
import { Pagination } from "@/types/apps/paginationTypes";
import { GlobalReferenceType } from "@/types/apps/globalReferenceTypes";
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

// Function to fetch document categories
async function fetchGlobalReferences(page: number, perPage: number) {
    const token = getJwtToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };


    if (token) {
        headers.Authorization = token;
    }

    console.log('masuk fetchGlobalReferences', {page, perPage});

    // const response = await fetch(`/api/master/global-reference?page=${page}&per_page=${perPage}`, { 
    //     method: 'GET',
    //     headers 
    // });

    // if (!response.ok) {
    //     throw new Error("Failed to fetch global reference");
    // }

    // const responseData = await response.json();
    const responseData = {
        "success": true,
        "message": "Successfully get global reference",
        "data": {
            "data": {
                "data":[
                    {
                        "createdAt": "2024-03-05T03:43:45.000Z",
                        "updatedAt": "2024-03-05T03:44:14.000Z",
                        "createdBy": "Dian Komalasari",
                        "updatedBy": "Dian Komalasari",
                        "id": 872,
                        "kode_kategori": "SATUAN_METODA",
                        "kode": "Satuan parameter Legionella",
                        "deskripsi1": "/1000 mL ",
                        "deskripsi2": null,
                        "grouping": 25,
                        "kode_kategori_display": "Satuan Metoda",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-12-18T04:30:18.000Z",
                        "updatedAt": "2023-12-18T04:31:43.000Z",
                        "createdBy": "Admin",
                        "updatedBy": "Admin",
                        "id": 871,
                        "kode_kategori": "APP_CONFIG",
                        "kode": "Kode Dokumen LHP",
                        "deskripsi1": "MI-FR-LAB-8.6-01.03; Rev.01; 10 Agustus 2023",
                        "deskripsi2": null,
                        "grouping": null,
                        "kode_kategori_display": "App Config",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-08-21T04:32:44.000Z",
                        "updatedAt": "2023-12-11T09:28:19.000Z",
                        "createdBy": "Admin",
                        "updatedBy": "Admin",
                        "id": 870,
                        "kode_kategori": "APP_CONFIG",
                        "kode": "POSISI PADA INVOICE",
                        "deskripsi1": "Finance & Acc. Manager",
                        "deskripsi2": null,
                        "grouping": null,
                        "kode_kategori_display": "App Config",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-08-21T04:32:44.000Z",
                        "updatedAt": "2023-12-11T09:27:57.000Z",
                        "createdBy": "Admin",
                        "updatedBy": "Admin",
                        "id": 869,
                        "kode_kategori": "APP_CONFIG",
                        "kode": "NAMA PADA INVOICE",
                        "deskripsi1": "Sunaryo",
                        "deskripsi2": null,
                        "grouping": null,
                        "kode_kategori_display": "App Config",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-08-21T04:32:44.000Z",
                        "updatedAt": "2023-12-11T09:31:25.000Z",
                        "createdBy": "Admin",
                        "updatedBy": "Admin",
                        "id": 868,
                        "kode_kategori": "APP_CONFIG",
                        "kode": "POSISI TTD LHP",
                        "deskripsi1": "Manajer Teknis",
                        "deskripsi2": null,
                        "grouping": null,
                        "kode_kategori_display": "App Config",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-08-21T04:32:44.000Z",
                        "updatedAt": "2024-02-22T02:29:10.000Z",
                        "createdBy": "Admin",
                        "updatedBy": "Admin",
                        "id": 867,
                        "kode_kategori": "APP_CONFIG",
                        "kode": "NAMA TTD LHP",
                        "deskripsi1": "Nadya Ulfani Sara, S.T.",
                        "deskripsi2": null,
                        "grouping": null,
                        "kode_kategori_display": "App Config",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-09-08T07:25:01.000Z",
                        "updatedAt": "2023-09-08T07:25:01.000Z",
                        "createdBy": "Aulia Rahim Nugraha",
                        "updatedBy": null,
                        "id": 866,
                        "kode_kategori": "JENIS_KLIEN",
                        "kode": null,
                        "deskripsi1": "Pengolahan Logam",
                        "deskripsi2": null,
                        "grouping": null,
                        "kode_kategori_display": "Jenis Pelanggan",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-06-14T14:51:23.000Z",
                        "updatedAt": "2023-06-14T14:51:23.000Z",
                        "createdBy": "Admin",
                        "updatedBy": null,
                        "id": 865,
                        "kode_kategori": "JENIS_PEMBAYARAN",
                        "kode": null,
                        "deskripsi1": "TEMP",
                        "deskripsi2": null,
                        "grouping": null,
                        "kode_kategori_display": "Jenis Pembayaran",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-05-31T11:52:37.000Z",
                        "updatedAt": "2023-05-31T11:52:37.000Z",
                        "createdBy": "Admin",
                        "updatedBy": null,
                        "id": 864,
                        "kode_kategori": "LARUTAN_PENJERAP",
                        "kode": null,
                        "deskripsi1": "-",
                        "deskripsi2": null,
                        "grouping": null,
                        "kode_kategori_display": "Larutan Penjerap untuk sampling udara",
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-05-17T10:56:44.000Z",
                        "updatedAt": "2023-10-18T02:22:28.000Z",
                        "createdBy": "Admin",
                        "updatedBy": "Idzny Qurany",
                        "id": 863,
                        "kode_kategori": "APP_CONFIG",
                        "kode": "CHUNK",
                        "deskripsi1": "13",
                        "deskripsi2": null,
                        "grouping": null,
                        "kode_kategori_display": "App Config",
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


    const deleteGlobalReference = async (
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
        console.log(data, 'data of delete global reference');

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
            return { status: 200, message: 'Successfully deleted global reference' };
        } else {
            return { status: 500, message: 'Failed to delete global reference' };
        }
        } catch (error) {
        console.error('Error deleting global reference:', error);
        return { status: 500, message: 'An error occurred while deleting the global reference' };
        }
    };
  
    type GlobalReferenceTypesTypeWithAction = Partial<GlobalReferenceType> & {
        action?: string
     }

export default function MasterGlobalReferencePage() {
    const [globalReferences, setGlobalReferences] = useState<GlobalReferenceType[]>([]);
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
    
    const columnHelperGlobalReference = createColumnHelper<GlobalReferenceTypesTypeWithAction>()

    const dataColumns = useMemo<ColumnDef<GlobalReferenceTypesTypeWithAction, any>[]>(() => [
        columnHelperGlobalReference.accessor('kode_kategori_display', {
          header: 'Kategori',
          cell: ({ row }) => <Typography>{row.original.kode_kategori_display}</Typography>
        }),
        columnHelperGlobalReference.accessor('kode', {
          header: 'Kode',
          cell: ({ row }) => <Typography>{row.original.kode}</Typography>
        }),
        columnHelperGlobalReference.accessor('grouping', {
          header: 'Grouping',
          cell: ({ row }) => <Typography>{row.original.grouping}</Typography>
        }),
        columnHelperGlobalReference.accessor('deskripsi1', {
          header: 'Deskripsi 1',
          cell: ({ row }) => <Typography>{row.original.deskripsi1}</Typography>
        }),
        columnHelperGlobalReference.accessor('deskripsi2', {
          header: 'Deskripsi 2',
          cell: ({ row }) => <Typography>{row.original.deskripsi2}</Typography>
        }),
        columnHelperGlobalReference.accessor('action', {
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
                            onClick: () => router.push(`/${locale}/master/data-reference/${row.original.uuid}`),
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
      ], [globalReferences])

    const getMasterGlobalReferences = async () => {
        try {
        setIsLoading(true);
        const response = await fetchGlobalReferences(pagination.currentPage, pagination.perPage);
        
        const result = response.data.data;
    
        setPagination(prev => ({
            ...prev,
            perPage: result.per_page,
            totalPages: result.total_pages,
            totalRecords: result.total_records,
        }));

        if (result.data == null) {
            setGlobalReferences([]);
        } else {
            // const transformedData = transformInternalDocuments(result.data);
            setGlobalReferences(result.data);
        }
            
        } catch (error) {
        console.error("Error fetching internal documents:", error);
        } finally {
        setIsLoading(false);
        }
    };
    
    useEffect(() => {
            getMasterGlobalReferences();
        }, [
            pagination.currentPage, 
            pagination.perPage,
        ]
    );

    // Check if StatusDocumentTable receives documentCategories as expected
    return (
        <Datatable
            dataColumns={dataColumns} 
            tableData={globalReferences} 
            isLoading={isLoading} 
            setPagination={setPagination} 
            pagination={pagination} 
            pageTitle="Referensi Global"
            urlAddPage={`/${locale}/admin/master/global-reference/add`}
        />
    );
}
