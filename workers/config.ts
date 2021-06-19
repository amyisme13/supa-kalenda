export default {
  supabaseUrl: process.env.VUE_APP_SUPABASE_URL || '',
  supabaseAnonKey: process.env.VUE_APP_SUPABASE_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',

  telegramBotName: process.env.TELEGRAM_BOT_NAME || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',

  registerKey: process.env.APP_REGISTER_KEY || 'supakalenda',
  url: process.env.APP_URL || 'http://localhost:8080',
  timezone: process.env.APP_TIMEZONE || 'Asia/Jakarta',
};
