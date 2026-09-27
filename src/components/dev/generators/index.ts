import type { DevGeneratorConfig } from '../types';
import { compatibilityGenerator } from './compatibility';
import { teaserGenerator } from './teaser';

/**
 * Every dev generator, in tab order. Adding one = a config file here plus its
 * /api/dev/generate/<id> endpoint in horo-be; the devtools panel gets a tab.
 */
export const DEV_GENERATORS: ReadonlyArray<DevGeneratorConfig> = [compatibilityGenerator, teaserGenerator];

export function findDevGenerator(id: string): DevGeneratorConfig | undefined {
  return DEV_GENERATORS.find((generator) => generator.id === id);
}
