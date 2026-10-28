export interface OurOffering {
  id: number;
  key: "namkeen" | "sweets" | "baked";
  bannerImageUrl: string;
  rectangleImageUrl: string;
  ellipseImageUrl: string;
}

export const OurOfferingsData: OurOffering[] = [
  {
    id: 1,
    key: "namkeen",
    bannerImageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792511961/traditional-namkeen-and-snacks.png",
    rectangleImageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792469130/traditional-namkeen-and-snacks-rectangle.png",
    ellipseImageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792469130/traditional-namkeen-and-snacks-ellipse.png",
  },
  {
    id: 2,
    key: "sweets",
    bannerImageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792515708/traditional-sweets-mithai.png",
    rectangleImageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792469130/traditional-sweets-mithai-rectangle.png",
    ellipseImageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792469130/traditional-sweets-mithai-ellipse.png",
  },
  {
    id: 3,
    key: "baked",
    bannerImageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792515735/baked-and-special-treats.png",
    rectangleImageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792469130/baked-and-special-treats-rectangle.png",
    ellipseImageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1792469130/baked-and-special-treats-ellipse.png",
  },
];
