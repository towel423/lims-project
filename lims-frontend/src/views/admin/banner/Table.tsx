import React, { useMemo } from "react";
import { IBanner } from "../../../interface/admin/banner";
import { useBannerTable } from "../../../hooks/data/useBannerData";
import { useBannerForm } from "../../../hooks/forms/admin/useBannerForm";
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
import withReactContent from "sweetalert2-react-content";
import Swal, { SweetAlertResult } from "sweetalert2";
import { useDeleteBanner } from "../../../hooks/mutation/admin/banner/useDeleteBanner";
import Image from "next/image";

// Action buttons for each row
const ActionColumn = ({
  row,
  refetch,
}: {
  row: IBanner;
  refetch: () => void;
}) => {
  const { setSelected, setOpen } = useBannerForm();
  const { mutateAsync } = useDeleteBanner();

  const onEdit = () => {
    setSelected(String(row.uuid));
    setOpen(true);
  };

  const onDelete = () => {
    const SwalWithReactContent = withReactContent(Swal);
    SwalWithReactContent.fire({
      title: "Are you sure?",
      text: "The process cannot be undone",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result: SweetAlertResult) => {
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

export default function BannerTable() {
  const {
    data,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalData,
    refetch,
  } = useBannerTable();

  const tableData = useMemo(() => data?.data || [], [data]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1); // Tambahkan 1 untuk menyesuaikan dengan backend (1-based index)
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
              <TableCell>Subtitle</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Preview Image</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row: IBanner) => (
              <TableRow key={row.id}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.active == true ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>{row.subtitle}</TableCell>
                <TableCell>{row.link}</TableCell>
                <TableCell>
                  <Image
                    src={row.image_url ? String(row.image_url) : '/images/illustrations/auth/logo_lichems.webp'}
                    width="250"
                    height="150"
                    alt={`Image ${row.title}`}
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
        page={currentPage - 1} // Current page
        onPageChange={handleChangePage} // Function to handle page change
        rowsPerPage={pageSize} // Rows per page
        onRowsPerPageChange={handleChangeRowsPerPage} // Handle changing rows per page
        rowsPerPageOptions={[10, 25, 50]} // Options for number of rows per page
      />
    </Paper>
  );
}
