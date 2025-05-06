export function getData() {
  const data = [
    {
      product: "Rumours",
      artist: "Fleetwood Mac",
      category: "Soft Rock",
      year: "1977",
      status: "active",
      available: 12,
      incoming: 45,
      image: "rumours",
      price: 40,
      sold: 15,
      priceIncrease: 5, // in percentage
      variants: 3,
      variantDetails: [
        {
          title: "Rumours",
          available: 4,
          format: "LP, Album, Picture Disc, Reissue",
          label: "Warner Records",
          cat: "RPD1 3010",
          country: "Worldwide",
          year: "2024",
        },
        {
          title: "Rumours",
          available: 6,
          format: "Blu-Ray, Album, Reissue, Dolby Atoms",
          label: "Warner Records",
          cat: "BA2 3010",
          country: "Worldwide",
          year: "2024",
        },
        {
          title: "Rumours",
          available: 2,
          format: "CD, Album, Reissue, Remastered",
          label: "Warner Records",
          cat: "R2 599763",
          country: "Worldwide",
          year: "2024",
        },
      ],
    },
  
  ];
  return data;
}
