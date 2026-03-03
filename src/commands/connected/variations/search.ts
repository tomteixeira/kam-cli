import inquirer from 'inquirer';
import chalk from 'chalk';
import { searchVariations } from '../../../api/variation';
import { logger } from '../../../utils/logger';

const SEARCH_OPERATORS = [
  'EQUAL',
  'NOT_EQUAL',
  'LESS',
  'GREATER',
  'LESS_OR_EQUAL',
  'GREATER_OR_EQUAL',
  'LIKE',
  'NOT_LIKE',
  'IN',
  'NOT_IN',
  'IS_NULL',
  'IS_NOT_NULL',
  'IS_TRUE',
  'IS_FALSE',
  'CONTAINS',
] as const;

export const searchVariationsCommand = async (token: string) => {
  logger.title('\n🔍 Search Variations');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'field',
        message: 'Filter field (e.g. name, siteId, experimentId) or leave empty:',
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
          parameters: answers.parameters
            .split(',')
            .map((p: string) => p.trim())
            .filter(Boolean),
        }
      : undefined;

    logger.info('Searching variations...');
    const variations = await searchVariations(token, {
      filter,
      page: Number.isFinite(answers.page) ? answers.page : undefined,
      perPage: Number.isFinite(answers.perPage) ? answers.perPage : undefined,
    });

    logger.title(`\n🎨 Search Results (${variations.length})`);

    if (variations.length === 0) {
      logger.warning('No variations found matching the criteria.');
      return;
    }

    console.log(
      chalk.bold(
        'ID'.padEnd(10) +
          'Name'.padEnd(35) +
          'Site ID'.padEnd(10) +
          'Experiment'.padEnd(14) +
          'Perso',
      ),
    );
    console.log(chalk.dim('─'.repeat(80)));

    variations.forEach((variation) => {
      console.log(
        variation.id.toString().padEnd(10) +
          (variation.name || 'Unnamed').substring(0, 34).padEnd(35) +
          variation.siteId.toString().padEnd(10) +
          (variation.experimentId ? String(variation.experimentId) : '—').padEnd(14) +
          (variation.personalizationId ? String(variation.personalizationId) : '—'),
      );
    });
    console.log('');
  } catch (error: any) {
    logger.error(`Failed to search variations: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
