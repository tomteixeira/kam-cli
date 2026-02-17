import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import {
  getAllExperiments,
  getExperiment,
  createExperiment,
  deleteExperiment,
  partialUpdateExperiment,
  restartExperiment,
} from '../../api/experiment';

const EXPERIMENT_TYPES = ['AI', 'CLASSIC', 'DEVELOPER', 'FEATURE_FLAG', 'MVT', 'PROMPT', 'SDK_HYBRID'] as const;
const EXPERIMENT_STATUSES = ['ACTIVE', 'PAUSED', 'STOPPED', 'DEACTIVATED'] as const;
const TRAFFIC_ALLOCATION_METHODS = ['CONTEXTUAL_BANDIT', 'MANUAL', 'MULTI_ARMED_BANDIT'] as const;

export const registerExperimentTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_experiments',
    'List all experiments (A/B tests, feature flags, MVT, etc.) across all sites. Returns id, name, status, type, siteId, and other metadata.',
    {},
    async () => {
      const token = await tokenManager.getToken();
      const experiments = await getAllExperiments(token);
      return { content: [{ type: 'text', text: JSON.stringify(experiments, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_experiment',
    'Get detailed information about a specific experiment by its numeric ID.',
    { experimentId: z.number().describe('The numeric ID of the experiment') },
    async ({ experimentId }) => {
      const token = await tokenManager.getToken();
      const experiment = await getExperiment(token, experimentId);
      return { content: [{ type: 'text', text: JSON.stringify(experiment, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_create_experiment',
    'Create a new experiment on a specific site. Requires name, siteId, type, and baseURL at minimum.',
    {
      name: z.string().describe('Name of the experiment'),
      siteId: z.number().describe('The site ID this experiment belongs to'),
      type: z.enum(EXPERIMENT_TYPES).describe('Type of experiment'),
      baseURL: z.string().describe('Base URL where the experiment runs'),
      description: z.string().optional().describe('Description of the experiment'),
      status: z
        .enum(['ACTIVE', 'PAUSED', 'STOPPED', 'DRAFT'])
        .optional()
        .describe('Initial status of the experiment'),
      trafficAllocationMethod: z
        .enum(TRAFFIC_ALLOCATION_METHODS)
        .optional()
        .describe('Traffic allocation method'),
    },
    async ({ name, siteId, type, baseURL, description, status, trafficAllocationMethod }) => {
      const token = await tokenManager.getToken();
      const experiment = await createExperiment(token, {
        name,
        siteId,
        type,
        baseURL,
        description,
        status,
        trafficAllocationMethod,
      });
      return { content: [{ type: 'text', text: JSON.stringify(experiment, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_delete_experiment',
    'Permanently delete an experiment by its numeric ID. This action is irreversible.',
    { experimentId: z.number().describe('The numeric ID of the experiment to delete') },
    async ({ experimentId }) => {
      const token = await tokenManager.getToken();
      await deleteExperiment(token, experimentId);
      return {
        content: [{ type: 'text', text: `Experiment ${experimentId} deleted successfully.` }],
      };
    },
  );

  server.tool(
    'kameleoon_update_experiment_status',
    'Change the status of an experiment (activate, pause, stop, or deactivate). The API maps statuses to actions: ACTIVE->ACTIVATE, PAUSED->PAUSE, STOPPED->STOP, DEACTIVATED->DEACTIVATE.',
    {
      experimentId: z.number().describe('The numeric ID of the experiment'),
      status: z.enum(EXPERIMENT_STATUSES).describe('The new status to set'),
    },
    async ({ experimentId, status }) => {
      const token = await tokenManager.getToken();
      const experiment = await partialUpdateExperiment(token, experimentId, { status });
      return { content: [{ type: 'text', text: JSON.stringify(experiment, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_restart_experiment',
    'Restart a previously stopped or completed experiment. This resets its data and starts collecting again.',
    { experimentId: z.number().describe('The numeric ID of the experiment to restart') },
    async ({ experimentId }) => {
      const token = await tokenManager.getToken();
      await restartExperiment(token, experimentId);
      return {
        content: [{ type: 'text', text: `Experiment ${experimentId} restarted successfully.` }],
      };
    },
  );
};
