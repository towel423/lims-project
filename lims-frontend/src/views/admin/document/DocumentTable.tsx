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

// Component Imports
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useParams, useRouter } from 'next/navigation'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { InternalDocumentTypeDatatable } from '@/types/apps/internalDocumentTypes'
import { ExternalDocumentTypeDatatable } from '@/types/apps/externalDocumentTypes'
import { DocumentsType, DocumentTypeDatatable } from '@/types/apps/documentTypes'
import ModalApprovalDocument from './ModalApproval'
import { fetchSelectListDocumentType, getSelectListDocumentStatus, getSelectListDocumentType, indonesiaFormattedDate, transformTypeDocuments } from '@/helpers/helper'
import { can } from "@/helpers/permissionHelper";
import { ApprovalDocumentFormType } from '@/types/apps/documentApprovalType'
import ModalDeleteDocument from './ModalDeleteDocument'
import { toast } from 'react-toastify'
import { DocumentStatusSelectListType, DocumentTypeSelectListType } from '@/types/apps/selectListTypes'
import PerPageComponent from './PerPageComponent'
import TablePaginationComponentDocument from '@/components/TablePaginationComponentDocument'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type InternalDocumentsTypeWithAction = InternalDocumentTypeDatatable & {
  action?: string
}

type ExternalDocumentsTypeWithAction = ExternalDocumentTypeDatatable & {
  action?: string
}

type DocumentsTypeWithAction = DocumentTypeDatatable & {
  action?: string
}

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
const columnHelperDocInternal = createColumnHelper<InternalDocumentsTypeWithAction>()
const columnHelperDocExternal = createColumnHelper<ExternalDocumentsTypeWithAction>()
const columnHelperDoc = createColumnHelper<DocumentsTypeWithAction>()

interface InternalDocumentTableProps {
  isLoading: boolean
  docType: string;
  tableData: InternalDocumentTypeDatatable[];
  deleteDocument: (data: string) => Promise<{status: number, message: string} | void>
  approveDocument?: (data: string) => void;
  addApprovalDocument?: (data: ApprovalDocumentFormType) => Promise<{status: number, message: string} | void>
  originPage: string
  setPagination: (pagination: { currentPage: number; perPage: string; totalPages: number; totalRecords: number; documentType: string; documentStatus: string }) => void;
  pagination: { currentPage: number, perPage: string, totalPages: number, totalRecords: number, documentType: string, documentStatus: string  }
}

interface ExternalDocumentTableProps {
  isLoading: boolean
  docType: string;
  tableData: ExternalDocumentTypeDatatable[];
  deleteDocument: (data: string) => Promise<{status: number, message: string} | void>
  approveDocument?: (data: string) => void;
  addApprovalDocument?: (data: ApprovalDocumentFormType) => Promise<{status: number, message: string} | void>
  originPage: string
  setPagination: (pagination: { currentPage: number; perPage: string; totalPages: number; totalRecords: number; documentType: string; documentStatus: string }) => void;
  pagination: { currentPage: number, perPage: string, totalPages: number, totalRecords: number, documentType: string, documentStatus: string  }
}

interface DocumentTableProps {
  isLoading: boolean
  docType: string;
  tableData: DocumentTypeDatatable[];
  deleteDocument?: (data: string) => Promise<{status: number, message: string} | void>
  approveDocument?: (data: string) => void;
  addApprovalDocument?: (data: ApprovalDocumentFormType) => Promise<{status: number, message: string} | void>
  originPage?: string
  setPage?: (page: number) => void
  setPagination: (pagination: { currentPage: number; perPage: string; totalPages: number; totalRecords: number; documentType: string; documentStatus: string }) => void;
  pagination: { currentPage: number, perPage: string, totalPages: number, totalRecords: number, documentType: string, documentStatus: string }
}

