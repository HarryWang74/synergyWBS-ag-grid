import React, { useState, useRef, useEffect, useMemo, CSSProperties } from 'react';
import {
  Column,
  ColumnDef,
  ExpandedState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  useReactTable,
  Row,
  Header,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';

// DnD imports
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

import {
  restrictToHorizontalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

// Icons
import { v4 as uuid } from 'uuid';
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, GripVertical, Plus, Edit, Trash2, FileDown, FileUp } from 'lucide-react';
import { HiMiniEllipsisVertical } from 'react-icons/hi2';
import { LuPin } from 'react-icons/lu';
import { RiResetLeftLine } from 'react-icons/ri';
import { CiViewColumn } from 'react-icons/ci';

import { cn } from '@/lib/utils';

// ─── Type Definitions ───────────────────────────────────────────────────
type TaskType = 'project' | 'phase' | 'stage' | 'task';
type StatusType = 'Active' | 'Pending' | 'Complete';
type DisciplineType = 'Architecture' | 'Structure' | 'MEP' | 'Interior' | 'Landscape';

type Task = {
  id: string;
  orgHierarchy: string[]; // Work Breakdown Structure using AG Grid format ['1', '1.1', '1.1.1']
  name: string;
  type: TaskType;
  status: StatusType;
  startDate: Date;
  endDate: Date;
  discipline?: DisciplineType;
  progress: number;
  fee?: number;
  budget?: number;
  assignee?: {
    name: string;
    avatarUrl: string;
    initials: string;
  };
  notes?: string;
  subRows?: Task[];
  depth?: number;
  isPinned?: boolean;
};

// ─── Date Utilities ────────────────────────────────────────────────────
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

// Generate mock data with proper hierarchy
const createMockData = () => {
  const assignees = [
    { name: 'Alex Johnson', initials: 'AJ' },
    { name: 'Sam Taylor', initials: 'ST' },
    { name: 'Jordan Lee', initials: 'JL' },
    { name: 'Morgan Smith', initials: 'MS' },
  ];

  const getRandomAssignee = () => {
    const assignee = assignees[Math.floor(Math.random() * assignees.length)];
    return {
      ...assignee,
      avatarUrl: `https://i.pravatar.cc/100?u=${uuid()}`,
    };
  };

  const createTask = (
    id: string,
    orgHierarchy: string[],
    name: string,
    type: TaskType,
    status: StatusType = 'Pending',
    progress = Math.round(Math.random() * 100),
    fee?: number,
    budget?: number,
    discipline?: DisciplineType
  ): Task => {
    // Create random dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 30);

    return {
      id,
      orgHierarchy,
      name,
      type,
      status,
      startDate,
      endDate,
      discipline: discipline || (Math.random() > 0.5 ? 'Architecture' : 'Structure'),
      progress,
      fee,
      budget,
      assignee: getRandomAssignee(),
      notes: Math.random() > 0.7 ? 'Some notes here...' : undefined,
    };
  };

  // Create phases
  const tasks: Task[] = [
    createTask(uuid(), ['1'], 'Pre-Design', 'phase', 'Complete', 100, 25000, 30000),
    createTask(uuid(), ['1', '1.1'], 'Site Analysis', 'stage', 'Complete', 100, 8500, 10000, 'Architecture'),
    createTask(uuid(), ['1', '1.1', '1.1.1'], 'Survey Review', 'task', 'Complete', 100, 3500, 4000),
    createTask(uuid(), ['1', '1.1', '1.1.2'], 'Environmental Assessment', 'task', 'Complete', 100, 5000, 6000),
    createTask(uuid(), ['1', '1.2'], 'Feasibility Study', 'stage', 'Complete', 100, 16500, 20000, 'Architecture'),
    
    createTask(uuid(), ['2'], 'Schematic Design', 'phase', 'Active', 65, 75000, 100000),
    createTask(uuid(), ['2', '2.1'], 'Concept Development', 'stage', 'Complete', 100, 25000, 30000, 'Architecture'),
    createTask(uuid(), ['2', '2.1', '2.1.1'], 'Initial Sketches', 'task', 'Complete', 100, 15000, 18000),
    createTask(uuid(), ['2', '2.1', '2.1.2'], 'Client Review Meeting', 'task', 'Complete', 100, 2500, 3000),
    createTask(uuid(), ['2', '2.1', '2.1.3'], 'Revisions', 'task', 'Complete', 100, 7500, 9000),
    createTask(uuid(), ['2', '2.2'], 'Preliminary Drawings', 'stage', 'Active', 50, 50000, 70000, 'Architecture'),
    createTask(uuid(), ['2', '2.2', '2.2.1'], 'Floor Plans', 'task', 'Active', 80, 20000, 25000),
    createTask(uuid(), ['2', '2.2', '2.2.2'], 'Elevations', 'task', 'Pending', 30, 15000, 20000),
    createTask(uuid(), ['2', '2.2', '2.2.3'], 'Sections', 'task', 'Pending', 10, 15000, 25000),
    
    createTask(uuid(), ['3'], 'Design Development', 'phase', 'Pending', 0, 100000, 150000),
    createTask(uuid(), ['3', '3.1'], 'Technical Documentation', 'stage', 'Pending', 0, 60000, 80000, 'MEP'),
    createTask(uuid(), ['3', '3.1', '3.1.1'], 'HVAC Specification', 'task', 'Pending', 0, 20000, 25000),
    createTask(uuid(), ['3', '3.1', '3.1.2'], 'Electrical Systems', 'task', 'Pending', 0, 15000, 20000),
    createTask(uuid(), ['3', '3.1', '3.1.3'], 'Plumbing Documentation', 'task', 'Pending', 0, 25000, 35000),
    createTask(uuid(), ['3', '3.2'], 'Materials Selection', 'stage', 'Pending', 0, 40000, 70000, 'Interior'),
    
    createTask(uuid(), ['4'], 'Construction Documents', 'phase', 'Pending', 0, 50000, 80000),
  ];

  return tasks;
};

// ─── Column Pinning Styles ───────────────────────────────────────────────────
const getPinStyles = (column: Column<any>): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right');

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
  };
};

