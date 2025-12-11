const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
require('dotenv').config();

//#region models
const User = require('./models/User');

//#endregion

const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const categoryTypeRoutes = require('./routes/categoryTypeRoutes');
const referenceRoutes = require('./routes/referenceRoutes');
const introductionBookletRoutes = require('./routes/introductionBookletRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const contactRoutes = require('./routes/contactRoutes');
const socialMediaRoute = require('./routes/socialMediaRoute');
const privacyPolicyRoutes = require('./routes/privacyPolicyRoutes');
const termsOfServiceRoutes = require('./routes/termsOfServiceRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// MongoDB bağlantısı
connectDB();

// Uploads klasörünü statik olarak serve et - Route'lardan ÖNCE olmalı
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 yıl cache
    }
}));

// Uploads klasörünü oluştur
const uploadsPath = path.join(__dirname, 'uploads');
const avatarsPath = path.join(uploadsPath, 'avatars');
const projectsPath = path.join(uploadsPath, 'projects');
const referencesPath = path.join(uploadsPath, 'references');
const introductionBookletPath = path.join(uploadsPath, 'introductionBooklet');
const SocialMediaPath = path.join(uploadsPath, 'SocialMedia')


if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}
if (!fs.existsSync(avatarsPath)) {
    fs.mkdirSync(avatarsPath);
} 
if (!fs.existsSync(projectsPath)) {
    fs.mkdirSync(projectsPath);
}
if (!fs.existsSync(referencesPath)) {
    fs.mkdirSync(referencesPath);
}
if (!fs.existsSync(introductionBookletPath)) {
    fs.mkdirSync(introductionBookletPath);
}

if (!fs.existsSync(SocialMediaPath)) {
    fs.mkdirSync(SocialMediaPath);
}

// Multer yapılandırması
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = file.fieldname === 'avatar' ? avatarsPath : projectsPath;
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Uploads klasörünü statik olarak serve et - Route'lardan ÖNCE olmalı
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 yıl cache
    }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/categories',categoryRoutes);
app.use('/api/categoryTypes', categoryTypeRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/introductionBooklet', introductionBookletRoutes);
app.use('/api/abouts', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/social-media', socialMediaRoute);
app.use('/api/privacyPolicies', privacyPolicyRoutes);
app.use('/api/termsOfServices', termsOfServiceRoutes); 
 
module.exports = app;

