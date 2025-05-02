import { ProvinceType } from "./provinceTypes"

export type CityType = {
    createdAt: string,
    updatedAt: string,
    createdBy: number,
    updatedBy: number,
    id: number,
    uuid: string,
    nama_kota: string,
    kode_propinsi: ProvinceType
}