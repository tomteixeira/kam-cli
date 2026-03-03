import chalk from 'chalk';
import { getFeatureFlag } from '../../../api/feature-flag';
import { logger } from '../../../utils/logger';

export const getFeatureFlagCommand = async (token: string, args: string[]) => {
  const siteCode = args[0];
  const featureKey = args[1];

  if (!siteCode || !featureKey) {
    logger.error('Usage: ff:get <siteCode> <featureKey>');
    return;
  }

  try {
    const flag = await getFeatureFlag(token, siteCode, featureKey);

    logger.title(`\n🚩 Feature Flag: ${flag.name}`);
    console.log(`  ID: ${chalk.bold(flag.id)}`);
    console.log(`  Key: ${chalk.cyan(flag.featureKey)}`);
    console.log(`  Site Code: ${flag.siteCode}`);
    console.log(`  Health: ${flag.health ?? 'N/A'}`);
    console.log(`  Archived: ${flag.archived ? chalk.red('Yes') : chalk.green('No')}`);
    console.log(`  Created: ${flag.dateCreated ?? 'N/A'}`);
    console.log(`  Modified: ${flag.dateModified ?? 'N/A'}`);
    if (flag.description) console.log(`  Description: ${flag.description}`);
    if (flag.tags?.length) console.log(`  Tags: ${flag.tags.join(', ')}`);

    if (flag.variations?.length) {
      console.log(`  Variations (${flag.variations.length}):`);
      flag.variations.forEach((v) => {
        const varCount = v.variables?.length ?? 0;
        console.log(`    - ${chalk.bold(v.key)}: ${v.name}${varCount ? ` (${varCount} vars)` : ''}`);
      });
    }

    if (flag.variables?.length) {
      console.log(`  Variables (${flag.variables.length}):`);
      flag.variables.forEach((v) => {
        console.log(`    - ${chalk.bold(v.key)} [${v.type}]: ${v.value.substring(0, 60)}${v.value.length > 60 ? '...' : ''}`);
      });
    }

    if (flag.environmentConfigurations?.length) {
      console.log(`  Environments (${flag.environmentConfigurations.length}):`);
      flag.environmentConfigurations.forEach((env) => {
        const statusIcon = env.featureEnabled ? chalk.green('ON') : chalk.red('OFF');
        const rulesCount = env.rolloutRules?.length ?? 0;
        console.log(`    - ${chalk.bold(env.environmentKey)}: ${statusIcon} | default: ${env.defaultVariationKey} | ${rulesCount} rules`);
      });
    }
    console.log('');
  } catch (error: any) {
    if (error.response?.status === 404) {
      logger.error(`Feature flag "${featureKey}" not found on site "${siteCode}".`);
    } else {
      logger.error(`Failed to fetch feature flag: ${error.message}`);
      if (error.response?.data) {
        console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
      }
    }
  }
};
