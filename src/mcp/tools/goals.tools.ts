import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import { getAllGoals, getGoal, createGoal, deleteGoal, CreateGoalDto } from '../../api/goal';
import { getAllSites } from '../../api/site';

const GOAL_TYPES = [
  'CLICK',
  'CUSTOM',
  'SCROLL',
  'PAGE_VIEWS',
  'URL',
  'TIME_SPENT',
  'RETENTION_RATE',
  'WAREHOUSE',
  'RATIO_METRICS',
] as const;

export const registerGoalTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_goals',
    'List all goals (conversion tracking objectives) across all sites in the account.',
    {},
    async () => {
      const token = await tokenManager.getToken();
      const goals = await getAllGoals(token);
      return { content: [{ type: 'text', text: JSON.stringify(goals, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_goal',
    'Get detailed information about a specific goal by its numeric ID.',
    { goalId: z.number().describe('The numeric ID of the goal') },
    async ({ goalId }) => {
      const token = await tokenManager.getToken();
      const goal = await getGoal(token, goalId);
      return { content: [{ type: 'text', text: JSON.stringify(goal, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_create_goal',
    'Create a new goal (conversion tracking objective) on a specific site.',
    {
      name: z.string().describe('Name of the goal'),
      type: z.enum(GOAL_TYPES).describe('Type of conversion tracking'),
      siteId: z.number().describe('The site ID this goal belongs to'),
      hasMultipleConversions: z
        .boolean()
        .optional()
        .describe('Whether the goal allows multiple conversions per visitor'),
      description: z.string().optional().describe('Description of the goal'),
    },
    async ({ name, type, siteId, hasMultipleConversions, description }) => {
      const token = await tokenManager.getToken();
      const goal = await createGoal(token, { name, type, siteId, hasMultipleConversions, description });
      return { content: [{ type: 'text', text: JSON.stringify(goal, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_delete_goal',
    'Permanently delete a goal by its numeric ID. This action is irreversible.',
    { goalId: z.number().describe('The numeric ID of the goal to delete') },
    async ({ goalId }) => {
      const token = await tokenManager.getToken();
      await deleteGoal(token, goalId);
      return { content: [{ type: 'text', text: `Goal ${goalId} deleted successfully.` }] };
    },
  );

  server.tool(
    'kameleoon_duplicate_goal_to_all_sites',
    'Duplicate an existing goal to all other sites in the account. Fetches the source goal, then creates a copy on every site except the source site. Returns a summary of successes and failures.',
    { goalId: z.number().describe('The numeric ID of the goal to duplicate') },
    async ({ goalId }) => {
      const token = await tokenManager.getToken();

      const sourceGoal = await getGoal(token, goalId);
      const sites = await getAllSites(token);
      const targetSites = sites.filter((site) => site.id !== sourceGoal.siteId);

      if (targetSites.length === 0) {
        return { content: [{ type: 'text', text: 'No other sites found to duplicate the goal to.' }] };
      }

      const successes: Array<{ siteCode: string; goalId: number }> = [];
      const failures: Array<{ siteCode: string; error: string }> = [];

      for (const site of targetSites) {
        try {
          const payload: CreateGoalDto = {
            name: sourceGoal.name,
            type: sourceGoal.type,
            siteId: site.id,
            hasMultipleConversions: sourceGoal.hasMultipleConversions,
            description: sourceGoal.description,
            params: sourceGoal.params,
          };
          const created = await createGoal(token, payload);
          successes.push({ siteCode: site.code ?? String(site.id), goalId: created.id });
        } catch (error: any) {
          failures.push({
            siteCode: site.code ?? String(site.id),
            error: error.response?.data ? JSON.stringify(error.response.data) : error.message,
          });
        }
      }

      const result = { successes, failures, totalTargets: targetSites.length };
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    },
  );
};
