import { useState, useEffect, useCallback } from 'react';
import {useNavigate, useParams } from 'react-router-dom';

import DatePicker from 'react-datepicker'; // react-datepicker kütüphanesini kullanıyoruz
import { tr } from 'date-fns/locale/tr';
import 'react-datepicker/dist/react-datepicker.css'; // CSS dosyasını ekliyoruz

import Breadcrumbs from '../public/Breadcrumbs';
import CCrousel from '../../components/htmlComponent/CCrousel';

import '../../css/NewProduct.css';
import { Checkbox } from '@mui/material';
import { formatPrice, categoryTypeEnum, serverUrl , apiUrl,getCurrencySymbol, getCurrencyTypeOptions,
    getYoutubeEmbedUrl} from '../../utils/utils';
import { apiRequest, invalidateApiCacheMany } from '../../utils/apiCalls';
import TextAreaComponent from '../../components/htmlComponent/TextAreaComponent';
import {VideoPlayer} from '../../components/htmlComponent/VideoPlayer';
import Loading from '../../components/htmlComponent/Loading';
import { message } from 'antd';

const EditProject = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isActive, setIsActive] = useState(true); // Status checkbox için state
    const [isVisibleCost, setIsVisibleCost] = useState(false); // Status checkbox için state
    const [images, setImages] = useState([]); // Sadece yeni yüklenen File objeleri
    const [videoFiles, setVideoFiles] = useState([]);

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
                    setImages(imageUrls); // Yeni resimler için boş başlat
                } else {
                    setImages([]);
                }
                if (data.project.videoUrls && data.project.videoUrls.length > 0) {
                    const videoUrls = data.project.videoUrls.map(video => `${serverUrl}${video}`);
                    setVideoFiles(videoUrls); // Yeni videolar için boş başlat
                } else {
                    setVideoFiles([]);
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
            setImages([]);
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
            if (!file.type.startsWith('image/')) {
                setError('Lütfen geçerli bir resim dosyası seçin');
                return false;
            }
            return true;
        });

        // Mevcut resimler içinde File olanları bul
        const existingImageSize = images
        .filter(img => img instanceof File) // sadece File nesneleri
        .reduce((sum, file) => sum + file.size, 0);

        // Yeni seçilen dosyaların boyutunu hesapla
        const newImageSize = files.reduce((sum, file) => sum + file.size, 0);

        // Toplam boyut
        const totalSize = existingImageSize + newImageSize;

        if (totalSize > 200 * 1024 * 1024) {
            message.error("Toplam resim boyutu 200MB'tan küçük olmalıdır");
            setError("Toplam resim boyutu 200MB'tan küçük olmalıdır");
            return;
        }

        if (validFiles.length > 0) { 
            setImages(prev => [...prev, ...validFiles]);
        }
        setError('');
        // Input'u temizle ki aynı dosya tekrar seçilebilsin
        e.target.value = '';
    };

    const handleVideoChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('video/')) {
                setError('Lütfen geçerli bir video dosyası seçin');
                return false;
            }
            return true;
        });
        const existingVideoSize = videoFiles
        .filter(video => video instanceof File) // sadece File nesneleri
        .reduce((sum, file) => sum + file.size, 0);
        const newVideoSize = files.reduce((sum, file) => sum + file.size, 0);
        const totalVideoSize = existingVideoSize + newVideoSize;

        if (totalVideoSize > 1500 * 1024 * 1024) {
            message.error("Toplam video boyutu 1500MB'tan küçük olmalıdır");
            setError("Toplam video boyutu 1500MB'dan küçük olmalıdır");
            return;
        }

        if (validFiles.length > 0) {
            setVideoFiles(prev => [...prev, ...validFiles]);
        }
        setError('');
        e.target.value = '';
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

            if (formData.name.trim() === '') {
                setError('Proje adı boş bırakılamaz');
                setLoading(false);
                return;
            }
            if (formData.description.trim() === '') {
                setError('Açıklama alanı boş bırakılamaz');
                setLoading(false);
                return;
            }
            if (formData?._id) {
                formDataToSend.append('id', formData._id); // Güncelleme için ID
                // Silinen mevcut resimleri backend'e bildir
                if (images.length > 0) {
                    // Mevcut resimlerden hangilerinin korunacağını gönder
                    const keptImages = images
                        .filter(preview => typeof preview === 'string' && preview.startsWith('http'))
                        .map(preview => {
                            // URL'den relative path'i çıkar
                            return preview.replace(serverUrl, '');
                        });
                    
                    formDataToSend.append('keptImages', JSON.stringify(keptImages));
                }else {
                    formDataToSend.append('keptImages', JSON.stringify([]));
                }

                if (videoFiles && videoFiles.length > 0) {
                    // Sadece mevcut (URL'si http ile başlayan) videoları bul
                    const keptVideos = videoFiles
                        .filter(preview => typeof preview === 'string' && preview.startsWith('http'))
                        .map(preview => {
                            return preview.replace(serverUrl, '');
                        });
                    formDataToSend.append('keptVideos', JSON.stringify(keptVideos));
                }else {
                    formDataToSend.append('keptVideos', JSON.stringify([]));
                }
            }
            
            if (images.length > 0) {
                // Sadece File objelerini kontrol et (yeni yüklenen resimler)
                const totalSize = images
                    .filter(img => img instanceof File)
                    .reduce((sum, img) => sum + img.size, 0);
                
                if (totalSize > 200 * 1024 * 1024) {
                    message.error("Toplam resim boyutu 200MB'tan küçük olmalıdır");
                    setError("Toplam resim boyutu 200MB'tan küçük olmalıdır");
                    setLoading(false);
                    return;
                }
                
                // Sadece File objelerini gönder
                images.forEach(image => {
                    if (image instanceof File) {
                        formDataToSend.append('images', image); 
                    }
                });
            }else {
                setError('En az bir resim yüklemeniz gerekmektedir');
                setLoading(false);
                return;
            }
            if (videoFiles.length > 0) {
                // toplam boyut kontrol istersen buraya ekle
                const totalVideoSize = videoFiles
                    .filter(video => video instanceof File)
                    .reduce((sum, video) => sum + video.size, 0);

                if (totalVideoSize > 1500 * 1024 * 1024) {
                    message.error("Toplam video boyutu 1500MB'tan küçük olmalıdır");
                    setError("Toplam video boyutu 1500MB'tan küçük olmalıdır");
                    setLoading(false);
                    return;
                }
                videoFiles.forEach((video, index) => {
                    if (video instanceof File) {
                        formDataToSend.append('videos', video); 
                    } 
                });
            }
            formDataToSend.append('typeofActivityId', formData.typeofActivityId._id || formData.typeofActivityId);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description || '');
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
            setError(error.message || 'Sunucu bağlantısı başarısız' + error.message);
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
                        <Loading />
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
                                disabled={loading}
                            >
                                {loading ? '...' : 'İptal'}
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
                                required={isVisibleCost === true? true : false}
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
                            <label>Başlama Tarihi</label>
                             <DatePicker 
                                isClearable
                                showYearDropdown={true}
                                showMonthDropdown={true}
                                dropdownMode="select"
                                locale={tr}
                                calendarIconClassName={"calendar-icon"}
                                dateFormat="dd/MM/yyyy"
                                selected={startDate}
                                maxDate={new Date()} // Bugünden önceki tarihleri seçememek için
                                onChange={(date) => setStartDate(date)} />
                        </div>
                        {!isActive && (
                        <div className="form-group">
                            <label htmlFor="endDate">Bitiş Tarihi</label>
                            <DatePicker
                                name="endDate"
                                isClearable
                                showYearDropdown={true}
                                showMonthDropdown={true}
                                dropdownMode="select"
                                locale={tr}
                                calendarIconClassName={"calendar-icon"}
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
                        <label>Açıklama</label> 
                        <TextAreaComponent
                            field={{
                                name: 'description',
                                placeholder: 'Açıklama giriniz...',
                                required: true
                            }}
                            // fieldErrors={formData.description ? null : { description: 'Açıklama alanı zorunludur' }}
                            value={formData.description}
                            onBlur={value => setFormData((prev) => ({ ...prev, description: value }))}
                        />  
                    </div>
                    <div className="form-group">
                        <label htmlFor="images">Proje Görselleri</label>
                        <div className="avatar-options">
                            <div className="upload-section">
                                <label htmlFor="images" className="submit-button" >
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
                            {images && images.length > 0 && (

                                <div>
                                    <CCrousel imageList={images} />
                                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {images.map((preview, index) => {
                                            const isExistingImage = typeof preview === 'string' && preview.startsWith('http') && images.includes(preview);
                                            const isNewImage = preview instanceof File;
                                            const previewUrl = isExistingImage ? preview : (isNewImage ? URL.createObjectURL(preview) : null);
                                            return (
                                                <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                                                    <img 
                                                        src={previewUrl} 
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
                                                                setImages(prev => prev.filter(url => url !== preview));
                                                            } else if (isNewImage) {
                                                                // Yeni resmi kaldır - blob URL'i revoke et
                                                                URL.revokeObjectURL(preview);
                                                                // İlgili File objesini bul ve kaldır
                                                                const fileToRemove = images.find(img => img === preview);
                                                                if (fileToRemove) {
                                                                    setImages(prev => prev.filter(img => img !== fileToRemove));
                                                                }
                                                            }
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
                        <label>Not:</label>
                        <small style={{ color: 'gray' }}>Maksimum resim boyutu: 200MB, yüklenen resimler otomatik olarak  yenilenecektir.</small> 
                    </div>
                    <div className="form-group">
                        <label htmlFor="videos">Proje Videoları (Opsiyonel) </label>
                        <div className="avatar-options">
                            <div className="upload-section">
                                <label className="submit-button" >
                                    Video Yükle
                                    <input
                                        type="file"
                                        id="videos"
                                        name="videos"
                                        multiple
                                        onChange={handleVideoChange}
                                        accept="video/mp4"
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>
                            {/* Yüklenen video dosyalarının preview'ı */}
                            <VideoPlayer videoList={videoFiles} setVideoFiles={setVideoFiles} />                             
                        </div>
                    </div>                    
                    <div className="form-group">
                        <label >Not:</label>
                        <small style={{ color: 'gray' }}>Maksimum video boyutu: 1.5GB, yüklenen videolar otomatik olarak  yenilenecektir.</small>
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
