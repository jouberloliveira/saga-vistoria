import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export function startAutoBackup(): void {
  const run = () => {
    const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
    const dbDir = process.env.DB_DIR || path.join(process.cwd(), 'data', 'db');

    if (!fs.existsSync(dbDir)) return;
    fs.mkdirSync(backupDir, { recursive: true });

    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `db_backup_${date}.tar.gz`);
    const parentDir = path.dirname(dbDir);
    const dbName = path.basename(dbDir);

    exec(`tar -czf "${backupFile}" -C "${parentDir}" "${dbName}"`, (err) => {
      if (err) {
        console.error('[backup] Error creating backup:', err.message);
        return;
      }
      console.log(`[backup] Created: ${backupFile}`);

      // Remove backups older than 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      try {
        fs.readdirSync(backupDir)
          .filter((f) => f.startsWith('db_backup_') && f.endsWith('.tar.gz'))
          .forEach((f) => {
            const filePath = path.join(backupDir, f);
            if (fs.statSync(filePath).mtimeMs < sevenDaysAgo) {
              fs.unlinkSync(filePath);
              console.log(`[backup] Removed old backup: ${f}`);
            }
          });
      } catch (cleanErr) {
        console.error('[backup] Cleanup error:', cleanErr);
      }
    });
  };

  run();
  setInterval(run, 60 * 60 * 1000); // every hour
}
