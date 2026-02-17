import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import { getSegment, createSegment, CreateSegmentDto } from '../../api/segment';
import { getSiteByCode } from '../../api/site';

const SEGMENT_TYPES = ['STANDARD', 'KEY_MOMENT', 'FEATURE_FLAG', 'ALL'] as const;

export const registerSegmentTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_get_segment',
    'Get detailed information about a specific audience segment by its numeric ID. Returns name, conditions, site association, and metadata.',
    { segmentId: z.number().describe('The numeric ID of the segment') },
    async ({ segmentId }) => {
      const token = await tokenManager.getToken();
      const segment = await getSegment(token, segmentId);
      return { content: [{ type: 'text', text: JSON.stringify(segment, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_duplicate_segment',
    'Duplicate an existing segment to one or more target sites identified by their site codes. Fetches the source segment, then creates a copy on each target site. Returns a summary of successes and failures.',
    {
      segmentId: z.number().describe('The numeric ID of the segment to duplicate'),
      targetSiteCodes: z
        .array(z.string())
        .min(1)
        .describe('Array of target site codes to duplicate the segment to'),
    },
    async ({ segmentId, targetSiteCodes }) => {
      const token = await tokenManager.getToken();

      const sourceSegment = await getSegment(token, segmentId);

      if (!sourceSegment.conditionsData) {
        return {
          content: [{ type: 'text', text: 'Segment conditions are missing. Duplication cannot proceed.' }],
          isError: true,
        };
      }

      const successes: Array<{ siteCode: string; segmentId: number }> = [];
      const failures: Array<{ siteCode: string; error: string }> = [];

      for (const siteCode of targetSiteCodes) {
        try {
          const site = await getSiteByCode(token, siteCode);

          if (!site?.id) {
            throw new Error(`Site not found for code "${siteCode}"`);
          }

          const payload: CreateSegmentDto = {
            name: sourceSegment.name,
            siteId: site.id,
            segmentType: sourceSegment.segmentType || 'STANDARD',
            conditionsData: sourceSegment.conditionsData,
            description: sourceSegment.description,
            audienceTracking: sourceSegment.audienceTracking,
            tags: sourceSegment.tags,
            userVisible: sourceSegment.userVisible,
            isFavorite: sourceSegment.isFavorite,
          };

          const created = await createSegment(token, payload);
          successes.push({ siteCode, segmentId: created.id });
        } catch (error: any) {
          failures.push({
            siteCode,
            error: error.response?.data ? JSON.stringify(error.response.data) : error.message,
          });
        }
      }

      const result = { successes, failures, totalTargets: targetSiteCodes.length };
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );
};
