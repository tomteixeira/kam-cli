import axios from 'axios';
import { URLSearchParams } from 'url';

export interface TokenResponse {
  access_token: string;
  expires_in?: number;
  token_type?: string;
}

export const getAccessToken = async (clientId: string, clientSecret: string): Promise<string> => {
  const url = 'https://api.kameleoon.com/oauth/token';
  
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  try {
    const response = await axios.post<TokenResponse>(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
       if (error.response?.status === 401 || error.response?.status === 400) {
           throw new Error('Invalid credentials. Please check your Client ID and Secret.');
       }
       throw new Error(`Authentication failed: ${error.message} (${error.response?.status})`);
    }
    throw error;
  }
};

