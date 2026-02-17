import inquirer from 'inquirer';
import chalk from 'chalk';
import { createGoal, CreateGoalDto, getGoal } from '../../../api/goal';
import { getAllSites } from '../../../api/site';
import { logger } from '../../../utils/logger';

const parseGoalId = (value?: string): number | null => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildDuplicatePayload = (goal: CreateGoalDto, siteId: number): CreateGoalDto => {
  const payload: CreateGoalDto = {
    name: goal.name,
    type: goal.type,
    siteId,
  };

  if (typeof goal.hasMultipleConversions === 'boolean') {
    payload.hasMultipleConversions = goal.hasMultipleConversions;
  }

  if (goal.description) {
    payload.description = goal.description;
  }

  if (goal.params) {
    payload.params = goal.params;
  }

  return payload;
};

export const duplicateGoalToAllCommand = async (token: string, args: string[]) => {
  logger.title('\n🎯 Duplicate Goal to All Sites');

  try {
    const goalIdFromArgs = parseGoalId(args[0]);

    const answers = await inquirer.prompt([
      {
        type: 'number',
        name: 'goalId',
        message: 'Goal ID:',
        default: goalIdFromArgs ?? undefined,
        validate: input => Number.isFinite(input) ? true : 'Must be a number',
      },
    ]);

    const goalId = Number(answers.goalId);

    logger.info('Fetching source goal...');
    const sourceGoal = await getGoal(token, goalId);

    const goalTemplate: CreateGoalDto = {
      name: sourceGoal.name,
      type: sourceGoal.type,
      siteId: sourceGoal.siteId,
      hasMultipleConversions: sourceGoal.hasMultipleConversions,
      description: sourceGoal.description,
      params: sourceGoal.params,
    };

    logger.info('Fetching all sites...');
    const sites = await getAllSites(token);
    const targetSites = sites.filter(site => site.id !== sourceGoal.siteId);

    if (!targetSites.length) {
      logger.warning('No other sites found to duplicate the goal.');
      return;
    }

    const createdGoals: Array<{ siteCode: string; goalId: number }> = [];
    const failures: Array<{ siteCode: string; error: string }> = [];

    for (const site of targetSites) {
      try {
        logger.info(`Duplicating goal to ${site.code ?? site.id}...`);
        const payload = buildDuplicatePayload(goalTemplate, site.id);
        const created = await createGoal(token, payload);

        createdGoals.push({ siteCode: site.code ?? String(site.id), goalId: created.id });
      } catch (error: any) {
        failures.push({
          siteCode: site.code ?? String(site.id),
          error: error.response?.data ? JSON.stringify(error.response.data) : error.message,
        });
      }
    }

    if (createdGoals.length) {
      logger.success('\n✅ Goal duplicated successfully:');
      createdGoals.forEach(result => {
        console.log(chalk.green(`- ${result.siteCode}: ${result.goalId}`));
      });
    }

    if (failures.length) {
      logger.warning('\n⚠️ Some duplications failed:');
      failures.forEach(failure => {
        console.log(chalk.yellow(`- ${failure.siteCode}: ${failure.error}`));
      });
    }
  } catch (error: any) {
    logger.error(`Failed to duplicate goal: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
