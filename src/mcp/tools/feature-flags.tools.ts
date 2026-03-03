import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import {
  getAllFeatureFlags,
  getFeatureFlag,
  createFeatureFlag,
  searchFeatureFlags,
  updateFeatureFlag,
  updateFeatureFlagRuleById,
  duplicateFeatureFlag,
  updateFeatureFlagForEnvironment,
} from '../../api/feature-flag';

const VARIABLE_TYPES = ['BOOLEAN', 'NUMBER', 'STRING', 'JSON', 'JS', 'CSS'] as const;
const RULE_TYPES = ['TARGETED_DELIVERY', 'PROGRESSIVE_DELIVERY', 'EXPERIMENTATION'] as const;
const RULE_STATES = ['ACTIVE', 'PAUSED'] as const;
const TRAFFIC_METHODS = ['CONTEXTUAL_BANDIT', 'MANUAL', 'MULTI_ARMED_BANDIT'] as const;

const variableSchema = z.object({
  key: z.string().describe('Key to identify the variable'),
  type: z.enum(VARIABLE_TYPES).describe('Type of the variable'),
  value: z.string().describe('Value of the variable'),
});

const variationVariableSchema = z.object({
  key: z.string().describe('Key to identify the variable'),
  value: z.string().describe('Value of the variable'),
});

const variationSchema = z.object({
  key: z.string().describe('Key of the variation (max 255 chars)'),
  name: z.string().describe('Name of the variation (max 255 chars)'),
  variables: z.array(variationVariableSchema).optional().describe('Variables implemented by this variation'),
});

const bucketingKeySchema = z.object({
  bucketingKeyType: z.enum(['VISITOR_CODE', 'CUSTOM_DATA']).describe('Type of bucketing key'),
  customDataId: z.number().optional().describe('Custom data ID (required if type is CUSTOM_DATA)'),
}).optional().describe('Bucketing key used for visitor targeting');

const trafficAllocationSchema = z.object({
  exposition: z.number().optional().describe('Exposure percentage'),
  variationId: z.number().optional().describe('Variation ID'),
  variationKey: z.string().optional().describe('Variation key'),
});

const rollbackConditionSchema = z.object({
  id: z.number().optional().describe('Rollback condition ID'),
  comparisonOperator: z.enum(['GREATER_THAN', 'LESS_THAN']).describe('Comparison operator'),
  criteria: z.enum(['UPLIFT', 'DOWNLIFT', 'CONVERSION_RATE']).describe('Criteria'),
  goalId: z.number().describe('Goal ID'),
  matchValue: z.number().min(0.0001).max(100).describe('Match value (0.0001 to 100)'),
  recipients: z.array(z.string()).optional().describe('Email recipients for notifications'),
  target: z.enum(['RULE', 'ENVIRONMENT']).describe('Rollback target'),
  visitors: z.number().min(1).describe('Minimum visitors threshold'),
});

const releaseSchema = z.object({
  releaseFrom: z.string().optional().describe('Start date (ISO 8601)'),
  releaseTo: z.string().optional().describe('End date (ISO 8601)'),
  timeZone: z.string().describe('Timezone (e.g. Europe/Paris)'),
}).optional();

const rolloutRuleSchema = z.object({
  id: z.number().optional().describe('Rule ID'),
  name: z.string().optional().describe('Rule name'),
  type: z.enum(RULE_TYPES).describe('Rule type'),
  segmentId: z.number().optional().describe('Segment ID'),
  state: z.enum(RULE_STATES).optional().describe('Rule state'),
  exposition: z.number().max(100).optional().describe('Traffic exposure percentage'),
  variationKey: z.string().optional().describe('Variation key to serve'),
  controlVariationKey: z.string().optional().describe('Control variation key (for experimentation)'),
  trafficAllocations: z.array(trafficAllocationSchema).optional().describe('Traffic allocation settings'),
  trafficAllocationMethod: z.enum(TRAFFIC_METHODS).optional().describe('Traffic distribution method'),
  rollbackConditions: z.array(rollbackConditionSchema).optional().describe('Rollback conditions'),
  release: releaseSchema,
  orderIndex: z.number().optional().describe('Execution order index'),
  reallocation: z.boolean().optional().describe('Perform traffic reallocation'),
  rolloutConfiguration: z.record(z.string(), z.unknown()).optional().describe('Progressive rollout configuration'),
});

