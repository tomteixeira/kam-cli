import inquirer from 'inquirer';
import chalk from 'chalk';
import { createFeatureFlag, CreateFeatureFlagDto } from '../../../api/feature-flag';
import { logger } from '../../../utils/logger';

export const createFeatureFlagCommand = async (token: string) => {
  logger.title('\n➕ Create New Feature Flag');

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Feature flag name:',
        validate: (input) => (input ? true : 'Required'),
      },
      {
        type: 'input',
        name: 'featureKey',
        message: 'Feature key (lowercase, a-z 0-9 - _):',
        validate: (input) =>
          /^[a-z0-9_-]{1,255}$/.test(input) ? true : 'Must match ^[a-z0-9_-]{1,255}$',
      },
      {
        type: 'input',
        name: 'siteCode',
        message: 'Site code (10 characters):',
        validate: (input) => (input.length === 10 ? true : 'Must be exactly 10 characters'),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):',
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Tags (comma separated, optional):',
      },
      {
        type: 'confirm',
        name: 'addVariations',
        message: 'Add variations now?',
        default: true,
      },
    ]);

    let variations: CreateFeatureFlagDto['variations'];
    if (answers.addVariations) {
      variations = [];
      let addMore = true;
      while (addMore) {
        const varAnswer = await inquirer.prompt([
          { type: 'input', name: 'key', message: 'Variation key:', validate: (i) => (i ? true : 'Required') },
          { type: 'input', name: 'name', message: 'Variation name:', validate: (i) => (i ? true : 'Required') },
        ]);
        variations.push({ key: varAnswer.key, name: varAnswer.name });
        const { more } = await inquirer.prompt([{ type: 'confirm', name: 'more', message: 'Add another variation?', default: false }]);
        addMore = more;
      }
    }

    const tags = answers.tags
      ? answers.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : undefined;

    const payload: CreateFeatureFlagDto = {
      name: answers.name,
      featureKey: answers.featureKey,
      siteCode: answers.siteCode,
      description: answers.description || undefined,
      tags: tags?.length ? tags : undefined,
      variations,
    };

    logger.info('Creating feature flag...');
    const flag = await createFeatureFlag(token, payload);

    logger.success(`\n✅ Feature flag created! ID: ${flag.id} | Key: ${flag.featureKey}`);
  } catch (error: any) {
    logger.error(`Failed to create feature flag: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
