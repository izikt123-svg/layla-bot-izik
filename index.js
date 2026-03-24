const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

const app = express();
const port = process.env.PORT || 10000; // Render אוהב את פורט 10000
app.get('/', (req, res) => res.send('Layla is alive!'));
app.listen(port, () => console.log('Server is running on port ' + port));

const genAI = new GoogleGenerativeAI(process.env.API_KEY); 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // הסרנו את הנתיב הישן - המערכת תמצא אותו לבד בזכות ה-Build Command
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('✅ הברקוד מוכן! איציק, סרוק אותי עכשיו:');
});

client.on('ready', () => {
    console.log('🔥 לילה מחוברת ומוכנה לעזור ב-GoTours!');
});

client.on('message', async message => {
    if (message.fromMe) return; 
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`את לילה, שותפה של איציק ב-GoTours. תעני בקצרה: ${message.body}`);
        await message.reply(result.response.text());
    } catch (e) { console.error(e); }
});

client.initialize();
