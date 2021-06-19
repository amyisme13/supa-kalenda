import { addDays, parse, subDays } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';

import config from '../config';
import { Event, fetchEvents } from '../utils/supabase';
import { CommandFn } from '../utils/telegraf';

const formatDate = (date: Date) =>
  format(utcToZonedTime(date, config.timezone), 'd MMM yyyy');

const formatTime = (date: Date) =>
  format(utcToZonedTime(date, config.timezone), 'HH:mm');

const formatTimeRange = (dateArg: string, event: Event) => {
  if (event.all_day) {
    return 'all day';
  }

  const start = new Date(event.start);
  const end = new Date(event.end);
  let startStr = '00:00';
  let endStr = '24:00';
  if (formatDate(start) === dateArg) {
    startStr = formatTime(start);
  }

  if (formatDate(end) === dateArg) {
    endStr = formatTime(end);
  }

  return `${startStr} - ${endStr}`;
};

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

  const dateArg = formatDate(date);
  if (events.length === 0) {
    await ctx.reply(`No agenda on ${dateArg}`);
    return;
  }

  let message = `Agenda ${dateArg}:`;
  let lastUserId: string;
  events.forEach((event) => {
    if (lastUserId !== event.user_id) {
      if (lastUserId !== undefined) {
        message += '\n';
      }

      lastUserId = event.user_id;
      message += `\n[${event.creator.name}]`;
    }

    const range = formatTimeRange(dateArg, event);
    message += `\n${range} | ${event.title}`;
  });

  ctx.deleteMessage(loadingMsg.message_id);
  await ctx.reply(message);
};

export default agenda;
