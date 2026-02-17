import inquirer from 'inquirer';
import chalk from 'chalk';
import { getSiteByCode } from '../../../api/site';
import { logger } from '../../../utils/logger';

export const getTrackingScriptCommand = async (token: string, args: string[]) => {
  const siteCodeFromArgs = args[0];
  let resolvedSiteCode = siteCodeFromArgs ?? '';

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'siteCode',
        message: 'Site code:',
        default: siteCodeFromArgs || undefined,
        validate: input => input ? true : 'Required',
      },
    ]);

    const siteCode = String(answers.siteCode).trim();
    resolvedSiteCode = siteCode;

    logger.info(`Fetching site ${siteCode}...`);
    const site = await getSiteByCode(token, siteCode);

    logger.title(`\n🧩 Global Script for ${site.code}`);
    if (site.trackingScript) {
      console.log(chalk.cyan(site.trackingScript));
    } else {
      logger.warning('No trackingScript found for this site.');
    }
    console.log('');
  } catch (error: any) {
    if (error.response?.status === 404) {
      logger.error(`Site with code ${resolvedSiteCode} not found.`);
    } else {
      logger.error(`Failed to fetch trackingScript: ${error.message}`);
    }
  }
};
