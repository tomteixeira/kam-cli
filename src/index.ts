#!/usr/bin/env node
import { Command } from 'commander';
import figlet from 'figlet';
import chalk from 'chalk';
import { addClientCommand } from './commands/add-client';
import { switchClientCommand } from './commands/switch-client';
import { listClientsCommand } from './commands/list-clients';
import { removeClientCommand } from './commands/remove-client';
import { connectCommand } from './commands/connect';
import { logger } from './utils/logger';
import { ConfigService } from './services/config.service';

const program = new Command();

console.log(
  chalk.cyan(
    figlet.textSync('Kam CLI', { horizontalLayout: 'full' })
  )
);

const configService = new ConfigService();
const currentClient = configService.getCurrentClient();

if (currentClient) {
    console.log(chalk.dim(`Active Client: ${currentClient}\n`));
} else {
    console.log(chalk.dim('No client selected\n'));
}

program
  .version('1.0.0')
  .description('CLI for Kameleoon Automation API');

program
  .command('add-client')
  .description('Add new client credentials to .env')
  .action(addClientCommand);

program
  .command('use-client')
  .alias('switch')
  .description('Switch between configured clients')
  .action(switchClientCommand);

program
  .command('list-clients')
  .alias('ls')
  .description('List all configured clients')
  .action(listClientsCommand);

program
  .command('remove-client')
  .alias('rm')
  .description('Remove a client configuration')
  .action(removeClientCommand);

program
  .command('connect')
  .description('Connect to the active client and enter interactive mode')
  .action(connectCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

