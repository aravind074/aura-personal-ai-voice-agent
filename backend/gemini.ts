import { GoogleGenAI } from '@google/genai';
import { CONFIG } from './config.js';

let geminiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!CONFIG.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiInstance) {
    geminiInstance = new GoogleGenAI({
      apiKey: CONFIG.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiInstance;
}
