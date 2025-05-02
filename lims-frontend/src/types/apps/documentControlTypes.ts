export type DocumentControlType = {
    clause_number: string | null,
    created_at: string | null,
    created_by: string | number | null,
    deleted_at: string | null,
    description: string | null,
    document_category_id: string | number | null,
    document_category_name: string | null,
    document_category_prefix: string | null,
    document_name: string | null,
    document_number: string | null,
    document_type_id: string | number | null,
    document_type_name: string | null,
    document_type_prefix: string | null,
    id: string | number | null,
    page_count: string | number | null,
    publish_date: string | null,
    revision_number: string | number | null,
    sequence_number: string | number | null,
    status_document_id: string | number | null,
    status_document_name: string | null,
    updated_at: string | null,
    uuid: string | null
}


export type DocumentVersionType = {
    id: string | number | null,
    uuid: string | null,
    file: string | null,
    document_control_id: string | number | null,
    created_at: string | null,
    updated_at: string | null,
    deleted_at: string | null,
    version: string | number | null,
    status_document_id: string | number | null,
    note: string | null,
    is_latest: string | number | null
}


export type DetailDocumentControlType = {
    documentControl: DocumentControlType,
    documentVersions: DocumentVersionType[],
    fileMaster: FileMasterType
}


export type FileMasterType = {
    document_name: string,
    url_file: string,
}


