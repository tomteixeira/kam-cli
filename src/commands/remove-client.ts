import inquirer from 'inquirer';
import { ConfigService } from '../services/config.service';
import { logger } from '../utils/logger';

export const removeClientCommand = async () => {
  const configService = new ConfigService();

  logger.title('\n🗑️  Remove Client\n');

  const clients = configService.getAllClients();

  if (clients.length === 0) {
    logger.warning('No clients found to remove.');
    return;
  }

  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'client',
        message: 'Select a client to remove:',
        choices: clients,
      },
      {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to delete this client? This cannot be undone.',
          default: false
      }
    ]);

    if (answers.confirm) {
        configService.removeClient(answers.client);
        logger.success(`\n✅ Client "${answers.client}" removed successfully.`);
    } else {
        logger.warning('\nOperation cancelled.');
    }

  } catch (error: any) {
    logger.error(`Failed to remove client: ${error.message}`);
  }
};

