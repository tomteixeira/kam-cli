import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import {
  getAllVariations,
  getVariation,
  createVariation,
  searchVariations,
  deleteVariation,
  updateVariation,
  partialUpdateVariation,
  CreateVariationDto,
  UpdateVariationDto,
  PartialUpdateVariationDto,
} from '../../api/variation';

const REDIRECTION_TYPES = ['GLOBAL_REDIRECTION', 'PARAMETER_REDIRECTION'] as const;

const redirectionSchema = z
  .object({
    includeQueryParameters: z.boolean().optional().describe('Include query parameters from the original URL in case of global redirection'),
    parameters: z.string().optional().describe('Parameters for parameter redirection (e.g. "param1=foo&param2=bar")'),
    type: z.enum(REDIRECTION_TYPES).optional().describe('Type of redirection'),
    url: z.string().optional().describe('URL for global redirection'),
  })
  .optional()
  .describe('Redirection settings for the variation');

const promptSchema = z
  .object({
    promptSource: z.string().optional().describe('Internal tracking value for analytics or partner attribution'),
    textInput: z.string().describe('The prompt content to be sent and executed by Electra'),
  })
  .optional()
  .describe('Autorun message prompt configuration');

export const registerVariationTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_variations',
    'List all variations across all sites. Returns id, name, siteId, experimentId, personalizationId, JS/CSS code, and redirection settings for each variation.',
    {},
    async () => {
      const token = await tokenManager.getToken();
      const variations = await getAllVariations(token);
      return { content: [{ type: 'text', text: JSON.stringify(variations, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_variation',
    'Get detailed information about a specific variation by its numeric ID. Returns name, code (JS/CSS), redirection, experiment association, and all metadata.',
    {
      variationId: z.number().describe('The numeric ID of the variation'),
      optionalFields: z.array(z.string()).optional().describe('Extra fields to include in the response'),
    },
    async ({ variationId, optionalFields }) => {
      const token = await tokenManager.getToken();
      const variation = await getVariation(token, variationId, optionalFields);
      return { content: [{ type: 'text', text: JSON.stringify(variation, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_create_variation',
    'Create a new variation. Requires name and siteId. Optionally set JS/CSS code, redirection, custom JSON, ShadowDOM, and exposure frequency settings.',
    {
      name: z.string().describe('Name of the variation'),
      siteId: z.number().describe('Site ID the variation belongs to'),
      color: z.number().optional().describe('Variation color displayed in the editor'),
      cssCode: z.string().optional().describe('CSS code for this variation'),
      jsCode: z.string().optional().describe('JavaScript code for this variation'),
      customJson: z.string().optional().describe('Custom JSON data for this variation'),
      isJsCodeAfterDomReady: z.boolean().optional().describe('Apply JS code after DOM is ready (default: true)'),
      forceNoFlicker: z.boolean().optional().describe('Force no-flicker mode'),
      shadowDom: z.boolean().optional().describe('Enable ShadowDOM'),
      redirection: redirectionSchema,
      prompt: promptSchema,
      widgetTemplateInput: z.string().optional().describe('Widget template input data in JSON format'),
    },
    async ({ name, siteId, ...optionalFields }) => {
      const token = await tokenManager.getToken();
      const payload: CreateVariationDto = { name, siteId, ...optionalFields };
      const variation = await createVariation(token, payload);
      return { content: [{ type: 'text', text: JSON.stringify(variation, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_search_variations',
    'Search variations with filters, pagination and sorting. Filter by any variation field using operators like EQUAL, LIKE, IN, etc.',
    {
      filter: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('Filter object with field, operator, parameters (or conditionalOperator + expressions for complex filters)'),
      page: z.number().optional().describe('Page number for pagination'),
      perPage: z.number().optional().describe('Number of items per page'),
      sort: z
        .array(z.object({ field: z.string(), direction: z.enum(['ASC', 'DESC']) }))
        .optional()
        .describe('Sorting parameters (field + direction)'),
    },
    async ({ filter, page, perPage, sort }) => {
      const token = await tokenManager.getToken();
      const variations = await searchVariations(token, { filter, page, perPage, sort });
      return { content: [{ type: 'text', text: JSON.stringify(variations, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_delete_variation',
    'Permanently delete a variation by its numeric ID. This action is irreversible.',
    {
      variationId: z.number().describe('The numeric ID of the variation to delete'),
    },
    async ({ variationId }) => {
      const token = await tokenManager.getToken();
      await deleteVariation(token, variationId);
      return {
        content: [{ type: 'text', text: `Variation ${variationId} deleted successfully.` }],
      };
    },
  );

  server.tool(
    'kameleoon_update_variation',
    'Fully replace a variation (PUT). Requires name and siteId. All other fields are replaced with the provided values.',
    {
      variationId: z.number().describe('The numeric ID of the variation to update'),
      name: z.string().describe('Name of the variation'),
      siteId: z.number().describe('Site ID the variation belongs to'),
      color: z.number().optional().describe('Variation color'),
      cssCode: z.string().optional().describe('CSS code'),
      jsCode: z.string().optional().describe('JavaScript code'),
      customJson: z.string().optional().describe('Custom JSON'),
      isJsCodeAfterDomReady: z.boolean().optional().describe('Apply JS after DOM ready'),
      forceNoFlicker: z.boolean().optional().describe('Force no-flicker'),
      shadowDom: z.boolean().optional().describe('ShadowDOM'),
      redirection: redirectionSchema,
      prompt: promptSchema,
      widgetTemplateInput: z.string().optional().describe('Widget template input JSON'),
    },
    async ({ variationId, name, siteId, ...optionalFields }) => {
      const token = await tokenManager.getToken();
      const payload: UpdateVariationDto = { name, siteId, ...optionalFields };
      const variation = await updateVariation(token, variationId, payload);
      return { content: [{ type: 'text', text: JSON.stringify(variation, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_partial_update_variation',
    'Partially update a variation (PATCH). Only the provided fields are updated: name, CSS/JS code, ShadowDOM, experimentId, or prompt.',
    {
      variationId: z.number().describe('The numeric ID of the variation to update'),
      name: z.string().optional().describe('New name'),
      cssCode: z.string().optional().describe('New CSS code'),
      jsCode: z.string().optional().describe('New JavaScript code'),
      isJsCodeAfterDomReady: z.boolean().optional().describe('Apply JS after DOM ready'),
      shadowDom: z.boolean().optional().describe('Toggle ShadowDOM'),
      experimentId: z.number().optional().describe('Associate with an experiment ID'),
      prompt: promptSchema,
    },
    async ({ variationId, ...fields }) => {
      const token = await tokenManager.getToken();
      const payload: PartialUpdateVariationDto = {};
      if (fields.name !== undefined) payload.name = fields.name;
      if (fields.cssCode !== undefined) payload.cssCode = fields.cssCode;
      if (fields.jsCode !== undefined) payload.jsCode = fields.jsCode;
      if (fields.isJsCodeAfterDomReady !== undefined) payload.isJsCodeAfterDomReady = fields.isJsCodeAfterDomReady;
      if (fields.shadowDom !== undefined) payload.shadowDom = fields.shadowDom;
      if (fields.experimentId !== undefined) payload.experimentId = fields.experimentId;
      if (fields.prompt !== undefined) payload.prompt = fields.prompt;
      const variation = await partialUpdateVariation(token, variationId, payload);
      return { content: [{ type: 'text', text: JSON.stringify(variation, null, 2) }] };
    },
  );
};
