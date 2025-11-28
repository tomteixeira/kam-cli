import inquirer from 'inquirer';
import chalk from 'chalk';
import { createAccount, CreateAccountDto } from '../../api/account';
import { logger } from '../../utils/logger';

export const createAccountCommand = async (token: string) => {
  logger.title('\n➕ Create New Account');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email:',
        validate: input => input.includes('@') || 'Invalid email',
      },
      {
        type: 'input',
        name: 'firstName',
        message: 'First Name:',
        validate: input => input ? true : 'Required',
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Last Name:',
        validate: input => input ? true : 'Required',
      },
      {
          type: 'list',
          name: 'preferredLocale',
          message: 'Locale:',
          choices: ['en', 'fr', 'de'],
          default: 'en'
      },
      {
          type: 'list',
          name: 'solution',
          message: 'Solution:',
          choices: ['WEB_EXPERIMENTATION', 'FEATURE_EXPERIMENTATION'],
          default: 'WEB_EXPERIMENTATION'
      }
    ]);

    const payload: CreateAccountDto = {
        email: answers.email,
        firstName: answers.firstName,
        lastName: answers.lastName,
        preferredLocale: answers.preferredLocale,
        solutions: [answers.solution],
        // Note: Roles and other complex objects omitted for simplicity in this first pass
        // You can add sub-prompts for roles if needed.
    };

    logger.info('Creating account...');
    const newAccount = await createAccount(token, payload);
    
    logger.success(`\n✅ Account created successfully! ID: ${newAccount.id}`);
    console.log(chalk.dim(`Email: ${newAccount.email}`));

  } catch (error: any) {
    logger.error(`Failed to create account: ${error.message}`);
    if (error.response?.data) {
        console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};

