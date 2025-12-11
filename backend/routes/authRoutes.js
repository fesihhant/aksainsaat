const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserResetToken = require('../models/UserResetToken');

const crypto = require('crypto');
const {EncryptedOrDecryptedJSFormat} = require('../crypto/cryptoJs');
const {MailTransporter, MailOptions} = require('../utils/mailUtils');


const JWT_SECRET = process.env.JWT_SECRET; // Güvenli bir ortam değişkeni kullanın
const JWT_ANONMOUS_SECRET = 'anonymous-token-secret'; // Güvenli bir ortam değişkeni kullanın

const getHtmlBody=(fullName, resetLink) => ( `
                

                  <!doctype html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                    <title>Simple Transactional Email</title>
                    <style>
                    /* -------------------------------------
                        GLOBAL RESETS
                    ------------------------------------- */
                    
                    /*All the styling goes here*/
                    
                    img {
                        border: none;
                        -ms-interpolation-mode: bicubic;
                        max-width: 100%; 
                    }

                    body {
                        background-color: #f6f6f6;
                        font-family: sans-serif;
                        -webkit-font-smoothing: antialiased;
                        font-size: 14px;
                        line-height: 1.4;
                        margin: 0;
                        padding: 0;
                        -ms-text-size-adjust: 100%;
                        -webkit-text-size-adjust: 100%; 
                    }

                    table {
                        border-collapse: separate;
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                        width: 100%; }
                        table td {
                        font-family: sans-serif;
                        font-size: 14px;
                        vertical-align: top; 
                    }

                    /* -------------------------------------
                        BODY & CONTAINER
                    ------------------------------------- */

                    .body {
                        background-color: #f6f6f6;
                        width: 100%; 
                    }

                    /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
                    .container {
                        display: block;
                        margin: 0 auto !important;
                        /* makes it centered */
                        max-width: 580px;
                        padding: 10px;
                        width: 580px; 
                    }

                    /* This should also be a block element, so that it will fill 100% of the .container */
                    .content {
                        box-sizing: border-box;
                        display: block;
                        margin: 0 auto;
                        max-width: 580px;
                        padding: 10px; 
                    }

                    /* -------------------------------------
                        HEADER, FOOTER, MAIN
                    ------------------------------------- */
                    .main {
                        background: #ffffff;
                        border-radius: 3px;
                        width: 100%; 
                    }

                    .wrapper {
                        box-sizing: border-box;
                        padding: 20px; 
                    }

                    .content-block {
                        padding-bottom: 10px;
                        padding-top: 10px;
                    }


                    </style>
                </head>
                <body>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
                    <tr>
                        <td>&nbsp;</td>
                        <td class="container">
                        <div class="content">

                            <!-- START CENTERED WHITE CONTAINER -->
                            <table role="presentation" class="main">

                            <!-- START MAIN CONTENT AREA -->
                            <tr>
                                <td class="wrapper">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                    <td>
                                        Merhaba ${fullName},<br><br>
                                        Şifrenizi sıfırlamak için <a href="${resetLink}">buraya tıklayın</a>.<br>
                                        Eğer bu işlemi siz yapmadıysanız, lütfen bu maili dikkate almayınız.<br>
                                        <br>
                                        Teşekkürler.
                                    </td>
                                    </tr>
                                </table>
                                </td>
                            </tr>

                            <!-- END MAIN CONTENT AREA -->
                            </table>
                            <!-- END CENTERED WHITE CONTAINER -->


                        </div>
                        </td>
                        <td>&nbsp;</td>
                    </tr>
                    </table>
                </body>
                </html>
            `);
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email ve şifre kontrolü
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen e-posta ve şifrenizi giriniz'
            });
        }

        // Kullanıcıyı bul
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre'
            });
        }

        // Şifre kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre'
            });
        }

        if (!user.isActivated) {
           return res.json({
               success: false,
               message: 'Lütfen hesabınızı aktivasyon mailindeki link ile aktifleştirin.'
           });            
        }
        // Token oluştur
        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Kullanıcı bilgilerini gönder
        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        res.json({
            success: true,
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Giriş yapılırken bir hata oluştu'
        });
    }
});

// Mevcut kullanıcı bilgilerini getir
router.get('/me', async (req, res) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token bulunamadı'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Kullanıcı bilgileri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgileri alınırken bir hata oluştu'
        });
    }
});

// anonim token oluştur
router.get('/anonymous-token', async(req, res) => {
    try {
        // Anonim token oluştur
        const token = jwt.sign(
            { role: 'anonymous' }, // Anonim kullanıcı rolü
            JWT_ANONMOUS_SECRET,
            { expiresIn: '1h' } // 1 saat geçerli
        );

        res.json({
            success: true,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Token oluşturulurken bir hata oluştu'
        });
    }
});

