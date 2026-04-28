// src/services/geminiService.ts - MINIMAL VERSION
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('🔑 API Key loaded:', !!API_KEY);

export async function generateTopicalMap(keyword: string) {
  if (!API_KEY) {
    throw new Error('API key missing - check GitHub Secrets');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate topical map for: ${keyword}` }] }]
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API Error ${response.status}: ${err}`);
  }

  return await response.json();
}