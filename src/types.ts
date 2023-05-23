import { z } from 'zod';
import { config } from './config/types';

const deepPartialConfig = config.deepPartial();

/**
 * Melter configuration object.
 *
 * @see [Configuration documentation](https://github.com/unshopable/melter#configuration)
 */
export type MelterConfig = z.infer<typeof deepPartialConfig>;
