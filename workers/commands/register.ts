import config from '../config';
import { fetchChat, insertChat } from '../utils/supabase';
import { sendMessage, CommandFn } from '../utils/telegraf';

const register: CommandFn = async (ctx) => {
  const chatId = `${ctx.chat.id}`;

  const { data: chat } = await fetchChat(chatId);
  if (chat) {
    await sendMessage(chatId, 'Bot has already been registered for this chat.');
    return;
  }

  const params = ctx.message.text.split(' ');
  const paramKey = params.length >= 2 ? params[1] : null;

  const key = config.registerKey;
  if (paramKey !== key) {
    await sendMessage(chatId, 'Invalid register key');
    return;
  }

  const { error } = await insertChat(chatId, ctx.message.from);
  if (error) {
    console.error(error.message);
    await sendMessage(chatId, 'Internal error. Something went wrong.');
    return;
  }

  await sendMessage(chatId, 'Bot successfully registered for this chat.');
};

export default register;
