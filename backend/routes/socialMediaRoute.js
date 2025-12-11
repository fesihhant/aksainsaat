const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const SocialMedia = require('../models/SocialMedia');


// Tüm sosyal medya hesaplarını getir
router.get('/', async (req, res) => {
    try {
        const accounts = await SocialMedia.find();
        res.json({ success: true, accounts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tek bir sosyal medya hesabı getir
router.get('/:id', async (req, res) => {
    try {
        const account = await SocialMedia.findById(req.params.id);
        if (!account) return res.status(404).json({ success: false, message: 'Hesap bulunamadı' });
        res.json({ success: true, account });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Yeni sosyal medya hesabı ekle
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, mediaLink, active } = req.body;
        const newAccount = new SocialMedia({ name, mediaLink, active });
        await newAccount.save();
        res.json({ success: true, account: newAccount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Sosyal medya hesabı güncelle
router.put('/:id', protect, authorize('admin'),async (req, res) => {
    try {
        const { name, mediaLink, active } = req.body;
        const updated = await SocialMedia.findByIdAndUpdate(
            req.params.id,
            { name, mediaLink, active },
            { new: true }
        );
        if (!updated) return res.status(404).json({ success: false, message: 'Hesap bulunamadı' });
        res.json({ success: true, account: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Sosyal medya hesabı sil
router.delete('/:id', protect, authorize('admin'),async (req, res) => {
    try {
        const deleted = await SocialMedia.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Hesap bulunamadı' });
        res.json({ success: true, message: 'Hesap silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;