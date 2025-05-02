'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// Component Imports
import Form from '@components/Form'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useEffect, useState } from 'react'
import { useDocumentTypeStore } from '@/hooks/document-type/store'
import { TypeDocumentsField, TypeDocumentsType } from '@/types/apps/typeDocumentTypes'
import { toast } from 'react-toastify'
import { useParams, useRouter } from 'next/navigation'
import { RoleActionMasterType } from '@/types/apps/roleActionMasterTypes'

// Types
type TableDataType = string[]
type Role = string[]

const roles: Role = [
  "manajer-teknis",
  "manajer-puncak",
  "teknisi",
  "manajer-mutu",
  "user",
  "administrator",
  "admin"
]

// Data for table headers
const tableData: TableDataType = [
  "draft",
  "create-by-admin",
  "published",
  "delete-role",
  "add-role",
  "activate-by-admin",
  "delete",
  "update",
  "create",
  "approved",
  "update-by-admin",
  "delete-by-admin",
  "read",
  "deactivate-by-admin",
  "read-detail"
]

type TabKeys = 'general-info' | 'access-role';
type Props = {
  formTitle: string;
  handleChangeTab: (event: any, data: TabKeys) => void;
  addTypeDocument?: (data: TypeDocumentsField) => Promise<{ status: number; message: string } | undefined>;
  updateTypeDocument?: (data: TypeDocumentsType) => Promise<{ status: number; message: string } | undefined>;
  dataMasterRoleAction: RoleActionMasterType;
}

// Sticky style for the first column
const stickyStyle = {
  position: 'sticky' as const,
  left: 0,
  backgroundColor: '#fff',
  zIndex: 1,
  borderRight: '1px solid #ddd',
}

const AccessRoleForm = (props: Props) => {
  const { formTitle, handleChangeTab, addTypeDocument, updateTypeDocument, dataMasterRoleAction } = props

  const router = useRouter();
  const params = useParams();
  const { lang: locale } = params;

  // Zustand store
  const changeDocumentType = useDocumentTypeStore((state: any) => state.changeDocumentType);
  const documentTypeData = useDocumentTypeStore((state: any) => state.documentType);

  // State to track checked permissions for each role and action
  const [rolePermissions, setRolePermissions] = useState<{ [role: string]: string[] }>({})

  // Toggle checkbox state for a specific role and action
  const handleCheckboxChange = (role: string, action: string) => {
    setRolePermissions(prevPermissions => {
      const updatedPermissions = { ...prevPermissions }
      const roleActions = updatedPermissions[role] || []

      // If action is not already selected, add it
      if (!roleActions.includes(action)) {
        updatedPermissions[role] = [...roleActions, action]
      } else {
        // If action is already selected, remove it
        updatedPermissions[role] = roleActions.filter(a => a !== action)
      }

      return updatedPermissions
    })
  }

  // Prepare and log data on save
  const handleSave = async () => {
    const roleHasRules = Object.entries(rolePermissions).flatMap(([role, actions]) =>
      actions.map(action => ({
        role_guard_name: role,
        action
      }))
    );

    const accessRole = {
      "role_has_rules": roleHasRules
    }

    await changeDocumentType(accessRole);

    if (addTypeDocument) { // change to if not an edit
      let response = await addTypeDocument({ name: documentTypeData.name, prefix: documentTypeData.prefix, role_has_rules: roleHasRules, document_category_id: documentTypeData.document_category_id});
      if (response?.status == 201) {
        toast.success("Successfully add document type!", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => router.push(`/${locale}/admin/master/document-type`),
        });
      } else {
        toast.error(response?.message, {
          position: "top-right",
          autoClose: 2000,
          onClose: () => router.push(`/${locale}/admin/master/document-type/add`),
        });
      }
    }else if(updateTypeDocument){
      let response = await updateTypeDocument({ name: documentTypeData.name, prefix: documentTypeData.prefix, role_has_rules: roleHasRules, uuid: documentTypeData.uuid, document_category_id: documentTypeData.document_category_id });
      if (response?.status == 200) {
        toast.success("Successfully edit document type!", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => router.push(`/${locale}/admin/master/document-type`),
        });
      } else {
        toast.error(response?.message, {
          position: "top-right",
          autoClose: 2000,
          onClose: () => router.push(`/${locale}/admin/master/document-type`),
        });
      }
    }

  }


  useEffect(() => {
    if (formTitle.toLowerCase().includes('add')) {
      // Reset all role permissions when the form is for adding
      setRolePermissions({});
    } else if (documentTypeData.role_has_rules) {
      // Populate initial permissions for edit form
      const initialPermissions: { [role: string]: string[] } = {};
  
      documentTypeData.role_has_rules.forEach((rule: any) => {
        const { role_guard_name, action } = rule;
        if (!initialPermissions[role_guard_name]) {
          initialPermissions[role_guard_name] = [];
        }
        initialPermissions[role_guard_name].push(action);
      });
  
      setRolePermissions(initialPermissions);
    }
  }, [formTitle, documentTypeData.role_has_rules]);
  
  

  return (
    <Card>
      <CardHeader
        title={formTitle}
        subheader="Access Role"
      />

      <Form>
        <div className="overflow-x-auto">
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th style={stickyStyle} className="text-center font-extrabold">
                  #
                </th>
                {dataMasterRoleAction?.action.map((data, index) => (
                  <th key={data} className="text-center">{data}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* {dataMasterRoleAction?.role.map((role) => (
                <tr key={role}>
                  <td style={stickyStyle}>
                    <Typography color="text.primary">{role}</Typography>
                  </td>
                  {dataMasterRoleAction?.action.map((action, idx) => (
                    <td key={action} className="text-center">
                      <Checkbox
                        checked={rolePermissions[role]?.includes(action) || false}
                        onChange={() => handleCheckboxChange(role, action)}
                      />
                    </td>
                  ))}
                </tr>
              ))} */}
              {dataMasterRoleAction?.role.map((role) => (
                <tr key={role}>
                  <td style={stickyStyle}>
                    <Typography color="text.primary">{role}</Typography>
                  </td>
                  {dataMasterRoleAction?.action.map((action, idx) => (
                    <td key={action} className="text-center">
                      <Checkbox
                        checked={rolePermissions[role]?.includes(action) || false}
                        onChange={() => handleCheckboxChange(role, action)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardContent>
          <Grid item xs={12} className="flex gap-4 flex-wrap">
            <Button variant="contained" type="button" onClick={handleSave}>
              Save
            </Button>
            <Button variant='outlined' color="secondary" type="reset" onClick={() => { handleChangeTab(null, 'general-info') }}>
              Back
            </Button>
          </Grid>
        </CardContent>
      </Form>
    </Card>
  )
}

export default AccessRoleForm
