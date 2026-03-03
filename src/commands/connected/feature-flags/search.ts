import inquirer from 'inquirer';
import chalk from 'chalk';
import { searchFeatureFlags } from '../../../api/feature-flag';
import { logger } from '../../../utils/logger';

const SEARCH_OPERATORS = [
  'EQUAL', 'NOT_EQUAL', 'LESS', 'GREATER', 'LESS_OR_EQUAL', 'GREATER_OR_EQUAL',
  'LIKE', 'NOT_LIKE', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL',
  'IS_TRUE', 'IS_FALSE', 'IS_EMPTY', 'IS_NOT_EMPTY', 'CONTAINS',
] as const;

export const searchFeatureFlagsCommand = async (token: string) => {
  logger.title('\n🔍 Search Feature Flags');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'field',
        message: 'Filter field (e.g. name, featureKey, siteCode, archived) or leave empty:',
      },
      {
        type: 'list',
        name: 'operator',
        message: 'Filter operator:',
        choices: [...SEARCH_OPERATORS],
        when: (ans) => !!ans.field,
      },
      {
        type: 'input',
        name: 'parameters',
        message: 'Filter value(s) (comma separated for IN/NOT_IN):',
        when: (ans) => !!ans.field,
      },
      {
        type: 'number',
        name: 'page',
        message: 'Page number (optional):',
        default: undefined,
      },
      {
        type: 'number',
        name: 'perPage',
        message: 'Items per page (optional):',
        default: undefined,
      },
    ]);

    const filter = answers.field
      ? {
          field: answers.field,
          operator: answers.operator,
          parameters: answers.parameters.split(',').map((p: string) => p.trim()).filter(Boolean),
        }
      : undefined;

    logger.info('Searching feature flags...');
    const flags = await searchFeatureFlags(token, {
      filter,
      page: Number.isFinite(answers.page) ? answers.page : undefined,
      perPage: Number.isFinite(answers.perPage) ? answers.perPage : undefined,
    });

    logger.title(`\n🚩 Search Results (${flags.length})`);

    if (flags.length === 0) {
      logger.warning('No feature flags found matching the criteria.');
      return;
    }

    console.log(
      chalk.bold(
        'ID'.padEnd(10) +
          'Key'.padEnd(30) +
          'Name'.padEnd(30) +
          'Site'.padEnd(14) +
          'Health',
      ),
    );
    console.log(chalk.dim('─'.repeat(95)));

    flags.forEach((flag) => {
      console.log(
        flag.id.toString().padEnd(10) +
          flag.featureKey.substring(0, 29).padEnd(30) +
          (flag.name || 'Unnamed').substring(0, 29).padEnd(30) +
          flag.siteCode.padEnd(14) +
          (flag.health || '—'),
      );
    });
    console.log('');
  } catch (error: any) {
    logger.error(`Failed to search feature flags: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
