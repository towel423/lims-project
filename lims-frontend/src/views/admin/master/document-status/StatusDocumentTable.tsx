'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { StatusDocumentsType } from '@/types/apps/statusDocumentTypes'

// Component Imports
import StatusDrawer from './StatusDrawer'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import DialogsConfirmation from './ModalDelete'
import { Box, CircularProgress } from '@mui/material'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type StatusDocumentsTypeWithAction = StatusDocumentsType & {
  action?: string
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper<StatusDocumentsTypeWithAction>()

interface StatusDocumentTableProps {
  isLoading: boolean
  tableData: StatusDocumentsType[]
  addStatusDocument: (data: string) => void
  deleteStatusDocument: (data: string) => void
  updateStatusDocument: (data: StatusDocumentsType) => void
}

const StatusDocumentTable: React.FC<StatusDocumentTableProps> = ({ tableData, addStatusDocument, deleteStatusDocument, updateStatusDocument, isLoading }) => {
  const [addStatusDocumentOpen, setAddStatusDocumentOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(tableData)
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<StatusDocumentsType | null>(null);
  
  useEffect(() => {
    setData(tableData);
  }, [tableData]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);


  const handleOpenConfirmationDialog = (data: StatusDocumentsType) => {
    setSelectedData(data);
    setConfirmationDialogOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setSelectedData(null);
    setConfirmationDialogOpen(false);
  };

  const handleCloseDrawer = (): void => {
    setSelectedData(null);
    setAddStatusDocumentOpen(!addStatusDocumentOpen);
  }

  const actionDelete = () => {
    if (selectedData) {
      deleteStatusDocument(selectedData.uuid);
      setSelectedData(null);
      setConfirmationDialogOpen(false);
    }
  };

  const editStatusDocument = (data: StatusDocumentsType) => {
    setSelectedData(data);
    setAddStatusDocumentOpen(!addStatusDocumentOpen);
  }

  const actionUpdate = async (newName: string) => {
    if(selectedData) {
      setSelectedData(null);
      updateStatusDocument({uuid: selectedData.uuid, name: newName});
    }
  };

  const columns = useMemo<ColumnDef<StatusDocumentsTypeWithAction, any>[]>(() => [
    columnHelper.accessor('name', {
      header: 'Status Name',
      cell: ({ row }) => <Typography>{row.original.name}</Typography>
    }),
    columnHelper.accessor('action', {
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center'>
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'Edit',
                icon: 'tabler-edit',
                menuItemProps: { 
                  className: 'flex items-center gap-2 text-textSecondary',
                  onClick: () => editStatusDocument({ uuid: row.original.uuid, name: row.original.name }) 
                }
              },
              {
                text: 'Delete',
                icon: 'tabler-trash', 
                menuItemProps: {
                  className: 'flex items-center gap-2 text-red-600',
                  onClick: () => handleOpenConfirmationDialog({ uuid: row.original.uuid, name: row.original.name }),
                }
              }
            ]}
          />
        </div>
      ),
      enableSorting: false
    })
  ], [data, filteredData]);

  const table = useReactTable({
    data: filteredData as StatusDocumentsType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });

  return (
    <>
      <Card>
        <CardHeader title='Document Status' className='pbe-4' />
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Status'
              className='max-sm:is-full'
            />
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddStatusDocumentOpen(!addStatusDocumentOpen)}
              className='max-sm:is-full'
            >
              Add New Status
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
        {isLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} style={header.id === 'name' ? { width: '85%' } : {}}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className="tabler-chevron-up text-xl" />,
                            desc: <i className="tabler-chevron-down text-xl" />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.slice(0, table.getState().pagination.pageSize).map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          )
        }
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <StatusDrawer
        open={addStatusDocumentOpen}
        handleClose={handleCloseDrawer}
        data={selectedData?.name}
        addStatusDocument={addStatusDocument}
        updateStatusDocument={actionUpdate}
      />
      <DialogsConfirmation
        open={confirmationDialogOpen}
        handleClose={handleCloseConfirmationDialog}
        handleConfirm={actionDelete}
        selectedData={selectedData} 
      />
    </>
  );
};

export default StatusDocumentTable;
