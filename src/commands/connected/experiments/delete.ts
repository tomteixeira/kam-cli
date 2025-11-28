import inquirer from 'inquirer';
import { deleteExperiment } from '../../../api/experiment';
import { logger } from '../../../utils/logger';

export const deleteExperimentCommand = async (token: string, args: string[]) => {
  const xpId = args[0];
  const idRegex = /^\d+$/;

  if (!xpId || !idRegex.test(xpId)) {
      logger.error('Invalid Experiment ID. Must be a number.');
      return;
  }

  try {
      const { confirm } = await inquirer.prompt([
          {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete experiment ${xpId}?`,
              default: false
          }
      ]);

      if (!confirm) {
          logger.warning('Operation cancelled.');
          return;
      }

      await deleteExperiment(token, parseInt(xpId, 10));
      logger.success(`\n✅ Experiment ${xpId} deleted successfully.`);

  } catch (error: any) {
      logger.error(`Failed to delete experiment: ${error.message}`);
  }
};

