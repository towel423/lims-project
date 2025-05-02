'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { useForm, Controller } from 'react-hook-form'
import { Box, ButtonGroup, CardHeader, CircularProgress, MenuItem, TablePagination, TextFieldProps, Typography } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { useParams, useRouter } from 'next/navigation'
import { useDocumentStore } from '@/hooks/document/store'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { DocumentDetailField, FileMasterType, DocumentLogType } from '@/types/apps/documentTypes'
import { toast } from 'react-toastify'
import { indonesiaFormattedDate } from '@/helpers/helper'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import OptionMenu from '@/@core/components/option-menu'


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
import { styled } from '@mui/material/styles'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
// import DialogsConfirmation from './ModalDelete'
// Vars
// const initialData: DocumentDetailField = {
// //   uuid: '',
// }

type TabKeys = 'document-log';

type Props = {
    isLoading: boolean
    DocumentLogData: DocumentLogType[]
};

type DocumentLogTypeWithAction = DocumentLogType & {
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

const columnHelper = createColumnHelper<DocumentLogTypeWithAction>();


const formattedFileName = (fileName: string) => {
  return fileName.split('/').at(-1);
}

const DocumentLogTable: React.FC<Props> = ({ DocumentLogData, isLoading }) => {

    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState<DocumentLogType[]>([])
    const [filteredData, setFilteredData] = useState<DocumentLogType[]>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    // const [selectedData, setSelectedData] = useState<StatusDocumentsType | null>(null);
    
    useEffect(() => {
      setData(DocumentLogData);
    }, [DocumentLogData]);
  
    useEffect(() => {
      setFilteredData(data);
    }, [data]);


    const columns = useMemo<ColumnDef<DocumentLogTypeWithAction, any>[]>(() => [
        columnHelper.accessor('version', {
          header: 'Revisi',
          cell: ({ row }) => <Typography>{row.original.version}</Typography>
        }),
        columnHelper.accessor('status_name', {
          header: 'Status',
          cell: ({ row }) => <Typography>{row.original.status_name}</Typography>
        }),
        columnHelper.accessor('catatan', {
          header: 'Catatan',
          cell: ({ row }) => <Typography>{row.original.catatan}</Typography>
        }),
        columnHelper.accessor('date', {
          header: 'Tanggal',
          cell: ({ row }) => <Typography>{indonesiaFormattedDate(row.original.date, true)}</Typography>
        }),
        columnHelper.accessor('user_name', {
          header: 'User',
          cell: ({ row }) => <Typography>{row.original.user_name}</Typography>
        })
      ], [data, filteredData]);
    
      const table = useReactTable({
        data: filteredData as DocumentLogType[],
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
    <Card>
        <CardHeader title='Log Dokumen' className='pbe-4' />
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
                placeholder='Search Document'
                className='max-sm:is-full'
                />
                
            </div>
            </div>
            <div className='overflow-x-auto'>
              { isLoading ? (
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

                      {table?.getFilteredRowModel()?.rows?.length === 0 ? (
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
            count={table?.getFilteredRowModel()?.rows?.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => {
                table.setPageIndex(page)
            }}
            />
    </Card>
    );
};

export default DocumentLogTable;
