import chalk from 'chalk';
import { getCustomData } from '../../../api/custom-data';
import { logger } from '../../../utils/logger';

export const getCustomDataCommand = async (token: string, args: string[]) => {
  const cdId = args[0];
  const idRegex = /^\d+$/; // Basic digit check, assuming Custom Data IDs are just numbers

  if (!cdId || !idRegex.test(cdId)) {
      logger.error('Invalid Custom Data ID. Must be a number.');
      return;
  }

  try {
    const cd = await getCustomData(token, parseInt(cdId, 10));
    
    logger.title(`\n📊 Custom Data Details: ${cd.name}`);
    console.log(`  ID: ${chalk.bold(cd.id)}`);
    console.log(`  Index: ${cd.index}`);
    console.log(`  Type: ${chalk.cyan(cd.type)}`);
    console.log(`  Method: ${cd.method}`);
    console.log(`  Format: ${cd.format}`);
    console.log(`  Site ID: ${cd.siteId}`);
    console.log(`  Local Only: ${cd.isLocalOnly ? 'Yes' : 'No'}`);
    console.log(`  Description: ${cd.description || 'N/A'}`);
    console.log('');

  } catch (error: any) {
    if (error.response?.status === 404) {
        logger.error(`Custom Data with ID ${cdId} not found.`);
    } else {
        logger.error(`Failed to fetch custom data: ${error.message}`);
    }
  }
};


