import inquirer from 'inquirer';
import { ConfigService } from '../services/config.service';
import { logger } from '../utils/logger';

export const addClientCommand = async () => {
  const configService = new ConfigService();

  logger.title('\n➕ Add New Client Credentials\n');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter client name (alias):',
        validate: (input) => input.trim() !== '' ? true : 'Name is required',
      },
      {
        type: 'input',
        name: 'clientId',
        message: 'Enter Client ID:',
        validate: (input) => input.trim() !== '' ? true : 'Client ID is required',
      },
      {
        type: 'password',
        name: 'clientSecret',
        message: 'Enter Client Secret:',
        mask: '*',
        validate: (input) => input.trim() !== '' ? true : 'Client Secret is required',
      },
    ]);

    configService.addClient(answers.name, answers.clientId, answers.clientSecret);
    logger.success(`\n✅ Client "${answers.name}" added successfully to .env!`);
    
    // Ask if user wants to switch to this client immediately
    const { switchNow } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'switchNow',
            message: `Do you want to switch to "${answers.name}" now?`,
            default: true
        }
    ]);

    if (switchNow) {
        configService.setCurrentClient(answers.name);
        logger.success(`\n🔌 Switched context to "${answers.name}"`);
    }

  } catch (error: any) {
    logger.error(`Failed to add client: ${error.message}`);
  }
};

