import inquirer from 'inquirer';
import chalk from 'chalk';
import { getFeatureFlag, updateFeatureFlagForEnvironment } from '../../../api/feature-flag';
import { logger } from '../../../utils/logger';

export const updateFeatureFlagEnvironmentCommand = async (token: string, args: string[]) => {
  logger.title('\n✏️  Update Feature Flag Environment');

  try {
    const siteCodeArg = args[0];
    const featureKeyArg = args[1];
    const envKeyArg = args[2];

    const { siteCode, featureKey, environmentKey } = await inquirer.prompt([
      {
        type: 'input',
        name: 'siteCode',
        message: 'Site code:',
        default: siteCodeArg,
        validate: (input) => (input.length === 10 ? true : 'Must be exactly 10 characters'),
      },
      {
        type: 'input',
        name: 'featureKey',
        message: 'Feature key:',
        default: featureKeyArg,
        validate: (input) => (input ? true : 'Required'),
      },
      {
        type: 'input',
        name: 'environmentKey',
        message: 'Environment key:',
        default: envKeyArg,
        validate: (input) => (input ? true : 'Required'),
      },
    ]);

    logger.info('Fetching current feature flag...');
    const current = await getFeatureFlag(token, siteCode, featureKey);
    const currentEnv = current.environmentConfigurations?.find(
      (e) => e.environmentKey === environmentKey,
    );

    if (!currentEnv) {
      logger.error(`Environment "${environmentKey}" not found on this feature flag.`);
      return;
    }

    logger.info(
      `Current env: ${currentEnv.environmentKey} | Enabled: ${currentEnv.featureEnabled} | Default: ${currentEnv.defaultVariationKey}`,
    );

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'featureEnabled',
        message: 'Enable feature in this environment?',
        default: currentEnv.featureEnabled,
      },
      {
        type: 'input',
        name: 'defaultVariationKey',
        message: 'Default variation key:',
        default: currentEnv.defaultVariationKey,
      },
    ]);

    logger.info('Updating environment...');
    const updated = await updateFeatureFlagForEnvironment(
      token,
      siteCode,
      featureKey,
      environmentKey,
      {
        featureKey,
        name: current.name,
        featureEnabled: answers.featureEnabled,
        defaultVariationKey: answers.defaultVariationKey,
      },
    );
    logger.success(`\n✅ Environment "${environmentKey}" updated for "${updated.featureKey}"!`);
  } catch (error: any) {
    logger.error(`Failed to update environment: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
