import chalk from 'chalk';
import { getAllCustomData } from '../../../api/custom-data';
import { logger } from '../../../utils/logger';

export const getCustomDataListCommand = async (token: string) => {
  try {
    const dataList = await getAllCustomData(token);
    logger.title(`\n📊 Custom Data List (${dataList.length})`);
    
    if (dataList.length === 0) {
        logger.warning('No custom data found.');
        return;
    }

    // Table header
    console.log(chalk.bold('ID'.padEnd(10) + 'Index'.padEnd(8) + 'Name'.padEnd(35) + 'Method'.padEnd(15) + 'Format'.padEnd(10) + 'Site ID'));
    console.log(chalk.dim('─'.repeat(100)));

    dataList.forEach(cd => {
        console.log(
            cd.id.toString().padEnd(10) + 
            (cd.index !== undefined ? cd.index.toString() : '-').padEnd(8) + 
            (cd.name || 'Unnamed').padEnd(35) + 
            (cd.method || 'UNKNOWN').substring(0, 14).padEnd(15) + 
            (cd.format || '-').padEnd(10) + 
            cd.siteId
        );
    });
    console.log('');

  } catch (error: any) {
    logger.error(`Failed to fetch custom data: ${error.message}`);
  }
};


