import chalk from 'chalk';
import { getGoal } from '../../../api/goal';
import { logger } from '../../../utils/logger';

export const getGoalCommand = async (token: string, args: string[]) => {
  const goalId = args[0];

  // Validation: digit only, 1 to 6 digits
  const idRegex = /^\d{1,6}$/;

  if (!goalId || !idRegex.test(goalId)) {
      logger.error('Invalid Goal ID. Must be a number between 1 and 6 digits.');
      return;
  }

  try {
    const goal = await getGoal(token, parseInt(goalId, 10));
    
    logger.title(`\n🎯 Goal Details: ${goal.name}`);
    console.log(`  ID: ${chalk.bold(goal.id)}`);
    console.log(`  Type: ${chalk.cyan(goal.type)}`);
    console.log(`  Status: ${goal.status === 'ACTIVE' ? chalk.green('ACTIVE') : chalk.red(goal.status)}`);
    console.log(`  Site ID: ${goal.siteId}`);
    console.log(`  Description: ${goal.description || 'N/A'}`);
    console.log(`  Created: ${goal.dateCreated || 'N/A'}`);
    console.log(`  Multiple Conversions: ${goal.hasMultipleConversions ? 'Yes' : 'No'}`);
    console.log('');

  } catch (error: any) {
    if (error.response?.status === 404) {
        logger.error(`Goal with ID ${goalId} not found.`);
    } else {
        logger.error(`Failed to fetch goal: ${error.message}`);
    }
  }
};


