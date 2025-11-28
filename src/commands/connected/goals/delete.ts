import inquirer from 'inquirer';
import { deleteGoal } from '../../../api/goal';
import { logger } from '../../../utils/logger';

export const deleteGoalCommand = async (token: string, args: string[]) => {
  const goalId = args[0];
  const idRegex = /^\d{1,6}$/;

  if (!goalId || !idRegex.test(goalId)) {
      logger.error('Invalid Goal ID. Must be a number between 1 and 6 digits.');
      return;
  }

  try {
      const { confirm } = await inquirer.prompt([
          {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete goal ${goalId}? This CANNOT be undone.`,
              default: false
          }
      ]);

      if (!confirm) {
          logger.warning('Operation cancelled.');
          return;
      }

      await deleteGoal(token, parseInt(goalId, 10));
      logger.success(`\n✅ Goal ${goalId} deleted successfully.`);

  } catch (error: any) {
      logger.error(`Failed to delete goal: ${error.message}`);
  }
};


