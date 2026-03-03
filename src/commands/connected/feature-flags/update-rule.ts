import inquirer from 'inquirer';
import chalk from 'chalk';
import { updateFeatureFlagRuleById } from '../../../api/feature-flag';
import { logger } from '../../../utils/logger';

export const updateFeatureFlagRuleCommand = async (token: string, args: string[]) => {
  logger.title('\n✏️  Update Feature Flag Rule');

  try {
    const ruleIdArg = args[0] ? Number(args[0]) : undefined;

    const { ruleId, featureKey } = await inquirer.prompt([
      {
        type: 'number',
        name: 'ruleId',
        message: 'Rule ID:',
        default: ruleIdArg,
        validate: (input) => (Number.isFinite(input) ? true : 'Must be a number'),
      },
      {
        type: 'input',
        name: 'featureKey',
        message: 'Feature key:',
        validate: (input) => (input ? true : 'Required'),
      },
    ]);

    const { payloadJson } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'payloadJson',
        message: 'Payload JSON (environmentConfigurations, variables, variations, etc.):',
        default: JSON.stringify(
          {
            featureKey,
            environmentConfigurations: [],
          },
          null,
          2,
        ),
        validate: (input) => {
          try {
            JSON.parse(input);
            return true;
          } catch {
            return 'Must be valid JSON';
          }
        },
      },
    ]);

    const payload = JSON.parse(payloadJson);
    payload.featureKey = featureKey;

    logger.info('Updating rule...');
    const updated = await updateFeatureFlagRuleById(token, ruleId, payload);
    logger.success(`\n✅ Rule ${ruleId} updated. Feature flag: ${updated.featureKey}`);
  } catch (error: any) {
    logger.error(`Failed to update rule: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
