import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../public/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import '../../css/EditUser.css';
import { apiUrl } from '../../utils/utils';
import { apiRequest, invalidateApiCacheMany } from '../../utils/apiCalls';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { editorModules, editorFormats } from '../../utils/utils';
 

const EditPrivacyPolicy = () => {
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
            const response = await fetch(`${apiUrl}/privacyPolicies/${id}`, {
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
                    title: data.privacyPolicy.title,
                    content: data.privacyPolicy.content
                });
                 
            } else {
                setError(data.message || 'PrivacyPolicy bilgileri yüklenemedi');
            }
        } catch (error) {
            console.error('PrivacyPolicy bilgileri getirme hatası:', error);
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
                ? `/privacyPolicies/${id}`
                : '/privacyPolicies';
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
                    { method: 'GET', urlPrefix: '/privacyPolicies' }
                ]);
                navigate('/privacypolicies');
            } else {
                setError(data.message || 'PrivacyPolicy kaydedilirken bir hata oluştu');
            }
        } catch (error) {
            console.error('PrivacyPolicy Form gönderme hatası:', error);
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
                        <div>Yükleniyor...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs breadcrumbs={null} />
                <form id="privacyPolicyForm" onSubmit={handleSubmit} className="edit-user-form">
                    <div className="page-header">
                        {/* <h1 className='headerClass'>{id ? 'Kategori Düzenle' : 'Yeni Kategori'}</h1> */}
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="privacyPolicyForm"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (id ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/privacypolicies')}
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
                        <ReactQuill
                            theme="snow"                            
                            style={{minHeight:'300px'}}
                            value={formData.content}
                            onChange={value => setFormData((prev) => ({ ...prev, content: value }))}   
                            placeholder="Açıklama giriniz..."
                            modules={editorModules()}
                            formats={editorFormats()}
                        /> 
                    </div> 
                </form>
            </div>
            
        </div>
    );
};

export default EditPrivacyPolicy;
