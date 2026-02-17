import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TokenManager } from '../auth';

export const registerClientTools = (server: McpServer, tokenManager: TokenManager): void => {
  server.tool(
    'kameleoon_list_clients',
    'List all configured Kameleoon clients and show which one is currently active.',
    {},
    async () => {
      const configService = tokenManager.getConfigService();
      const clients = configService.getAllClients();
      const currentClient = tokenManager.getActiveClient();

      if (clients.length === 0) {
        return {
          content: [{ type: 'text', text: 'No clients configured. Add clients via the CLI first (kam-cli add-client).' }],
        };
      }

      const clientList = clients.map((name) => ({
        name,
        active: name === currentClient,
      }));

      return { content: [{ type: 'text', text: JSON.stringify(clientList, null, 2) }] };
    },
  );

  server.tool(
    'kameleoon_switch_client',
    'Switch the active Kameleoon client. All subsequent API calls will use the credentials of this client. Use kameleoon_list_clients first to see available clients.',
    { clientName: z.string().describe('The name of the client to switch to (as shown by kameleoon_list_clients)') },
    async ({ clientName }) => {
      tokenManager.switchClient(clientName);
      const activeClient = tokenManager.getActiveClient();
      return {
        content: [{ type: 'text', text: `Switched to client "${activeClient}". All API calls will now use this client's credentials.` }],
      };
    },
  );

  server.tool(
    'kameleoon_current_client',
    'Show the name of the currently active Kameleoon client.',
    {},
    async () => {
      const currentClient = tokenManager.getActiveClient();

      if (!currentClient) {
        return {
          content: [{ type: 'text', text: 'No active client. Use kameleoon_switch_client to select one.' }],
        };
      }

      return { content: [{ type: 'text', text: `Current active client: ${currentClient}` }] };
    },
  );
};
