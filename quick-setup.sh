#!/bin/bash

echo "Quick Setup for Cafes Near Me"
echo "=============================="

# Check if .env exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << 'EOL'
# Database - Using SQLite for easy local development
DATABASE_URL="file:./dev.db"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional APIs
GOOGLE_MAPS_API_KEY=""
NEXT_PUBLIC_MAPBOX_TOKEN=""
EOL
  echo "✓ Created .env file with SQLite database"
else
  echo "✓ .env file already exists"
fi

# Update Prisma schema to support SQLite
echo ""
echo "Updating database provider..."
sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

# Run Prisma setup
echo ""
echo "Setting up database..."
npx prisma db push --skip-generate
npx prisma generate

echo ""
echo "✓ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Visit http://localhost:3000/admin/import"
echo "3. Upload your Excel file"
echo "4. Click 'Try Advanced Import'"
