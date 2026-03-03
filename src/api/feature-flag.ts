import axios from 'axios';

const BASE_URL = 'https://api.kameleoon.com/feature-flags';

const VARIABLE_TYPES = ['BOOLEAN', 'NUMBER', 'STRING', 'JSON', 'JS', 'CSS'] as const;
const HEALTH_VALUES = ['PERMANENT', 'HEALTHY', 'STALE', 'SMELLY'] as const;
const RULE_TYPES = ['TARGETED_DELIVERY', 'PROGRESSIVE_DELIVERY', 'EXPERIMENTATION'] as const;
const RULE_STATES = ['ACTIVE', 'PAUSED'] as const;
const TRAFFIC_METHODS = ['CONTEXTUAL_BANDIT', 'MANUAL', 'MULTI_ARMED_BANDIT'] as const;

export type VariableType = (typeof VARIABLE_TYPES)[number];
export type HealthValue = (typeof HEALTH_VALUES)[number];
export type RuleType = (typeof RULE_TYPES)[number];
export type RuleState = (typeof RULE_STATES)[number];
export type TrafficMethod = (typeof TRAFFIC_METHODS)[number];

export interface FeatureFlagVariable {
  key: string;
  type: VariableType;
  value: string;
}

export interface FeatureFlagVariationVariable {
  key: string;
  value: string;
}

export interface FeatureFlagVariation {
  key: string;
  name: string;
  variables?: FeatureFlagVariationVariable[];
}

export interface TrafficAllocation {
  exposition?: number;
  variationId?: number;
  variationKey?: string;
}

export interface RollbackCondition {
  id?: number;
  comparisonOperator: 'GREATER_THAN' | 'LESS_THAN';
  criteria: 'UPLIFT' | 'DOWNLIFT' | 'CONVERSION_RATE';
  goalId: number;
  matchValue: number;
  recipients?: string[];
  target: 'RULE' | 'ENVIRONMENT';
  visitors: number;
}

export interface RuleRelease {
  releaseFrom?: string;
  releaseTo?: string;
  timeZone: string;
}

export interface RolloutRule {
  id?: number;
  name?: string;
  type: RuleType;
  segmentId?: number;
  status?: string;
  state?: RuleState;
  exposition?: number;
  variationKey?: string;
  controlVariationKey?: string;
  trafficAllocations?: TrafficAllocation[];
  trafficAllocationMethod?: TrafficMethod;
  rollbackConditions?: RollbackCondition[];
  release?: RuleRelease;
  orderIndex?: number;
  reallocation?: boolean;
  rolloutConfiguration?: Record<string, unknown>;
  experimentId?: number;
  currentExposition?: number;
}

export interface EnvironmentConfiguration {
  environmentKey: string;
  defaultVariationKey: string;
  featureEnabled: boolean;
  dateModified?: string;
  integrations?: Record<string, unknown>;
  rolloutRules?: RolloutRule[];
}

export interface BucketingKey {
  bucketingKeyType: 'VISITOR_CODE' | 'CUSTOM_DATA';
  customDataId?: number;
}

export interface FeatureFlag {
  id: number;
  name: string;
  featureKey: string;
  siteCode: string;
  description?: string;
  archived?: boolean;
  health?: HealthValue;
  attributionWindow?: number;
  createdById?: number;
  dateCreated?: string;
  dateModified?: string;
  dateContentModified?: string;
  primaryGoalId?: number;
  secondaryGoalIds?: number[];
  tags?: string[];
  teamId?: number;
  variables?: FeatureFlagVariable[];
  variations?: FeatureFlagVariation[];
  environmentConfigurations?: EnvironmentConfiguration[];
  bucketingKey?: BucketingKey;
}

export interface CreateFeatureFlagDto {
  name: string;
  featureKey: string;
  siteCode: string;
  description?: string;
  attributionWindow?: number;
  primaryGoalId?: number;
  secondaryGoalIds?: number[];
  tags?: string[];
  variables?: FeatureFlagVariable[];
  variations?: FeatureFlagVariation[];
  environmentConfigurations?: Omit<EnvironmentConfiguration, 'dateModified'>[];
  bucketingKey?: BucketingKey;
}

export interface UpdateFeatureFlagDto {
  featureKey: string;
  name?: string;
  description?: string;
  isArchived?: boolean;
  attributionWindow?: number;
  primaryGoalId?: number;
  secondaryGoalIds?: number[];
  tags?: string[];
  variables?: FeatureFlagVariable[];
  variations?: FeatureFlagVariation[];
  environmentConfigurations?: Omit<EnvironmentConfiguration, 'dateModified'>[];
  bucketingKey?: BucketingKey;
}

