import inquirer from 'inquirer';
import chalk from 'chalk';
import { createGoal, CreateGoalDto } from '../../../api/goal';
import { logger } from '../../../utils/logger';

export const createGoalCommand = async (token: string) => {
  logger.title('\n➕ Create New Goal');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Goal Name:',
        validate: input => input ? true : 'Required',
      },
      {
        type: 'list',
        name: 'type',
        message: 'Goal Type:',
        choices: ['CLICK', 'PAGE_VIEWS', 'TIME_SPENT', 'CUSTOM', 'SCROLL', 'URL', 'RETENTION_RATE'],
        default: 'CLICK'
      },
      {
        type: 'number',
        name: 'siteId',
        message: 'Site ID:',
        validate: input => !isNaN(input) ? true : 'Must be a number',
      },
      {
        type: 'confirm',
        name: 'hasMultipleConversions',
        message: 'Allow multiple conversions?',
        default: true
      },
      {
          type: 'input',
          name: 'description',
          message: 'Description (optional):',
      }
    ]);

    const payload: CreateGoalDto = {
        name: answers.name,
        type: answers.type,
        siteId: answers.siteId,
        hasMultipleConversions: answers.hasMultipleConversions,
        description: answers.description
    };

    logger.info('Creating goal...');
    const newGoal = await createGoal(token, payload);
    
    logger.success(`\n✅ Goal created successfully! ID: ${newGoal.id}`);

  } catch (error: any) {
    logger.error(`Failed to create goal: ${error.message}`);
    if (error.response?.data) {
        console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};


