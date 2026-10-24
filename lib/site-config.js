export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "";
export const contactPhones = (process.env.NEXT_PUBLIC_CONTACT_PHONES ?? "")
  .split(",")
  .map((phone) => phone.trim())
  .filter(Boolean);

export const socialLinks = [
  {
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || "https://www.facebook.com/",
  },
  {
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "https://www.instagram.com/",
  },
  { label: "YouTube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim() || "https://www.youtube.com/" },
];
