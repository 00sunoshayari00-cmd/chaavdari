export interface Journey {
  id: number;
  key: "ingredients" | "preparation" | "packing" | "delivery";
  imageUrl: string;
}

export const JourneysData: Journey[] = [
  {
    id: 1,
    key: "ingredients",
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792755729/handpicked-ingredients.png",
  },
  {
    id: 2,
    key: "preparation",
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792755729/homemade-preparation.png",
  },
  {
    id: 3,
    key: "packing",
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792755731/freshly-packed.png",
  },
  {
    id: 4,
    key: "delivery",
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792755729/delivered-to-you.png",
  },
];
