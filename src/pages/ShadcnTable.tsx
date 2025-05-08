import React, { HTMLProps } from 'react'
import { BsCaretRightFill } from 'react-icons/bs'
import { BsCaretDownFill } from 'react-icons/bs'
import {
  Column,
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { getData } from '../data/shadcn-table-data'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'


export const formatCurrency = (amount: number | null) => {
  const value = amount || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}


const ShadcnTable = () => {
  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'wbs',
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
      },
      {
        accessorKey: 'name',
        header: () => 'Name',
      },
      {
        accessorKey: 'status',
        header: () => 'Status',
      },
      {
        accessorKey: 'startDate',
        cell: ({ getValue }) => formatDate(getValue<Date>() ?? new Date()),
        header: () => 'Start Date',
      },
      {
        accessorKey: 'endDate',
        cell: ({ getValue }) => formatDate(getValue<Date>() ?? new Date()),
        header: () => 'End Date',
      },
      {
        accessorKey: 'assigned',
        header: () => 'Assigned',
      },
      {
        accessorKey: 'discipline',
        header: () => 'Discipline',
      },
      {
        accessorKey: 'units',
        header: () => 'Units',
      },
      {
        accessorKey: 'rate',
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        header: () => 'Rate',
      },
      {
        accessorKey: 'budget',
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        header: () => 'Budget',
      },
      {
        accessorKey: 'fee',
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        header: () => 'Fee',
      },
      {
        accessorKey: 'used',
        header: () => 'Used',
      },
      {
        accessorKey: 'notes',
        header: () => 'Notes',
      },
    ],
    []
  )

  const [data, setData] = React.useState(() => getData())
  console.log(data)

  const [expanded, setExpanded] = React.useState<ExpandedState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  })

  return (
    <div className="p-2">
      <div className="h-2" />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            return (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="h-2" />
      <label>Expanded State:</label>
      <pre>{JSON.stringify(expanded, null, 2)}</pre>
    </div>
  )
}

export default ShadcnTable
