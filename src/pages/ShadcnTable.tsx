import React, { HTMLProps } from 'react'
import { BsCaretRightFill } from 'react-icons/bs'
import { BsCaretDownFill } from 'react-icons/bs'
import {
  Column,
  Table,
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { getData } from '../data/shadcn-table-data'

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
        header: ({ table }) => <>WBS</>,
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
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <label>Expanded State:</label>
      <pre>{JSON.stringify(expanded, null, 2)}</pre>
    </div>
  )
}

function Filter({
  column,
  table,
}: {
  column: Column<any, any>
  table: Table<any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  )
}

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!)

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}
export default ShadcnTable
