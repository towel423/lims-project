export type TypeDocumentsType = {
    uuid?: string | null
    name: string | null
    prefix: string | null
    document_category_id?: number | string
    role_has_rules?: ActionRoleType[] | null
}

export type ActionRoleType = {
    role_guard_name: string
    action: string
}

export type TypeDocumentsField = {
    name: string
    prefix: string
    document_category_id?: number | string
    role_has_rules?: ActionRoleType[]
}
