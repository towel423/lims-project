export type CustomerType = {
    uuid: string;
    createdAt: string;
    updatedAt: string | null;
    createdBy: string;
    updatedBy: string | null;
    id: number;
    id_pelanggan: string | null;
    nama: string | null;
    telp: string | null;
    alamat: string | null;
    kode_pos: string | number | null;
    npwp: string | null;
    fax: string | null;
    nama_cp: string | null;
    jabatan: string | null;
    email: string | null;
    telp_cp: string | number | null;
    discount: string | number | null;
    jenis_pelanggan_referensi_id: JenisPelangganReferensiIdType | null | number;
    gelar_referensi_id: number | null;
    tipe_pelanggan_referensi_id: number | null;
    kode_kota_id: KodeKotaId | null | number;
    kode_propinsi_id: number | null;
    status_referensi_id: number | null;
}

export type JenisPelangganReferensiIdType = {
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        updatedBy: string | null;
        id: number;
        kode_kategori: string;
        kode: string | null;
        deskripsi1: string;
        deskripsi2: string | null;
        grouping: number | null;
}

export type KodeKotaId = {
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    id: number;
    nama_kota: string;
    kode_propinsi: number;
}