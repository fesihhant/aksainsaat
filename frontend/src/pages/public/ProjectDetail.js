import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 

import Breadcrumbs from '../public/Breadcrumbs';
import CSeoHelmet from '../../components/htmlComponent/CSeoHelmet';
import CCrousel from '../../components/htmlComponent/CCrousel';
import '../../css/HomePage.css';
import '../../css/Projects.css';
import {serverUrl, getCurrencySymbol, getYoutubeEmbedUrl, apiUrl, HtmlRenderer } from '../../utils/utils';

const ProjectDetail = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    
    const [formData, setFormData] = useState({
            name: '',
            category: '',
            description: '',
            price: '',
            stockQuantity: '',
            typeofActivityId: null,
            youtubeUrl : '',

        });
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`${apiUrl}/projects/by-slug/${encodeURIComponent(slug)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.project) {
                const projectData = data.project;
                setFormData({
                    name: projectData.name || '',
                    typeofActivityId: projectData.typeofActivityId || null,
                    statusType: projectData.statusType || '',
                    description: projectData.description || '',
                    projectCost: projectData.projectCost ? projectData.projectCost.toString() : '',
                    isVisibleCost: projectData.isVisibleCost || false,
                    currencyType: projectData.currencyType || 'TRY',
                    startDate: projectData.startDate ? projectData.startDate.toString() : '',
                    endDate: projectData.endDate ? projectData.endDate.toString() : '',
                    imageUrls: projectData.imageUrls || '',
                    youtubeUrl : projectData.youtubeUrl || ''
                });

                if (projectData.imageUrls && projectData.imageUrls.length > 0) {
                    setImagePreviews(projectData.imageUrls.map(url => `${serverUrl}${url}`));
                }
            } else {
                setError(data.message || 'Proje bilgileri yüklenemedi');
            }
        } catch (error) {
            console.error('Proje bilgileri getirme hatası:', error);
            setError(error.message || 'Sunucu bağlantısı başarısız');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        if (slug) {
            fetchData();
        } else {
            setFormData({
                name: '',
                typeofActivityId: null,
                statusType: '',
                description: '',
                projectCost: '',
                startDate: '',
                endDate: '',
                imageUrls: [],
                youtubeUrl : ''
            });
            setImagePreviews([]);
        }
    }, [slug, fetchData]);
    
    
    // Loading durumunda göster
    if (loading && !formData.name && slug) {
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

    if (error && !formData.name && slug) {
        return (
            <div className="home-container">
                <div className="main-content">
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div className="error-message">{error}</div>
                        <button onClick={() => navigate('/project-list')} style={{ marginTop: '1rem' }}>
                            Proje Listesine Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const categoryName = formData.typeofActivityId?.name || '';  

    return (
        <>
            <CSeoHelmet
                pageName={formData.name}
                content={formData.description || 'İnşaat projeleri'}
                categoryName={categoryName}
                canonicalUrl={`/project-detail/${encodeURIComponent(formData.name)}`}
                ogImage={formData.imageUrls?.[0] ? `${formData.imageUrls[0]}` : null}
            />
            <div className="home-container">
                <div className="main-content">
                    <Breadcrumbs />
                    <div className="page-header">
                    </div>                   
                    <hr></hr>
                    <br></br>
                    <div className="features-section">
                        <div>
                            <div className="row">
                                <div className="col-12"> 
                                    <div className="form-group">
                                        <label htmlFor="name">Proje Adı</label>
                                        <label className='justifyLabel' id="name" name="name"> {formData.name}</label>
                                    </div>
                                </div>
                            </div>
                            {formData.typeofActivityId && formData.typeofActivityId.name &&
                            <div className="row">
                                
                                <div className="col-12"> 
                                    <div className="form-group">
                                        <label htmlFor="name">Faaliyet Alanı</label>
                                        <label className='justifyLabel' id="name" name="name"> {formData.typeofActivityId?.name}</label>
                                    </div>
                                </div>
                            </div>}
                            <div className="row">
                                {formData.isVisibleCost && (
                                <div className="col-6">
                                    <div className="form-group">
                                        <label htmlFor="projectCost">Maliyeti</label>
                                        <label className='justifyLabel' id="projectCost"name="projectCost">{formData.projectCost} {getCurrencySymbol(formData.currencyType)}</label>
                                    </div>
                                </div>
                                )}
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <div className="form-group">
                                        <label htmlFor="startDate">Başlama Tarihi</label>
                                        <label className='justifyLabel' id="startDate" name="startDate">{new Date(formData.startDate).toLocaleDateString()}</label>
                                    </div>
                                </div>
                                <div className="col-6">
                                    {formData.statusType === 'false' && formData.endDate && (
                                        <div className="form-group">
                                            <label htmlFor="endDate">Bitiş Tarihi</label>
                                            <label className='justifyLabel' id="endDate" name="endDate">{new Date(formData.endDate).toLocaleDateString()}</label>
                                        </div>
                                    )}                                 
                                </div>
                            </div>                          
                            <div className="row">
                                <div className="col-12">
                                    <div className="form-group">
                                        <label htmlFor="description">Açıklama</label>
                                        <div id="description" name="description">
                                            <HtmlRenderer html={formData.description} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">                              
                                <div className="col-12">
                                    <div className="form-group">
                                        <div className="avatar-options">
                                            <div className="upload-section">    
                                                {imagePreviews && imagePreviews.length > 0 && (
                                                    <CCrousel imageList={imagePreviews} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                                                         
                            <div className="row">
                                <div className="col-12">
                                    <div className="form-group"> 
                                        <div className="avatar-options">
                                            {formData.youtubeUrl && formData.youtubeUrl.trim() !== '' && (
                                                <div className="video-container">
                                                    <iframe
                                                        width="100%"
                                                        height="800"
                                                        src={getYoutubeEmbedUrl(formData.youtubeUrl)}
                                                        title="Project Video" 
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>  
                        </div> 
                    </div>
                </div>
                
            </div>
        </>
    );
};

export default ProjectDetail;
