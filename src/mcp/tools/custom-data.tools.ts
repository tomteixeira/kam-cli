import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import {
  getAllCustomData,
  getCustomData,
  createCustomData,
  deleteCustomData,
} from '../../api/custom-data';

const CUSTOM_DATA_METHODS = ['ADOBE_ANALYTICS', 'CLIENT', 'CUSTOM_CODE', 'GTM', 'SDK', 'TC', 'TEALIUM'] as const;
const CUSTOM_DATA_TYPES = ['UNIQUE', 'LIST', 'COUNT_LIST'] as const;
const CUSTOM_DATA_FORMATS = ['BOOLEAN', 'NUMBER', 'STRING'] as const;

export const registerCustomDataTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_custom_data',
    'List all custom data definitions across all sites. Custom data is used to pass visitor information to Kameleoon (via GTM, SDK, Adobe Analytics, etc.).',
    {},
    async () => {
      const token = await tokenManager.getToken();
      const customDataList = await getAllCustomData(token);
      return { content: [{ type: 'text', text: JSON.stringify(customDataList, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_custom_data',
    'Get detailed information about a specific custom data definition by its numeric ID.',
    { customDataId: z.number().describe('The numeric ID of the custom data') },
    async ({ customDataId }) => {
      const token = await tokenManager.getToken();
      const customData = await getCustomData(token, customDataId);
      return { content: [{ type: 'text', text: JSON.stringify(customData, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_create_custom_data',
    'Create a new custom data definition on a specific site. The method defines how data is collected (GTM, SDK, Adobe Analytics, etc.).',
    {
      name: z.string().describe('Name of the custom data field'),
      method: z.enum(CUSTOM_DATA_METHODS).describe('Collection method (GTM, SDK, ADOBE_ANALYTICS, etc.)'),
      siteId: z.number().describe('The site ID this custom data belongs to'),
      type: z.enum(CUSTOM_DATA_TYPES).optional().describe('Data structure type'),
      format: z.enum(CUSTOM_DATA_FORMATS).optional().describe('Data format'),
      description: z.string().optional().describe('Description of the custom data'),
      isLocalOnly: z.boolean().optional().describe('Whether the data is local only'),
      gtmVariableName: z.string().optional().describe('GTM variable name (required when method is GTM)'),
      adobeAnalyticsVariableName: z
        .string()
        .optional()
        .describe('Adobe Analytics variable name (required when method is ADOBE_ANALYTICS)'),
      customEvalCode: z
        .string()
        .optional()
        .describe('Custom JavaScript evaluation code (required when method is CUSTOM_CODE)'),
    },
    async (args) => {
      const token = await tokenManager.getToken();
      const customData = await createCustomData(token, args);
      return { content: [{ type: 'text', text: JSON.stringify(customData, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_delete_custom_data',
    'Permanently delete a custom data definition by its numeric ID. This action is irreversible.',
    { customDataId: z.number().describe('The numeric ID of the custom data to delete') },
    async ({ customDataId }) => {
      const token = await tokenManager.getToken();
      await deleteCustomData(token, customDataId);
      return {
        content: [{ type: 'text', text: `Custom data ${customDataId} deleted successfully.` }],
      };
    },
  );
};
