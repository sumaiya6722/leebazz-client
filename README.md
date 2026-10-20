# Leebazz

Leebazz is a responsive, catalog-driven storefront built with Next.js. It brings clothing, jewellery, home accents, and everyday care into one place, with collection browsing, product details, and search.

## Features

- Homepage with promotional banners, featured products, and category collections
- Shop and category pages with product filtering and sorting
- Product detail pages, including support for variant and attribute information
- Search across product names, descriptions, tags, and catalog attributes
- Contact, privacy policy, and terms pages
- Shared navigation and footer with optional social links
- Catalog data kept locally in JSON, behind a small adapter that can later be connected to an API

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- React 19
- Tailwind CSS 4 and DaisyUI
- HeroUI, Lucide icons, and React Toastify

## Getting started

### Requirements

- Node.js (use a current LTS release)
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront. The development server reloads as you edit the app.

## Configuration

Edit the project's `.env` file and fill in any values you want to use:

```env
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_YOUTUBE_URL=
```

All values are optional. They provide the contact email and social links shown by the site. Since these use the `NEXT_PUBLIC_` prefix, their values are included in the browser bundle; do not put secrets in them. The `.env` file is ignored by Git, so create it separately when setting up another checkout.

## Catalog data

The storefront currently reads its catalog from `public/leebazz-expanded-catalog.json` through `lib/catalog.js`. The catalog supplies product and category information, homepage content, prices, images, and attributes used by the browse and product pages. `public/leebazzCatalog.json` is also included in the project.

When changing the catalog, keep product category IDs, subcategory IDs, and referenced image URLs consistent. Product routes use the product slug; when slugs are duplicated, the product ID is appended to make the route unique.

## Project structure

```text
app/                  App Router pages and global styles
  category/           Category and subcategory collections
  contact/            Contact page
  privacy-policy/     Privacy policy
  product/            Product details
  search/             Search results
  shop/               Full catalog
  terms-and-conditions/ Terms and conditions
components/           Shared storefront UI
lib/                  Catalog helpers and site configuration
public/               Catalog JSON and static assets
```

## Available scripts

```bash
npm run dev       # Start the local development server
npm run build     # Create a production build
npm run start     # Serve the production build
npm run lint      # Run ESLint
```

To run the production version locally:

```bash
npm run build
npm run start
```

## Deployment

The app can be deployed to a Next.js-compatible host such as [Vercel](https://vercel.com/). Configure the optional public environment variables in the hosting project settings, then build with `npm run build`.
