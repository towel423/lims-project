import React, { useMemo } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  filterFns,
} from "@tanstack/react-table";
import { IPublication } from "../../../interface/admin/publication";
import { usePublicationTable } from "../../../hooks/data/usePublicationData";
import { usePublicationForm } from "../../../hooks/forms/admin/usePublicationForm";
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
import { useDeletePublication } from "../../../hooks/mutation/admin/publication/useDeletePublication";

// Action buttons for each row
const ActionColumn = ({
  row,
  refetch,
}: {
  row: IPublication;
  refetch: () => void;
}) => {
  const { setSelected, setOpen } = usePublicationForm();
  const { mutateAsync } = useDeletePublication();
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

export default function PublicationTable() {
  const {
    data,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalData,
    refetch,
  } = usePublicationTable();
  const tableData = useMemo(() => data?.data || [], [data]);

  // Handle page change
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1); // Tambahkan 1 untuk menyesuaikan dengan backend (1-based index)
  };


  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Handle perubahan jumlah baris per halaman
   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
     setPageSize(parseInt(event.target.value, 10));
     setCurrentPage(1); // Reset ke halaman pertama
   };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Caption</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Preview Image</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row: IPublication) => (
              <TableRow key={row.id}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.status == "1" ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>{row.caption}</TableCell>
                <TableCell>{row.category?.name}</TableCell>
                <TableCell>{formatDate(row.created_at || "")}</TableCell>
                <TableCell>
                  {row.img && (
                    <Image
                      src={String(row.img)}
                      width={200}
                      height={250}
                      alt={`Image ${row.title}`}
                    />
                  )}
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
        page={currentPage - 1} // Current page
        onPageChange={handleChangePage} // Function to handle page change
        rowsPerPage={pageSize} // Rows per page
        onRowsPerPageChange={handleChangeRowsPerPage} // Handle changing rows per page
        rowsPerPageOptions={[10, 25, 50]} // Options for number of rows per page
      />
    </Paper>
  );
}
