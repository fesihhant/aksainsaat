import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import Breadcrumbs from '../public/Breadcrumbs';
import { useApiCall, apiRequest, invalidateApiCacheMany } from '../../utils/apiCalls'; 
import TextAreaComponent from '../../components/htmlComponent/TextAreaComponent';
import '../../css/EditUser.css';


const EditAbout = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({
        aboutText:'',
        visionText:'',
        missionText:''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { apiData, apiError, apiLoading } = useApiCall(
        '/abouts',
        'GET',
        null,
        true,
        { dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );

    useEffect(() => {
        if (apiData && apiData.about) {
            if (apiData.success && apiData.about.length > 0) {    
                setFormData(apiData.about[0]);
            } 
        }
        if (apiError) {
            console.error('Sayfa yüklenirken hata:', apiError);
            setError('Sunucu bağlantısı başarısız');
        }
        setLoading(apiLoading);
    }, [apiData, apiError, apiLoading]);

  
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
 
        try {
            const url = formData?._id ? `/abouts/${formData._id}` : '/abouts';
            const method = formData?._id ? 'PUT' : 'POST';

            const data = await apiRequest(method, url, {
                aboutText: formData.aboutText,
                visionText: formData.visionText,
                missionText: formData.missionText,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                address: formData.address,
                fax: formData.fax
            }, { isToken: true, retry: 1, retryDelayMs: 500 });

            if (data.success) { 
                setFormData(data.about);
                setError('');
                invalidateApiCacheMany([
                    { method: 'GET', urlPrefix: '/abouts' }
                ]);
                navigate('/about');
            } else {
                setError(data.message || 'Veri kaydedilirken bir hata oluştu');
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
    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }
    
    return (
        <div className="home-container">
            <div className="main-content">
                <Breadcrumbs />
                <form id="formPage" onSubmit={handleSubmit} className="edit-user-form">
                    <div className="page-header">
                        <div className="form-actions">
                            <button 
                                type="submit"
                                form="formPage"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Kaydediliyor...' : (formData?._id ? 'Güncelle' : 'Kaydet')}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => navigate('/')}
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
                        <label htmlFor="aboutText">Hakkımızda</label> 
                        <TextAreaComponent
                            field={{
                                name: 'aboutText',
                                placeholder: 'Açıklama giriniz...',
                                required: true
                            }}
                            value={formData.aboutText}
                            onBlur={value => setFormData((prev) => ({ ...prev, aboutText: value }))}
                        />  
                    </div>
                    <div className="form-group">
                        <label htmlFor="visionText">Vizyonumuz</label>  
                        <TextAreaComponent
                            field={{
                                name: 'visionText',
                                placeholder: 'Açıklama giriniz...',
                                required: true
                            }}
                            value={formData.visionText}
                            onBlur={value => setFormData((prev) => ({ ...prev, visionText: value }))}
                        />  
                    </div>
                    <div className="form-group">
                        <label htmlFor="missionText">Misyonumuz</label> 
                        <TextAreaComponent
                            field={{
                                name: 'missionText',
                                placeholder: 'Açıklama giriniz...',
                                required: true
                            }}
                            value={formData.missionText}
                            onBlur={value => setFormData((prev) => ({ ...prev, missionText: value }))}
                        />  
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Telefon Numarası</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            required
                            value={formData.phoneNumber || ''} 
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                    </div>                    
                    <div className="form-group">
                        <label htmlFor="fax">Fax</label>
                        <input
                            type="text"
                            id="fax"
                            name="fax"
                            value={formData.fax || ''} 
                            onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Adresi</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email || ''} 
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />  
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Adres</label> 
                        <TextAreaComponent
                            field={{
                                name: 'address',
                                placeholder: 'Açıklama giriniz...',
                                required: true
                            }}
                            value={formData.address}
                            onBlur={value => setFormData((prev) => ({ ...prev, address: value }))}
                        />  
                    </div>
                </form>
            </div>
            
        </div>
    );
};

export default EditAbout;
