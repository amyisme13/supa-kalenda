import { Telegraf } from 'telegraf';

import config from '../config';

const bot = new Telegraf(config.telegramBotToken);

export default bot;

export type CommandFn = Parameters<typeof bot.command>[1];

export function sendMessage(chatId: string, message: string) {
  return bot.telegram.sendMessage(chatId, message);
}
