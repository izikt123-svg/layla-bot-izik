const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');

// שרת אינטרנט בסיסי למניעת קריסה
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Layla is alive and working for GoTours!'));
app.listen(port, () => console.log('Server is running on port ' + port));

// חיבור לבינה המלאכותית
const genAI = new GoogleGenerativeAI(process.env.API_KEY); 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        // בגרסה הזו אנחנו נותנים למערכת למצוא את הכרום אוטומטית
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote'
        ]
    }
});

// הצגת הברקוד
client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('✅ איציק, הברקוד מוכן! סרוק אותו עכשיו ב-Logs:');
});

client.on('ready', () => {
    console.log('🔥 לילה מחוברת בהצלחה ומוכנה לעזור לאיציק ב-GoTours!');
});

// מענה להודעות
client.on('message', async message => {
    if (message.fromMe) return; 
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`את לילה, שותפה אסטרטגית של איציק ב-GoTours. תעני בקצרה ובערך אישי: ${message.body}`);
        await message.reply(result.response.text());
    } catch (e) { 
        console.error('Error with Gemini:', e); 
    }
});

client.initialize();
