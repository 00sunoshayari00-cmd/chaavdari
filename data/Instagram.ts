export interface InstagramPost {
  id: number;
  imageUrl: string;
  alt: string;
  href: string; // link to the Instagram post
}

export const INSTAGRAM_URL = "https://www.instagram.com/chaavdari/"; // update if different

// Your custom button icons: upload to Cloudinary (or /public) and paste the URLs.
// Leave the same image for both if you want, the prev one is flipped in the component.
export const PREV_ICON_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/v1793014011/arrow-in-up-circle-half.svg";
export const NEXT_ICON_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/v1793014122/arrow-in-right-circle-half.svg";

// Replace with your real post images and links
export const InstagramPostsData: InstagramPost[] = [
  {
    id: 1,
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1793014555/post-1.png",
    alt: "Chaavdari Moong Ladoo",
    href: INSTAGRAM_URL,
  },
  {
    id: 2,
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1793014555/post-2.png",
    alt: "Chaavdari Fire Mix Chivda",
    href: INSTAGRAM_URL,
  },
  {
    id: 3,
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1793014556/post-3.png",
    alt: "Chaavdari coming soon",
    href: INSTAGRAM_URL,
  },
  {
    id: 4,
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1793014556/post-4.png",
    alt: "Chaavdari snack box",
    href: INSTAGRAM_URL,
  },
  {
    id: 5,
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1793014556/post-3.png",
    alt: "Chaavdari post",
    href: INSTAGRAM_URL,
  },
  {
    id: 6,
    imageUrl:
      "https://res.cloudinary.com/mer50qza/image/upload/v1793014556/post-4.png",
    alt: "Chaavdari post",
    href: INSTAGRAM_URL,
  },
];
