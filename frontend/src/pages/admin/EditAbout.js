import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Breadcrumbs from '../public/Breadcrumbs';
import '../../css/EditUser.css';
import { useApiCall } from '../../utils/apiCalls';
import {apiUrl, editorModules, editorFormats} from '../../utils/utils';


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
    
    const { apiData, apiError, apiLoading } = useApiCall('/abouts', 'GET', null, true);

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

        // if (typeof validate === "function" && !validate()) {
        //     setLoading(false);
        //     return;
        // }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const url = formData?._id ? '/abouts/' + formData._id : '/abouts';
            const apiCallUrl = apiUrl + url;
            
            const response = await fetch(apiCallUrl, {
                method: formData?._id ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    aboutText: formData.aboutText,
                    visionText: formData.visionText,
                    missionText: formData.missionText,
                    phoneNumber: formData.phoneNumber,
                    email: formData.email,
                    address: formData.address,
                    fax: formData.fax
                })
            });

            const data = await response.json();

            if (data.success) { 
                setFormData(data.about);
                setError('');
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
                        <ReactQuill
                            name={'aboutText'}
                            theme="snow"
                            required
                            className='react-quill-custom'
                            modules={editorModules()}
                            formats={editorFormats()}
                            value={formData.aboutText} 
                            onChange={(e) => setFormData({ ...formData, aboutText: e })}  
                        /> 
                    </div>
                    <div className="form-group">
                        <label htmlFor="visionText">Vizyonumuz</label>                        
                        <ReactQuill
                            name={'visionText'}
                            theme="snow"
                            required
                            className='react-quill-custom'
                            modules={editorModules()}
                            formats={editorFormats()}
                            value={formData.visionText} 
                            onChange={(e) => setFormData({ ...formData, visionText: e })}  
                        /> 
                    </div>
                    <div className="form-group">
                        <label htmlFor="missionText">Misyonumuz</label>
                        <ReactQuill
                            name={'missionText'}
                            theme="snow"
                            required
                            className='react-quill-custom'
                            modules={editorModules()}
                            formats={editorFormats()}
                            value={formData.missionText} 
                            onChange={(e) => setFormData({ ...formData, missionText: e})}  
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
                        {/* <textarea
                            id="address"
                            name="address"
                            required
                            value={formData.address} 
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        /> */}
                        <ReactQuill
                            name={'address'}
                            theme="snow"
                            required
                            className='react-quill-custom'
                            modules={editorModules()}
                            formats={editorFormats()}
                            value={formData.address} 
                            onChange={(e) => setFormData({ ...formData, address: e })}  
                        /> 
                    </div>
                </form>
            </div>
            
        </div>
    );
};

export default EditAbout;
