export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "";

export const socialLinks = [
  {
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() ?? "",
  },
  {
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() ?? "",
  },
  { label: "YouTube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim() ?? "" },
];
