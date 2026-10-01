export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const { prompt, history = [], userContext = {} } = body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 🌍 Global Dropshipping System Prompt
    const SYSTEM_PROMPT = `You are Byte, the Senior Tech Advisor for DigiTex — a global Shopify e-commerce store specializing in problem-solving gadgets and productivity gear.

Global Sales & Support Capabilities:
1. Multilingual Support: ALWAYS detect and respond in the exact language used by the customer (e.g., English, Spanish, French, Swahili, German, Arabic).
2. Worldwide Shipping: Express international delivery (7–12 business days average globally). Free shipping on orders over $50 USD (or equivalent). Live tracking available at /track-order.
3. Payment Flexibility:
   - Global: Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay.
   - Buy Now Pay Later (where available): Klarna, Afterpay.
   - East Africa: Instant M-Pesa Express STK Push.
4. Customs & Taxes: Inform international buyers that standard duties/VAT may apply depending on their local import regulations.

Conversational Guidelines:
- Speak like an expert, friendly tech advisor.
- Keep replies concise (2 to 3 natural sentences).
- Help customers match problem-solving gadgets to their daily setup needs.
- Conclude with a helpful follow-up question.`;

    const turns = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (!msg.text || !msg.text.trim()) continue;
        const role = msg.sender === 'user' ? 'user' : 'model';

        if (turns.length > 0 && turns[turns.length - 1].role === role) {
          turns[turns.length - 1].parts[0].text += `\n${msg.text}`;
        } else {
          turns.push({ role, parts: [{ text: msg.text }] });
        }
      }
    }

    // Inject location, currency, and cart info into context if available
    const locationInfo = [
      userContext.country ? `Country: ${userContext.country}` : null,
      userContext.currency ? `Currency: ${userContext.currency}` : null,
      userContext.userName && userContext.userName !== 'Customer'
        ? `Customer: ${userContext.userName}`
        : null,
      userContext.cartCount ? `Cart Items: ${userContext.cartCount}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    const contextualPrompt = locationInfo ? `[User Context: ${locationInfo}]\n${prompt}` : prompt;

    if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
      turns[turns.length - 1].parts[0].text = contextualPrompt;
    } else {
      turns.push({ role: 'user', parts: [{ text: contextualPrompt }] });
    }

    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
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
              maxOutputTokens: 350,
            },
          }),
        });

        const data = await response.json();

        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
        } else {
          lastError = data?.error?.message || `HTTP ${response.status}`;
        }
      } catch (err) {
        lastError = err?.message || 'Fetch error';
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
