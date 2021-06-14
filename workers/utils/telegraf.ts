import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

export default bot;

export type CommandFn = Parameters<typeof bot.command>[1];

export function sendMessage(chatId: string, message: string) {
  return bot.telegram.sendMessage(chatId, message);
}
