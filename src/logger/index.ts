import chalk from 'chalk';

const colors = {
  warning: '#FFA500',
};

/* prettier-ignore */
const prefixes = {
  success: 'success',
  ready:   'ready  ',
  warning: 'warning',
  error:   'error  ',
  event:   'event  ',
  wait:    'wait   ',
};

function stringifyMessage(message: string | string[]) {
  if (typeof message === 'string') return message;

  if (Array.isArray(message) && message.length === 1) return message[0];

  return message.map((message) => `\n  ${message}`).join('');
}

class Logger {
  get build() {
    return {
      success: (message: string) => {
        const prefix = chalk.green(message);

        this.log(prefix);
      },

      warning: (message: string) => {
        const prefix = chalk.hex(colors.warning)(message);

        this.log(prefix);
      },
    };
  }

  success(message: string | string[]) {
    const prefix = chalk.green(prefixes.success);

    this.log(prefix, stringifyMessage(message));
  }

  ready(message: string | string[]) {
    const prefix = chalk.green(prefixes.ready);

    this.log(prefix, stringifyMessage(message));
  }

  warning(message: string | string[]) {
    const prefix = chalk.hex(colors.warning)(prefixes.warning);

    this.log(prefix, stringifyMessage(message));
  }

  error(message: string | string[]) {
    const prefix = chalk.red(prefixes.error);

    this.log(prefix, stringifyMessage(message));
  }

  event(message: string | string[]) {
    const prefix = chalk.magenta(prefixes.event);

    this.log(prefix, stringifyMessage(message));
  }

  wait(message: string | string[]) {
    const prefix = chalk.cyan(prefixes.wait);

    this.log(prefix, stringifyMessage(message));
  }

  private log(prefix: string, ...messages: string[]) {
    if (messages.length === 0) {
      console.log(prefix);
    } else {
      console.log(prefix, '-', ...messages);
    }
  }
}

export default new Logger();