// ─── Status Cell Renderer ───────────────────────────────────────────────────
const StatusCell = ({ value }: { value: StatusType }) => {
  const variant: Record<StatusType, 'default' | 'secondary' | 'outline'> = {
    Active: 'default',
    Complete: 'secondary',
    Pending: 'outline',
  };
  
  return <Badge variant={variant[value]}>{value}</Badge>;
};

// ─── Progress Cell Renderer ───────────────────────────────────────────────────
const ProgressCell = ({ value }: { value: number }) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <Progress value={value} className="h-2 w-full" />
      <span className="text-xs text-slate-500 min-w-[40px] text-right">
        {value}%
      </span>
    </div>
  );
};

// ─── Amount Cell Renderer ───────────────────────────────────────────────────
const AmountCell = ({ value }: { value?: number }) => {
  if (value === undefined) return null;
  return <span>${value.toLocaleString()}</span>;
};

// ─── Assignee Cell Renderer ───────────────────────────────────────────────────
const AssigneeCell = ({ value }: { value?: Task['assignee'] }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={value.avatarUrl} alt={value.name} />
        <AvatarFallback>{value.initials}</AvatarFallback>
      </Avatar>
      <span>{value.name}</span>
    </div>
  );
};

// ─── Date Cell Renderer ───────────────────────────────────────────────────
const DateCell = ({ value }: { value: Date }) => {
  return <span>{formatDate(value)}</span>;
};

