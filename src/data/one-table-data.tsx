export function getData() {
  return [
    {
      orgHierarchy: ['1'],
      name: 'Phase 1',
      status: '',
    },
    {
      orgHierarchy: ['1', '1.1'],
      name: 'stage 1',
      status: 'Active',
    },
    {
      orgHierarchy: ['1', '1.1', '1.1.1'],
      name: 'task 1',
      status: 'Completed',
    },
    {
      orgHierarchy: ['1', '1.1', '1.1.1'],
      name: 'task 2',
      status: 'Pending',
    },
  ]
}
