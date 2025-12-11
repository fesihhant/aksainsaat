const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const {MailTransporter, MailOptions} = require('../utils/mailUtils');

router.post('/send', async (req, res) => {
    const { name, email, message } = req.body;

    let transporter = nodemailer.createTransport(MailTransporter());
    
    let toMail = email;
    let subjectMessage = `İletişim Formu ${email}`;
    let htmlBody = `Merhaba ${name},<br><br>Mesajınız alındı <br>${message}<br><br>Teşekkürler.`;
    let mailOptions = MailOptions(toMail,subjectMessage, htmlBody);

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Mail gönderildi!' });
    } catch (error) {
        console.error('Mail gönderme hatası:', error);
        res.status(500).json({ success: false, message: 'Mail gönderilemedi', error: error.message });
    }
});

module.exports = router;