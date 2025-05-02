import CustomTextField from "@/@core/components/mui/TextField";
import { MenuItem } from "@mui/material";

interface TablePaginationComponentProps {
  pagination: { currentPage: number; perPage: string; totalPages: number; totalRecords: number; documentType: string; documentStatus: string };
  setPagination: (pagination: { currentPage: number; perPage: string; totalPages: number; totalRecords: number; documentType: string; documentStatus: string }) => void;
}
const PerPageComponent : React.FC<TablePaginationComponentProps> = ({
  pagination,
  setPagination,
}) => {
    return (
        <CustomTextField
          select
          value={pagination.perPage}
          onChange={(e) => {
            const newPerPage = e.target.value;
            setPagination({...pagination, perPage: newPerPage});
          }}
          className="max-sm:is-full sm:w-[70px]"
        >
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="25">25</MenuItem>
          <MenuItem value="50">50</MenuItem>
        </CustomTextField>
    )
}

export default PerPageComponent;