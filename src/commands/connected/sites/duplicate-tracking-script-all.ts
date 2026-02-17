import inquirer from 'inquirer';
import chalk from 'chalk';
import { getAllSites, getSiteByCode, updateSiteTrackingScript } from '../../../api/site';
import { logger } from '../../../utils/logger';

export const duplicateTrackingScriptToAllCommand = async (token: string, args: string[]) => {
  logger.title('\n⚡ Duplicate Global Script to All Sites');

  const sourceSiteCodeFromArgs = args[0];

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'sourceSiteCode',
        message: 'Source site code:',
        default: sourceSiteCodeFromArgs || undefined,
        validate: input => input ? true : 'Required',
      },
    ]);

    const sourceSiteCode = String(answers.sourceSiteCode).trim();

    logger.info(`Fetching source site ${sourceSiteCode}...`);
    const sourceSite = await getSiteByCode(token, sourceSiteCode);
    const trackingScript = sourceSite.trackingScript ?? '';

    if (!trackingScript) {
      logger.warning('Source site has no trackingScript. Targets will be cleared.');
    }

    logger.info('Fetching all sites...');
    const sites = await getAllSites(token);
    const targetSites = sites.filter(site => site.code && site.code !== sourceSiteCode);

    if (!targetSites.length) {
      logger.warning('No other sites found to update.');
      return;
    }

    const updatedSites: string[] = [];
    const failures: Array<{ siteCode: string; error: string }> = [];

    for (const site of targetSites) {
      try {
        logger.info(`Updating trackingScript for ${site.code}...`);
        await updateSiteTrackingScript(token, site.id, trackingScript);
        updatedSites.push(site.code);
      } catch (error: any) {
        failures.push({
          siteCode: site.code,
          error: error.response?.data ? JSON.stringify(error.response.data) : error.message,
        });
      }
    }

    if (updatedSites.length) {
      logger.success('\n✅ trackingScript duplicated successfully:');
      updatedSites.forEach(code => {
        console.log(chalk.green(`- ${code}`));
      });
    }

    if (failures.length) {
      logger.warning('\n⚠️ Some updates failed:');
      failures.forEach(failure => {
        console.log(chalk.yellow(`- ${failure.siteCode}: ${failure.error}`));
      });
    }
  } catch (error: any) {
    logger.error(`Failed to duplicate trackingScript: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
