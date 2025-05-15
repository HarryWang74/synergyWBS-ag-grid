import React from 'react'
import ShadcnTable from './ShadcnTable'
import { BsCaretRightFill } from 'react-icons/bs'
import { BsCaretDownFill } from 'react-icons/bs'
import { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getData } from '../data/shadcn-table-data'
import { TableStatus } from '@/models/dataTable'

const cultureCode = 'en-GB'
const currencyCode = 'GBP'
/* const cultureCode = 'en-US'
const currencyCode = 'USD' */
const initialState = (() => {
    const stored = localStorage.getItem('projectBreakdownTableStatus')
    return stored ? JSON.parse(stored) : {}
})()

export const formatCurrency = (amount: number | null) => {
  const value = amount || 0
  return new Intl.NumberFormat(cultureCode, {
    style: 'currency',
    currency: currencyCode,
  }).format(value)
}

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(cultureCode, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

const delTableStatus = () => {
    localStorage.removeItem('projectBreakdownTableStatus')
}

const onRowSelectChange = (rowSelectionState: RowSelectionState) => {
  console.log('rowSelectionState', rowSelectionState)
}

const saveTableStatus = (tableStatus: TableStatus) => {
  console.log('tableStatus', tableStatus)
  localStorage.setItem(
    'projectBreakdownTableStatus',
    JSON.stringify(tableStatus)
  )
}

function ProjectBreakdown() {
    const columns = React.useMemo<ColumnDef<any>[]>(() => [
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
      },
      {
        accessorKey: 'wbs',
        id: 'wbs', // must have to support drag & drop
        header: ({}) => <>WBS</>,
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
      },
      {
        accessorKey: 'status',
        header: () => 'Status',
        id: 'status',
        size: 180,
      },
      {
        accessorKey: 'startDate',
        cell: ({ getValue }) => formatDate(getValue<Date>() ?? new Date()),
        header: () => 'Start Date',
        id: 'startDate',
        size: 180,
      },
      {
        accessorKey: 'endDate',
        cell: ({ getValue }) => formatDate(getValue<Date>() ?? new Date()),
        header: () => 'End Date',
        id: 'endDate',
        size: 180,
      },
      {
        accessorKey: 'assigned',
        header: () => 'Assigned',
        id: 'assigned',
        cell: ({ getValue }) => {
          const assignee = getValue<any>()
          return (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span>{assignee}</span>
            </div>
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
        accessorKey: 'units',
        header: () => 'Units',
        id: 'units',
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
    ],
    []
  )

  const [data, setData] = React.useState(() => getData())
  return (
    <div>
      <ShadcnTable
        saveTableStatus={saveTableStatus}
        columns={columns}
        data={data}
        pathSubRows="subRows"
        initialState={initialState}
        deleteTableStatus={delTableStatus}
        onRowSelectChange={onRowSelectChange}
      ></ShadcnTable>
    </div>
  )
}

export default ProjectBreakdown