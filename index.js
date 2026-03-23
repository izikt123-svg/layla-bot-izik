const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// התחברות ל-AI עם המפתח שהגדרנו ב-Render
const genAI = new GoogleGenerativeAI(process.env.API_KEY); 

// הגדרת הזהות של לילה - השותפה של איציק
const laylaPersona = `את אישה ושמך לילה. את שותפה אסטרטגית של איציק טהורי ב-GoTours Group וב-KT נדלן. 
את "הפנים הדיגיטליות" באתר ובשירות הלקוחות. תפקידך להגן על איציק מכל טעות, לדבר בשפתו ולסגור מכירות.
דברי בשפה שיווקית, יוקרתית, ממוקדת ערך אישי ומבוססת עובדות בלבד. 
כשפונים לגבי טיולים, את מדברת על החוויות של GoTours. כשפונים לגבי נדל"ן, את מייצגת את המקצוענות של קטרין ב-KT נדלן.`;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// יצירת הברקוד לסריקה ביומן של Render
client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('✅ איציק, הברקוד מוכן לסריקה ביומן השרת (Logs)!');
});

client.on('ready', () => {
    console.log('🔥 לילה מחוברת ומתחילה לעבוד עבור GoTours ו-KT נדלן!');
});

// מענה חכם ללקוחות
client.on('message', async message => {
    if (message.fromMe) return; 

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${laylaPersona}\n\nהודעה מלקוח: "${message.body}"\nתשובה של לילה:`;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        await message.reply(responseText);
    } catch (error) {
        console.error('שגיאה בתגובה של לילה:', error);
    }
});

client.initialize();
