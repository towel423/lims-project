export type InternalDocumentsType = {
    id?: number
    uuid: string
    document_name?: string
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
}


export type InternalDocumentTypeDatatable = {
    uuid: string
    type_prefix: string
    document_number:  string
    revision_number: number
    publish_date: string
    status_name: string
}

export type InternalDocumentsField = {
    uuid: string
    document_name: string
    description: string
    document_number?: string
    clause_number?: string
    revision_number?: number | string 
    publish_date: Date | null
    page_count: number | string
    document_type_id: number | string
    document_category_id: number | string
    sequence_number?: number | string
    status_id: number | string
    file: File | string
}
