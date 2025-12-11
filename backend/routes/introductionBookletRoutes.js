

const express = require('express');
const router = express.Router();
const Model = require('../models/IntroductionBooklet'); // Modeli import edin
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const uploadDir = 'uploads/introductionBooklet/';


// Multer yapılandırması
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {

        if (file.fieldname === 'image') {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Sadece resim dosyaları yüklenebilir!'));
            }
        } else if (file.fieldname === 'bookletFile') {
            if (!file.originalname.match(/\.(pdf)$/)) {
                return cb(new Error('Sadece pdf dosyaları yüklenebilir!'));                
            }
        }

        cb(null, true);
    }
});

// Tüm kayıtları getir - Sadece admin
router.get('/', async (req, res) => {
    try {
        const introductionBooklet = await Model.find();
        res.json({ 
            success: true, 
            introductionBooklet 
        });
    } catch (error) {
        console.error('Veriyi çekerken hata:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Yeni Kayıt oluştur - Sadece admin
router.post('/', protect, authorize('admin'), 
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'bookletFile', maxCount: 1 }
    ]), 
    async (req, res) => {
    try {
        const { description } = req.body;

        const modelData = new Model({
            description : description,
            coverImageUrl: null,    
            fileUrl: null
        });

        if (req.files && req.files.image && req.files.image.length > 0) {
            modelData.coverImageUrl = '/' + uploadDir + req.files.image[0].filename;
        }
        if (req.files && req.files.bookletFile && req.files.bookletFile.length > 0) {
            modelData.fileUrl = '/' + uploadDir + req.files.bookletFile[0].filename;
        }

        const introductionBooklet = new Model(modelData);
        await introductionBooklet.save();

        res.status(201).json({ 
            success: true, 
            introductionBooklet 
        });
    } catch (error) {
       if (req.files) {
            if (req.files.image && req.files.image.length > 0) {
                const imagePath = path.join(__dirname, '..', req.files.image[0].path);  
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            if (req.files.bookletFile && req.files.bookletFile.length > 0) {
                const pdfPath = path.join(__dirname, '..', req.files.bookletFile[0].path);  
                if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                }
            }
        }
        res.status(400).json({ 
            success: false, 
            message: error.message });
    }
});

// Kaydı güncelle - Sadece admin
router.put('/:id', protect, authorize('admin'),
    upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'bookletFile', maxCount: 1 }
    ]), async (req, res) => {
    
    try {        
        const { description } = req.body;

        const introductionBooklet = await Model.findById(req.params.id);

        if (!introductionBooklet) {
            return res.status(404).json({ success: false, message: 'Kayıt bulunamadı' });
        }         

        if (description) {
            introductionBooklet.description = description;
        } 
        const oldImageUrl = introductionBooklet.coverImageUrl || null;
        const oldPdfUrl = introductionBooklet.fileUrl || null;

        // Yeni resim yüklenmişse, eski resmi sil ve yeni resim ekle
        if (req.files && req.files.image && req.files.image.length > 0) {
            const newImagePath = '/' + uploadDir + req.files.image[0].filename;
            introductionBooklet.coverImageUrl = newImagePath;
        }

        // Yeni pdf yüklenmişse, eski pdf'yi sil ve yeni pdf'yi ekle
        if (req.files && req.files.bookletFile && req.files.bookletFile.length > 0) {
            const newPdfPath = '/' + uploadDir + req.files.bookletFile[0].filename;
            introductionBooklet.fileUrl = newPdfPath;
        }

        // Eski resim yolu kontrolü ve silme işlemi
        // Eğer eski resim yolu varsa ve dosya mevcutsa sil
        if (req.files && req.files.image && req.files.image.length > 0) {
            if (oldImageUrl && typeof oldImageUrl === 'string') {
                const oldImagePath = path.join(__dirname, '..', oldImageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }
        // Eski pdf yolu kontrolü ve silme işlemi
        // Eğer eski pdf yolu varsa ve dosya mevcutsa sil
        if (req.files && req.files.bookletFile && req.files.bookletFile.length > 0) {
            if (oldPdfUrl && typeof oldPdfUrl === 'string') {
                const oldPdfPath = path.join(__dirname, '..', oldPdfUrl);
                if (fs.existsSync(oldPdfPath)) {
                    fs.unlinkSync(oldPdfPath);
                }
            }
        }
        const updateData = await Model.findByIdAndUpdate(
            req.params.id, 
            introductionBooklet, 
            { new: true }
        );

        if (!updateData) {
            return res.status(404).json({ 
                success: false, 
                message: 'Veri güncellenemedi' 
            });
        }
        res.json({ 
            success: true, 
            introductionBooklet 
        });
         
    } catch (error) {
        console.error('Error updating introductionBooklet:', error);
        // Eğer dosya yüklenirken hata oluşursa, yüklenen dosyaları sil         
        if (req.files) {
            if (req.files.image && req.files.image.length > 0) {
                const imagePath = path.join(__dirname, '..', req.files.image[0].path);  
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            if (req.files.bookletFile && req.files.bookletFile.length > 0) {
                const pdfPath = path.join(__dirname, '..', req.files.bookletFile[0].path);  
                if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                }
            }
        }
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    } 
});

// Kaydı sil
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const introductionBooklet = await Model.findById(req.params.id);
        
        if (!introductionBooklet) {
            return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
        }

        if (introductionBooklet.imageUrls.length > 0) {
            introductionBooklet.imageUrls.forEach(file => {
                if (file && typeof file === 'string') {
                    const imagePath = path.join(__dirname, '..', file);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
            });
        }

        await introductionBooklet.remove();
        res.json({ success: true, message: 'Ürün başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;