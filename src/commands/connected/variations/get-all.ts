import chalk from 'chalk';
import { getAllVariations } from '../../../api/variation';
import { logger } from '../../../utils/logger';

export const getVariationsCommand = async (token: string) => {
  try {
    const variations = await getAllVariations(token);
    logger.title(`\n🎨 Variations List (${variations.length})`);

    if (variations.length === 0) {
      logger.warning('No variations found.');
      return;
    }

    console.log(
      chalk.bold(
        'ID'.padEnd(10) +
          'Name'.padEnd(35) +
          'Site ID'.padEnd(10) +
          'Experiment'.padEnd(14) +
          'Perso'.padEnd(10) +
          'ShadowDOM',
      ),
    );
    console.log(chalk.dim('─'.repeat(100)));

    variations.forEach((variation) => {
      const experimentLabel = variation.experimentId
        ? chalk.cyan(String(variation.experimentId))
        : chalk.dim('—');
      const persoLabel = variation.personalizationId
        ? chalk.magenta(String(variation.personalizationId))
        : chalk.dim('—');
      const shadowLabel = variation.shadowDom
        ? chalk.green('ON')
        : chalk.dim('OFF');

      console.log(
        variation.id.toString().padEnd(10) +
          (variation.name || 'Unnamed').substring(0, 34).padEnd(35) +
          variation.siteId.toString().padEnd(10) +
          experimentLabel.padEnd(14) +
          persoLabel.padEnd(10) +
          shadowLabel,
      );
    });
    console.log('');
  } catch (error: any) {
    logger.error(`Failed to fetch variations: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
