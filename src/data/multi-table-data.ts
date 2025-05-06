export function getData() {
  const data = [
    {
      wbs: '1',
      name: 'Phase 1',
      children: [
        {
          wbs: '1.1',
          name: 'Stage 1',
          status: 'Active',
          startDate: new Date(),
          endDate: new Date(),
          assigned: 'Staff B',
          discipline: 'Discipline B',
          units: 10,
          rate: 100,
          budget: 1000000,
          fee: 500,
          used: 'CUS',
          notes: 2,
          children: [
            { wbs: '1.1.1', name: 'Task 1' },
            { wbs: '1.1.2', name: 'Task 2' },
          ],
        },
      ],
    },
  ]
  return data;
}
