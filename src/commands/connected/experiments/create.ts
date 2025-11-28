import inquirer from 'inquirer';
import chalk from 'chalk';
import { createExperiment, CreateExperimentDto } from '../../../api/experiment';
import { logger } from '../../../utils/logger';

export const createExperimentCommand = async (token: string) => {
  logger.title('\n➕ Create New Experiment');

  try {
    const answers = await inquirer.prompt([
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
        type: 'input',
        name: 'baseURL',
        message: 'Base URL:',
        validate: input => input.startsWith('http') ? true : 'Must start with http/https',
      },
      {
        type: 'list',
        name: 'type',
        message: 'Type:',
        choices: ['CLASSIC', 'AI', 'DEVELOPER', 'MVT', 'PROMPT', 'SDK_HYBRID', 'FEATURE_FLAG'],
        default: 'CLASSIC'
      },
      {
        type: 'list',
        name: 'status',
        message: 'Initial Status:',
        choices: ['DRAFT', 'PAUSED', 'ACTIVE'],
        default: 'DRAFT'
      }
    ]);

    const payload: CreateExperimentDto = {
        name: answers.name,
        siteId: answers.siteId,
        baseURL: answers.baseURL,
        type: answers.type,
        status: answers.status
    };

    logger.info('Creating experiment...');
    const newXp = await createExperiment(token, payload);
    
    logger.success(`\n✅ Experiment created successfully! ID: ${newXp.id}`);

  } catch (error: any) {
    logger.error(`Failed to create experiment: ${error.message}`);
    if (error.response?.data) {
        console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};

