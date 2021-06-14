import path from 'path';
import { chromium } from 'playwright';

import config from '../config';
import { CommandFn } from '../utils/telegraf';

const screenshotPath = path.join(__dirname, '../screenshots/image.png');
let lastScreenshot: number;

const takeScreenshot = async () => {
  // simple cache
  if (lastScreenshot && Date.now() - lastScreenshot < 60000) {
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${config.url}?noauth=1`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();

  lastScreenshot = Date.now();
};

const calendar: CommandFn = async (ctx) => {
  const message = await ctx.reply('Loading calendar...');

  await takeScreenshot();

  await ctx.replyWithPhoto({ source: screenshotPath });
  await ctx.deleteMessage(message.message_id);
};

export default calendar;
