export type FilePermissionType = {
    role : string
    action: string
}

export type FilePermissionFormType = {
    uuid: string
    guard_name: string
    role?: string
}