// prisma/seed-hero.ts
// Demo hero slides, one per layout option. Run: npx tsx prisma/seed-hero.ts
// Safe to run again: slides whose English title already exists are skipped.
// Each slide gets its own Cloudinary copy, so deleting it in the admin
// never removes the original offering images.
import { config } from "dotenv";
config({ path: ".env.local" });

import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const BASE = "https://res.cloudinary.com/mer50qza/image/upload";

/** Product photo padded onto a plain background: right side on desktop, bottom on phones. */
const desktop = (src: string, bg: string) =>
  `${BASE}/c_pad,w_2400,h_1000,g_east,b_rgb:${bg}/f_jpg,q_90/${src}`;
const mobile = (src: string, bg: string) =>
  `${BASE}/c_pad,w_1080,h_1350,g_south,b_rgb:${bg}/f_jpg,q_90/${src}`;

async function upload(url: string) {
  const res = await cloudinary.uploader.upload(url, { folder: "chaavdari/hero" });
  return { url: res.secure_url, publicId: res.public_id };
}

const slides = [
  {
    // Logo, title, description and both buttons, dark text
    src: "v1792511961/traditional-namkeen-and-snacks.png",
    bg: "FFF3E4",
    withMobile: true,
    data: {
      altEn: "Bowls of chakli, chivda, shankarpali and karanji",
      altMr: "चकली, चिवडा, शंकरपाळी आणि करंजीचे वाडगे",
      showLogo: true,
      titleEn: "Konkan's taste, at your door.",
      titleMr: "कोकणची चव, तुमच्या दारी.",
      descriptionEn:
        "Authentic Konkan snacks, inspired by coastal flavours, traditions and stories.",
      descriptionMr:
        "किनारपट्टीच्या चवी, परंपरा आणि आठवणींनी प्रेरित अस्सल कोकणी फराळ.",
      primaryLabelEn: "Explore Our Snacks",
      primaryLabelMr: "आमचे पदार्थ पाहा",
      primaryHref: "#products",
      secondaryLabelEn: "Our Story",
      secondaryLabelMr: "आमची गोष्ट",
      secondaryHref: "#story",
      textTone: "dark",
      sortOrder: 1,
    },
  },
  {
    // Title, description and one button, white text on a dark image
    src: "v1792515708/traditional-sweets-mithai.png",
    bg: "3B2314",
    withMobile: true,
    data: {
      altEn: "Besan ladoo, gulab jamun, karanji and barfi in brass bowls",
      altMr: "पितळेच्या वाडग्यांत बेसन लाडू, गुलाबजाम, करंजी आणि बर्फी",
      showLogo: false,
      titleEn: "Traditional sweets for every festival",
      titleMr: "प्रत्येक सणासाठी पारंपरिक मिठाई",
      descriptionEn:
        "Ladoos and mithai made in small batches with jaggery, ghee and family recipes.",
      descriptionMr:
        "गूळ, तूप आणि घरच्या पाककृती वापरून थोड्या प्रमाणात बनवलेले लाडू आणि मिठाई.",
      primaryLabelEn: "Shop Sweets",
      primaryLabelMr: "मिठाई पाहा",
      primaryHref: "#products",
      textTone: "light",
      sortOrder: 2,
    },
  },
  {
    // Title only, no buttons: the whole slide is a link. No phone image.
    src: "v1792515735/baked-and-special-treats.png",
    bg: "FFF3E4",
    withMobile: false,
    data: {
      altEn: "Freshly baked nankhatai, cookies and special treats",
      altMr: "ताज्या भाजलेल्या नानकटाई, कुकीज आणि खास पदार्थ",
      showLogo: false,
      titleEn: "Freshly baked, every week",
      titleMr: "दर आठवड्याला ताजे भाजलेले",
      descriptionEn: "Nankhatai and cookies from our home oven. Tap to see them all.",
      descriptionMr: "आमच्या घरच्या ओव्हनमधील नानकटाई आणि कुकीज. सर्व पाहण्यासाठी टॅप करा.",
      linkHref: "#products",
      textTone: "dark",
      sortOrder: 3,
    },
  },
];

async function main() {
  for (const { src, bg, withMobile, data } of slides) {
    if (await prisma.heroSlide.findFirst({ where: { titleEn: data.titleEn } })) {
      console.log(`skip  ${data.titleEn} (already there)`);
      continue;
    }
    const image = await upload(desktop(src, bg));
    const phone = withMobile ? await upload(mobile(src, bg)) : null;
    await prisma.heroSlide.create({
      data: {
        ...data,
        imageUrl: image.url,
        imagePublicId: image.publicId,
        mobileImageUrl: phone?.url ?? null,
        mobileImagePublicId: phone?.publicId ?? null,
      },
    });
    console.log(`added ${data.titleEn}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
