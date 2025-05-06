import { start } from "repl";

export function getData() {
  return [
    {
      orgHierarchy: ['1'],
      name: 'Phase 1',
    },
    {
      orgHierarchy: ['1', '1.1'],
      name: 'stage 1',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(),
    },
    {
      orgHierarchy: ['1', '1.1', '1.1.1'],
      name: 'task 1',
      status: 'Completed',
      startDate: new Date(),
      endDate: new Date(),
    },
    {
      orgHierarchy: ['1', '1.1', '1.1.2'],
      name: 'task 2',
      status: 'Pending',
      startDate: new Date(),
      endDate: new Date(),
    },
  ]
}
