import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../public/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import '../../css/EditUser.css';
import { useApiCall } from '../../utils/apiCalls';
import { apiUrl } from '../../utils/utils';


const EditCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        categoryTypeId: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    
    const [categoryTypes, setCategoryTypes]= useState([]);
    const { apiData, apiError, apiLoading } = useApiCall('/categoryTypes', 'GET', null, false);
    
    useEffect(() => {
        if (apiData && apiData.categoryTypes) {
            if (apiData.success && apiData.categoryTypes.length > 0) {    
                setCategoryTypes(apiData.categoryTypes);
            } 
        }
        if (apiError) {
            setError((apiData && apiData.message) || 'Kategoriler yüklenirken bir hata oluştu');
        }
    }, [apiData, apiError, apiLoading]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch(`${apiUrl}/categories/${id}`, {
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
                    name: data.category.name,
                    categoryTypeId: data.category.categoryTypeId
                });
                 
            } else {
                setError(data.message || 'Kategori bilgileri yüklenemedi');
            }
        } catch (error) {
            console.error('Kategori bilgileri getirme hatası:', error);
            setError(error.message || 'Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            
            const url = id
                ? `${apiUrl}/categories/${id}`
                : `${apiUrl}/categories`;
            
            const response = await fetch(url, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id? id : null,
                    name: formData.name,
                    categoryTypeId: formData.categoryTypeId
                })
            });

            const data = await response.json();

            if (data.success) {
                navigate('/categories');
            } else {
                setError(data.message || 'Kategori kaydedilirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Form gönderme hatası:', error);
            setError('Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    };
    

    if (!currentUser || currentUser.role !== 'admin') {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
    }
    
    const pathnames = [
        {
          path: 'Kategoriler',
          link: '/categories',
        },
        {
          path: (id ? 'Kategori Düzenle' : 'Yeni Kategori'),
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
                <form id="categoryForm" onSubmit={handleSubmit} className="edit-user-form">
                    <div className="page-header">
                        {/* <h1 className='headerClass'>{id ? 'Kategori Düzenle' : 'Yeni Kategori'}</h1> */}
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="categoryForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (id ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/categories')}
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
                        <label htmlFor="name">Kategori Adı</label>
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
                    {/* <div className="form-group">
                        <label htmlFor="categoryTypeId">Kategori Türü</label>
                        <select
                            id="categoryTypeId"
                            name="categoryTypeId"
                            value={formData.categoryTypeId}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Seçiniz</option>
                            <option value={1}>Projeler</option>
                            <option value={2}>Kullanıcılar</option>
                            <option value={3}>Etkinlikler</option>
                            <option value={4}>Mesafe </option>
                        </select>
                    </div> */}
                    <div className="form-group">
                        <label htmlFor="categoryTypeId">Kategori Türü</label>
                        <select
                            id="categoryTypeId"
                            name="categoryTypeId"
                            value={formData.categoryTypeId}
                            onChange={handleInputChange} 
                            required
                            style={{minWidth:150}}
                        >
                            <option value="">Seçiniz</option>
                            {
                                categoryTypes.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </form>
            </div>
            
        </div>
    );
};

export default EditCategory;
