import React, { CSSProperties } from 'react'

import {
  Cell,
  ColumnDef,
  Header,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { makeData, Person } from '../data/drag'

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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const TableHeaderWapper = ({
  header,
}: {
  header: Header<any, unknown>
}) => {
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
    <TableHead colSpan={header.colSpan} ref={setNodeRef} style={style}>
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
      <button {...attributes} {...listeners}>
        🟰
      </button>
    </TableHead>
  )
}

const Drag = () => {
  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: 'firstName',
        cell: (info) => info.getValue(),
        id: 'firstName',
        size: 150,
      },
      {
        accessorFn: (row) => row.lastName,
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        id: 'lastName',
        size: 150,
      },
      {
        accessorKey: 'age',
        header: () => 'Age',
        id: 'age',
        size: 120,
      },
      {
        accessorKey: 'visits',
        header: () => <span>Visits</span>,
        id: 'visits',
        size: 120,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        id: 'status',
        size: 150,
      },
      {
        accessorKey: 'progress',
        header: 'Profile Progress',
        id: 'progress',
        size: 180,
      },
    ],
    []
  )

  const [data, setData] = React.useState(() => makeData(20))
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((c) => c.id!)
  )

  const rerender = () => setData(() => makeData(20))

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
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
    // NOTE: This provider creates div elements, so don't nest inside of <table> elements
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="p-2">
        <div className="h-4" />
        <div className="h-4" />
        <Table>
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                    const { isDragging, setNodeRef, transform } = useSortable({
                        id: cell.column.id,
                    })
                    const style: CSSProperties = {
                        opacity: isDragging ? 0.8 : 1,
                        position: 'relative',
                        transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
                        transition: 'width transform 0.2s ease-in-out',
                        width: cell.column.getSize(),
                        zIndex: isDragging ? 1 : 0,
                    }
                    return (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <TableCell style={style} ref={setNodeRef}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      </SortableContext>
                    )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  )
}

export default Drag
