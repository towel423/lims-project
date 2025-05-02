import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import type { useReactTable } from '@tanstack/react-table';

interface TablePaginationComponentProps {
  table: ReturnType<typeof useReactTable>;
  pagination: { currentPage: number; perPage: string; totalPages: number; totalRecords: number; documentType: string; documentStatus: string };
  setPagination: (pagination: { currentPage: number; perPage: string; totalPages: number; totalRecords: number; documentType: string; documentStatus: string }) => void;
}

const TablePaginationComponentDocument: React.FC<TablePaginationComponentProps> = ({
  table,
  pagination,
  setPagination,
}) => {
  return (
    <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
      {/* Information about the number of entries */}
      <Typography color='text.disabled'>
        {`Showing ${
          pagination.totalRecords === 0
            ? 0
            : pagination.currentPage * Number(pagination.perPage) - Number(pagination.perPage) + 1
        } to ${Math.min(
          pagination.currentPage * Number(pagination.perPage),
          pagination.totalRecords
        )} of ${pagination.totalRecords} entries`}
      </Typography>

      {/* Pagination component */}
      <Pagination
        shape='rounded'
        color='primary'
        variant='tonal'
        count={pagination.totalPages} // Dynamically set total pages
        page={pagination.currentPage} // Use current page from state
        onChange={(_, page) => {
          setPagination({...pagination, currentPage: page});
        }}
        showFirstButton
        showLastButton
      />
    </div>
  );
};

export default TablePaginationComponentDocument;
