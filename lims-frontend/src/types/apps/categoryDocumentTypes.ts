export type CategoryDocumentsType = {
    uuid?: string | null
    name: string | null
    prefix: string
    role_has_rules?: ActionRoleType[] | null
}

export type ActionRoleType = {
    role_guard_name: string
    action: string
}

export type CategoryDocumentsField = {
    name: string
    prefix: string
    role_has_rules?: ActionRoleType[]
}
