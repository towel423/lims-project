'use client';

import { useState } from 'react';
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import dynamic from 'next/dynamic';
import { useForm, Controller } from 'react-hook-form';
import { getJwtToken } from '@/helpers/helper';
import CustomTextField from '@/@core/components/mui/TextField';
import { GlobalReferenceType } from '@/types/apps/globalReferenceTypes';
import { MenuItem } from '@mui/material';

const GeneralInfoCustom = dynamic(() => import('@/views/components/GeneralInfoCustom'));

type TabKeys = 'general-info';

const addGlobalReference = async (data: Partial<GlobalReferenceType>) => {
  const token = getJwtToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = token;

  try {
    const response = await fetch('/api/master/global-reference', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to add global reference");

    return { status: response.status, message: 'Successfully added new global reference' };
  } catch (error) {
    console.error("Error adding global reference:", error);
  }
};

const AddMasterGlobalReferencePage = () => {
    const [dataMasterKategori, setDataMasterKategori] = useState( [
        {
            "createdAt": "2021-11-08T15:28:27.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 21,
            "kode_kategori": "ADMINISTRASI_SAMPEL",
            "nama_kategori": "Administrasi Sampel"
        },
        {
            "createdAt": "2021-11-08T15:28:27.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 36,
            "kode_kategori": "ADMINISTRASI_SAMPEL",
            "nama_kategori": "Administrasi Sampel"
        },
        {
            "createdAt": "2023-05-17T10:52:42.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 50,
            "kode_kategori": "APP_CONFIG",
            "nama_kategori": "App Config"
        },
        {
            "createdAt": "2022-01-09T22:53:35.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 27,
            "kode_kategori": "TUJUAN_SAMPLING",
            "nama_kategori": "Cara Pengambilan Sampel - Sampling Udara"
        },
        {
            "createdAt": "2021-11-08T15:35:25.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 25,
            "kode_kategori": "CARA_SAMPLING_UDARA",
            "nama_kategori": "Cara Pengambilan Sampel - Udara"
        },
        {
            "createdAt": "2022-01-10T20:22:32.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 28,
            "kode_kategori": "CARA_SAMPLING_LB3",
            "nama_kategori": "Cara Pengambilan Sample - LB3"
        },
        {
            "createdAt": "2022-01-10T20:23:12.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 29,
            "kode_kategori": "CARA_SAMPLING_MIKRO",
            "nama_kategori": "Cara Pengambilan Sample - Microbiology"
        },
        {
            "createdAt": "2021-11-08T15:19:22.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 18,
            "kode_kategori": "CARA_SAMPLING_AIR",
            "nama_kategori": "Cara Pengambilan Sample - Sampling Air"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 8,
            "kode_kategori": "FORM_REAGEN",
            "nama_kategori": "Form Reagen"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 10,
            "kode_kategori": "GELAR_TIPE_KORPORASI",
            "nama_kategori": "Gelar Tipe Korporasi"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 7,
            "kode_kategori": "GELAR_TIPE_PERSONAL",
            "nama_kategori": "Gelar Tipe Personal"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 12,
            "kode_kategori": "INTERPRETASI_HASIL",
            "nama_kategori": "Interpretasi Hasil"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 1,
            "kode_kategori": "JENIS_KLIEN",
            "nama_kategori": "Jenis Pelanggan"
        },
        {
            "createdAt": "2022-05-20T22:12:21.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 42,
            "kode_kategori": "JENIS_PEMBAYARAN",
            "nama_kategori": "Jenis Pembayaran"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 11,
            "kode_kategori": "JENIS_WADAH",
            "nama_kategori": "Jenis Wadah"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 4,
            "kode_kategori": "KATEGORI_ALAT",
            "nama_kategori": "Kategori Alat"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 13,
            "kode_kategori": "KATEGORI_PARAM_UJI",
            "nama_kategori": "Kategori Parameter Uji"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 15,
            "kode_kategori": "KATEGORI_SNI",
            "nama_kategori": "Kategori SNI"
        },
        {
            "createdAt": "2023-01-05T00:47:33.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 47,
            "kode_kategori": "LARUTAN_PENJERAP",
            "nama_kategori": "Larutan Penjerap untuk sampling udara"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 3,
            "kode_kategori": "MERK_ALAT",
            "nama_kategori": "Merk Alat"
        },
        {
            "createdAt": "2021-11-08T15:28:01.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 20,
            "kode_kategori": "PENGAMANAN_SAMPLING",
            "nama_kategori": "Pengamanan dan Transportasi Sampel"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 14,
            "kode_kategori": "PENGAWETAN",
            "nama_kategori": "Pengawetan Sample"
        },
        {
            "createdAt": "2021-11-08T15:30:57.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 22,
            "kode_kategori": "PENGAWETAN_SAMPLING_AIR",
            "nama_kategori": "Pengawetan Sampling Air"
        },
        {
            "createdAt": "2021-11-08T15:31:38.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 23,
            "kode_kategori": "PENGAWETAN_SAMPLING_LB3",
            "nama_kategori": "Pengawetan Sampling LB3"
        },
        {
            "createdAt": "2021-11-08T15:26:47.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 19,
            "kode_kategori": "PENGENDALIAN_MUTU",
            "nama_kategori": "Pengendalian Mutu Lapangan"
        },
        {
            "createdAt": null,
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 44,
            "kode_kategori": "PENGENDALIAN_MUTU_UDARA",
            "nama_kategori": "Pengendalian Mutu Lapangan 1Udara"
        },
        {
            "createdAt": "2021-11-08T15:26:47.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 43,
            "kode_kategori": "PENGENDALIAN_MUTU_LB3",
            "nama_kategori": "Pengendalian Mutu Lapangan LB3"
        },
        {
            "createdAt": "2021-11-08T07:51:52.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 16,
            "kode_kategori": "PERALATAN_K3",
            "nama_kategori": "Peralatan K3 - Sampling"
        },
        {
            "createdAt": "2021-11-08T15:12:29.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 17,
            "kode_kategori": "PERALATAN_PENDUKUNG",
            "nama_kategori": "Peralatan Pendukung - Sampling"
        },
        {
            "createdAt": "2021-11-08T15:32:34.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 24,
            "kode_kategori": "PERALATAN_UKUR_LAP",
            "nama_kategori": "Peralatan Pengukuran Lapangan"
        },
        {
            "createdAt": "2021-11-08T15:32:34.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 41,
            "kode_kategori": "PERALATAN_SAMPLING",
            "nama_kategori": "Peralatan Sampling"
        },
        {
            "createdAt": "2023-01-05T00:46:57.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 45,
            "kode_kategori": "PERALATAN_SAMPLING_LB3",
            "nama_kategori": "Peralatan Sampling LB3"
        },
        {
            "createdAt": "2023-01-05T00:47:17.000Z",
            "updatedAt": null,
            "createdBy": null,
            "updatedBy": null,
            "id": 46,
            "kode_kategori": "PERALATAN_SAMPLING_UDARA",
            "nama_kategori": "Peralatan Sampling Udara"
        },
        {
            "createdAt": "2022-01-04T21:01:46.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 26,
            "kode_kategori": "SATUAN_METODA",
            "nama_kategori": "Satuan Metoda"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 9,
            "kode_kategori": "SATUAN_REAGEN",
            "nama_kategori": "Satuan Reagen"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 2,
            "kode_kategori": "STATUS",
            "nama_kategori": "Status"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 5,
            "kode_kategori": "SUB_KATEGORI_ALAT",
            "nama_kategori": "Sub Kategori Alat"
        },
        {
            "createdAt": "2021-06-30T17:00:00.000Z",
            "updatedAt": "2022-01-08T17:00:00.000Z",
            "createdBy": null,
            "updatedBy": null,
            "id": 6,
            "kode_kategori": "TIPE_PELANGGAN",
            "nama_kategori": "Tipe Pelanggan"
        }
    ]);
    const [dataMasterGrouping, setDataMasterGrouping] = useState( [
        {
            "createdAt": "2021-06-30T10:26:46.000Z",
            "updatedAt": "2021-06-30T10:26:46.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 7,
            "kode_kategori": "STATUS",
            "kode": null,
            "deskripsi1": "Aktif",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:26:55.000Z",
            "updatedAt": "2021-06-30T10:26:55.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 8,
            "kode_kategori": "STATUS",
            "kode": null,
            "deskripsi1": "Tidak Aktif",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:27:22.000Z",
            "updatedAt": "2022-09-07T07:15:58.000Z",
            "createdBy": "admin",
            "updatedBy": "Jesica Astriani",
            "id": 9,
            "kode_kategori": "KATEGORI_ALAT",
            "kode": null,
            "deskripsi1": "Alat General",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:27:58.000Z",
            "updatedAt": "2021-06-30T10:27:59.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 10,
            "kode_kategori": "SUB_KATEGORI_ALAT",
            "kode": null,
            "deskripsi1": "Alat Utama",
            "deskripsi2": "",
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:28:33.000Z",
            "updatedAt": "2021-06-30T10:28:34.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 12,
            "kode_kategori": "SUB_KATEGORI_ALAT",
            "kode": null,
            "deskripsi1": "Alat Pendukung",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:29:15.000Z",
            "updatedAt": "2021-06-30T10:29:16.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 14,
            "kode_kategori": "FORM_REAGEN",
            "kode": null,
            "deskripsi1": "Liquid",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:29:24.000Z",
            "updatedAt": "2021-06-30T10:29:24.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 15,
            "kode_kategori": "FORM_REAGEN",
            "kode": null,
            "deskripsi1": "Gas",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:29:35.000Z",
            "updatedAt": "2021-06-30T10:29:36.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 16,
            "kode_kategori": "FORM_REAGEN",
            "kode": null,
            "deskripsi1": "Solid",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:29:48.000Z",
            "updatedAt": "2021-06-30T10:29:48.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 17,
            "kode_kategori": "SATUAN_REAGEN",
            "kode": null,
            "deskripsi1": "mL",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:29:56.000Z",
            "updatedAt": "2021-06-30T10:29:56.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 18,
            "kode_kategori": "SATUAN_REAGEN",
            "kode": null,
            "deskripsi1": "gr",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:30:09.000Z",
            "updatedAt": "2021-06-30T10:30:09.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 19,
            "kode_kategori": "SATUAN_REAGEN",
            "kode": null,
            "deskripsi1": "kg",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:30:24.000Z",
            "updatedAt": "2021-06-30T10:30:24.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 20,
            "kode_kategori": "GELAR_TIPE_PERSONAL",
            "kode": null,
            "deskripsi1": "Ibu",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:30:32.000Z",
            "updatedAt": "2021-06-30T10:30:32.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 21,
            "kode_kategori": "GELAR_TIPE_KORPORASI",
            "kode": null,
            "deskripsi1": "PT",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:30:51.000Z",
            "updatedAt": "2021-06-30T10:30:52.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 22,
            "kode_kategori": "JENIS_WADAH",
            "kode": null,
            "deskripsi1": "P",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:33:29.000Z",
            "updatedAt": "2021-06-30T10:33:29.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 23,
            "kode_kategori": "KATEGORI_PARAM_UJI",
            "kode": null,
            "deskripsi1": "Fisika",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:33:39.000Z",
            "updatedAt": "2021-06-30T10:33:39.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 24,
            "kode_kategori": "KATEGORI_PARAM_UJI",
            "kode": null,
            "deskripsi1": "Kimia",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:33:47.000Z",
            "updatedAt": "2021-06-30T10:33:48.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 25,
            "kode_kategori": "KATEGORI_PARAM_UJI",
            "kode": null,
            "deskripsi1": "Biologi",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:35:27.000Z",
            "updatedAt": "2022-04-01T14:03:32.000Z",
            "createdBy": "admin",
            "updatedBy": "Admin",
            "id": 26,
            "kode_kategori": "PENGAWETAN",
            "kode": null,
            "deskripsi1": "Asam Nitrat (HNO₃), pH < 2",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-06-30T10:35:38.000Z",
            "updatedAt": "2022-04-01T14:02:08.000Z",
            "createdBy": "admin",
            "updatedBy": "Admin",
            "id": 27,
            "kode_kategori": "PENGAWETAN",
            "kode": null,
            "deskripsi1": "Asam Sulfat (H₂SO₄), pH < 2",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:35:02.000Z",
            "updatedAt": "2021-07-08T19:35:03.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 74,
            "kode_kategori": "GELAR_TIPE_KORPORASI",
            "kode": null,
            "deskripsi1": "CV",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:35:10.000Z",
            "updatedAt": "2021-07-08T19:35:11.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 75,
            "kode_kategori": "GELAR_TIPE_PERSONAL",
            "kode": null,
            "deskripsi1": "Bapak",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:36:22.000Z",
            "updatedAt": "2021-07-08T19:36:23.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 76,
            "kode_kategori": "JENIS_WADAH",
            "kode": null,
            "deskripsi1": "G",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:36:40.000Z",
            "updatedAt": "2021-07-08T19:36:41.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 77,
            "kode_kategori": "JENIS_WADAH",
            "kode": null,
            "deskripsi1": "G(A)",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:36:49.000Z",
            "updatedAt": "2021-07-08T19:36:49.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 78,
            "kode_kategori": "JENIS_WADAH",
            "kode": null,
            "deskripsi1": "G(Pro)",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:37:06.000Z",
            "updatedAt": "2021-07-08T19:37:06.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 79,
            "kode_kategori": "JENIS_WADAH",
            "kode": null,
            "deskripsi1": "P(A)",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:37:20.000Z",
            "updatedAt": "2021-07-08T19:37:20.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 80,
            "kode_kategori": "JENIS_WADAH",
            "kode": null,
            "deskripsi1": "G(B)",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:37:27.000Z",
            "updatedAt": "2021-07-08T19:37:28.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 81,
            "kode_kategori": "JENIS_WADAH",
            "kode": null,
            "deskripsi1": "G(S)",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:37:37.000Z",
            "updatedAt": "2021-07-08T19:37:38.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 82,
            "kode_kategori": "JENIS_WADAH",
            "kode": null,
            "deskripsi1": "G(St)",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:39:54.000Z",
            "updatedAt": "2022-09-07T07:15:14.000Z",
            "createdBy": "admin",
            "updatedBy": "Jesica Astriani",
            "id": 83,
            "kode_kategori": "KATEGORI_ALAT",
            "kode": null,
            "deskripsi1": "Alat Laboratorium ",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:48:05.000Z",
            "updatedAt": "2021-07-08T19:48:06.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 92,
            "kode_kategori": "PENGAWETAN",
            "kode": null,
            "deskripsi1": "Seng Asetat, pH > 9",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:48:14.000Z",
            "updatedAt": "2021-07-08T19:48:15.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 93,
            "kode_kategori": "PENGAWETAN",
            "kode": null,
            "deskripsi1": "Natrium Hidroksida (NaOH), pH > 9",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:48:25.000Z",
            "updatedAt": "2022-04-02T09:50:41.000Z",
            "createdBy": "admin",
            "updatedBy": "Admin",
            "id": 94,
            "kode_kategori": "PENGAWETAN",
            "kode": null,
            "deskripsi1": "Dinginkan, 3º±3ºC",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:48:34.000Z",
            "updatedAt": "2022-04-02T09:08:45.000Z",
            "createdBy": "admin",
            "updatedBy": "Admin",
            "id": 95,
            "kode_kategori": "PENGAWETAN",
            "kode": null,
            "deskripsi1": "Tanpa Pengawetan",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:48:42.000Z",
            "updatedAt": "2022-04-02T08:14:46.000Z",
            "createdBy": "admin",
            "updatedBy": "Admin",
            "id": 96,
            "kode_kategori": "PENGAWETAN",
            "kode": null,
            "deskripsi1": "Asam Klorida (HCl), pH < 2",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-07-08T19:48:51.000Z",
            "updatedAt": "2022-04-02T08:16:25.000Z",
            "createdBy": "admin",
            "updatedBy": "Admin",
            "id": 97,
            "kode_kategori": "PENGAWETAN",
            "kode": null,
            "deskripsi1": "0,008% Na₂S₂O₃ simpan ditempat gelap",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-11-08T07:52:53.000Z",
            "updatedAt": "2023-04-09T02:37:41.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 450,
            "kode_kategori": "PERALATAN_K3",
            "kode": "1",
            "deskripsi1": "Sarung Tangan Nitril",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-11-08T07:53:11.000Z",
            "updatedAt": "2023-04-09T02:37:29.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 451,
            "kode_kategori": "PERALATAN_K3",
            "kode": null,
            "deskripsi1": "Safety Boots",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-11-08T07:53:28.000Z",
            "updatedAt": "2023-04-09T02:37:18.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 452,
            "kode_kategori": "PERALATAN_K3",
            "kode": null,
            "deskripsi1": "Safety Shoes ",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-11-08T07:53:38.000Z",
            "updatedAt": "2023-04-09T02:37:10.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 453,
            "kode_kategori": "PERALATAN_K3",
            "kode": null,
            "deskripsi1": "Safety Googles",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-11-08T23:58:47.000Z",
            "updatedAt": "2023-04-09T02:37:01.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 454,
            "kode_kategori": "PERALATAN_K3",
            "kode": null,
            "deskripsi1": "Safety Helmet",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2021-12-19T23:04:52.000Z",
            "updatedAt": "2022-09-06T06:35:49.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 457,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "Udara Lingkungan Kerja",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-04T21:02:48.000Z",
            "updatedAt": "2022-01-04T21:02:49.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 458,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "mg/L",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-04T21:03:00.000Z",
            "updatedAt": "2022-01-04T21:03:01.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 459,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "ug/L",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-04T21:03:18.000Z",
            "updatedAt": "2022-01-04T21:03:19.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 460,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "mg/m3",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-04T21:03:32.000Z",
            "updatedAt": "2022-01-04T21:03:33.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 461,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "ppm/BDS",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:19:12.000Z",
            "updatedAt": "2022-01-05T17:19:13.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 462,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "ug/m3",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:19:48.000Z",
            "updatedAt": "2022-01-05T17:19:48.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 463,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "BDS",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:20:19.000Z",
            "updatedAt": "2022-01-05T17:20:19.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 464,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "ppm",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:20:41.000Z",
            "updatedAt": "2022-01-05T17:20:42.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 465,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "%",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:20:58.000Z",
            "updatedAt": "2022-01-05T17:20:58.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 466,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "Titik",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:21:08.000Z",
            "updatedAt": "2022-01-05T17:21:08.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 467,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "m/s",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:21:22.000Z",
            "updatedAt": "2022-01-05T17:21:23.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 468,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "mm/s",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:21:35.000Z",
            "updatedAt": "2022-01-05T17:21:36.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 469,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "m/s2",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:21:46.000Z",
            "updatedAt": "2022-01-05T17:21:47.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 470,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "db",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:22:00.000Z",
            "updatedAt": "2023-07-31T09:46:55.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 471,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "°C",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:22:11.000Z",
            "updatedAt": "2022-01-05T17:22:11.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 472,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "Lux",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:22:23.000Z",
            "updatedAt": "2022-01-05T17:22:23.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 473,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "W/m2",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:22:34.000Z",
            "updatedAt": "2022-01-05T17:22:35.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 474,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "V/m",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-05T17:22:45.000Z",
            "updatedAt": "2022-01-05T17:22:45.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 475,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "uT",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-09T06:22:53.000Z",
            "updatedAt": "2022-09-06T06:35:30.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 476,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "Udara Ambien dan Emisi",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-09T09:05:47.000Z",
            "updatedAt": "2022-01-09T09:05:48.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 479,
            "kode_kategori": "SUB_KATEGORI_ALAT",
            "kode": null,
            "deskripsi1": "Undefined",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-09T22:55:12.000Z",
            "updatedAt": "2022-01-09T22:55:13.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 480,
            "kode_kategori": "TUJUAN_SAMPLING",
            "kode": null,
            "deskripsi1": "Pemantauan",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-09T22:55:22.000Z",
            "updatedAt": "2022-01-09T22:55:23.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 481,
            "kode_kategori": "TUJUAN_SAMPLING",
            "kode": null,
            "deskripsi1": "Pengawasan",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-09T22:55:37.000Z",
            "updatedAt": "2022-01-09T22:55:38.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 482,
            "kode_kategori": "TUJUAN_SAMPLING",
            "kode": null,
            "deskripsi1": "Kajian/Penelitian",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-09T22:55:53.000Z",
            "updatedAt": "2022-01-09T22:55:54.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 483,
            "kode_kategori": "TUJUAN_SAMPLING",
            "kode": null,
            "deskripsi1": "Pembuktian Kasus",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-10T20:25:26.000Z",
            "updatedAt": "2022-01-10T20:25:27.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 484,
            "kode_kategori": "CARA_SAMPLING_AIR",
            "kode": null,
            "deskripsi1": "Sesaat",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-10T20:25:41.000Z",
            "updatedAt": "2022-01-10T20:25:41.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 485,
            "kode_kategori": "CARA_SAMPLING_AIR",
            "kode": null,
            "deskripsi1": "Gabungan waktu",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-10T20:25:58.000Z",
            "updatedAt": "2022-01-10T20:25:59.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 486,
            "kode_kategori": "CARA_SAMPLING_AIR",
            "kode": null,
            "deskripsi1": "Gabungan Tempat",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-10T20:26:11.000Z",
            "updatedAt": "2022-01-10T20:26:11.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 487,
            "kode_kategori": "CARA_SAMPLING_AIR",
            "kode": null,
            "deskripsi1": "Gabungan Kedalaman",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-10T20:26:22.000Z",
            "updatedAt": "2022-01-10T20:26:22.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 488,
            "kode_kategori": "CARA_SAMPLING_AIR",
            "kode": null,
            "deskripsi1": "Terpadu",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-10T20:26:32.000Z",
            "updatedAt": "2022-01-10T20:26:33.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 489,
            "kode_kategori": "CARA_SAMPLING_AIR",
            "kode": null,
            "deskripsi1": "Kontinu",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-10T20:26:48.000Z",
            "updatedAt": "2022-01-10T20:26:49.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 490,
            "kode_kategori": "CARA_SAMPLING_AIR",
            "kode": null,
            "deskripsi1": "Ketersediaan Sampel",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-11T21:36:58.000Z",
            "updatedAt": "2022-01-11T21:36:58.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 491,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "-",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-17T00:29:01.000Z",
            "updatedAt": "2023-04-09T02:51:37.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 492,
            "kode_kategori": "PERALATAN_PENDUKUNG",
            "kode": null,
            "deskripsi1": "Dry Box",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-17T00:29:13.000Z",
            "updatedAt": "2023-04-09T02:51:28.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 493,
            "kode_kategori": "PERALATAN_PENDUKUNG",
            "kode": null,
            "deskripsi1": "Cooler Box",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-19T19:52:49.000Z",
            "updatedAt": "2022-09-06T06:35:05.000Z",
            "createdBy": "Indah",
            "updatedBy": "Admin",
            "id": 494,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "B3 dan Limbah Padat",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-19T20:06:31.000Z",
            "updatedAt": "2022-01-19T20:06:32.000Z",
            "createdBy": "Indah",
            "updatedBy": null,
            "id": 495,
            "kode_kategori": "KATEGORI_SNI",
            "kode": "SNI_SAMPLING",
            "deskripsi1": "Tanah",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-20T02:39:01.000Z",
            "updatedAt": "2022-01-20T02:39:01.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": null,
            "id": 497,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "NTU",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-20T02:48:12.000Z",
            "updatedAt": "2022-01-20T02:48:13.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": null,
            "id": 498,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "TCU",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-20T03:32:23.000Z",
            "updatedAt": "2022-01-20T03:33:55.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": null,
            "id": 499,
            "kode_kategori": "SUB_KATEGORI_ALAT",
            "kode": null,
            "deskripsi1": "Organoleptik",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-20T04:33:59.000Z",
            "updatedAt": "2022-01-20T04:33:59.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": null,
            "id": 500,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "MPN/100mL",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-21T21:20:55.000Z",
            "updatedAt": "2022-01-21T21:20:55.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": null,
            "id": 502,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "CFU/100mL",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-21T21:31:50.000Z",
            "updatedAt": "2022-01-21T21:31:51.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": null,
            "id": 503,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "m3/detik",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-21T22:15:48.000Z",
            "updatedAt": "2022-04-02T08:54:36.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": "Admin",
            "id": 504,
            "kode_kategori": "PENGAWETAN",
            "kode": null,
            "deskripsi1": "Zn-Asetat, NaOH sampai pH >9 dan Dinginkan ±3ºC",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-21T22:56:57.000Z",
            "updatedAt": "2022-01-21T22:56:57.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": null,
            "id": 505,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "m",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-22T00:06:13.000Z",
            "updatedAt": "2024-03-15T00:52:18.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": "Admin",
            "id": 506,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "µg/m3",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-22T01:09:56.000Z",
            "updatedAt": "2022-01-22T01:09:56.000Z",
            "createdBy": "Hadi Suyono",
            "updatedBy": null,
            "id": 507,
            "kode_kategori": "SATUAN_METODA",
            "kode": null,
            "deskripsi1": "dB",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-02-05T19:41:01.000Z",
            "updatedAt": "2022-02-05T19:41:01.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 516,
            "kode_kategori": "PENGENDALIAN_MUTU",
            "kode": "BB",
            "deskripsi1": "Background Sample",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-14T08:20:58.000Z",
            "updatedAt": "2023-04-09T02:25:20.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 523,
            "kode_kategori": "PERALATAN_SAMPLING",
            "kode": null,
            "deskripsi1": "Ember Bertali Panjang",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-14T08:21:10.000Z",
            "updatedAt": "2022-01-14T08:21:10.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 524,
            "kode_kategori": "PERALATAN_SAMPLING",
            "kode": null,
            "deskripsi1": "Gelas Bertangkai",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-14T08:23:19.000Z",
            "updatedAt": "2023-04-09T02:51:19.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 527,
            "kode_kategori": "PERALATAN_PENDUKUNG",
            "kode": null,
            "deskripsi1": "Weather Instrument",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-14T08:31:43.000Z",
            "updatedAt": "2023-04-09T02:45:58.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 528,
            "kode_kategori": "PENGAMANAN_SAMPLING",
            "kode": null,
            "deskripsi1": "Penyegelan Sampel",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-14T08:31:58.000Z",
            "updatedAt": "2023-04-09T02:45:49.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 529,
            "kode_kategori": "PENGAMANAN_SAMPLING",
            "kode": null,
            "deskripsi1": "Pengemasan Sampel",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-14T08:33:45.000Z",
            "updatedAt": "2022-01-14T08:33:45.000Z",
            "createdBy": "Admin",
            "updatedBy": null,
            "id": 530,
            "kode_kategori": "PERALATAN_UKUR_LAP",
            "kode": null,
            "deskripsi1": "Termometer",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-01-14T08:37:15.000Z",
            "updatedAt": "2023-04-09T02:44:35.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 532,
            "kode_kategori": "ADMINISTRASI_SAMPEL",
            "kode": null,
            "deskripsi1": "Working permit",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-02-05T19:41:01.000Z",
            "updatedAt": "2022-02-05T19:41:01.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 533,
            "kode_kategori": "PENGENDALIAN_MUTU",
            "kode": "BL",
            "deskripsi1": "Blanko Lapangan",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-02-05T19:41:01.000Z",
            "updatedAt": "2022-02-05T19:41:01.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 534,
            "kode_kategori": "PENGENDALIAN_MUTU",
            "kode": "BP",
            "deskripsi1": "Blanko Perjalanan",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-02-05T19:41:01.000Z",
            "updatedAt": "2022-02-05T19:41:01.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 535,
            "kode_kategori": "PENGENDALIAN_MUTU",
            "kode": "BW",
            "deskripsi1": "Blanko Wadah",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-02-05T19:41:01.000Z",
            "updatedAt": "2022-02-05T19:41:01.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 536,
            "kode_kategori": "PENGENDALIAN_MUTU",
            "kode": "BA",
            "deskripsi1": "Blanko Peralatan",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-02-05T19:41:01.000Z",
            "updatedAt": "2022-02-05T19:41:01.000Z",
            "createdBy": "admin",
            "updatedBy": null,
            "id": 537,
            "kode_kategori": "PENGENDALIAN_MUTU",
            "kode": "BS",
            "deskripsi1": "Blanko Penyaringan",
            "deskripsi2": null,
            "grouping": null
        }
    ]);
  const [activeTab, setActiveTab] = useState<TabKeys>('general-info');
  const { control, handleSubmit, formState: { errors } } = useForm<Partial<GlobalReferenceType>>({
    mode: 'onChange',
    defaultValues: { 
        kode_kategori: null,
        kode: null,
        deskripsi1: null,
        deskripsi2: null,
        grouping: null
    }
  });

  const tabContentLists: Record<TabKeys, JSX.Element> = {
    'general-info': (
      <GeneralInfoCustom 
        formTitle="Add Global Reference" 
        actionMethod={addGlobalReference}
        backUrl='/admin/master/global-reference'
        successMessage='Successfully add global reference'
        failedMessage='Failed to add global reference'
      >
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='kode'
                control={control}
                //   rules={{ required: 'Kode is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label='Kode'
                    placeholder='Kode ...'
                    value={field.value ?? ''}
                    //   error={!!errors.kode}
                    //   helperText={errors.kode?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="kode_kategori"
                    control={control}
                    rules={{ required: 'Kategori is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Kategori<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.kode_kategori}
                        helperText={errors.kode_kategori?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Kategori</MenuItem>
                        {dataMasterKategori?.map((kategori) => (
                        <MenuItem key={kategori.id} value={kategori.id}>
                            {kategori.nama_kategori}
                        </MenuItem>
                        ))}
                    </CustomTextField>
                    )}
                />
            </Grid>

        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="grouping"
                    control={control}
                    // rules={{ required: 'Grouping is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Grouping
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.grouping}
                        helperText={errors.grouping?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Grouping</MenuItem>
                        {dataMasterGrouping?.map((grouping) => (
                            <MenuItem key={grouping.id} value={grouping.id}>
                                {grouping.deskripsi1}
                            </MenuItem>
                        ))}
                    </CustomTextField>
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='deskripsi1'
                control={control}
                rules={{ required: 'Deskripsi 1 is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Deskripsi 1<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Deskripsi 1 ...'
                    value={field.value ?? ''}
                    error={!!errors.deskripsi1}
                    helperText={errors.deskripsi1?.message}
                    />
                )}
                />
            </Grid>

        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='deskripsi2'
                control={control}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Deskripsi 2
                        </>
                        }
                    placeholder='Deskripsi 2 ...'
                    value={field.value ?? ''}
                    />
                )}
                />
            </Grid>

        </Grid>
      </GeneralInfoCustom>
    )
  };

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className="p-0">
            {tabContentLists[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  );
};

export default AddMasterGlobalReferencePage;
