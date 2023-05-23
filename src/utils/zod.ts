import { ZodInvalidTypeIssue, ZodIssue, ZodIssueCode, ZodTooSmallIssue } from 'zod';

export function formatZodIssue(issue: ZodIssue): string {
  switch (issue.code) {
    case ZodIssueCode.invalid_type: {
      const { path, message, expected, received } = issue as ZodInvalidTypeIssue;
      const pathString = path.join('.');

      return message!
        .replace('%path', pathString)
        .replace('%expected', expected)
        .replace('%received', received);
    }

    case ZodIssueCode.too_small: {
      const { path, message, minimum } = issue as ZodTooSmallIssue;
      const pathString = path.join('.');

      return message!.replace('%path', pathString).replace('%minimum', minimum.toString());
    }

    default: {
      return issue.message;
    }
  }
}

export function formatZodIssues(errors: ZodIssue[]): string[] {
  return errors.map(formatZodIssue);
}
