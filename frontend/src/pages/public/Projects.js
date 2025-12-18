import React, { useState, useEffect } from 'react';
import { Helmet} from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import { useApiCall } from '../../utils/apiCalls';
import OptimizedImage from '../../components/htmlComponent/OptimizedImage';
import {substringValue, serverUrl} from '../../utils/utils';

const Projects = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusType, setStatusType] = useState('');
    const [data, setData] = useState([]);
    
    const { apiData, apiError, apiLoading } = useApiCall(
        '/projects/projectList',
        'GET',
        null,
        false,
        { cache: true, staleTimeMs: 5 * 60 * 1000, cacheStorage: 'both', dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );   
    useEffect(() => {
        if (apiData) { 
            if (apiData.success) {
                setData(apiData.projects);
            } else {
                setError('Projeler yüklenirken bir hata oluştu');
            }
        }
        if (apiError) {
            console.error('Projeler yüklenirken hata:', apiError);
            setError('Sunucu bağlantısı başarısız');
        }
        setLoading(apiLoading);
    }, [apiData, apiError, apiLoading]);
    
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    }; 
    const pathnames = [
    {
        path: 'Projeler',
        link: '',
    }];

    return (
        <>
            <Helmet>
                <title>Projeler | Aksa İnşaat</title>
                <meta name="description" content="Aksa inşaat tarafından geliştirilen tüm projeleri burada bulabilirsiniz." />
                <meta name="keywords" content="projeler, inşaat, doğalgaz, faaliyetler, Ankara, İzmir,İstanbul, Bingöl, Kocaeli, iller, belediye, bakanlık" />
                <meta property="og:title" content="Projelerimiz" />
                <meta property="og:description" content="Aksa inşaat'ın geliştirdiği projeler hakkında detaylı bilgi alın." />
            </Helmet>
        
            <div className="home-container">
                <div className="main-content">
                    <Breadcrumbs breadcrumbs={pathnames} />
                    {loading && <div>Yükleniyor...</div>}
                    {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem', padding: '0.5rem'}}>{error}</div>}
                    <div className="page-header">
                        {/* <h1 className='headerClass'><i class="fa-solid fa-list-check"></i> Projeler</h1> */}
                        <div className="header-actions">                         
                            <div className="search-box">
                                <select
                                    id='statusType'
                                    name="statusType"
                                    onChange={e => setStatusType(e.target.value)}
                                >
                                    <option select value="">Tümü</option>
                                    <option value="true">Devam Eden</option>
                                    <option value="false">Biten</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Ara..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="search-input"
                                />
                            </div> 
                        </div>
                    </div>
                    <hr></hr>
                    <br></br>
                    <div className="projects-grid">
                        {data
                            .filter(x =>
                                (x.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                x.description.toLowerCase().includes(searchTerm.toLowerCase()))
                                &&
                                (statusType === '' || x.statusType === statusType)
                            )                    
                            .map(p => (
                                <div key={p.id} className="project-card">
                                    <div className="project-image">
                                        <OptimizedImage
                                            src={p.imageUrls && p.imageUrls.length > 0 
                                                ? `${serverUrl}${p.imageUrls[0].startsWith('/') ? p.imageUrls[0] : '/' + p.imageUrls[0]}` 
                                                : `${serverUrl}/uploads/projects/default.png`}
                                            alt={p.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="project-content">
                                        <h3>{substringValue(p.name,150)}</h3>
                                        {p.isVisibleCost && <p className="project-cost">{p.projectCost}</p>}
                                        <p>{substringValue(p.description,150)}</p>
                                        <button 
                                            className="project-details-btn"
                                            onClick={() => navigate(`/project-detail/${encodeURIComponent(p.name)}`)}
                                        >
                                            Detayları Gör
                                        </button>
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

export default Projects;
