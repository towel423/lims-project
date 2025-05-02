'use client';

import { useState } from 'react';
import Grid from '@mui/material/Grid';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import dynamic from 'next/dynamic';
import { useForm, Controller } from 'react-hook-form';
import { getJwtToken } from '@/helpers/helper';
import CustomTextField from '@/@core/components/mui/TextField';
import { MenuItem } from '@mui/material';
import { CustomerType } from '@/types/apps/customerTypes';

const GeneralInfoCustom = dynamic(() => import('@/views/components/GeneralInfoCustom'));

type TabKeys = 'general-info';

const addCustomer = async (data: Partial<CustomerType>) => {
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

const AddMasterCustomerPage = () => {
    const [dataMasterJenisPelanggan, setDataMasterJenisPelanggan] = useState( [
        {
            "createdAt": "2022-09-06T04:45:46.000Z",
            "updatedAt": "2022-11-17T09:19:04.000Z",
            "createdBy": "Admin",
            "updatedBy": "Admin",
            "id": 548,
            "kode_kategori": "JENIS_KLIEN",
            "kode": null,
            "deskripsi1": "Consultant",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-09-06T04:47:06.000Z",
            "updatedAt": "2023-02-16T06:54:53.000Z",
            "createdBy": "Admin",
            "updatedBy": "Aulia Rahim Nugraha",
            "id": 549,
            "kode_kategori": "JENIS_KLIEN",
            "kode": null,
            "deskripsi1": "Faskes",
            "deskripsi2": null,
            "grouping": null
        }
    ]);
    const [dataMasterTipePelanggan, setDataMasterTipePelanggan] = useState( [
        {
            "createdAt": "2022-09-08T07:25:27.000Z",
            "updatedAt": "2022-09-08T07:32:47.000Z",
            "createdBy": "Dian Komalasari",
            "updatedBy": "Dian Komalasari",
            "id": 579,
            "kode_kategori": "TIPE_PELANGGAN",
            "kode": "TP-001",
            "deskripsi1": "Direct Customer",
            "deskripsi2": null,
            "grouping": null
        },
        {
            "createdAt": "2022-09-08T07:26:02.000Z",
            "updatedAt": "2022-09-08T07:32:40.000Z",
            "createdBy": "Dian Komalasari",
            "updatedBy": "Dian Komalasari",
            "id": 580,
            "kode_kategori": "TIPE_PELANGGAN",
            "kode": "TP-002",
            "deskripsi1": "Direct Consultant",
            "deskripsi2": null,
            "grouping": null
        }
    ]);
    const [dataMasterGelarPelanggan, setDataMasterGelarPelanggan] = useState( [
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
    ]);
    const [dataMasterProvinsi, setDataMasterProvinsi] = useState( [
        {
            "createdAt": "2021-04-25T14:39:25.000Z",
            "updatedAt": "2021-04-25T14:39:41.000Z",
            "createdBy": "2021-04-25 21:40:09",
            "updatedBy": "2021-04-25 21:40:09",
            "id": 11,
            "nama_propinsi": "ACEH"
        },
        {
            "createdAt": "2021-04-25T14:39:25.000Z",
            "updatedAt": "2021-04-25T14:39:41.000Z",
            "createdBy": "2021-04-25 21:40:09",
            "updatedBy": "2021-04-25 21:40:09",
            "id": 12,
            "nama_propinsi": "SUMATERA UTARA"
        }
    ]);
    const [dataMasterKota, setDataMasterKota] = useState( [
        {
            "createdAt": "2021-04-27T11:07:05.000Z",
            "updatedAt": "2021-04-27T11:07:21.000Z",
            "createdBy": "",
            "updatedBy": "",
            "id": 3501,
            "nama_kota": "KAB. PACITAN",
            "kode_propinsi": 35
        },
        {
            "createdAt": "2021-04-27T11:07:05.000Z",
            "updatedAt": "2021-04-27T11:07:21.000Z",
            "createdBy": "",
            "updatedBy": "",
            "id": 3502,
            "kode_propinsi": 35
        }
    ]);
    const [dataMasterStatus, setDataMasterStatus] = useState( [
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
        }
    ]);

  const [activeTab, setActiveTab] = useState<TabKeys>('general-info');
  const { control, handleSubmit, formState: { errors } } = useForm<Partial<CustomerType>>({
    mode: 'onChange',
    defaultValues: { 
        id_pelanggan: null,
        jenis_pelanggan_referensi_id: null,
        tipe_pelanggan_referensi_id: null,
        gelar_referensi_id: null,
        nama: null,
        alamat: null,
        kode_propinsi_id: null,
        kode_kota_id: null,
        kode_pos: null,
        fax: null,
        telp: null,
        telp_cp: null,
        jabatan: null,
        email: null,
        discount: null,
        nama_cp: null,
        status_referensi_id: null,
        npwp: null,
        // catatan: null,
    }
  });

  const tabContentLists: Record<TabKeys, JSX.Element> = {
    'general-info': (
      <GeneralInfoCustom 
        formTitle="Add Pelanggan" 
        actionMethod={addCustomer}
        backUrl='/admin/master/pelanggan'
        successMessage='Successfully add pelanggan'
        failedMessage='Failed to add pelanggan'
      >
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='id_pelanggan'
                control={control}
                rules={{ required: 'Nomor pelanggan is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Nomor pelanggan<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Nomor pelanggan ...'
                    value={field.value ?? ''}
                    error={!!errors.id_pelanggan}
                    helperText={errors.id_pelanggan?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="jenis_pelanggan_referensi_id"
                    control={control}
                    rules={{ required: 'Jenis pelanggan is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Jenis Pelanggan<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.jenis_pelanggan_referensi_id}
                        helperText={errors.jenis_pelanggan_referensi_id?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Jenis Pelanggan</MenuItem>
                        {dataMasterJenisPelanggan?.map((jenis) => (
                        <MenuItem key={jenis.id} value={jenis.id}>
                            {jenis.deskripsi1}
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
                    name="tipe_pelanggan_referensi_id"
                    control={control}
                    rules={{ required: 'Tipe pelanggan is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Tipe Pelanggan<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.tipe_pelanggan_referensi_id}
                        helperText={errors.tipe_pelanggan_referensi_id?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Tipe Pelanggan</MenuItem>
                        {dataMasterTipePelanggan?.map((tipe) => (
                        <MenuItem key={tipe.id} value={tipe.id}>
                            {tipe.deskripsi1}
                        </MenuItem>
                        ))}
                    </CustomTextField>
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="gelar_referensi_id"
                    control={control}
                    rules={{ required: 'Gelar pelanggan is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Gelar Pelanggan<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.gelar_referensi_id}
                        helperText={errors.gelar_referensi_id?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Gelar Pelanggan</MenuItem>
                        {dataMasterGelarPelanggan?.map((gelar) => (
                        <MenuItem key={gelar.id} value={gelar.id}>
                            {gelar.deskripsi1}
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
                name='nama'
                control={control}
                rules={{ required: 'Nama pelanggan is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Nama pelanggan<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Nama pelanggan ...'
                    value={field.value ?? ''}
                    error={!!errors.nama}
                    helperText={errors.nama?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='alamat'
                control={control}
                rules={{ required: 'Alamat is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Alamat<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Alamat ...'
                    value={field.value ?? ''}
                    error={!!errors.alamat}
                    helperText={errors.alamat?.message}
                    />
                )}
                />
            </Grid>

        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="kode_propinsi_id"
                    control={control}
                    rules={{ required: 'Propinsi is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Propinsi<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.kode_propinsi_id}
                        helperText={errors.kode_propinsi_id?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Propinsi</MenuItem>
                        {dataMasterProvinsi?.map((provinsi) => (
                        <MenuItem key={provinsi.id} value={provinsi.id}>
                            {provinsi.nama_propinsi}
                        </MenuItem>
                        ))}
                    </CustomTextField>
                    )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="kode_kota_id"
                    control={control}
                    rules={{ required: 'Kota is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Kota<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.kode_kota_id}
                        helperText={errors.kode_kota_id?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Kota</MenuItem>
                        {dataMasterKota?.map((kota) => (
                        <MenuItem key={kota.id} value={kota.id}>
                            {kota.nama_kota}
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
                name='npwp'
                control={control}
                rules={{ required: 'NPWP/KTP is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            NPWP/KTP<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='NPWP/KTP ...'
                    value={field.value ?? ''}
                    error={!!errors.npwp}
                    helperText={errors.npwp?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='kode_pos'
                control={control}
                rules={{ required: 'Kode Pos is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Kode Pos<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Kode Pos ...'
                    value={field.value ?? ''}
                    error={!!errors.kode_pos}
                    helperText={errors.kode_pos?.message}
                    />
                )}
                />
            </Grid>

        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='fax'
                control={control}
                // rules={{ required: 'Fax is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Fax
                        </>
                        }
                    placeholder='Fax ...'
                    value={field.value ?? ''}
                    // error={!!errors.fax}
                    // helperText={errors.fax?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='telp_cp'
                control={control}
                rules={{ required: 'Nomor Tlp Kantor is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Nomor Tlp Kantor<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Nomor Tlp Kantor ...'
                    value={field.value ?? ''}
                    error={!!errors.telp_cp}
                    helperText={errors.telp_cp?.message}
                    />
                )}
                />
            </Grid>

        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='jabatan'
                control={control}
                // rules={{ required: 'Jabatan is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Jabatan
                        </>
                        }
                    placeholder='Jabatan ...'
                    value={field.value ?? ''}
                    // error={!!errors.jabatan}
                    // helperText={errors.jabatan?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='nama_cp'
                control={control}
                rules={{ required: 'Nama kontak is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Nama kontak Kantor<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Nama kontak ...'
                    value={field.value ?? ''}
                    error={!!errors.nama_cp}
                    helperText={errors.nama_cp?.message}
                    />
                )}
                />
            </Grid>

        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='email'
                control={control}
                rules={{ required: 'Email is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Email<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='Email ...'
                    value={field.value ?? ''}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='telp'
                control={control}
                rules={{ required: 'No. HP/WA is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            No. HP/WA Kantor<span className="text-red-500">*</span>
                        </>
                        }
                    placeholder='No. HP/WA ...'
                    value={field.value ?? ''}
                    error={!!errors.telp}
                    helperText={errors.telp?.message}
                    />
                )}
                />
            </Grid>

        </Grid>
        <Grid container spacing={6}>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                name='discount'
                control={control}
                // rules={{ required: 'Diskon is required' }}
                render={({ field }) => (
                    <CustomTextField
                    {...field}
                    fullWidth
                    label={
                        <>
                            Diskon
                        </>
                        }
                    placeholder='Diskon ...'
                    value={field.value ?? ''}
                    // error={!!errors.discount}
                    // helperText={errors.discount?.message}
                    />
                )}
                />
            </Grid>
            <Grid item xs={12} sm={6} marginBottom={4}>
                <Controller
                    name="status_referensi_id"
                    control={control}
                    rules={{ required: 'Status is required' }}
                    render={({ field }) => (
                    <CustomTextField
                        select
                        fullWidth
                        label={
                        <>
                            Status<span className="text-red-500">*</span>
                        </>
                        }
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ''}
                        error={!!errors.status_referensi_id}
                        helperText={errors.status_referensi_id?.message ?? undefined}
                    >
                        <MenuItem value="">Pilih Status</MenuItem>
                        {dataMasterStatus?.map((status) => (
                        <MenuItem key={status.id} value={status.id}>
                            {status.deskripsi1}
                        </MenuItem>
                        ))}
                    </CustomTextField>
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

export default AddMasterCustomerPage;
