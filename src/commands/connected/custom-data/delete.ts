import inquirer from 'inquirer';
import { deleteCustomData } from '../../../api/custom-data';
import { logger } from '../../../utils/logger';

export const deleteCustomDataCommand = async (token: string, args: string[]) => {
  const cdId = args[0];
  const idRegex = /^\d+$/;

  if (!cdId || !idRegex.test(cdId)) {
      logger.error('Invalid Custom Data ID. Must be a number.');
      return;
  }

  try {
      const { confirm } = await inquirer.prompt([
          {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete custom data ${cdId}?`,
              default: false
          }
      ]);

      if (!confirm) {
          logger.warning('Operation cancelled.');
          return;
      }

      await deleteCustomData(token, parseInt(cdId, 10));
      logger.success(`\n✅ Custom Data ${cdId} deleted successfully.`);

  } catch (error: any) {
      logger.error(`Failed to delete custom data: ${error.message}`);
  }
};


