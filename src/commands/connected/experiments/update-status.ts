import inquirer from 'inquirer';
import { partialUpdateExperiment, getExperiment } from '../../../api/experiment';
import { logger } from '../../../utils/logger';
import chalk from 'chalk';

export const updateExperimentStatusCommand = async (token: string, args: string[]) => {
  const xpId = args[0];
  const idRegex = /^\d+$/;

  if (!xpId || !idRegex.test(xpId)) {
      logger.error('Invalid Experiment ID. Must be a number.');
      return;
  }

  try {
      // First fetch to show current status
      const current = await getExperiment(token, parseInt(xpId, 10));
      logger.info(`Current status for ${current.name} (${current.id}): ${current.status}`);

      const { newStatus } = await inquirer.prompt([
          {
              type: 'list',
              name: 'newStatus',
              message: 'Select new status:',
              choices: ['ACTIVE', 'PAUSED', 'STOPPED', 'ARCHIVED', 'DEACTIVATED'],
              default: current.status
          }
      ]);

      if (newStatus === current.status) {
          logger.warning('Status unchanged.');
          return;
      }

      const result = await partialUpdateExperiment(token, parseInt(xpId, 10), { status: newStatus });
      
      // Verify if the status was actually updated in the response
      if (result.status === newStatus) {
          logger.success(`\n✅ Status updated to ${newStatus}`);
      } else {
          logger.warning(`\n⚠️  API returned success but status is still ${result.status}.`);
          logger.info('This might be due to business rules (e.g. cannot activate without goals).');
      }

  } catch (error: any) {
      logger.error(`Failed to update status: ${error.message}`);
      if (error.response?.data) {
          console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
      }
  }
};

