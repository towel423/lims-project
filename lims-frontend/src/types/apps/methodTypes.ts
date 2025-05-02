export type MethodType = {
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    id: number;
    kode_sni: string | null;
    judul: string | null;
    lampiran: File | string | null;
    kategori_kode: string | null;
    sorting: number | null;
    kategori_referensi_id: ReferenceCategoryId | null | number;
    uuid: string;
}

export type ReferenceCategoryId = {
    createdAt: string;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    id: number;
    kode_kategori: string | null;
    kode: string | null;
    deskripsi1: string | null;
    deskripsi2: string | null;
    grouping: string | null;
    uuid: string;
}