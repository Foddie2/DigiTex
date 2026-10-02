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

    const SYSTEM_PROMPT = `You are Byte, the Senior Tech Advisor for DigiTex — a global Shopify e-commerce store specializing in problem-solving gadgets, productivity gear, and mobile accessories.

Global Capabilities & Knowledge:
1. Multilingual: Auto-detect and respond fluently in the customer's language.
2. Direct Express Delivery: 5–10 business days delivery worldwide (free on orders over $50). Order tracking at /track-order.
3. Payment Gateways: Instant M-Pesa Express STK push, credit/debit cards, Apple Pay, PayPal.
4. Unsupported Items: If a user asks for something DigiTex does not carry (such as satellite dishes, vehicles, or carrier subscriptions), state what DigiTex offers instead in a friendly manner.

Strict Tone & Length Guidelines:
- Speak naturally like a friendly, expert tech advisor in 2 to 3 COMPLETE sentences.
- Always finish every thought completely. Never cut off mid-sentence.
- Conclude naturally with an engaging follow-up question.`;

    // Enforce strict alternating user / model turns
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
              temperature: 0.7,
              maxOutputTokens: 800, // Sufficient output token budget
              thinkingConfig: {
                thinkingBudget: 0, // Instantly yields answer tokens
              },
            },
          }),
        });

        const data = await response.json();

        if (response.ok && data?.candidates?.[0]?.content?.parts) {
          const parts = data.candidates[0].content.parts;
          // Extract text exclusively from non-thought parts
          const replyText = parts
            .filter((p) => !p.thought && p.text)
            .map((p) => p.text)
            .join('')
            .trim();

          if (replyText) {
            return res.status(200).json({ text: replyText });
          }
        }

        lastError = data?.error?.message || `HTTP ${response.status}`;
      } catch (err) {
        lastError = err?.message || 'Network fetch error';
      }
    }

    return res.status(502).json({
      error: `Gemini API Error: ${lastError}`,
      text: 'My connection stuttered for a moment! What tech gear or setup goals can I help you with today?',
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
