const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET; // Güvenli bir ortam değişkeni kullanın
const JWT_ANONYMOUS_SECRET = 'anonymous-secret-key'; // Güvenli bir ortam değişkeni kullanın

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Bu işlem için giriş yapmanız gerekiyor'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // Anonim token kontrolü
            if (decoded.role === 'anonymous') {
                req.user = { role: 'anonymous' }; // Anonim kullanıcı bilgisi
                return next();
            }

            // Normal kullanıcı kontrolü
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için yetkiniz yok'
            });
        }
        next();
    };
};
exports.protectAnonymous = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Bu işlem için giriş yapmanız gerekiyor'
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_ANONYMOUS_SECRET);

            // Anonim token kontrolü
            if (decoded.role === 'anonymous') {
                req.user = { role: 'anonymous' }; // Anonim kullanıcı bilgisi
                return next();
            }

            // Normal kullanıcı kontrolü
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
};