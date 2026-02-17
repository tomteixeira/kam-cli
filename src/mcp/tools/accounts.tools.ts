import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';
import { getAllAccounts, getAccount, createAccount, deleteAccount } from '../../api/account';

export const registerAccountTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_accounts',
    'List all user accounts in the current Kameleoon organization. Returns email, name, roles, status, and other metadata.',
    {},
    async () => {
      const token = await tokenManager.getToken();
      const accounts = await getAllAccounts(token);
      return { content: [{ type: 'text', text: JSON.stringify(accounts, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_get_account',
    'Get detailed information about a specific user account by its numeric ID.',
    { accountId: z.number().describe('The numeric ID of the account') },
    async ({ accountId }) => {
      const token = await tokenManager.getToken();
      const account = await getAccount(token, accountId);
      return { content: [{ type: 'text', text: JSON.stringify(account, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_create_account',
    'Create a new user account in the Kameleoon organization. Requires at least email, first name, and last name.',
    {
      email: z.string().describe('Email address for the new account'),
      firstName: z.string().describe('First name'),
      lastName: z.string().describe('Last name'),
      password: z.string().optional().describe('Initial password'),
      passwordConfirm: z.string().optional().describe('Password confirmation (must match password)'),
      preferredLocale: z.enum(['fr', 'en', 'de']).optional().describe('Preferred language'),
    },
    async ({ email, firstName, lastName, password, passwordConfirm, preferredLocale }) => {
      const token = await tokenManager.getToken();
      const account = await createAccount(token, {
        email,
        firstName,
        lastName,
        password,
        passwordConfirm,
        preferredLocale,
      });
      return { content: [{ type: 'text', text: JSON.stringify(account, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_delete_account',
    'Permanently delete a user account by its numeric ID. This action is irreversible.',
    { accountId: z.number().describe('The numeric ID of the account to delete') },
    async ({ accountId }) => {
      const token = await tokenManager.getToken();
      await deleteAccount(token, accountId);
      return {
        content: [{ type: 'text', text: `Account ${accountId} deleted successfully.` }],
      };
    },
  );
};
