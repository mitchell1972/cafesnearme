#!/bin/bash

echo "PostgreSQL Setup for Cafes Near Me"
echo "=================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  macOS:  brew install postgresql@14 && brew services start postgresql@14"
    echo "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

echo "✓ PostgreSQL is installed"

# Create database
echo ""
echo "Creating database 'cafesnearme'..."
createdb cafesnearme 2>/dev/null || echo "Database 'cafesnearme' already exists"

# Create .env file
if [ ! -f .env ]; then
  echo ""
  echo "Creating .env file..."
  cat > .env << 'EOL'
# Database
DATABASE_URL="postgresql://postgres@localhost:5432/cafesnearme?schema=public"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional APIs
GOOGLE_MAPS_API_KEY=""
NEXT_PUBLIC_MAPBOX_TOKEN=""
EOL
  echo "✓ Created .env file"
else
  echo "✓ .env file already exists"
fi

# Run Prisma setup
echo ""
echo "Setting up database schema..."
npx prisma db push
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your dev server is running: npm run dev"
echo "2. Visit http://localhost:3000/admin/import"
echo "3. Upload your Excel file"
echo "4. Click 'Try Advanced Import'""
