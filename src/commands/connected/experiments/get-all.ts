import chalk from 'chalk';
import { getAllExperiments } from '../../../api/experiment';
import { logger } from '../../../utils/logger';

export const getExperimentsCommand = async (token: string) => {
  try {
    const experiments = await getAllExperiments(token);
    logger.title(`\n🧪 Experiments List (${experiments.length})`);
    
    if (experiments.length === 0) {
        logger.warning('No experiments found.');
        return;
    }

    // Table header
    console.log(chalk.bold('ID'.padEnd(10) + 'Type'.padEnd(12) + 'Name'.padEnd(40) + 'Status'.padEnd(15) + 'Site ID'));
    console.log(chalk.dim('─'.repeat(100)));

    experiments.forEach(xp => {
        let statusColor = chalk.white;
        if (xp.status === 'ACTIVE') statusColor = chalk.green;
        else if (xp.status === 'PAUSED') statusColor = chalk.yellow;
        else if (xp.status === 'STOPPED') statusColor = chalk.red;
        else if (xp.status === 'ARCHIVED') statusColor = chalk.dim;

        console.log(
            xp.id.toString().padEnd(10) + 
            (xp.type || 'UNKNOWN').substring(0, 11).padEnd(12) + 
            (xp.name || 'Unnamed').padEnd(40) + 
            statusColor(xp.status || 'UNKNOWN').padEnd(15) + 
            xp.siteId
        );
    });
    console.log('');

  } catch (error: any) {
    logger.error(`Failed to fetch experiments: ${error.message}`);
  }
};

