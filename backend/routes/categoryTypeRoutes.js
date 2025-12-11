const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const CategoryType = require('../models/CategoryType');

 
 // Tüm kayıtları getir
 router.get('/', async (req, res) => {
     try {
         const categoryTypes = await CategoryType.find();
         res.json({ success: true, categoryTypes });
     } catch (error) {
         res.status(500).json({ success: false, message: error.message });
     }
 });
 

// Tek Kayıt getir
router.get('/:id', protect, async (req, res) => {
    try {
        const categoryType = await CategoryType.findById(req.params.id);
        if (!categoryType) {
            return res.status(404).json({ success: false, message: 'Kategori türü bulunamadı' });
        }
        res.json({ success: true, categoryType });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Yeni kayıt oluştur - Sadece admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try { 
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Tüm alanları doldurun' });
        }

        const categoryType = new CategoryType({
            name
        });

        await categoryType.save();
        res.status(201).json({ success: true, categoryType: categoryType });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Kategori türü oluşturulurken bir hata oluştu: ' + error.message
        });
    }
});
 
// Kaydı güncelle 
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {

        const { name } = req.body;
        const id = req.params.id;

        if (!name) {
            return res.status(400).json({success: false,message: 'Zorunlu alanları doldurun'});
        }

        // Mevcut kategoriyi bul
        const existingCategoryType = await CategoryType.findById(id);
        if (!existingCategoryType) {
            return res.status(404).json({
                success: false,
                message: 'Kategori türü bulunamadı'
            });
        }

        const updateData = {
            name, id: id
        };

        const categoryType = await CategoryType.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!categoryType) {
            return res.status(404).json({
                success: false,
                message: 'Kayıt bulunamadı'
            });
        }

        res.json({
            success: true,
            categoryType
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kayıt güncellenirken bir hata oluştu: ' + error.message
        });
    }
});

// Kaydı sil
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const data = await CategoryType.findById(req.params.id);
        
        if (!data) {
            return res.status(404).json({ success: false, message: 'Kayıt bulunamadı' });
        }

        await data.deleteOne();
        res.json({ success: true, message: 'Kayıt başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//public api
module.exports = router;
