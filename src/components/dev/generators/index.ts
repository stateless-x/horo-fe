import type { DevGeneratorConfig } from '../types';
import { compatibilityGenerator } from './compatibility';
import { teaserGenerator } from './teaser';

/**
 * Every dev generator, in hub order. Adding one = a config file here plus its
 * /api/dev/generate/<id> endpoint in horo-be. /dev and /dev/[tool] read this.
 */
export const DEV_GENERATORS: ReadonlyArray<DevGeneratorConfig> = [compatibilityGenerator, teaserGenerator];

export function findDevGenerator(id: string): DevGeneratorConfig | undefined {
  return DEV_GENERATORS.find((generator) => generator.id === id);
}
