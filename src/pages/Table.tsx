'use client';

import React, { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  Row,
  ExpandedState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { v4 as uuid } from 'uuid';

// ─── Type Definitions ───────────────────────────────────────────────────
type TaskType = 'project' | 'phase' | 'stage' | 'task';

type Task = {
  id: string;
  wbs: string; // Work Breakdown Structure number using standard numbering pattern:
               // Phases: 1, 2, 3, ... (top-level items)
               // Stages: 1.1, 1.2, 2.1, 2.2, ... (second-level items)
               // Tasks: 1.1.1, 1.1.2, 2.1.1, ... (third-level items)
  name: string;
  type: TaskType;
  status: string;
  startDate: string;
  endDate: string;
  discipline: string;
  progress: number;
  fee: string;
  assignee: {
    name: string;
    avatarUrl: string;
    initials: string;
  };
  subRows?: Task[];
  depth?: number; // Track hierarchy depth for styling
  parentId?: string; // Reference to parent for pinning
  isPinned?: boolean; // Flag for pinned rows
  isChecked?: boolean; // For checkbox selection
};

// ─── Date Utilities ────────────────────────────────────────────────────
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Format date as "MMM DD, YYYY" (e.g. "Jan 01, 2023")
const formatDate = (date: Date): string => {
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

// Parse date string in format "MMM DD, YYYY" (e.g. "Jan 01, 2023")
const parseDate = (dateStr: string): Date => {
  try {
    const [month, rest] = dateStr.split(' ');
    const day = rest.split(',')[0];
    const year = rest.split(', ')[1];
    const monthIndex = months.indexOf(month);
    return new Date(parseInt(year), monthIndex, parseInt(day));
  } catch (e) {
    return new Date(0); // Fallback
  }
};

// ─── Mock Data Generation ───────────────────────────────────────────────
// List of mock assignees
const assignees = [
  { name: 'Alex Johnson', initials: 'AJ' },
  { name: 'Sam Taylor', initials: 'ST' },
  { name: 'Jordan Lee', initials: 'JL' },
  { name: 'Morgan Smith', initials: 'MS' },
  { name: 'Casey Brown', initials: 'CB' },
  { name: 'Riley Wilson', initials: 'RW' },
];

// Helper function to create task objects
const createTask = (
  wbs: string,
  name: string,
  type: TaskType = 'task',
  status = 'Pending',
  fee = '$0',
  children: Task[] = [],
  parentId?: string,
  depth = 0,
): Task => {
  // Generate random dates
  const startYear = 2022 + Math.floor(Math.random() * 3);
  const startMonth = Math.floor(Math.random() * 12);
  const startDay = 1 + Math.floor(Math.random() * 28);
  const endMonthsOffset = 1 + Math.floor(Math.random() * 12);

  const startDate = new Date(startYear, startMonth, startDay);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + endMonthsOffset);
  startDate.setDate(Math.floor(Math.random() * 28) + 1);

  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  // Generate random assignee
  const randomAssigneeIndex = Math.floor(Math.random() * assignees.length);
  const assignee = assignees[randomAssigneeIndex];
  const avatarSize = 100 + Math.floor(Math.random() * 50);
  const avatarUrl = `https://i.pravatar.cc/${avatarSize}?u=${uuid()}`;

  const taskId = uuid();

  // Process children with correct IDs and WBS
  let childIndex = 1;
  const processedChildren = children.map((child) => {
    const childWbs = child.wbs || `${wbs}.${childIndex++}`;
    return {
      ...child,
      wbs: childWbs,
      parentId: child.parentId || taskId,
      depth: child.depth !== undefined ? child.depth : depth + 1,
    };
  });

  return {
    id: taskId,
    wbs,
    name,
    type,
    status,
    startDate: startDateFormatted,
    endDate: endDateFormatted,
    discipline: 'Architecture',
    progress: Math.round(Math.random() * 100),
    fee,
    assignee: {
      ...assignee,
      avatarUrl,
    },
    depth,
    parentId,
    isPinned: type === 'phase',
    isChecked: false,
    subRows: processedChildren,
  };
};

// Create phase 1 with stages and tasks
const phase1 = createTask('1', 'Pre-Design', 'phase', 'Complete', '$25000', [
  createTask('1.1', 'Site Analysis', 'stage', 'Complete', '$8500', [
    createTask('1.1.1', 'Survey Review', 'task', 'Complete', '$3500'),
    createTask('1.1.2', 'Environmental Assessment', 'task', 'Complete', '$5000'),
  ]),
  createTask('1.2', 'Feasibility Study', 'stage', 'Complete', '$16500'),
]);

// Create phase 2 with stages and tasks
const phase2 = createTask('2', 'Schematic Design', 'phase', 'Active', '$75000', [
  createTask('2.1', 'Concept Development', 'stage', 'Complete', '$25000', [
    createTask('2.1.1', 'Initial Sketches', 'task', 'Complete', '$15000'),
    createTask('2.1.2', 'Client Review Meeting', 'task', 'Complete', '$2500'),
    createTask('2.1.3', 'Revisions', 'task', 'Complete', '$7500'),
  ]),
  createTask('2.2', 'Preliminary Drawings', 'stage', 'Active', '$50000', [
    createTask('2.2.1', 'Floor Plans', 'task', 'Active', '$20000'),
    createTask('2.2.2', 'Elevations', 'task', 'Pending', '$15000'),
    createTask('2.2.3', 'Sections', 'task', 'Pending', '$15000'),
  ]),
]);

// Create phase 3 with stages and tasks
const phase3 = createTask('3', 'Design Development', 'phase', 'Pending', '$100000', [
  createTask('3.1', 'Technical Documentation', 'stage', 'Pending', '$60000', [
    createTask('3.1.1', 'HVAC Specification', 'task', 'Pending', '$20000'),
    createTask('3.1.2', 'Electrical Systems', 'task', 'Pending', '$15000'),
    createTask('3.1.3', 'Plumbing Documentation', 'task', 'Pending', '$25000', [
      createTask('3.1.3.1', 'Plumbing Fixtures', 'task', 'Pending', '$10000'),
      createTask('3.1.3.2', 'Plumbing Layout', 'task', 'Pending', '$15000'),
    ]),
  ]),
  createTask('3.2', 'Materials Selection', 'stage', 'Pending', '$40000'),
]);

// Create phase 4
const phase4 = createTask('4', 'Construction Documents', 'phase', 'Pending', '$50000');

// Combine all phases into initial data array
const initialData: Task[] = [phase1, phase2, phase3, phase4];

// ─── Column Definitions ──────────────────────────────────────────────
const defaultColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'wbs',
    header: () => (
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          className="h-4 w-4 rounded border-gray-300 text-primary transition-colors focus:ring-0 focus:ring-offset-0" 
          onChange={() => {/* No-op for now */}}
        />
        <span className="font-medium">WBS</span>
      </div>
    ),
    cell: (info) => {
      const wbs = info.getValue() as string;
      const row = info.row.original;
      
      // Apply different styles based on the row type
      let className = "font-medium ";
      if (row.type === 'phase') {
        className += "text-slate-800 text-base"; // Phase level
      } else {
        className += "text-slate-700"; // All other levels
      }
      
      return (
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            className="h-4 w-4 rounded border-gray-300 text-primary transition-colors focus:ring-0 focus:ring-offset-0" 
            checked={row.isChecked || false}
            onChange={() => {/* No-op for now */}}
          />
          <span className={className}>
            {row.type === 'project' ? '' : wbs}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => (
      <span className="font-medium">{info.getValue() as React.ReactNode}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const status = info.getValue() as string;
      const variant: Record<
        string,
        'default' | 'destructive' | 'outline' | 'secondary'
      > = {
        Active: 'default',
        Complete: 'secondary',
        Pending: 'outline',
      };
      return <Badge variant={variant[status] || 'default'}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    enableSorting: true,
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    enableSorting: true,
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'discipline',
    header: 'Discipline',
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: (info) => {
      const progress = info.getValue() as number;
      
      return (
        <div className="flex items-center gap-2 w-full">
          <Progress value={progress} className="h-2 w-full" />
          <span className="text-xs text-slate-500 min-w-[40px] text-right">
            {progress}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'fee',
    header: 'Fee/Cap',
  },
  {
    accessorKey: 'assignee',
    header: 'Assignee',
    cell: (info) => {
      const assignee = info.getValue() as Task['assignee'];
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
            <AvatarFallback>{assignee.initials}</AvatarFallback>
          </Avatar>
          <span>{assignee.name}</span>
        </div>
      );
    },
  },
];

// ─── Component for Column Sorting ───────────────────────────────────────
function SortableHeader({ column, children }: { column: any; children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        column.toggleSorting(column.getIsSorted() === 'asc');
      }}
      className="flex cursor-pointer items-center whitespace-nowrap select-none"
    >
      {children}
      {column.getCanSort() && (
        <span className="ml-2 inline-flex">
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
        </span>
      )}
    </div>
  );
}

// ─── Component for Draggable Headers ────────────────────────────────────
function DraggableHeader({ column, header }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : 0,
    cursor: 'grab',
    backgroundColor: isDragging ? '#f9fafb' : undefined,
    boxShadow: isDragging
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      : undefined,
  };

  const isSortable = header.column.getCanSort();
  
  // Get header content - either a string or a component function
  const headerContent = (() => {
    if (typeof header.column.columnDef.header === 'function') {
      return header.column.columnDef.header();
    } else if (typeof header.column.columnDef.header === 'string') {
      return header.column.columnDef.header;
    }
    return '';
  })();

  return (
    <TableHead ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <div {...attributes} {...listeners}>
          <GripVertical className="h-3 w-3 cursor-grab opacity-40" />
        </div>

        {/* Header content */}
        <div className="flex-grow" onClick={(e) => e.stopPropagation()}>
          {isSortable && typeof headerContent === 'string' ? (
            <SortableHeader column={header.column}>{headerContent}</SortableHeader>
          ) : (
            headerContent
          )}
        </div>
      </div>
    </TableHead>
  );
}

