import chalk from 'chalk';
import { getSite } from '../../../api/site';
import { logger } from '../../../utils/logger';

export const getSiteCommand = async (token: string, args: string[]) => {
  const siteId = args[0];

  // Validation: digit only, 4 to 10 digits (Kameleoon IDs can be larger than 5 digits over time, but user asked for 4-5 specifically? 
  // User said: "uniquement digit entre 4 et 5 chiffres". I will strictly follow that rule.)
  const idRegex = /^\d{4,5}$/;

  if (!siteId || !idRegex.test(siteId)) {
      logger.error('Invalid Site ID. Must be a number between 4 and 5 digits.');
      return;
  }

  try {
    const site = await getSite(token, parseInt(siteId, 10));
    
    logger.title(`\n🔎 Site Details: ${site.name}`);
    console.log(`  ID: ${chalk.bold(site.id)}`);
    console.log(`  Code: ${chalk.cyan(site.code)}`);
    console.log(`  URL: ${chalk.blue(site.url)}`);
    console.log(`  Type: ${site.type}`);
    console.log(`  Created: ${site.dateCreated}`);
    if (site.domainNames && site.domainNames.length > 0) {
        console.log(`  Domains: ${site.domainNames.join(', ')}`);
    }
    console.log('');

  } catch (error: any) {
    if (error.response?.status === 404) {
        logger.error(`Site with ID ${siteId} not found.`);
    } else {
        logger.error(`Failed to fetch site: ${error.message}`);
    }
  }
};

