const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 👇 ADD THIS DEBUG LINE
console.log('🔑 API_KEY:', API_KEY ? 'SET ✅' : 'NOT SET ❌');
console.log('🔑 Full key:', API_KEY);

export async function generateTopicalMap(keyword: string) {
  if (!API_KEY) {
    console.error('❌ ERROR: VITE_GEMINI_API_KEY is', API_KEY);
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a topical authority map for: ${keyword}`
          }]
        }]
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to generate topical map');
  }

  return await response.json();
}