import React, { useMemo } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  filterFns,
} from "@tanstack/react-table";
import { ITeam } from "../../../interface/admin/team";
import { useTeamTable } from "../../../hooks/data/useTeamData";
import { useTeamForm } from "../../../hooks/forms/admin/useTeamForm";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TableContainer,
} from "@mui/material";
import Image from "next/image";
import withReactContent from "sweetalert2-react-content";
import Swal, { SweetAlertResult } from "sweetalert2";
import { useDeleteTeam } from "../../../hooks/mutation/admin/team/useDeleteTeam";

// Action buttons for each row
const ActionColumn = ({
  row,
  refetch,
}: {
  row: ITeam;
  refetch: () => void;
}) => {
  const { setSelected, setOpen } = useTeamForm();
  const { mutateAsync } = useDeleteTeam();
  const onEdit = () => {
    setSelected(String(row.uuid));
    setOpen(true);
  };

  const onDelete = () => {
    const SwalWithReactContent = withReactContent(Swal);
    SwalWithReactContent.fire({
      title: "Are you sure?",
      text: "The process cannot be undo",
      icon: "question",
      showCancelButton: true, // Menampilkan tombol batal
      confirmButtonText: "Yes, proceed!", // Teks tombol konfirmasi
      cancelButtonText: "No, cancel", // Teks tombol batal
      reverseButtons: true, // Membalik posisi tombol konfirmasi dan batal
    }).then((result: SweetAlertResult) => {
      // Jika pengguna mengklik konfirmasi
      if (result.isConfirmed) {
        mutateAsync(String(row.uuid));
        refetch();
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="contained" color="warning" onClick={onEdit}>
        Edit
      </Button>
      <Button variant="contained" color="error" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
};

export default function TeamTable() {
  const {
    data,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalData,
    refetch,
  } = useTeamTable();
  const tableData = useMemo(() => data?.data || [], [data]);

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
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row: ITeam) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.position}</TableCell>
                <TableCell>
                  <Image
                    src={String(row.photo)}
                    width="400"
                    height="350"
                    alt={`Image ${row.name}`}
                  />
                </TableCell>
                <TableCell>
                  <ActionColumn row={row} refetch={refetch} />
                </TableCell>
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
  );
}
