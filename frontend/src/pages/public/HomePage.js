import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CHelmet from '../../components/htmlComponent/CHelmet';
import { useApiCall } from '../../utils/apiCalls';
import {serverUrl, substringValue} from '../../utils/utils';
import ProjectSlider from '../../components/htmlComponent/ProjectSlider';
import OptimizedImage from '../../components/htmlComponent/OptimizedImage';

const HomePage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    
    const { apiData, apiError, apiLoading, refetch } = useApiCall(
        '/projects/projectList',
        'GET',
        null,
        false,
        { cache: true, staleTimeMs: 5 * 60 * 1000, cacheStorage: 'both', dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );
    useEffect(() => {
        setError('');
        try {
            if (apiData) { 
                if (apiData.success) {
                    setData(apiData.projects);                
                } else {
                    setError('Projeler yüklenirken bir hata oluştu');
                }
            }
            if (apiError) {
                setError(apiError.message || 'Projeler yüklenirken bir hata oluştu');
            }
        } catch (err) {
            setError('Projeler yüklenirken bir hata oluştu');
        }
    }, [apiData, apiError, apiLoading]);
    return (
        <>
            <CHelmet pageName="Projelerimiz" projectName="İnşaat projeleri, doğalgaz" categoryName="boru hattı" />
            <div className="home-container" >
                <div className="main-content" style={{paddingTop:'0'}}>
                    {/* Slider bloklamasın: veri gelene kadar skeleton */}
                    {apiLoading && data.length === 0 ? (
                        <div style={{ width: '100%', height: '60vw', maxHeight: 700, borderRadius: 0 }} className="skeleton" />
                    ) : (
                        <ProjectSlider projects={data} navigate={navigate} />
                    )}
                    <br/>
                    <br/>
                    <div className='box-header'>
                        <h3 style={{fontSize:48}}>Projeler</h3>
                    </div>

                    {error && (
                        <div className="error-message" style={{ margin: '0 20px' }}>
                            {error}
                            <button className="submit-button" style={{ marginLeft: 12 }} onClick={refetch}>
                                Yeniden Dene
                            </button>
                        </div>
                    )}

                    <div className="box-grid">
                        {apiLoading && data.length === 0 ? (
                            Array.from({ length: 6 }).map((_, idx) => (
                                <div key={`sk-${idx}`} className="box-card">
                                    <div className="box-card-image skeleton" />
                                </div>
                            ))
                        ) : (
                            data.map(p => (
                                <div key={p._id || p.id} className="box-card">
                                    <div className="box-card-image">
                                        <OptimizedImage
                                            src={p.imageUrls && p.imageUrls.length > 0 
                                                ? `${serverUrl}${p.imageUrls[0]}` 
                                                : `${serverUrl}/uploads/projects/default.png`}
                                            alt={p.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="box-cart-content" onClick={() => navigate(`/project-detail/${p._id}`)}>
                                        <div className="title">
                                            {substringValue(p.name, 100)}
                                            <br />
                                        </div>
                                        <div className='status'>
                                            {p.statusType === 'true' ? <span className="ongoing">Proje Devam Ediyor</span> : <span className="completed">Proje Tamamlandı</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div> 
            </div>
        </>
    );
};

export default HomePage;
