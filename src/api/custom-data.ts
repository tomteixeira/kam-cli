import axios from 'axios';

const BASE_URL = 'https://api.kameleoon.com/custom-datas';

export interface CustomData {
  id: number;
  name: string;
  index?: number;
  type?: 'UNIQUE' | 'LIST' | 'COUNT_LIST';
  method: 'ADOBE_ANALYTICS' | 'CLIENT' | 'CUSTOM_CODE' | 'GTM' | 'SDK' | 'TC' | 'TEALIUM';
  format?: 'BOOLEAN' | 'NUMBER' | 'STRING';
  siteId: number;
  description?: string;
  isLocalOnly?: boolean;
  isConstant?: boolean;
  dateCreated?: string;
  modificationDate?: string;
  // Add other fields as needed
}

export interface CreateCustomDataDto {
  name: string;
  method: 'ADOBE_ANALYTICS' | 'CLIENT' | 'CUSTOM_CODE' | 'GTM' | 'SDK' | 'TC' | 'TEALIUM';
  siteId: number;
  type?: 'UNIQUE' | 'LIST' | 'COUNT_LIST';
  format?: 'BOOLEAN' | 'NUMBER' | 'STRING';
  description?: string;
  isLocalOnly?: boolean;
  // Additional fields based on method might be required (e.g. gtmVariableName)
  gtmVariableName?: string;
  adobeAnalyticsVariableName?: string;
  customEvalCode?: string;
}

export interface UpdateCustomDataDto {
  name?: string;
  description?: string;
  // Add other partial fields
}

export const getAllCustomData = async (token: string): Promise<CustomData[]> => {
  const response = await axios.get<CustomData[]>(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getCustomData = async (token: string, id: number): Promise<CustomData> => {
  const response = await axios.get<CustomData>(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createCustomData = async (token: string, data: CreateCustomDataDto): Promise<CustomData> => {
  const response = await axios.post<CustomData>(BASE_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteCustomData = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateCustomData = async (token: string, id: number, data: UpdateCustomDataDto): Promise<CustomData> => {
    const response = await axios.put<CustomData>(`${BASE_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const partialUpdateCustomData = async (token: string, id: number, data: UpdateCustomDataDto): Promise<CustomData> => {
  const response = await axios.patch<CustomData>(`${BASE_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


