// @ts-nocheck
"use client";

// React Imports
import { useState, useEffect } from "react";

// MUI Imports
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

// Component Imports
import CustomTextField from "@core/components/mui/TextField";

// Style Imports
import tableStyles from "@core/styles/table.module.css";
import DialogCloseButton from "../../../components/dialogs/DialogCloseButton";
import { useDetailRolesData } from "../../../hooks/data/useDetailRolesData";
import {
  IRolesPermission,
  PermissionAction,
} from "../../../interface/admin/roles";
import { slugToNormalText } from "../../../utils/string";
import { Controller } from "react-hook-form";
import { useRolesForm } from "../../../hooks/forms/admin/useRolesForm";
import { useUpdateRules } from "../../../hooks/mutation/admin/roles/useUpdateRules";
import { AdminRolesValues } from "../../../schema/admin/roles";
import { useDataPermissionAction } from "../../../hooks/data/useDataPermissionAction";
import { useCreateRoles } from "../../../hooks/mutation/admin/roles/useCreateRoles";

type RoleDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
};

const RolesManagementRoleDialog = ({
  open,
  setOpen,
  title,
}: RoleDialogProps) => {
  const { data, selected, form, refetch, isError, setSelected } =
    useRolesForm();
  const { mutateAsync } = useUpdateRules();
  const { errors } = form.formState; // Get errors from form state
  const { mutateAsync: CreateRoles } = useCreateRoles();
  const { data: actiondata } = useDataPermissionAction();

  const onSubmit = async (values: AdminRolesValues) => {
    try {
      values.data.role_guard_name = values.data.name.toLocaleLowerCase();
      if (!selected) {
        const rulesdata: any = [];
        values.data.permissions.map((item: IRolesPermission) => {
          rulesdata.push({
            rule_policy: item.rule_policy,
            action: item.action,
            active: true,
          });
        });
        const payload = {
          role_guard_name: values.data.role_guard_name,
          rules: rulesdata,
        };
        await CreateRoles(payload);
      } else {
        await mutateAsync(values); // Send data to the mutation function
      }
      setOpen(false); // Close the dialog after successful submit
    } catch (error) {
      console.error("Error updating role", error);
    }
    if (selected) {
      refetch();
    }
    form.reset(); // Reset form setelah submit
  };
  useEffect(() => {
    if (isError) {
      handleClose();
    }
  }, [isError]);

  const handleClose = () => {
    setOpen(false);
    setSelected("");
  };
  const permissions = data?.permissions || form.getValues("data.permissions");
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "data.name") {
        form.setValue(
          "data.role_guard_name",
          value.data?.name?.toLowerCase() || ""
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      scroll="body"
      open={open}
      onClose={handleClose}
      sx={{ "& .MuiDialog-paper": { overflow: "visible" } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className="tabler-x" />
      </DialogCloseButton>
      <DialogTitle
        variant="h4"
        className="flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16"
      >
        {title ? "Edit Role" : "Add Role"}
        <Typography component="span" className="flex flex-col text-center">
          Set Role Permissions
        </Typography>
      </DialogTitle>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent className="overflow-visible flex flex-col gap-6 pbs-0 sm:pli-16">
          <Controller
            name="data.name"
            control={form.control}
            defaultValue={data?.name}
            render={({ field }) => (
              <CustomTextField
                label="Role Name"
                variant="outlined"
                fullWidth
                placeholder="Enter Role Name"
                {...field}
              />
            )}
          />
          <Typography variant="h5" className="min-is-[225px]">
            Role Permissions
          </Typography>
        </DialogContent>
        <div className="overflow-x-auto">
          <table
            style={{
              width: "900px",
              paddingRight: "16px",
              paddingLeft: "16px",
            }}
          >
            <tbody>
              <tr className="border-bs-0">
                <th className="pis-0">
                  <Typography
                    color="text.primary"
                    className="font-medium whitespace-nowrap flex-grow min-is-[225px]"
                  >
                    Administrator Access
                  </Typography>
                </th>
                <th className="!text-end pie-0">
                  <FormControlLabel
                    className="mie-0 capitalize"
                    control={
                      <Checkbox
                      // onChange={handleSelectAllCheckbox}
                      // indeterminate={isIndeterminateCheckbox}
                      // checked={selectedCheckbox.length === defaultData.length * 3}
                      />
                    }
                    label="Select All"
                  />
                </th>
              </tr>
              {permissions && permissions.length > 0 ? (
                permissions.map((item: IRolesPermission, index: number) => (
                  <tr key={index} className="border-be">
                    <td className="pis-0">
                      <Typography
                        className="font-medium whitespace-nowrap flex-grow min-is-[225px]"
                        color="text.primary"
                      >
                        {slugToNormalText(item.rule_policy)}
                      </Typography>
                    </td>
                    <td className="!text-end pie-0">
                      <FormGroup className="flex-row justify-end flex-nowrap gap-6">
                        {(actiondata?.data || []).map(action => (
                          <Controller
                            key={action}
                            name={
                              `data.permissions.${index}.action.${action}` as keyof PermissionAction
                            }
                            defaultValue={
                              data?.permissions[index]?.action[
                                action
                              ] as unknown as boolean
                            }
                            control={form.control}
                            render={({ field }) => (
                              <FormControlLabel
                                className="mie-0"
                                control={
                                  <Checkbox {...field} checked={field.value} />
                                }
                                label={
                                  action.charAt(0).toUpperCase() +
                                  action.slice(1)
                                }
                              />
                            )}
                          />
                        ))}
                        <Controller
                          key="rule_policy"
                          name={`data.permissions.${index}.rule_policy`}
                          defaultValue={form.watch(
                            `data.permissions.${index}.rule_policy`,
                            item.rule_policy
                          )}
                          control={form.control}
                          render={({ field }) => (
                            <input type="hidden" {...field} />
                          )}
                        />
                      </FormGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No permissions available for this role.
                </Typography>
              )}
            </tbody>
          </table>
        </div>
        <Controller
          key="role_guard_name"
          name={`data.role_guard_name`}
          control={form.control}
          render={({ field }) => <input type="hidden" {...field} />}
        />
        <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
          <Button variant="contained" type="submit">
            Submit
          </Button>
          <Button
            variant="tonal"
            type="reset"
            color="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RolesManagementRoleDialog;
