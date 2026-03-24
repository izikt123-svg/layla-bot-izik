const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Layla is online!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

if (!process.env.API_KEY) {
  throw new Error('Missing API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'layla-bot',
    dataPath: process.env.WWEBJS_AUTH_PATH || '/opt/render/project/src/.wwebjs_auth'
  }),
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  },
  qrMaxRetries: 5
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('QR Code is ready! Scan it now.');
});

client.on('ready', () => {
  console.log('Layla is connected!');
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
});

client.on('disconnected', (reason) => {
  console.warn('Client disconnected:', reason);
});

client.on('message', async (message) => {
  try {
    if (message.fromMe) return;
    if (!message.body || !message.body.trim()) return;
    if (message.from.endsWith('@g.us')) return; // מתעלם מקבוצות, אפשר לשנות

    const prompt = `את לילה, שותפה של איציק ב-GoTours.
עני בקצרה, בנימוס, בעברית ברורה.
הודעת הלקוח: ${message.body}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim();

    if (text) {
      await message.reply(text);
    }
  } catch (e) {
    console.error('Message handler error:', e);
  }
});

client.initialize().catch((err) => {
  console.error('Client initialize failed:', err);
});
