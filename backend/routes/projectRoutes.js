

const express = require('express');
const router = express.Router();
const Project = require('../models/Project'); // Proje modelini import edin
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');


// Multer yapılandırması
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'projects');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Dosya adını güvenli hale getir
        const ext = path.extname(file.originalname) || '.jpg'; // Extension yoksa .jpg ekle
        const nameWithoutExt = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '');
        // Eğer dosya adı boşsa veya sadece özel karakterler varsa 'image' kullan
        const safeName = nameWithoutExt && nameWithoutExt.length > 0 ? nameWithoutExt : 'image';
        cb(null, Date.now() + '-' + safeName + ext);
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
// Tüm kayıtları getir - Sadece admin
router.get('/', protect, async (req, res) => {
    try {
        const projects = await Project.find().populate('typeofActivityId', 'name');
        // Proje yoksa boş array döndür, 404 değil
        res.json({ 
            success: true, 
            projects: projects || []
        });
    } catch (error) {
        console.error('Projeleri çekerken hata:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Tüm kayıtları getir
router.get('/projectList', async (req, res) => {
    try {
        const projects = await Project.find().populate('typeofActivityId', 'name');
        res.json({ 
            success: true, 
            projects 
        });
    } catch (error) {
        console.error('Projeleri çekerken hata:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tek kayıt getir - Public
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Kayıt bulunamadı' });
        }
        res.json({ 
            success: true, 
            project 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Yeni Kayıt oluştur - Sadece admin
router.post('/', protect, authorize('admin'), 
    upload.fields([{ name: 'images' }, { name: 'videos' }]), async (req, res) => {
    try {
        const { name, statusType, description, projectCost, isVisibleCost, typeofActivityId, youtubeUrl, currencyType , startDate,endDate } = req.body;
        if (!name || !projectCost || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen tüm zorunlu alanları doldurun'
            });
        }
        if (!req.files || req.files.images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen en az bir resim yükleyin'
            });
        }
        
        const imageUrls = req.files && req.files.images
            ? req.files.images.map(file => '/uploads/projects/' + file.filename)
            : [];
        const videoUrls = req.files && req.files.videos
            ? req.files.videos.map(file => '/uploads/projects/' + file.filename)
            : [];
        const project = new Project({
            name,
            statusType,
            description,
            projectCost: parseFloat(projectCost),
            isVisibleCost: isVisibleCost,
            currencyType: currencyType || 'TRY',
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(),
            imageUrls,
            videoUrls,
            typeofActivityId: typeofActivityId,
            youtubeUrl : youtubeUrl || ''
        });
 
        await project.save();

        res.status(201).json({ 
            success: true, 
            project 
        });
    } catch (error) {
        if (req.files) {
            // req.files.forEach(file => {
            //     const filePath = path.join(__dirname, '..', file.path);
            //     if (fs.existsSync(filePath)) {
            //         fs.unlinkSync(filePath);
            //     }
            // });
            Object.values(req.files).flat().forEach(file => {
                const filePath = path.join(__dirname, '..', file.path);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        
        res.status(400).json({ 
            success: false, 
            message: error.message });
    }
});

// Kaydı güncelle - Sadece admin
router.put('/:id', protect, authorize('admin'),
    upload.fields([{ name: 'images' }, { name: 'videos' }]), async (req, res) => {
    
    try {        
        const { name, statusType, description, projectCost, isVisibleCost, typeofActivityId, youtubeUrl, currencyType, startDate, endDate, keptImages } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Kayıt bulunamadı' });
        }
        if (!name || !projectCost || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen tüm zorunlu alanları doldurun'
            });
        }

        project.name = name;
        project.description = description;
        project.statusType = statusType;
        project.projectCost = parseFloat(projectCost); 
        project.isVisibleCost = isVisibleCost;
        project.currencyType = currencyType || 'TRY'; // Varsayılan olarak TRY
        project.typeofActivityId = typeofActivityId ||project.typeofActivityId; // Eğer typeofActivityId yoksa null olarak ayarla
        project.youtubeUrl = youtubeUrl || '';
        project.startDate = startDate ? new Date(startDate) : project.startDate; // Tarih formatını kontrol et
        project.endDate = endDate ? new Date(endDate) : null; // Tarih formatını kontrol et
       
        const oldImageUrls = project.imageUrls || [];
        
        // // Yeni resim yüklenmişse, eski resimleri sil ve yeni resimleri ekle
        // if (req.files && req.files.length > 0) {
        //     const imagePaths = req.files.map(file => '/uploads/projects/' + file.filename);
        //     if (imagePaths.length > 0) {
        //         project.imageUrls = imagePaths;
        //     }
        //     // Eski resimleri silme işlemini yanıt gönderilmeden önce yapın
        //     if (oldImageUrls.length > 0) {
        //         oldImageUrls.forEach(file => {
        //             if (file && typeof file === 'string') {
        //                 const oldImagePath = path.join(__dirname, '..', file);
        //                 if (fs.existsSync(oldImagePath)) {
        //                     if (project.imageUrls.includes(oldImagePath)) {
        //                     }else {
        //                         fs.unlinkSync(oldImagePath);
        //                     }
        //                 }
        //             }
        //         });
        //     }
        // }
        // Frontend'den silinen resimleri kontrol et ve sil
        if (keptImages) {
            try {
                const keptImagesArray = typeof keptImages === 'string' ? JSON.parse(keptImages) : keptImages;
                const currentImageUrls = project.imageUrls || [];
                
                // Silinmesi gereken resimleri bul ve sil
                const imagesToDelete = currentImageUrls.filter(url => !keptImagesArray.includes(url));
                imagesToDelete.forEach(imageUrl => {
                    if (imageUrl && typeof imageUrl === 'string') {
                        const imagePath = path.join(__dirname, '..', imageUrl);
                        if (fs.existsSync(imagePath)) {
                            try {
                                fs.unlinkSync(imagePath);
                            } catch (err) {
                                console.error('Resim silinirken hata:', err.message);
                            }
                        }
                    }
                });
                
                // Sadece korunan resimleri tut
                project.imageUrls = currentImageUrls.filter(url => keptImagesArray.includes(url));
            } catch (err) {
                console.error('keptImages parse hatası:', err);
            }
        }
        
        // Yeni yüklenen resim/video varsa mevcut listeye ekle
        if (req.files && req.files.images) {
            const newImages = req.files.images.map(file => '/uploads/projects/' + file.filename);
            project.imageUrls = [...(project.imageUrls || []), ...newImages];
        }
        if (req.files && req.files.videos) {
            const oldVideoUrls = project.videoUrls || [];            
            // Eski videoları silme işlemini yanıt gönderilmeden önce yapın
            if (oldVideoUrls.length > 0) {
                oldVideoUrls.forEach(file => {  
                    if (file && typeof file === 'string') {
                        const oldVideoPath = path.join(__dirname, '..', file);
                        if (fs.existsSync(oldVideoPath)) {
                            if (project.videoUrls.includes(oldVideoPath)) {
                            }else {
                                fs.unlinkSync(oldVideoPath);
                            }
                        }
                    }
                });
            }

            const newVideos = req.files.videos.map(file => '/uploads/projects/' + file.filename);
            project.videoUrls = [...(project.videoUrls || []), ...newVideos];

        }
        
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id, 
            project, 
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ 
                success: false, 
                message: 'Proje güncellenemedi' 
            });
        }
        res.json({ 
            success: true, 
            project 
        });
         
    } catch (error) {
        // yüklenen dosyaları temizle
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                const filePath = path.join(__dirname, '..', file.path);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        res.status(500).json({success: false, message: error.message });
    } 
});

// Kaydı sil
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
        }
        const imageUrls = project.imageUrls || [];
        await project.deleteOne();

        // Resimler varsa sil, yoksa geç
        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
            imageUrls.forEach(file => {
                if (file && typeof file === 'string') {
                    try {
                        const imagePath = path.join(__dirname, '..', file.replace(/^\//, ''));
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                        }
                    } catch (err) {
                        // Dosya silinemese bile devam et
                        console.error('Resim silinirken hata:', err.message);
                    }
                }
            });
        }

        res.json({ success: true, message: 'Ürün başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;