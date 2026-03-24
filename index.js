const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Layla is online for GoTours!'));
app.listen(port, '0.0.0.0', () => console.log('Server is running on port ' + port));

const genAI = new GoogleGenerativeAI(process.env.API_KEY); 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // זה הנתיב המדויק שמופיע ביומנים שלך ב-Render
        executablePath: '/opt/render/.cache/puppeteer/chrome/linux-146.0.7680.153/chrome-linux64/chrome',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote'
        ]
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('✅ איציק, הברקוד מוכן! סרוק אותו עכשיו ב-Logs:');
});

client.on('ready', () => {
    console.log('🔥 לילה מחוברת ומוכנה לעבודה!');
});

client.on('message', async message => {
    if (message.fromMe) return; 
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`את לילה, שותפה אסטרטגית של איציק ב-GoTours. תעני בקצרה: ${message.body}`);
        await message.reply(result.response.text());
    } catch (e) { 
        console.error('Error:', e); 
    }
});

client.initialize();
