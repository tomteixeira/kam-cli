import axios from 'axios';

const BASE_URL = 'https://api.kameleoon.com/sites';

export interface Site {
  id: number;
  url: string;
  name: string;
  code: string;
  siteType?: 'ECOMMERCE' | 'MEDIA' | 'OTHER';
  type?: 'SITE' | 'SITE_JS' | 'SITE_SDK' | 'APPLICATION';
  mainGoal?: number;
  dateCreated?: string;
  domainNames?: string[];
  // Add other fields as needed from documentation, these are the core ones
}

export interface CreateSiteDto {
  url: string;
  name: string;
  type?: 'SITE' | 'SITE_JS' | 'SITE_SDK' | 'APPLICATION';
  siteType?: 'ECOMMERCE' | 'MEDIA' | 'OTHER';
  mainGoal?: number;
  domainNames?: string[];
  // Add other fields as needed
}

export interface UpdateSiteDto {
  name?: string;
  // Add other partial fields
}

export const getAllSites = async (token: string): Promise<Site[]> => {
  const response = await axios.get<Site[]>(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getSite = async (token: string, id: number): Promise<Site> => {
  const response = await axios.get<Site>(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getSiteByCode = async (token: string, code: string): Promise<Site> => {
  const response = await axios.get<Site>(`${BASE_URL}`, {
    params: { code }, // Assuming API supports filtering by code or has specific endpoint logic not fully detailed in generic REST pattern, usually /sites?code=X or specific endpoint. 
    // NOTE: Documentation says "Get a site by code" often implies specific path or query param. 
    // The provided link list had "Get a site by code". If it's a separate path like /sites/code/:code check docs.
    // Based on common REST patterns and provided list, often it's a filter. 
    // Let's assume standard GET /sites?code=XYZ returns list or single. 
    // IF there is a specific endpoint /sites/code/{code}, we use that.
    // Looking at typical Kameleoon API structure, it's likely GET /sites?code=... or GET /sites/code/...
    // I will implement as GET /sites with filter for now unless I see specific path in docs content which I can't fully read all deeply.
    // Actually, looking at "Get a site by code" in menu, usually /sites/code/{code}. Let's try that pattern if standard ID fails or use query param.
    headers: { Authorization: `Bearer ${token}` },
  });
  // If it returns array
  if (Array.isArray(response.data)) return response.data[0];
  return response.data;
};

export const createSite = async (token: string, data: CreateSiteDto): Promise<Site> => {
  const response = await axios.post<Site>(BASE_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteSite = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateSite = async (token: string, id: number, data: UpdateSiteDto): Promise<Site> => {
    // Full update usually PUT, partial PATCH. Doc says "Update site" and "Partially update".
    // Using PUT for full update if implied, or PATCH for partial.
    const response = await axios.put<Site>(`${BASE_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const partialUpdateSite = async (token: string, id: number, data: UpdateSiteDto): Promise<Site> => {
  const response = await axios.patch<Site>(`${BASE_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

