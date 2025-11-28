import inquirer from 'inquirer';
import { ConfigService } from '../services/config.service';
import { logger } from '../utils/logger';

export const switchClientCommand = async () => {
  const configService = new ConfigService();

  logger.title('\n🔄 Switch Client Context\n');

  const clients = configService.getAllClients();
  const currentClient = configService.getCurrentClient();

  if (clients.length === 0) {
    logger.warning('No clients found. Please add a client first using "add-client".');
    return;
  }

  if (currentClient) {
      logger.info(`Current client: ${currentClient}`);
  }

  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'client',
        message: 'Select a client to connect to:',
        choices: clients,
        default: currentClient
      },
    ]);

    configService.setCurrentClient(answers.client);
    logger.success(`\n✅ Successfully connected to client "${answers.client}"!`);

  } catch (error: any) {
    logger.error(`Failed to switch client: ${error.message}`);
  }
};

