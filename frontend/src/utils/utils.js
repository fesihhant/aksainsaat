export const formatPrice = (value) => {
    // Sayı ve nokta dışındaki karakterleri temizle
    let cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Birden fazla noktayı engelle
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
        cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Kuruş kısmını 2 basamakla sınırla
    if (parts.length === 2 && parts[1].length > 2) {
        cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Başındaki sıfırları temizle (0 ve 0. hariç)
    if (cleanValue.length > 1 && cleanValue[0] === '0' && cleanValue[1] !== '.') {
        cleanValue = cleanValue.replace(/^0+/, '');
    }

    return cleanValue;
};

export const formatCurrency = (value) => {
    if (!value) return '';
    // Sadece rakam ve nokta karakterlerini al
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Noktadan sonra en fazla iki basamak olacak şekilde formatla
    const parts = numericValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Binlik ayracı ekle
    return parts.join(',');
};
export const formatTL = (value) => {
  if (!value) return '';
  // Sadece rakam ve virgül/nokta kalsın
  const numeric = value.toString().replace(/[^\d.,]/g, '').replace(',', '.');
  const number = parseFloat(numeric);
  if (isNaN(number)) return '';
  return number.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 });
};

export const formatStock = (value) => {
    // Sayı dışındaki karakterleri temizle
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Başındaki sıfırları temizle
    const cleanValue = numericValue.replace(/^0+/, '') || '0';
    
    // Binlik ayracı ekle
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getPageIcon = (pageName) => {
    switch (pageName) {
        case 'products':
            return <i class='fas fa-toolbox'></i>;
        case 'categories':
            return <i class='fa-solid fa-icons'></i>;
        case 'users':
            return <i class='fa-solid fa-users-line'></i>;
        case 'orders':
            return 'order';
        case 'projects':
            return <i class='fa-solid fa-list-check'></i>;
        case 'references':
            return <i class='fas fa-book'></i>;
        case 'introductionBooklet':
            return <i class="'fa-solid fa-pen-to-square'"></i>;        
        case 'socialmediaList':
           return <i class='fa-solid fa-share-nodes'></i>;       
        case 'events':
           return <i class="fa-solid fa-calendar-check"></i>;
        default:
            return '';
    }
}

export const getPageTitleText = (pageName) => {
    switch (pageName) {
        case 'products':
            return 'Ürünler';
        case 'categories':
            return 'Kategoriler';
        case 'users':
            return 'Kullanıcılar';
        case 'orders':
            return 'Siparişler';
        case 'projects':
            return 'Projeler';
        case 'references':
            return 'Referanslar';
        case 'introductionBooklet':
            return 'Tanıtım Kitapçığı';
        case 'socialmediaList':
            return 'Sosyal Medya Hesapları';
        case 'events':
            return 'Etkinlikler'            
        default:
            return '';
    }
}

export function substringValue(htmlString, length) {
    // HTML etiketlerini kaldır
    const plainText = htmlString.replace(/<[^>]+>/g, '');
    // İlk "length" karakteri al
    return plainText.length > length ? plainText.substring(0, length) + "..." : plainText;
}
 

// // Telefon numarası formatlama fonksiyonu
export const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '').substring(0, 11); // Türkçe GSM için 11 hane
    if (digits.length < 4) return digits;
    if (digits.length < 7) 
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length < 10) 
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
}
//enums
export const categoryTypeEnum = {
    PROJECT:'685d36dc47089ae0b79408c7',
    USER: '685d36e547089ae0b79408cc',
    EVENT:'685d36ed47089ae0b79408d1',
    PRODUCT:'686294ac9d223a27cbc3aa14',
    DISTANCE:4
};

export const serverUrl = process.env.REACT_APP_IS_LOCAL === 'true' ? process.env.REACT_APP_LOCAL_URL : process.env.REACT_APP_SERVER_URL;
// export const serverUrl ='https://aksainsaat-server.onrender.com';
export const apiUrl = serverUrl + '/api';
export const apiUrlPath= (apiName) =>{
    return (apiUrl + '/' + apiName );
}

export const getFileUrl = (filePath) => {
    if (!filePath) return null;
    return `${serverUrl}/${filePath}`;
}

export const getSocialMedyaIcon = (name) => {
  const searchValue = `${name}`.toLowerCase();
  if (searchValue.includes('facebook')) return 'fa-facebook';
  if (searchValue.includes('instagram')) return 'fa-instagram';
  if (searchValue.includes('youtube')) return 'fa-youtube';
  if (searchValue.includes('linkedin')) return 'fa-linkedin';
  if (searchValue.includes('x-twitter') || searchValue.includes('twitter') || searchValue === 'x') return 'fa-x-twitter';
  if (searchValue.includes('twitch')) return 'fa-twitch';
  if (searchValue.includes('whatsapp')) return 'fa-whatsapp';
  return '';
};

export const getSocialMediaBgColor=(name) =>{
  const searchValue = `${name}`.toLowerCase();
  if (searchValue.includes('facebook')) return '#365493';
  if (searchValue.includes('instagram')) return '#ca860b';
  if (searchValue.includes('youtube')) return '#CB2027';
  if (searchValue.includes('linkedin')) return 'cadetblue';
  if (searchValue.includes('x-twitter') || searchValue.includes('twitter') || searchValue === 'x') return 'black';
  if (searchValue.includes('twitch')) return 'green';
  if (searchValue.includes('whatsapp')) return '#1ebea5';
}

export const ModalMessage = ({ message, type, onClose }) => {
    const modalClass = type === 'warning' ? 'modal-warning' : 'modal-info';

    return (
        <div className={`modal ${modalClass}`}>
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal-container">
                <div className="modal-header">
                    <h5 className="modal-title">{type === 'warning' ? 'Warning' : 'Information'}</h5>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-content">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};


export const editorModules = () => {
    return {
        toolbar: [
            [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
            [{size: []}],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, 
            {'indent': '-1'}, {'indent': '+1'}],
            [{ 'color': [] }, { 'background': [] }], // <-- renk ve arka plan ekledik
            ['link', 'image', 'video'],
            ['clean']
        ],
        clipboard: {
            matchVisual: false,
        }
    }
}

export const editorFormats = () => {
    return [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'color', 'background' // <-- renk ve arka plan ekledik
    ]   
}

export function getCurrencySymbol(type) {
    switch (type) {
        case 'TRY': return '₺';
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'JPY': return '¥';
        default: return '';
    }
}
export function getCurrencyTypeOptions() {
    return [
        { value: 'TRY', label: 'Türk Lirası (₺)' },
        { value: 'USD', label: 'Amerikan Doları ($)' },
        { value: 'EUR', label: 'Euro (€)' },
        { value: 'GBP', label: 'İngiliz Sterlini (£)' },
        { value: 'JPY', label: 'Japon Yeni (¥)' }
    ];
}

export function getYoutubeEmbedUrl(url) {
    if (!url) return '';
    // youtube.com/watch?v=... veya youtu.be/... formatını embed'e çevir
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1`;
    }
    return url; // Diğer video kaynakları için orijinal url
}
   
