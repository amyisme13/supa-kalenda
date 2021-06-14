import './utils/parseEnv';
import onEventsChanged from './handlers/eventsChanged';
import registerCommands from './utils/registerCommands';
import client, { Event } from './utils/supabase';
import bot from './utils/telegraf';

bot.start((ctx) =>
  ctx.reply(
    'Hello from SupaKalenda!\nDont forget to register to start receiving message from the bot :D'
  )
);

registerCommands(bot);
bot.launch().then(() => console.log('Listening to telegram chats...'));

const listener = client
  .from<Event>('events')
  .on('*', onEventsChanged)
  .subscribe(() => console.log('Listening to events changes...'));

process.once('SIGINT', () => {
  listener.unsubscribe();
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  listener.unsubscribe();
  bot.stop('SIGTERM');
});
