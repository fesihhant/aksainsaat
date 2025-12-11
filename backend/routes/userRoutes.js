const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const {EncryptedOrDecryptedJSFormat} = require('../crypto/cryptoJs');
const {MailTransporter, MailOptions} = require('../utils/mailUtils');
const nodemailer = require('nodemailer');

// Multer yapılandırması
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
        }
    }
});

// Tüm kullanıcıları getir - Sadece admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Kullanıcıları getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcılar yüklenirken bir hata oluştu'
        });
    }
});

// Tek bir kullanıcıyı getir - Admin veya kendisi
router.get('/:id', protect, async (req, res) => {
    try {
        // Kullanıcı kendi bilgilerini veya admin tüm kullanıcıları görebilir
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        const user = await User.findById(req.params.id).select('-password');
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
        console.error('Kullanıcı getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı yüklenirken bir hata oluştu'
        });
    }
});
// Kullanıcı Kaydı
router.post('/register', async (req, res) => {
    try {
        const { fullName, phone, email, password } = req.body;

        // Email kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanımda'
            });
        }

        // Şifre hash'leme
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluşturma
        const user = new User({
            fullName,
            phone,
            email,
            password: hashedPassword,
            isActivated:false,
        });

        await user.save();
        const userResponse = { ...user.toObject() };

        //token şifrele
        const webLink = process.env.IS_LOCAL_WEB === 'true' ? process.env.LOCAL_WEB_ADDRESS : process.env.PROD_WEB_ADDRESS;
        const resetToken = EncryptedOrDecryptedJSFormat(userResponse._id.toString(), true);
        const resetLink = `${webLink}/reset-password/${encodeURIComponent(resetToken)}`;

        if (userResponse) {      
            const tokenModel = userResponse;
            tokenModel.activationToken = resetToken;
            const updateUserToken = await user.findByIdAndUpdate(
                userResponse._id,
                tokenModel,
                { new: true }
            );
            if (!updateUserToken) {
                return res.status(500).json({success:false, message: 'Kayıt işleminda hata oluştu!'})
            }   
        }
        
        let transporter = nodemailer.createTransport(MailTransporter());
        
        let toMail = email;
        let subjectMessage = `Şifre Sıfırlama maili`;
        let htmlBody = `Merhaba ${user.fullName},<br><br>
                Aktivasyon işlemi için <a href="${resetLink}">buraya tıklayın</a>.<br>
                Eğer bu işlemi siz yapmadıysanız, lütfen bu maili dikkate almayınız.<br>
                <br>
                Teşekkürler.
            `;
        let mailOptions = MailOptions(toMail,subjectMessage, htmlBody);

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Kaydınız bşarıyla oluşturuldu, aktivasyon mailiniz gönderilmiştir.' });
             
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.json({
            success: false,
            message: 'Kayıt işlemi sırasında bir hata oluştu :' + error
        });
    }
});

// Yeni kullanıcı oluştur - Sadece admin
router.post('/', protect, authorize('admin'), upload.single('avatar'), async (req, res) => {
    try {
        const { fullName, email, phone, password, avatarType, role } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen tüm zorunlu alanları doldurun'
            });
        }

        // E-posta kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanımda'
            });
        }

        // Şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: role || 'user',
            avatarType: avatarType || 'preset',
            isActivated:true
        };

        // Eğer dosya yüklendiyse
        if (req.file) {
            userData.avatar = '/uploads/avatars/' + path.basename(req.file.path);
            userData.avatarType = 'upload';
        } else if (req.body.avatar) {
            userData.avatar = req.body.avatar;
            userData.avatarType = 'preset';
        }

        const user = new User(userData);
        await user.save();

        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        res.status(201).json({
            success: true,
            user: userResponse
        });
    } catch (error) {
        console.error('Kullanıcı oluşturma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı oluşturulurken bir hata oluştu: ' + error.message
        });
    }
});

// Kullanıcı güncelle - Admin veya kendisi
router.put('/:id', protect, upload.single('avatar'), async (req, res) => {
    try {
        const { fullName, email, password, phone, avatarType, role } = req.body;
        const userId = req.params.id;

        // Yetki kontrolü
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        if (!fullName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Ad Soyad ve E-posta alanları zorunludur'
            });
        }

        // Mevcut kullanıcıyı bul
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        // E-posta kontrolü (kendi e-postası hariç)
        const emailExists = await User.findOne({ 
            email, 
            _id: { $ne: userId } 
        });
        
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanımda'
            });
        }

        const updateData = {
            fullName,
            email,  
            phone,          
            isActivated:true
        };

        // Sadece admin rol değiştirebilir
        if (req.user.role === 'admin' && role) {
            updateData.role = role;
        }

        // Şifre değiştirilecekse
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Avatar güncelleme
        if (req.file) {
            // Eğer önceki avatar bir upload ise ve dosya mevcutsa sil
            if (existingUser.avatarType === 'upload' && existingUser.avatar) {
                const oldAvatarPath = path.join(__dirname, '..', existingUser.avatar);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }
            updateData.avatar = '/uploads/avatars/' + path.basename(req.file.path);
            updateData.avatarType = 'upload';
        } else if (req.body.avatar) {
            updateData.avatar = req.body.avatar;
            updateData.avatarType = 'preset';
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

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
        console.error('Kullanıcı güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı güncellenirken bir hata oluştu: ' + error.message
        });
    }
});

// Kullanıcı silme - Sadece admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }
        user.isActivated = false; // Kullanıcıyı silmek yerine pasifleştiriyoruz
        await user.save();
        res.json({
            success: true,
            message: 'Kullanıcı başarıyla silindi'
        });
    } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı silinirken bir hata oluştu'
        });
    }
}); 
module.exports = router;
