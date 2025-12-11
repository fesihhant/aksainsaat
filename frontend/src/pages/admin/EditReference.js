import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../public/Breadcrumbs';
import { apiUrl, serverUrl } from '../../utils/utils';
import '../../css/HomePage.css';

const EditReference = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: '',
        webLink:'',
        description: ''
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${apiUrl}/references/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setFormData({
                    name: data.reference.name || '',
                    webLink: data.reference.webLink || '',
                    description: data.reference.description || ''
                });

                if (data.reference.imageUrl) {
                    setImagePreview(`${serverUrl}${data.reference.imageUrl}`);
                }
            } else {
                setError(data.message || 'Referans bilgileri yüklenemedi');
            }
        } catch (error) {
            console.error('Referans bilgileri getirme hatası:', error);
            setError(error.message || 'Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) {
            fetchData();
        } else {
            setFormData({
                name: '',
                webLink:'',
                description: ''
            });
            setImage(null);
            setImagePreview(null);
        }
    }, [id, fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Resim boyutu 5MB\'dan küçük olmalıdır');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Lütfen geçerli bir resim dosyası seçin');
                return;
            }

            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
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
    
            // Form verilerini hazırlama
            const formDataToSend = new FormData();
            if (id) {
                formDataToSend.append('id', id); // Güncelleme için ID
            }
            formDataToSend.append('name', formData.name);
            formDataToSend.append('webLink',formData.webLink);
            formDataToSend.append('description', formData.description);
            if (image) {
                formDataToSend.append('image', image); // Resim dosyası
            }
    
            // API URL'sini belirleme
            const url = id
                ? `${apiUrl}/references/${id}` // Güncelleme için PUT
                : `${apiUrl}/references`; // Yeni ürün için POST
    
            // API çağrısı
            const response = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend,
            });
    
            const data = await response.json();
    
            if (data.success) {
                navigate('/references'); // Referanslar sayfasına yönlendirme
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
    
    const pathnames = [
        {
          path: 'Referanslar',
          link: '/references',
        },
        {
          path: (id ? 'Referansı Düzenle' : 'Yeni Referans'),
          link: '',
        }
    ];

    // Loading durumunda göster
    if (loading && !formData.name && id) {
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
                <Breadcrumbs breadcrumbs={pathnames} />
                <form id="pageForm" onSubmit={handleSubmit} className="new-product-form">
                    <div className="page-header">
                        {/* <h1 className='headerClass'>{id ? 'Referans Düzenle' : 'Yeni Referans'}</h1> */}
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="pageForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (id ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/references')}
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
                        <label htmlFor="name">Referans Adı</label>
                        <input
                            className='varible-input'
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="webLink">web Link</label>
                        <input
                            id="webLink"
                            type='text'
                            name="webLink"
                            value={formData.webLink}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Açıklama</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Referans Görseli</label>
                        <div className="avatar-options">
                            <div className="upload-section">
                                <label htmlFor="image" className="upload-label" style={{ textAlign: 'center',width: '100%',color: 'white' }}>
                                    Resim Yükle
                                    <input
                                        type="file"
                                        id="image"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />                                    
                                </label>                                
                                {imagePreview && (
                                    <div className="image-preview">
                                        <img loading="lazy" src={imagePreview} alt="Referans önizleme" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditReference;
