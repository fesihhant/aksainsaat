const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Reference = require('../models/Reference'); 
const { protect, authorize } = require('../middleware/auth');

// Multer yapılandırması
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/references';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Sadece resim dosyaları yüklenebilir!'));
        }
        cb(null, true);
    }
});

// Tüm Referansları getir 
router.get('/referenceList', async (req, res) => {
    try {
        const references = await Reference.find();
        res.json({ 
            success: true, 
            references 
        });
    } catch (error) {
        console.error('Referansları çekerken hata:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tüm referansları getir - Sadece admin
router.get('/', protect, async (req, res) => {
    try {
        const references = await Reference.find();
        res.json({ 
            success: true, 
            references 
        });
    } catch (error) {
        console.error('Referansları çekerken hata:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tek referans getir
router.get('/:id', protect, async (req, res) => {
    try {
        const reference = await Reference.findById(req.params.id);
        if (!reference) {
            return res.status(404).json({ success: false, message: 'Referans bulunamadı' });
        }
        res.json({ success: true, reference });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Yeni referans ekle
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        const { name, webLink, description } = req.body;
        const reference = new Reference({
            name,
            description,
            webLink,
            imageUrl: req.file ? '/uploads/references/' + req.file.filename : null
        });

        await reference.save();
        res.status(201).json({ success: true, reference });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// Referans güncelle
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    try {

        const { name, webLink, description} = req.body;
        const reference = await Reference.findById(req.params.id);

        if (!reference) {
            return res.status(404).json({ success: false, message: 'Referans bulunamadı' });
        }

        reference.name = name; 
        reference.webLink = webLink;
        reference.description = description; 

        const imageUrl = req.file && reference.imageUrl? reference.imageUrl : null;
        if (req.file) {
            reference.imageUrl = '/uploads/references/' + req.file.filename;
        }

        // Eski resimleri silme işlemini yanıt gönderilmeden önce yapın
        if (imageUrl && typeof imageUrl === 'string') {
            const oldImagePath = path.join(__dirname, '..', imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
           
        await reference.save();
        res.json({ success: true, reference });
    } catch (error) {
        console.error('Error updating reference:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// Referans sil
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const reference = await Reference.findById(req.params.id);
        
        if (!reference) {
            return res.status(404).json({ success: false, message: 'Referans bulunamadı' });
        }

        // Referans resmini sil
        const imageUrl = reference.imageUrl;
        await reference.deleteOne();

        try {
            if (imageUrl && typeof imageUrl === 'string') {
                const imagePath = path.join(__dirname, '..', imageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        } catch (error) {
            console.error('Resim silinirken hata:', error);
        }

        res.json({ success: true, message: 'Referans başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;