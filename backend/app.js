const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
// Public CORS ayarları (resim servisi için)
// const corsOptions = {
//   origin: ["https://aksainsaat.tr", "http://localhost:3001"], // sadece senin frontend domainine izin ver
//   methods: ["GET", "OPTIONS"],     // resim servisi için GET yeterli
//   allowedHeaders: ["Content-Type"],
//   credentials: false               // login yok, cookie taşınmasına gerek yok
// };
// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions)); // Preflight isteğini handle et

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

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


// #region Routes

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories',categoryRoutes);
const categoryTypeRoutes = require('./routes/categoryTypeRoutes');
app.use('/api/categoryTypes', categoryTypeRoutes);
const referenceRoutes = require('./routes/referenceRoutes');
app.use('/api/references', referenceRoutes);
const introductionBookletRoutes = require('./routes/introductionBookletRoutes');
app.use('/api/introductionBooklet', introductionBookletRoutes);
const aboutRoutes = require('./routes/aboutRoutes');
app.use('/api/abouts', aboutRoutes);
const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes);
const socialMediaRoute = require('./routes/socialMediaRoute');
app.use('/api/social-media', socialMediaRoute);
const privacyPolicyRoutes = require('./routes/privacyPolicyRoutes');
app.use('/api/privacyPolicies', privacyPolicyRoutes);
const termsOfServiceRoutes = require('./routes/termsOfServiceRoutes');
app.use('/api/termsOfServices', termsOfServiceRoutes); 
// 
module.exports = app;

