const mongoose = require('mongoose');
const SocialMediaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mediaLink: { type: String, required: true },
  active: { type: Boolean, default: true }
});
module.exports = mongoose.model('SocialMedia', SocialMediaSchema);