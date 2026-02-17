import inquirer from 'inquirer';
import chalk from 'chalk';
import { getSiteByCode, updateSiteTrackingScript } from '../../../api/site';
import { logger } from '../../../utils/logger';

const parseTargetSiteCodes = (value: string): string[] => {
  return value
    .split(/[, ]+/)
    .map(code => code.trim())
    .filter(Boolean);
};

export const duplicateTrackingScriptCommand = async (token: string, args: string[]) => {
  logger.title('\n🧩 Duplicate Global Script');

  const sourceSiteCodeFromArgs = args[0];
  const targetSiteCodesFromArgs = args.slice(1).join(' ').trim();

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'sourceSiteCode',
        message: 'Source site code:',
        default: sourceSiteCodeFromArgs || undefined,
        validate: input => input ? true : 'Required',
      },
      {
        type: 'input',
        name: 'targetSiteCodes',
        message: 'Target site codes (comma or space separated):',
        default: targetSiteCodesFromArgs || undefined,
        validate: input => parseTargetSiteCodes(input).length > 0 ? true : 'Provide at least one site code',
      },
    ]);

    const sourceSiteCode = String(answers.sourceSiteCode).trim();
    const targetSiteCodes = Array.from(
      new Set(parseTargetSiteCodes(answers.targetSiteCodes).filter(code => code !== sourceSiteCode)),
    );

    if (!targetSiteCodes.length) {
      logger.error('No valid target site codes provided.');
      return;
    }

    logger.info(`Fetching source site ${sourceSiteCode}...`);
    const sourceSite = await getSiteByCode(token, sourceSiteCode);
    const trackingScript = sourceSite.trackingScript ?? '';

    if (!trackingScript) {
      logger.warning('Source site has no trackingScript. Targets will be cleared.');
    }

    const updatedSites: string[] = [];
    const failures: Array<{ siteCode: string; error: string }> = [];

    for (const targetSiteCode of targetSiteCodes) {
      try {
        logger.info(`Resolving site ${targetSiteCode}...`);
        const targetSite = await getSiteByCode(token, targetSiteCode);

        logger.info(`Updating trackingScript for ${targetSiteCode}...`);
        await updateSiteTrackingScript(token, targetSite.id, trackingScript);

        updatedSites.push(targetSiteCode);
      } catch (error: any) {
        failures.push({
          siteCode: targetSiteCode,
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
