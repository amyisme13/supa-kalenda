import { chromium } from 'playwright-chromium';

import config from '../config';
import { CommandFn } from '../utils/telegraf';

const takeScreenshot = async () => {
  console.log('start screenshot');
  const browser = await chromium.launch({
    chromiumSandbox: false,
    args: ['--disable-gpu'],
  });
  console.log('chrome launched');
  const page = await browser.newPage();
  console.log('new page opened');
  await page.goto(`${config.url}?noauth=1`);
  console.log('page navigated');
  const screenshot = await page.screenshot({ type: 'png' });
  console.log('screenshot created');
  await browser.close();
  console.log('browser closed');

  return screenshot;
};

const calendar: CommandFn = async (ctx) => {
  const message = await ctx.reply('Loading calendar...');

  const screenshot = await takeScreenshot();

  await ctx.replyWithPhoto({ source: screenshot });
  console.log('photo replied');
  await ctx.deleteMessage(message.message_id);
  console.log('message deleted');
};

export default calendar;
