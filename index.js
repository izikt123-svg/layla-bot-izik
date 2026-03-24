const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Layla is online!'));
app.listen(port, '0.0.0.0', () => console.log('Server is running on port ' + port));

const genAI = new GoogleGenerativeAI(process.env.API_KEY); 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // זה הנתיב המדויק שראינו ב-Logs שלך!
        executablePath: '/opt/render/.cache/puppeteer/chrome/linux-146.0.7680.153/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('✅ QR Code is ready! Scan it now:');
});

client.on('ready', () => {
    console.log('🔥 Layla is connected!');
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
