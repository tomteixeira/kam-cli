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
import { duplicateTrackingScriptToAllCommand } from './connected/sites/duplicate-tracking-script-all';
import { duplicateTrackingScriptCommand } from './connected/sites/duplicate-tracking-script';
import { getTrackingScriptCommand } from './connected/sites/get-tracking-script';
import { getGoalsCommand } from './connected/goals/get-all';
import { getGoalCommand } from './connected/goals/get-one';
import { createGoalCommand } from './connected/goals/create';
import { deleteGoalCommand } from './connected/goals/delete';
import { duplicateGoalToAllCommand } from './connected/goals/duplicate-all';
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
import { duplicateSegmentCommand } from './connected/segments/duplicate';
import { getSegmentsCommand } from './connected/segments/get-all';
import { getSegmentCommand } from './connected/segments/get-one';
import { createSegmentCommand } from './connected/segments/create';
import { updateSegmentCommand } from './connected/segments/update';
import { updateSegmentConditionCommand } from './connected/segments/update-condition';
import { updateExperimentCommand } from './connected/experiments/update';
import { getTargetingRulesCommand } from './connected/targeting-rules/get-all';
import { getTargetingRuleCommand } from './connected/targeting-rules/get-one';
import { createTargetingRuleCommand } from './connected/targeting-rules/create';
import { updateTargetingRuleCommand } from './connected/targeting-rules/update';
import { partialUpdateTargetingRuleCommand } from './connected/targeting-rules/partial-update';
import { updateTargetingRuleForPersonalizationCommand } from './connected/targeting-rules/update-for-personalization';
import { getVariationsCommand } from './connected/variations/get-all';
import { getVariationCommand } from './connected/variations/get-one';
import { createVariationCommand } from './connected/variations/create';
import { deleteVariationCommand } from './connected/variations/delete';
import { updateVariationCommand } from './connected/variations/update';
import { partialUpdateVariationCommand } from './connected/variations/partial-update';
import { searchVariationsCommand } from './connected/variations/search';
import { getFeatureFlagsCommand } from './connected/feature-flags/get-all';
import { getFeatureFlagCommand } from './connected/feature-flags/get-one';
import { createFeatureFlagCommand } from './connected/feature-flags/create';
import { searchFeatureFlagsCommand } from './connected/feature-flags/search';
import { updateFeatureFlagCommand } from './connected/feature-flags/update';
import { duplicateFeatureFlagCommand } from './connected/feature-flags/duplicate';
import { updateFeatureFlagRuleCommand } from './connected/feature-flags/update-rule';
import { updateFeatureFlagEnvironmentCommand } from './connected/feature-flags/update-env';

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
        console.log('  - sites:get-script <siteCode>: Get global script');
        console.log('  - sites:duplicate-script <sourceSiteCode> <targetSiteCodes>: Duplicate global script');
        console.log('  - sites:duplicate-script-all <sourceSiteCode>: Duplicate global script to all sites');
        console.log('  - goals:getall: List all goals');
        console.log('  - goals:get <id>: Get goal details');
        console.log('  - goals:create: Create a new goal');
        console.log('  - goals:delete <id>: Delete a goal');
        console.log('  - goals:duplicate-all <goalId>: Duplicate goal to all sites');
        console.log('  - cd:getall: List all custom data');
        console.log('  - cd:get <id>: Get custom data details');
        console.log('  - cd:create: Create a new custom data');
        console.log('  - cd:delete <id>: Delete a custom data');
        console.log('  - xp:getall: List all experiments');
        console.log('  - xp:get <id>: Get experiment details');
        console.log('  - xp:create: Create a new experiment');
        console.log('  - xp:delete <id>: Delete an experiment');
        console.log('  - xp:update-status <id>: Update experiment status');
        console.log('  - xp:update <id>: Partial update experiment fields');
        console.log('  - tr:getall: List all targeting rules');
        console.log('  - tr:get <id>: Get targeting rule details');
        console.log('  - tr:create: Create a new targeting rule');
        console.log('  - tr:update <id>: Full update a targeting rule');
        console.log('  - tr:patch <id>: Partial update a targeting rule');
        console.log('  - tr:update-perso <ruleId> <persoId>: Update targeting rule for personalization');
        console.log('  - segments:getall: List all segments');
        console.log('  - segments:get <id>: Get segment details');
        console.log('  - segments:create: Create a new segment');
        console.log('  - segments:update <id>: Update a segment (partial or full)');
        console.log('  - segments:update-condition <segmentId> <conditionId>: Update a segment condition');
        console.log('  - segments:duplicate <segmentId> <siteCodes>: Duplicate segment to sites');
        console.log('  - var:getall: List all variations');
        console.log('  - var:get <id>: Get variation details');
        console.log('  - var:create: Create a new variation');
        console.log('  - var:delete <id>: Delete a variation');
        console.log('  - var:update <id>: Full update a variation');
        console.log('  - var:patch <id>: Partial update a variation');
        console.log('  - var:search: Search variations with filters');
        console.log('  - ff:getall: List all feature flags');
        console.log('  - ff:get <siteCode> <featureKey>: Get feature flag details');
        console.log('  - ff:create: Create a new feature flag');
        console.log('  - ff:search: Search feature flags');
        console.log('  - ff:update <siteCode> <featureKey>: Update a feature flag');
        console.log('  - ff:duplicate <siteCode> <featureKey>: Duplicate a feature flag');
        console.log('  - ff:update-rule <ruleId>: Update a rollout rule by ID');
        console.log('  - ff:update-env <siteCode> <featureKey> <envKey>: Update feature flag environment');
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
    'sites:get-script': async (token, args) => getTrackingScriptCommand(token, args),
    'sites:duplicate-script': async (token, args) => duplicateTrackingScriptCommand(token, args),
    'sites:duplicate-script-all': async (token, args) => duplicateTrackingScriptToAllCommand(token, args),
    'goals:getall': async (token) => getGoalsCommand(token),
    'goals:get': async (token, args) => getGoalCommand(token, args),
    'goals:create': async (token) => createGoalCommand(token),
    'goals:delete': async (token, args) => deleteGoalCommand(token, args),
    'goals:duplicate-all': async (token, args) => duplicateGoalToAllCommand(token, args),
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
    'xp:update': async (token, args) => updateExperimentCommand(token, args),
    'tr:getall': async (token) => getTargetingRulesCommand(token),
    'tr:get': async (token, args) => getTargetingRuleCommand(token, args),
    'tr:create': async (token) => createTargetingRuleCommand(token),
    'tr:update': async (token, args) => updateTargetingRuleCommand(token, args),
    'tr:patch': async (token, args) => partialUpdateTargetingRuleCommand(token, args),
    'tr:update-perso': async (token, args) => updateTargetingRuleForPersonalizationCommand(token, args),
    'segments:getall': async (token) => getSegmentsCommand(token),
    'segments:get': async (token, args) => getSegmentCommand(token, args),
    'segments:create': async (token) => createSegmentCommand(token),
    'segments:update': async (token, args) => updateSegmentCommand(token, args),
    'segments:update-condition': async (token, args) => updateSegmentConditionCommand(token, args),
    'segments:duplicate': async (token, args) => duplicateSegmentCommand(token, args),
    'var:getall': async (token) => getVariationsCommand(token),
    'var:get': async (token, args) => getVariationCommand(token, args),
    'var:create': async (token) => createVariationCommand(token),
    'var:delete': async (token, args) => deleteVariationCommand(token, args),
    'var:update': async (token, args) => updateVariationCommand(token, args),
    'var:patch': async (token, args) => partialUpdateVariationCommand(token, args),
    'var:search': async (token) => searchVariationsCommand(token),
    'ff:getall': async (token) => getFeatureFlagsCommand(token),
    'ff:get': async (token, args) => getFeatureFlagCommand(token, args),
    'ff:create': async (token) => createFeatureFlagCommand(token),
    'ff:search': async (token) => searchFeatureFlagsCommand(token),
    'ff:update': async (token, args) => updateFeatureFlagCommand(token, args),
    'ff:duplicate': async (token, args) => duplicateFeatureFlagCommand(token, args),
    'ff:update-rule': async (token, args) => updateFeatureFlagRuleCommand(token, args),
    'ff:update-env': async (token, args) => updateFeatureFlagEnvironmentCommand(token, args),
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
