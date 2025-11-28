import inquirer from 'inquirer';
import chalk from 'chalk';
import { createSite, CreateSiteDto } from '../../../api/site';
import { logger } from '../../../utils/logger';

export const createSiteCommand = async (token: string) => {
  logger.title('\n➕ Create New Site');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Site URL:',
        validate: input => input.startsWith('http') ? true : 'URL must start with http/https',
      },
      {
        type: 'input',
        name: 'name',
        message: 'Site Name:',
        validate: input => input ? true : 'Required',
      },
      {
        type: 'list',
        name: 'type',
        message: 'Integration Type:',
        choices: ['SITE', 'SITE_JS', 'SITE_SDK', 'APPLICATION'],
        default: 'SITE'
      },
      {
        type: 'list',
        name: 'siteType',
        message: 'Site Category:',
        choices: ['ECOMMERCE', 'MEDIA', 'OTHER'],
        default: 'OTHER'
      }
    ]);

    const payload: CreateSiteDto = {
        url: answers.url,
        name: answers.name,
        type: answers.type,
        siteType: answers.siteType,
        // mainGoal is usually required but for simplicity prompt might be complex here as we need goal IDs. 
        // If API requires it, we might need to list goals first or allow optional.
        // The doc says "mainGoal required". This is tricky if we don't have goals yet.
        // Assuming user knows an ID or we pass 0/dummy if allowed, or we must fetch goals.
        // For now, I'll ask for ID manually or skip if user doesn't know.
    };

    const { mainGoal } = await inquirer.prompt([
        {
            type: 'number',
            name: 'mainGoal',
            message: 'Main Goal ID (required by API):',
            validate: input => !isNaN(input) ? true : 'Must be a number',
        }
    ]);
    payload.mainGoal = mainGoal;

    logger.info('Creating site...');
    const newSite = await createSite(token, payload);
    
    logger.success(`\n✅ Site created successfully! ID: ${newSite.id}`);
    console.log(chalk.dim(`Code: ${newSite.code}`));

  } catch (error: any) {
    logger.error(`Failed to create site: ${error.message}`);
    if (error.response?.data) {
        console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};

