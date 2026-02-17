import path from 'path';
import dotenv from 'dotenv';

// Resolve project root from the script location (dist/mcp/server.js -> project root)
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ConfigService } from '../services/config.service';
import { TokenManager } from './auth';
import { registerClientTools } from './tools/clients.tools';
import { registerSiteTools } from './tools/sites.tools';
import { registerGoalTools } from './tools/goals.tools';
import { registerExperimentTools } from './tools/experiments.tools';
import { registerCustomDataTools } from './tools/custom-data.tools';
import { registerSegmentTools } from './tools/segments.tools';
import { registerAccountTools } from './tools/accounts.tools';
import { registerBackupTools } from './tools/backups.tools';

const startServer = async (): Promise<void> => {
  const server = new McpServer({
    name: 'kameleoon',
    version: '1.0.0',
  });

  const envPath = path.join(PROJECT_ROOT, '.env');
  const configService = new ConfigService(envPath);
  const tokenManager = new TokenManager(configService);

  registerClientTools(server, tokenManager);
  registerSiteTools(server, tokenManager);
  registerGoalTools(server, tokenManager);
  registerExperimentTools(server, tokenManager);
  registerCustomDataTools(server, tokenManager);
  registerSegmentTools(server, tokenManager);
  registerAccountTools(server, tokenManager);
  registerBackupTools(server, tokenManager);

  const transport = new StdioServerTransport();
  await server.connect(transport);
};

startServer().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
