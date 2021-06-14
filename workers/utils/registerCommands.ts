import { Telegraf } from 'telegraf';

import calendar from '../commands/calendar';
import register from '../commands/register';
import unregister from '../commands/unregister';
import { CommandFn } from './telegraf';

interface Command {
  command: string;
  description: string;
  handler: CommandFn;
}

const commands: Command[] = [
  {
    command: 'register',
    description: 'Register the chat to start receiving message from the bot',
    handler: register,
  },
  {
    command: 'unregister',
    description: 'Unregister the chat to stop receiving message from the bot',
    handler: unregister,
  },
  {
    command: 'calendar',
    description: "Display picture of today's calendar",
    handler: calendar,
  },
  {
    command: 'ping',
    description: 'Check bot availability',
    handler(ctx) {
      ctx.reply('pong');
    },
  },
  {
    command: 'help',
    description: 'List available commands',
    async handler(ctx) {
      const commands = await ctx.telegram.getMyCommands();
      const message = commands.reduce((acc, command) => {
        return `${acc}\n*${command.command}* - ${command.description}`;
      }, '');

      ctx.replyWithMarkdown(message);
    },
  },
];

export default function registerCommands(bot: Telegraf) {
  bot.telegram.setMyCommands(commands);
  commands.forEach((command) => bot.command(command.command, command.handler));
}
