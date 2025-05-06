export function getData() {
  const data = [
    {
      a1: 'level 1 - 111',
      b1: 'level 1 - 222',
      children: [
        {
          a2: 'level 2 - 333',
          b2: 'level 2 - 444',
          children: [
            { a3: 'level 3 - 5551', b3: 'level 3 - 6661' },
            { a3: 'level 3 - 5552', b3: 'level 3 - 6662' },
            { a3: 'level 3 - 5553', b3: 'level 3 - 6663' },
            { a3: 'level 3 - 5554', b3: 'level 3 - 6664' },
            { a3: 'level 3 - 5555', b3: 'level 3 - 6665' },
            { a3: 'level 3 - 5556', b3: 'level 3 - 6666' },
          ],
        },
      ],
    },
  ]
  return data;
}
