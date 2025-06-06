import React from 'react'
import ShadcnTable from './ShadcnTable'
import { BsCaretRightFill } from 'react-icons/bs'
import { BsCaretDownFill } from 'react-icons/bs'
import { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getData } from '../data/shadcn-table-data'
import { TableStatus } from '@/models/dataTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HiMiniEllipsisVertical } from 'react-icons/hi2'
import { Skeleton } from '@/components/ui/skeleton'


const cultureCode = 'en-GB'
const currencyCode = 'GBP'
/* const cultureCode = 'en-US'
const currencyCode = 'USD' */

const formatCurrency = (amount: number | null) => {
  const value = amount || 0
  return new Intl.NumberFormat(cultureCode, {
    style: 'currency',
    currency: currencyCode,
  }).format(value)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(cultureCode, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

export const wbsRowStatus = [
  { id: 1, name: 'Not started' },
  { id: 2, name: 'In progress' },
  { id: 3, name: 'Completed' },
]

function ProjectBreakdown() {
  const [selectedTasks, setSelectedTasks] = React.useState<any[]>([])
  const [selectedStages, setSelectedStages] = React.useState<any[]>([])
  const [selectedPhases, setSelectedPhases] = React.useState<any[]>([])
  const storageKey = 'projectBreakdownTableStatus'
  
  const initialState = (() => {
    const stored = localStorage.getItem(storageKey)

    return stored
      ? JSON.parse(stored)
      : {
          columnPinning: { left: ['select', 'wbs'], right: ['actions'] },
          columnVisibility: {
            select: true,
            wbs: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true,
            assigned: true,
            discipline: true,
            units: true,
            rate: true,
            budget: true,
            fee: true,
            used: true,
            notes: true,
            actions: true,
          },
        }
  })()
  
  const delTableStatus = () => {
    localStorage.removeItem(storageKey)
  }

  const onActionEdit = (rowData: any) => {
    console.log('onActionEdit', rowData)
  }

  const onActionDelete = (rowData: any) => {
    console.log('onActionDelete', rowData)
  }

  const onDuplicate = (rowData: any) => {
    console.log('onDuplicate', rowData)
  }

  const onAdd = (rowData: any) => {
    console.log('onAdd', rowData)
  }

  const saveTableStatus = (tableStatus: TableStatus) => {
    console.log('tableStatus', tableStatus)
    localStorage.setItem(
      'projectBreakdownTableStatus',
      JSON.stringify({
        columnPinning: tableStatus.columnPinning,
        columnSizing: tableStatus.columnSizing,
        columnVisibility: tableStatus.columnVisibility,
      })
    )
  }

  const saveRowName = (rowData: any, name: string) => {
    console.log('saveRowData', rowData, name)
  }

  const saveRowStartDate = (rowData: any, startDate: Date) => {
    console.log('saveRowDataStartDate', rowData, startDate)
    rowData.progressing = true
  }

  const saveRowEndDate = (rowData: any, startDate: Date) => {
    console.log('saveRowDataStartDate', rowData, startDate)
    rowData.progressing = true
  }

  const saveRowStatus = (rowData: any, status: any) => {
    console.log('saveRowStatus', rowData, status)
  }

  const saveRowUnits = (rowData: any, units: number) => {
    console.log('saveRowStatus', rowData, units)
  }


  
  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
          />
        ),
        size: 48,
        enableSorting: false,
        enableHiding: false,
        noFeatureHeader: true,
      },
      {
        accessorKey: 'wbs',
        id: 'wbs',
        header: () => 'WBS',
        cell: ({ row, getValue }) => (
          <div
            style={{
              // Since rows are flattened by default,
              // we can use the row.depth property
              // and paddingLeft to visually indicate the depth
              // of the row
              paddingLeft: `${row.depth * 2}rem`,
            }}
          >
            <div>
              {row.getCanExpand() ? (
                <button
                  {...{
                    onClick: row.getToggleExpandedHandler(),
                    style: { cursor: 'pointer' },
                  }}
                >
                  {row.getIsExpanded() ? (
                    <BsCaretDownFill />
                  ) : (
                    <BsCaretRightFill />
                  )}
                </button>
              ) : null}
              {getValue<boolean>()}
            </div>
          </div>
        ),
        size: 180,
      },
      {
        accessorKey: 'name',
        header: () => 'Name',
        id: 'name',
        size: 180,
        cell: ({ row }) => {
          const rowData = row.original
          const [nameValue, setNameValue] = React.useState(row.original.name)
          return (
            <input
              type="text"
              value={nameValue}
              onChange={(e) => {
                setNameValue(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveRowName(row.original, nameValue)
                  e.currentTarget.blur()
                }
              }}
            />
          )
        },
      },
      {
        accessorKey: 'status',
        header: () => 'Status',
        id: 'status',
        cell: ({ row }) => {
          const rowData = row.original
          return (
            rowData.status && (
              <select
                onChange={(e) => {
                  const selectedStatus = wbsRowStatus.find(
                    (status) => status.name === e.target.value
                  )
                  if (selectedStatus) {
                    saveRowStatus(row.original, selectedStatus)
                  }
                }}
              >
                {wbsRowStatus.map((status) => (
                  <option
                    key={status.id}
                    value={status.name}
                    selected={rowData.status.id === status.id}
                  >
                    {status.name}
                  </option>
                ))}
              </select>
            )
          )
        },
        size: 180,
      },
      {
        accessorKey: 'startDate',
        cell: ({ row }) => {
          const rowData = row.original
          const [projectStartDate, setProjectStartDate] = React.useState<Date>(
            rowData.startDate || new Date()
          )
          return (
            <input
              type="date"
              value={
                projectStartDate
                  ? projectStartDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => {
                const newDate = e.target.value
                  ? new Date(e.target.value)
                  : new Date()
                setProjectStartDate(newDate)
                saveRowStartDate(row.original, newDate)
              }}
            />
          )
        },
        header: () => 'Start Date',
        id: 'startDate',
        size: 180,
      },
      {
        accessorKey: 'endDate',
        cell: ({ row }) => {
          const rowData = row.original
          const [projectStartDate, setProjectEndDate] = React.useState<Date>(
            rowData.startDate || new Date()
          )
          return (
            <input
              type="date"
              value={
                projectStartDate
                  ? projectStartDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) => {
                const newDate = e.target.value
                  ? new Date(e.target.value)
                  : new Date()
                setProjectEndDate(newDate)
                saveRowEndDate(row.original, newDate)
              }}
            />
          )
        },
        header: () => 'End Date',
        id: 'endDate',
        size: 180,
      },
      {
        accessorKey: 'units',
        header: () => 'Units',
        id: 'units',
        size: 180,
        cell: ({ row }: { row: any }) => {
          const rowData = row.original
          const [unitsValue, setUnitsValue] = React.useState(row.original.units)
          return  (
            <input
              type="number"
              value={unitsValue}
              onChange={(e) => {
                setUnitsValue(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveRowUnits(row.original, unitsValue)
                  e.currentTarget.blur()
                }
              }}
            />
          )
        },
      },
      {
        accessorKey: 'assigned',
        header: () => 'Assigned',
        id: 'assigned',
        cell: ({ row }) => {
          const rowData = row.original
          return (
            rowData.type !== 'phase' && (
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span>{rowData.assigned}</span>
              </div>
            )
          )
        },
      },
      {
        accessorKey: 'discipline',
        header: () => 'Discipline',
        id: 'discipline',
        size: 180,
      },

      {
        accessorKey: 'rate',
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        header: () => 'Rate',
        id: 'rate',
        size: 180,
      },
      {
        accessorKey: 'budget',
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        header: () => 'Budget',
        id: 'budget',
        size: 180,
      },
      {
        accessorKey: 'fee',
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        header: () => 'Fee',
        id: 'fee',
        size: 180,
      },
      {
        accessorKey: 'used',
        header: () => 'Used',
        id: 'used',
        size: 180,
      },
      {
        accessorKey: 'notes',
        header: () => 'Notes',
        id: 'notes',
        size: 180,
      },
      {
        id: 'actions',
        header: ({ table }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 absolute right-[10px] top-1"
              >
                <span className="sr-only">Open menu</span>
                <HiMiniEllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => saveTableStatus(table.getState() as TableStatus)}
              >
                Save table status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => delTableStatus()}>
                Delete table status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        cell: ({ row }) => {
          const rowData = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onActionEdit(rowData)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onActionDelete(rowData)}>
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(rowData)}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAdd(rowData)}>
                  Add new item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 60,
        enableSorting: false,
        enableHiding: false,
        noFeatureHeader: true,
      },
    ],
    []
  )

  const [data, setData] = React.useState(() => getData())

  const onRowSelectChange = (rowSelectionState: RowSelectionState) => {
    const selectedIds = Object.keys(rowSelectionState);
    console.log('selectedIds', selectedIds)
    
    const selectedStagesData = data
      .flatMap((item: any) => [item, ...(item.subRows || [])])
      .filter((row: any) => selectedIds.includes(row.id) && row.id.startsWith('stage_'));
    setSelectedStages(selectedStagesData);
    
    const selectedPhasesData = data
      .flatMap((item: any) => [item, ...(item.subRows || [])])
      .filter((row: any) => selectedIds.includes(row.id) && row.id.startsWith('phase_'));
    setSelectedPhases(selectedPhasesData)

    const selectedTaskData = data
      .flatMap((item: any) =>
        (item.subRows || []).flatMap((sub: any) => [
          ...(sub.subRows || []).filter(
            (row: any) => selectedIds.includes(row.id) && row.id.startsWith('task_')
          ),
        ])
      );
    setSelectedTasks(selectedTaskData)
  }


  return (
    <div>
      {/* <div className="border-b border-i-border-color my-4">
        <h1>Project breakdown</h1>
        <div className="my-4">
          <b>selected phases</b>
          {JSON.stringify(selectedPhases, null, 2)}
        </div>
        <div className="my-4">
          <b>selected stages</b>
          {JSON.stringify(selectedStages, null, 2)}
        </div>
        <div className="my-4">
          <b>selected tasks</b>
          {JSON.stringify(selectedTasks, null, 2)}
        </div>
      </div> */}
      <ShadcnTable
        columns={columns}
        data={data}
        pathSubRows="subRows"
        initialState={initialState}
        onRowSelectChange={onRowSelectChange}
      />
    </div>
  )
}

export default ProjectBreakdown