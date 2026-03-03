import axios from 'axios';

const BASE_URL = 'https://api.kameleoon.com/segments';

export interface Segment {
  id: number;
  name: string;
  siteId: number;
  segmentType: 'STANDARD' | 'KEY_MOMENT' | 'FEATURE_FLAG' | 'ALL';
  conditionsData: Record<string, unknown>;
  description?: string;
  audienceTracking?: boolean;
  audienceTrackingEditable?: boolean;
  tags?: string[];
  userVisible?: boolean;
  isFavorite?: boolean;
  hasSegmentCondition?: boolean;
  usedBySegmentCondition?: boolean;
  dateCreated?: string;
  dateModified?: string;
  createdBy?: number;
  experimentAmount?: number;
  experiments?: number[];
  featureFlagAmount?: number;
  personalizationAmount?: number;
  personalizations?: number[];
  conditionDataList?: ConditionDataNode[];
  conditionDataTree?: Record<string, unknown>;
}

export interface ConditionsData {
  firstLevel: FirstLevelGroup[];
  firstLevelOrOperators: boolean[];
}

export interface FirstLevelGroup {
  conditions: TargetingCondition[];
  orOperators: boolean[];
}

export interface TargetingCondition {
  id?: number;
  targetingType: string;
  weight: number;
  include?: boolean;
  htmlDescription?: string;
  [key: string]: unknown;
}

export interface ConditionDataNode {
  [key: string]: unknown;
}

export interface CreateSegmentDto {
  name: string;
  siteId: number;
  segmentType: 'STANDARD' | 'KEY_MOMENT' | 'FEATURE_FLAG' | 'ALL';
  conditionsData: Record<string, unknown>;
  description?: string;
  audienceTracking?: boolean;
  tags?: string[];
  userVisible?: boolean;
  isFavorite?: boolean;
}

export interface UpdateSegmentDto extends CreateSegmentDto {}

export interface PartialUpdateSegmentDto {
  name?: string;
  description?: string;
  audienceTracking?: boolean;
  isDeleted?: boolean;
  isFavorite?: boolean;
  tags?: string[];
}

export interface SearchSegmentsFilter {
  field: string;
  operator: string;
  parameters: unknown[];
}

export interface SearchSegmentsParams {
  filter?: SearchSegmentsFilter | Record<string, unknown>;
  page?: number;
  perPage?: number;
  sort?: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
}

const buildAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const getAllSegments = async (token: string, optionalFields?: string[]): Promise<Segment[]> => {
  const params: Record<string, unknown> = {};
  if (optionalFields?.length) {
    params.optionalFields = optionalFields.join(',');
  }
  const response = await axios.get<Segment[]>(BASE_URL, {
    headers: buildAuthHeaders(token),
    params,
  });
  return response.data;
};

export const getSegment = async (token: string, id: number, optionalFields?: string[]): Promise<Segment> => {
  const params: Record<string, unknown> = {};
  if (optionalFields?.length) {
    params.optionalFields = optionalFields.join(',');
  }
  const response = await axios.get<Segment>(`${BASE_URL}/${id}`, {
    headers: buildAuthHeaders(token),
    params,
  });
  return response.data;
};

export const createSegment = async (token: string, data: CreateSegmentDto): Promise<Segment> => {
  const response = await axios.post<Segment>(BASE_URL, data, {
    headers: buildAuthHeaders(token),
  });
  return response.data;
};

export const searchSegments = async (
  token: string,
  searchParams: SearchSegmentsParams,
  optionalFields?: string[],
): Promise<Segment[]> => {
  const params: Record<string, unknown> = {};
  if (optionalFields?.length) {
    params.optionalFields = optionalFields.join(',');
  }
  const response = await axios.post<Segment[]>(`${BASE_URL}/search`, searchParams, {
    headers: buildAuthHeaders(token),
    params,
  });
  return response.data;
};

export const updateSegment = async (token: string, id: number, data: UpdateSegmentDto): Promise<Segment> => {
  const response = await axios.put<Segment>(`${BASE_URL}/${id}`, data, {
    headers: buildAuthHeaders(token),
  });
  return response.data;
};

export const partialUpdateSegment = async (
  token: string,
  id: number,
  data: PartialUpdateSegmentDto,
): Promise<Segment> => {
  const response = await axios.patch<Segment>(`${BASE_URL}/${id}`, data, {
    headers: buildAuthHeaders(token),
  });
  return response.data;
};

export const updateSegmentCondition = async (
  token: string,
  segmentId: number,
  conditionId: number,
  data: TargetingCondition,
): Promise<TargetingCondition> => {
  const response = await axios.put<TargetingCondition>(
    `${BASE_URL}/${segmentId}/conditions/${conditionId}`,
    data,
    { headers: buildAuthHeaders(token) },
  );
  return response.data;
};
