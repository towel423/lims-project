import {
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";
import CustomTextField from "../../../@core/components/mui/TextField";
import { useRolesTable } from "../../../hooks/data/useRolesTable";
import { IUser } from "../../../interface/admin/user";
import Link from "next/link";
import OptionMenu from "../../../@core/components/option-menu";
import { useRolesData } from "../../../hooks/data/useRolesData";
import { IRoles } from "../../../interface/admin/roles";

export default function RolesTable() {
  const {
    data,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalData,
    refetch,
  } = useRolesTable();

  const tableData = useMemo(() => data?.data || [], [data]);

  const { data: roleList } = useRolesData();

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(0); // Reset to first page when page size changes
  };
  return (
    <Card>
      <CardContent className="flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center">
        {/* <div className="flex items-center gap-2">
          <Typography>Show</Typography>
          <CustomTextField
            select
            value={10}
            onChange={handleChangeRowsPerPage}
            className="max-sm:is-full sm:is-[70px]"
          >
            <MenuItem value="10">10</MenuItem>
            <MenuItem value="25">25</MenuItem>
            <MenuItem value="50">50</MenuItem>
          </CustomTextField>
        </div> */}
        {/* <div className="flex gap-4 flex-col !items-start max-sm:is-full sm:flex-row sm:items-center">
          <CustomTextField
            select
            value=""
            //   onChange={e => setRole(e.target.value)}
            id="roles-app-role-select"
            className="max-sm:is-full sm:is-[160px]"
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="" selected>
              Select Role
            </MenuItem>
            {roleList?.map((role: IRoles) => (
              <MenuItem value={role.name}>{role.name}</MenuItem>
            ))}
          </CustomTextField>
        </div> */}
      </CardContent>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fullname</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                {/* <TableCell>Actions</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row: IUser) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.fullname}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  {/* <TableCell>
                    <div className="flex items-center">
                      <IconButton>
                        <Link href={"#"} className="flex">
                          <i className="tabler-edit text-textSecondary" />
                        </Link>
                      </IconButton>
                      <IconButton>
                        <Link href={"#"} className="flex">
                          <i className="tabler-eye text-textSecondary" />
                        </Link>
                      </IconButton>
                      <IconButton>
                        <i className="tabler-trash text-textSecondary" />
                      </IconButton>
                    </div>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination controls */}
        <TablePagination
          component="div"
          count={totalData} // Total number of rows
          page={currentPage} // Current page
          onPageChange={handleChangePage} // Function to handle page change
          rowsPerPage={pageSize} // Rows per page
          onRowsPerPageChange={handleChangeRowsPerPage} // Handle changing rows per page
          rowsPerPageOptions={[10, 25, 50]} // Options for number of rows per page
        />
      </Paper>
    </Card>
  );
}
