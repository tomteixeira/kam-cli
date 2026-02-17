import inquirer from 'inquirer';
import chalk from 'chalk';
import { createSegment, CreateSegmentDto, getSegment } from '../../../api/segment';
import { getSiteByCode } from '../../../api/site';
import { logger } from '../../../utils/logger';

const DEFAULT_SEGMENT_TYPE: CreateSegmentDto['segmentType'] = 'STANDARD';

const parseSegmentId = (value?: string): number | null => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseTargetSiteCodes = (value: string): string[] => {
  return value
    .split(/[, ]+/)
    .map(code => code.trim())
    .filter(Boolean);
};

const buildDuplicatePayload = (segment: CreateSegmentDto, siteId: number): CreateSegmentDto => {
  const payload: CreateSegmentDto = {
    name: segment.name,
    siteId,
    segmentType: segment.segmentType,
    conditionsData: segment.conditionsData,
  };

  if (segment.description) {
    payload.description = segment.description;
  }

  if (typeof segment.audienceTracking === 'boolean') {
    payload.audienceTracking = segment.audienceTracking;
  }

  if (segment.tags?.length) {
    payload.tags = segment.tags;
  }

  if (typeof segment.userVisible === 'boolean') {
    payload.userVisible = segment.userVisible;
  }

  if (typeof segment.isFavorite === 'boolean') {
    payload.isFavorite = segment.isFavorite;
  }

  return payload;
};

export const duplicateSegmentCommand = async (token: string, args: string[]) => {
  logger.title('\n📌 Duplicate Segment');

  try {
    const segmentIdFromArgs = parseSegmentId(args[0]);
    const siteCodesFromArgs = args.slice(1).join(' ').trim();

    const answers = await inquirer.prompt([
      {
        type: 'number',
        name: 'segmentId',
        message: 'Segment ID:',
        default: segmentIdFromArgs ?? undefined,
        validate: input => Number.isFinite(input) ? true : 'Must be a number',
      },
      {
        type: 'input',
        name: 'targetSiteCodes',
        message: 'Target site codes (comma or space separated):',
        default: siteCodesFromArgs || undefined,
        validate: input => parseTargetSiteCodes(input).length > 0 ? true : 'Provide at least one site code',
      },
    ]);

    const segmentId = Number(answers.segmentId);
    const targetSiteCodes = parseTargetSiteCodes(answers.targetSiteCodes);

    logger.info('Fetching source segment...');
    const sourceSegment = await getSegment(token, segmentId);

    if (!sourceSegment.conditionsData) {
      throw new Error('Segment conditions are missing. Duplication cannot proceed.');
    }

    const segmentTemplate: CreateSegmentDto = {
      name: sourceSegment.name,
      siteId: sourceSegment.siteId,
      segmentType: sourceSegment.segmentType || DEFAULT_SEGMENT_TYPE,
      conditionsData: sourceSegment.conditionsData,
      description: sourceSegment.description,
      audienceTracking: sourceSegment.audienceTracking,
      tags: sourceSegment.tags,
      userVisible: sourceSegment.userVisible,
      isFavorite: sourceSegment.isFavorite,
    };

    const createdSegments: Array<{ siteCode: string; segmentId: number }> = [];
    const failures: Array<{ siteCode: string; error: string }> = [];

    for (const siteCode of targetSiteCodes) {
      try {
        logger.info(`Resolving site code ${siteCode}...`);
        const site = await getSiteByCode(token, siteCode);

        if (!site?.id) {
          throw new Error(`Site not found for code "${siteCode}"`);
        }

        logger.info(`Duplicating segment to site ${siteCode}...`);
        const payload = buildDuplicatePayload(segmentTemplate, site.id);
        const created = await createSegment(token, payload);

        createdSegments.push({ siteCode, segmentId: created.id });
      } catch (error: any) {
        failures.push({
          siteCode,
          error: error.response?.data ? JSON.stringify(error.response.data) : error.message,
        });
      }
    }

    if (createdSegments.length) {
      logger.success('\n✅ Segment duplicated successfully:');
      createdSegments.forEach(result => {
        console.log(chalk.green(`- ${result.siteCode}: ${result.segmentId}`));
      });
    }

    if (failures.length) {
      logger.warning('\n⚠️ Some duplications failed:');
      failures.forEach(failure => {
        console.log(chalk.yellow(`- ${failure.siteCode}: ${failure.error}`));
      });
    }
  } catch (error: any) {
    logger.error(`Failed to duplicate segment: ${error.message}`);
    if (error.response?.data) {
      console.log(chalk.red(JSON.stringify(error.response.data, null, 2)));
    }
  }
};
