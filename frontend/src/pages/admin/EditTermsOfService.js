import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../public/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import '../../css/EditUser.css';
import { apiUrl } from '../../utils/utils';
import { apiRequest, invalidateApiCacheMany } from '../../utils/apiCalls'; 
import TextAreaComponent from '../../components/htmlComponent/TextAreaComponent';
import Loading from '../../components/htmlComponent/Loading';

const EditTermsOfService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
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
            const response = await fetch(`${apiUrl}/termsOfServices/${id}`, {
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
                    title: data.termsOfService.title,
                    content: data.termsOfService.content
                });
                 
            } else {
                setError(data.message || 'TermsOfService bilgileri yüklenemedi');
            }
        } catch (error) {
            console.error('TermsOfService bilgileri getirme hatası:', error);
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

            const formDataToSend = new FormData();
            if (id) {
                formDataToSend.append('id', id);
            } 
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', formData.content);

            const url = id
                ? `/termsOfServices/${id}`
                : '/termsOfServices';
            const method = id ? 'PUT' : 'POST';

            const data = await apiRequest(method, url, {
                title: formData.title,
                content: formData.content
            }, {
                isToken: true,
                retry: 1,
                retryDelayMs: 500,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (data.success) {
                invalidateApiCacheMany([
                    { method: 'GET', urlPrefix: '/termsOfServices' }
                ]);
                navigate('/termsofservices');
            } else {
                setError(data.message || 'TermsOfService kaydedilirken bir hata oluştu');
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

    // Loading durumunda göster
    if (loading && !formData.title && id) {
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
                <Breadcrumbs breadcrumbs={null} />
                <form id="termsOfServiceForm" onSubmit={handleSubmit} className="edit-user-form">
                    <div className="page-header">
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="termsOfServiceForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (id ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/termsofservices')}
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
                        <label htmlFor="title">Title</label>
                        <input
                            className='varible-input'
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="content">Content</label> 
                        <TextAreaComponent
                            field={{
                                name: 'content',
                                placeholder: 'Açıklama giriniz...',
                                required: true
                            }}
                            value={formData.content}
                            onBlur={value => setFormData((prev) => ({ ...prev, content: value }))}
                        />  
                    </div> 
                </form>
            </div>
            
        </div>
    );
};

export default EditTermsOfService;
