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
import { DocumentDetailField, DocumentsType, FileMasterType } from '@/types/apps/documentTypes'
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
import { styled } from '@mui/material/styles'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { FilePermissionFormType, FilePermissionType } from '@/types/apps/filePermissionTypes'
import ModalFilePermission from './layouts/ModalFilePermission'
import { RoleType } from '@/types/apps/roleTypes'
import ModalDelete from './layouts/ModalDelete'
// import DialogsConfirmation from './ModalDelete'
// Vars
// const initialData: DocumentDetailField = {
// //   uuid: '',
// }

type TabKeys = 'file-permission';

type Props = {
    isLoading: boolean
    FilePermissionData?: FilePermissionType[]
    selectListRoles: RoleType[]
    addRole: (data: FilePermissionFormType) => Promise<{ status: number; message: string } | void>
    deleteFilePermission: (data: Partial<FilePermissionFormType>) => Promise<{ status: number; message: string } | void>
};

type FilePermissionTypeWithAction = FilePermissionType & {
  grant: string
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

const columnHelper = createColumnHelper<FilePermissionTypeWithAction>();


const formattedFileName = (fileName: string) => {
  return fileName.split('/').at(-1);
}

const FilePermissionTable: React.FC<Props> = ({ FilePermissionData, selectListRoles, addRole, deleteFilePermission, isLoading }) => {

    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState(FilePermissionData)
    const [filteredData, setFilteredData] = useState(data)
    const [globalFilter, setGlobalFilter] = useState('')
    const [isModalRolesOpen, setIsModalRolesOpen] = useState(false)
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<Partial<FilePermissionFormType> | null>(null);
    const params = useParams();
    const { uuid } = params;
    
    useEffect(() => {
      setData(FilePermissionData);
    }, [FilePermissionData]);
  
    useEffect(() => {
      setFilteredData(data);
    }, [data]);

    const actionDelete = () => {
 
      if (selectedData?.guard_name && typeof uuid === 'string') {
        deleteFilePermission({ uuid, guard_name: selectedData.guard_name });
        setSelectedData(null);
        setIsModalDeleteOpen(false);
      }
    };


    const columns = useMemo<ColumnDef<FilePermissionTypeWithAction, any>[]>(() => [
        columnHelper.accessor('role', {
          header: 'Role',
          cell: ({ row }) => <Typography>{row.original.role}</Typography>
        }),
        columnHelper.accessor('grant', {
          header: 'No Dokumen',
          cell: ({ row }) => <Typography> Yes </Typography>
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
                    text: 'Delete',
                    icon: 'tabler-trash', 
                    menuItemProps: {
                      className: 'flex items-center gap-2 text-red-600',
                      onClick: () => handleOpenModalDelete({ guard_name: row.original.role }),

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
        data: filteredData as FilePermissionType[],
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

      const handleCloseModalDelete = () => {
        setSelectedData(null);
        setIsModalDeleteOpen(false);
      };

      const handleOpenModalDelete = (data: Partial<FilePermissionFormType>) => {
        setSelectedData(data);
        setIsModalDeleteOpen(true);
      };


    return (
      <>      
        <Card>
            <CardHeader title='File Permission' className='pbe-4' />
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
                    <Button
                    variant='contained'
                    startIcon={<i className='tabler-plus' />}
                    onClick={() => setIsModalRolesOpen(true)}
                    className='max-sm:is-full'
                    >
                    Tambah File Permission
                    </Button>
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
                                  <th key={header.id}>
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
        <ModalFilePermission
          isOpen={isModalRolesOpen}
          setIsOpen={setIsModalRolesOpen}
          selectListRoles={selectListRoles}
          addRole={addRole}
          // selectedData={selectedDataApprove} 
          // addApprovalDocument={addApprovalDocument}
        />

        <ModalDelete
          selectedData={selectedData}
          open={isModalDeleteOpen}
          handleClose={handleCloseModalDelete}
          modalTitle="Hapus File Permission?"
          modalBody={`Apakah Anda yakin ingin menghapus file permission dengan role "${selectedData?.guard_name ?? 'Data tidak tersedia'}"? Tindakan ini tidak dapat dibatalkan.`}
          handleConfirm={actionDelete}
        />
      </>
    );
};

export default FilePermissionTable;
