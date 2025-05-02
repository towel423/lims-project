import { Box, Grid } from "@mui/material";
import React from "react";
import AdminDashboardBanner from "./Banner";
import AdminDashboardCalendarWrapper from "./CalendarWrapper";
import AdminDashboardPublication from "./Publication";
import MetabaseDashboard from "../../../components/metabase/Dashboard";

export default function ViewAdminDashboard() {
  return (
    <Box>
      <AdminDashboardBanner/>
      <br />
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} sm={6} md={6}>
          <AdminDashboardCalendarWrapper />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <AdminDashboardPublication />
        </Grid>
      </Grid>
      <br />
      <MetabaseDashboard />
    </Box>
  );
}
