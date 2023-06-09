export function getFilenameFromPath(path: string): string {
  return path.split('/').at(-1)!;
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
