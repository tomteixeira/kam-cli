import chalk from 'chalk';
import { getAllAccounts } from '../../api/account';
import { logger } from '../../utils/logger';

export const listAccountsCommand = async (token: string) => {
  try {
    const accounts = await getAllAccounts(token);
    
    logger.title(`\n👥 Accounts List (${accounts.length})`);
    
    if (accounts.length === 0) {
        logger.warning('No accounts found.');
        return;
    }

    // Simple table-like display
    console.log(chalk.bold('ID'.padEnd(10) + 'Email'.padEnd(35) + 'Name'.padEnd(30) + 'Status'));
    console.log(chalk.dim('─'.repeat(90)));

    accounts.forEach(acc => {
        const name = `${acc.firstName} ${acc.lastName}`;
        const statusColor = acc.status === 'ACTIVATED' ? chalk.green : chalk.yellow;
        
        console.log(
            acc.id.toString().padEnd(10) + 
            acc.email.padEnd(35) + 
            name.padEnd(30) + 
            statusColor(acc.status || 'UNKNOWN')
        );
    });
    console.log('');

  } catch (error: any) {
    logger.error(`Failed to list accounts: ${error.message}`);
  }
};

