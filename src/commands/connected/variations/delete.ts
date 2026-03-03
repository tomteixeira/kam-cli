import inquirer from 'inquirer';
import chalk from 'chalk';
import { deleteVariation } from '../../../api/variation';
import { logger } from '../../../utils/logger';

export const deleteVariationCommand = async (token: string, args: string[]) => {
  const variationId = args[0];
  const idRegex = /^\d+$/;

  if (!variationId || !idRegex.test(variationId)) {
    logger.error('Invalid Variation ID. Must be a number.');
    return;
  }

  try {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete variation ${variationId}?`,
        default: false,
      },
    ]);

    if (!confirm) {
      logger.warning('Operation cancelled.');
      return;
    }

    await deleteVariation(token, parseInt(variationId, 10));
    logger.success(`\n✅ Variation ${variationId} deleted successfully.`);
  } catch (error: any) {
    logger.error(`Failed to delete variation: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
