const express = require('express');
const router = express.Router();
const Model = require('../models/About');
const { protect, authorize } = require('../middleware/auth');

 
 // Tüm kayıtları getir
 router.get('/', async (req, res) => {
     try {
         const about = await Model.find();
         res.json({ success: true, about });
     } catch (error) {
         res.status(500).json({ success: false, message: error.message });
     }
 });
 

// Yeni kayıt oluştur - Sadece admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try { 
        const { aboutText, visionText,missionText, phoneNumber,email,address,fax } = req.body;

        if (!aboutText || !visionText || !missionText || !phoneNumber || !email || !address) {    
            return res.status(400).json({ success: false, message: 'Lüften tüm alanları doldurun' });
        }

        const newAbout = new Model({
            aboutText,
            visionText,
            missionText,
            phoneNumber,
            email,  
            address,
            fax
        });

        await newAbout.save();
        res.status(201).json({ success: true, about: newAbout });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Veri oluşturulurken bir hata oluştu: ' + error.message
        });
    }
});
 
// Kaydı güncelle 
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { aboutText, visionText, missionText, phoneNumber, email, address,fax } = req.body;
        const { id } = req.params;

        const updateData = {aboutText, visionText, missionText, phoneNumber, email, address, fax };
        const updatedAbout = await Model.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ); 
        if (!updatedAbout) {
            return res.status(404).json({ success: false, message: 'Kayıt bulunamadı' });
        }

        res.json({ success: true, about: updatedAbout });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// Kaydı sil
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const data = await Model.findById(req.params.id);
        
        if (!data) {
            return res.status(404).json({ success: false, message: 'Veri bulunamadı' });
        }

        await data.remove();
        res.json({ success: true, message: 'Veri başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//public api
module.exports = router;
