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
import { CustomerType } from "@/types/apps/customerTypes";

// Function to fetch document categories
async function fetchCustomers(page: number, perPage: number) {
    const token = getJwtToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };


    if (token) {
        headers.Authorization = token;
    }

    console.log('masuk fetchCustomers', {page, perPage});

    // const response = await fetch(`/api/master/customer?page=${page}&per_page=${perPage}`, { 
    //     method: 'GET',
    //     headers 
    // });

    // if (!response.ok) {
    //     throw new Error("Failed to fetch pelanggan");
    // }

    // const responseData = await response.json();
    const responseData = {
        "success": true,
        "message": "Successfully get pelanggan",
        "data": {
            "data": {
                "data":[
                    {
                        "createdAt": "2023-08-18T01:36:17.000Z",
                        "updatedAt": "2024-05-24T01:39:24.000Z",
                        "createdBy": "Shinta Kumalasari",
                        "updatedBy": "Nurul Hidayanti",
                        "id": 1181,
                        "id_pelanggan": "-",
                        "nama": "CV KONOA JAYA LAUNDRY",
                        "telp": "-",
                        "alamat": "Kp. Cikupa RT.07/02 gg Asem Desa Wanaherang Kec. Gunung Putri, Bogor",
                        "kode_pos": "16965",
                        "npwp": "-",
                        "fax": "",
                        "nama_cp": "Ahmad ; Asmawi",
                        "jabatan": "",
                        "email": "firdausrizki204@gmail.com",
                        "telp_cp": "082213135166",
                        "discount": null,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-08T03:28:08.000Z",
                            "updatedAt": "2022-09-08T03:28:09.000Z",
                            "createdBy": "Dian Komalasari",
                            "updatedBy": null,
                            "id": 567,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Industri Tekstil dan Garment",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 75,
                        "tipe_pelanggan_referensi_id": 579,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3271,
                            "nama_kota": "KOTA BOGOR",
                            "kode_propinsi": 32
                        },
                        "kode_propinsi_id": 32,
                        "status_referensi_id": 7,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2024-05-02T07:59:19.000Z",
                        "updatedAt": "2024-05-02T07:59:31.000Z",
                        "createdBy": "Shinta Kumalasari",
                        "updatedBy": "Shinta Kumalasari",
                        "id": 1268,
                        "id_pelanggan": "-",
                        "nama": "PT TENMA INDONESIA",
                        "telp": "-",
                        "alamat": "Jl. Surya Kencana Kav. I No.18 D1, Kutamekar, Ciampel, Karawang, Jawa Barat 41363",
                        "kode_pos": "41363",
                        "npwp": "-",
                        "fax": "",
                        "nama_cp": "Bapak Feri Purba",
                        "jabatan": "",
                        "email": "ga_tmis@tenmagroup.jp",
                        "telp_cp": "081290252747",
                        "discount": null,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-29T09:45:25.000Z",
                            "updatedAt": "2022-09-29T09:45:25.000Z",
                            "createdBy": "Aulia Rahim Nugraha",
                            "updatedBy": null,
                            "id": 589,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Manufacturing/Production",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 21,
                        "tipe_pelanggan_referensi_id": 579,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3215,
                            "nama_kota": "KAB. KARAWANG",
                            "kode_propinsi": 32
                        },
                        "kode_propinsi_id": 32,
                        "status_referensi_id": 7,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2024-05-02T02:15:21.000Z",
                        "updatedAt": "2024-05-02T02:15:21.000Z",
                        "createdBy": "Shinta Kumalasari",
                        "updatedBy": null,
                        "id": 1267,
                        "id_pelanggan": "-",
                        "nama": "PT SINAR TEXINDO UTAMA",
                        "telp": "-",
                        "alamat": "Jl. Raya Cikande Rangkasbitung No.17, Kareo,  Kec. Jawilan, Kabupaten Serang, Banten 42177",
                        "kode_pos": "42177",
                        "npwp": "-",
                        "fax": "",
                        "nama_cp": "Bapak Roziqin",
                        "jabatan": "",
                        "email": "stucikande@gmail.com",
                        "telp_cp": "+62 821-4290-2121",
                        "discount": null,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-08T03:28:08.000Z",
                            "updatedAt": "2022-09-08T03:28:09.000Z",
                            "createdBy": "Dian Komalasari",
                            "updatedBy": null,
                            "id": 567,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Industri Tekstil dan Garment",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 21,
                        "tipe_pelanggan_referensi_id": 579,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3604,
                            "nama_kota": "KAB. SERANG",
                            "kode_propinsi": 36
                        },
                        "kode_propinsi_id": 36,
                        "status_referensi_id": 7,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2024-04-26T06:42:41.000Z",
                        "updatedAt": "2024-04-26T06:57:25.000Z",
                        "createdBy": "Shinta Kumalasari",
                        "updatedBy": "Shinta Kumalasari",
                        "id": 1266,
                        "id_pelanggan": "-",
                        "nama": "PT CHAROEN POKPHAND INDONESIA",
                        "telp": "(0254) 7734968",
                        "alamat": "Jl. Raya Modern Industri II, Nambo Ilir, Kec. Kibin, Kabupaten Serang, Banten 42185",
                        "kode_pos": "42185",
                        "npwp": "-",
                        "fax": "",
                        "nama_cp": "Erlinda",
                        "jabatan": "",
                        "email": "marketing@labindo.co.id; admin@labindo.co.id",
                        "telp_cp": "082220396904",
                        "discount": null,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-08T03:27:50.000Z",
                            "updatedAt": "2022-09-08T03:32:25.000Z",
                            "createdBy": "Dian Komalasari",
                            "updatedBy": "Dian Komalasari",
                            "id": 566,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Industri Kimia Dasar",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 21,
                        "tipe_pelanggan_referensi_id": 580,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3604,
                            "nama_kota": "KAB. SERANG",
                            "kode_propinsi": 36
                        },
                        "kode_propinsi_id": 36,
                        "status_referensi_id": 7,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2024-03-14T05:50:15.000Z",
                        "updatedAt": "2024-04-24T03:17:19.000Z",
                        "createdBy": "Shinta Kumalasari",
                        "updatedBy": "Nurul Hidayanti",
                        "id": 1254,
                        "id_pelanggan": "-",
                        "nama": "PT BAYU SURYA BAKTI KONSTRUKSI",
                        "telp": "-",
                        "alamat": "Ruko Limus Pratama Regency Blok F12 Cileungsi, Bogor 16820",
                        "kode_pos": "16820",
                        "npwp": "-",
                        "fax": "",
                        "nama_cp": "Tedi Surono (Mr)",
                        "jabatan": "",
                        "email": "tedisurono98@gmail.com",
                        "telp_cp": "087745515599",
                        "discount": null,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-29T09:45:34.000Z",
                            "updatedAt": "2022-09-29T09:45:35.000Z",
                            "createdBy": "Aulia Rahim Nugraha",
                            "updatedBy": null,
                            "id": 590,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Lain-Lain",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 21,
                        "tipe_pelanggan_referensi_id": 579,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3201,
                            "nama_kota": "KAB. BOGOR",
                            "kode_propinsi": 32
                        },
                        "kode_propinsi_id": 32,
                        "status_referensi_id": 7,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2024-03-01T04:16:13.000Z",
                        "updatedAt": "2024-04-18T09:02:48.000Z",
                        "createdBy": "Shinta Kumalasari",
                        "updatedBy": "Shinta Kumalasari",
                        "id": 1252,
                        "id_pelanggan": "-",
                        "nama": "PT YUTAKA MANUFACTURING INDONESIA",
                        "telp": "-",
                        "alamat": "Kompleks Industri MM2100, Jalan Sulawesi I Blok H - 4, Gandamekar Cikarang Bar, Bekasi - Jawa Barat 17530",
                        "kode_pos": "17530",
                        "npwp": "-",
                        "fax": "",
                        "nama_cp": "YUNI HANDAYANI ",
                        "jabatan": "",
                        "email": "yuni.handayani@yutaka.co.id",
                        "telp_cp": "085720390900",
                        "discount": null,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-06T04:50:11.000Z",
                            "updatedAt": "2022-09-08T03:26:48.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Dian Komalasari",
                            "id": 550,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Industri Otomotif",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 21,
                        "tipe_pelanggan_referensi_id": 579,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3216,
                            "nama_kota": "KAB. BEKASI",
                            "kode_propinsi": 32
                        },
                        "kode_propinsi_id": 32,
                        "status_referensi_id": 7,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-01-12T07:15:00.000Z",
                        "updatedAt": "2024-04-18T09:02:42.000Z",
                        "createdBy": "Wita Wulandari",
                        "updatedBy": "Shinta Kumalasari",
                        "id": 1108,
                        "id_pelanggan": "0",
                        "nama": "PT YUTAKA MANUFACTURING INDONESIA PLANT 1",
                        "telp": "0",
                        "alamat": "Kompleks Industri MM2100, Jalan Sulawesi I Blok H - 4, Gandamekar Cikarang Bar, Bekasi - Jawa Barat 17530",
                        "kode_pos": "17530",
                        "npwp": "0",
                        "fax": "0",
                        "nama_cp": "YUNI HANDAYANI ",
                        "jabatan": "0",
                        "email": "yuni.handayani@yutaka.co.id",
                        "telp_cp": "085720390900",
                        "discount": 0,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-06T04:50:11.000Z",
                            "updatedAt": "2022-09-08T03:26:48.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Dian Komalasari",
                            "id": 550,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Industri Otomotif",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 20,
                        "tipe_pelanggan_referensi_id": 579,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3216,
                            "nama_kota": "KAB. BEKASI",
                            "kode_propinsi": 32
                        },
                        "kode_propinsi_id": 32,
                        "status_referensi_id": 7,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-01-12T07:35:09.000Z",
                        "updatedAt": "2024-04-18T09:02:27.000Z",
                        "createdBy": "Wita Wulandari",
                        "updatedBy": "Shinta Kumalasari",
                        "id": 1109,
                        "id_pelanggan": "0",
                        "nama": "PT YUTAKA MANUFACTURING INDONESIA PLANT 2",
                        "telp": "0",
                        "alamat": "Kompleks Industri MM2100, Jalan Halmahera Blok EE - 1, Gandamekar Cikarang Bar, Bekasi - Jawa Barat 17530",
                        "kode_pos": "17530",
                        "npwp": "0",
                        "fax": "0",
                        "nama_cp": "YUNI HANDAYANI ",
                        "jabatan": "0",
                        "email": "yuni.handayani@yutaka.co.id",
                        "telp_cp": "085720390900",
                        "discount": 0,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-06T04:50:11.000Z",
                            "updatedAt": "2022-09-08T03:26:48.000Z",
                            "createdBy": "Admin",
                            "updatedBy": "Dian Komalasari",
                            "id": 550,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Industri Otomotif",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 20,
                        "tipe_pelanggan_referensi_id": 579,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3216,
                            "nama_kota": "KAB. BEKASI",
                            "kode_propinsi": 32
                        },
                        "kode_propinsi_id": 32,
                        "status_referensi_id": 7,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2024-04-17T05:37:18.000Z",
                        "updatedAt": "2024-04-17T05:37:18.000Z",
                        "createdBy": "Shinta Kumalasari",
                        "updatedBy": null,
                        "id": 1265,
                        "id_pelanggan": "-",
                        "nama": "PT TAIKISHA INDONESIA ENGINEERING",
                        "telp": "-",
                        "alamat": "Menara Bidakara lt.13 Jakarta",
                        "kode_pos": "12870",
                        "npwp": "-",
                        "fax": "",
                        "nama_cp": "Bapak Yugo",
                        "jabatan": "",
                        "email": "yugo@taikisha.co.id",
                        "telp_cp": "08561120003",
                        "discount": null,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-29T09:45:34.000Z",
                            "updatedAt": "2022-09-29T09:45:35.000Z",
                            "createdBy": "Aulia Rahim Nugraha",
                            "updatedBy": null,
                            "id": 590,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Lain-Lain",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 21,
                        "tipe_pelanggan_referensi_id": 579,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3174,
                            "nama_kota": "KOTA ADM. JAKARTA SELATAN",
                            "kode_propinsi": 31
                        },
                        "kode_propinsi_id": 31,
                        "status_referensi_id": 7,
                        "uuid": "111"
                    },
                    {
                        "createdAt": "2023-01-03T03:04:46.000Z",
                        "updatedAt": "2024-04-04T04:40:39.000Z",
                        "createdBy": "Fatma Fitria",
                        "updatedBy": "Shinta Kumalasari",
                        "id": 1032,
                        "id_pelanggan": "-",
                        "nama": "PT DELTA INDONESIA LABORATORY",
                        "telp": "021 – 88382018",
                        "alamat": "JL PERUM PRIMA HARAPAN REGENCY, GEDUNG PRIMA ORCHARD  BLOK C, NO2 BEKASI UTARA 17123",
                        "kode_pos": "17123",
                        "npwp": "-",
                        "fax": "-",
                        "nama_cp": "Gita",
                        "jabatan": "-",
                        "email": "admin@deltaindonesialab.com",
                        "telp_cp": "081315857102",
                        "discount": null,
                        "jenis_pelanggan_referensi_id": {
                            "createdAt": "2022-09-23T03:01:23.000Z",
                            "updatedAt": "2022-09-23T03:01:24.000Z",
                            "createdBy": "Aulia Rahim Nugraha",
                            "updatedBy": null,
                            "id": 584,
                            "kode_kategori": "JENIS_KLIEN",
                            "kode": null,
                            "deskripsi1": "Laboratoirum, Lembaga Penelitian",
                            "deskripsi2": null,
                            "grouping": null
                        },
                        "gelar_referensi_id": 20,
                        "tipe_pelanggan_referensi_id": 579,
                        "kode_kota_id": {
                            "createdAt": "2021-04-27T11:07:05.000Z",
                            "updatedAt": "2021-04-27T11:07:21.000Z",
                            "createdBy": "",
                            "updatedBy": "",
                            "id": 3275,
                            "nama_kota": "KOTA BEKASI",
                            "kode_propinsi": 32
                        },
                        "kode_propinsi_id": 32,
                        "status_referensi_id": 7,
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


    const deleteCustomer = async (
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
        console.log(data, 'data of delete pelanggan');

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
            return { status: 200, message: 'Successfully deleted pelanggan' };
        } else {
            return { status: 500, message: 'Failed to delete pelanggan' };
        }
        } catch (error) {
        console.error('Error deleting pelanggan:', error);
        return { status: 500, message: 'An error occurred while deleting the pelanggan' };
        }
    };
  
    type CustomerTypesTypeWithAction = Partial<CustomerType> & {
        action?: string
     }

