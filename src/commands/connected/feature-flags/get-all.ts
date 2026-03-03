import chalk from 'chalk';
import { getAllFeatureFlags } from '../../../api/feature-flag';
import { logger } from '../../../utils/logger';

export const getFeatureFlagsCommand = async (token: string) => {
  try {
    const flags = await getAllFeatureFlags(token);
    logger.title(`\n🚩 Feature Flags (${flags.length})`);

    if (flags.length === 0) {
      logger.warning('No feature flags found.');
      return;
    }

    console.log(
      chalk.bold(
        'ID'.padEnd(10) +
          'Key'.padEnd(30) +
          'Name'.padEnd(30) +
          'Site'.padEnd(14) +
          'Health'.padEnd(12) +
          'Envs',
      ),
    );
    console.log(chalk.dim('─'.repeat(105)));

    flags.forEach((flag) => {
      const healthColor =
        flag.health === 'HEALTHY' ? chalk.green :
        flag.health === 'STALE' ? chalk.yellow :
        flag.health === 'SMELLY' ? chalk.red :
        chalk.dim;
      const envCount = flag.environmentConfigurations?.length ?? 0;

      console.log(
        flag.id.toString().padEnd(10) +
          flag.featureKey.substring(0, 29).padEnd(30) +
          (flag.name || 'Unnamed').substring(0, 29).padEnd(30) +
          flag.siteCode.padEnd(14) +
          healthColor((flag.health || 'N/A').padEnd(12)) +
          chalk.cyan(envCount.toString()),
      );
    });
    console.log('');
  } catch (error: any) {
    logger.error(`Failed to fetch feature flags: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
