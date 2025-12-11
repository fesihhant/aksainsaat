export function defaultValidators() {
    return {
        required: value => (value !== undefined && value !== "" && value !== null) || 'Bu alan zorunludur',
        requiredIf: (value, rule) => (value !== undefined && value !== "" && value !== null) || (rule === false) || 'Bu alan zorunludur',
        minLength: (value, rule) => (value?.length >= rule) || 'en az ' + rule + ' karakter olmalı',
        maxLength: (value, rule) => (value?.length <= rule) || 'en fazla ' + rule + ' karakter olmalı',
        pattern: (value, rule) => (new RegExp(rule).test(value)) || 'Geçersiz format',
        min: (value, rule) => (parseFloat(value) >= rule) || 'en az ' + rule + ' olmalı',
        max: (value, rule) => (parseFloat(value) <= rule) || 'en fazla ' + rule + ' olmalı',
        email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) || 'Geçersiz email adresi',
        number: (value) => (/^\d+(\.\d+)?$/.test(value)) || 'Geçersiz sayı formatı',
        phone: (value) => (/^\+?[0-9]{7,15}$/.test(value)) || 'Geçersiz telefon numarası',
        url: (value) => {
            try {
                new URL(value);
                return true;
            } catch (_) {
                return 'Geçersiz URL';
            }
        }
    };  
}

export function validateNumber(value) {
    const numberRegex = /^\d+(\.\d+)?$/;    
    return numberRegex.test(value) || 'Geçersiz sayı formatı';
}
export function validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    return phoneRegex.test(phone);
}
export function validateNotEmpty(value) {
    return value && value.trim() !== '';
}
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}
export function validateMinLength(value, minLength) {
    return value && value.length >= minLength;
}
export function validateMaxLength(value, maxLength) {
    return value && value.length <= maxLength;
}
export function validateRange(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}
export function validateMin(value, min) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min;
}
export function validateMax(value, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num <= max;
}
export function parseNumber(value) {
    if (typeof value === 'number') return value;    
    if (typeof value === 'string') {
        // Virgül ve nokta karışık kullanımı için önce tüm noktalara virgül yap, sonra son virgülü noktaya çevir
        let standardized = value.replace(/\./g, '').replace(/,/g, '.');
        let parsed = parseFloat(standardized);
        if (isNaN(parsed)) return null;
        return parsed;
    }
    return null;
}

export function parseInteger(value) {
    if (typeof value === 'number' && Number.isInteger(value)) return value;    
    if (typeof value === 'string') {
        let parsed = parseInt(value.replace(/\D/g, ''), 10);
        if (isNaN(parsed)) return null;
        return parsed;
    }
    return null;
}
export function parseCurrency(value) {
    if (typeof value === 'number') return value;    
    if (typeof value === 'string') {
        // Sadece rakam ve nokta/virgül karakterlerini al
        let standardized = value.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(/,/g, '.');
        let parsed = parseFloat(standardized);
        if (isNaN(parsed)) return null;
        return parsed;
    }
    return null;
}

export function parseStock(value) {
    if (typeof value === 'number' && Number.isInteger(value)) return value;    
    if (typeof value === 'string') {
        let parsed = parseInt(value.replace(/\D/g, ''), 10);
        if (isNaN(parsed)) return null;
        return parsed;
    }
    return null;
}   
export function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const val = value.toLowerCase();
        if (val === 'true' || val === '1' || val === 'yes' || val === 'on') return true;
        if (val === 'false' || val === '0' || val === 'no' || val === 'off') return false;
    }
    if (typeof value === 'number') {
        return value !== 0;
    }
    return null;
}
export function parseDate(value) {
    if (value instanceof Date && !isNaN(value)) return value;
    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        if (!isNaN(parsed)) return parsed;
        return null;
    }
    return null;
}
export function parseJSON(value) {
    if (typeof value === 'object') return value;

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed;
        } catch (e) {
            return null;
        }
    }
    return null;
}
export function safeJSONParse(decrypted) {
    if (typeof decrypted !== 'string') {
        return null;
    }
    try {
        return JSON.parse(decrypted);
    } catch (e) {
        // Eğer JSON.parse hata verirse, değeri manuel olarak temizleyip tekrar dene
        const cleaned = decrypted
            .replace(/\\'/g, "'")  // Ters eğik çizgi ile kaçırılmış tek tırnakları düzelt
            .replace(/\\"/g, '"')  // Ters eğik çizgi ile kaçırılmış çift tırnakları düzelt
            .replace(/,\s*}/g, '}') // Virgül ile biten son öğeleri düzelt
            .replace(/,\s*]/g, ']'); // Virgül ile biten son öğeleri düzelt 
        const parsed = JSON.parse(cleaned);
        return parsed;
    }
}
export function safeJSONParseArray(decrypted) {
    if (typeof decrypted !== 'string') {
        return null;
    }

    try {
        const parsed = JSON.parse(decrypted);
        if (Array.isArray(parsed)) {
            return parsed;
        } else {
            return null;
        }
    } catch (e) {
        // Eğer JSON.parse hata verirse, değeri manuel olarak temizleyip tekrar dene
        const cleaned = decrypted
            .replace(/\\'/g, "'")  // Ters eğik çizgi ile kaçırılmış tek tırnakları düzelt
            .replace(/\\"/g, '"')  // Ters eğik çizgi ile kaçırılmış çift tırnakları düzelt
            .replace(/,\s*}/g, '}') // Virgül ile biten son öğeleri düzelt
            .replace(/,\s*]/g, ']'); // Virgül ile biten son öğeleri düzelt
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
            return parsed;
        } else {
            return null;
        }
    }
    // İkincisi de array değilse null döner 
    return null;
}

export function safeJSONParseObject(decrypted) {
    if (typeof decrypted !== 'string') {
        return null;
    }   
    try {
        const parsed = JSON.parse(decrypted);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed;
        }
        return null;
    } catch (e) {
        // Eğer JSON.parse hata verirse, değeri manuel olarak temizleyip tekrar dene
        const cleaned = decrypted
            .replace(/\\'/g, "'")  // Ters eğik çizgi ile kaçırılmış tek tırnakları düzelt
            .replace(/\\"/g, '"')  // Ters eğik çizgi ile kaçırılmış çift tırnakları düzelt
            .replace(/,\s*}/g, '}') // Virgül ile biten son öğeleri düzelt
            .replace(/,\s*]/g, ']'); // Virgül ile biten son öğeleri düzelt
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {       
            return parsed;
        } else {
            return null;
        }
    }
    // İkincisi de object değilse null döner
    return null;
}
export function safeJSONParseOrDefault(decrypted, defaultValue) {
    if (typeof decrypted !== 'string') {
        return defaultValue;
    }
    try {
        const parsed = JSON.parse(decrypted);
        return parsed;
    }
    catch (e) {
        // Eğer JSON.parse hata verirse, değeri manuel olarak temizleyip tekrar dene
        const cleaned = decrypted
            .replace(/\\'/g, "'")  // Ters eğik çizgi ile kaçırılmış tek tırnakları düzelt
            .replace(/\\"/g, '"')  // Ters eğik çizgi ile kaçırılmış çift tırnakları düzelt
            .replace(/,\s*}/g, '}') // Virgül ile biten son öğeleri düzelt
            .replace(/,\s*]/g, ']'); // Virgül ile biten son öğeleri düzelt
        const parsed = JSON.parse(cleaned);
        if (parsed === null || parsed === undefined) {
            return defaultValue;
        }
        return parsed;
    }
}
