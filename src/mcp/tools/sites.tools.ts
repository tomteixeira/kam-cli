import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import {
  getAllSites,
  getSite,
  getSiteByCode,
  createSite,
  deleteSite,
  updateSite,
  updateSiteTrackingScript,
} from '../../api/site';
import { saveTrackingScriptBackup } from '../backup';

const backupTrackingScriptBeforeUpdate = async (
  token: string,
  siteId: number,
  triggeredBy: string,
): Promise<string | null> => {
  try {
    const currentSite = await getSite(token, siteId);

    if (!currentSite.trackingScript) {
      return null;
    }

    const backupPath = saveTrackingScriptBackup(
      currentSite.id,
      currentSite.code ?? String(currentSite.id),
      currentSite.name,
      currentSite.trackingScript,
      triggeredBy,
    );
    return backupPath;
  } catch {
    return null;
  }
};

export const registerSiteTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_sites',
    'List all Kameleoon sites for the current account. Returns an array of sites with id, name, url, code, type, and creation date.',
    {},
    async () => {
      const token = await tokenManager.getToken();
      const sites = await getAllSites(token);
      return { content: [{ type: 'text', text: JSON.stringify(sites, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_site',
    'Get detailed information about a specific Kameleoon site by its numeric ID.',
    { siteId: z.number().describe('The numeric ID of the site') },
    async ({ siteId }) => {
      const token = await tokenManager.getToken();
      const site = await getSite(token, siteId);
      return { content: [{ type: 'text', text: JSON.stringify(site, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_site_by_code',
    'Get detailed information about a specific Kameleoon site by its site code (e.g. "abc123xyz").',
    { code: z.string().describe('The site code identifier') },
    async ({ code }) => {
      const token = await tokenManager.getToken();
      const site = await getSiteByCode(token, code);
      return { content: [{ type: 'text', text: JSON.stringify(site, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_create_site',
    'Create a new Kameleoon site. Requires at least a name and URL.',
    {
      name: z.string().describe('Display name of the site'),
      url: z.string().describe('URL of the site'),
      type: z
        .enum(['SITE', 'SITE_JS', 'SITE_SDK', 'APPLICATION'])
        .optional()
        .describe('Technical type of the site'),
      siteType: z
        .enum(['ECOMMERCE', 'MEDIA', 'OTHER'])
        .optional()
        .describe('Business type of the site'),
    },
    async ({ name, url, type, siteType }) => {
      const token = await tokenManager.getToken();
      const site = await createSite(token, { name, url, type, siteType });
      return { content: [{ type: 'text', text: JSON.stringify(site, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_delete_site',
    'Permanently delete a Kameleoon site by its numeric ID. This action is irreversible.',
    { siteId: z.number().describe('The numeric ID of the site to delete') },
    async ({ siteId }) => {
      const token = await tokenManager.getToken();
      await deleteSite(token, siteId);
      return { content: [{ type: 'text', text: `Site ${siteId} deleted successfully.` }] };
    },
  );

  server.tool(
    'kameleoon_update_site',
    'Update properties of an existing Kameleoon site (name, tracking script, etc.). If the tracking script is being modified, a backup is automatically saved before the update.',
    {
      siteId: z.number().describe('The numeric ID of the site to update'),
      name: z.string().optional().describe('New display name'),
      trackingScript: z.string().optional().describe('New tracking script content'),
    },
    async ({ siteId, name, trackingScript }) => {
      const token = await tokenManager.getToken();

      let backupInfo = '';
      if (trackingScript !== undefined) {
        const backupPath = await backupTrackingScriptBeforeUpdate(token, siteId, 'kameleoon_update_site');
        backupInfo = backupPath
          ? `\n[BACKUP] Previous tracking script saved to: ${backupPath}`
          : '\n[BACKUP] No existing tracking script to back up.';
      }

      const site = await updateSite(token, siteId, { name, trackingScript });
      return { content: [{ type: 'text', text: JSON.stringify(site, null, 2) + backupInfo }] };
    },
  );

  server.tool(
    'kameleoon_update_tracking_script',
    'Update only the global tracking script of a Kameleoon site. A backup of the current script is automatically saved before the update. Use kameleoon_list_tracking_script_backups to see saved versions and kameleoon_restore_tracking_script to roll back.',
    {
      siteId: z.number().describe('The numeric ID of the site'),
      trackingScript: z.string().describe('The tracking script content to set'),
    },
    async ({ siteId, trackingScript }) => {
      const token = await tokenManager.getToken();

      const backupPath = await backupTrackingScriptBeforeUpdate(token, siteId, 'kameleoon_update_tracking_script');
      const backupInfo = backupPath
        ? `\n[BACKUP] Previous tracking script saved to: ${backupPath}`
        : '\n[BACKUP] No existing tracking script to back up.';

      const site = await updateSiteTrackingScript(token, siteId, trackingScript);
      return { content: [{ type: 'text', text: JSON.stringify(site, null, 2) + backupInfo }] };
    },
  );
};
