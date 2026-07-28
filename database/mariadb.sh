#!/bin/bash

# Variables
DB_NAME="leaderboard"
DB_USER="admin"
DB_PASS="admin@2025"
BACKUP_FILE="leaderboard.sql"

# Step 1-4: Create database, user, grant privileges, and flush
echo "Creating database, user, and granting privileges..."

sudo mariadb <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;
EOF



mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE"

echo "Done."
