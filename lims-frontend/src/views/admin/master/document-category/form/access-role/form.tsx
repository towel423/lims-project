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
import { toast } from 'react-toastify'
import { useParams, useRouter } from 'next/navigation'
import { RoleActionMasterType } from '@/types/apps/roleActionMasterTypes'
import { CategoryDocumentsField, CategoryDocumentsType } from '@/types/apps/categoryDocumentTypes'
import { useDocumentCategoryStore } from '@/hooks/document-category/store'

// Types
type TableDataType = string[]
type Role = string[]

type TabKeys = 'general-info' | 'access-role';
type Props = {
  formTitle: string;
  handleChangeTab: (event: any, data: TabKeys) => void;
  addCategoryDocument?: (data: CategoryDocumentsField) => Promise<{ status: number; message: string } | undefined>;
  updateCategoryDocument?: (data: CategoryDocumentsType) => Promise<{ status: number; message: string } | undefined>;
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
  const { formTitle, handleChangeTab, addCategoryDocument, updateCategoryDocument, dataMasterRoleAction } = props

  const router = useRouter();
  const params = useParams();
  const { lang: locale } = params;

  // Zustand store
  const changeDocumentCategory = useDocumentCategoryStore((state: any) => state.changeDocumentCategory);
  const documentCategoryData = useDocumentCategoryStore((state: any) => state.documentCategory);

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

    await changeDocumentCategory(accessRole);

    if (addCategoryDocument) { // change to if not an edit
      let response = await addCategoryDocument({ name: documentCategoryData.name, prefix: documentCategoryData.prefix, role_has_rules: roleHasRules });
      if (response?.status == 201) {
        toast.success("Successfully add document category!", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => router.push(`/${locale}/admin/master/document-category`),
        });
      } else {
        toast.error(response?.message, {
          position: "top-right",
          autoClose: 2000,
          onClose: () => router.push(`/${locale}/admin/master/document-category/add`),
        });
      }
    } else if (updateCategoryDocument) {
      let response = await updateCategoryDocument({ name: documentCategoryData.name, prefix: documentCategoryData.prefix, role_has_rules: roleHasRules, uuid: documentCategoryData.uuid });
      if (response?.status == 200) {
        toast.success("Successfully edit document category!", {
          position: "top-right",
          autoClose: 2000,
          onClose: () => router.push(`/${locale}/admin/master/document-category`),
        });
      } else {
        toast.error(response?.message, {
          position: "top-right",
          autoClose: 2000,
          onClose: () => router.push(`/${locale}/admin/master/document-category`),
        });
      }
    }

  }


  useEffect(() => {
    if (documentCategoryData.role_has_rules) {
      const initialPermissions: { [role: string]: string[] } = {};

      documentCategoryData.role_has_rules.forEach((rule: any) => {
        const { role_guard_name, action } = rule;
        if (!initialPermissions[role_guard_name]) {
          initialPermissions[role_guard_name] = [];
        }
        initialPermissions[role_guard_name].push(action);
      });

      setRolePermissions(initialPermissions);
    }
  }, [documentCategoryData.role_has_rules]);


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
