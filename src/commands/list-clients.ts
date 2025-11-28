import chalk from 'chalk';
import { ConfigService } from '../services/config.service';
import { logger } from '../utils/logger';

export const listClientsCommand = async () => {
  const configService = new ConfigService();
  
  logger.title('\n📂 Available Clients\n');

  const clients = configService.getAllClients();
  const currentClient = configService.getCurrentClient();

  if (clients.length === 0) {
    logger.warning('No clients configured yet.');
    console.log(chalk.dim('Use "add-client" to add your first client.'));
    return;
  }

  clients.forEach(client => {
    if (client === currentClient) {
      console.log(chalk.green(`  ➤ ${chalk.bold(client)} (Active)`));
    } else {
      console.log(chalk.white(`    ${client}`));
    }
  });
  console.log(''); // Empty line at the end
};

