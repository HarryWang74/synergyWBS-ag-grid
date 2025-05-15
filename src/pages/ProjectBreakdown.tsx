import React from 'react'
import ShadcnTable from './ShadcnTable'
import { BsCaretRightFill } from 'react-icons/bs'
import { BsCaretDownFill } from 'react-icons/bs'
import {
  Column,
  Cell,
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
  Header,
} from '@tanstack/react-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getData } from '../data/shadcn-table-data'


const cultureCode = 'en-GB'
const currencyCode = 'GBP'
/* const cultureCode = 'en-US'
const currencyCode = 'USD' */

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

function ProjectBreakdown() {
    const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
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
        columns={columns}
        data={data}
        pathSubRows="subRows"
      ></ShadcnTable>
    </div>
  )
}

export default ProjectBreakdown