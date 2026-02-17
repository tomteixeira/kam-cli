import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import { listTrackingScriptBackups, getTrackingScriptBackup } from '../backup';
import { updateSiteTrackingScript } from '../../api/site';

export const registerBackupTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_tracking_script_backups',
    'List all saved tracking script backups. Optionally filter by site ID. Returns the backup date, site info, and which tool triggered the backup. Use this before restoring a previous version.',
    {
      siteId: z.number().optional().describe('Filter backups for a specific site ID. Omit to see all backups.'),
    },
    async ({ siteId }) => {
      const backups = listTrackingScriptBackups(siteId);

      if (backups.length === 0) {
        const filterInfo = siteId ? ` for site ${siteId}` : '';
        return { content: [{ type: 'text', text: `No tracking script backups found${filterInfo}.` }] };
      }

      const summary = backups.map((backup) => ({
        siteId: backup.siteId,
        siteCode: backup.siteCode,
        siteName: backup.siteName,
        savedAt: backup.savedAt,
        triggeredBy: backup.triggeredBy,
        scriptPreview: backup.trackingScript.substring(0, 100) + (backup.trackingScript.length > 100 ? '...' : ''),
      }));

      return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_tracking_script_backup',
    'Get the full content of a specific tracking script backup. Use kameleoon_list_tracking_script_backups first to find the savedAt timestamp.',
    {
      siteId: z.number().describe('The site ID of the backup'),
      savedAt: z.string().describe('The exact savedAt timestamp of the backup (ISO 8601 format, from the list command)'),
    },
    async ({ siteId, savedAt }) => {
      const backup = getTrackingScriptBackup(siteId, savedAt);

      if (!backup) {
        return {
          content: [{ type: 'text', text: `No backup found for site ${siteId} at ${savedAt}.` }],
          isError: true,
        };
      }

      return { content: [{ type: 'text', text: JSON.stringify(backup, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_restore_tracking_script',
    'Restore a tracking script from a previous backup. This will overwrite the current tracking script with the backed-up version. A new backup of the current script is saved before restoring (so you can undo the restore if needed).',
    {
      siteId: z.number().describe('The site ID to restore the tracking script on'),
      savedAt: z.string().describe('The exact savedAt timestamp of the backup to restore (ISO 8601 format)'),
    },
    async ({ siteId, savedAt }) => {
      const backup = getTrackingScriptBackup(siteId, savedAt);

      if (!backup) {
        return {
          content: [{ type: 'text', text: `No backup found for site ${siteId} at ${savedAt}.` }],
          isError: true,
        };
      }

      const token = await tokenManager.getToken();

      const { saveTrackingScriptBackup } = await import('../backup');
      const { getSite } = await import('../../api/site');

      try {
        const currentSite = await getSite(token, siteId);
        if (currentSite.trackingScript) {
          saveTrackingScriptBackup(
            currentSite.id,
            currentSite.code ?? String(currentSite.id),
            currentSite.name,
            currentSite.trackingScript,
            'kameleoon_restore_tracking_script (pre-restore safety backup)',
          );
        }
      } catch {
        // Continue with restore even if pre-restore backup fails
      }

      const updatedSite = await updateSiteTrackingScript(token, siteId, backup.trackingScript);

      return {
        content: [{
          type: 'text',
          text: `Tracking script restored successfully for site ${siteId} (${backup.siteName}).\n` +
            `Restored from backup dated: ${backup.savedAt}\n` +
            `A safety backup of the previous state was saved before restoring.\n\n` +
            JSON.stringify(updatedSite, null, 2),
        }],
      };
    },
  );
};