// ─── Component for Rendering Hierarchical Rows ──────────────────────────
function RecursiveRow({
  row,
  level = 0,
  handleDuplicate,
}: {
  row: Row<Task>;
  level?: number;
  handleDuplicate: (row: Row<Task>) => void;
}) {
  const rowData = row.original;
  const isPhase = rowData.type === 'phase';

  // Calculate indentation
  const getCellPadding = () => level * 16;

  // Determine row styling
  const getRowStyles = () => {
    const baseStyle = 'transition-colors duration-150 hover:bg-slate-50 ';
    
    // Only phase rows get special styling
    if (isPhase) {
      return `${baseStyle} bg-slate-100 font-semibold sticky top-0 z-20 shadow-sm`;
    }
    return `${baseStyle} bg-white`;
  };

  return (
    <>
      <TableRow className={getRowStyles()}>
        {row.getVisibleCells().map((cell, i) => (
          <TableCell key={cell.id} className={i === 0 ? 'relative' : ''}>
            {i === 0 ? (
              <div className="flex items-center">
                {/* Indentation based on hierarchy level */}
                <div
                  style={{ width: `${getCellPadding()}px` }}
                  className="flex-shrink-0"
                />

                {/* Expand/collapse button */}
                {row.subRows && row.subRows.length > 0 ? (
                  <button
                    type="button"
                    className="mr-2 flex h-6 w-6 items-center justify-center text-slate-500 hover:text-slate-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      row.toggleExpanded();
                    }}
                  >
                    {row.getIsExpanded() ? '▾' : '▸'}
                  </button>
                ) : (
                  <div className="mr-2 h-6 w-6" />
                )}

                {/* Cell content */}
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ) : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}
          </TableCell>
        ))}

        {/* Actions cell */}
        <TableCell className="text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDuplicate(row)}
          >
            Duplicate
          </Button>
        </TableCell>
      </TableRow>

      {/* Render child rows recursively if expanded */}
      {row.getIsExpanded() &&
        row.subRows &&
        row.subRows.length > 0 &&
        row.subRows.map((subRow) => (
          <RecursiveRow
            key={subRow.id}
            row={subRow}
            level={level + 1}
            handleDuplicate={handleDuplicate}
          />
        ))}
    </>
  );
}

