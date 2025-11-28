import inquirer from 'inquirer';
import chalk from 'chalk';
import readline from 'readline';
import { ConfigService } from '../services/config.service';
import { getAccessToken } from '../api/oauth';
import { logger } from '../utils/logger';
import { whoamiCommand } from './connected/whoami';
import { listAccountsCommand } from './connected/list-accounts';
import { createAccountCommand } from './connected/create-account';
import { getSitesCommand } from './connected/sites/get-all';
import { getSiteCommand } from './connected/sites/get-one';
import { createSiteCommand } from './connected/sites/create';
import { deleteSiteCommand } from './connected/sites/delete';
import { getGoalsCommand } from './connected/goals/get-all';
import { getGoalCommand } from './connected/goals/get-one';
import { createGoalCommand } from './connected/goals/create';
import { deleteGoalCommand } from './connected/goals/delete';
import { getCustomDataListCommand } from './connected/custom-data/get-all';
import { getCustomDataCommand } from './connected/custom-data/get-one';
import { createCustomDataCommand } from './connected/custom-data/create';
import { deleteCustomDataCommand } from './connected/custom-data/delete';
import { getExperimentsCommand } from './connected/experiments/get-all';
import { getExperimentCommand } from './connected/experiments/get-one';
import { createExperimentCommand } from './connected/experiments/create';
import { deleteExperimentCommand } from './connected/experiments/delete';
import { updateExperimentStatusCommand } from './connected/experiments/update-status';
import { restoreExperimentCommand } from './connected/experiments/restore';

// Registry for commands available only when connected
const connectedCommands: Record<string, (token: string, args: string[]) => Promise<void>> = {
    'help': async () => {
        console.log(chalk.yellow('\nAvailable commands:'));
        console.log('  - help: Show this help message');
        console.log('  - exit: Disconnect and return to main menu');
        console.log('  - whoami: Show current account info');
        console.log('  - accounts:ls: List all accounts');
        console.log('  - accounts:create: Create a new account');
        console.log('  - sites:getall: List all sites');
        console.log('  - sites:get <id>: Get site details');
        console.log('  - sites:create: Create a new site');
        console.log('  - sites:delete <id>: Delete a site');
        console.log('  - goals:getall: List all goals');
        console.log('  - goals:get <id>: Get goal details');
        console.log('  - goals:create: Create a new goal');
        console.log('  - goals:delete <id>: Delete a goal');
        console.log('  - cd:getall: List all custom data');
        console.log('  - cd:get <id>: Get custom data details');
        console.log('  - cd:create: Create a new custom data');
        console.log('  - cd:delete <id>: Delete a custom data');
        console.log('  - xp:getall: List all experiments');
        console.log('  - xp:get <id>: Get experiment details');
        console.log('  - xp:create: Create a new experiment');
        console.log('  - xp:delete <id>: Delete an experiment');
        console.log('  - xp:update-status <id>: Update experiment status');
        // 'xp:restore' hidden intentionally as per requirements
        console.log('');
    },
    'whoami': async (token) => whoamiCommand(token),
    'accounts:ls': async (token) => listAccountsCommand(token),
    'accounts:create': async (token) => createAccountCommand(token),
    'sites:getall': async (token) => getSitesCommand(token),
    'sites:get': async (token, args) => getSiteCommand(token, args),
    'sites:create': async (token) => createSiteCommand(token),
    'sites:delete': async (token, args) => deleteSiteCommand(token, args),
    'goals:getall': async (token) => getGoalsCommand(token),
    'goals:get': async (token, args) => getGoalCommand(token, args),
    'goals:create': async (token) => createGoalCommand(token),
    'goals:delete': async (token, args) => deleteGoalCommand(token, args),
    'cd:getall': async (token) => getCustomDataListCommand(token),
    'cd:get': async (token, args) => getCustomDataCommand(token, args),
    'cd:create': async (token) => createCustomDataCommand(token),
    'cd:delete': async (token, args) => deleteCustomDataCommand(token, args),
    'xp:getall': async (token) => getExperimentsCommand(token),
    'xp:get': async (token, args) => getExperimentCommand(token, args),
    'xp:create': async (token) => createExperimentCommand(token),
    'xp:delete': async (token, args) => deleteExperimentCommand(token, args),
    'xp:update-status': async (token, args) => updateExperimentStatusCommand(token, args),
    'xp:restore': async (token, args) => restoreExperimentCommand(token, args),
};

// Recursive helper to manage RL lifecycle around Inquirer usage
const runCommandLoop = async (token: string, clientName: string, history: string[] = []) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: `${chalk.green('KAM')} ${chalk.cyan(clientName)} > `,
        terminal: true,
        history: history
    });

    rl.prompt();

    rl.on('line', async (line) => {
        const trimmedCommand = line.trim();
        if (!trimmedCommand) {
            rl.prompt();
            return;
        }

        const [cmdName, ...args] = trimmedCommand.split(' ');

        if (cmdName === 'exit') {
            logger.info('Disconnecting...');
            rl.close();
            return;
        }

        if (connectedCommands[cmdName]) {
            // Save history before closing
            const currentHistory = (rl as any).history;
            rl.close(); // Stop listening to stdin so Inquirer can use it
            
            try {
                await connectedCommands[cmdName](token, args);
            } catch (error: any) {
                logger.error(`Error executing command: ${error.message}`);
            }

            // Restart shell with preserved history
            await runCommandLoop(token, clientName, currentHistory);
        } else {
            console.log(chalk.red(`Unknown command: ${cmdName}`));
            console.log(chalk.dim('Type "help" for a list of commands.'));
            rl.prompt();
        }
    });
};

export const connectCommand = async () => {
  const configService = new ConfigService();
  const currentClient = configService.getCurrentClient();

  if (!currentClient) {
      logger.warning('No active client selected. Please use "switch-client" or "add-client" first.');
      return;
  }

  const credentials = configService.getClientCredentials(currentClient);
  if (!credentials) {
      logger.error('Could not retrieve credentials for current client.');
      return;
  }

  logger.info(`Authenticating with ${currentClient}...`);

  try {
      const token = await getAccessToken(credentials.clientId, credentials.clientSecret);
      logger.success('Authentication successful! 🔓');
      
      logger.title(`\n🚀 Connected to ${currentClient}`);
      console.log(chalk.dim('Type "help" to see available commands or "exit" to disconnect.\n'));

      // Start the connected loop
      await runCommandLoop(token, currentClient);

  } catch (error: any) {
      logger.error(error.message);
  }
};
