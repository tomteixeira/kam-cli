import chalk from 'chalk';
import { getAllSites } from '../../../api/site';
import { logger } from '../../../utils/logger';

export const getSitesCommand = async (token: string) => {
  try {
    const sites = await getAllSites(token);
    logger.title(`\n🌐 Sites List (${sites.length})`);
    
    if (sites.length === 0) {
        logger.warning('No sites found.');
        return;
    }

    // Simple table-like display
    console.log(chalk.bold('ID'.padEnd(10) + 'Code'.padEnd(15) + 'Name'.padEnd(40) + 'URL'));
    console.log(chalk.dim('─'.repeat(100)));

    sites.forEach(site => {
        console.log(
            site.id.toString().padEnd(10) + 
            (site.code || 'N/A').padEnd(15) + 
            (site.name || 'Unnamed Site').padEnd(40) + 
            (site.url || '').substring(0, 35)
        );
    });
    console.log('');

  } catch (error: any) {
    logger.error(`Failed to fetch sites: ${error.message}`);
  }
};

