const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');


router.get('/getCategoryNameById', async (req, res) => {
    try {
        const { categoryId } = req.query;
        if (!categoryId) {
            return res.status(400).json({ success: false, message: 'categoryId gerekli' });
        }
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
        }
        res.json({ 
            success: true, 
            category            
         });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Kategori verisi alınamadı' });
    }
});
 
router.get('/categorytypes', async (req, res) => {
    try {
        // Kategori türü ID'sini al
        const { categoryTypeId, categoryTypeIdList } = req.query;

        if (categoryTypeIdList) {
            let idList = categoryTypeIdList;

            if (typeof idList === 'string') {
                idList = idList.split(',').map(Number);
            }
            const categories = await Category.find({ categoryTypeId: { $in: idList } });
            if (!categories || categories.length === 0) {
                return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
            }
            return res.json({ success: true, categories });
        }

        if (!categoryTypeId) {
            return res.status(400).json({ success: false, message: 'categoryTypeId gerekli' });
        }

        const categories = await Category.find({ categoryTypeId: categoryTypeId });

        if (!categories || categories.length === 0) {
            return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
        }
        res.json({ 
            success: true, 
            categories            
         });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Kategori verileri alınamadı' });
    }
});
 

 // Tüm kayıtları getir
 router.get('/', async (req, res) => {
     try {
         const categories = await Category.find().populate('categoryTypeId', 'name');
         res.json({ success: true, categories });
     } catch (error) {
         res.status(500).json({ success: false, message: error.message });
     }
 });
 

// Tek Kayıt getir
router.get('/:id', protect, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
        }
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Yeni kayıt oluştur - Sadece admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try { 
        const { name, categoryTypeId } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Tüm alanları doldurun' });
        }

        const newCategory = new Category({
            name,
            categoryTypeId
        });

        await newCategory.save();
        res.status(201).json({ success: true, category: newCategory });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Kategori oluşturulurken bir hata oluştu: ' + error.message
        });
    }
});
 
// Kaydı güncelle 
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {

        const { name, categoryTypeId } = req.body;
        const categoryId = req.params.id;

        if (!name || !categoryTypeId) {
            return res.status(400).json({success: false,message: 'Zorunlu alanları doldurun'});
        }

        // Mevcut kategoriyi bul
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }

        const updateData = {
            name, categoryTypeId, id: categoryId
        };

        const category = await Category.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }

        res.json({
            success: true,
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Kategori güncellenirken bir hata oluştu: ' + error.message
        });
    }
});

// Kaydı sil
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const data = await Category.findById(req.params.id);
        
        if (!data) {
            return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
        }

        await data.deleteOne();
        res.json({ success: true, message: 'Kategori başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//public api
module.exports = router;