const environmentConfigSchema = z.object({
  environmentKey: z.string().describe('Environment key'),
  defaultVariationKey: z.string().describe('Default variation key to serve'),
  featureEnabled: z.boolean().describe('Whether the feature is enabled'),
  integrations: z.record(z.string(), z.unknown()).optional().describe('Integrations config'),
  rolloutRules: z.array(rolloutRuleSchema).optional().describe('Rollout rules for this environment'),
});

export const registerFeatureFlagTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_feature_flags',
    'List all feature flag configurations across all sites. Returns id, name, featureKey, siteCode, health, variations, environment configs, and metadata.',
    {
      optionalFields: z.array(z.string()).optional()
        .describe('Extra fields to include in the response'),
    },
    async ({ optionalFields }) => {
      const token = await tokenManager.getToken();
      const flags = await getAllFeatureFlags(token, optionalFields);
      return { content: [{ type: 'text', text: JSON.stringify(flags, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_feature_flag',
    'Get a specific feature flag configuration by its siteCode and featureKey. Returns full details including variations, variables, environment configurations with rollout rules.',
    {
      siteCode: z.string().length(10).describe('Site code (exactly 10 characters)'),
      featureKey: z.string().describe('Feature flag key (lowercase alphanumeric, hyphens, underscores)'),
      optionalFields: z.array(z.string()).optional().describe('Extra fields to include'),
    },
    async ({ siteCode, featureKey, optionalFields }) => {
      const token = await tokenManager.getToken();
      const flag = await getFeatureFlag(token, siteCode, featureKey, optionalFields);
      return { content: [{ type: 'text', text: JSON.stringify(flag, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_create_feature_flag',
    'Create a new feature flag configuration. Requires name, featureKey (lowercase, alphanumeric with hyphens/underscores), and siteCode (10 chars). Optionally set variations, variables, environment configs, goals, and tags.',
    {
      name: z.string().max(100).describe('Name of the feature flag'),
      featureKey: z.string().max(255).describe('Key identifier (regex: ^[a-z0-9_-]{1,255}$)'),
      siteCode: z.string().length(10).describe('Site code (exactly 10 characters)'),
      description: z.string().max(5000).optional().describe('Description'),
      attributionWindow: z.number().optional().describe('Attribution window in milliseconds'),
      primaryGoalId: z.number().optional().describe('Primary goal ID'),
      secondaryGoalIds: z.array(z.number()).optional().describe('Secondary goal IDs'),
      tags: z.array(z.string()).optional().describe('Tags'),
      variables: z.array(variableSchema).optional().describe('Feature flag variables'),
      variations: z.array(variationSchema).optional().describe('Feature flag variations'),
      environmentConfigurations: z.array(environmentConfigSchema).optional()
        .describe('Environment-specific configurations'),
      bucketingKey: bucketingKeySchema,
    },
    async ({ name, featureKey, siteCode, ...rest }) => {
      const token = await tokenManager.getToken();
      const flag = await createFeatureFlag(token, { name, featureKey, siteCode, ...rest });
      return { content: [{ type: 'text', text: JSON.stringify(flag, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_search_feature_flags',
    'Search feature flags with filters, pagination and sorting. Filter by any field using operators like EQUAL, LIKE, IN, etc.',
    {
      filter: z.record(z.string(), z.unknown()).optional()
        .describe('Filter object (field/operator/parameters or conditionalOperator/expressions)'),
      page: z.number().optional().describe('Page number'),
      perPage: z.number().optional().describe('Items per page'),
      sort: z.array(z.object({ field: z.string(), direction: z.enum(['ASC', 'DESC']) })).optional()
        .describe('Sorting parameters'),
      optionalFields: z.array(z.string()).optional().describe('Extra fields to include'),
    },
    async ({ filter, page, perPage, sort, optionalFields }) => {
      const token = await tokenManager.getToken();
      const flags = await searchFeatureFlags(token, { filter, page, perPage, sort }, optionalFields);
      return { content: [{ type: 'text', text: JSON.stringify(flags, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_update_feature_flag',
    'Update a feature flag configuration (JSON Merge Patch) by siteCode and featureKey. Only provided fields are updated. Can update name, description, tags, variables, variations, environment configs, goals, and archive status.',
    {
      siteCode: z.string().length(10).describe('Site code'),
      featureKey: z.string().describe('Feature flag key'),
      name: z.string().max(100).optional().describe('New name'),
      description: z.string().max(5000).optional().describe('New description'),
      isArchived: z.boolean().optional().describe('Archive or unarchive the feature flag'),
      attributionWindow: z.number().optional().describe('Attribution window (ms)'),
      primaryGoalId: z.number().optional().describe('Primary goal ID'),
      secondaryGoalIds: z.array(z.number()).optional().describe('Secondary goal IDs'),
      tags: z.array(z.string()).optional().describe('Tags'),
      variables: z.array(variableSchema).optional().describe('Variables'),
      variations: z.array(variationSchema).optional().describe('Variations'),
      environmentConfigurations: z.array(environmentConfigSchema).optional()
        .describe('Environment configurations'),
      bucketingKey: bucketingKeySchema,
    },
    async ({ siteCode, featureKey, ...fields }) => {
      const token = await tokenManager.getToken();
      const flag = await updateFeatureFlag(token, siteCode, featureKey, { featureKey, ...fields });
      return { content: [{ type: 'text', text: JSON.stringify(flag, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_update_feature_flag_rule',
    'Update a single rollout rule by its numeric rule ID (JSON Merge Patch). The featureKey is required to identify the feature flag. Can update name, description, variables, variations, environment configs, and more.',
    {
      ruleId: z.number().describe('Numeric ID of the rule to update'),
      featureKey: z.string().describe('Feature flag key'),
      name: z.string().optional().describe('New feature flag name'),
      description: z.string().optional().describe('New description'),
      isArchived: z.boolean().optional().describe('Archive status'),
      variables: z.array(variableSchema).optional().describe('Variables'),
      variations: z.array(variationSchema).optional().describe('Variations'),
      environmentConfigurations: z.array(environmentConfigSchema).optional()
        .describe('Environment configurations (entire array must be provided for rollout rule changes)'),
      bucketingKey: bucketingKeySchema,
      attributionWindow: z.number().optional().describe('Attribution window (ms)'),
      primaryGoalId: z.number().optional().describe('Primary goal ID'),
      secondaryGoalIds: z.array(z.number()).optional().describe('Secondary goal IDs'),
      tags: z.array(z.string()).optional().describe('Tags'),
    },
    async ({ ruleId, ...fields }) => {
      const token = await tokenManager.getToken();
      const flag = await updateFeatureFlagRuleById(token, ruleId, fields);
      return { content: [{ type: 'text', text: JSON.stringify(flag, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_duplicate_feature_flag',
    'Duplicate an existing feature flag configuration. Creates a copy of the feature flag on the same site with a new auto-generated key.',
    {
      siteCode: z.string().length(10).describe('Site code'),
      featureKey: z.string().describe('Feature flag key to duplicate'),
    },
    async ({ siteCode, featureKey }) => {
      const token = await tokenManager.getToken();
      const flag = await duplicateFeatureFlag(token, siteCode, featureKey);
      return { content: [{ type: 'text', text: JSON.stringify(flag, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_update_feature_flag_environment',
    'Update a feature flag configuration for a specific environment (JSON Merge Patch). Targets a specific environment by siteCode, featureKey, and environmentKey. Can toggle feature, update rollout rules, default variation, etc.',
    {
      siteCode: z.string().length(10).describe('Site code'),
      featureKey: z.string().describe('Feature flag key'),
      environmentKey: z.string().describe('Environment key to update'),
      name: z.string().describe('Feature flag name (required by the API)'),
      featureEnabled: z.boolean().optional().describe('Enable/disable the feature in this environment'),
      defaultVariationKey: z.string().optional().describe('Default variation key'),
      rolloutRules: z.array(rolloutRuleSchema).optional()
        .describe('Rollout rules (entire array must be provided)'),
      integrations: z.record(z.string(), z.unknown()).optional().describe('Integrations config'),
      variables: z.array(variableSchema).optional().describe('Variables'),
      variations: z.array(variationSchema).optional().describe('Variations'),
      primaryGoalId: z.number().optional().describe('Primary goal ID'),
      secondaryGoalIds: z.array(z.number()).optional().describe('Secondary goal IDs'),
      tags: z.array(z.string()).optional().describe('Tags'),
      isArchived: z.boolean().optional().describe('Archive status'),
      description: z.string().optional().describe('Description'),
      attributionWindow: z.number().optional().describe('Attribution window (ms)'),
      bucketingKey: bucketingKeySchema,
    },
    async ({ siteCode, featureKey, environmentKey, name, ...fields }) => {
      const token = await tokenManager.getToken();
      const flag = await updateFeatureFlagForEnvironment(
        token,
        siteCode,
        featureKey,
        environmentKey,
        { featureKey, name, ...fields },
      );
      return { content: [{ type: 'text', text: JSON.stringify(flag, null, 2) }] };
    },
  );
};
