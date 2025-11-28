import inquirer from 'inquirer';
import chalk from 'chalk';
import { createCustomData, CreateCustomDataDto } from '../../../api/custom-data';
import { logger } from '../../../utils/logger';

export const createCustomDataCommand = async (token: string) => {
  logger.title('\n➕ Create New Custom Data');

  try {
    // Step 1: Basic Info
    const basicAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
        validate: input => input ? true : 'Required',
      },
      {
        type: 'number',
        name: 'siteId',
        message: 'Site ID:',
        validate: input => !isNaN(input) ? true : 'Must be a number',
      },
      {
        type: 'list',
        name: 'type',
        message: 'Type:',
        choices: ['UNIQUE', 'LIST', 'COUNT_LIST'],
        default: 'UNIQUE'
      },
      {
        type: 'list',
        name: 'format',
        message: 'Format:',
        choices: ['STRING', 'NUMBER', 'BOOLEAN'],
        default: 'STRING'
      },
      {
        type: 'list',
        name: 'method',
        message: 'Collection Method:',
        choices: ['CLIENT', 'CUSTOM_CODE', 'ADOBE_ANALYTICS', 'GTM', 'SDK', 'TC', 'TEALIUM'],
        default: 'CUSTOM_CODE'
      }
    ]);

    // Step 2: Method Specific Info
    let methodSpecificAnswers: any = {};
    
    if (basicAnswers.method === 'CUSTOM_CODE') {
        methodSpecificAnswers = await inquirer.prompt([
            {
                type: 'editor',
                name: 'customEvalCode',
                message: 'Enter Custom Evaluation Code:',
            }
        ]);
    } else if (basicAnswers.method === 'GTM') {
        methodSpecificAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'gtmVariableName',
                message: 'GTM Variable Name:',
            }
        ]);
    } else if (basicAnswers.method === 'ADOBE_ANALYTICS') {
         methodSpecificAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'adobeAnalyticsVariableName',
                message: 'Adobe Analytics Variable Name:',
            }
        ]);
    }

    const payload: CreateCustomDataDto = {
        name: basicAnswers.name,
        siteId: basicAnswers.siteId,
        type: basicAnswers.type,
        format: basicAnswers.format,
        method: basicAnswers.method,
        isLocalOnly: false, // Default
        ...methodSpecificAnswers
    };

    logger.info('Creating custom data...');
    const newCd = await createCustomData(token, payload);
    
    logger.success(`\n✅ Custom Data created successfully! ID: ${newCd.id}`);
    console.log(chalk.dim(`Index: ${newCd.index}`));

  } catch (error: any) {
    logger.error(`Failed to create custom data: ${error.message}`);
    if (error.response?.data) {
        console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};


