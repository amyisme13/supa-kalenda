import { SupabaseRealtimePayload } from '@supabase/supabase-js';
import { format } from 'date-fns';

import { Event, fetchChats, fetchProfile } from '../utils/supabase';
import { sendMessage } from '../utils/telegraf';

// TODO: Fix allDay range
function formatDateRange({
  start: startStr,
  end: endStr,
  all_day: allDay,
}: Event) {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const startDate = format(start, 'd MMM yyyy');
  const startTime = format(start, 'HH:mm');
  const endDate = format(end, 'd MMM yyyy');
  const endTime = format(end, 'HH:mm');

  if (allDay && startDate === endDate) {
    return `on ${startDate}`;
  }

  if (allDay) {
    return `on ${startDate} - ${endDate}`;
  }

  if (startDate === endDate) {
    return `at ${startDate} ${startTime} - ${endTime}`;
  }

  return `at ${startDate} ${startTime} - ${endDate} ${endTime}`;
}

export default async function (event: SupabaseRealtimePayload<Event>) {
  if (event.eventType === 'DELETE') {
    return;
  }

  const { data: user, error: err } = await fetchProfile(event.new.user_id);
  if (err || !user) {
    console.error(err ? err.message : 'No data');
    return;
  }

  const { data: chats, error } = await fetchChats();
  if (error || !chats) {
    console.error(error ? error.message : 'No data');
    return;
  }

  const dateRange = formatDateRange(event.new);
  let message = `'${event.new.title}' ${dateRange} created by ${user.name}`;
  if (event.eventType === 'UPDATE' && event.new.deleted) {
    message = `'${event.new.title}' ${dateRange} deleted`;
  } else if (event.eventType === 'UPDATE') {
    message = `'${event.new.title}' ${dateRange} updated`;
  }

  chats.forEach((chat) => sendMessage(chat.chat_id, message));
}
