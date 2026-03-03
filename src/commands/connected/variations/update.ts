import inquirer from 'inquirer';
import chalk from 'chalk';
import { getVariation, updateVariation, UpdateVariationDto } from '../../../api/variation';
import { logger } from '../../../utils/logger';

export const updateVariationCommand = async (token: string, args: string[]) => {
  logger.title('\n✏️  Update Variation (Full)');

  try {
    const idFromArgs = args[0] ? Number(args[0]) : undefined;

    const { variationId } = await inquirer.prompt([
      {
        type: 'number',
        name: 'variationId',
        message: 'Variation ID:',
        default: idFromArgs,
        validate: (input) => (Number.isFinite(input) ? true : 'Must be a number'),
      },
    ]);

    logger.info('Fetching current variation...');
    const current = await getVariation(token, variationId);
    logger.info(`Current: ${current.name} | Site: ${current.siteId} | Experiment: ${current.experimentId ?? 'N/A'}`);

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
        default: current.name,
        validate: (input) => (input ? true : 'Required'),
      },
      {
        type: 'number',
        name: 'siteId',
        message: 'Site ID:',
        default: current.siteId,
        validate: (input) => (Number.isFinite(input) ? true : 'Must be a number'),
      },
      {
        type: 'input',
        name: 'cssCode',
        message: 'CSS Code:',
        default: current.cssCode || '',
      },
      {
        type: 'input',
        name: 'jsCode',
        message: 'JavaScript Code:',
        default: current.jsCode || '',
      },
      {
        type: 'confirm',
        name: 'isJsCodeAfterDomReady',
        message: 'Apply JS after DOM ready?',
        default: current.isJsCodeAfterDomReady ?? true,
      },
      {
        type: 'confirm',
        name: 'shadowDom',
        message: 'Enable ShadowDOM?',
        default: current.shadowDom ?? false,
      },
    ]);

    const payload: UpdateVariationDto = {
      name: answers.name,
      siteId: answers.siteId,
      cssCode: answers.cssCode || undefined,
      jsCode: answers.jsCode || undefined,
      isJsCodeAfterDomReady: answers.isJsCodeAfterDomReady,
      shadowDom: answers.shadowDom,
    };

    logger.info('Updating variation...');
    const updated = await updateVariation(token, variationId, payload);
    logger.success(`\n✅ Variation ${updated.id} (${updated.name}) updated successfully!`);
  } catch (error: any) {
    logger.error(`Failed to update variation: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