export interface UpdateRuleByIdDto {
  featureKey: string;
  name?: string;
  description?: string;
  isArchived?: boolean;
  variables?: FeatureFlagVariable[];
  variations?: FeatureFlagVariation[];
  environmentConfigurations?: Omit<EnvironmentConfiguration, 'dateModified'>[];
  bucketingKey?: BucketingKey;
  attributionWindow?: number;
  primaryGoalId?: number;
  secondaryGoalIds?: number[];
  tags?: string[];
}

export interface UpdateEnvironmentDto {
  featureKey: string;
  name: string;
  featureEnabled?: boolean;
  defaultVariationKey?: string;
  rolloutRules?: RolloutRule[];
  integrations?: Record<string, unknown>;
  variables?: FeatureFlagVariable[];
  variations?: FeatureFlagVariation[];
  primaryGoalId?: number;
  secondaryGoalIds?: number[];
  tags?: string[];
  isArchived?: boolean;
  description?: string;
  attributionWindow?: number;
  bucketingKey?: BucketingKey;
}

export interface SearchFeatureFlagsParams {
  filter?: Record<string, unknown>;
  page?: number;
  perPage?: number;
  sort?: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
}

const buildAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const getAllFeatureFlags = async (
  token: string,
  optionalFields?: string[],
): Promise<FeatureFlag[]> => {
  const params: Record<string, unknown> = {};
  if (optionalFields?.length) {
    params.optionalFields = optionalFields.join(',');
  }
  const response = await axios.get<FeatureFlag[]>(BASE_URL, {
    headers: buildAuthHeaders(token),
    params,
  });
  return response.data;
};

export const getFeatureFlag = async (
  token: string,
  siteCode: string,
  featureKey: string,
  optionalFields?: string[],
): Promise<FeatureFlag> => {
  const params: Record<string, unknown> = {};
  if (optionalFields?.length) {
    params.optionalFields = optionalFields.join(',');
  }
  const response = await axios.get<FeatureFlag>(`${BASE_URL}/${siteCode}/${featureKey}`, {
    headers: buildAuthHeaders(token),
    params,
  });
  return response.data;
};

export const createFeatureFlag = async (
  token: string,
  data: CreateFeatureFlagDto,
): Promise<FeatureFlag> => {
  const response = await axios.post<FeatureFlag>(BASE_URL, data, {
    headers: buildAuthHeaders(token),
  });
  return response.data;
};

export const searchFeatureFlags = async (
  token: string,
  searchParams: SearchFeatureFlagsParams,
  optionalFields?: string[],
): Promise<FeatureFlag[]> => {
  const params: Record<string, unknown> = {};
  if (optionalFields?.length) {
    params.optionalFields = optionalFields.join(',');
  }
  const response = await axios.post<FeatureFlag[]>(`${BASE_URL}/search`, searchParams, {
    headers: buildAuthHeaders(token),
    params,
  });
  return response.data;
};

export const updateFeatureFlag = async (
  token: string,
  siteCode: string,
  featureKey: string,
  data: UpdateFeatureFlagDto,
): Promise<FeatureFlag> => {
  const response = await axios.patch<FeatureFlag>(
    `${BASE_URL}/${siteCode}/${featureKey}`,
    data,
    { headers: buildAuthHeaders(token) },
  );
  return response.data;
};

export const updateFeatureFlagRuleById = async (
  token: string,
  ruleId: number,
  data: UpdateRuleByIdDto,
): Promise<FeatureFlag> => {
  const response = await axios.patch<FeatureFlag>(
    `${BASE_URL}/rules/${ruleId}`,
    data,
    { headers: buildAuthHeaders(token) },
  );
  return response.data;
};

export const duplicateFeatureFlag = async (
  token: string,
  siteCode: string,
  featureKey: string,
): Promise<FeatureFlag> => {
  const response = await axios.post<FeatureFlag>(
    `${BASE_URL}/${siteCode}/${featureKey}/duplicate`,
    {},
    { headers: buildAuthHeaders(token) },
  );
  return response.data;
};

export const updateFeatureFlagForEnvironment = async (
  token: string,
  siteCode: string,
  featureKey: string,
  environmentKey: string,
  data: UpdateEnvironmentDto,
): Promise<FeatureFlag> => {
  const response = await axios.patch<FeatureFlag>(
    `${BASE_URL}/${siteCode}/${featureKey}/${environmentKey}`,
    data,
    { headers: buildAuthHeaders(token) },
  );
  return response.data;
};
