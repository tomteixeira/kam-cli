import inquirer from 'inquirer';
import chalk from 'chalk';
import { duplicateFeatureFlag } from '../../../api/feature-flag';
import { logger } from '../../../utils/logger';

export const duplicateFeatureFlagCommand = async (token: string, args: string[]) => {
  const siteCodeArg = args[0];
  const featureKeyArg = args[1];

  if (!siteCodeArg || !featureKeyArg) {
    logger.error('Usage: ff:duplicate <siteCode> <featureKey>');
    return;
  }

  try {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Duplicate feature flag "${featureKeyArg}" on site "${siteCodeArg}"?`,
        default: true,
      },
    ]);

    if (!confirm) {
      logger.warning('Operation cancelled.');
      return;
    }

    logger.info('Duplicating feature flag...');
    const duplicated = await duplicateFeatureFlag(token, siteCodeArg, featureKeyArg);
    logger.success(`\n✅ Feature flag duplicated! New ID: ${duplicated.id} | Key: ${duplicated.featureKey}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      logger.error(`Feature flag "${featureKeyArg}" not found on site "${siteCodeArg}".`);
    } else {
      logger.error(`Failed to duplicate feature flag: ${error.message}`);
      if (error.response?.data) {
        console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
      }
    }
  }
};
