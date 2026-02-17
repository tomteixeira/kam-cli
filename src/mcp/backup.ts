import fs from 'fs';
import path from 'path';

// Resolve backup directory relative to project root (not cwd, which may vary by launcher)
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BACKUP_ROOT = path.join(PROJECT_ROOT, '..', '.kameleoon-backups');

export interface TrackingScriptBackup {
  siteId: number;
  siteCode: string;
  siteName: string;
  trackingScript: string;
  savedAt: string;
  triggeredBy: string;
}

const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const buildBackupDirectory = (category: string): string => {
  const dirPath = path.join(BACKUP_ROOT, category);
  ensureDirectoryExists(dirPath);
  return dirPath;
};

const buildTimestamp = (): string => {
  return new Date().toISOString().replace(/[:.]/g, '-');
};

export const saveTrackingScriptBackup = (
  siteId: number,
  siteCode: string,
  siteName: string,
  trackingScript: string,
  triggeredBy: string,
): string => {
  const dirPath = buildBackupDirectory('tracking-scripts');
  const timestamp = buildTimestamp();
  const fileName = `site-${siteId}-${timestamp}.json`;
  const filePath = path.join(dirPath, fileName);

  const backup: TrackingScriptBackup = {
    siteId,
    siteCode,
    siteName,
    trackingScript,
    savedAt: new Date().toISOString(),
    triggeredBy,
  };

  fs.writeFileSync(filePath, JSON.stringify(backup, null, 2), 'utf-8');
  return filePath;
};

export const listTrackingScriptBackups = (siteId?: number): TrackingScriptBackup[] => {
  const dirPath = path.join(BACKUP_ROOT, 'tracking-scripts');

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath)
    .filter((file) => file.endsWith('.json'))
    .filter((file) => (siteId ? file.startsWith(`site-${siteId}-`) : true))
    .sort()
    .reverse();

  return files.map((file) => {
    const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
    return JSON.parse(content) as TrackingScriptBackup;
  });
};

export const getTrackingScriptBackup = (siteId: number, savedAt: string): TrackingScriptBackup | null => {
  const backups = listTrackingScriptBackups(siteId);
  return backups.find((backup) => backup.savedAt === savedAt) ?? null;
};