const DocumentTable: React.FC<InternalDocumentTableProps | ExternalDocumentTableProps | DocumentTableProps> = ({ tableData, deleteDocument, docType, approveDocument, addApprovalDocument, isLoading, originPage, setPagination, pagination }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(tableData)
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [isModalApprovalOpen, setIsModalApprovalOpen] = useState(false)
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<Partial<InternalDocumentTypeDatatable> | Partial<ExternalDocumentTypeDatatable> | Partial<DocumentTypeDatatable> | null>(null)
  const [selectedDataApprove, setSelectedDataApprove] = useState<ApprovalDocumentFormType | null>(null)
  const [dataMasterDocumentType, setDataMasterDocumentType] = useState<DocumentTypeSelectListType[]>([])
  const [dataMasterDocumentStatus, setDataMasterDocumentStatus] = useState<DocumentStatusSelectListType[]>([])

  const router = useRouter()
  const params = useParams()
  const { lang: locale } = params

  useEffect(() => {
      setData(tableData)
      setFilteredData(tableData)
  }, [tableData])

  useEffect(() => {
    setFilteredData(data)
  }, [data])

  const handleOpenModalDelete = (data: Partial<DocumentsType>) => {
    setSelectedData(data);
    setModalDeleteOpen(true);
  };

  const handleCloseModalDelete = () => {
    setSelectedData(null);
    setModalDeleteOpen(false);
  };

  const actionDelete = async () => {
    if (selectedData?.uuid && deleteDocument) {
      setSelectedData(null);
      setModalDeleteOpen(false);
      
      let response = await deleteDocument(selectedData.uuid);

      if (response?.status == 200) {
        toast.success("Successfully delete document!", {
          position: "top-right",
          autoClose: 2000
        });
      } else {
        toast.error("Failed to delete document!", {
          position: "top-right",
          autoClose: 2000
        });
      }
    }
  };

  const internalColumns = useMemo<ColumnDef<InternalDocumentsTypeWithAction, any>[]>(() => [
    columnHelperDocInternal.accessor('type_prefix', {
      header: 'Jenis',
      cell: ({ row }) => <Typography>{row.original.type_prefix}</Typography>
    }),
    columnHelperDocInternal.accessor('document_number', {
      header: 'No. Dokumen',
      cell: ({ row }) => <Typography>{row.original.document_number}</Typography>
    }),
    columnHelperDocInternal.accessor('publish_date', {
      header: 'Tanggal Terbit',
      cell: ({ row }) => <Typography>{row.original.publish_date}</Typography>
    }),
    columnHelperDocInternal.accessor('status_name', {
      header: 'Status',
      cell: ({ row }) => <Typography>{row.original.status_name}</Typography>
    }),
    columnHelperDocInternal.accessor('action', {
      header: 'Action',
      cell: ({ row }) => {
        const isDraft = row.original.status_name.toLowerCase() === 'draft';
        return (
          <div className="flex items-center">
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName="text-textSecondary"
              options={[
                ...(can("document-control", "read") ? [
                  {
                    text: 'Detail',
                    icon: 'tabler-eye',
                    menuItemProps: {
                      className: 'flex items-center gap-2 text-textSecondary',
                      onClick: () => router.push(`/${locale}/admin/document/${row.original.uuid}`),
                    },
                  },
                ] : []),
                ...(can("document-control", "delete") ? [
                  ...(isDraft
                    ? [
                        {
                          text: 'Delete',
                          icon: 'tabler-trash',
                          menuItemProps: {
                            className: 'flex items-center gap-2 text-red-600',
                            onClick: () => handleOpenModalDelete({ uuid: row.original.uuid, document_number: row.original.document_number }),
                          },
                        },
                      ]
                    : []),
                ] : [])
              ]}
            />
          </div>
        );
      },
      enableSorting: false,
    }),
  ], [data])

  const externalColumns = useMemo<ColumnDef<ExternalDocumentsTypeWithAction, any>[]>(() => [
    columnHelperDocExternal.accessor('type_prefix', {
      header: 'Jenis (External)',
      cell: ({ row }) => <Typography>{row.original.type_prefix}</Typography>
    }),
    columnHelperDocExternal.accessor('document_number', {
      header: 'No. Document (External)',
      cell: ({ row }) => <Typography>{row.original.document_number}</Typography>
    }),
    columnHelperDocExternal.accessor('publish_date', {
      header: 'Tanggal Terbit (External)',
      cell: ({ row }) => <Typography>{row.original.publish_date}</Typography>
    }),
    columnHelperDocExternal.accessor('action', {
      header: 'Action (External)',
      cell: ({ row }) => (
        <div className="flex items-center">
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName="text-textSecondary"
            options={[
              ...(can("document-control", "read") ? [
                {
                  text: 'Detail',
                  icon: 'tabler-eye',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => router.push(`/${locale}/admin/document/${row.original.uuid}`)
                  }
                },
              ] : []),
              // ...(can("document-control", "update") ? [
              //   {
              //     text: 'Edit',
              //     icon: 'tabler-edit',
              //     menuItemProps: {
              //       className: 'flex items-center gap-2 text-textSecondary',
              //       onClick: () => router.push(`/${locale}/admin/master/document/update/${row.original.uuid}`)
              //     }
              //   },
              // ] : []),
              // ...(can("document-control", "delete") ? [
              //   {
              //     text: 'Delete',
              //     icon: 'tabler-trash',
              //     menuItemProps: {
              //       className: 'flex items-center gap-2 text-red-600'
              //       // Add your delete handler here
              //     }
              //   }
              // ] : []),
            ]}
          />
        </div>
      ),
      enableSorting: false
    })
  ], [data])

  const documentColumns = useMemo<ColumnDef<DocumentsTypeWithAction, any>[]>(() => [
    columnHelperDoc.accessor('type_prefix', {
      header: 'Jenis',
      cell: ({ row }) => <Typography>{row.original.type_prefix}</Typography>
    }),
    columnHelperDoc.accessor('document_number', {
      header: 'No. Document',
      cell: ({ row }) => <Typography>{row.original.document_number}</Typography>
    }),
    columnHelperDoc.accessor('revision_number', {
      header: 'Revisi',
      cell: ({ row }) => <Typography>{row.original.revision_number}</Typography>
    }),
    columnHelperDoc.accessor('created_at', {
      header: 'Tanggal Create',
      cell: ({ row }) => <Typography>{row.original.created_at ?? '-'}</Typography>
    }),
    columnHelperDoc.accessor('status_name', {
      header: 'Status',
      cell: ({ row }) => <Typography>{row.original.status_name}</Typography>
    }),
    columnHelperDoc.accessor('action', {
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex items-center">
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName="text-textSecondary"
            options={[
              {
                text: 'Detail',
                icon: 'tabler-eye',
                menuItemProps: {
                  className: 'flex items-center gap-2 text-textSecondary',
                  onClick: () => router.push(`/${locale}/admin/document/${row.original.uuid}`)
                }
              },
              {
                text: 'Approval',
                icon: 'tabler-checklist',
                menuItemProps: {
                  className: 'flex items-center gap-2 text-blue-600',
                  onClick: () => {
                    setSelectedDataApprove({ uuid: row.original.uuid, document_number: row.original.document_number, revision_number: row.original.revision_number });
                    setIsModalApprovalOpen(true)
                  }
                }
              }
            ]}
          />
        </div>
      ),
      enableSorting: false
    })
  ], [data])

  let columns: any = documentColumns;
  let title: string = "Dokumen Internal";

  if(docType === 'draft') {
    columns =  documentColumns;
    title =  "Persetujuan Dokumen";
  } else if (docType === 'internal') {
    columns =  internalColumns;
  } else if (docType === 'external') {
    columns = externalColumns;
    title =  "Dokumen Eksternal";
  }

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      rowSelection,
      globalFilter,
      pagination: {
        pageSize: Number(pagination.perPage),
        pageIndex: 0
      }
    },
    initialState: {
      // pagination: {
      //   pageSize: Number(pagination.perPage),
      //   pageIndex: Number(pagination.currentPage) - 1
      // }
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
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    // onPaginationChange: (updater) => {
    //   const newPagination =
    //     typeof updater === "function"
    //       ? updater({ pageIndex: pagination.currentPage - 1, pageSize: pagination.perPage })
    //       : updater;
  
    //   // Update pagination state
    //   setPagination({
    //     ...pagination,
    //     currentPage: newPagination.pageIndex + 1, // Convert back to 1-based index
    //     perPage: newPagination.pageSize,
    //   });
    // },
  });

  const getSelectListDocumentType = async (documentCategoryId?: string): Promise<DocumentTypeSelectListType[]> => {
      try {
          // Assuming fetchSelectListDocumentType is the function that makes the API request
          const response = await fetchSelectListDocumentType(documentCategoryId);
          let formattedData = transformTypeDocuments(response.data.data.data);
          return formattedData;
      } catch (error) {
          console.error("Error fetching document categories:", error);
          return []; // Return an empty array in case of an error
      }
  };

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      // if (originPage) {
        try {
          const response = await getSelectListDocumentType(originPage);
          setDataMasterDocumentType(response);
        } catch (error) {
          console.error("Error setting document types:", error);
        }
      // }
    };
    const fetchDocumentStatus = async () => {
        try {
          const response = await getSelectListDocumentStatus();
          setDataMasterDocumentStatus(response);
        } catch (error) {
          console.error("Error setting document types:", error);
        }
    };

    fetchDocumentTypes();
    if(originPage){
      fetchDocumentStatus();
    }
  }, []);
  

  return (
    <>
      <Card>
        <CardHeader title={title} className='pbe-4' />
        {/* <TableFilters setData={setFilteredData} tableData={data} /> */}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-2'>
        {/* Grouped CustomTextField components */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
        
          <PerPageComponent 
            pagination={pagination}
            setPagination={setPagination}
          />
          <CustomTextField
            select
            fullWidth
            id='select-jenis-dokumen'
            className='max-sm:is-full sm:w-[200px]' // Adjust width as needed
            value={pagination.documentType}
            onChange={e => setPagination({...pagination, documentType: String(e.target.value)})}
            SelectProps={{ displayEmpty: true }}
          >
            {/* Default option */}
            <MenuItem value='' selected={true}>
              Pilih Jenis Dokumen
            </MenuItem>

            {/* Dynamic options from dataMasterDocumentType */}
            {dataMasterDocumentType.map((docType) => (
              <MenuItem key={docType.id} value={docType.id}>
                {docType.name}
              </MenuItem>
            ))}
          </CustomTextField>

          {
            originPage && (
            <CustomTextField
              select
              fullWidth
              id='select-role'
              className='max-sm:is-full sm:w-[200px]' // Adjust width as needed
              value={pagination.documentStatus}
              onChange={e => setPagination({...pagination, documentStatus: String(e.target.value)})}
              SelectProps={{ displayEmpty: true }}
            >
              {/* Default option */}
              <MenuItem value='' selected={true}>
                Pilih Status Dokumen
              </MenuItem>

              {/* Dynamic options from dataMasterDocumentType */}
              {dataMasterDocumentStatus.map((docType) => (
                <MenuItem key={docType.id} value={docType.id}>
                  {docType.name}
                </MenuItem>
              ))}
            </CustomTextField>
            )
          }

        </div>

          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Document'
              className='max-sm:is-full'
            />
            {can("document-control", "create") && (
              <Button
                variant="contained"
                startIcon={<i className="tabler-plus" />}
                onClick={() => {
                  if (originPage) {
                    router.push(`/${locale}/admin/document/add?category=${originPage}`);
                  }
                }}
                className="max-sm:is-full"
              >
                Add New Document
              </Button>
            )}
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
                      <th key={header.id} style={header.id === 'name' || header.id === 'prefix' ? { width: '45%' } : {}}>
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

              {Number(pagination.totalRecords) === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table.getRowModel().rows.map(row => (
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
            component={() => (
              <TablePaginationComponentDocument
                table={table}
                pagination={pagination}
                setPagination={setPagination}
              />
            )}
            count={Number(pagination.totalRecords)}
            rowsPerPage={Number(pagination.perPage)}
            page={Number(pagination.currentPage)}
            onPageChange={(_, page) => {
              table.setPageIndex(page);
            }}
          />

      </Card>
      <ModalDeleteDocument
        open={modalDeleteOpen}
        handleClose={handleCloseModalDelete}
        handleConfirm={actionDelete}
        selectedData={selectedData} 
      />
      <ModalApprovalDocument
        isOpen={isModalApprovalOpen}
        setIsOpen={setIsModalApprovalOpen}
        selectedData={selectedDataApprove} 
        addApprovalDocument={addApprovalDocument}
      />
    </>
  )
}

export default DocumentTable

