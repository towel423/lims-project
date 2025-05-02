import CustomTextField from "@/@core/components/mui/TextField";
import { MenuItem } from "@mui/material";

interface TablePaginationComponentCustomProps {
    pagination: { currentPage: number; perPage: number; totalPages: number; totalRecords: number; };
    setPagination: (pagination: { currentPage: number; perPage: number; totalPages: number; totalRecords: number; }) => void;
}
const PerPageComponentCustom: React.FC<TablePaginationComponentCustomProps> = ({
    pagination,
    setPagination,
}) => {
    return (
        <CustomTextField
            select
            value={pagination.perPage}
            onChange={(e) => {
                const newPerPage = Number(e.target.value);
                setPagination({ ...pagination, perPage: newPerPage });
            }}
            className="max-sm:is-full sm:w-[70px]"
        >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
        </CustomTextField>
    )
}

export default PerPageComponentCustom;