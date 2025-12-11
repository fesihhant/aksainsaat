import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CHelmet from '../../components/htmlComponent/CHelmet';
import { useApiCall } from '../../utils/apiCalls';
import {serverUrl, substringValue} from '../../utils/utils';
import ProjectSlider from '../../components/htmlComponent/ProjectSlider';
import OptimizedImage from '../../components/htmlComponent/OptimizedImage';

const HomePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    
    const { apiData, apiError, apiLoading } = useApiCall('/projects/projectList', 'GET', null, false);   
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
        
        setLoading(apiLoading);
    }, [apiData, apiError, apiLoading]);
    
    if (loading) {
        return <div>Yükleniyor...</div>;
    }
    
    if (error) {
        return <div className="error-message">{error}</div>;
    }
    return (
        <>
            <CHelmet pageName="Projelerimiz" projectName="İnşaat projeleri, doğalgaz" categoryName="boru hattı" />
            <div className="home-container" >
                <div className="main-content" style={{paddingTop:'0'}}>
                    <ProjectSlider projects={data} navigate={navigate} />
                    <br/>
                    <br/>
                    <div className='box-header'>
                        <h3 style={{fontSize:48}}>Projeler</h3>
                    </div>
                    <div className="box-grid">
                        {data                
                            .map(p => (
                                <div key={p.id} className="box-card">
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
                        }
                    </div>
                </div> 
            </div>
        </>
    );
};

export default HomePage;
