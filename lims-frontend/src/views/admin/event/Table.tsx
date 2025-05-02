import React, { useMemo } from "react";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  filterFns,
} from "@tanstack/react-table";
import { IEvent } from "../../../interface/admin/event";
import { useEventTable } from "../../../hooks/data/useEventData";
import { useEventForm } from "../../../hooks/forms/admin/useEventForm";
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
import { useDeleteEvent } from "../../../hooks/mutation/admin/event/useDeleteEvent";

// Action buttons for each row
const ActionColumn = ({
  row,
  refetch,
}: {
  row: IEvent;
  refetch: () => void;
}) => {
  const { setSelected, setOpen } = useEventForm();
  const { mutateAsync } = useDeleteEvent();
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
        window.location.reload()
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

export default function EventTable() {
  const {
    data,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalData,
    refetch,
  } = useEventTable();
  const tableData = useMemo(() => data?.data || [], [data]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
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
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Caption</TableCell>
              <TableCell>Preview Image</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row: IEvent) => (
              <TableRow key={row.id}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.status == 1 ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>{row.content}</TableCell>
                <TableCell>
                  {row.image_url && (
                    <Image
                      src={String(row.image_url)}
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
