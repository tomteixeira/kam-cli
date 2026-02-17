import axios from 'axios';

const BASE_URL = 'https://api.kameleoon.com/experiments';

export interface Experiment {
  id: number;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED' | 'DEACTIVATED' | 'ARCHIVED' | 'DRAFT';
  type: 'AI' | 'CLASSIC' | 'DEVELOPER' | 'FEATURE_FLAG' | 'MVT' | 'PROMPT' | 'SDK_HYBRID';
  siteId: number;
  siteCode?: string;
  dateCreated?: string;
  dateModified?: string;
  baseURL?: string;
  trafficAllocationMethod?: 'CONTEXTUAL_BANDIT' | 'MANUAL' | 'MULTI_ARMED_BANDIT';
  variations?: number[];
  goals?: number[];
}

export interface CreateExperimentDto {
  name: string;
  description?: string;
  siteId: number;
  type: 'AI' | 'CLASSIC' | 'DEVELOPER' | 'FEATURE_FLAG' | 'MVT' | 'PROMPT' | 'SDK_HYBRID';
  baseURL: string;
  status?: 'ACTIVE' | 'PAUSED' | 'STOPPED' | 'DRAFT';
  trafficAllocationMethod?: 'CONTEXTUAL_BANDIT' | 'MANUAL' | 'MULTI_ARMED_BANDIT';
}

export interface UpdateExperimentDto {
  name?: string;
  description?: string;
  status?: string;
  baseURL?: string;
}

export const getAllExperiments = async (token: string): Promise<Experiment[]> => {
  const response = await axios.get<Experiment[]>(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getExperiment = async (token: string, id: number): Promise<Experiment> => {
  const response = await axios.get<Experiment>(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createExperiment = async (token: string, data: CreateExperimentDto): Promise<Experiment> => {
  const response = await axios.post<Experiment>(BASE_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteExperiment = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const partialUpdateExperiment = async (token: string, id: number, data: UpdateExperimentDto): Promise<Experiment> => {
  const params: any = {};
  const body = { ...data };

  if (body.status) {
      let action = '';
      switch (body.status) {
          case 'ACTIVE': action = 'ACTIVATE'; break;
          case 'PAUSED': action = 'PAUSE'; break;
          case 'STOPPED': action = 'STOP'; break;
          case 'DEACTIVATED': action = 'DEACTIVATE'; break;
      }
      if (action) {
          params.action = action;
      }
      delete body.status;
  }

  const response = await axios.patch<Experiment>(`${BASE_URL}/${id}`, body, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const restartExperiment = async (token: string, id: number): Promise<void> => {
    // Note: The URL is slightly different from the base one (experiments vs experiment or direct path)
    // User provided: https://api.kameleoon.com/experiments/restart/exp_id
    await axios.post(`https://api.kameleoon.com/experiments/restart/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
};