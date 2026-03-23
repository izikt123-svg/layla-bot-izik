const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY); 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('✅ הברקוד מוכן! סרוק אותו עכשיו:');
});

client.on('ready', () => {
    console.log('🔥 לילה מחוברת ומוכנה לעבודה!');
});

client.on('message', async message => {
    if (message.fromMe) return; 
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`את לילה, שותפה של איציק. תעני בקצרה להודעה: ${message.body}`);
        await message.reply(result.response.text());
    } catch (e) { console.error(e); }
});

client.initialize();
