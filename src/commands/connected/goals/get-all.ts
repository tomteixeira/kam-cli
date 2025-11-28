import chalk from 'chalk';
import { getAllGoals } from '../../../api/goal';
import { logger } from '../../../utils/logger';

export const getGoalsCommand = async (token: string) => {
  try {
    const goals = await getAllGoals(token);
    logger.title(`\n🎯 Goals List (${goals.length})`);
    
    if (goals.length === 0) {
        logger.warning('No goals found.');
        return;
    }

    // Table header
    console.log(chalk.bold('ID'.padEnd(10) + 'Type'.padEnd(15) + 'Name'.padEnd(40) + 'Status'.padEnd(15) + 'Site ID'));
    console.log(chalk.dim('─'.repeat(100)));

    goals.forEach(goal => {
        const statusColor = goal.status === 'ACTIVE' ? chalk.green : chalk.red;
        
        console.log(
            goal.id.toString().padEnd(10) + 
            (goal.type || 'UNKNOWN').substring(0, 14).padEnd(15) + 
            (goal.name || 'Unnamed Goal').padEnd(40) + 
            statusColor(goal.status || 'UNKNOWN').padEnd(15) + 
            goal.siteId
        );
    });
    console.log('');

  } catch (error: any) {
    logger.error(`Failed to fetch goals: ${error.message}`);
  }
};


