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
import { getData } from '../data/multi-table-data'
import { ActionsCellRenderer } from '../components/cell-renderers/ActionsCellRenderer'
import { ProductCellRenderer } from '../components/cell-renderers/ProductCellRenderer'
import { StatusCellRenderer } from '../components/cell-renderers/StatusCellRenderer'
import { StockCellRenderer } from '../components/cell-renderers/StockCellRenderer'
import { PriceCellRenderer } from '../components/cell-renderers/PriceCellRenderer'

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

const paginationPageSizeSelector = [5, 10, 20]

const statuses = {
  all: 'All',
  active: 'Active',
  paused: 'On Hold',
  outOfStock: 'Out of Stock',
}

const statusFormatter: ValueFormatterFunc = ({ value }) =>
  statuses[value as keyof typeof statuses] ?? ''

const MultiTableSolution: FunctionComponent<Props> = ({
  gridTheme = 'ag-theme-quartz',
  isDarkMode,
}) => {
  const gridRef = useRef<AgGridReact>(null)

  const [colDefs] = useState<ColDef[]>([
    {
      field: 'wbs',
      headerName: 'WBS',
      cellRenderer: 'agGroupCellRenderer',
      headerClass: 'header-product',
      width: 100,
    },
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


  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: [
          { field: 'title', flex: 1.5 },
          { field: 'available', maxWidth: 120 },
          { field: 'format', flex: 2 },
          { field: 'label', flex: 1 },
          { field: 'country', flex: 0.66 },
          {
            field: 'cat',
            headerName: 'Cat#',
            type: 'rightAligned',
            flex: 0.66,
          },
          { field: 'year', type: 'rightAligned', maxWidth: 80 },
        ],
        headerHeight: 38,
      },
      getDetailRowData: ({
        successCallback,
        data: { variantDetails },
      }: GetDetailRowDataParams) => successCallback(variantDetails),
    }),
    []
  )

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