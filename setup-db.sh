#!/bin/bash

echo "Setting up database for Cafes Near Me..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null
then
    echo "PostgreSQL is not installed. Please install PostgreSQL first."
    echo "On macOS: brew install postgresql"
    echo "On Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

# Database configuration
DB_NAME="cafesnearme"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Create database if it doesn't exist
echo "Creating database..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database may already exist"

# Update .env file
echo "Updating .env file..."
cat > .env << EOL
# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Maps API (for geocoding if needed)
GOOGLE_MAPS_API_KEY=""

# Mapbox (for map display)
NEXT_PUBLIC_MAPBOX_TOKEN=""
EOL

echo ".env file created with database connection string"

# Run Prisma migrations
echo "Running Prisma setup..."
npx prisma db push
npx prisma generate

echo "Database setup complete!"
echo ""
echo "You can now:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Visit http://localhost:3000/admin/import to import sample data"
echo "3. Use the sample-cafes.csv file provided to test the import"
