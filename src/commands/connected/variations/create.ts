import inquirer from 'inquirer';
import chalk from 'chalk';
import { createVariation, CreateVariationDto } from '../../../api/variation';
import { logger } from '../../../utils/logger';

export const createVariationCommand = async (token: string) => {
  logger.title('\n➕ Create New Variation');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Variation Name:',
        validate: (input) => (input ? true : 'Required'),
      },
      {
        type: 'number',
        name: 'siteId',
        message: 'Site ID:',
        validate: (input) => (Number.isFinite(input) ? true : 'Must be a number'),
      },
      {
        type: 'input',
        name: 'cssCode',
        message: 'CSS Code (optional):',
      },
      {
        type: 'input',
        name: 'jsCode',
        message: 'JavaScript Code (optional):',
      },
      {
        type: 'confirm',
        name: 'isJsCodeAfterDomReady',
        message: 'Apply JS after DOM ready?',
        default: true,
      },
      {
        type: 'confirm',
        name: 'shadowDom',
        message: 'Enable ShadowDOM?',
        default: false,
      },
      {
        type: 'list',
        name: 'redirectionType',
        message: 'Redirection type:',
        choices: ['NONE', 'GLOBAL_REDIRECTION', 'PARAMETER_REDIRECTION'],
        default: 'NONE',
      },
    ]);

    let redirection: CreateVariationDto['redirection'];
    if (answers.redirectionType !== 'NONE') {
      const redirectionAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Redirection URL:',
          when: () => answers.redirectionType === 'GLOBAL_REDIRECTION',
        },
        {
          type: 'input',
          name: 'parameters',
          message: 'Redirection parameters (e.g. param1=foo&param2=bar):',
          when: () => answers.redirectionType === 'PARAMETER_REDIRECTION',
        },
        {
          type: 'confirm',
          name: 'includeQueryParameters',
          message: 'Include original query parameters?',
          default: false,
          when: () => answers.redirectionType === 'GLOBAL_REDIRECTION',
        },
      ]);

      redirection = {
        type: answers.redirectionType,
        url: redirectionAnswers.url || undefined,
        parameters: redirectionAnswers.parameters || undefined,
        includeQueryParameters: redirectionAnswers.includeQueryParameters,
      };
    }

    const payload: CreateVariationDto = {
      name: answers.name,
      siteId: answers.siteId,
      cssCode: answers.cssCode || undefined,
      jsCode: answers.jsCode || undefined,
      isJsCodeAfterDomReady: answers.isJsCodeAfterDomReady,
      shadowDom: answers.shadowDom,
      redirection,
    };

    logger.info('Creating variation...');
    const newVariation = await createVariation(token, payload);

    logger.success(`\n✅ Variation created successfully! ID: ${newVariation.id}`);
  } catch (error: any) {
    logger.error(`Failed to create variation: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
