import * as _path from 'path';

export function getFilenameFromPath(path: string): string {
  return path.split(_path.sep).at(-1)!;
}

export function normalizePath(path: string): string {
	const isExtendedLengthPath = path.startsWith('\\\\?\\');

	if (isExtendedLengthPath) {
		return path;
	}

	return path.replace(/\\/g, '/');
}

/**
 * Parses provided value and returns data if succeeded. Otherwise the corresponding error
 * will be returned.
 */
export function parseJSON<T>(value: string): { data: T | null; error?: string } {
  try {
    return {
      data: JSON.parse(value),
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message,
    };
  }
}
