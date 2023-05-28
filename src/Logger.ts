export type LoggerDataType = 'warning' | 'error';

export class Logger {
  success(message: string) {
    console.log(this.formatSuccess(message));
    console.log('');
  }

  warning(message: string, data: string[]) {
    console.log(this.formatWarning(message));

    if (data.length > 0) {
      console.log('');
      console.log(this.formatLogData('warning', data));
      console.log('');
    }
  }

  error(message: string, data: string[]) {
    console.log(this.formatError(message));

    if (data.length > 0) {
      console.log('');
      console.log(this.formatLogData('error', data));
      console.log('');
    }
  }

  private formatSuccess(message: string): string {
    return `\x1b[32m${message}\x1b[0m`;
  }

  private formatWarning(message: string): string {
    return `\x1b[33m${message}\x1b[0m`;
  }

  private formatError(message: string): string {
    return `\x1b[31m${message}\x1b[0m`;
  }

  private formatLogData(type: LoggerDataType, data: string[]) {
    const prefix = this.getPrefix(type);

    return data.map((item) => `  ${prefix} ${item}`).join('\n');
  }

  private getPrefix(type: LoggerDataType) {
    const prefix = {
      warning: this.formatWarning('⚠'),
      error: this.formatError('✖'),
    };

    return prefix[type];
  }
}
