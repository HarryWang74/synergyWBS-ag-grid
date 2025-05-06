import type {
  ColDef,
  GetDetailRowDataParams,
  SizeColumnsToFitGridStrategy,
  ValueFormatterFunc,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community'
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  IDetailCellRendererParams,
} from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import {
  ExcelExportModule,
  MasterDetailModule,
  MultiFilterModule,
  SetFilterModule,
} from 'ag-grid-enterprise'
import { AgGridReact } from 'ag-grid-react'
import {
  type ChangeEvent,
  type FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'

import styles from '../InventoryExample.module.css'
import { StatusCellRenderer } from '../components/cell-renderers/StatusCellRenderer'
import { EditCellRenderer } from '../components/cell-renderers/EditCellRenderer'
import { getData } from '../data/multi-table-data'

ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  ExcelExportModule,
  SetFilterModule,
  MultiFilterModule,
  MasterDetailModule,
])

interface Props {
  gridTheme?: string
  isDarkMode?: boolean
}
const status = ['Active', 'Completed', 'Pending']
const paginationPageSizeSelector = [5, 10, 20]

const MultiTableSolution: FunctionComponent<Props> = ({
  gridTheme = 'ag-theme-quartz',
  isDarkMode,
}) => {
  const gridRef = useRef<AgGridReact>(null)

  const [colDefs] = useState<ColDef[]>([
    { field: 'wbs', cellRenderer: 'agGroupCellRenderer' },
    { field: 'name' },
  ])
  const [rowData] = useState(getData())

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: false,
    }),
    []
  )
  const autoSizeStrategy = useMemo<SizeColumnsToFitGridStrategy>(
    () => ({
      type: 'fitGridWidth',
    }),
    []
  )
  const themeClass = isDarkMode ? `${gridTheme}-dark` : gridTheme

  const detailCellRendererParams = useMemo<any>(() => {
    return {
      // level 2 grid options
      detailGridOptions: {
        columnDefs: [
          { field: 'wbs', cellRenderer: 'agGroupCellRenderer' },
          { field: 'name' },
          {
            headerName: 'Status',
            field: 'status',
            editable: true,
            width: 300,
            cellRenderer: StatusCellRenderer,
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: status,
            },
          },
          {
                headerName: 'Start Date',
                field: 'startDate',
                editable: false,
                width: 150,
                valueFormatter: (params: ValueFormatterParams<any, Date>) => {
                  if (!params.value) {
                    return ''
                  }
                  const month = params.value.getMonth() + 1
                  const day = params.value.getDate()
                  return `${params.value.getFullYear()}-${
                    month < 10 ? '0' + month : month
                  }-${day < 10 ? '0' + day : day}`
                },
                cellEditor: 'agDateCellEditor',
              },
              {
                headerName: 'End Date',
                field: 'endDate',
                editable: true,
                width: 150,
                valueFormatter: (params: ValueFormatterParams<any, Date>) => {
                  if (!params.value) {
                    return ''
                  }
                  const month = params.value.getMonth() + 1
                  const day = params.value.getDate()
                  return `${params.value.getFullYear()}-${
                    month < 10 ? '0' + month : month
                  }-${day < 10 ? '0' + day : day}`
                },
                cellEditor: 'agDateCellEditor',
              },
              {
                headerName: 'Assigned',
                width: 150,
                field: 'assigned',
              },
              {
                headerName: 'Discipline',
                width: 150,
                field: 'discipline',
              },
              {
                headerName: 'Units',
                field: 'units',
                width: 100,
                editable: true,
              },
              {
                headerName: 'Rate',
                field: 'rate',
                valueFormatter: ({ value }: ValueFormatterParams) =>
                  value == null ? '' : `$${Math.round(value).toLocaleString()}`,
                width: 100,
                editable: true,
              },
              {
                headerName: 'Budget',
                field: 'budget',
                valueFormatter: ({ value }: ValueFormatterParams) =>
                  value == null ? '' : `$${Math.round(value).toLocaleString()}`,
                width: 200,
                editable: true,
              },
              {
                headerName: 'Fee/Cap',
                field: 'fee',
                valueFormatter: ({ value }: ValueFormatterParams) =>
                  value == null ? '' : `$${Math.round(value).toLocaleString()}`,
                width: 150,
                editable: true,
              },
              {
                headerName: 'Used',
                width: 100,
                field: 'used',
              },
              {
                headerName: 'Notes',
                width: 100,
                field: 'notes',
              },
              {
                field: '',
                pinned: 'right',
                cellRenderer: EditCellRenderer,
                width: 50,
              },
        ],
        defaultColDef: {
          flex: 1,
        },
        groupDefaultExpanded: 1,
        masterDetail: true,
        detailRowHeight: 240,
        detailCellRendererParams: {
          // level 3 grid options
          detailGridOptions: {
            columnDefs: [
              { field: 'wbs', cellRenderer: 'agGroupCellRenderer' },
              { field: 'name' },
            ],
            defaultColDef: {
              flex: 1,
            },
          },
          getDetailRowData: (params) => {
            params.successCallback(params.data.children)
          },
        } as IDetailCellRendererParams,
      },
      getDetailRowData: (params) => {
        params.successCallback(params.data.children)
      },
    } as IDetailCellRendererParams
  }, [])
  return (
    <div className="mt-8">
      <div className={styles.container}>
        <div className={`${themeClass} ${styles.grid}`}>
          <AgGridReact
            theme="legacy"
            ref={gridRef}
            columnDefs={colDefs}
            rowData={rowData}
            defaultColDef={defaultColDef}
            rowHeight={80}
            autoSizeStrategy={autoSizeStrategy}
            pagination
            paginationPageSize={10}
            paginationPageSizeSelector={paginationPageSizeSelector}
            masterDetail
            detailCellRendererParams={detailCellRendererParams}
            detailRowAutoHeight
          />
        </div>
      </div>
    </div>
  )
}

export default MultiTableSolution