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
  tags?: string[];
  userVisible?: boolean;
  isFavorite?: boolean;
  dateCreated?: string;
  dateModified?: string;
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

export const getSegment = async (token: string, id: number): Promise<Segment> => {
  const response = await axios.get<Segment>(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createSegment = async (token: string, data: CreateSegmentDto): Promise<Segment> => {
  const response = await axios.post<Segment>(BASE_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
