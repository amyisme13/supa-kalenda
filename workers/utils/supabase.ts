import { createClient } from '@supabase/supabase-js';
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
