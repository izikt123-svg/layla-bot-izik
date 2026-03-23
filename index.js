const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// חיבור למפתח ה-API שהגדרנו ב-Render
const genAI = new GoogleGenerativeAI(process.env.API_KEY); 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// הצגת הברקוד ביומנים של Render
client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('✅ הברקוד מוכן לסריקה:');
});

client.on('ready', () => {
    console.log('🔥 לילה מחוברת ומוכנה לעזור לאיציק!');
});

// מענה להודעות בעזרת הבינה המלאכותית
client.on('message', async message => {
    if (message.fromMe) return; 
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `את לילה, שותפה אסטרטגית של איציק טהורי ב-GoTours. תעני בצורה מקצועית: ${message.body}`;
        const result = await model.generateContent(prompt);
        await message.reply(result.response.text());
    } catch (e) {
        console.error("Error:", e);
    }
});

client.initialize();
