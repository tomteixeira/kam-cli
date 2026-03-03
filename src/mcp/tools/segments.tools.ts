import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import {
  getAllSegments,
  getSegment,
  createSegment,
  searchSegments,
  updateSegment,
  partialUpdateSegment,
  updateSegmentCondition,
  CreateSegmentDto,
  PartialUpdateSegmentDto,
  TargetingCondition,
} from '../../api/segment';
import { getSiteByCode } from '../../api/site';

const SEGMENT_TYPES = ['STANDARD', 'KEY_MOMENT', 'FEATURE_FLAG', 'ALL'] as const;

export const registerSegmentTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_segments',
    'List all audience segments across all sites. Optionally include extra fields like experimentAmount, experiments, personalizations.',
    {
      optionalFields: z
        .array(z.string())
        .optional()
        .describe('Extra fields to include (e.g. experimentAmount, experiments, personalizations, featureFlagAmount, personalizationAmount)'),
    },
    async ({ optionalFields }) => {
      const token = await tokenManager.getToken();
      const segments = await getAllSegments(token, optionalFields);
      return { content: [{ type: 'text', text: JSON.stringify(segments, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_segment',
    'Get detailed information about a specific audience segment by its numeric ID. Returns name, conditions, site association, and metadata.',
    {
      segmentId: z.number().describe('The numeric ID of the segment'),
      optionalFields: z
        .array(z.string())
        .optional()
        .describe('Extra fields to include'),
    },
    async ({ segmentId, optionalFields }) => {
      const token = await tokenManager.getToken();
      const segment = await getSegment(token, segmentId, optionalFields);
      return { content: [{ type: 'text', text: JSON.stringify(segment, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_create_segment',
    'Create a new audience segment on a specific site with targeting conditions.',
    {
      name: z.string().describe('Name of the segment'),
      segmentType: z.enum(SEGMENT_TYPES).describe('Type of segment'),
      siteId: z.number().describe('Site ID this segment belongs to'),
      conditionsData: z
        .record(z.string(), z.unknown())
        .describe('Conditions data object with firstLevel and firstLevelOrOperators'),
      description: z.string().optional().describe('Description of the segment'),
      audienceTracking: z.boolean().optional().describe('Enable audience tracking'),
      tags: z.array(z.string()).optional().describe('Tags for the segment'),
      isFavorite: z.boolean().optional().describe('Mark as favorite'),
    },
    async ({ name, segmentType, siteId, conditionsData, description, audienceTracking, tags, isFavorite }) => {
      const token = await tokenManager.getToken();
      const payload: CreateSegmentDto = {
        name,
        segmentType,
        siteId,
        conditionsData,
        description,
        audienceTracking,
        tags,
        isFavorite,
      };
      const segment = await createSegment(token, payload);
      return { content: [{ type: 'text', text: JSON.stringify(segment, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_search_segments',
    'Search segments with filters, pagination and sorting. Supports filtering by field/operator/parameters.',
    {
      filter: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('Filter object with field, operator, parameters'),
      page: z.number().optional().describe('Page number for pagination'),
      perPage: z.number().optional().describe('Items per page'),
      sort: z
        .array(z.object({ field: z.string(), direction: z.enum(['ASC', 'DESC']) }))
        .optional()
        .describe('Sorting parameters'),
      optionalFields: z
        .array(z.string())
        .optional()
        .describe('Extra fields to include'),
    },
    async ({ filter, page, perPage, sort, optionalFields }) => {
      const token = await tokenManager.getToken();
      const segments = await searchSegments(token, { filter, page, perPage, sort }, optionalFields);
      return { content: [{ type: 'text', text: JSON.stringify(segments, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_update_segment',
    'Fully replace a segment (PUT). Requires all required fields: name, segmentType, siteId, conditionsData.',
    {
      segmentId: z.number().describe('The numeric ID of the segment to update'),
      name: z.string().describe('Name of the segment'),
      segmentType: z.enum(SEGMENT_TYPES).describe('Type of segment'),
      siteId: z.number().describe('Site ID this segment belongs to'),
      conditionsData: z
        .record(z.string(), z.unknown())
        .describe('Full conditions data'),
      description: z.string().optional().describe('Description'),
      audienceTracking: z.boolean().optional().describe('Enable audience tracking'),
      tags: z.array(z.string()).optional().describe('Tags'),
      isFavorite: z.boolean().optional().describe('Mark as favorite'),
    },
    async ({ segmentId, name, segmentType, siteId, conditionsData, description, audienceTracking, tags, isFavorite }) => {
      const token = await tokenManager.getToken();
      const segment = await updateSegment(token, segmentId, {
        name,
        segmentType,
        siteId,
        conditionsData,
        description,
        audienceTracking,
        tags,
        isFavorite,
      });
      return { content: [{ type: 'text', text: JSON.stringify(segment, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_partial_update_segment',
    'Partially update a segment (PATCH). Only updates the provided fields (name, description, tags, tracking, favorite). Does NOT update conditions.',
    {
      segmentId: z.number().describe('The numeric ID of the segment to update'),
      name: z.string().optional().describe('New name'),
      description: z.string().optional().describe('New description'),
      audienceTracking: z.boolean().optional().describe('Toggle audience tracking'),
      isFavorite: z.boolean().optional().describe('Toggle favorite'),
      tags: z.array(z.string()).optional().describe('Update tags'),
      isDeleted: z.boolean().optional().describe('Soft-delete the segment'),
    },
    async ({ segmentId, name, description, audienceTracking, isFavorite, tags, isDeleted }) => {
      const token = await tokenManager.getToken();
      const payload: PartialUpdateSegmentDto = { name, description, audienceTracking, isFavorite, tags, isDeleted };
      const segment = await partialUpdateSegment(token, segmentId, payload);
      return { content: [{ type: 'text', text: JSON.stringify(segment, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_update_segment_condition',
    'Update a single targeting condition within a segment. Requires segment ID, condition ID, and the updated condition object.',
    {
      segmentId: z.number().describe('The numeric ID of the segment'),
      conditionId: z.number().describe('The numeric ID of the condition to update'),
      targetingType: z.string().describe('Targeting type (e.g. PAGE_URL, CUSTOM_DATUM, DEVICE_TYPE, BROWSER_LANGUAGE)'),
      weight: z.number().default(1).describe('Priority weight (default: 1)'),
      include: z.boolean().optional().default(true).describe('Include (true) or exclude (false)'),
      extraFields: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('Additional condition-specific fields depending on targetingType (e.g. matchType, url, count)'),
    },
    async ({ segmentId, conditionId, targetingType, weight, include, extraFields }) => {
      const token = await tokenManager.getToken();
      const conditionPayload: TargetingCondition = {
        targetingType,
        weight,
        include,
        ...extraFields,
      };
      const updated = await updateSegmentCondition(token, segmentId, conditionId, conditionPayload);
      return { content: [{ type: 'text', text: JSON.stringify(updated, null, 2) }] };
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
