import { chromium } from 'playwright-chromium';

import config from '../config';
import { CommandFn } from '../utils/telegraf';

const takeScreenshot = async () => {
  const browser = await chromium.launch({ chromiumSandbox: false });
  const page = await browser.newPage();
  await page.goto(`${config.url}?noauth=1`);
  const screenshot = await page.screenshot({ fullPage: true });
  await browser.close();

  return screenshot;
};

const calendar: CommandFn = async (ctx) => {
  const message = await ctx.reply('Loading calendar...');

  const screenshot = await takeScreenshot();

  await ctx.replyWithPhoto({ source: screenshot });
  await ctx.deleteMessage(message.message_id);
};

export default calendar;
