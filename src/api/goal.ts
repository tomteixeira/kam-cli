import axios from 'axios';

const BASE_URL = 'https://api.kameleoon.com/goals';

export interface Goal {
  id: number;
  name: string;
  type: 'CLICK' | 'CUSTOM' | 'SCROLL' | 'PAGE_VIEWS' | 'URL' | 'TIME_SPENT' | 'RETENTION_RATE' | 'WAREHOUSE' | 'RATIO_METRICS';
  status?: 'ACTIVE' | 'INACTIVE';
  siteId: number;
  description?: string;
  hasMultipleConversions?: boolean;
  dateCreated?: string;
  dateModified?: string;
  // Add other fields as needed
}

export interface CreateGoalDto {
  name: string;
  type: 'CLICK' | 'CUSTOM' | 'SCROLL' | 'PAGE_VIEWS' | 'URL' | 'TIME_SPENT' | 'RETENTION_RATE' | 'WAREHOUSE' | 'RATIO_METRICS';
  siteId: number;
  hasMultipleConversions?: boolean;
  description?: string;
  // Params can be complex depending on type, simplified here for initial CLI use
  // params?: any; 
}

export interface UpdateGoalDto {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  description?: string;
  hasMultipleConversions?: boolean;
}

export const getAllGoals = async (token: string): Promise<Goal[]> => {
  const response = await axios.get<Goal[]>(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getGoal = async (token: string, id: number): Promise<Goal> => {
  const response = await axios.get<Goal>(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createGoal = async (token: string, data: CreateGoalDto): Promise<Goal> => {
  const response = await axios.post<Goal>(BASE_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteGoal = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateGoal = async (token: string, id: number, data: UpdateGoalDto): Promise<Goal> => {
    // Full update usually PUT
    const response = await axios.put<Goal>(`${BASE_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const partialUpdateGoal = async (token: string, id: number, data: UpdateGoalDto): Promise<Goal> => {
  const response = await axios.patch<Goal>(`${BASE_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


