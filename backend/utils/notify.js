const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.WEB_MAIL_HOST,
  port: parseInt(process.env.WEB_MAIL_PORT),
  secure: true,
  auth: {
    user: process.env.WEB_MAIL_ADDRESS,
    pass: process.env.WEB_MAIL_PASS
  }
});

exports.sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.WEB_MAIL_ADDRESS,
      to,
      subject,
      text
    });
  } catch (err) {
    console.error('Mail gönderilemedi:', err.message);
  }
};

const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

exports.sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: twilioNumber,
      to
    });
  } catch (err) {
    console.error('SMS gönderilemedi:', err.message);
  }
};

const Notification = require('../models/Notification');

exports.addNotification = async (userId, message) => {
  try {
    await Notification.create({ userId, message });
  } catch (err) {
    console.error('Bildirim eklenemedi:', err.message);
  }
};

const User = require('../models/User');
const { sendSMS, sendMail, addNotification } = require('./notify');


exports.notifyUser = async (userId, message) => {
  const user = await User.findById(userId);
  if (!user) return;
  // SMS gönder
  if (user.phone) await sendSMS(user.phone, message);
  // Mail gönder
  if (user.email) await sendMail(user.email, 'Etkinlik Bilgilendirme', message);
  // Bildirim kaydı
  await addNotification(userId, message);
};