//#region forget password
router.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Girdiğiniz mail adresi hatalı lütfen tekrar deneyiniz!'
            });
        }

        const expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 1); 
        
        //token şifrele
        const webLink = process.env.IS_LOCAL_WEB === 'true' ? process.env.LOCAL_WEB_ADDRESS : process.env.PROD_WEB_ADDRESS;
        const resetToken = EncryptedOrDecryptedJSFormat(user._id.toString(), true);
        const resetLink = `${webLink}/reset-password/${encodeURIComponent(resetToken)}`;

        const userId = user._id;
        const existingUserToken = await UserResetToken.findOne({ userId: userId });
        const tokenModel = {userId: userId, resetToken: resetToken, expireDate: expireDate}; 
        
        if (existingUserToken) {       
            const updateUserResetToken = await UserResetToken.findByIdAndUpdate(
                existingUserToken._id,
                tokenModel,
                { new: true }
            );
            if (!updateUserResetToken) {
                return res.status(500).json({success:false, message: 'Kullanıcının token bilgisi güncellenmedi!'})
            }

        }else{

            const userResetToken = new UserResetToken(tokenModel);

            await userResetToken.save();
            const userTokenResponse = { ...userResetToken.toObject() };

            if (!userTokenResponse) {
              return  res.status(500).json({success: false, message : 'Kullanıcı için token oluşturulamadı!'})
            }
        }

        let transporter = nodemailer.createTransport(MailTransporter());
        
        let toMail = email;
        let subjectMessage = `Şifre Sıfırlama Maili`;
        let htmlBody = getHtmlBody(user.fullName, resetLink);

        let mailOptions = MailOptions(toMail,subjectMessage, htmlBody);
        

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Şifre sıfırlama mailiniz gönderilmiştir.' });
        
    } catch (error) {
        res.status(500).json({ success: false, message: 'Mail gönderilemedi', error: error.message });
    }
});

router.get('/check-reset-token', async (req, res) => {
    const { resetToken } = req.query;
    try {
        const decryptedToken = EncryptedOrDecryptedJSFormat(resetToken, false);

        const tokenDoc = await UserResetToken.findOne({ decryptedToken });
        if (!tokenDoc) {
            return res.json({ success: false, message: 'Geçersiz bağlantı.' });
        }
        if (tokenDoc.expireDate < new Date()) {
            return res.json({ success: false, message: 'Bağlantının süresi dolmuş.' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});
router.post('/reset-password', async (req, res) => {
    const { resetToken, password } = req.body;
    try {
        const tokenDoc = await UserResetToken.findOne({ resetToken });
        if (!tokenDoc) {
            return res.status(400).json({ success: false, message: 'Geçersiz bağlantı.' });
        }
        if (tokenDoc.expireDate < new Date()) {
            return res.status(400).json({ success: false, message: 'Bağlantının süresi dolmuş.' });
        }
        const user = await User.findById(tokenDoc.userId);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        // Tokenı sil (tek kullanımlık)
        await UserResetToken.deleteOne({ _id: tokenDoc._id });
        res.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});
//#endregion


router.post('/send-activation', async (req, res) => {
    const { email } = req.body;
    try {
        const userModel = await User.findOne({ email });
        if (!userModel) {
            return res.status(401).json({
                success: false,
                message: 'Girdiğiniz mail adresi hatalı lütfen tekrar deneyiniz!'
            });
        }

       //token şifrele
        const webLink = process.env.IS_LOCAL_WEB === 'true' ? process.env.LOCAL_WEB_ADDRESS : process.env.PROD_WEB_ADDRESS;
        const resetToken = EncryptedOrDecryptedJSFormat(userModel._id.toString(), true);
        const resetLink = `${webLink}/user-activated/${encodeURIComponent(resetToken)}`;

        const tokenModel = userModel;
        tokenModel.activationToken = resetToken;
        tokenModel.isActivated = false;

        const updateUserToken = await UserResetToken.findByIdAndUpdate(
            userModel._id,
            tokenModel,
            { new: true }
        );
        if (!updateUserToken) {
            return res.status(500).json({success:false, message: 'Kullanıcının token bilgisi güncellenmedi!'})
        }
        let transporter = nodemailer.createTransport(MailTransporter());
        
        let toMail = email;
        let subjectMessage = `Aktivasyon maili`;
        let htmlBody = getHtmlBody(userModel.fullName, resetLink);
        let mailOptions = MailOptions(toMail,subjectMessage, htmlBody);

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Aktivasyon mailiniz gönderilmiştir.' });
        
    } catch (error) {
        console.error('Aktivasyon maili gönderme hatası:', error);
        res.status(500).json({ success: false, message: 'Aktivasyon maili gönderilemedi', error: error.message });
    }
});


router.get('/activate', async (req, res) => {
    const { activationToken } = req.query;
    try {
        const decryptedToken = EncryptedOrDecryptedJSFormat(activationToken, false);

        const user = await User.findOne({ activationToken: decryptedToken });
        if (!user) {
            return res.status(400).send('Geçersiz veya süresi dolmuş aktivasyon linki.');
        }
        user.isActivated = true;
        user.activationToken = null;
        await user.save();
        res.send('Hesabınız başarıyla aktifleştirildi.');
    } catch (error) {
        res.status(500).send('Aktivasyon sırasında bir hata oluştu.');
    }
});

module.exports = router;
