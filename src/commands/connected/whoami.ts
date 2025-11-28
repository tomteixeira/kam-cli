import chalk from 'chalk';
import { getAllAccounts } from '../../api/account';
import { logger } from '../../utils/logger';

export const whoamiCommand = async (token: string) => {
  try {
    // Since there isn't a direct /me endpoint in the provided list, we can infer it
    // or for now just list all and maybe show the first one or similar. 
    // However, without a specific "get current user" endpoint, 'whoami' is tricky.
    // The user asked for 'whoami' but the docs provided are for /accounts.
    // Often /accounts returns the list of users.
    // Let's assume for this "whoami" we just list the accounts found as a debug step 
    // or better yet, fetch all and display a summary count or similar.
    
    // BUT, typically "whoami" implies "which user is this token for".
    // If that endpoint doesn't exist, we might just list all accounts to show access works.
    
    const accounts = await getAllAccounts(token);
    logger.info(`\nToken is valid. Found ${accounts.length} account(s) visible to this token.`);
    
    if (accounts.length > 0) {
        console.log(chalk.dim('First account details:'));
        const first = accounts[0];
        console.log(`  ID: ${first.id}`);
        console.log(`  Name: ${first.firstName} ${first.lastName}`);
        console.log(`  Email: ${first.email}`);
        console.log(`  Role: ${first.roles?.[0]?.name || 'N/A'}`);
    }

  } catch (error: any) {
    logger.error(`Failed to fetch account info: ${error.message}`);
  }
};

