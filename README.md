# Leebazz Client

Leebazz is a responsive e-commerce storefront for clothing, jewellery, home accents, and everyday care. This Next.js application provides the customer-facing site and admin interface, and connects to the Leebazz Express API for catalog and account data.

## Live application

- Storefront: [https://leebazz-client.vercel.app](https://leebazz-client.vercel.app)
- API: [https://leebazz-server.vercel.app](https://leebazz-server.vercel.app)

## Features

- Homepage with promotional banners, featured products, and category collections
- Shop, category, subcategory, product-detail, and search pages with filtering and sorting
- Email/password and Google sign-in using Better Auth
- Customer profile, saved wishlist, cart, checkout, order history, and FAQ replies
- Contact, FAQ, ordering guidance, membership, privacy, terms, and order-tracking pages
- Admin dashboard and tools for products, customers, orders, FAQ inquiries, and settings
- Shared responsive navigation and footer
- Catalog and account requests sent through the same-origin `/api/backend` proxy

## Accessibility

The interface includes accessibility improvements for people with disabilities, including semantic page structure, skip navigation, visible keyboard focus, keyboard-operable controls, accessible form errors and status messages, descriptive labels, improved contrast, responsive reflow, and reduced-motion support. Automated axe-core checks and keyboard smoke tests have been used during development.

These improvements do not establish full WCAG 2.2 AA conformance. Manual testing is still needed for authenticated checkout and admin flows, screen-reader/browser combinations, high zoom, and contrast over dynamic image backgrounds.

## Technology

- Next.js 16 App Router and React 19
- JavaScript and JSX
- Tailwind CSS 4 and DaisyUI
- Better Auth with MongoDB
- HeroUI, Lucide icons, and React Toastify
- axe-core for accessibility checks

## Local development

Requirements: a current Node.js LTS release and npm.

Install dependencies and run the Express API in one terminal:

```bash
cd leebazz-server
npm install
node index.js
```

In another terminal, install dependencies and run the storefront:

```bash
cd leebazz-client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API runs at [http://localhost:5000](http://localhost:5000).

## Configuration

Create ignored `.env` files locally; configure the same values in the relevant deployment environments. Never commit secrets.

Client variables:

```env
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=
MONGO_URL=
NEXT_PUBLIC_API_URL=http://localhost:5000
GOOGLE_CLIENTID=
GOOGLE_SECRET=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_CONTACT_PHONES=
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_YOUTUBE_URL=
```

The contact and social variables are optional. Values prefixed with `NEXT_PUBLIC_` are included in browser-visible code and must not contain secrets. Google credentials are needed only when enabling Google sign-in.

For production, set `BETTER_AUTH_URL` to the canonical storefront origin and `NEXT_PUBLIC_API_URL` to the Express API origin. Better Auth uses the client app's MongoDB connection and secret.

## Catalog data

The storefront loads the public catalog from the API (`GET /api/products`). The bundled JSON catalog in `public/` provides product route-key information and category fallback data. Keep product IDs, slugs, category and subcategory IDs, and image URLs consistent when updating catalog data. Duplicate product slugs use the product ID to form a unique route.

## Project structure

```text
app/                  App Router pages, API routes, and global styles
  (auth)/              Login and registration
  admin/               Admin dashboard and management pages
  api/                 Better Auth handlers and backend proxy
  cart/, wishlist/     Customer collections and checkout
  category/, product/  Browse and product details
  profile/, orders/    Customer account and order pages
components/            Shared storefront, account, and admin UI
lib/                    Auth, API, catalog, and account helpers
public/                 Catalog data and static assets
```

## Commands

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run start     # Serve the production build
npm run lint      # Run ESLint
```

## Deployment

The storefront is deployed at [https://leebazz-client.vercel.app](https://leebazz-client.vercel.app), and its API is deployed at [https://leebazz-server.vercel.app](https://leebazz-server.vercel.app).

Set the client deployment's `BETTER_AUTH_URL` to `https://leebazz-client.vercel.app`, `NEXT_PUBLIC_API_URL` to `https://leebazz-server.vercel.app`, and configure `BETTER_AUTH_SECRET`, `MONGO_URL`, and any Google provider credentials in the hosting environment. Configure the API's `CLIENT_URL` and `BETTER_AUTH_URL` to the exact storefront origin. Do not use wildcard origins.

Browser API calls use the client app's same-origin `/api/backend` proxy. It forwards Better Auth's HTTP-only session cookie to the API, which resolves the session with Better Auth and checks authorization for protected customer and admin operations.
