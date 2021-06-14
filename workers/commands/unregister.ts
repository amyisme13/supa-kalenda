import { fetchChat, updateChat } from '../utils/supabase';
import { CommandFn, sendMessage } from '../utils/telegraf';

const unregisterChat: CommandFn = async (ctx) => {
  const chatId = `${ctx.chat.id}`;

  const { data: chat } = await fetchChat(chatId);
  if (!chat) {
    await sendMessage(chatId, 'Bot is not registered for this chat.');
    return;
  }

  const { error } = await updateChat(chatId, { active: false });
  if (error) {
    console.error(error.message);
    await sendMessage(chatId, 'Internal error. Something went wrong.');
    return;
  }

  await sendMessage(chatId, 'Bot successfully unregistered for this chat.');
};

export default unregisterChat;
