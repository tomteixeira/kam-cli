import axios from 'axios';

const BASE_URL = 'https://api.kameleoon.com/variations';

export interface VariationRedirection {
  includeQueryParameters?: boolean;
  parameters?: string;
  type?: 'GLOBAL_REDIRECTION' | 'PARAMETER_REDIRECTION';
  url?: string;
}

export interface VariationPrompt {
  promptSource?: string;
  textInput: string;
}

export interface Variation {
  id: number;
  name: string;
  siteId: number;
  experimentId?: number;
  personalizationId?: number;
  color?: number;
  cssCode?: string;
  jsCode?: string;
  customJson?: string;
  isJsCodeAfterDomReady?: boolean;
  forceNoFlicker?: boolean;
  shadowDom?: boolean;
  redirection?: VariationRedirection;
  prompt?: VariationPrompt;
  widgetTemplateInput?: string;
  expositionFrequencySameVisit?: number;
  expositionFrequencySameVisitor?: number;
  expositionFrequencyDelaySecondsBetweenTwoExpositions?: number;
  expositionFrequencySameVisitorDelaySeconds?: number;
}

export interface CreateVariationDto {
  name: string;
  siteId: number;
  color?: number;
  cssCode?: string;
  jsCode?: string;
  customJson?: string;
  isJsCodeAfterDomReady?: boolean;
  forceNoFlicker?: boolean;
  shadowDom?: boolean;
  redirection?: VariationRedirection;
  prompt?: VariationPrompt;
  widgetTemplateInput?: string;
  expositionFrequencySameVisit?: number;
  expositionFrequencySameVisitor?: number;
  expositionFrequencyDelaySecondsBetweenTwoExpositions?: number;
  expositionFrequencySameVisitorDelaySeconds?: number;
}

export interface UpdateVariationDto extends CreateVariationDto {
  id?: number;
}

export interface PartialUpdateVariationDto {
  name?: string;
  cssCode?: string;
  jsCode?: string;
  isJsCodeAfterDomReady?: boolean;
  shadowDom?: boolean;
  experimentId?: number;
  prompt?: VariationPrompt;
}

export interface SearchVariationsParams {
  filter?: Record<string, unknown>;
  page?: number;
  perPage?: number;
  sort?: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
}

const buildAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const getAllVariations = async (token: string): Promise<Variation[]> => {
  const response = await axios.get<Variation[]>(BASE_URL, {
    headers: buildAuthHeaders(token),
  });
  return response.data;
};

export const getVariation = async (
  token: string,
  variationId: number,
  optionalFields?: string[],
): Promise<Variation> => {
  const params: Record<string, unknown> = {};
  if (optionalFields?.length) {
    params.optionalFields = optionalFields.join(',');
  }
  const response = await axios.get<Variation>(`${BASE_URL}/${variationId}`, {
    headers: buildAuthHeaders(token),
    params,
  });
  return response.data;
};

export const createVariation = async (
  token: string,
  data: CreateVariationDto,
): Promise<Variation> => {
  const response = await axios.post<Variation>(BASE_URL, data, {
    headers: buildAuthHeaders(token),
  });
  return response.data;
};

export const searchVariations = async (
  token: string,
  searchParams: SearchVariationsParams,
): Promise<Variation[]> => {
  const response = await axios.post<Variation[]>(`${BASE_URL}/search`, searchParams, {
    headers: buildAuthHeaders(token),
  });
  return response.data;
};

export const deleteVariation = async (token: string, variationId: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${variationId}`, {
    headers: buildAuthHeaders(token),
  });
};

export const updateVariation = async (
  token: string,
  variationId: number,
  data: UpdateVariationDto,
): Promise<Variation> => {
  const response = await axios.put<Variation>(`${BASE_URL}/${variationId}`, data, {
    headers: buildAuthHeaders(token),
  });
  return response.data;
};

export const partialUpdateVariation = async (
  token: string,
  variationId: number,
  data: PartialUpdateVariationDto,
): Promise<Variation> => {
  const response = await axios.patch<Variation>(`${BASE_URL}/${variationId}`, data, {
    headers: buildAuthHeaders(token),
  });
  return response.data;
};
