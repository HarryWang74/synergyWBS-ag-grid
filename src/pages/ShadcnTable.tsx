import React, { CSSProperties } from 'react'
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
import { getData } from '../data/shadcn-table-data'
import './table.css'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

// needed for table body level scope DnD setup
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

// needed for row & cell level scope DnD setup
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
        size: 180,
      },
      {
        accessorKey: 'name',
        header: () => 'Name',
        size: 180,
      },
      {
        accessorKey: 'status',
        header: () => 'Status',
        size: 180,
      },
      {
        accessorKey: 'startDate',
        cell: ({ getValue }) => formatDate(getValue<Date>() ?? new Date()),
        header: () => 'Start Date',
        size: 180,
      },
      {
        accessorKey: 'endDate',
        cell: ({ getValue }) => formatDate(getValue<Date>() ?? new Date()),
        header: () => 'End Date',
        size: 180,
      },
      {
        accessorKey: 'assigned',
        header: () => 'Assigned',
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
        size: 180,
      },
      {
        accessorKey: 'units',
        header: () => 'Units',
        size: 180,
      },
      {
        accessorKey: 'rate',
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        header: () => 'Rate',
        size: 180,
      },
      {
        accessorKey: 'budget',
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        header: () => 'Budget',
        size: 180,
      },
      {
        accessorKey: 'fee',
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
        header: () => 'Fee',
        size: 180,
      },
      {
        accessorKey: 'used',
        header: () => 'Used',
        size: 180,
      },
      {
        accessorKey: 'notes',
        header: () => 'Notes',
        size: 180,
      },
    ],
    []
  )

  const [data, setData] = React.useState(() => getData())
  console.log(data)

  //These are the important styles to make sticky column pinning work!
  //Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
  //View the index.css file for more needed styles such as border-collapse: separate
  const getCommonPinningStyles = (column: Column<any>): CSSProperties => {
    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn =
      isPinned === 'left' && column.getIsLastColumn('left')
    const isFirstRightPinnedColumn =
      isPinned === 'right' && column.getIsFirstColumn('right')

    return {
      boxShadow: isLastLeftPinnedColumn
        ? '-4px 0 4px -4px gray inset'
        : isFirstRightPinnedColumn
        ? '4px 0 4px -4px gray inset'
        : undefined,
      left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
      right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
      opacity: isPinned ? 0.95 : 1,
      position: isPinned ? 'sticky' : 'relative',
      width: column.getSize(),
      zIndex: isPinned ? 1 : 0,
    }
  }

  const [expanded, setExpanded] = React.useState<ExpandedState>(true)

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
    columnResizeMode: 'onChange',
  })

  return (
    <div className="p-2">
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="h-2" />
      <Table
        //IMPORTANT: pin and resize feature!
        style={{
          width: table.getTotalSize(),
        }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const { column } = header
                return (
                  <TableHead
                    colSpan={header.colSpan}
                    className="bg-white"
                    key={header.id}
                    style={{ ...getCommonPinningStyles(column) }}
                  >
                    <div className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}{' '}
                      {/* Demo getIndex behavior */}
                      {column.getIndex(column.getIsPinned() || 'center')}
                    </div>
                    {/* pin controls start */}
                    {!header.isPlaceholder && header.column.getCanPin() && (
                      <div className="flex gap-1 justify-center">
                        {header.column.getIsPinned() !== 'left' ? (
                          <button
                            className="border rounded px-2"
                            onClick={() => {
                              header.column.pin('left')
                            }}
                          >
                            {'<='}
                          </button>
                        ) : null}
                        {header.column.getIsPinned() ? (
                          <button
                            className="border rounded px-2"
                            onClick={() => {
                              header.column.pin(false)
                            }}
                          >
                            X
                          </button>
                        ) : null}
                        {header.column.getIsPinned() !== 'right' ? (
                          <button
                            className="border rounded px-2"
                            onClick={() => {
                              header.column.pin('right')
                            }}
                          >
                            {'=>'}
                          </button>
                        ) : null}
                      </div>
                    )}
                    {/* pin controls finish */}

                    {/* resize controls start */}
                    <div
                      {...{
                        onDoubleClick: () => header.column.resetSize(),
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer ${
                          header.column.getIsResizing() ? 'isResizing' : ''
                        }`,
                      }}
                    />
                    {/* resize controls finish */}
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
                  const { column } = cell
                  return (
                    <TableCell
                      className="bg-white"
                      key={cell.id}
                      //IMPORTANT: pin feature!
                      style={{ ...getCommonPinningStyles(column) }}
                    >
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
      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div className="mt-4" />
      <div>
        <b>Expanded State:</b> {JSON.stringify(expanded, null, 2)}
      </div>
      <div>
        <b>Pin status:</b>{' '}
        {JSON.stringify(table.getState().columnPinning, null, 2)}
      </div>
    </div>
  )
}

export default ShadcnTable
