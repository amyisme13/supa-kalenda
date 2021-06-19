import { addDays, parse, subDays } from 'date-fns';
import { format } from 'date-fns-tz';

import config from '../config';
import { fetchEvents } from '../utils/supabase';
import { CommandFn } from '../utils/telegraf';

const formatDate = (date: Date) =>
  format(date, 'dd MMM yyyy', { timeZone: config.timezone });

const formatTime = (date: Date) =>
  format(date, 'HH:mm', { timeZone: config.timezone });

const parseDateArg = (date: Date, arg: string) => {
  if (arg === 'today') {
    return date;
  }

  if (arg === 'tomorrow') {
    return addDays(date, 1);
  }

  if (arg === 'yesterday') {
    return subDays(date, 1);
  }

  const parsed = parse(arg, 'yyyy-MM-dd', new Date());
  if (isNaN(parsed.valueOf())) {
    return date;
  }

  return parsed;
};

const agenda: CommandFn = async (ctx) => {
  const loadingMsg = await ctx.reply('Loading agenda...');

  let date = new Date();
  const arg = ctx.message.text.split(' ');
  if (arg.length > 1) {
    date = parseDateArg(date, arg[1]);
  }

  const { data: events, error } = await fetchEvents(date);
  if (!events || error) {
    return;
  }

  if (events.length === 0) {
    await ctx.reply(`No agenda on ${formatDate(date)}`);
    return;
  }

  let message = `Agenda ${formatDate(date)}:`;
  let lastUserId: string;
  events.forEach((event) => {
    if (lastUserId !== event.user_id) {
      if (lastUserId !== undefined) {
        message += '\n';
      }

      lastUserId = event.user_id;
      message += `\n[${event.creator.name}]`;
    }

    let range = 'all day';
    if (!event.all_day) {
      const start = formatTime(new Date(event.start));
      const end = formatTime(new Date(event.end));
      range = `${start} - ${end}`;
    }

    message += `\n${range} | ${event.title}`;
  });

  ctx.deleteMessage(loadingMsg.message_id);
  await ctx.reply(message);
};

export default agenda;
