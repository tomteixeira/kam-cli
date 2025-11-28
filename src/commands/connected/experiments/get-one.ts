import chalk from 'chalk';
import { getExperiment } from '../../../api/experiment';
import { logger } from '../../../utils/logger';

export const getExperimentCommand = async (token: string, args: string[]) => {
  const xpId = args[0];
  const idRegex = /^\d+$/; 

  if (!xpId || !idRegex.test(xpId)) {
      logger.error('Invalid Experiment ID. Must be a number.');
      return;
  }

  try {
    const xp = await getExperiment(token, parseInt(xpId, 10));
    
    logger.title(`\n🧪 Experiment Details: ${xp.name}`);
    console.log(`  ID: ${chalk.bold(xp.id)}`);
    console.log(`  Type: ${chalk.cyan(xp.type)}`);
    console.log(`  Status: ${xp.status}`);
    console.log(`  Site ID: ${xp.siteId}`);
    console.log(`  Base URL: ${xp.baseURL || 'N/A'}`);
    console.log(`  Method: ${xp.trafficAllocationMethod || 'N/A'}`);
    console.log(`  Created: ${xp.dateCreated || 'N/A'}`);
    if (xp.description) console.log(`  Description: ${xp.description}`);
    console.log('');

  } catch (error: any) {
    if (error.response?.status === 404) {
        logger.error(`Experiment with ID ${xpId} not found.`);
    } else {
        logger.error(`Failed to fetch experiment: ${error.message}`);
    }
  }
};