// ─── Draggable Header Component ───────────────────────────────────────────────────
const TableHeaderWrapper = ({
  header,
  table,
  openColumnsDialog,
  setOpenColumnsDialog,
}: {
  header: Header<any, unknown>;
  table: any;
  openColumnsDialog: boolean;
  setOpenColumnsDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    id: header.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  // Get sorting state for this column
  const isSorted = header.column.getIsSorted();

  return (
    <TableHead
      colSpan={header.colSpan}
      ref={setNodeRef}
      className="pr-6"
      style={{
        ...style,
        ...getPinStyles(header.column),
        boxShadow: 'none !important',
        backgroundColor: '#f5f5f5',
      }}
    >
      {header.column.id !== 'actions' && header.column.id !== 'select' ? (
        <>
          {/* drag control and sorting */}
          <div className="flex items-center">
            <span {...attributes} {...listeners} className="hover:cursor-move mr-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </span>
            <div 
              className="cursor-pointer flex items-center"
              onClick={() => {
                if (header.column.getCanSort()) {
                  header.column.toggleSorting(header.column.getIsSorted() === 'asc');
                }
              }}
            >
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
              
              {/* Sorting indicator */}
              {header.column.getCanSort() && (
                <span className="ml-2">
                  {isSorted === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : isSorted === 'desc' ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </span>
              )}
            </div>
          </div>
                
          {/* resize controls */}
          <div
            {...{
              onMouseDown: header.getResizeHandler(),
              onTouchStart: header.getResizeHandler(),
              className: `absolute h-[70%] top-[15%] w-[3px] bg-gray-200 right-[0px] hover:bg-gray-300 cursor-ew-resize ${
                header.column.getIsResizing() ? 'isResizing' : ''
              }`,
            }}
          />
          
          {/* header drop down */}
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
              {/* pin start */}
              <DropdownMenuLabel>
                <LuPin className="mr-2 inline-block" />
                Pin Column
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={header.column.getIsPinned() === false}
                onCheckedChange={() => header.column.pin(false)}
              >
                No Pin
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={header.column.getIsPinned() === 'left'}
                onCheckedChange={() => header.column.pin('left')}
              >
                Pin Left
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={header.column.getIsPinned() === 'right'}
                onCheckedChange={() => header.column.pin('right')}
              >
                Pin Right
              </DropdownMenuCheckboxItem>
              {/* pin finish */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  table.resetColumnSizing();
                }}
              >
                <RiResetLeftLine className="mr-2 inline-block" />
                Reset Size
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setOpenColumnsDialog(!openColumnsDialog)}
              >
                <CiViewColumn className="mr-2 inline-block" />
                Choose Columns
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : header.isPlaceholder ? null : (
        // no feature headers
        flexRender(header.column.columnDef.header, header.getContext())
      )}
    </TableHead>
  );
};

// ─── Component for Rendering Hierarchical Rows ──────────────────────────
function RecursiveRow({
  row,
  level = 0,
  table,
}: {
  row: Row<Task>;
  level?: number;
  table: any;
}) {
  const rowData = row.original;
  const taskType = rowData.type;

  // Calculate indentation for hierarchy
  const paddingLeft = level * 16;

  // Determine row styling based on row type
  const getRowStyles = () => {
    const baseStyle = 'transition-colors duration-150 hover:bg-slate-50 ';
    
    if (taskType === 'phase') {
      return `${baseStyle} bg-slate-100 font-semibold z-10`;
    } else if (taskType === 'stage') {
      return `${baseStyle} bg-white/90`;
    }
    
    return `${baseStyle} bg-white`;
  };

  return (
    <>
      <TableRow className={getRowStyles()} data-state={row.getIsSelected() ? 'selected' : undefined}>
        {row.getVisibleCells().map((cell, i) => (
          <TableCell
            key={cell.id}
            className="py-2 bg-white"
            style={{ 
              ...getPinStyles(cell.column),
              // Add additional styling for the first column to handle indentation
              ...(i === 0 && { paddingLeft: `${8 + paddingLeft}px` }),
            }}
          >
            {i === 0 ? (
              <div className="flex items-center">
                {/* Expand/collapse button for rows with children */}
                {row.getCanExpand() ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mr-1 h-6 w-6 p-0 text-slate-500 hover:text-slate-800"
                    onClick={() => row.toggleExpanded()}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${row.getIsExpanded() ? '' : '-rotate-90'}`}
                    />
                  </Button>
                ) : (
                  <div className="w-6" /> // Spacer for leaf nodes
                )}
                
                {/* Cell content */}
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ) : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}
          </TableCell>
        ))}
      </TableRow>
      
      {/* Render child rows recursively if expanded */}
      {row.getIsExpanded() &&
        row.getRowModel().rows.map((subRow) => (
          <RecursiveRow
            key={subRow.id}
            row={subRow}
            level={level + 1}
            table={table}
          />
        ))}
    </>
  );
}

// ─── Row Actions Cell Renderer ───────────────────────────────────────────────────
const RowActionsCell = ({ row, onEdit, onDelete }: { row: Row<Task>, onEdit: (row: Row<Task>) => void, onDelete: (row: Row<Task>) => void }) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(row)}
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(row)}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// ─── Main Table Component ───────────────────────────────────────────────────
export function EnhancedWBSTable() {
  // ─── State Management ───────────────────────────────────────────────────
  const [data, setData] = useState<Task[]>(createMockData());
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [editingRow, setEditingRow] = useState<Task | null>(null);
  const [openColumnsDialog, setOpenColumnsDialog] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [newTaskType, setNewTaskType] = useState<TaskType>('task');
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  
  // ─── Column Definitions ───────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllRowsSelected() ||
              (table.getIsSomeRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const name = row.getValue('name') as string;
          const type = row.original.type;
          
          // Different styling based on task type
          let className = "font-medium ";
          if (type === 'phase') {
            className += "text-slate-900 text-base";
          } else if (type === 'stage') {
            className += "text-slate-800";
          } else {
            className += "text-slate-700";
          }
          
          return <span className={className}>{name}</span>;
        },
        size: 250,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusCell value={getValue() as StatusType} />,
        filterFn: 'equals',
        size: 100,
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ getValue }) => <DateCell value={getValue() as Date} />,
        sortingFn: 'datetime',
        size: 120,
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ getValue }) => <DateCell value={getValue() as Date} />,
        sortingFn: 'datetime',
        size: 120,
      },
      {
        accessorKey: 'discipline',
        header: 'Discipline',
        cell: (info) => info.getValue(),
        size: 120,
      },
      {
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ getValue }) => <ProgressCell value={getValue() as number} />,
        size: 150,
      },
      {
        accessorKey: 'fee',
        header: 'Fee',
        cell: ({ getValue }) => <AmountCell value={getValue() as number} />,
        size: 100,
      },
      {
        accessorKey: 'budget',
        header: 'Budget',
        cell: ({ getValue }) => <AmountCell value={getValue() as number} />,
        size: 100,
      },
      {
        accessorKey: 'assignee',
        header: 'Assignee',
        cell: ({ getValue }) => <AssigneeCell value={getValue() as Task['assignee']} />,
        size: 180,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: (info) => info.getValue(),
        size: 150,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActionsCell 
            row={row} 
            onEdit={(row) => {
              setEditingRow(row.original);
              setEditDialogOpen(true);
            }}
            onDelete={(row) => {
              // Confirm before deleting
              if (window.confirm(`Are you sure you want to delete "${row.original.name}"?`)) {
                // Remove the row and its children from the data
                setData(prev => prev.filter(item => 
                  !item.orgHierarchy.join('.').startsWith(row.original.orgHierarchy.join('.'))
                ));
              }
            }}
          />
        ),
        enableSorting: false,
        size: 80,
      },
    ],
    []
  );

  // Set column order on initial load
  useEffect(() => {
    setColumnOrder(columns.map(col => col.id!));
  }, [columns]);

  // Prepare data for table, organizing hierarchical data
  const flatData = useMemo(() => {
    return data.sort((a, b) => {
      // Sort by orgHierarchy to ensure proper order
      return a.orgHierarchy.join('.').localeCompare(b.orgHierarchy.join('.'));
    });
  }, [data]);

  // Get subRows for a row based on orgHierarchy pattern
  const getSubRows = (row: Task) => {
    const rowOrgPath = row.orgHierarchy.join('.');
    // Find direct children (next level only)
    return flatData.filter(item => {
      const itemOrgPath = item.orgHierarchy.join('.');
      // Match if item's hierarchy is one level deeper than row's
      const segments = itemOrgPath.split('.');
      const parentPath = segments.slice(0, -1).join('.');
      return parentPath === rowOrgPath && itemOrgPath !== rowOrgPath;
    });
  };

  // Set up table with tanstack/react-table
  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      expanded,
      sorting,
      columnVisibility,
      rowSelection,
      columnOrder,
    },
    getSubRows,
    enableSubRowSelection: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: 'onChange',
  });

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // Add/Edit row handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Get form values
    const name = formData.get('name') as string;
    const status = formData.get('status') as StatusType;
    const discipline = formData.get('discipline') as DisciplineType;
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const progress = parseInt(formData.get('progress') as string);
    const fee = parseFloat(formData.get('fee') as string);
    const budget = parseFloat(formData.get('budget') as string);
    const notes = formData.get('notes') as string;
    
    // Process dates
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Create orgHierarchy based on selected parent and task type
    let orgHierarchy: string[] = [];
    
    if (selectedParent) {
      // Find the parent task
      const parentTask = flatData.find(task => task.id === selectedParent);
      
      if (parentTask) {
        // Create a new level in the hierarchy
        const parentHierarchy = [...parentTask.orgHierarchy];
        
        // Find the next available index at this level
        const siblingTasks = flatData.filter(task => 
          task.orgHierarchy.length === parentHierarchy.length + 1 &&
          task.orgHierarchy.slice(0, -1).join('.') === parentHierarchy.join('.')
        );
        
        const maxIndex = siblingTasks.length > 0
          ? Math.max(...siblingTasks.map(t => parseInt(t.orgHierarchy[t.orgHierarchy.length - 1])))
          : 0;
        
        orgHierarchy = [...parentHierarchy, (maxIndex + 1).toString()];
      } else {
        // If parent not found, create a top-level task
        const topLevelTasks = flatData.filter(task => task.orgHierarchy.length === 1);
        const maxIndex = topLevelTasks.length > 0
          ? Math.max(...topLevelTasks.map(t => parseInt(t.orgHierarchy[0])))
          : 0;
        
        orgHierarchy = [(maxIndex + 1).toString()];
      }
    } else {
      // Create a new top-level task
      const topLevelTasks = flatData.filter(task => task.orgHierarchy.length === 1);
      const maxIndex = topLevelTasks.length > 0
        ? Math.max(...topLevelTasks.map(t => parseInt(t.orgHierarchy[0])))
        : 0;
      
      orgHierarchy = [(maxIndex + 1).toString()];
    }
    
    // Create the new task
    const newTask: Task = {
      id: uuid(),
      orgHierarchy,
      name,
      type: newTaskType,
      status,
      startDate,
      endDate,
      discipline,
      progress,
      fee: isNaN(fee) ? undefined : fee,
      budget: isNaN(budget) ? undefined : budget,
      notes: notes || undefined,
      assignee: {
        name: 'New Assignee',
        initials: 'NA',
        avatarUrl: `https://i.pravatar.cc/100?u=${uuid()}`,
      },
    };
    
    // Add task to the data
    setData(prev => [...prev, newTask]);
    
    // Reset form and close dialog
    form.reset();
    setAddDialogOpen(false);
    setSelectedParent(null);
    setNewTaskType('task');
  };
  
  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Get form values
    const name = formData.get('name') as string;
    const status = formData.get('status') as StatusType;
    const discipline = formData.get('discipline') as DisciplineType;
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const progress = parseInt(formData.get('progress') as string);
    const fee = parseFloat(formData.get('fee') as string);
    const budget = parseFloat(formData.get('budget') as string);
    const notes = formData.get('notes') as string;
    
    // Process dates
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Update task in the data
    setData(prev => prev.map(task => {
      if (task.id === editingRow.id) {
        return {
          ...task,
          name,
          status,
          discipline,
          startDate,
          endDate,
          progress,
          fee: isNaN(fee) ? undefined : fee,
          budget: isNaN(budget) ? undefined : budget,
          notes: notes || undefined,
        };
      }
      return task;
    }));
    
    // Reset form and close dialog
    setEditDialogOpen(false);
    setEditingRow(null);
  };

  // Export to Excel/CSV function
  const handleExportData = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    const headers = columns
      .filter(col => col.id !== 'actions' && col.id !== 'select')
      .map(col => {
        if (typeof col.header === 'string') return col.header;
        // Use accessorKey or id as fallback
        return (col as any).accessorKey || col.id || '';
      });
    
    csvContent += headers.join(',') + '\r\n';
    
    // Add data rows
    const exportRows = table.getFilteredRowModel().flatRows;
    
    exportRows.forEach(row => {
      const rowData = columns
        .filter(col => col.id !== 'actions' && col.id !== 'select')
        .map(col => {
          const id = (col as any).accessorKey || col.id || '';
          let value = row.getValue(id);
          
          // Format based on type
          if (value instanceof Date) {
            return formatDate(value);
          } else if (typeof value === 'object') {
            // Handle complex objects like assignee
            if (id === 'assignee' && value) {
              return (value as any).name || '';
            }
            return JSON.stringify(value)?.replace(/,/g, ';');
          }
          
          // Convert to string and escape commas
          return value !== undefined && value !== null 
            ? String(value).replace(/,/g, ';')
            : '';
        });
        
      csvContent += rowData.join(',') + '\r\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'wbs_table_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Expand/collapse all rows
  const toggleExpandAll = () => {
    setExpanded(prev => typeof prev === 'boolean' ? !prev : true);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Work Breakdown Structure</h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleExpandAll}
          >
            {typeof expanded === 'boolean' && expanded ? 'Collapse All' : 'Expand All'}
          </Button>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">Type</label>
                    <select 
                      id="type" 
                      name="type" 
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                      required
                    >
                      <option value="phase">Phase</option>
                      <option value="stage">Stage</option>
                      <option value="task">Task</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="parent" className="text-sm font-medium">Parent</label>
                    <select 
                      id="parent" 
                      name="parent" 
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedParent || ''}
                      onChange={(e) => setSelectedParent(e.target.value || null)}
                    >
                      <option value="">None (Top Level)</option>
                      {data
                        .filter(item => item.type !== 'task') // Only phases and stages can be parents
                        .map(item => (
                          <option key={item.id} value={item.id}>
                            {item.orgHierarchy.join('.')} - {item.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <select 
                      id="status" 
                      name="status" 
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue="Pending"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Complete">Complete</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                    <Input 
                      id="startDate" 
                      name="startDate" 
                      type="date" 
                      defaultValue={new Date().toISOString().substring(0, 10)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                    <Input 
                      id="endDate" 
                      name="endDate" 
                      type="date" 
                      defaultValue={new Date(Date.now() + 30*24*60*60*1000).toISOString().substring(0, 10)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="discipline" className="text-sm font-medium">Discipline</label>
                    <select 
                      id="discipline" 
                      name="discipline" 
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      defaultValue="Architecture"
                    >
                      <option value="Architecture">Architecture</option>
                      <option value="Structure">Structure</option>
                      <option value="MEP">MEP</option>
                      <option value="Interior">Interior</option>
                      <option value="Landscape">Landscape</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="progress" className="text-sm font-medium">Progress (%)</label>
                    <Input 
                      id="progress" 
                      name="progress" 
                      type="number" 
                      min="0" 
                      max="100" 
                      defaultValue="0"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="fee" className="text-sm font-medium">Fee</label>
                    <Input 
                      id="fee" 
                      name="fee" 
                      type="number" 
                      min="0" 
                      step="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="budget" className="text-sm font-medium">Budget</label>
                    <Input 
                      id="budget" 
                      name="budget" 
                      type="number" 
                      min="0" 
                      step="100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
          >
            <FileDown className="mr-1 h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenColumnsDialog(true)}
          >
            <CiViewColumn className="mr-1 h-4 w-4" />
            Columns
          </Button>
        </div>
      </div>
      
      {/* Column visibility dialog */}
      <div
        id="columns-dialog"
        className={cn(
          'fixed top-[100px] left-[100px] bg-white shadow-lg z-50 p-4 rounded',
          !openColumnsDialog && 'hidden'
        )}
        style={{ 
          position: 'fixed', 
          width: '300px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
        }}
      >
        <div className="py-2 flex items-center justify-between border-b mb-2">
          <span className="font-medium">Choose Columns</span>
          <button
            className="ml-auto px-2 py-1 text-gray-500 hover:text-gray-700"
            onClick={() => setOpenColumnsDialog(false)}
          >
            X
          </button>
        </div>
        <Input
          placeholder="Filter columns..."
          value={table.getState().globalFilter || ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="mb-2 p-1 border rounded w-full"
        />
        <div className="max-h-[300px] overflow-y-auto">
          {table
            .getAllColumns()
            .filter((column) => {
              const keyword = table.getState().globalFilter?.toLowerCase() || '';
              return (
                column.getCanHide() && 
                column.id.toLowerCase().includes(keyword)
              );
            })
            .map((column) => {
              return (
                <div key={column.id} className="p-2 flex items-center">
                  <Checkbox
                    id={column.id + '-toggle'}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    className="mr-2"
                  />
                  <label htmlFor={column.id + '-toggle'} className="cursor-pointer text-sm">
                    {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                  </label>
                </div>
              );
            })}
        </div>
      </div>
      
      {/* Edit task dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingRow && (
            <form onSubmit={handleEditTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={editingRow.name} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-status" className="text-sm font-medium">Status</label>
                  <select 
                    id="edit-status" 
                    name="status" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={editingRow.status}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-startDate" className="text-sm font-medium">Start Date</label>
                  <Input 
                    id="edit-startDate" 
                    name="startDate" 
                    type="date" 
                    defaultValue={editingRow.startDate.toISOString().substring(0, 10)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-endDate" className="text-sm font-medium">End Date</label>
                  <Input 
                    id="edit-endDate" 
                    name="endDate" 
                    type="date" 
                    defaultValue={editingRow.endDate.toISOString().substring(0, 10)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-discipline" className="text-sm font-medium">Discipline</label>
                  <select 
                    id="edit-discipline" 
                    name="discipline" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={editingRow.discipline || 'Architecture'}
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="Structure">Structure</option>
                    <option value="MEP">MEP</option>
                    <option value="Interior">Interior</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-progress" className="text-sm font-medium">Progress (%)</label>
                  <Input 
                    id="edit-progress" 
                    name="progress" 
                    type="number" 
                    min="0" 
                    max="100" 
                    defaultValue={editingRow.progress}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-fee" className="text-sm font-medium">Fee</label>
                  <Input 
                    id="edit-fee" 
                    name="fee" 
                    type="number" 
                    min="0" 
                    step="100"
                    defaultValue={editingRow.fee}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-budget" className="text-sm font-medium">Budget</label>
                  <Input 
                    id="edit-budget" 
                    name="budget" 
                    type="number" 
                    min="0" 
                    step="100"
                    defaultValue={editingRow.budget}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-notes" className="text-sm font-medium">Notes</label>
                <textarea 
                  id="edit-notes" 
                  name="notes" 
                  className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={editingRow.notes}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      <div className="rounded-md border shadow-sm overflow-auto">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <Table
            style={{
              width: table.getTotalSize(),
            }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHeaderWrapper
                        key={header.id}
                        header={header}
                        table={table}
                        openColumnsDialog={openColumnsDialog}
                        setOpenColumnsDialog={setOpenColumnsDialog}
                      />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows
                  .filter(row => row.depth === 0) // Only render top-level rows
                  .map((row) => (
                    <RecursiveRow
                      key={row.id}
                      row={row}
                      table={table}
                    />
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              className="h-8 w-16 rounded-md border border-input bg-transparent"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              {">"}
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedWBSTable;