import { Telegraf } from 'telegraf';

import register from '../commands/register';
import unregister from '../commands/unregister';

export default function registerCommands(bot: Telegraf) {
  bot.command('register', register);
  bot.command('unregister', unregister);

  bot.command('ping', (ctx) => ctx.reply('pong'));
}
