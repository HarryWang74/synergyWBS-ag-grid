import { v4 as uuid } from 'uuid'
export function getData() {
  return [
    {
      wbs: '1',
      name: 'Phase 1',
      id: 'phase_' + uuid(),
      type: 'phase',
      subRows: [
        {
          wbs: '1.1',
          name: 'Stage 1',
          status: { id: 2, name: 'In progress' },
          startDate: new Date(),
          endDate: new Date(),
          assigned: 'Staff A',
          discipline: 'Discipline A',
          units: 20,
          rate: 200,
          budget: 2000000,
          fee: 1000,
          used: 'CUS',
          notes: 2,
          id: 'stage_' + uuid(),
          type: 'stage',
          subRows: [
            {
              wbs: '1.1.1',
              name: 'Task 1',
              status: { id: 2, name: 'In progress' },
              startDate: new Date(),
              endDate: new Date(),
              assigned: 'Staff A',
              notes: 2,
              id: 'task_' + uuid(),
              type: 'task',
            },
            {
              wbs: '1.1.2',
              name: 'Task 2',
              status: { id: 2, name: 'In progress' },
              startDate: new Date(),
              endDate: new Date(),
              assigned: 'Staff A',
              notes: 2,
              id: 'task_' + uuid(),
              type: 'task',
            },
          ],
        },
        {
          wbs: '1.2',
          name: 'Stage 2',
          status: 'Active',
          startDate: new Date(),
          endDate: new Date(),
          assigned: 'Staff A',
          discipline: 'Discipline B',
          units: 10,
          rate: 100,
          budget: 1000000,
          fee: 500,
          used: 'CUS',
          notes: 1,
          id: 'stage_' + uuid(),
          type: 'stage',
          subRows: [
            {
              wbs: '1.2.1',
              name: 'Task 3',
              status: { id: 1, name: 'Not started' },
              startDate: new Date(),
              endDate: new Date(),
              assigned: 'Staff B',
              notes: 1,
              id: 'task_' + uuid(),
              type: 'task',
            },
            {
              wbs: '1.2.2',
              name: 'Task 4',
              status: 'Completed',
              startDate: new Date(),
              endDate: new Date(),
              assigned: 'Staff B',
              notes: 1,
              id: 'task_' + uuid(),
              type: 'task',
            },
          ],
        },
      ],
    },
  ]
}