export default function MasterCustomerPage() {
    const [customers, setCustomers] = useState<CustomerType[]>([]);
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
    
    const columnHelperCustomer = createColumnHelper<CustomerTypesTypeWithAction>()

    const dataColumns = useMemo<ColumnDef<CustomerTypesTypeWithAction, any>[]>(() => [
        columnHelperCustomer.accessor('id_pelanggan', {
          header: 'Nomor Pelanggan',
          cell: ({ row }) => <Typography>{row.original.id_pelanggan}</Typography>
        }),
        columnHelperCustomer.accessor('nama', {
          header: 'Nama Pelanggan',
          cell: ({ row }) => <Typography>{row.original.nama}</Typography>
        }),
        columnHelperCustomer.accessor('jenis_pelanggan_referensi_id.deskripsi1', {
          header: 'Jenis Pelanggan',
          cell: ({ row }) =>  
            <Typography>
                {typeof row.original.jenis_pelanggan_referensi_id === 'object'
                    ? row.original.jenis_pelanggan_referensi_id?.deskripsi1
                    : '-'}
            </Typography>
        }),
        columnHelperCustomer.accessor('kode_kota_id.nama_kota', {
          header: 'Kota',
          cell: ({ row }) => 
            <Typography>
                {typeof row.original.kode_kota_id === 'object'
                    ? row.original.kode_kota_id?.nama_kota
                    : '-'}
            </Typography>
        }),
        columnHelperCustomer.accessor('nama_cp', {
          header: 'Nama Kontak',
          cell: ({ row }) => <Typography>{row.original.nama_cp}</Typography>
        }),
        columnHelperCustomer.accessor('telp_cp', {
          header: 'Telepon Kontak',
          cell: ({ row }) => <Typography>{row.original.telp_cp}</Typography>
        }),
        columnHelperCustomer.accessor('action', {
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
                            onClick: () => router.push(`/${locale}/master/customer/${row.original.uuid}`),
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
      ], [customers])

    const getMasterCustomers = async () => {
        try {
        setIsLoading(true);
        const response = await fetchCustomers(pagination.currentPage, pagination.perPage);
        
        const result = response.data.data;
    
        setPagination(prev => ({
            ...prev,
            perPage: result.per_page,
            totalPages: result.total_pages,
            totalRecords: result.total_records,
        }));

        if (result.data == null) {
            setCustomers([]);
        } else {
            // const transformedData = transformInternalDocuments(result.data);
            setCustomers(result.data);
        }
            
        } catch (error) {
        console.error("Error fetching internal documents:", error);
        } finally {
        setIsLoading(false);
        }
    };
    
    useEffect(() => {
            getMasterCustomers();
        }, [
            pagination.currentPage, 
            pagination.perPage,
        ]
    );

    // Check if StatusDocumentTable receives documentCategories as expected
    return (
        <Datatable
            dataColumns={dataColumns} 
            tableData={customers} 
            isLoading={isLoading} 
            setPagination={setPagination} 
            pagination={pagination} 
            pageTitle="Pelanggan"
            urlAddPage={`/${locale}/admin/master/pelanggan/add`}
        />
    );
}
