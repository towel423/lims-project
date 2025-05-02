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
import { MethodType } from "@/types/apps/methodTypes";

// Function to fetch document categories
async function fetchMethods(page: number, perPage: number) {
    const token = getJwtToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };


    if (token) {
        headers.Authorization = token;
    }

    console.log('masuk fetchMethods', {page, perPage});

    // const response = await fetch(`/api/master/method?page=${page}&per_page=${perPage}`, { 
    //     method: 'GET',
    //     headers 
    // });

    // if (!response.ok) {
    //     throw new Error("Failed to fetch metode");
    // }

    // const responseData = await response.json();
    const responseData = {
        "success": true,
        "message": "Successfully get metode",
        "data": {
            "data": {
                "data":[
                    {
                        "createdAt": "2022-10-19T08:50:59.000Z",
                        "updatedAt": "2022-10-19T08:50:58.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 24,
                        "kode_sni": "SNI 6989.10-2011",
                        "judul": "Cara uji minyak nabati dan minyak mineral secara gravimetri",
                        "lampiran": "/upload/24-1666169458645-lampiran-sni-.pdf",
                        "kategori_kode": "",
                        "sorting": 11,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-09-06T06:37:10.000Z",
                            "updatedAt": "2022-09-24T09:52:29.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 552,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Air",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
                        }
                    },
                    {
                        "createdAt": "2022-10-19T08:49:01.000Z",
                        "updatedAt": "2022-10-19T08:49:00.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 23,
                        "kode_sni": "SNI 06-6989.30-2005",
                        "judul": "Cara uji kadar amonia dengan spektrofotometer secara fenat",
                        "lampiran": "/upload/23-1666169340536-lampiran-sni-.pdf",
                        "kategori_kode": "",
                        "sorting": 10,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-09-06T06:37:10.000Z",
                            "updatedAt": "2022-09-24T09:52:29.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 552,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Air",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
                        }
                    },
                    {
                        "createdAt": "2022-10-19T08:47:48.000Z",
                        "updatedAt": "2022-10-19T08:47:48.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 22,
                        "kode_sni": "SNI 6989.2:2019",
                        "judul": "Cara uji kebutuhan oksigen kimiawi (chemical oxygen demand/COD) dengan refluks tertutup secara spektrofotometri",
                        "lampiran": "/upload/22-1666169268475-lampiran-sni-.pdf",
                        "kategori_kode": "",
                        "sorting": 9,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-09-06T06:37:10.000Z",
                            "updatedAt": "2022-09-24T09:52:29.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 552,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Air",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
                        }
                    },
                    {
                        "createdAt": "2022-10-19T08:38:43.000Z",
                        "updatedAt": "2022-10-19T08:38:42.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 21,
                        "kode_sni": "SNI 6989.72:2009",
                        "judul": "Cara uji Kebutuhan Oksigen Biokimia  (Biochemical Oxygen Demand/BOD) ",
                        "lampiran": "/upload/21-1666168722563-lampiran-sni-.pdf",
                        "kategori_kode": "",
                        "sorting": 8,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-09-06T06:37:10.000Z",
                            "updatedAt": "2022-09-24T09:52:29.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 552,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Air",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
                        }
                    },
                    {
                        "createdAt": "2022-10-19T08:35:51.000Z",
                        "updatedAt": "2022-10-31T03:52:28.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 20,
                        "kode_sni": "SNI 6989.11:2019",
                        "judul": "Cara Uji Derajat Keasaman (pH) dengan menggunakan pH meter",
                        "lampiran": "/upload/20-1666168612501-lampiran-sni-.pdf",
                        "kategori_kode": "SNI_SAMPLING_030623",
                        "sorting": 7,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-09-06T06:37:10.000Z",
                            "updatedAt": "2022-09-24T09:52:29.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 552,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Air",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
                        }
                    },
                    {
                        "createdAt": "2022-09-08T02:54:17.000Z",
                        "updatedAt": "2022-10-19T08:36:29.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 13,
                        "kode_sni": "SNI 6989.3:2019",
                        "judul": "Cara Uji Padatan Tersuspensi Total (Total Suspended Solids / TSS Secara Gravimetri)",
                        "lampiran": "/upload/13-1664013297011-lampiran-sni-.pdf",
                        "kategori_kode": "SNI_SAMPLING_030623",
                        "sorting": 6,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-09-06T06:37:10.000Z",
                            "updatedAt": "2022-09-24T09:52:29.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 552,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Air",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
                        }
                    },
                    {
                        "createdAt": "2022-09-29T09:31:23.000Z",
                        "updatedAt": "2022-09-29T09:31:23.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 19,
                        "kode_sni": "IKM-UA-7.2.12-MI (Gas Chromatography)",
                        "judul": "Styrene (C6H5CHCH2)",
                        "lampiran": "/upload/19-1664443883119-lampiran-sni-.pdf",
                        "kategori_kode": "",
                        "sorting": 5,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-01-09T06:22:53.000Z",
                            "updatedAt": "2022-09-06T06:35:30.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 476,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Udara Ambien dan Emisi",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
                        }
                    },
                    {
                        "createdAt": "2022-09-29T09:25:27.000Z",
                        "updatedAt": "2022-09-29T09:25:27.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 18,
                        "kode_sni": "OSHA PV2210",
                        "judul": "Metyl Sulphide Air Sampling And Analysis",
                        "lampiran": "",
                        "kategori_kode": "",
                        "sorting": 4,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-01-09T06:22:53.000Z",
                            "updatedAt": "2022-09-06T06:35:30.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 476,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Udara Ambien dan Emisi",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
                        }
                    },
                    {
                        "createdAt": "2022-09-29T09:21:43.000Z",
                        "updatedAt": "2022-09-29T09:21:43.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 16,
                        "kode_sni": "NIOSH 2542",
                        "judul": "MERCAPTANS, METHYL-, ETHYL-, and n-BUTYL-",
                        "lampiran": "/upload/16-1664443303198-lampiran-sni-.pdf",
                        "kategori_kode": "",
                        "sorting": 2,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-01-09T06:22:53.000Z",
                            "updatedAt": "2022-09-06T06:35:30.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 476,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Udara Ambien dan Emisi",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
                        }
                    },
                    {
                        "createdAt": "2022-09-29T09:20:10.000Z",
                        "updatedAt": "2022-09-29T09:20:09.000Z",
                        "createdBy": null,
                        "updatedBy": null,
                        "id": 15,
                        "kode_sni": "SNI 19-7119.1-2005",
                        "judul": "Cara Uji Ammoniak (NH3) dengan Indophenol secara Spektrofotometri",
                        "lampiran": "/upload/15-1664443209513-lampiran-sni-.pdf",
                        "kategori_kode": "",
                        "sorting": 1,
                        "uuid" : "111",
                        "kategori_referensi_id": {
                            "createdAt": "2022-01-09T06:22:53.000Z",
                            "updatedAt": "2022-09-06T06:35:30.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Admin",
                            "id": 476,
                            "kode_kategori": "KATEGORI_SNI",
                            "kode": "SNI_SAMPLING",
                            "deskripsi1": "Udara Ambien dan Emisi",
                            "deskripsi2": null,
                            "grouping": null,
                            "uuid" : "111",
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


    const deleteMethod = async (
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
        console.log(data, 'data of delete metode');

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
            return { status: 200, message: 'Successfully deleted metode' };
        } else {
            return { status: 500, message: 'Failed to delete metode' };
        }
        } catch (error) {
        console.error('Error deleting metode:', error);
        return { status: 500, message: 'An error occurred while deleting the metode' };
        }
    };
  
    type MethodTypesTypeWithAction = Partial<MethodType> & {
        action?: string
     }

