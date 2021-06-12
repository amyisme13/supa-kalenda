import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env.local') });

const client = createClient(
  process.env.VUE_APP_SUPABASE_URL as string,
  process.env.VUE_APP_SUPABASE_KEY as string
);

client
  .from('events')
  .on('*', (e) => {
    if (e.eventType === 'INSERT') {
      console.log('Inserted:', e.new.id);
    } else if (e.eventType === 'UPDATE') {
      console.log('Updated:', e.new.id);
    } else {
      console.log('Deleted:', e.old.id);
    }
  })
  .subscribe(() => {
    console.log('Listening to changes...');
  });
