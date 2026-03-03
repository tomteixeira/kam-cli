import inquirer from 'inquirer';
import chalk from 'chalk';
import {
  getVariation,
  partialUpdateVariation,
  PartialUpdateVariationDto,
} from '../../../api/variation';
import { logger } from '../../../utils/logger';

export const partialUpdateVariationCommand = async (token: string, args: string[]) => {
  logger.title('\n✏️  Partial Update Variation');

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
    logger.info(`Current: ${current.name} | Site: ${current.siteId}`);

    const { fieldsToUpdate } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'fieldsToUpdate',
        message: 'Select fields to update:',
        choices: [
          { name: 'Name', value: 'name' },
          { name: 'CSS Code', value: 'cssCode' },
          { name: 'JS Code', value: 'jsCode' },
          { name: 'JS after DOM ready', value: 'isJsCodeAfterDomReady' },
          { name: 'ShadowDOM', value: 'shadowDom' },
          { name: 'Experiment ID', value: 'experimentId' },
        ],
        validate: (input) => (input.length > 0 ? true : 'Select at least one field'),
      },
    ]);

    const fieldPrompts = buildFieldPrompts(fieldsToUpdate, current);
    const answers = fieldPrompts.length > 0 ? await inquirer.prompt(fieldPrompts) : {};

    const payload: PartialUpdateVariationDto = {};
    if (fieldsToUpdate.includes('name')) payload.name = answers.name;
    if (fieldsToUpdate.includes('cssCode')) payload.cssCode = answers.cssCode;
    if (fieldsToUpdate.includes('jsCode')) payload.jsCode = answers.jsCode;
    if (fieldsToUpdate.includes('isJsCodeAfterDomReady')) payload.isJsCodeAfterDomReady = answers.isJsCodeAfterDomReady;
    if (fieldsToUpdate.includes('shadowDom')) payload.shadowDom = answers.shadowDom;
    if (fieldsToUpdate.includes('experimentId')) payload.experimentId = answers.experimentId;

    logger.info('Updating variation...');
    const updated = await partialUpdateVariation(token, variationId, payload);
    logger.success(`\n✅ Variation ${updated.id} (${updated.name}) updated successfully!`);
  } catch (error: any) {
    logger.error(`Failed to update variation: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};

const buildFieldPrompts = (fields: string[], current: any): any[] => {
  const prompts: any[] = [];

  if (fields.includes('name')) {
    prompts.push({ type: 'input', name: 'name', message: 'Name:', default: current.name });
  }
  if (fields.includes('cssCode')) {
    prompts.push({ type: 'editor', name: 'cssCode', message: 'CSS Code:', default: current.cssCode || '' });
  }
  if (fields.includes('jsCode')) {
    prompts.push({ type: 'editor', name: 'jsCode', message: 'JS Code:', default: current.jsCode || '' });
  }
  if (fields.includes('isJsCodeAfterDomReady')) {
    prompts.push({
      type: 'confirm',
      name: 'isJsCodeAfterDomReady',
      message: 'Apply JS after DOM ready?',
      default: current.isJsCodeAfterDomReady ?? true,
    });
  }
  if (fields.includes('shadowDom')) {
    prompts.push({
      type: 'confirm',
      name: 'shadowDom',
      message: 'Enable ShadowDOM?',
      default: current.shadowDom ?? false,
    });
  }
  if (fields.includes('experimentId')) {
    prompts.push({
      type: 'number',
      name: 'experimentId',
      message: 'Experiment ID:',
      default: current.experimentId,
      validate: (input: number) => (Number.isFinite(input) ? true : 'Must be a number'),
    });
  }

  return prompts;
};
