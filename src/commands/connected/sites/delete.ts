import inquirer from 'inquirer';
import { deleteSite } from '../../../api/site';
import { logger } from '../../../utils/logger';

export const deleteSiteCommand = async (token: string, args: string[]) => {
  const siteId = args[0];
  const idRegex = /^\d{4,5}$/;

  if (!siteId || !idRegex.test(siteId)) {
      logger.error('Invalid Site ID. Must be a number between 4 and 5 digits.');
      return;
  }

  try {
      // Confirm first
      const { confirm } = await inquirer.prompt([
          {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete site ${siteId}? This CANNOT be undone.`,
              default: false
          }
      ]);

      if (!confirm) {
          logger.warning('Operation cancelled.');
          return;
      }

      await deleteSite(token, parseInt(siteId, 10));
      logger.success(`\n✅ Site ${siteId} deleted successfully.`);

  } catch (error: any) {
      logger.error(`Failed to delete site: ${error.message}`);
  }
};

