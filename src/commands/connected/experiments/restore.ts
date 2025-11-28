import { restartExperiment, getExperiment } from '../../../api/experiment';
import { logger } from '../../../utils/logger';

export const restoreExperimentCommand = async (token: string, args: string[]) => {
  const xpId = args[0];
  const idRegex = /^\d+$/;

  if (!xpId || !idRegex.test(xpId)) {
      logger.error('Invalid Experiment ID. Must be a number.');
      return;
  }

  try {
      const current = await getExperiment(token, parseInt(xpId, 10));
      
      // Usually restore is for STOPPED or DEACTIVATED, but restart might work for others too.
      // Keeping check for safety unless restart allows force.
      if (current.status !== 'STOPPED' && current.status !== 'DEACTIVATED') {
          logger.warning(`Experiment ${xpId} is currently ${current.status}. Restart action is typically for stopped experiments.`);
      }

      await restartExperiment(token, parseInt(xpId, 10));
      logger.success(`\n✅ Experiment ${xpId} restarted successfully.`);

  } catch (error: any) {
      logger.error(`Failed to restart experiment: ${error.message}`);
      if (error.response?.data) {
          // Log detailed error from API if available
          console.log(JSON.stringify(error.response.data, null, 2));
      }
  }
};
