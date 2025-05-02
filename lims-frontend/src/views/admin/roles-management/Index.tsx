import { Grid, Typography } from "@mui/material";
import React from "react";
import RolesManagementRoleCards from "./RoleCards";
import RolesTable from "./RolesTable";

export default function ViewAdminRoleManagementIndex() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant="h4" className="mbe-1">
          Roles List
        </Typography>
        <Typography>
          A role provided access to predefined menus and features so that
          depending on assigned role an administrator can have access to what he
          need
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <RolesManagementRoleCards />
      </Grid>
      <Grid item xs={12} className="!pbs-12">
        <Typography variant="h4" className="mbe-1">
          Total users with their roles
        </Typography>
        <Typography>
          Find all of your company&#39;s administrator accounts and their
          associate roles.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <RolesTable />
      </Grid>
    </Grid>
  );
}
