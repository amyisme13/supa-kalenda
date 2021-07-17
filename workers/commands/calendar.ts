import { chromium } from 'playwright-chromium';

import config from '../config';
import { CommandFn } from '../utils/telegraf';

const takeScreenshot = async (isViewWeek = false) => {
  const browser = await chromium.launch({
    chromiumSandbox: false,
    args: ['--disable-gpu'],
  });

  const page = await browser.newPage({ timezoneId: config.timezone });
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/users')),
    page.waitForResponse((res) => res.url().includes('/events')),
    page.goto(`${config.url}?noauth=1${isViewWeek ? '&view-week=1' : ''}`),
  ]);
  const screenshot = await page.screenshot({ type: 'png', fullPage: true });
  await browser.close();

  return screenshot;
};

const calendar: CommandFn = async (ctx) => {
  const message = await ctx.reply('Loading calendar...');

  const arg = ctx.message.text.split(' ');
  let isViewWeek = arg.length > 1 && arg[1] === 'week';
  if (ctx.message.text === 'calendar-week') {
    isViewWeek = true;
  }

  const screenshot = await takeScreenshot(isViewWeek);

  ctx.deleteMessage(message.message_id);
  await ctx.replyWithPhoto({ source: screenshot });
};

export default calendar;
