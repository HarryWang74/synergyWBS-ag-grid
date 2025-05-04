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