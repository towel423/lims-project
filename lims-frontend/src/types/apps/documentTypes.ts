export type DocumentsType = {
    id?: number
    uuid: string
    document_name: string
    description: string
    document_number?:  string
    clause_number?: string
    revision_number?: number
    publish_date: string
    page_count: number
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
    document_type_id: number
    document_category_id: number
    sequence_number?: number
    status_document_id: number
    created_by?: number
    category_name: string
    category_prefix: string
    type_name: string
    type_prefix: string
    status_name: string
    is_creator?: boolean
}

export type DocumentTypeDatatable = {
    uuid: string
    type_prefix: string
    document_number:  string
    revision_number: number
    publish_date: string
    status_name: string
    created_at?: string
}

export type DocumentsField = {
    uuid?: string
    document_name: string
    description: string
    document_number?: string
    clause_number?: string
    revision_number?: number | string 
    publish_date: Date | null | string
    page_count: number | string
    document_type_id: number | string
    document_category_id: number | string
    sequence_number?: number | string
    status_id?: number | string
    file: File | null | undefined
}

export type DocumentDetailField = {
    uuid?: string
    document_name: string
    description: string
    document_number?: string
    clause_number?: string
    revision_number?: number | string 
    publish_date: null | string
    page_count: number | string
    document_type_name: string | null
    document_category_name: string | null
    sequence_number?: number | string
    status_id?: number | string
    file: File | null
    id: string | number
    is_creator?: boolean
    
}


export type FileMasterType = {
    document_name: string
    casbin_rule: {}
}

export type RelatedDocumentType = {
    uuid: string,
    document_control_uuid: string,
    document_type_prefix: string,
    document_category_prefix: string,
    id: string,
    no_document:  string,
    file: string,
    is_creator: boolean
}

export type DocumentHistoryType = {
    uuid: string,
    version: string | number,
    note: string,
    file: string
    status_document:  string,
    date: string
}

export type DocumentLogType = {
    uuid: string,
    version: string | number,
    status_name:  string,
    user_name:  string,
    date: string
    catatan: string | null
}
