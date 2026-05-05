import { useState, useEffect, useCallback } from 'react';
import {useNavigate, useParams } from 'react-router-dom';

import DatePicker from 'react-datepicker'; // react-datepicker kütüphanesini kullanıyoruz
import { tr } from 'date-fns/locale/tr';
import 'react-datepicker/dist/react-datepicker.css'; // CSS dosyasını ekliyoruz

import Breadcrumbs from '../public/Breadcrumbs';
import CCrousel from '../../components/htmlComponent/CCrousel';
import VideoPlayer from '../../components/htmlComponent/VideoPlayer';

import '../../css/NewProduct.css';
import { Checkbox } from '@mui/material';
import { formatPrice, categoryTypeEnum, serverUrl , apiUrl,getCurrencySymbol, getCurrencyTypeOptions,
    editorModules, editorFormats,getYoutubeEmbedUrl
 } from '../../utils/utils';
import { apiRequest, invalidateApiCacheMany } from '../../utils/apiCalls';
import TextAreaComponent from '../../components/htmlComponent/TextAreaComponent';
 
const EditProject = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isActive, setIsActive] = useState(true); // Status checkbox için state
    const [isVisibleCost, setIsVisibleCost] = useState(false); // Status checkbox için state
    const [images, setImages] = useState([]); // Sadece yeni yüklenen File objeleri
    const [imagePreviews, setImagePreviews] = useState([]); // Hem mevcut hem yeni resimlerin preview'ları
    const [existingImages, setExistingImages] = useState([]); // Mevcut resim URL'leri (veritabanından gelen)
    const [previewToImageMap, setPreviewToImageMap] = useState(new Map()); // Preview URL'den File objesine mapping
    const [videoFiles, setVideoFiles] = useState([]);
    const [videoPreviews, setVideoPreviews] = useState([]);

    const [categories, setCategories] = useState([]); // Faaliyet türleri için state
    const [formData, setFormData] = useState({
        name: '',
        typeofActivityId: '',
        description: '',
        statusType: 'true',
        projectCost: '',
        isVisibleCost: false,
        startDate: '',
        endDate: '',
        imageUrls: [],
        videoUrls: []
    });


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');

            const categoryTypeId = categoryTypeEnum.PROJECT; // Faaliyet türü için ID
            const baseUrl = `${apiUrl}/categories/categorytypes`;
            const response = await fetch(`${baseUrl}/?categoryTypeId=${categoryTypeId}`);

            const data = await response.json();
            if (data.success) {
                setCategories(data.categories); // Kategorileri state'e kaydet
            } else {
                console.error('Kategori verileri alınamadı:', data.message);
            }
        } catch (error) {
            console.error('Kategori verileri alınırken hata:', error);
        }
    }, []);

    // Proje verilerini getirme
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/projects/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setFormData(data.project);
                setIsActive(data.project.statusType === 'true'); // Checkbox durumunu ayarla
                setIsVisibleCost(data.project.isVisibleCost === 'true'); // Checkbox durumunu ayarla
                
                // Tarihleri ayarla
                if (data.project.startDate) {
                    setStartDate(new Date(data.project.startDate));
                }
                if (data.project.endDate) {
                    setEndDate(new Date(data.project.endDate));
                }

                if (data.project.imageUrls && data.project.imageUrls.length > 0) {
                    const imageUrls = data.project.imageUrls.map(url => `${serverUrl}${url}`);
                    setExistingImages(imageUrls); // Mevcut resimleri ayrı state'te tut
                    setImagePreviews(imageUrls); // Preview'ları ayarla
                    setImages([]); // Yeni resimler için boş başlat
                } else {
                    setExistingImages([]);
                    setImages([]);
                    setImagePreviews([]);
                    setPreviewToImageMap(new Map());
                }
                if (data.project.videoUrls && data.project.videoUrls.length > 0) {
                    setVideoFiles(data.project.videoUrls.map(url => ({ name: url.split('/').pop(), url: `${serverUrl}${url}` }))); // Video dosyalarını ayarlıyoruz
                    setVideoPreviews(data.project.videoUrls.map(url => ({ name: url.split('/').pop(), url: `${serverUrl}${url}` }))); // Video önizlemelerini ayarlıyoruz
                } else {
                    setVideoPreviews([]);
                }
            } else {
                setError(data.message || 'Proje bilgileri yüklenemedi');
            }
        } catch (error) {
            console.error('Proje bilgileri getirme hatası:', error);
            setError(error.message || 'Sunucu bağlantısı başarısız');
            // Hata durumunda NotFound sayfasına yönlendirme yerine hata mesajı göster
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchCategories();

        if (id) {
            fetchData();
        } else {
            setFormData({
                name: '',
                statusType: '',
                description: '',
                projectCost: '',
                typeofActivityId: '',
                startDate: '',
                endDate: '',
                imageUrls: [],
                videoUrls: []
            });
            setExistingImages([]);
            setImages([]);
            setImagePreviews([]);
            setPreviewToImageMap(new Map());
        }
    }, [id, navigate, fetchCategories, fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Price alanı için parasal değer kontrolü
        if (name === 'projectCost') {
            const formattedPrice = formatPrice(value);
            setFormData(prev => ({
                ...prev,
                [name]: formattedPrice
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                setError('Resim boyutu 5MB\'dan küçük olmalıdır');
                return false;
            }
            if (!file.type.startsWith('image/')) {
                setError('Lütfen geçerli bir resim dosyası seçin');
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            // Yeni resimleri mevcut resimlere ekle
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            const newMap = new Map();
            validFiles.forEach((file, index) => {
                newMap.set(newPreviews[index], file);
            });
            
            setImages(prev => [...prev, ...validFiles]);
            setPreviewToImageMap(prev => {
                const updated = new Map(prev);
                newMap.forEach((file, preview) => updated.set(preview, file));
                return updated;
            });
            // Preview'ları güncelle: mevcut resimler + yeni resimler
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
        setError('');
        // Input'u temizle ki aynı dosya tekrar seçilebilsin
        e.target.value = '';
    };

    const handleVideoChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            // ör: maksimum 100MB toplam veya tekil limit isteğe göre değiştirilebilir
            if (file.size > 100 * 1024 * 1024) {
                setError('Video boyutu 100MB\'dan küçük olmalıdır');
                return false;
            }
            if (!file.type.startsWith('video/')) {
                setError('Lütfen geçerli bir video dosyası seçin');
                return false;
            }
            return true;
        });

        setVideoFiles(validFiles);
        // video preview için blob url veya isim gösterebilirsin
        setVideoPreviews(validFiles.map(f => ({ name: f.name, url: URL.createObjectURL(f) })));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const formDataToSend = new FormData();
            
            if (videoFiles.length > 0) {
                // toplam boyut kontrol istersen buraya ekle
                videoFiles.forEach(video => {
                    // Eğer video bir File objesi ise direkt ekle, değilse url'den File oluştur
                    if (video instanceof File) {
                        formDataToSend.append('videos', video);
                    } else if (video.url) {
                        // Mevcut video URL'i, backend'de korunacak
                        // Yeni video dosyaları için File objesi gerekli
                    }
                });
            }
            if (formData?._id) {
                formDataToSend.append('id', formData._id); // Güncelleme için ID
                // Silinen mevcut resimleri backend'e bildir
                if (existingImages.length > 0) {
                    // Mevcut resimlerden hangilerinin korunacağını gönder
                    const keptImages = imagePreviews
                        .filter(preview => typeof preview === 'string' && preview.startsWith('http') && existingImages.includes(preview.replace(serverUrl, '')))
                        .map(preview => {
                            // URL'den relative path'i çıkar
                            return preview.replace(serverUrl, '');
                        });
                    formDataToSend.append('keptImages', JSON.stringify(keptImages));
                }
            }
            if (images.length > 0) {
                // Sadece File objelerini kontrol et (yeni yüklenen resimler)
                const totalSize = images
                    .filter(img => img instanceof File)
                    .reduce((sum, img) => sum + img.size, 0);
                
                if (totalSize > 5 * 1024 * 1024) {
                    setError('Toplam resim boyutu 5MB\'dan küçük olmalıdır');
                    setLoading(false);
                    return;
                }
                
                // Sadece File objelerini gönder
                images
                    .filter(img => img instanceof File)
                    .forEach(image => formDataToSend.append('images', image));
            }
            formDataToSend.append('typeofActivityId', formData.typeofActivityId._id || formData.typeofActivityId);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('statusType', isActive ? 'true' : 'false'); // Checkbox durumu
            formDataToSend.append('projectCost', Number(formData.projectCost) || 0); // Proje maliyeti
            formDataToSend.append('isVisibleCost', isVisibleCost ? 'true' : 'false'); // Checkbox durumu
            formDataToSend.append('currencyType', formData.currencyType || 'TRY'); // Varsayılan olarak TRY
            formDataToSend.append('startDate', startDate ? startDate.toISOString() : '');
            formDataToSend.append('endDate', endDate ? endDate.toISOString() : null);
            formDataToSend.append('youtubeUrl', formData.youtubeUrl || '');

            const url = formData?._id
                ? `/projects/${formData._id}` // Güncelleme için PUT
                : '/projects'; // Yeni proje için POST
            const method = formData?._id ? 'PUT' : 'POST';

            const data = await apiRequest(method, url, formDataToSend, {
                isToken: true,
                timeoutMs: 60000,
                retry: 1,
                retryDelayMs: 500,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                invalidateApiCacheMany([
                    { method: 'GET', urlPrefix: '/projects' },
                    { method: 'GET', urlPrefix: '/projects/projectList' }
                ]);
                navigate('/projects'); // Projeler sayfasına yönlendirme
            } else {
                setError(data.message || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Form gönderme hatası:', error);
            setError(error.message || 'Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    };

    // Loading durumunda göster
    if (loading && !formData.name) {
        return (
            <div className="home-container">
                <div className="main-content">
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div>Yükleniyor...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs />
                <form id="productForm" onSubmit={handleSubmit} className="new-product-form">
                    <div className="page-header">
                        {/* <h1 className='headerClass'>{formData ? 'Proje Düzenle' : 'Yeni Proje'}</h1> */}
                        <div className="form-actions">
                            <button
                                type="submit"
                                form="productForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (formData?._id ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="cancel-button"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                    <hr></hr>
                    <br></br>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="name">Proje Adı</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="typeofActivityId">Faaliyet Türü</label>
                        <select
                            id="typeofActivityId"
                            name="typeofActivityId"
                            value={formData.typeofActivityId._id || formData.typeofActivityId}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Seçiniz</option>
                            {
                                categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="projectCost">Maliyeti</label>
                            <input
                                type="text"
                                id="projectCost"
                                name="projectCost"
                                value={formData.projectCost}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                pattern="^\d*\.?\d{0,2}$"
                                inputMode="decimal"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="currencyType">Para Birimi</label>
                            <select
                                id="currencyType"
                                name="currencyType"
                                value={formData.currencyType || 'TRY'}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Seçiniz</option>
                                {
                                    getCurrencyTypeOptions().map((currency) => (
                                        <option key={currency.value} value={currency.value}>
                                            {getCurrencySymbol(currency.value)}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="isVisibleCost">Maliyet Görünsün mü?</label>
                            <Checkbox style={{ height: '24px', maxWidth: '24px'}}
                                type="checkbox"
                                id="isVisibleCost"
                                name="isVisibleCost"
                                checked={isVisibleCost}
                                value={formData.isVisibleCost}
                                onChange={(e) => setIsVisibleCost(e.target.checked)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="statusType">Proje Aktif mi?</label>
                            <Checkbox style={{ height: '24px', maxWidth: '24px'}}
                                type="checkbox"
                                id="statusType"
                                name="statusType"
                                checked={isActive}
                                value={formData.statusType}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startDate">Başlama Tarihi</label>
                             <DatePicker
                                required
                                isClearable
                                showYearDropdown={true}
                                showMonthDropdown={true}
                                dropdownMode="select"
                                locale={tr}
                                calendarIconClassname={"calendar-icon"}
                                dateFormat="dd/MM/yyyy"
                                selected={startDate}
                                maxDate={new Date()} // Bugünden önceki tarihleri seçememek için
                                onChange={(date) => setStartDate(date)} />
                        </div>
                        {!isActive && (
                        <div className="form-group">
                            <label htmlFor="endDate">Bitiş Tarihi</label>
                            <DatePicker
                                required
                                isClearable
                                showYearDropdown={true}
                                showMonthDropdown={true}
                                dropdownMode="select"
                                locale={tr}
                                calendarIconClassname={"calendar-icon"}
                                dateFormat="dd/MM/yyyy"
                                selected={endDate}
                                minDate={startDate} // Başlama tarihinden sonra bir tarih seçilmesini sağlıyoruz
                                endDate={startDate} // Bugünden önceki tarihleri seçememek için
                                maxDate={new Date()} // Bugünden önceki tarihleri seçememek için
                                onChange={(date) => setEndDate(date)}
                            />
                        </div>)
                        }
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Açıklama</label> 
                        <TextAreaComponent
                            field={{
                                name: 'description',
                                placeholder: 'Açıklama giriniz...',
                                required: true
                            }}
                            value={formData.description}
                            onBlur={value => setFormData((prev) => ({ ...prev, description: value }))}
                        />  
                    </div>
                    <div className="form-group">
                        <label htmlFor="images">Proje Görselleri</label>
                        <div className="avatar-options">
                            <div className="upload-section">
                                <label htmlFor="images" className="upload-label" style={{ textAlign: 'center',width: '100%',color: 'white' }}>
                                    Resim Yükle
                                    <input
                                        type="file"
                                        id="images"
                                        multiple // Eğer birden fazla resim yüklemek istiyorsanız burayı açabilirsiniz.
                                        name='images'
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                            <div >
                            {imagePreviews && imagePreviews.length > 0 && (
                                <div>
                                    <CCrousel imageList={imagePreviews} />
                                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {imagePreviews.map((preview, index) => {
                                            const isExistingImage = typeof preview === 'string' && preview.startsWith('http') && existingImages.includes(preview);
                                            const isNewImage = typeof preview === 'string' && preview.startsWith('blob:');
                                            
                                            return (
                                                <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                                                    <img 
                                                        src={preview} 
                                                        alt={`Preview ${index}`}
                                                        style={{ 
                                                            width: '100px', 
                                                            height: '100px', 
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                            border: '2px solid #ddd'
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (isExistingImage) {
                                                                // Mevcut resmi kaldır
                                                                setExistingImages(prev => prev.filter(url => url !== preview));
                                                            } else if (isNewImage) {
                                                                // Yeni resmi kaldır - blob URL'i revoke et
                                                                URL.revokeObjectURL(preview);
                                                                // İlgili File objesini bul ve kaldır
                                                                const fileToRemove = previewToImageMap.get(preview);
                                                                if (fileToRemove) {
                                                                    setImages(prev => prev.filter(img => img !== fileToRemove));
                                                                    setPreviewToImageMap(prev => {
                                                                        const updated = new Map(prev);
                                                                        updated.delete(preview);
                                                                        return updated;
                                                                    });
                                                                }
                                                            }
                                                            // Preview'dan kaldır
                                                            setImagePreviews(prev => prev.filter((_, i) => i !== index));
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-5px',
                                                            right: '-5px',
                                                            background: 'red',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '24px',
                                                            height: '24px',
                                                            cursor: 'pointer',
                                                            fontSize: '16px',
                                                            lineHeight: '1',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title="Resmi Sil"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <small style={{ color: 'gray' }}>Maksimum resim boyutu: 5MB</small><br></br>
                        <small style={{ color: 'gray' }}>Yüklenen resimler otomatik olarak  yenilenecektir.</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="videoUrls">Proje Videoları (Opsiyonel)</label>
                        <div className="avatar-options">
                            <div className="upload-section">
                                <label className="upload-label" style={{ textAlign: 'center', width: '100%', color: 'white' }}>
                                    Video Yükle
                                    <input
                                        type="file"
                                        id="videos"
                                        name="videos"
                                        multiple
                                        onChange={handleVideoChange}
                                        accept="video/*"
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>

                            {/* Yüklenen video dosyalarının preview'ı */}
                            {videoPreviews && videoPreviews.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <h4>Yüklenen Videolar:</h4>
                                    {videoPreviews.map((v, i) => (
                                        <div key={i} style={{ marginBottom: 6 }}>
                                            <span>✓ {v.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Veritabanından gelen videoların oynatılması */}
                            {formData.videoUrls && formData.videoUrls.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <h4>Proje Videoları:</h4>
                                    <VideoPlayer
                                        videoList={formData.videoUrls}
                                        serverUrl={serverUrl}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="youtubeUrl">Youtube Video URL (Opsiyonel)</label>
                        <div className="avatar-options">
                        <input
                            type="text"
                            id="youtubeUrl"
                            name="youtubeUrl"
                            value={formData.youtubeUrl}
                            onChange={handleInputChange}
                        />
                        <br></br>
                        {formData.youtubeUrl && formData.youtubeUrl.trim() !== '' && (
                        <div className="video-container">
                            <iframe
                                width="100%"
                                height="400"
                                src={getYoutubeEmbedUrl(formData.youtubeUrl)}
                                title="Project Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProject;
