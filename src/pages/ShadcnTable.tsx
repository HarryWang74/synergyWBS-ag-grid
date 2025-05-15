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



 //These are the important styles to make sticky column pinning work!
  //Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
  //View the index.css file for more needed styles such as border-collapse: separate
const getPinStyles = (column: Column<any>): CSSProperties => {
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
    backgroundColor: isPinned ? 'white' : undefined,
  }
}


const TableHeaderWapper = ({ header }: { header: Header<any, unknown> }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    })

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <TableHead
      colSpan={header.colSpan}
      ref={setNodeRef}
      style={{ ...style, ...getPinStyles(header.column) }}
    >
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}

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
      <button {...attributes} {...listeners}>
        🟰
      </button>
    </TableHead>
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pathSubRows?: string
}


export function ShadcnTable<TData, TValue>({
  columns,
  data,
  pathSubRows,
}: DataTableProps<TData, TValue>) {
  
  const [expanded, setExpanded] = React.useState<ExpandedState>(true)
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((c) => c.id!)
  )
  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder: columnOrder, 
      expanded: expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: pathSubRows ? (row: any) => row[pathSubRows] : undefined,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
  })

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex) //this is just a splice util
      })
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

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
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Table
          //IMPORTANT: pin and resize feature!
          style={{
            width: table.getTotalSize(),
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHeaderWapper key={header.id} header={header} />
                      )
                    })}
                  </SortableContext>
                </TableRow>
              )
            })}
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
                        style={{ ...getPinStyles(column) }}
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
      </DndContext>
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
