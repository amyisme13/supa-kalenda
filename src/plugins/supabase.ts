import { createClient } from '@supabase/supabase-js';

const client = createClient(
  process.env.VUE_APP_SUPABASE_URL as string,
  process.env.VUE_APP_SUPABASE_KEY as string
);

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

export function updateProfile(profile: Partial<Profile>) {
  return client
    .from<Profile>('users')
    .update({
      ...profile,
      updated_at: new Date().toJSON(),
    })
    .single();
}

export function fetchUsers() {
  return client
    .from<Profile>('users')
    .select('*')
    .neq('name', '')
    .order('name');
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

export function fetchEvents(start: string, end: string) {
  return client
    .from<Event>('events')
    .select('*, creator:user_id(*)')
    .gte('start', start)
    .lte('end', end)
    .eq('deleted', false);
}

export function upsertEvent(event: Partial<Event>) {
  return client.from<Event>('events').upsert(event);
}

export function deleteEvent(id: number) {
  return client.from<Event>('events').update({ deleted: true }).eq('id', id);
}
