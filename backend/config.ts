import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DEFAULT_MODEL: 'gemini-3.8-flash',
  TTS_MODEL: 'gemini-3.8-flash-lite-tts',
  TRANSCRIBE_MODEL: 'gemini-3.5-transcribe',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  IS_DEMO: !process.env.GEMINI_API_KEY,
};
