#!/bin/bash
# backup.sh — Manual backup of PGlite database
# Usage: bash scripts/backup.sh
# Auto-backup is also built into the server (every 1h, keeps 7 days)

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_DIR="${DB_DIR:-./data/db}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.tar.gz"

if [ ! -d "$DB_DIR" ]; then
  echo "Database directory not found: $DB_DIR"
  exit 1
fi

mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_FILE" -C "$(dirname "$DB_DIR")" "$(basename "$DB_DIR")"
echo "Backup created: $BACKUP_FILE"

# Remove backups older than 7 days
find "$BACKUP_DIR" -name "db_backup_*.tar.gz" -mtime +7 -delete
echo "Old backups cleaned (kept last 7 days)"
