import { createClient } from '@supabase/supabase-js';
import { endOfDay, startOfDay } from 'date-fns';
import config from '../config';

const client = createClient(config.supabaseUrl, config.supabaseServiceKey);

export default client;

export interface Profile {
  id: string;
  name: string;
  color: string;
  text_color: string;
  created_at: string;
  updated_at: string;
}

export function fetchProfile(id: string) {
  return client.from<Profile>('users').select('*').eq('id', id).single();
}

export interface Event {
  id: number;
  user_id: string;
  deleted: boolean;
  title: string;
  all_day: boolean;
  start: string;
  end: string;
  creator: Profile;
}

export function fetchEvents(date: Date) {
  return client
    .from<Event>('events')
    .select('*, creator:user_id(*)')
    .lte('start', endOfDay(date).toISOString())
    .gte('end', startOfDay(date).toISOString())
    .order('user_id')
    .order('all_day', { ascending: false })
    .order('start')
    .eq('deleted', false);
}

export interface Chat {
  id: number;
  active: boolean;
  chat_id: string;
  registered_by: string;
  registered_by_name: string;
}

export function fetchChats() {
  return client.from<Chat>('chats').select('*').eq('active', true);
}

export function fetchChat(chatId: string) {
  return client
    .from<Chat>('chats')
    .select('*')
    .eq('active', true)
    .eq('chat_id', chatId)
    .single();
}

export function insertChat(
  chatId: string,
  sender: { id: number; first_name: string }
) {
  return client.from<Chat>('chats').insert({
    chat_id: chatId,
    registered_by: sender.id.toString(),
    registered_by_name: sender.first_name,
  });
}

export function updateChat(chatId: string, chat: Partial<Chat>) {
  return client.from<Chat>('chats').update(chat).eq('chat_id', chatId);
}