export default function MasterMethodPage() {
    const [methods, setMethods] = useState<MethodType[]>([]);
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
    
    const columnHelperMethod = createColumnHelper<MethodTypesTypeWithAction>()

    const dataColumns = useMemo<ColumnDef<MethodTypesTypeWithAction, any>[]>(() => [
        columnHelperMethod.accessor('kategori_referensi_id.deskripsi1', {
            header: 'Kategori',
            cell: ({ row }) =>  
              <Typography>
                  {typeof row.original.kategori_referensi_id === 'object'
                      ? row.original.kategori_referensi_id?.deskripsi1
                      : '-'}
              </Typography>
        }),
        columnHelperMethod.accessor('kode_sni', {
          header: 'Kode Metode',
          cell: ({ row }) => <Typography>{row.original.kode_sni}</Typography>
        }),
        columnHelperMethod.accessor('judul', {
          header: 'Judul',
          cell: ({ row }) => <Typography>{row.original.judul}</Typography>
        }),
        columnHelperMethod.accessor('lampiran', {
          header: 'Lampiran',
          cell: ({ row }) => 
            <Typography>
                {row.original.lampiran && typeof(row.original.lampiran) === 'string' ? (
                    <a href={row.original.lampiran} target="_blank" className="text-blue-600">
                    Lihat lampiran
                    </a>
                ) : (
                    '-'
                )}
            </Typography>
        }),
        columnHelperMethod.accessor('action', {
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
                            onClick: () => router.push(`/${locale}/master/method/${row.original.uuid}`),
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
      ], [methods])

    const getMasterMethods = async () => {
        try {
        setIsLoading(true);
        const response = await fetchMethods(pagination.currentPage, pagination.perPage);
        
        const result = response.data.data;
    
        setPagination(prev => ({
            ...prev,
            perPage: result.per_page,
            totalPages: result.total_pages,
            totalRecords: result.total_records,
        }));

        if (result.data == null) {
            setMethods([]);
        } else {
            // const transformedData = transformInternalDocuments(result.data);
            setMethods(result.data);
        }
            
        } catch (error) {
        console.error("Error fetching internal documents:", error);
        } finally {
        setIsLoading(false);
        }
    };
    
    useEffect(() => {
            getMasterMethods();
        }, [
            pagination.currentPage, 
            pagination.perPage,
        ]
    );

    // Check if StatusDocumentTable receives documentCategories as expected
    return (
        <Datatable
            dataColumns={dataColumns} 
            tableData={methods} 
            isLoading={isLoading} 
            setPagination={setPagination} 
            pagination={pagination} 
            pageTitle="Metode"
            urlAddPage={`/${locale}/admin/master/metode/add`}
        />
    );
}
