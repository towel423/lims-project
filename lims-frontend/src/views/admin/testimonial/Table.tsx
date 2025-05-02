import React, { useMemo } from "react";
import { ITestimonial } from "../../../interface/admin/testimonial";
import { useTestimonialTable } from "../../../hooks/data/useTestimonialData";
import { useTestimonialForm } from "../../../hooks/forms/admin/useTestimonialForm";
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
import { useDeleteTestimonial } from "../../../hooks/mutation/admin/testimonial/useDeleteTestimonial";
import Image from "next/image";

// Action buttons for each row
const ActionColumn = ({
  row,
  refetch,
}: {
  row: ITestimonial;
  refetch: () => void;
}) => {
  const { setSelected, setOpen } = useTestimonialForm();
  const { mutateAsync } = useDeleteTestimonial();

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

export default function TestimonialTable() {
  const {
    data,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalData,
    refetch,
  } = useTestimonialTable();

  const tableData = useMemo(() => data?.data || [], [data]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1);
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
              <TableCell>Content</TableCell>
              <TableCell>Preview Image</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row: ITestimonial) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.content}</TableCell>
                <TableCell>
                  <Image
                    src={String(row.image_url)}
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
        page={currentPage - 1} // Current page
        onPageChange={handleChangePage} // Function to handle page change
        rowsPerPage={pageSize} // Rows per page
        onRowsPerPageChange={handleChangeRowsPerPage} // Handle changing rows per page
        rowsPerPageOptions={[10, 25, 50]} // Options for number of rows per page
      />
    </Paper>
  );
}
