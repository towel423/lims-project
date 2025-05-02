export type ExternalDocumentsType = {
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
    created_by?: number
    category_name: string
    category_prefix: string
    type_name: string
    type_prefix: string
}


export type ExternalDocumentTypeDatatable = {
    uuid: string
    type_prefix: string
    document_number:  string
    revision_number: number
    publish_date: string
}

export type ExternalDocumentsField = {
    document_name: string
    description: string
    document_number?: string
    clause_number?: string
    revision_number?: number
    publish_date: string
    page_count: number
    document_type_id: number
    document_category_id: number
    sequence_number?: number
    file: File
}
