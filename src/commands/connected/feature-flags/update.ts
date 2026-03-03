import inquirer from 'inquirer';
import chalk from 'chalk';
import { getFeatureFlag, updateFeatureFlag, UpdateFeatureFlagDto } from '../../../api/feature-flag';
import { logger } from '../../../utils/logger';

export const updateFeatureFlagCommand = async (token: string, args: string[]) => {
  logger.title('\n✏️  Update Feature Flag');

  try {
    const siteCodeArg = args[0];
    const featureKeyArg = args[1];

    const { siteCode, featureKey } = await inquirer.prompt([
      {
        type: 'input',
        name: 'siteCode',
        message: 'Site code:',
        default: siteCodeArg,
        validate: (input) => (input.length === 10 ? true : 'Must be exactly 10 characters'),
      },
      {
        type: 'input',
        name: 'featureKey',
        message: 'Feature key:',
        default: featureKeyArg,
        validate: (input) => (input ? true : 'Required'),
      },
    ]);

    logger.info('Fetching current feature flag...');
    const current = await getFeatureFlag(token, siteCode, featureKey);
    logger.info(`Current: ${current.name} | Health: ${current.health ?? 'N/A'} | Archived: ${current.archived ? 'Yes' : 'No'}`);

    const { fieldsToUpdate } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'fieldsToUpdate',
        message: 'Select fields to update:',
        choices: [
          { name: 'Name', value: 'name' },
          { name: 'Description', value: 'description' },
          { name: 'Tags', value: 'tags' },
          { name: 'Archive status', value: 'isArchived' },
        ],
        validate: (input) => (input.length > 0 ? true : 'Select at least one field'),
      },
    ]);

    const prompts: any[] = [];
    if (fieldsToUpdate.includes('name')) {
      prompts.push({ type: 'input', name: 'name', message: 'Name:', default: current.name });
    }
    if (fieldsToUpdate.includes('description')) {
      prompts.push({ type: 'input', name: 'description', message: 'Description:', default: current.description || '' });
    }
    if (fieldsToUpdate.includes('tags')) {
      prompts.push({ type: 'input', name: 'tags', message: 'Tags (comma separated):', default: current.tags?.join(', ') || '' });
    }
    if (fieldsToUpdate.includes('isArchived')) {
      prompts.push({ type: 'confirm', name: 'isArchived', message: 'Archive the feature flag?', default: current.archived ?? false });
    }

    const answers = prompts.length > 0 ? await inquirer.prompt(prompts) : {};

    const payload: UpdateFeatureFlagDto = { featureKey };
    if (fieldsToUpdate.includes('name')) payload.name = answers.name;
    if (fieldsToUpdate.includes('description')) payload.description = answers.description || undefined;
    if (fieldsToUpdate.includes('tags')) {
      const tags = answers.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      payload.tags = tags.length ? tags : undefined;
    }
    if (fieldsToUpdate.includes('isArchived')) payload.isArchived = answers.isArchived;

    logger.info('Updating feature flag...');
    const updated = await updateFeatureFlag(token, siteCode, featureKey, payload);
    logger.success(`\n✅ Feature flag "${updated.featureKey}" updated successfully!`);
  } catch (error: any) {
    logger.error(`Failed to update feature flag: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
