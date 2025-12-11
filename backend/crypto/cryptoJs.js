const CryptoJS = require('crypto-js');

function EncryptedOrDecryptedJSFormat(value, isEncrypted = true) {
    const secretKey = process.env.CRYPTO_JS_SECRET_KEY;
    if (isEncrypted) {
        return CryptoJS.AES.encrypt(value, secretKey).toString();
    } else {
        try {
            const bytes = CryptoJS.AES.decrypt(resetToken, process.env.CRYPTO_JS_SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (!decrypted) {
                console.error('Çözme başarısız, token veya anahtar yanlış!');
            }
        } catch (err) {
            console.error('Çözme sırasında hata:', err);
        }
    }
}
module.exports = {EncryptedOrDecryptedJSFormat};