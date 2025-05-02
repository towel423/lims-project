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
import { fetchSelectListDocumentType, getSelectListDocumentStatus, getSelectListDocumentType, indonesiaFormattedDate, transformTypeDocuments } from '@/helpers/helper'
import { can } from "@/helpers/permissionHelper";
import { ApprovalDocumentFormType } from '@/types/apps/documentApprovalType'
// import ModalDeleteDocument from './ModalDeleteDocument'
import { toast } from 'react-toastify'
import { DocumentStatusSelectListType, DocumentTypeSelectListType } from '@/types/apps/selectListTypes'
import TablePaginationComponentDocument from '@/components/TablePaginationComponentDocument'
import PerPageComponent from '../admin/document/PerPageComponent'
import ButtonCustom from './ButtonCustom'
import PerPageComponentCustom from './PerPageComponentCustom'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
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


const Datatable: React.FC<any> = ({ dataColumns, tableData, isLoading, setPagination, pagination, pageTitle, urlAddPage }) => {
  const [rowSelection, setRowSelection] = useState({})
  // const [data, setData] = useState(tableData)
  const [filteredData, setFilteredData] = useState(tableData)
  const [globalFilter, setGlobalFilter] = useState('')
  const [isModalApprovalOpen, setIsModalApprovalOpen] = useState(false)
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<Partial<InternalDocumentTypeDatatable> | Partial<ExternalDocumentTypeDatatable> | Partial<DocumentTypeDatatable> | null>(null)
  // const [selectedDataApprove, setSelectedDataApprove] = useState<ApprovalDocumentFormType | null>(null)
  // const [dataMasterDocumentType, setDataMasterDocumentType] = useState<DocumentTypeSelectListType[]>([])
  // const [dataMasterDocumentStatus, setDataMasterDocumentStatus] = useState<DocumentStatusSelectListType[]>([])

  const router = useRouter()
  const params = useParams()
  const { lang: locale } = params

  useEffect(() => {
      // setData(tableData)
      setFilteredData(tableData)
  }, [tableData])

  // useEffect(() => {
  //   setFilteredData(data)
  // }, [data])

  const handleOpenModalDelete = (data: Partial<DocumentsType>) => {
    setSelectedData(data);
    setModalDeleteOpen(true);
  };

  const handleCloseModalDelete = () => {
    setSelectedData(null);
    setModalDeleteOpen(false);
  };

  // const actionDelete = async () => {
  //   if (selectedData?.uuid && deleteDocument) {
  //     setSelectedData(null);
  //     setModalDeleteOpen(false);
      
  //     let response = await deleteDocument(selectedData.uuid);

  //     if (response?.status == 200) {
  //       toast.success("Successfully delete document!", {
  //         position: "top-right",
  //         autoClose: 2000
  //       });
  //     } else {
  //       toast.error("Failed to delete document!", {
  //         position: "top-right",
  //         autoClose: 2000
  //       });
  //     }
  //   }
  // };

  let columns: any = dataColumns;
  let title: string = pageTitle;

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
        pageSize: pagination.perPage,
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

  // const getSelectListDocumentType = async (documentCategoryId?: string): Promise<DocumentTypeSelectListType[]> => {
  //     try {
  //         // Assuming fetchSelectListDocumentType is the function that makes the API request
  //         const response = await fetchSelectListDocumentType(documentCategoryId);
  //         let formattedData = transformTypeDocuments(response.data.data.data);
  //         return formattedData;
  //     } catch (error) {
  //         console.error("Error fetching document categories:", error);
  //         return []; // Return an empty array in case of an error
  //     }
  // };

  // useEffect(() => {
  //   const fetchDocumentTypes = async () => {
  //     // if (originPage) {
  //       try {
  //         const response = await getSelectListDocumentType(originPage);
  //         setDataMasterDocumentType(response);
  //       } catch (error) {
  //         console.error("Error setting document types:", error);
  //       }
  //     // }
  //   };
  //   const fetchDocumentStatus = async () => {
  //       try {
  //         const response = await getSelectListDocumentStatus();
  //         setDataMasterDocumentStatus(response);
  //       } catch (error) {
  //         console.error("Error setting document types:", error);
  //       }
  //   };

  //   fetchDocumentTypes();
  //   if(originPage){
  //     fetchDocumentStatus();
  //   }
  // }, []);
  

  return (
    <>
      <Card>
        <CardHeader title={title} className='pbe-4' />
        {/* <TableFilters setData={setFilteredData} tableData={data} /> */}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-2'>
        {/* Grouped CustomTextField components */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
        
          <PerPageComponentCustom 
            pagination={pagination}
            setPagination={setPagination}
          />
          {/* <CustomTextField
            select
            fullWidth
            id='select-jenis-dokumen'
            className='max-sm:is-full sm:w-[200px]' // Adjust width as needed
            value={pagination.documentType}
            onChange={e => setPagination({...pagination, documentType: String(e.target.value)})}
            SelectProps={{ displayEmpty: true }}
          >
          
            <MenuItem value='' selected={true}>
              Pilih Jenis Dokumen
            </MenuItem>

            {dataMasterDocumentType.map((docType) => (
              <MenuItem key={docType.id} value={docType.id}>
                {docType.name}
              </MenuItem>
            ))}
          </CustomTextField> */}

          {/* {
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
              
              <MenuItem value='' selected={true}>
                Pilih Status Dokumen
              </MenuItem>

              {dataMasterDocumentStatus.map((docType) => (
                <MenuItem key={docType.id} value={docType.id}>
                  {docType.name}
                </MenuItem>
              ))}
            </CustomTextField>
            )
          } */}

        </div>

          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder={`Search ${pageTitle}`}
              className='max-sm:is-full'
            />

              {
                urlAddPage && (
                  <ButtonCustom url={urlAddPage}>
                    Add {pageTitle}
                  </ButtonCustom>
                )
              }


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
      {/* <ModalDeleteDocument
        open={modalDeleteOpen}
        handleClose={handleCloseModalDelete}
        handleConfirm={actionDelete}
        selectedData={selectedData} 
      /> */}
    </>
  )
}

export default Datatable

