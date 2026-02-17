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
  trackingScript?: string;
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
  trackingScript?: string;
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
  const response = await axios.get<Site>(`${BASE_URL}/byCode/${encodeURIComponent(code)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

export const updateSiteTrackingScript = async (token: string, id: number, trackingScript: string): Promise<Site> => {
  return partialUpdateSite(token, id, { trackingScript });
};