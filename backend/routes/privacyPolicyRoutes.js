const express = require('express');
const router = express.Router();
const PrivacyPolicy = require('../models/PrivacyPolicy');
const { protect, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');
 

// Tüm privacy policy getir
router.get('/', async (req, res) => {
    try {
        const privacyPolicy = await PrivacyPolicy.find();
        res.json({ success: true, privacyPolicy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tek bir privacy policy getir
router.get('/:id', async (req, res) => {
    try {
        const privacyPolicy = await PrivacyPolicy.findById(req.params.id);
        if (!privacyPolicy) return res.status(404).json({ success: false, message: 'PrivacyPolicy bulunamadı' });
        res.json({ success: true, privacyPolicy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Yeni privacy policy ekle
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const newPrivacyPolicy = new PrivacyPolicy({ title, content });
        await newPrivacyPolicy.save();
        res.json({ success: true, privacyPolicy: newPrivacyPolicy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Privacy policy güncelle
router.put('/:id', protect, authorize('admin'),async (req, res) => {
    try {
        const { title, content } = req.body;
        const updatedPrivacyPolicy = await PrivacyPolicy.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );
        if (!updatedPrivacyPolicy) return res.status(404).json({ success: false, message: 'PrivacyPolicy bulunamadı' });
        res.json({ success: true, privacyPolicy: updatedPrivacyPolicy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Privacy policy sil
router.delete('/:id', protect, authorize('admin'),async (req, res) => {
    try {
        const deletedPrivacyPolicy = await PrivacyPolicy.findByIdAndDelete(req.params.id);
        if (!deletedPrivacyPolicy) return res.status(404).json({ success: false, message: 'PrivacyPolicy bulunamadı' });
        res.json({ success: true, message: 'PrivacyPolicy silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;