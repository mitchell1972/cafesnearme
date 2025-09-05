# Cafes Near Me - SEO-Optimized Local Cafe Directory

A modern, responsive, SEO-optimized cafe directory website built with Next.js 14+, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **Advanced Search**: Search cafes by name, location, postcode with real-time results
- **Geolocation**: "Near me" functionality using browser geolocation API
- **Distance Calculation**: Shows distance to cafes using Haversine formula
- **Filters**: Filter by distance, amenities (WiFi, parking), features, and "open now"
- **Data Import**: Import cafe data from CSV/Excel files through admin interface

### SEO Optimization
- **Programmatic SEO Pages**: Auto-generated pages for cities, areas, and categories
- **Structured Data**: Schema.org markup for LocalBusiness and breadcrumbs
- **Dynamic Sitemaps**: Automatically generated sitemap.xml
- **Meta Tags**: Optimized meta tags, Open Graph, and Twitter Cards
- **SEO-friendly URLs**: Clean URL structure `/cafes/[city]`, `/cafe/[slug]`

### Performance
- **SSG/ISR**: Static generation with incremental regeneration
- **Image Optimization**: Next.js Image component with lazy loading
- **Loading States**: Skeleton loaders for better UX
- **Mobile-First**: Fully responsive design

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Custom components based on shadcn/ui
- **Maps**: Leaflet/Mapbox integration ready

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd Cafesnearme
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cafesnearme?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_MAPS_API_KEY="" # Optional for geocoding
NEXT_PUBLIC_MAPBOX_TOKEN="" # Optional for maps
```

4. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Data Import

### Import cafe data via API:

1. Prepare a CSV file with columns:
   - name, address, postcode, latitude, longitude
   - phone, website, email (optional)
   - amenities, features (comma-separated)
   - opening_hours (JSON format)

2. Use the import endpoint:
```bash
curl -X POST http://localhost:3000/api/import \
  -F "file=@cafes.csv"
```

### CSV Format Example:
```csv
name,address,postcode,latitude,longitude,phone,website,amenities,features
"The Daily Grind","123 High St","SW1A 1AA",51.5074,-0.1278,"+44 20 1234 5678","https://dailygrind.com","WiFi,Parking,Outdoor Seating","Breakfast,Brunch,Vegan Options"
```

## Project Structure

```
/app
  /page.tsx              # Home page with search
  /search/page.tsx       # Search results page
  /cafe/[slug]/         # Individual cafe pages
  /cafes/[city]/        # City listing pages
  /coffee-shops/        # Category landing page
  /api/
    /import/            # Data import endpoint
    /search/            # Search API
    /cafes/             # Cafe data API

/components
  /SearchBar.tsx        # Main search component
  /CafeCard.tsx        # Cafe listing card
  /ui/                 # Reusable UI components

/lib
  /prisma.ts           # Database connection
  /geo.ts              # Geolocation utilities
  /seo.ts              # SEO utilities
  /utils.ts            # Helper functions
  /import.ts           # Data import logic

/prisma
  /schema.prisma       # Database schema
```

## Key Features Implementation

### Geolocation Search
The app uses the browser's Geolocation API to find cafes near the user:
- Requests permission to access location
- Calculates distances using Haversine formula
- Filters results within specified radius

### SEO Implementation
- Dynamic meta tags based on page content
- Structured data for rich snippets
- Auto-generated sitemap with all cafe pages
- Breadcrumb navigation with schema markup
- Optimized page titles and descriptions

### Performance Optimizations
- Static generation for cafe pages
- Image optimization with responsive sizing
- Lazy loading for images and components
- Efficient database queries with proper indexing

## Development

### Add a new landing page:
1. Create a new directory in `/app`
2. Add `page.tsx` with SEO metadata
3. Update sitemap.ts to include the new route

### Customize components:
All UI components are in `/components` and can be customized with Tailwind classes.

### Database changes:
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Run `npx prisma generate`

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables
3. Deploy to your hosting platform (Vercel, AWS, etc.)

## License

MIT License - feel free to use this project for your own cafe directory!
