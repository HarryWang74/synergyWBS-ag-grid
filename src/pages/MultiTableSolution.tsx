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

const paginationPageSizeSelector = [5, 10, 20]

const MultiTableSolution: FunctionComponent<Props> = ({
  gridTheme = 'ag-theme-quartz',
  isDarkMode,
}) => {
  const gridRef = useRef<AgGridReact>(null)

  const [colDefs] = useState<ColDef[]>([
    { field: 'a1', cellRenderer: 'agGroupCellRenderer' },
    { field: 'b1' },
  ])
  const [rowData] = useState(getData())
  /* const [rowData, setRowData] = useState<any[]>([
    {
      a1: 'level 1 - 111',
      b1: 'level 1 - 222',
      children: [
        {
          a2: 'level 2 - 333',
          b2: 'level 2 - 444',
          children: [
            { a3: 'level 3 - 5551', b3: 'level 3 - 6661' },
            { a3: 'level 3 - 5552', b3: 'level 3 - 6662' },
            { a3: 'level 3 - 5553', b3: 'level 3 - 6663' },
            { a3: 'level 3 - 5554', b3: 'level 3 - 6664' },
            { a3: 'level 3 - 5555', b3: 'level 3 - 6665' },
            { a3: 'level 3 - 5556', b3: 'level 3 - 6666' },
          ],
        },
      ],
    },
    {
      a1: 'level 1 - 111',
      b1: 'level 1 - 222',
      children: [
        {
          a2: 'level 2 - 333',
          b2: 'level 2 - 444',
          children: [
            { a3: 'level 3 - 5551', b3: 'level 3 - 6661' },
            { a3: 'level 3 - 5552', b3: 'level 3 - 6662' },
            { a3: 'level 3 - 5553', b3: 'level 3 - 6663' },
            { a3: 'level 3 - 5554', b3: 'level 3 - 6664' },
            { a3: 'level 3 - 5555', b3: 'level 3 - 6665' },
            { a3: 'level 3 - 5556', b3: 'level 3 - 6666' },
          ],
        },
      ],
    },
  ]) */
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


  /* const detailCellRendererParams = useMemo(
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
  ) */
  const detailCellRendererParams = useMemo<any>(() => {
    return {
      // level 2 grid options
      detailGridOptions: {
        columnDefs: [
          { field: 'a2', cellRenderer: 'agGroupCellRenderer' },
          { field: 'b2' },
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
              { field: 'a3', cellRenderer: 'agGroupCellRenderer' },
              { field: 'b3' },
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