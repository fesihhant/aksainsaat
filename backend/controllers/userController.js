const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || user.isDeleted) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı veya silinmiş.' });
    }

    // Şifreyi karşılaştır
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Şifre hatalı.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  exports.register = async (req, res) => {
    try {
      const { phone, email, password, name } = req.body;
      const existing = await User.findOne({ phone });
      if (existing) return res.status(400).json({ error: 'Bu telefon ile kayıtlı kullanıcı var.' });
  
      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = new User({ phone, email, password: hashedPassword, name });
      await user.save();
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.status(201).json({ user, token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  // Kullanıcıları listele
exports.listUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
  };
// Kullanıcı sil (soft delete)
exports.deleteUser = async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ success: true });
  };