const express = require('express');
const router = express.Router();
const TermsOfService = require('../models/TermsOfService');
const { protect, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');
 

// Tüm terms of service getir
router.get('/', async (req, res) => {
    try {
        const termsOfService = await TermsOfService.find();
        res.json({ success: true, termsOfService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tek bir terms of service getir
router.get('/:id', async (req, res) => {
    try {
        const termsOfService = await TermsOfService.findById(req.params.id);
        if (!termsOfService) return res.status(404).json({ success: false, message: 'TermsOfService bulunamadı' });
        res.json({ success: true, termsOfService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Yeni terms of service ekle
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const newTermsOfService = new TermsOfService({ title, content });
        await newTermsOfService.save();
        res.json({ success: true, termsOfService: newTermsOfService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Terms of service güncelle
router.put('/:id', protect, authorize('admin'),async (req, res) => {
    try {
        const { title, content } = req.body;
        const updatedTermsOfService = await TermsOfService.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );
        if (!updatedTermsOfService) return res.status(404).json({ success: false, message: 'TermsOfService bulunamadı' });
        res.json({ success: true, termsOfService: updatedTermsOfService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Terms of service sil
router.delete('/:id', protect, authorize('admin'),async (req, res) => {
    try {
        const deletedTermsOfService = await TermsOfService.findByIdAndDelete(req.params.id);
        if (!deletedTermsOfService) return res.status(404).json({ success: false, message: 'TermsOfService bulunamadı' });
        res.json({ success: true, message: 'TermsOfService silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;