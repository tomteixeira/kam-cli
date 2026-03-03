import chalk from 'chalk';
import { getVariation } from '../../../api/variation';
import { logger } from '../../../utils/logger';

export const getVariationCommand = async (token: string, args: string[]) => {
  const variationId = args[0];
  const idRegex = /^\d+$/;

  if (!variationId || !idRegex.test(variationId)) {
    logger.error('Invalid Variation ID. Must be a number.');
    return;
  }

  try {
    const variation = await getVariation(token, parseInt(variationId, 10));

    logger.title(`\n🎨 Variation Details: ${variation.name}`);
    console.log(`  ID: ${chalk.bold(variation.id)}`);
    console.log(`  Site ID: ${variation.siteId}`);
    console.log(`  Experiment ID: ${variation.experimentId ?? 'N/A'}`);
    console.log(`  Personalization ID: ${variation.personalizationId ?? 'N/A'}`);
    console.log(`  Color: ${variation.color ?? 'N/A'}`);
    console.log(`  ShadowDOM: ${variation.shadowDom ? 'ON' : 'OFF'}`);
    console.log(`  JS after DOM ready: ${variation.isJsCodeAfterDomReady ? 'Yes' : 'No'}`);
    console.log(`  Force no flicker: ${variation.forceNoFlicker ? 'Yes' : 'No'}`);

    if (variation.jsCode) {
      console.log(`  JS Code: ${chalk.dim(variation.jsCode.substring(0, 80))}${variation.jsCode.length > 80 ? '...' : ''}`);
    }
    if (variation.cssCode) {
      console.log(`  CSS Code: ${chalk.dim(variation.cssCode.substring(0, 80))}${variation.cssCode.length > 80 ? '...' : ''}`);
    }
    if (variation.redirection) {
      console.log(`  Redirection: ${chalk.cyan(JSON.stringify(variation.redirection))}`);
    }
    console.log('');
  } catch (error: any) {
    if (error.response?.status === 404) {
      logger.error(`Variation with ID ${variationId} not found.`);
    } else {
      logger.error(`Failed to fetch variation: ${error.message}`);
      if (error.response?.data) {
        console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
      }
    }
  }
};
