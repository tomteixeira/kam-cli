import axios from 'axios';

const BASE_URL = 'https://api.kameleoon.com/accounts';

export interface Account {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dateCreated: string;
  imageURL?: string;
  isPasswordExpired?: boolean;
  isProductRecoAllowed?: boolean;
  passwordBlocked?: boolean;
  preferredLocale?: string;
  roles?: any[];
  solutions?: string[];
  status?: 'CREATED' | 'ACTIVATED' | 'DEACTIVATED';
  teamId?: number;
}

export interface CreateAccountDto {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  passwordConfirm?: string;
  preferredLocale?: 'fr' | 'en' | 'de';
  roles?: any[];
  solutions?: string[];
}

export interface UpdateAccountDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  preferredLocale?: 'fr' | 'en' | 'de';
  roles?: any[];
  solutions?: string[];
  status?: 'CREATED' | 'ACTIVATED' | 'DEACTIVATED';
}

export const getAllAccounts = async (token: string): Promise<Account[]> => {
  const response = await axios.get<Account[]>(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAccount = async (token: string, id: number): Promise<Account> => {
  const response = await axios.get<Account>(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createAccount = async (token: string, data: CreateAccountDto): Promise<Account> => {
  const response = await axios.post<Account>(BASE_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteAccount = async (token: string, id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateAccount = async (token: string, id: number, data: UpdateAccountDto): Promise<Account> => {
  const response = await axios.patch<Account>(`${BASE_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