// ─── Main Table Component ─────────────────────────────────────────────
export default function DataTableDemo() {
  const [data, setData] = useState<Task[]>(initialData);
  console.log('Data:', data);
  const [columns, setColumns] = useState(defaultColumns);
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Create expanded state with all phase rows expanded
  // A simple solution: hard-code the expanded state to true for all rows
  const [expandedState, setExpandedState] = useState<ExpandedState>(true);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      expanded: expandedState,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpandedState,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableExpanding: true,
    getSubRows: (row) => row.subRows,
    autoResetExpanded: false,
  });

  const handleDuplicate = (row: Row<Task>) => {
    const duplicate = JSON.parse(JSON.stringify(row.original));
    duplicate.id = uuid(); // Ensure unique ID for the duplicate
    setData((old) => [...old, duplicate]);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Get column indices
    const headerGroup = table.getHeaderGroups()[0];
    const activeColumnIndex = headerGroup.headers.findIndex(
      (header) => header.column.id === active.id,
    );
    const overColumnIndex = headerGroup.headers.findIndex(
      (header) => header.column.id === over.id,
    );

    if (activeColumnIndex === -1 || overColumnIndex === -1) return;

    // Reorder columns
    const newCols = arrayMove([...columns], activeColumnIndex, overColumnIndex);
    setColumns(newCols);
  };

  return (
    <div className="rounded-md border bg-white p-4 shadow-sm">
      <div className="max-h-[70vh] overflow-auto">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <Table>
            <TableHeader className="sticky top-0 z-40 bg-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={headerGroup.headers.map((h) => h.column.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableHeader
                        key={header.id}
                        column={header.column}
                        header={header}
                      />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {/* Filter to only show phase rows at the root level */}
              {table.getRowModel().rows
                .filter(row => row.original.type === 'phase')
                .map((row) => (
                  <RecursiveRow
                    key={row.id}
                    row={row}
                    handleDuplicate={handleDuplicate}
                  />
                ))}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}