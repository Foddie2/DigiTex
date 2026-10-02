export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = (process.env['GEMINI_API_KEY'] || '').trim();
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is missing on Vercel environment variables.');
      return res.status(500).json({
        error: 'GEMINI_API_KEY is missing from Vercel environment variables.',
        text: 'System setup notice: GEMINI_API_KEY is missing in Vercel settings.',
      });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const { prompt, history = [], userContext = {} } = body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const SYSTEM_PROMPT = `You are Byte, the Senior Tech Advisor for DigiTex — a Shopify tech dropshipping store specializing in problem-solving gadgets, productivity gear, and mobile accessories.

Global Capabilities:
1. Multilingual Support: Auto-detect and respond fluently in the customer's language.
2. Worldwide Express Delivery: 5–10 business days delivery (free on orders over $50). Order tracking available at /track-order.
3. Payment Options: Instant M-Pesa Express STK push, credit/debit cards, Apple Pay, PayPal.

Tone Guidelines:
- Speak naturally like a friendly, expert tech peer (2 to 3 conversational sentences).
- Explain how our gadgets solve the customer's specific problem clearly.
- End naturally with an engaging follow-up question.`;

    // Enforce strict user / model turn alternation
    const turns = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (!msg.text || !msg.text.trim()) continue;
        const role = msg.sender === 'user' ? 'user' : 'model';

        if (turns.length > 0 && turns[turns.length - 1].role === role) {
          turns[turns.length - 1].parts[0].text += `\n${msg.text}`;
        } else {
          turns.push({
            role,
            parts: [{ text: msg.text }],
          });
        }
      }
    }

    const contextualPrompt =
      userContext.userName && userContext.userName !== 'Customer'
        ? `[Customer: ${userContext.userName}, Cart Items: ${userContext.cartCount || 0}]\n${prompt}`
        : prompt;

    if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
      turns[turns.length - 1].parts[0].text = contextualPrompt;
    } else {
      turns.push({
        role: 'user',
        parts: [{ text: contextualPrompt }],
      });
    }

    // Active endpoints matching your original working setup
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

    let lastError = '';

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: turns,
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 300,
            },
          }),
        });

        const data = await response.json();

        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.status(200).json({
            text: data.candidates[0].content.parts[0].text,
          });
        } else {
          lastError = data?.error?.message || `HTTP ${response.status}`;
        }
      } catch (err) {
        lastError = err?.message || 'Network fetch error';
      }
    }

    return res.status(502).json({
      error: `Gemini API Error: ${lastError}`,
      text: 'My connection stuttered for a moment! What gear or questions were you looking into?',
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
