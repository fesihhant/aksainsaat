// Tüm renderCell işlemleri için güvenli wrapper
import { substringValue } from './utils';

// ...existing code...
// Güvenli nested erişim
const getNested = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((cur, key) => (cur ? cur[key] : undefined), obj);
};

// relationPath: 'typeofActivityId' veya 'typeofActivityId.name' gibi
// displayField: relation nesnesinden gösterilecek alan (default 'name')
// lookupMap: eğer relation sadece id ise id->displayValue map (object veya Map) verilebilir
// defaultText: yoksa döndürülecek metin
export const createRelatedValueGetter = (relationPath, displayField = 'name', lookupMap = null, defaultText = 'Belirtilmemiş') => {
    return (params) => {
        const row = params?.row;
        if (!row) return defaultText;

        // Eğer relationPath direkt olarak 'typeofActivityId.name' verilmişse
        if (relationPath.includes('.')) {
            const val = getNested(row, relationPath);
            return (val !== undefined && val !== null && val !== '') ? val : defaultText;
        }

        const rel = getNested(row, relationPath);
        if (!rel) return defaultText;

        // Eğer relation populate edilmiş bir obje ise
        if (typeof rel === 'object') {
            const val = rel[displayField];
            return (val !== undefined && val !== null && val !== '') ? val : defaultText;
        }

        // Eğer relation primitive id ise lookupMap ile eşle
        if (lookupMap) {
            if (lookupMap instanceof Map) {
                const v = lookupMap.get(rel);
                if (v !== undefined) return v;
            } else if (typeof lookupMap === 'object') {
                const v = lookupMap[rel];
                if (v !== undefined) return v;
            }
        }

        return defaultText;
    };
};

export const createSafeRenderCell = (renderer, maxLength = 0) => {
    return (params) => {
        if (!params || !params.row) return null; // <-- güvenlik kontrolü
        try {
            // maxLength varsa value'yi truncate et (örnek)
            if (maxLength > 0 && params.value && typeof params.value === 'string') {
                // substringValue fonksiyonunu kullan
                const { substringValue } = require('./utils');
                params.value = substringValue(params.value, maxLength);
            }
            return renderer(params);
        } catch (error) {
            console.error('RenderCell hatası:', error);
            return null;
        }
    };
};
// Text column için - substring ile
export const createTextRender = (fieldName = 'name', maxLength = 0) => {
    return createSafeRenderCell((params) => {
        const value = params.row[fieldName];
        if (!value) return null;
        
        const displayValue = maxLength > 0 && typeof value === 'string' 
            ? substringValue(value, maxLength)
            : value;
            
        return <span>{displayValue}</span>;
    }, maxLength);
};
// Avatar column için özel render
export const createAvatarRender = (serverUrl) => {
    return createSafeRenderCell((params) => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
                src={params.row.avatar ? `${serverUrl}${params.row.avatar}` : `${serverUrl}/uploads/avatars/default.jpg`}
                alt={params.row.fullName || 'Avatar'}
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                onError={(e) => {
                    console.error('Avatar yükleme hatası:', e);
                    e.target.src = `${serverUrl}/uploads/avatars/default.jpg`;
                }}
            />
        </div>
    ));
};

export const createImageRender = (serverUrl) => {
    return createSafeRenderCell((params) => (
        
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {params.value ? 
                (
                    <img
                        src={`${serverUrl}${Array.isArray(params.value) ? params.value[0]: params.value}`}
                        alt={params.row.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                ) : 
                (
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f5f5f5', borderRadius: '4px' }} />
                )
            }
        </div>
    ));
};

// Status column için render (Aktif/Pasif)
export const createStatusRender = (fieldName = 'isActivated') => {
    return createSafeRenderCell((params) => (
        <span style={{ color: params.row[fieldName] ? 'green' : 'red' }}>
            {params.row[fieldName] ? 'Aktif' : 'Pasif'}
        </span>
    ));
};

// Tarih formatlama için render
export const createDateRender = (fieldName = 'createdAt', locale = 'tr-TR') => {
    return createSafeRenderCell((params) => {
        if (!params?.row) return null;
        const dateValue = params.row[fieldName];
        if (!dateValue) return null;
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    });
};

// Time formatlama için render
export const createTimeRender = (fieldName = 'time', locale = 'tr-TR') => {
    return createSafeRenderCell((params) => {
        if (!params.row) return null;
        const date = params.row[fieldName];
        if (!date) return null;
        return new Date(date).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
    });
};

// Link render (email, website, vb)
export const createLinkRender = (fieldName = 'email', href = null) => {
    return createSafeRenderCell((params) => {
        const value = params.row[fieldName];
        if (!value) return null;
        return (
            <a 
                style={{ fontWeight: 'bold', color: '#003da6', cursor: 'pointer', textDecoration: 'none' }}
                href={href ? href(params.row) : `mailto:${value}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {value}
            </a>
        );
    });
};

// Actions column için render
export const createActionsRender = (actions) => {
    return createSafeRenderCell((params) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            {actions.map((action, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', height:'48px' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(params.row);
                        }}
                        disabled={action.disabled ? action.disabled(params.row) : false}
                        style={{
                            backgroundColor: action.color || '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: action.disabled && action.disabled(params.row) ? 'not-allowed' : 'pointer',
                            opacity: action.disabled && action.disabled(params.row) ? 0.5 : 1
                        }}
                    >
                        {action.label}
                    </button>
                </div>
            ))}
        </div>
    ));
};