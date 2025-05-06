import type {
  ColDef,
  GetDataPath,
  ValueFormatterFunc,
  ValueFormatterParams,
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
  RichSelectModule,
  RowGroupingModule,
  SetFilterModule,
  StatusBarModule,
  TreeDataModule,
} from 'ag-grid-enterprise'
import { AgGridReact } from 'ag-grid-react'
import {
  type FunctionComponent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'

import styles from '../HRExample.module.css'
import { StatusCellRenderer } from '../components/cell-renderers/StatusCellRenderer'
import { getData } from '../data/one-table-data'

ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  ExcelExportModule,
  MasterDetailModule,
  RowGroupingModule,
  RichSelectModule,
  SetFilterModule,
  StatusBarModule,
  TreeDataModule,
])

interface Props {
  gridTheme?: string
  isDarkMode?: boolean
}

const status = ['Active', 'Completed', 'Pending']

const OneTableSolution: FunctionComponent<Props> = ({
  gridTheme = 'ag-theme-quartz',
  isDarkMode,
}) => {
  const gridRef = useRef<AgGridReact>(null)

  const [colDefs] = useState<ColDef[]>([
    {
      headerName: 'Name',
      field: 'name',
      width: 120,
    },
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
  ])
  const [rowData] = useState(getData())
  const getDataPath = useCallback<GetDataPath>((data) => data.orgHierarchy, [])
  const themeClass = isDarkMode ? `${gridTheme}-dark` : gridTheme
  const autoGroupColumnDef = useMemo<ColDef>(() => {
    return {
      headerName: 'WBS',
      width: 200,
      pinned: 'left',
      sort: 'asc',
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,
      },
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={`${themeClass} ${styles.grid}`}>
          <AgGridReact
            theme="legacy"
            ref={gridRef}
            columnDefs={colDefs}
            rowData={rowData}
            groupDefaultExpanded={-1}
            getDataPath={getDataPath}
            treeData
            autoGroupColumnDef={autoGroupColumnDef}
          />
        </div>
      </div>
    </div>
  )
}
export default OneTableSolution